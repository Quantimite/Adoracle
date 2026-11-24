import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/backend/db/client';
import { getCtx, unauthorized, forbidden, canEdit } from '@/backend/auth/session';
import { getConnection } from '@/backend/integrations/tokens';
import { BuilderConfig, buildBlueprints, PlatformBlueprint } from '@/shared/blueprint';
import { PlatformId } from '@/shared/adspec';
import { pushMetaFull } from '@/backend/services/metaPublish';

interface Result {
  platform: PlatformId;
  status: 'PUSHED' | 'QUEUED' | 'FAILED' | 'SKIPPED';
  message: string;
  steps?: string[];
}
interface Ids { campaignId?: string; adSetIds: (string | null)[]; adIds: (string | null)[][] }

const TIKTOK_OBJECTIVE: Record<string, string> = { REACH: 'REACH', TRAFFIC: 'TRAFFIC', VIDEO_VIEWS: 'VIDEO_VIEWS', LEAD_GENERATION: 'LEAD_GENERATION', 'SALES (Website conversions)': 'WEB_CONVERSIONS', APP_PROMOTION: 'APP_PROMOTION' };

async function pushTikTok(bp: PlatformBlueprint, advertiserId: string, token: string): Promise<{ result: Result; campaignId?: string }> {
  const payload: Record<string, unknown> = {
    advertiser_id: advertiserId,
    campaign_name: bp.campaign.name,
    objective_type: TIKTOK_OBJECTIVE[bp.campaign.nativeObjective || ''] || 'TRAFFIC',
    operation_status: 'DISABLE',
  };
  if (bp.campaign.budget !== null && bp.campaign.budgetType === 'daily') { payload.budget_mode = 'BUDGET_MODE_DAY'; payload.budget = bp.campaign.budget; }
  else payload.budget_mode = 'BUDGET_MODE_INFINITE';
  const res = await fetch('https://business-api.tiktok.com/open_api/v1.3/campaign/create/', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Access-Token': token }, body: JSON.stringify(payload), signal: AbortSignal.timeout(20000) });
  const data = await res.json().catch(() => ({}));
  if (data.code !== 0) return { result: { platform: 'TIKTOK', status: 'FAILED', message: data.message || 'TikTok rejected the campaign' } };
  const id = String(data.data?.campaign_id || '');
  return { result: { platform: 'TIKTOK', status: 'PUSHED', message: `Campaign created paused on TikTok (ID ${id}). TikTok ad groups and ads are saved here; full TikTok ad publishing is not enabled yet.` }, campaignId: id };
}

export async function POST(req: NextRequest) {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  if (!canEdit(ctx)) return forbidden();

  let cfg: BuilderConfig;
  try { cfg = (await req.json()).config; } catch { return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 }); }
  if (!cfg?.platforms?.length) return NextResponse.json({ error: 'Pick at least one platform.' }, { status: 400 });
  if (!cfg.campaign?.name?.trim()) return NextResponse.json({ error: 'Give the campaign a name.' }, { status: 400 });
  if (!(cfg.adSet?.totalBudget > 0)) return NextResponse.json({ error: 'Budget must be greater than zero.' }, { status: 400 });

  const blueprints = buildBlueprints(cfg);
  const results: Result[] = [];

  for (const bp of blueprints) {
    let result: Result;
    let ids: Ids = { adSetIds: bp.adSets.map(() => null), adIds: bp.adSets.map((a) => a.ads.map(() => null)) };
    let active = false;

    if (!bp.supported) {
      result = { platform: bp.platform, status: 'SKIPPED', message: `${bp.platform} does not offer this objective.` };
    } else {
      try {
        const conn = await getConnection(ctx.workspaceId, bp.platform);
        const features: string[] = conn?.meta.features || [];
        if (!conn) result = { platform: bp.platform, status: 'QUEUED', message: 'Saved as a draft. Connect this account in Settings to publish it.' };
        else if (conn.row.accountId === 'pending') result = { platform: bp.platform, status: 'QUEUED', message: 'Connected, but no ad account was found yet. Saved as a draft.' };
        else if (!features.includes('ads')) result = { platform: bp.platform, status: 'QUEUED', message: 'You did not allow “Create & manage my ads”. Saved as a draft. Reconnect and tick that permission to publish.' };
        else if (bp.platform === 'META') {
          const r = await pushMetaFull(bp, cfg, { accountId: conn.row.accountId, accessToken: conn.accessToken, meta: conn.meta });
          ids = { campaignId: r.campaignId, adSetIds: r.adSetIds, adIds: r.adIds };
          active = r.ok && cfg.campaign.launchStatus === 'ACTIVE';
          result = { platform: 'META', status: r.ok ? 'PUSHED' : 'FAILED', message: r.message, steps: r.steps };
        } else if (bp.platform === 'TIKTOK') {
          const r = await pushTikTok(bp, conn.row.accountId, conn.accessToken);
          ids = { ...ids, campaignId: r.campaignId };
          result = r.result;
        } else result = { platform: bp.platform, status: 'QUEUED', message: 'Saved as a ready-to-publish draft. Automatic publishing for this platform is not enabled yet.' };
      } catch (e: any) {
        result = { platform: bp.platform, status: 'FAILED', message: e?.message || 'Publishing failed' };
      }
    }
    results.push(result);
    if (result.status === 'SKIPPED') continue;

    const itemStatus = active ? 'ACTIVE' : 'PAUSED';
    const created = await db.campaign.create({
      data: {
        workspaceId: ctx.workspaceId,
        platform: bp.platform,
        externalCampaignId: ids.campaignId || `draft_${crypto.randomUUID()}`,
        name: bp.campaign.name,
        status: itemStatus,
        destinationUrl: bp.adSets[0]?.ads[0]?.destinationUrl || null,
        dailyBudget: cfg.adSet.budgetType === 'daily' ? bp.platformBudget : 0,
        objective: bp.campaign.nativeObjective,
        launchStatus: result.status === 'FAILED' ? 'FAILED' : result.status,
        launchMessage: result.message,
        structure: bp as any,
        adSets: {
          create: bp.adSets.map((as, i) => ({
            name: as.name, status: itemStatus, budget: as.budget, budgetType: as.budgetType,
            startTime: as.startTime ? new Date(as.startTime) : null, endTime: as.endTime ? new Date(as.endTime) : null,
            audience: as.audience, placements: as.placements.join(', '), bidStrategy: as.bidStrategy, optimization: as.optimization,
            externalId: ids.adSetIds[i],
            ads: {
              create: as.ads.map((ad, j) => ({
                campaignId: '', name: ad.name, status: itemStatus, format: ad.format, primaryText: ad.primaryText, headline: ad.headline,
                description: ad.description, cta: ad.cta, destinationUrl: ad.destinationUrl, mediaUrl: ad.mediaUrl || null, mediaType: ad.mediaType || null,
                sourcePostId: ad.sourcePostId, sourcePostUrl: ad.sourcePostUrl, externalId: ids.adIds[i]?.[j] ?? null,
              })),
            },
          })),
        },
      },
      include: { adSets: true },
    });
    for (const as of created.adSets) await db.ad.updateMany({ where: { adSetId: as.id }, data: { campaignId: created.id } });
  }

  return NextResponse.json({ success: true, results });
}
