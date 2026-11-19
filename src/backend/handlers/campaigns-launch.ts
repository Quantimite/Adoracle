import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/backend/auth';
import { db } from '@/backend/db/client';
import { decryptToken } from '@/backend/security/encryption';
import { getOrCreateUserWorkspace } from '@/backend/db/workspace';
import { BuilderConfig, buildBlueprints, PlatformBlueprint } from '@/shared/blueprint';
import { PlatformId } from '@/shared/adspec';

type DbPlatform = 'META' | 'TIKTOK' | 'GOOGLE' | 'YOUTUBE' | 'LINKEDIN';
interface Result {
  platform: PlatformId;
  status: 'PUSHED' | 'QUEUED' | 'FAILED' | 'SKIPPED';
  message: string;
  externalId?: string;
}

const META_VERSION = () => process.env.META_GRAPH_VERSION || 'v23.0';
const META_SPECIAL: Record<string, string> = {
  Credit: 'CREDIT',
  Employment: 'EMPLOYMENT',
  Housing: 'HOUSING',
  'Social issues, elections or politics': 'ISSUES_ELECTIONS_POLITICS',
};

async function pushMeta(bp: PlatformBlueprint, accountId: string, token: string): Promise<Result> {
  const body = new URLSearchParams({
    name: bp.campaign.name,
    objective: bp.campaign.nativeObjective || 'OUTCOME_TRAFFIC',
    status: 'PAUSED', // always created paused so nothing spends until you review it in Ads Manager
    buying_type: 'AUCTION',
    special_ad_categories: JSON.stringify(META_SPECIAL[bp.campaign.specialCategory] ? [META_SPECIAL[bp.campaign.specialCategory]] : []),
    access_token: token,
  });
  if (bp.campaign.budget !== null) {
    // Advantage+ campaign budget (amounts are in the account currency's minor unit, e.g. cents)
    body.set(bp.campaign.budgetType === 'daily' ? 'daily_budget' : 'lifetime_budget', String(Math.round(bp.campaign.budget * 100)));
    body.set('bid_strategy', 'LOWEST_COST_WITHOUT_CAP');
  } else {
    body.set('is_adset_budget_sharing_enabled', 'false');
  }
  const res = await fetch(`https://graph.facebook.com/${META_VERSION()}/${accountId}/campaigns`, {
    method: 'POST',
    body,
    signal: AbortSignal.timeout(20000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.id) {
    return { platform: 'META', status: 'FAILED', message: data?.error?.error_user_msg || data?.error?.message || 'Meta rejected the campaign' };
  }
  return {
    platform: 'META',
    status: 'PUSHED',
    externalId: data.id,
    message: `Campaign created PAUSED in Meta Ads Manager (ID ${data.id}). Ad sets and ads are saved here — finish creative review before activating.`,
  };
}

const TIKTOK_OBJECTIVE: Record<string, string> = {
  REACH: 'REACH',
  TRAFFIC: 'TRAFFIC',
  VIDEO_VIEWS: 'VIDEO_VIEWS',
  LEAD_GENERATION: 'LEAD_GENERATION',
  'SALES (Website conversions)': 'WEB_CONVERSIONS',
  APP_PROMOTION: 'APP_PROMOTION',
};

async function pushTikTok(bp: PlatformBlueprint, advertiserId: string, token: string): Promise<Result> {
  const payload: Record<string, unknown> = {
    advertiser_id: advertiserId,
    campaign_name: bp.campaign.name,
    objective_type: TIKTOK_OBJECTIVE[bp.campaign.nativeObjective || ''] || 'TRAFFIC',
    operation_status: 'DISABLE', // created paused
  };
  if (bp.campaign.budget !== null && bp.campaign.budgetType === 'daily') {
    payload.budget_mode = 'BUDGET_MODE_DAY';
    payload.budget = bp.campaign.budget;
  } else {
    payload.budget_mode = 'BUDGET_MODE_INFINITE';
  }
  const res = await fetch('https://business-api.tiktok.com/open_api/v1.3/campaign/create/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Access-Token': token },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(20000),
  });
  const data = await res.json().catch(() => ({}));
  if (data.code !== 0) return { platform: 'TIKTOK', status: 'FAILED', message: data.message || 'TikTok rejected the campaign' };
  const id = String(data.data?.campaign_id || '');
  return {
    platform: 'TIKTOK',
    status: 'PUSHED',
    externalId: id,
    message: `Campaign created paused in TikTok Ads Manager (ID ${id}). Ad groups and ads are saved here.`,
  };
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });

  let cfg: BuilderConfig;
  try {
    cfg = (await req.json()).config;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  if (!cfg?.platforms?.length) return NextResponse.json({ error: 'Pick at least one platform.' }, { status: 400 });
  if (!cfg.campaign?.name?.trim()) return NextResponse.json({ error: 'Give the campaign a name.' }, { status: 400 });
  if (!(cfg.adSet?.totalBudget > 0)) return NextResponse.json({ error: 'Budget must be greater than zero.' }, { status: 400 });

  const ws = await getOrCreateUserWorkspace(session.user.id, session.user.name);
  const tokens = await db.integrationToken.findMany({ where: { workspaceId: ws.id } });
  const blueprints = buildBlueprints(cfg);
  const results: Result[] = [];

  for (const bp of blueprints) {
    const dbPlatform: DbPlatform = bp.platform === 'YOUTUBE' ? 'GOOGLE' : bp.platform;
    const conn = tokens.find((t: any) => t.platform === dbPlatform);
    let result: Result;

    if (!bp.supported) {
      result = { platform: bp.platform, status: 'SKIPPED', message: `${bp.platform} does not offer this objective.` };
    } else if (!conn || conn.status !== 'CONNECTED') {
      result = { platform: bp.platform, status: 'QUEUED', message: 'Saved as a draft. Connect this account in Settings to push it live.' };
    } else {
      try {
        const token = decryptToken(conn.accessToken);
        if (bp.platform === 'META' && conn.accountId.startsWith('act_')) result = await pushMeta(bp, conn.accountId, token);
        else if (bp.platform === 'TIKTOK' && conn.accountId !== 'pending') result = await pushTikTok(bp, conn.accountId, token);
        else if (conn.accountId === 'pending')
          result = { platform: bp.platform, status: 'QUEUED', message: 'Connected, but no ad account was found yet. Saved as a draft.' };
        else
          result = {
            platform: bp.platform,
            status: 'QUEUED',
            message: 'Saved as a ready-to-push draft. Automatic push for this platform is not enabled yet.',
          };
      } catch (e: any) {
        result = { platform: bp.platform, status: 'FAILED', message: e?.message || 'Push failed' };
      }
    }
    results.push(result);

    if (result.status === 'SKIPPED') continue;

    const created = await db.campaign.create({
      data: {
        workspaceId: ws.id,
        platform: bp.platform,
        externalCampaignId: result.externalId || `draft_${crypto.randomUUID()}`,
        name: bp.campaign.name,
        status: 'PAUSED',
        destinationUrl: bp.adSets[0]?.ads[0]?.destinationUrl || null,
        dailyBudget: cfg.adSet.budgetType === 'daily' ? bp.platformBudget : 0,
        objective: bp.campaign.nativeObjective,
        launchStatus: result.status === 'FAILED' ? 'FAILED' : result.status,
        launchMessage: result.message,
        structure: bp as any,
        adSets: {
          create: bp.adSets.map((as) => ({
            name: as.name,
            status: 'PAUSED',
            budget: as.budget,
            budgetType: as.budgetType,
            startTime: as.startTime ? new Date(as.startTime) : null,
            endTime: as.endTime ? new Date(as.endTime) : null,
            audience: as.audience,
            placements: as.placements.join(', '),
            bidStrategy: as.bidStrategy,
            optimization: as.optimization,
            ads: {
              create: as.ads.map((ad) => ({
                campaignId: '',
                name: ad.name,
                status: 'PAUSED',
                format: ad.format,
                primaryText: ad.primaryText,
                headline: ad.headline,
                description: ad.description,
                cta: ad.cta,
                destinationUrl: ad.destinationUrl,
                mediaUrl: ad.mediaUrl || null,
                mediaType: ad.mediaType || null,
                sourcePostId: ad.sourcePostId,
                sourcePostUrl: ad.sourcePostUrl,
              })),
            },
          })),
        },
      },
      include: { adSets: { include: { ads: true } } },
    });
    // keep a direct campaign id on each ad for simple queries
    for (const as of created.adSets) await db.ad.updateMany({ where: { adSetId: as.id }, data: { campaignId: created.id } });
  }

  return NextResponse.json({ success: true, results });
}
