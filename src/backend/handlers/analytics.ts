import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/backend/db/client';
import { getCtx, unauthorized } from '@/backend/auth/session';
import { daysAgo, isoDay } from '@/backend/services/sync/types';

type Agg = { spend: number; impressions: number; reach: number; clicks: number; conversions: number; conversionValue: number; engagements: number };
const zero = (): Agg => ({ spend: 0, impressions: 0, reach: 0, clicks: 0, conversions: 0, conversionValue: 0, engagements: 0 });
const add = (a: Agg, r: any) => {
  a.spend += r.spend; a.impressions += r.impressions; a.reach += r.reach; a.clicks += r.clicks;
  a.conversions += r.conversions; a.conversionValue += r.conversionValue; a.engagements += r.engagements;
};
const derive = (a: Agg) => ({
  ...a,
  roas: a.spend > 0 && a.conversionValue > 0 ? a.conversionValue / a.spend : 0,
  cpa: a.conversions > 0 ? a.spend / a.conversions : 0,
  ctr: a.impressions > 0 ? (a.clicks / a.impressions) * 100 : 0,
});

/** GET ?days=7|30&platform=ALL|META|… → everything the screens need, straight from synced real data. */
export async function GET(req: NextRequest) {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();

  const days = req.nextUrl.searchParams.get('days') === '30' ? 30 : 7;
  const platform = (req.nextUrl.searchParams.get('platform') || 'ALL').toUpperCase();
  const today = new Date(isoDay(new Date()) + 'T00:00:00Z');
  const curStart = new Date(isoDay(daysAgo(days - 1)) + 'T00:00:00Z');
  const prevStart = new Date(isoDay(daysAgo(days * 2 - 1)) + 'T00:00:00Z');

  const [rows, conns, stats, breakdownRows, campaigns] = await Promise.all([
    db.dailyMetric.findMany({ where: { workspaceId: ctx.workspaceId, date: { gte: prevStart }, ...(platform !== 'ALL' && { platform }) } }),
    db.integrationToken.findMany({ where: { workspaceId: ctx.workspaceId }, select: { platform: true, status: true, lastSyncedAt: true, meta: true } }),
    db.accountStat.findMany({ where: { workspaceId: ctx.workspaceId }, orderBy: { date: 'desc' }, take: 40 }),
    platform === 'ALL' ? Promise.resolve([]) : db.breakdownMetric.findMany({ where: { workspaceId: ctx.workspaceId, platform: platform === 'YOUTUBE' ? 'GOOGLE' : platform } }),
    db.campaign.findMany({ where: { workspaceId: ctx.workspaceId }, select: { id: true, externalCampaignId: true, platform: true } }),
  ]);

  const cur = zero(), prev = zero();
  const byPlatform = new Map<string, Agg>();
  const byDay = new Map<string, Agg>();
  const byCampaign = new Map<string, Agg & { name: string; platform: string }>();

  for (const r of rows) {
    if (r.date >= curStart) {
      add(cur, r);
      const p = byPlatform.get(r.platform) || zero(); add(p, r); byPlatform.set(r.platform, p);
      const k = isoDay(r.date); const d = byDay.get(k) || zero(); add(d, r); byDay.set(k, d);
      const ck = `${r.platform}:${r.externalCampaignId}`;
      const c = byCampaign.get(ck) || { ...zero(), name: r.campaignName || r.externalCampaignId, platform: r.platform };
      add(c, r); byCampaign.set(ck, c);
    } else add(prev, r);
  }

  const series = Array.from({ length: days }, (_, i) => {
    const d = new Date(today.getTime() - (days - 1 - i) * 864e5);
    const k = isoDay(d);
    const v = byDay.get(k) || zero();
    return { date: k, label: days === 7 ? d.toLocaleDateString('en', { weekday: 'short', timeZone: 'UTC' }) : k.slice(5), spend: v.spend, impressions: v.impressions, reach: v.reach, clicks: v.clicks, conversions: v.conversions };
  });

  // Day-of-week pattern from real daily numbers
  const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((name) => ({ key: name, spend: 0, impressions: 0, clicks: 0, conversions: 0 }));
  for (const r of rows) if (r.date >= curStart || days === 7) { const x = dow[r.date.getUTCDay()]; x.spend += r.spend; x.impressions += r.impressions; x.clicks += r.clicks; x.conversions += r.conversions; }

  const idByExternal = new Map(campaigns.map((c: any) => [`${c.platform}:${c.externalCampaignId}`, c.id]));
  const topCampaigns = Array.from(byCampaign.entries())
    .map(([k, v]) => ({ id: idByExternal.get(k) || null, name: v.name, platform: v.platform, ...derive(v) }))
    .sort((a, b) => b.conversions - a.conversions || b.spend - a.spend)
    .slice(0, 6);

  const breakdowns: Record<string, { key: string; spend: number; impressions: number; clicks: number; conversions: number; share: number }[]> = {};
  for (const b of breakdownRows) {
    (breakdowns[b.dimension] ||= []).push({ key: b.key, spend: b.spend, impressions: b.impressions, clicks: b.clicks, conversions: b.conversions, share: 0 });
  }
  for (const dim of Object.keys(breakdowns)) {
    const total = breakdowns[dim].reduce((a, b) => a + (b.conversions || b.clicks || b.impressions), 0) || 1;
    breakdowns[dim].forEach((b) => (b.share = ((b.conversions || b.clicks || b.impressions) / total) * 100));
    breakdowns[dim].sort((a, b) => b.share - a.share);
  }
  if (platform !== 'ALL') breakdowns['Day of week'] = dow.map((d) => ({ ...d, share: 0 })).map((d, _, all) => { const t = all.reduce((a, x) => a + (x.conversions || x.clicks || x.impressions), 0) || 1; return { ...d, share: ((d.conversions || d.clicks || d.impressions) / t) * 100 }; });

  const seen = new Set<string>();
  const followers = stats.filter((s: any) => (seen.has(s.platform + s.label) ? false : (seen.add(s.platform + s.label), true))).map((s: any) => ({ platform: s.platform, label: s.label, followers: s.followers }));

  const lastSyncedAt = conns.map((c: any) => c.lastSyncedAt).filter(Boolean).sort().pop() || null;
  const connected = conns.filter((c: any) => c.status === 'CONNECTED').flatMap((c: any) => (c.platform === 'GOOGLE' ? ['GOOGLE', 'YOUTUBE'] : [c.platform]));
  const syncErrors = conns.map((c: any) => ({ platform: c.platform, error: c.meta?.sync && c.meta.sync.ok === false ? c.meta.sync.error : null })).filter((x: any) => x.error);

  return NextResponse.json({
    days,
    connected,
    hasData: rows.length > 0,
    lastSyncedAt,
    stale: connected.length > 0 && (!lastSyncedAt || Date.now() - new Date(lastSyncedAt).getTime() > 30 * 60_000),
    syncErrors,
    totals: derive(cur),
    previous: derive(prev),
    byPlatform: Array.from(byPlatform.entries()).map(([p, v]) => ({ platform: p, ...derive(v) })),
    series,
    topCampaigns,
    breakdowns,
    followers,
  });
}
