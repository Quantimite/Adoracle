import { SyncPayload, num, getJson } from './types';

const V = () => process.env.GOOGLE_ADS_API_VERSION || 'v21';

async function gaql(customerId: string, token: string, query: string) {
  const r = await getJson(`https://googleads.googleapis.com/${V()}/customers/${customerId}/googleAds:searchStream`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '', 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!r.ok) throw new Error(r.data?.error?.message || r.data?.[0]?.error?.message || `Google Ads error ${r.status}`);
  const batches: any[] = Array.isArray(r.data) ? r.data : [r.data];
  return batches.flatMap((b) => b.results || []);
}

export async function syncGoogle(customerId: string, token: string): Promise<SyncPayload> {
  const out: SyncPayload = { daily: [], campaigns: [], breakdowns: [], stats: [], notes: [] };
  if (!customerId || customerId === 'pending' || !process.env.GOOGLE_ADS_DEVELOPER_TOKEN) {
    out.notes.push('Google Ads needs an approved developer token and a customer account.');
    return out;
  }

  const rows = await gaql(customerId, token, `SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type, campaign_budget.amount_micros, segments.date, metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.conversions, metrics.conversions_value, metrics.interactions FROM campaign WHERE segments.date DURING LAST_30_DAYS AND campaign.status != 'REMOVED'`);
  const seen = new Set<string>();
  for (const r of rows) {
    const platform = r.campaign.advertisingChannelType === 'VIDEO' ? 'YOUTUBE' : 'GOOGLE';
    const id = String(r.campaign.id);
    if (!seen.has(id)) {
      seen.add(id);
      out.campaigns.push({ platform, externalCampaignId: id, name: r.campaign.name, status: r.campaign.status === 'ENABLED' ? 'ACTIVE' : 'PAUSED', dailyBudget: num(r.campaignBudget?.amountMicros) / 1e6 });
    }
    out.daily.push({
      platform, externalCampaignId: id, campaignName: r.campaign.name, date: r.segments.date,
      spend: num(r.metrics.costMicros) / 1e6, impressions: num(r.metrics.impressions), reach: 0, clicks: num(r.metrics.clicks),
      conversions: num(r.metrics.conversions), conversionValue: num(r.metrics.conversionsValue), engagements: num(r.metrics.interactions),
    });
  }

  const dims: { label: string; select: string; from: string; key: (r: any) => string }[] = [
    { label: 'Device', select: 'segments.device', from: 'customer', key: (r) => ({ MOBILE: 'Mobile', DESKTOP: 'Desktop', TABLET: 'Tablet' } as any)[r.segments.device] || r.segments.device },
    { label: 'Network', select: 'segments.ad_network_type', from: 'customer', key: (r) => String(r.segments.adNetworkType).replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) },
    { label: 'Hour of day', select: 'segments.hour', from: 'customer', key: (r) => { const h = Number(r.segments.hour); return `${String(h).padStart(2, '0')}:00`; } },
  ];
  for (const d of dims) {
    try {
      const data = await gaql(customerId, token, `SELECT ${d.select}, metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.conversions FROM ${d.from} WHERE segments.date DURING LAST_30_DAYS`);
      const agg = new Map<string, any>();
      for (const r of data) {
        const key = d.key(r);
        const c = agg.get(key) || { platform: 'GOOGLE', dimension: d.label, key, spend: 0, impressions: 0, clicks: 0, conversions: 0 };
        c.spend += num(r.metrics.costMicros) / 1e6; c.impressions += num(r.metrics.impressions); c.clicks += num(r.metrics.clicks); c.conversions += num(r.metrics.conversions);
        agg.set(key, c);
      }
      out.breakdowns.push(...Array.from(agg.values()));
    } catch (e: any) {
      out.notes.push(`Google ${d.label}: ${e?.message}`);
    }
  }
  return out;
}
