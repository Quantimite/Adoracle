// src/backend/services/intelligenceService.ts
// The "AI" brain: turns campaign numbers into plain-language insights and safe one-click actions,
// runs automation rules, and writes ad copy (with Claude when ANTHROPIC_API_KEY is set, templates otherwise).
import { db } from '@/backend/db/client';
import { initialCampaigns } from '@/shared/demoData';
import { SPECS, PlatformId } from '@/shared/adspec';
import { syncCampaignStatus } from '@/backend/services/adManagement';

export interface Insight {
  id: string;
  severity: 'critical' | 'warning' | 'opportunity' | 'info';
  platform: string;
  campaignId: string | null;
  campaignName: string | null;
  title: string;
  detail: string;
  action: null | { type: 'PAUSE' | 'SCALE_UP' | 'SCALE_DOWN'; label: string };
  demo: boolean;
}

export interface CampaignRow {
  id: string;
  platform: string;
  name: string;
  status: string;
  dailyBudget: number;
  totalSpend: number;
  customersWon: number;
  costPerCustomer: number;
  roas: number;
  demo: boolean;
}

export const TARGET_CPA = 30;

export async function loadCampaignRows(workspaceId: string): Promise<CampaignRow[]> {
  const rows = await db.campaign.findMany({ where: { workspaceId }, orderBy: { createdAt: 'desc' } });
  const real: CampaignRow[] = rows.map((c: any) => ({ id: c.id, platform: c.platform, name: c.name, status: c.status, dailyBudget: c.dailyBudget, totalSpend: c.totalSpend, customersWon: c.customersWon, costPerCustomer: c.costPerCustomer, roas: c.roas || 0, demo: false }));
  if (real.length) return real;
  return initialCampaigns.map((c) => ({ id: c.id, platform: c.platform, name: c.name, status: c.status, dailyBudget: c.dailyBudget, totalSpend: c.totalSpend, customersWon: c.customersWon, costPerCustomer: c.costPerCustomer, roas: c.roas || 0, demo: true }));
}

export function buildInsights(rows: CampaignRow[], connectedPlatforms: string[]): Insight[] {
  const out: Insight[] = [];
  const mk = (i: Omit<Insight, 'id'>) => out.push({ ...i, id: `${i.campaignId || 'ws'}:${i.title}`.slice(0, 120) });

  for (const c of rows) {
    const base = { platform: c.platform, campaignId: c.id, campaignName: c.name, demo: c.demo };
    if (c.status === 'ACTIVE' || c.status === 'LEARNING') {
      if (c.totalSpend >= 50 && c.customersWon === 0)
        mk({ ...base, severity: 'critical', title: 'Spending with no results', detail: `$${c.totalSpend.toFixed(0)} spent and no customers yet. Pause it and check the ad, the audience and the landing page.`, action: { type: 'PAUSE', label: 'Pause campaign' } });
      else if (c.costPerCustomer > TARGET_CPA * 1.3 && c.customersWon >= 3)
        mk({ ...base, severity: 'warning', title: 'Cost per customer is above target', detail: `Each customer costs $${c.costPerCustomer.toFixed(2)} against your $${TARGET_CPA} target. Lowering the budget 20% limits losses while you test new creative.`, action: { type: 'SCALE_DOWN', label: 'Lower budget 20%' } });
      if (c.roas > 0 && c.roas < 1.5 && c.totalSpend >= 50)
        mk({ ...base, severity: 'warning', title: 'Return on ad spend is low', detail: `ROAS is ${c.roas.toFixed(1)}×. Under 2× usually loses money after costs.`, action: { type: 'SCALE_DOWN', label: 'Lower budget 20%' } });
      if (c.roas >= 4 && c.customersWon >= 5)
        mk({ ...base, severity: 'opportunity', title: 'Winner: room to scale', detail: `ROAS ${c.roas.toFixed(1)}× with $${c.costPerCustomer.toFixed(2)} per customer. Raise the budget gradually (20%) so the platform keeps learning.`, action: { type: 'SCALE_UP', label: 'Raise budget 20%' } });
    }
    if (c.status === 'PAUSED' && c.totalSpend === 0 && !c.demo)
      mk({ ...base, severity: 'info', title: 'Campaign is created but not running', detail: 'It is paused with no spend yet. Review the ads and press Resume when you are ready.', action: null });
    if (c.status === 'ERROR')
      mk({ ...base, severity: 'critical', title: 'Campaign has an error', detail: 'The platform reports a problem (often a broken link or a rejected ad). Open it to review.', action: null });
  }

  // Platform comparison
  const byPlatform = new Map<string, { spend: number; won: number }>();
  rows.forEach((c) => {
    const p = byPlatform.get(c.platform) || { spend: 0, won: 0 };
    p.spend += c.totalSpend;
    p.won += c.customersWon;
    byPlatform.set(c.platform, p);
  });
  const ranked = Array.from(byPlatform.entries()).filter(([, v]) => v.won > 0).map(([k, v]) => ({ k, cpa: v.spend / v.won })).sort((a, b) => a.cpa - b.cpa);
  if (ranked.length >= 2 && ranked[ranked.length - 1].cpa > ranked[0].cpa * 1.5) {
    const best = ranked[0], worst = ranked[ranked.length - 1];
    mk({ platform: best.k, campaignId: null, campaignName: null, demo: rows.every((r) => r.demo), severity: 'opportunity', title: `${SPECS[best.k as PlatformId]?.short || best.k} is your cheapest source of customers`, detail: `$${best.cpa.toFixed(0)} per customer, versus $${worst.cpa.toFixed(0)} on ${SPECS[worst.k as PlatformId]?.short || worst.k}. Consider moving some budget over.`, action: null });
  }

  // Setup health
  if (!connectedPlatforms.length)
    mk({ platform: 'ALL', campaignId: null, campaignName: null, demo: false, severity: 'info', title: 'Connect an ad account to get live insights', detail: 'These insights use sample data until you connect Meta, Google, TikTok or LinkedIn in Settings.', action: null });

  const order = { critical: 0, warning: 1, opportunity: 2, info: 3 } as const;
  return out.sort((a, b) => order[a.severity] - order[b.severity]);
}

export function healthScore(rows: CampaignRow[]) {
  const live = rows.filter((r) => r.status === 'ACTIVE' || r.status === 'LEARNING');
  if (!live.length) return 70;
  let s = 100;
  for (const c of live) {
    if (c.totalSpend >= 50 && c.customersWon === 0) s -= 18;
    if (c.costPerCustomer > TARGET_CPA * 1.3 && c.customersWon >= 3) s -= 8;
    if (c.roas > 0 && c.roas < 1.5) s -= 8;
    if (c.roas >= 4) s += 3;
  }
  return Math.max(10, Math.min(100, s));
}

/** Applies a one-click action to a real (saved) campaign. Demo campaigns are not changed. */
export async function applyAction(workspaceId: string, campaignId: string, type: 'PAUSE' | 'SCALE_UP' | 'SCALE_DOWN') {
  const c = await db.campaign.findFirst({ where: { id: campaignId, workspaceId } });
  if (!c) return { ok: false, message: 'This is sample data. Connect an account and create a real campaign to use one-click actions.' };
  if (type === 'PAUSE') {
    await db.campaign.update({ where: { id: c.id }, data: { status: 'PAUSED' } });
    await db.adSet.updateMany({ where: { campaignId: c.id }, data: { status: 'PAUSED' } });
    await db.ad.updateMany({ where: { campaignId: c.id }, data: { status: 'PAUSED' } });
    const note = await syncCampaignStatus(workspaceId, c, 'PAUSED');
    return { ok: true, message: `Paused. ${note}` };
  }
  const factor = type === 'SCALE_UP' ? 1.2 : 0.8;
  const next = Math.max(1, Math.round(c.dailyBudget * factor * 100) / 100);
  await db.campaign.update({ where: { id: c.id }, data: { dailyBudget: next } });
  return { ok: true, message: `Daily budget is now $${next}. (Saved here; adjust it on the platform too if the campaign is live there.)` };
}

/* ---------- Automation rules ---------- */
const METRIC = (c: CampaignRow, m: string) => (m === 'CPA' ? c.costPerCustomer : m === 'ROAS' ? c.roas : m === 'SPEND' ? c.totalSpend : 0);

export async function runRules(workspaceId: string) {
  const rules = await db.automationRule.findMany({ where: { workspaceId, enabled: true } });
  const camps = await db.campaign.findMany({ where: { workspaceId, status: { in: ['ACTIVE', 'LEARNING'] } } });
  const log: string[] = [];

  for (const r of rules) {
    let hits = 0;
    for (const c of camps) {
      if (r.platform !== 'ALL' && r.platform !== c.platform) continue;
      if (c.totalSpend < r.minSpend) continue;
      const v = METRIC({ ...(c as any), roas: c.roas || 0 } as CampaignRow, r.metric);
      const fire = r.operator === 'GT' ? v > r.value : v < r.value;
      if (!fire || (r.metric === 'CPA' && c.customersWon === 0)) continue;
      hits++;
      if (r.action === 'PAUSE') await applyAction(workspaceId, c.id, 'PAUSE');
      else if (r.action === 'SCALE_UP') await applyAction(workspaceId, c.id, 'SCALE_UP');
      else if (r.action === 'SCALE_DOWN') await applyAction(workspaceId, c.id, 'SCALE_DOWN');
      log.push(`${r.name}: ${r.action.toLowerCase().replace('_', ' ')} → ${c.name}`);
    }
    await db.automationRule.update({ where: { id: r.id }, data: { lastRunAt: new Date(), lastResult: hits ? `${hits} campaign(s) changed` : 'Nothing matched' } });
  }
  return log;
}

/* ---------- Ad copy writer ---------- */
export interface CopyVariant { headline: string; primaryText: string; cta: string }

export async function writeCopy(input: { product: string; audience: string; tone: string; platform: PlatformId }): Promise<{ variants: CopyVariant[]; usedAI: boolean }> {
  const spec = SPECS[input.platform];
  const key = process.env.ANTHROPIC_API_KEY;
  if (key) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
          max_tokens: 900,
          messages: [{ role: 'user', content: `Write 3 different ${spec.short} ad variants. Product: ${input.product}. Audience: ${input.audience}. Tone: ${input.tone}.\nLimits: headline max ${spec.limits.headline} characters, primary text max ${spec.limits.primary} characters.\nReply with ONLY a JSON array like [{"headline":"","primaryText":"","cta":""}]. CTA must be one of: ${spec.ctas.join(', ')}. No claims you cannot back up (no "guaranteed", no fake discounts).` }],
        }),
        signal: AbortSignal.timeout(25000),
      });
      const data = await res.json();
      const text: string = data?.content?.[0]?.text || '';
      const json = JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1));
      const variants = (json as CopyVariant[]).slice(0, 3).map((v) => ({ headline: String(v.headline).slice(0, spec.limits.headline), primaryText: String(v.primaryText).slice(0, spec.limits.primary), cta: spec.ctas.includes(v.cta) ? v.cta : spec.ctas[0] }));
      if (variants.length) return { variants, usedAI: true };
    } catch {
      /* fall through to templates */
    }
  }
  const p = input.product.trim() || 'your product';
  const a = input.audience.trim() || 'you';
  const cut = (s: string, n: number) => (s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…');
  return {
    usedAI: false,
    variants: [
      { headline: cut(`${p}: made for ${a}`, spec.limits.headline), primaryText: cut(`Looking for ${p}? See why ${a} are switching. Take a look today.`, spec.limits.primary), cta: spec.ctas[0] },
      { headline: cut(`Meet ${p}`, spec.limits.headline), primaryText: cut(`${p} is built for ${a}. Simple to start, easy to love.`, spec.limits.primary), cta: spec.ctas[1] || spec.ctas[0] },
      { headline: cut(`Try ${p} this week`, spec.limits.headline), primaryText: cut(`Ready when you are. ${p} for ${a}. Tap to learn more.`, spec.limits.primary), cta: spec.ctas[2] || spec.ctas[0] },
    ],
  };
}
