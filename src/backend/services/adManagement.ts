// src/backend/services/adManagement.ts
// Manage a published campaign after launch: edit, pause, duplicate and remove at every level (Campaign / Ad set / Ad),
// the same actions Meta Ads Manager, Google Ads and TikTok Ads Manager offer.
import { db } from '@/backend/db/client';
import { getConnection } from '@/backend/integrations/tokens';

export type Level = 'campaign' | 'adset' | 'ad';

const FIELDS: Record<Level, string[]> = {
  campaign: ['name', 'status', 'dailyBudget'],
  adset: ['name', 'status', 'budget', 'startTime', 'endTime'],
  ad: ['name', 'status', 'primaryText', 'headline', 'description', 'cta', 'destinationUrl', 'mediaUrl'],
};

export function cleanChanges(level: Level, raw: Record<string, any>): { data?: Record<string, any>; error?: string } {
  const data: Record<string, any> = {};
  for (const k of Object.keys(raw || {})) {
    if (!FIELDS[level].includes(k)) continue;
    let v = raw[k];
    if (k === 'status') {
      if (!['ACTIVE', 'PAUSED'].includes(v)) return { error: 'Status must be ACTIVE or PAUSED.' };
    } else if (k === 'dailyBudget' || k === 'budget') {
      v = Number(v);
      if (!(v > 0)) return { error: 'Budget must be greater than zero.' };
    } else if (k === 'startTime' || k === 'endTime') {
      v = v ? new Date(v) : null;
      if (v && isNaN(v.getTime())) return { error: 'Invalid date or time.' };
    } else if (k === 'destinationUrl') {
      if (!/^https?:\/\//i.test(String(v))) return { error: 'Destination URL must start with https://' };
    } else if (typeof v === 'string') {
      v = v.trim();
      if (['name', 'headline', 'primaryText'].includes(k) && !v) return { error: `${k} cannot be empty.` };
    }
    data[k] = v;
  }
  if (data.startTime && data.endTime && data.endTime <= data.startTime) return { error: 'End time must be after the start time.' };
  if (!Object.keys(data).length) return { error: 'Nothing to change.' };
  return { data };
}

/** Pause/resume on the real platform when the campaign was actually created there. Returns a human note. */
export async function syncCampaignStatus(workspaceId: string, campaign: { platform: string; externalCampaignId: string }, status: 'ACTIVE' | 'PAUSED'): Promise<string> {
  if (campaign.externalCampaignId.startsWith('draft_')) return 'Saved here (not created on the platform yet).';
  try {
    const conn = await getConnection(workspaceId, campaign.platform);
    if (!conn) return 'Saved here. Reconnect the account to update the platform.';
    if (campaign.platform === 'META') {
      const v = process.env.META_GRAPH_VERSION || 'v23.0';
      const r = await fetch(`https://graph.facebook.com/${v}/${campaign.externalCampaignId}`, {
        method: 'POST',
        body: new URLSearchParams({ status, access_token: conn.accessToken }),
        signal: AbortSignal.timeout(15000),
      });
      return r.ok ? `Updated on Meta (${status.toLowerCase()}).` : 'Saved here, but Meta did not accept the change.';
    }
    if (campaign.platform === 'TIKTOK') {
      const r = await fetch('https://business-api.tiktok.com/open_api/v1.3/campaign/status/update/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Access-Token': conn.accessToken },
        body: JSON.stringify({ advertiser_id: conn.row.accountId, campaign_ids: [campaign.externalCampaignId], operation_status: status === 'ACTIVE' ? 'ENABLE' : 'DISABLE' }),
        signal: AbortSignal.timeout(15000),
      });
      const d = await r.json().catch(() => ({}));
      return d.code === 0 ? `Updated on TikTok (${status.toLowerCase()}).` : 'Saved here, but TikTok did not accept the change.';
    }
  } catch {
    return 'Saved here, but the platform could not be reached.';
  }
  return 'Saved here.';
}

export async function loadCampaign(workspaceId: string, id: string) {
  return db.campaign.findFirst({
    where: { id, workspaceId },
    include: { adSets: { orderBy: { createdAt: 'asc' }, include: { ads: { orderBy: { createdAt: 'asc' } } } } },
  });
}

export async function duplicate(workspaceId: string, level: Level, id: string) {
  if (level === 'campaign') {
    const c = await loadCampaign(workspaceId, id);
    if (!c) return null;
    const copy = await db.campaign.create({
      data: {
        workspaceId, platform: c.platform, externalCampaignId: `draft_${crypto.randomUUID()}`, name: `${c.name} (copy)`, status: 'PAUSED',
        destinationUrl: c.destinationUrl, dailyBudget: c.dailyBudget, objective: c.objective, launchStatus: 'QUEUED',
        launchMessage: 'Duplicate saved as a draft.', structure: (c.structure as any) ?? undefined,
        adSets: { create: c.adSets.map((a: any) => ({
          name: a.name, status: 'PAUSED', budget: a.budget, budgetType: a.budgetType, startTime: a.startTime, endTime: a.endTime, audience: a.audience, placements: a.placements, bidStrategy: a.bidStrategy, optimization: a.optimization,
          ads: { create: a.ads.map((d: any) => ({ campaignId: '', name: d.name, status: 'PAUSED', format: d.format, primaryText: d.primaryText, headline: d.headline, description: d.description, cta: d.cta, destinationUrl: d.destinationUrl, mediaUrl: d.mediaUrl, mediaType: d.mediaType, sourcePostId: d.sourcePostId, sourcePostUrl: d.sourcePostUrl })) },
        })) },
      },
      include: { adSets: true },
    });
    for (const a of copy.adSets) await db.ad.updateMany({ where: { adSetId: a.id }, data: { campaignId: copy.id } });
    return copy;
  }
  if (level === 'adset') {
    const a = await db.adSet.findFirst({ where: { id, campaign: { workspaceId } }, include: { ads: true } });
    if (!a) return null;
    return db.adSet.create({
      data: {
        campaignId: a.campaignId, name: `${a.name} (copy)`, status: 'PAUSED', budget: a.budget, budgetType: a.budgetType, startTime: a.startTime, endTime: a.endTime, audience: a.audience, placements: a.placements, bidStrategy: a.bidStrategy, optimization: a.optimization,
        ads: { create: a.ads.map((d: any) => ({ campaignId: a.campaignId, name: d.name, status: 'PAUSED', format: d.format, primaryText: d.primaryText, headline: d.headline, description: d.description, cta: d.cta, destinationUrl: d.destinationUrl, mediaUrl: d.mediaUrl, mediaType: d.mediaType, sourcePostId: d.sourcePostId, sourcePostUrl: d.sourcePostUrl })) },
      },
    });
  }
  const d = await db.ad.findFirst({ where: { id, adSet: { campaign: { workspaceId } } } });
  if (!d) return null;
  return db.ad.create({
    data: { adSetId: d.adSetId, campaignId: d.campaignId, name: `${d.name} (copy)`, status: 'PAUSED', format: d.format, primaryText: d.primaryText, headline: d.headline, description: d.description, cta: d.cta, destinationUrl: d.destinationUrl, mediaUrl: d.mediaUrl, mediaType: d.mediaType, sourcePostId: d.sourcePostId, sourcePostUrl: d.sourcePostUrl },
  });
}

/** Switch ad sets / ads on or off on the platform (Meta) when they were created there. */
export async function syncItemStatus(workspaceId: string, platform: string, externalIds: (string | null)[], status: 'ACTIVE' | 'PAUSED'): Promise<string> {
  const ids = externalIds.filter((x): x is string => !!x);
  if (!ids.length) return 'Saved here (not created on the platform yet).';
  if (platform !== 'META') return 'Saved here.';
  try {
    const conn = await getConnection(workspaceId, 'META');
    if (!conn) return 'Saved here. Reconnect Meta to update the platform.';
    const { setMetaStatus } = await import('@/backend/services/metaPublish');
    for (const id of ids) await setMetaStatus(id, conn.accessToken, status);
    return `Updated on Meta (${status.toLowerCase()}).`;
  } catch (e: any) {
    return `Saved here, but Meta did not accept the change: ${e?.message || 'unknown error'}`;
  }
}
