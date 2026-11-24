'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface Totals { spend: number; impressions: number; reach: number; clicks: number; conversions: number; conversionValue: number; engagements: number; roas: number; cpa: number; ctr: number }
export interface Analytics {
  days: number;
  connected: string[];
  hasData: boolean;
  lastSyncedAt: string | null;
  stale: boolean;
  syncErrors: { platform: string; error: string }[];
  totals: Totals;
  previous: Totals;
  byPlatform: ({ platform: string } & Totals)[];
  series: { date: string; label: string; spend: number; impressions: number; reach: number; clicks: number; conversions: number }[];
  topCampaigns: ({ id: string | null; name: string; platform: string } & Totals)[];
  breakdowns: Record<string, { key: string; spend: number; impressions: number; clicks: number; conversions: number; share: number }[]>;
  followers: { platform: string; label: string; followers: number }[];
}

/** Real numbers from the database (synced from the ad platforms). Auto-refreshes stale data once. */
export function useAnalytics(days: 7 | 30, platform: string = 'ALL') {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const autoDone = useRef(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/analytics?days=${days}&platform=${platform}`, { cache: 'no-store' });
      if (!r.ok) throw new Error('bad');
      setData(await r.json());
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [days, platform]);

  const sync = useCallback(async (force = true) => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const r = await fetch('/api/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ force }) });
      const d = await r.json();
      const failed = (d.reports || []).filter((x: any) => !x.ok);
      setSyncMsg(failed.length ? failed.map((x: any) => `${x.platform}: ${x.message}`).join(' · ') : 'Up to date.');
    } catch {
      setSyncMsg('Could not reach the server.');
    }
    await load();
    setSyncing(false);
  }, [load]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (data?.stale && !autoDone.current) { autoDone.current = true; sync(false); }
  }, [data?.stale, sync]);

  return { data, loading, error, syncing, syncMsg, sync, reload: load };
}

export const money = (n: number) => '$' + (n >= 1000 ? Math.round(n).toLocaleString() : n.toFixed(2));
export const pct = (cur: number, prev: number) => (prev > 0 ? ((cur - prev) / prev) * 100 : null);
