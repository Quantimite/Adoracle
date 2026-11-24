import { SyncPayload, num, getJson, isoDay, daysAgo } from './types';

const B = 'https://business-api.tiktok.com/open_api/v1.3';
const q = (o: Record<string, unknown>) => Object.entries(o).map(([k, v]) => `${k}=${encodeURIComponent(typeof v === 'string' ? v : JSON.stringify(v))}`).join('&');

export async function syncTikTok(advertiserId: string, token: string): Promise<SyncPayload> {
  const out: SyncPayload = { daily: [], campaigns: [], breakdowns: [], stats: [], notes: [] };
  if (!advertiserId || advertiserId === 'pending') {
    out.notes.push('No TikTok advertiser account found yet.');
    return out;
  }
  const h = { 'Access-Token': token };

  const camps = await getJson(`${B}/campaign/get/?${q({ advertiser_id: advertiserId, page_size: 200 })}`, { headers: h });
  if (camps.data?.code !== 0) throw new Error(camps.data?.message || 'TikTok campaign list failed');
  for (const c of camps.data.data?.list || []) {
    out.campaigns.push({ platform: 'TIKTOK', externalCampaignId: String(c.campaign_id), name: c.campaign_name, status: c.operation_status === 'ENABLE' ? 'ACTIVE' : 'PAUSED', dailyBudget: c.budget_mode === 'BUDGET_MODE_DAY' ? num(c.budget) : 0 });
  }

  const start = isoDay(daysAgo(29));
  const end = isoDay(new Date());
  const rep = await getJson(`${B}/report/integrated/get/?${q({
    advertiser_id: advertiserId, report_type: 'BASIC', data_level: 'AUCTION_CAMPAIGN',
    dimensions: ['campaign_id', 'stat_time_day'], metrics: ['campaign_name', 'spend', 'impressions', 'clicks', 'reach', 'conversion', 'total_complete_payment_rate'],
    start_date: start, end_date: end, page_size: 1000,
  })}`, { headers: h });
  if (rep.data?.code !== 0) throw new Error(rep.data?.message || 'TikTok report failed');
  for (const r of rep.data.data?.list || []) {
    out.daily.push({
      platform: 'TIKTOK', externalCampaignId: String(r.dimensions.campaign_id), campaignName: r.metrics.campaign_name || '',
      date: String(r.dimensions.stat_time_day).slice(0, 10),
      spend: num(r.metrics.spend), impressions: num(r.metrics.impressions), reach: num(r.metrics.reach), clicks: num(r.metrics.clicks),
      conversions: num(r.metrics.conversion), conversionValue: 0, engagements: 0,
    });
  }

  // Audience breakdowns
  for (const [label, dim] of [['Age', 'age'], ['Gender', 'gender']] as const) {
    try {
      const a = await getJson(`${B}/report/integrated/get/?${q({
        advertiser_id: advertiserId, report_type: 'AUDIENCE', data_level: 'AUCTION_ADVERTISER',
        dimensions: ['advertiser_id', dim], metrics: ['spend', 'impressions', 'clicks', 'conversion'], start_date: start, end_date: end, page_size: 100,
      })}`, { headers: h });
      if (a.data?.code !== 0) throw new Error(a.data?.message);
      for (const r of a.data.data?.list || []) {
        const k = String(r.dimensions[dim]).replace('AGE_', '').replace('_', '–').replace('MALE', 'Men').replace('FEMALE', 'Women');
        out.breakdowns.push({ platform: 'TIKTOK', dimension: label, key: k, spend: num(r.metrics.spend), impressions: num(r.metrics.impressions), clicks: num(r.metrics.clicks), conversions: num(r.metrics.conversion) });
      }
    } catch (e: any) {
      out.notes.push(`TikTok ${label} breakdown: ${e?.message || 'unavailable'}`);
    }
  }
  return out;
}
