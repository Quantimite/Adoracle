import { SyncPayload, DailyRow, BreakdownRow, num, getJson } from './types';

const V = () => process.env.META_GRAPH_VERSION || 'v23.0';
const G = (p: string) => `https://graph.facebook.com/${V()}/${p}`;

type Action = { action_type: string; value: string };

/** Pick ONE action family so purchases are never double counted (omni_purchase and purchase are the same sales). */
function pick(actions: Action[] | undefined, families: string[][]): number {
  if (!actions) return 0;
  let total = 0;
  for (const fam of families) {
    const hit = fam.map((t) => actions.find((a) => a.action_type === t)).find(Boolean);
    if (hit) total += num(hit.value);
  }
  return total;
}
const PURCHASE = ['omni_purchase', 'purchase', 'offsite_conversion.fb_pixel_purchase'];
const LEAD = ['lead', 'onsite_conversion.lead_grouped', 'offsite_conversion.fb_pixel_lead'];
const conversionsOf = (a?: Action[]) => pick(a, [PURCHASE, LEAD]);
const valueOf = (a?: Action[]) => pick(a, [PURCHASE]);
const engagementsOf = (a?: Action[]) => pick(a, [['post_engagement']]);

async function paged(url: string, maxPages = 8) {
  const out: any[] = [];
  let next: string | undefined = url;
  for (let i = 0; i < maxPages && next; i++) {
    const r = await getJson(next);
    if (!r.ok) throw new Error(r.data?.error?.message || `Meta error ${r.status}`);
    out.push(...(r.data.data || []));
    next = r.data.paging?.next;
  }
  return out;
}

const statusOf = (s: string): 'ACTIVE' | 'PAUSED' | 'ERROR' | 'LEARNING' =>
  s === 'ACTIVE' ? 'ACTIVE' : /PAUSED|ARCHIVED|DELETED/.test(s) ? 'PAUSED' : /ISSUES|DISAPPROVED|ERROR/.test(s) ? 'ERROR' : 'LEARNING';

export async function syncMeta(accountId: string, token: string, pages: any[]): Promise<SyncPayload> {
  const out: SyncPayload = { daily: [], campaigns: [], breakdowns: [], stats: [], notes: [] };
  if (!accountId.startsWith('act_')) {
    out.notes.push('No Meta ad account found yet.');
    return out;
  }
  const t = `access_token=${token}`;

  // Campaigns (names, status, budgets)
  const camps = await paged(G(`${accountId}/campaigns?fields=id,name,effective_status,daily_budget,lifetime_budget&limit=200&${t}`));
  for (const c of camps) out.campaigns.push({ platform: 'META', externalCampaignId: c.id, name: c.name, status: statusOf(c.effective_status), dailyBudget: num(c.daily_budget) / 100 });

  // Daily performance per campaign (last 30 days)
  const rows = await paged(G(`${accountId}/insights?level=campaign&time_increment=1&date_preset=last_30d&fields=campaign_id,campaign_name,spend,impressions,reach,clicks,actions,action_values&limit=500&${t}`));
  for (const r of rows) {
    out.daily.push({
      platform: 'META', externalCampaignId: r.campaign_id, campaignName: r.campaign_name, date: r.date_start,
      spend: num(r.spend), impressions: num(r.impressions), reach: num(r.reach), clicks: num(r.clicks),
      conversions: conversionsOf(r.actions), conversionValue: valueOf(r.action_values), engagements: engagementsOf(r.actions),
    } as DailyRow);
  }

  // Breakdowns (account level, last 30 days)
  const dims: { label: string; param: string; key: (r: any) => string }[] = [
    { label: 'Age', param: 'age', key: (r) => r.age },
    { label: 'Gender', param: 'gender', key: (r) => (r.gender === 'female' ? 'Women' : r.gender === 'male' ? 'Men' : 'Unknown') },
    { label: 'Placement', param: 'publisher_platform,platform_position', key: (r) => `${cap(r.publisher_platform)} · ${String(r.platform_position).replace(/_/g, ' ')}` },
    { label: 'Device', param: 'device_platform', key: (r) => cap(r.device_platform) },
    { label: 'Region', param: 'country', key: (r) => r.country },
  ];
  for (const d of dims) {
    try {
      const data = await paged(G(`${accountId}/insights?level=account&date_preset=last_30d&breakdowns=${d.param}&fields=spend,impressions,clicks,actions&limit=200&${t}`), 2);
      const agg = new Map<string, BreakdownRow>();
      for (const r of data) {
        const key = d.key(r);
        const cur = agg.get(key) || { platform: 'META' as const, dimension: d.label, key, spend: 0, impressions: 0, clicks: 0, conversions: 0 };
        cur.spend += num(r.spend); cur.impressions += num(r.impressions); cur.clicks += num(r.clicks); cur.conversions += conversionsOf(r.actions);
        agg.set(key, cur);
      }
      out.breakdowns.push(...Array.from(agg.values()));
    } catch (e: any) {
      out.notes.push(`Breakdown ${d.label}: ${e?.message}`);
    }
  }

  // Followers (needs the "show my existing posts" permission)
  for (const page of pages.slice(0, 3)) {
    try {
      const tok = await getJson(G(`${page.id}?fields=access_token&${t}`));
      const pt = tok.data?.access_token;
      if (!pt) continue;
      const pg = await getJson(G(`${page.id}?fields=followers_count,fan_count&access_token=${pt}`));
      const f = num(pg.data?.followers_count || pg.data?.fan_count);
      if (f) out.stats.push({ platform: 'META', label: `Facebook · ${page.name}`, followers: f });
      if (page.instagram?.id) {
        const ig = await getJson(G(`${page.instagram.id}?fields=followers_count,username&access_token=${pt}`));
        if (ig.data?.followers_count) out.stats.push({ platform: 'META', label: `Instagram · @${ig.data.username || page.instagram.username}`, followers: num(ig.data.followers_count) });
      }
    } catch {
      /* optional */
    }
  }
  return out;
}

function cap(s: string) {
  return String(s || '').replace(/(^|_)(\w)/g, (_, a, b) => (a ? ' ' : '') + b.toUpperCase()).trim();
}
