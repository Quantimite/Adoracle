// src/backend/services/syncService.ts
// Pulls REAL numbers from the connected ad platforms into our database so every screen shows true data.
import { db } from '@/backend/db/client';
import { getConnection } from '@/backend/integrations/tokens';
import { SyncPayload, isoDay, daysAgo } from '@/backend/services/sync/types';
import { syncMeta } from '@/backend/services/sync/meta';
import { syncTikTok } from '@/backend/services/sync/tiktok';
import { syncGoogle } from '@/backend/services/sync/google';

export interface SyncReport {
  platform: string;
  ok: boolean;
  skipped?: boolean;
  message: string;
  campaigns: number;
  days: number;
}

const COVERS: Record<string, string[]> = { META: ['META'], TIKTOK: ['TIKTOK'], GOOGLE: ['GOOGLE', 'YOUTUBE'], LINKEDIN: ['LINKEDIN'] };

async function persist(workspaceId: string, covered: string[], p: SyncPayload) {
  const since = new Date(isoDay(daysAgo(31)) + 'T00:00:00Z');

  await db.dailyMetric.deleteMany({ where: { workspaceId, platform: { in: covered }, date: { gte: since } } });
  if (p.daily.length) {
    await db.dailyMetric.createMany({
      data: p.daily.map((r) => ({
        workspaceId, platform: r.platform, externalCampaignId: r.externalCampaignId, campaignName: r.campaignName, date: new Date(r.date + 'T00:00:00Z'),
        spend: r.spend, impressions: Math.round(r.impressions), reach: Math.round(r.reach), clicks: Math.round(r.clicks),
        conversions: r.conversions, conversionValue: r.conversionValue, engagements: Math.round(r.engagements),
      })),
      skipDuplicates: true,
    });
  }

  await db.breakdownMetric.deleteMany({ where: { workspaceId, platform: { in: covered } } });
  if (p.breakdowns.length) {
    await db.breakdownMetric.createMany({ data: p.breakdowns.map((b) => ({ workspaceId, ...b, impressions: Math.round(b.impressions), clicks: Math.round(b.clicks) })), skipDuplicates: true });
  }

  const today = new Date(isoDay(new Date()) + 'T00:00:00Z');
  for (const s of p.stats) {
    await db.accountStat.upsert({
      where: { workspaceId_platform_label_date: { workspaceId, platform: s.platform, label: s.label, date: today } },
      create: { workspaceId, platform: s.platform, label: s.label, followers: s.followers, date: today },
      update: { followers: s.followers },
    });
  }

  // Campaigns: create the ones that only exist on the platform, refresh names/status, and recompute totals from real daily numbers
  const totals = await db.dailyMetric.groupBy({ by: ['externalCampaignId', 'platform'], where: { workspaceId, platform: { in: covered } }, _sum: { spend: true, conversions: true, conversionValue: true } });
  for (const c of p.campaigns) {
    const t = totals.find((x: any) => x.externalCampaignId === c.externalCampaignId && x.platform === c.platform);
    const spend = t?._sum.spend || 0;
    const conv = t?._sum.conversions || 0;
    const value = t?._sum.conversionValue || 0;
    const stats = { totalSpend: Math.round(spend * 100) / 100, customersWon: Math.round(conv), costPerCustomer: conv > 0 ? Math.round((spend / conv) * 100) / 100 : 0, roas: spend > 0 && value > 0 ? Math.round((value / spend) * 100) / 100 : 0 };
    await db.campaign.upsert({
      where: { workspaceId_platform_externalCampaignId: { workspaceId, platform: c.platform, externalCampaignId: c.externalCampaignId } },
      create: { workspaceId, platform: c.platform, externalCampaignId: c.externalCampaignId, name: c.name, status: c.status, dailyBudget: c.dailyBudget, launchStatus: 'LIVE', ...stats },
      update: { name: c.name, status: c.status, dailyBudget: c.dailyBudget, ...stats },
    });
  }
}

export async function syncWorkspace(workspaceId: string, opts: { force?: boolean } = {}): Promise<SyncReport[]> {
  const rows = await db.integrationToken.findMany({ where: { workspaceId, status: 'CONNECTED' } });
  const reports: SyncReport[] = [];

  for (const row of rows) {
    const platform = row.platform as string;
    if (!['META', 'TIKTOK', 'GOOGLE'].includes(platform)) {
      reports.push({ platform, ok: true, skipped: true, message: 'Live reporting for LinkedIn is not enabled yet.', campaigns: 0, days: 0 });
      continue;
    }
    if (!opts.force && row.lastSyncedAt && Date.now() - row.lastSyncedAt.getTime() < 45_000) {
      reports.push({ platform, ok: true, skipped: true, message: 'Synced a moment ago.', campaigns: 0, days: 0 });
      continue;
    }
    try {
      const conn = await getConnection(workspaceId, platform);
      if (!conn) throw new Error('The saved login expired. Reconnect this account.');
      const payload =
        platform === 'META' ? await syncMeta(row.accountId, conn.accessToken, conn.meta.pages || [])
        : platform === 'TIKTOK' ? await syncTikTok(row.accountId, conn.accessToken)
        : await syncGoogle(row.accountId, conn.accessToken);
      await persist(workspaceId, COVERS[platform], payload);
      const days = new Set(payload.daily.map((d) => d.date)).size;
      const note = payload.notes[0];
      await db.integrationToken.update({ where: { id: row.id }, data: { lastSyncedAt: new Date(), meta: { ...conn.meta, sync: { at: new Date().toISOString(), ok: true, notes: payload.notes } } as any } });
      reports.push({ platform, ok: true, message: `Updated ${payload.campaigns.length} campaign(s) and ${days} day(s) of results.${note ? ' ' + note : ''}`, campaigns: payload.campaigns.length, days });
    } catch (e: any) {
      await db.integrationToken.update({ where: { id: row.id }, data: { meta: { ...((row.meta as any) || {}), sync: { at: new Date().toISOString(), ok: false, error: e?.message } } as any } }).catch(() => {});
      reports.push({ platform, ok: false, message: e?.message || 'Sync failed', campaigns: 0, days: 0 });
    }
  }
  return reports;
}
