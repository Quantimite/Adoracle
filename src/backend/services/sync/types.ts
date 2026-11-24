export interface DailyRow {
  platform: 'META' | 'TIKTOK' | 'GOOGLE' | 'YOUTUBE' | 'LINKEDIN';
  externalCampaignId: string;
  campaignName: string;
  date: string; // YYYY-MM-DD
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  conversions: number;
  conversionValue: number;
  engagements: number;
}

export interface CampaignInfo {
  platform: DailyRow['platform'];
  externalCampaignId: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'ERROR' | 'LEARNING';
  dailyBudget: number;
}

export interface BreakdownRow {
  platform: DailyRow['platform'];
  dimension: string;
  key: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

export interface StatRow {
  platform: DailyRow['platform'];
  label: string;
  followers: number;
}

export interface SyncPayload {
  daily: DailyRow[];
  campaigns: CampaignInfo[];
  breakdowns: BreakdownRow[];
  stats: StatRow[];
  notes: string[];
}

export const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export async function getJson(url: string, init?: RequestInit) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(25000) });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export const isoDay = (d: Date) => d.toISOString().slice(0, 10);
export const daysAgo = (n: number) => new Date(Date.now() - n * 864e5);
