import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/backend/db/client';
import { getCtx, unauthorized, forbidden, canEdit } from '@/backend/auth/session';
import { applyAction, buildInsights, healthScore, loadCampaignRows, runRules, writeCopy, TARGET_CPA } from '@/backend/services/intelligenceService';
import { crawlWebsite } from '@/backend/services/crawler';
import { PlatformId } from '@/shared/adspec';

/** GET → health score, insights, platform comparison, rules and saved business profile. */
export async function overview() {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  const [rows, conns, rules, profile] = await Promise.all([
    loadCampaignRows(ctx.workspaceId),
    db.integrationToken.findMany({ where: { workspaceId: ctx.workspaceId, status: 'CONNECTED' }, select: { platform: true } }),
    db.automationRule.findMany({ where: { workspaceId: ctx.workspaceId }, orderBy: { createdAt: 'desc' } }),
    db.businessProfile.findUnique({ where: { workspaceId: ctx.workspaceId } }),
  ]);
  const insights = buildInsights(rows, conns.map((c: any) => c.platform));

  const plat = new Map<string, { spend: number; won: number; roasSum: number; n: number }>();
  rows.forEach((c) => {
    const p = plat.get(c.platform) || { spend: 0, won: 0, roasSum: 0, n: 0 };
    p.spend += c.totalSpend; p.won += c.customersWon; p.roasSum += c.roas; p.n++;
    plat.set(c.platform, p);
  });
  const platforms = Array.from(plat.entries()).map(([platform, v]) => ({ platform, spend: Math.round(v.spend), customers: v.won, cpa: v.won ? Math.round((v.spend / v.won) * 100) / 100 : null, roas: v.n ? Math.round((v.roasSum / v.n) * 10) / 10 : 0 }));

  return NextResponse.json({ demo: rows.every((r) => r.demo), score: healthScore(rows), targetCpa: TARGET_CPA, insights, platforms, rules, profile, canEdit: canEdit(ctx), aiCopy: !!process.env.ANTHROPIC_API_KEY });
}

/** POST { campaignId, type } → apply an insight's one-click action. */
export async function apply(req: NextRequest) {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  if (!canEdit(ctx)) return forbidden();
  const { campaignId, type } = await req.json();
  if (!['PAUSE', 'SCALE_UP', 'SCALE_DOWN'].includes(type)) return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  return NextResponse.json(await applyAction(ctx.workspaceId, String(campaignId), type));
}

/** Rules: GET list, POST create/update/toggle, DELETE, and { run: true } to run them now. */
export async function rules(req: NextRequest) {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  if (req.method === 'GET') return NextResponse.json({ rules: await db.automationRule.findMany({ where: { workspaceId: ctx.workspaceId }, orderBy: { createdAt: 'desc' } }) });
  if (!canEdit(ctx)) return forbidden();

  if (req.method === 'DELETE') {
    await db.automationRule.deleteMany({ where: { id: req.nextUrl.searchParams.get('id') || '', workspaceId: ctx.workspaceId } });
    return NextResponse.json({ success: true });
  }

  const b = await req.json();
  if (b.run) return NextResponse.json({ success: true, log: await runRules(ctx.workspaceId) });
  if (b.id && typeof b.enabled === 'boolean') {
    await db.automationRule.updateMany({ where: { id: b.id, workspaceId: ctx.workspaceId }, data: { enabled: b.enabled } });
    return NextResponse.json({ success: true });
  }
  if (!['CPA', 'ROAS', 'SPEND'].includes(b.metric) || !['GT', 'LT'].includes(b.operator) || !['PAUSE', 'SCALE_UP', 'SCALE_DOWN'].includes(b.action) || !(Number(b.value) >= 0))
    return NextResponse.json({ error: 'Please complete the rule.' }, { status: 400 });
  const rule = await db.automationRule.create({
    data: { workspaceId: ctx.workspaceId, name: String(b.name || 'My rule').slice(0, 80), platform: b.platform || 'ALL', metric: b.metric, operator: b.operator, value: Number(b.value), minSpend: Number(b.minSpend) || 0, action: b.action },
  });
  return NextResponse.json({ success: true, rule });
}

/** POST { product, audience, tone, platform } → 3 ad copy variants. */
export async function copy(req: NextRequest) {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  const b = await req.json();
  if (!String(b.product || '').trim()) return NextResponse.json({ error: 'Describe what you are selling.' }, { status: 400 });
  return NextResponse.json(await writeCopy({ product: String(b.product).slice(0, 300), audience: String(b.audience || '').slice(0, 200), tone: String(b.tone || 'friendly').slice(0, 40), platform: (b.platform || 'META') as PlatformId }));
}

/** POST { url } → scan the website and save the business profile used for recommendations. */
export async function profileScan(req: NextRequest) {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  const { url } = await req.json();
  try {
    const d = await crawlWebsite(String(url || ''));
    const saved = await db.businessProfile.upsert({
      where: { workspaceId: ctx.workspaceId },
      create: { workspaceId: ctx.workspaceId, websiteUrl: d.url, offerings: d.offerings, priceTier: d.priceTier, targetAudience: d.targetAudience, reachType: d.reachType },
      update: { websiteUrl: d.url, offerings: d.offerings, priceTier: d.priceTier, targetAudience: d.targetAudience, reachType: d.reachType, scrapedAt: new Date() },
    });
    return NextResponse.json({ success: true, profile: saved, keywords: d.detectedKeywords, healthScore: d.healthScore });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Could not read that website.' }, { status: 400 });
  }
}
