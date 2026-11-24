// src/backend/services/metaPublish.ts
// Publishes an Adoracle campaign to Meta (Facebook + Instagram) the way Ads Manager does:
//   Campaign  →  Ad set (audience, placements, budget, schedule, goal)  →  Ad creative  →  Ad.
// Everything is created PAUSED first; it is switched on at the end only if the user chose "Active".
import { BuilderConfig, PlatformBlueprint } from '@/shared/blueprint';

const V = () => process.env.META_GRAPH_VERSION || 'v23.0';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface MetaPushResult {
  ok: boolean;
  message: string;
  campaignId?: string;
  adSetIds: (string | null)[];
  adIds: (string | null)[][];
  steps: string[];
}

class MetaError extends Error {}

async function fb(path: string, body: Record<string, unknown>, token: string) {
  const form = new URLSearchParams();
  for (const [k, v] of Object.entries(body)) if (v !== undefined && v !== null) form.set(k, typeof v === 'string' ? v : JSON.stringify(v));
  form.set('access_token', token);
  const res = await fetch(`https://graph.facebook.com/${V()}/${path}`, { method: 'POST', body: form, signal: AbortSignal.timeout(40000) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) throw new MetaError(data?.error?.error_user_msg || data?.error?.message || `Meta rejected the request (${res.status})`);
  return data;
}
async function fbGet(path: string, token: string) {
  const sep = path.includes('?') ? '&' : '?';
  const res = await fetch(`https://graph.facebook.com/${V()}/${path}${sep}access_token=${token}`, { signal: AbortSignal.timeout(25000) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) throw new MetaError(data?.error?.message || `Meta error (${res.status})`);
  return data;
}

const SPECIAL: Record<string, string> = { Credit: 'CREDIT', Employment: 'EMPLOYMENT', Housing: 'HOUSING', 'Social issues, elections or politics': 'ISSUES_ELECTIONS_POLITICS' };
const CTA: Record<string, string> = { 'Learn more': 'LEARN_MORE', 'Shop now': 'SHOP_NOW', 'Sign up': 'SIGN_UP', 'Get offer': 'GET_OFFER', 'Contact us': 'CONTACT_US', 'Book now': 'BOOK_TRAVEL', Download: 'DOWNLOAD', 'Send message': 'MESSAGE_PAGE', 'Watch more': 'WATCH_MORE' };
const EVENT: Record<string, string> = { Purchase: 'PURCHASE', Lead: 'LEAD', 'Add to cart': 'ADD_TO_CART', 'Initiate checkout': 'INITIATED_CHECKOUT', 'Complete registration': 'COMPLETE_REGISTRATION', Contact: 'CONTACT', 'View content': 'CONTENT_VIEW' };
const PLACEMENT: Record<string, [string, string]> = {
  fb_feed: ['facebook', 'feed'], fb_reels: ['facebook', 'facebook_reels'], fb_stories: ['facebook', 'story'],
  ig_feed: ['instagram', 'stream'], ig_reels: ['instagram', 'reels'], ig_stories: ['instagram', 'story'], ig_explore: ['instagram', 'explore'],
  audience_network: ['audience_network', 'classic'], messenger: ['messenger', 'messenger_inbox'],
};
const KEY_BY_LABEL: Record<string, string> = { 'Facebook Feed': 'fb_feed', 'Facebook Reels': 'fb_reels', 'Facebook Stories': 'fb_stories', 'Instagram Feed': 'ig_feed', 'Instagram Reels': 'ig_reels', 'Instagram Stories': 'ig_stories', 'Instagram Explore': 'ig_explore', Messenger: 'messenger', 'Audience Network': 'audience_network' };

async function resolveGeo(names: string[], token: string) {
  const geo: Record<string, unknown[]> = {};
  const push = (k: string, v: unknown) => ((geo[k] ||= []).push(v));
  const list = names.length ? names : [];
  for (const n of list) {
    if (/^[A-Za-z]{2}$/.test(n.trim())) { push('countries', n.trim().toUpperCase()); continue; }
    const r = await fbGet(`search?type=adgeolocation&q=${encodeURIComponent(n)}&location_types=${encodeURIComponent('["country","region","city"]')}&limit=1`, token);
    const hit = r.data?.[0];
    if (!hit) throw new MetaError(`Meta could not find the location “${n}”. Try a country, region or city name.`);
    if (hit.type === 'country') push('countries', hit.country_code || hit.key);
    else if (hit.type === 'region') push('regions', { key: hit.key });
    else push('cities', { key: hit.key });
  }
  if (!Object.keys(geo).length) throw new MetaError('Add at least one location to target.');
  return geo;
}

async function resolveInterests(names: string[], token: string) {
  const out: { id: string; name: string }[] = [];
  for (const n of names.slice(0, 10)) {
    try {
      const r = await fbGet(`search?type=adinterest&q=${encodeURIComponent(n)}&limit=1`, token);
      if (r.data?.[0]) out.push({ id: r.data[0].id, name: r.data[0].name });
    } catch { /* skip an interest Meta does not know */ }
  }
  return out;
}

export async function pushMetaFull(bp: PlatformBlueprint, cfg: BuilderConfig, conn: { accountId: string; accessToken: string; meta: any }): Promise<MetaPushResult> {
  const token = conn.accessToken;
  const act = conn.accountId;
  const steps: string[] = [];
  const result: MetaPushResult = { ok: false, message: '', adSetIds: bp.adSets.map(() => null), adIds: bp.adSets.map((a) => a.ads.map(() => null)), steps };
  const fail = (msg: string) => { result.message = msg; return result; };

  try {
    const page = (conn.meta.pages || [])[0];

    // ---------- 1. Campaign ----------
    const cbo = bp.campaign.budget !== null;
    const camp = await fb(`${act}/campaigns`, {
      name: bp.campaign.name, objective: bp.campaign.nativeObjective, status: 'PAUSED', buying_type: 'AUCTION',
      special_ad_categories: SPECIAL[bp.campaign.specialCategory] ? [SPECIAL[bp.campaign.specialCategory]] : [],
      ...(cbo ? { [bp.campaign.budgetType === 'daily' ? 'daily_budget' : 'lifetime_budget']: Math.round(bp.campaign.budget! * 100), bid_strategy: 'LOWEST_COST_WITHOUT_CAP' } : { is_adset_budget_sharing_enabled: false }),
    }, token);
    result.campaignId = camp.id;
    steps.push('Campaign created');

    if (!page?.id) return fail(`Campaign created (ID ${camp.id}), but ad sets need a Facebook Page. Reconnect Meta and allow “Publish posts & reels” so your Pages are found.`);

    // ---------- shared lookups ----------
    const obj = cfg.campaign.objective;
    const conv = cfg.adSet;
    let pixelId: string | null = null;
    const needsPixel = ['SALES', 'LEADS'].includes(obj) && conv.conversionLocation === 'website' && conv.conversionEvent !== 'none';
    if (needsPixel) {
      try { pixelId = (await fbGet(`${act}/adspixels?fields=id,name&limit=5`, token)).data?.[0]?.id || null; } catch { pixelId = null; }
      if (!pixelId) steps.push('No Meta Pixel found on this ad account, so the ad set optimizes for link clicks instead of purchases/leads');
    }

    const geo = await resolveGeo(conv.locations, token);
    const targeting: Record<string, unknown> = { geo_locations: geo };
    if (conv.audienceMode === 'manual') {
      targeting.age_min = Math.max(13, conv.ageMin);
      targeting.age_max = Math.min(65, conv.ageMax);
      if (conv.gender !== 'all') targeting.genders = [conv.gender === 'men' ? 1 : 2];
      const interests = await resolveInterests(conv.interests, token);
      if (interests.length) targeting.flexible_spec = [{ interests }];
      targeting.targeting_automation = { advantage_audience: 0 };
    } else {
      targeting.age_min = 18;
      targeting.targeting_automation = { advantage_audience: 1 };
    }
    if (conv.placementMode === 'manual') {
      const keys = (conv.placements.META?.length ? conv.placements.META : Object.values(KEY_BY_LABEL)) as string[];
      const pubs = new Set<string>(); const pos: Record<string, string[]> = {};
      for (const k of keys) { const m = PLACEMENT[k]; if (!m) continue; pubs.add(m[0]); (pos[m[0]] ||= []).push(m[1]); }
      targeting.publisher_platforms = Array.from(pubs);
      if (pos.facebook) targeting.facebook_positions = pos.facebook;
      if (pos.instagram) targeting.instagram_positions = pos.instagram;
      if (pos.messenger) targeting.messenger_positions = pos.messenger;
      if (pos.audience_network) targeting.audience_network_positions = pos.audience_network;
    }

    // goal for the ad set
    let optimization = 'LINK_CLICKS';
    let promoted: Record<string, unknown> | undefined;
    let destination: string | undefined = 'WEBSITE';
    if (obj === 'AWARENESS') { optimization = 'REACH'; destination = undefined; }
    else if (obj === 'ENGAGEMENT') { optimization = 'POST_ENGAGEMENT'; destination = 'ON_POST'; }
    else if (obj === 'APP') return fail(`Campaign created (ID ${camp.id}). App-install ad sets are not supported yet. Finish this one in Ads Manager.`);
    else if (pixelId && needsPixel) { optimization = 'OFFSITE_CONVERSIONS'; promoted = { pixel_id: pixelId, custom_event_type: EVENT[conv.conversionEvent] || 'PURCHASE' }; }
    else if (obj === 'LEADS' && conv.conversionLocation === 'instant_forms') steps.push('Instant forms need a form ID, so this ad set sends people to your website instead');

    const bidKey = cfg.adSet.bidStrategy.META || 'lowest_cost';
    const bid: Record<string, unknown> = {};
    if (!cbo) {
      bid.bid_strategy = bidKey === 'cost_cap' ? 'COST_CAP' : bidKey === 'bid_cap' ? 'LOWEST_COST_WITH_BID_CAP' : 'LOWEST_COST_WITHOUT_CAP';
      if (bidKey === 'cost_cap' || bidKey === 'bid_cap') bid.bid_amount = Math.round((cfg.adSet.costCap || 25) * 100);
    }

    const makeCreativeBase = async (ad: PlatformBlueprint['adSets'][number]['ads'][number], adSetName: string) => {
      const cta = { type: CTA[ad.cta] || 'LEARN_MORE', value: { link: ad.destinationUrl } };
      if (ad.sourcePostId && /^\d+_\d+$/.test(ad.sourcePostId)) return { name: `${ad.name} creative`, object_story_id: ad.sourcePostId };
      const base: Record<string, unknown> = { page_id: page.id };
      if (page.instagram?.id) base.instagram_user_id = page.instagram.id;
      if (ad.mediaType === 'VIDEO' && ad.mediaUrl) {
        const vid = await fb(`${act}/advideos`, { file_url: ad.mediaUrl, name: ad.name }, token);
        let picture: string | undefined;
        for (let i = 0; i < 20; i++) {
          const st = await fbGet(`${vid.id}?fields=status,picture`, token);
          if (st.status?.video_status === 'ready') { picture = st.picture; break; }
          if (st.status?.video_status === 'error') throw new MetaError('Meta could not process the video file.');
          await sleep(3000);
        }
        if (!picture) throw new MetaError('The video is still processing on Meta. Try again in a few minutes.');
        return { name: `${ad.name} creative`, object_story_spec: { ...base, video_data: { video_id: vid.id, image_url: picture, message: ad.primaryText, title: ad.headline, link_description: ad.description || undefined, call_to_action: cta } } };
      }
      return { name: `${ad.name} creative`, object_story_spec: { ...base, link_data: { link: ad.destinationUrl, message: ad.primaryText, name: ad.headline, description: ad.description || undefined, picture: ad.mediaUrl || undefined, call_to_action: cta } } };
    };

    // ---------- 2-4. Ad sets, creatives, ads ----------
    for (let i = 0; i < bp.adSets.length; i++) {
      const as = bp.adSets[i];
      const body: Record<string, unknown> = {
        name: as.name, campaign_id: camp.id, status: 'PAUSED', billing_event: 'IMPRESSIONS', optimization_goal: optimization, targeting,
        start_time: as.startTime ? new Date(as.startTime).toISOString() : undefined,
        end_time: as.endTime ? new Date(as.endTime).toISOString() : undefined,
        promoted_object: promoted ?? (obj === 'ENGAGEMENT' ? { page_id: page.id } : undefined),
        destination_type: destination, ...bid,
      };
      if (!cbo && as.budget !== null) {
        body[as.budgetType === 'daily' ? 'daily_budget' : 'lifetime_budget'] = Math.round(as.budget * 100);
        if (as.budgetType === 'lifetime' && !as.endTime) throw new MetaError('A lifetime budget needs an end date and time.');
      }
      const created = await fb(`${act}/adsets`, body, token);
      result.adSetIds[i] = created.id;
      steps.push(`Ad set “${as.name.split(' · ').pop()}” created`);

      for (let j = 0; j < as.ads.length; j++) {
        const ad = as.ads[j];
        const creative = await fb(`${act}/adcreatives`, await makeCreativeBase(ad, as.name), token);
        const adRes = await fb(`${act}/ads`, { name: ad.name, adset_id: created.id, creative: { creative_id: creative.id }, status: 'PAUSED' }, token);
        result.adIds[i][j] = adRes.id;
        steps.push(`Ad “${ad.headline}” created`);
      }
    }

    // ---------- 5. Switch on if requested ----------
    if (cfg.campaign.launchStatus === 'ACTIVE') {
      for (const ids of result.adIds) for (const id of ids) if (id) await fb(id, { status: 'ACTIVE' }, token);
      for (const id of result.adSetIds) if (id) await fb(id, { status: 'ACTIVE' }, token);
      await fb(camp.id, { status: 'ACTIVE' }, token);
      steps.push('Switched on');
    }

    result.ok = true;
    result.message = cfg.campaign.launchStatus === 'ACTIVE'
      ? `Live on Meta: 1 campaign, ${bp.adSets.length} ad set(s), ${bp.adSets.reduce((a, s) => a + s.ads.length, 0)} ad(s). Meta reviews new ads, which can take up to 24 hours.`
      : `Published to Meta as PAUSED: 1 campaign, ${bp.adSets.length} ad set(s), ${bp.adSets.reduce((a, s) => a + s.ads.length, 0)} ad(s). Activate it in the manager when you are ready.`;
    return result;
  } catch (e: any) {
    const done = steps.length ? ` Done so far: ${steps.join(', ')}.` : '';
    return fail(`${e?.message || 'Meta rejected the request.'}${done}${result.campaignId ? ` The campaign (ID ${result.campaignId}) exists on Meta, so check it in Ads Manager before retrying.` : ''}`);
  }
}

/** Switch one Meta object (campaign / ad set / ad) on or off. */
export async function setMetaStatus(externalId: string, token: string, status: 'ACTIVE' | 'PAUSED') {
  await fb(externalId, { status }, token);
}
