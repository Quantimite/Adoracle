'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Rocket, Search, Pause, Play, Settings2, Loader2, CheckCircle2, Clock, AlertTriangle, Download, RefreshCw } from 'lucide-react';
import { PlatformBadge } from '@/frontend/components/common/PlatformBadge';
import { ALL_PLATFORMS, PlatformId, SPECS } from '@/shared/adspec';
import { useAnalytics } from '@/frontend/hooks/useAnalytics';

interface Row {
  id: string; platform: PlatformId; name: string; status: 'ACTIVE' | 'LEARNING' | 'ERROR' | 'PAUSED'; dailyBudget: number;
  customersWon: number; costPerCustomer: number; totalSpend: number; roas: number; launchStatus?: string; isDraft?: boolean;
}

const STATUS: Record<string, string> = { ACTIVE: 'bg-blue-100 text-blue-800', LEARNING: 'bg-sky-100 text-sky-800', PAUSED: 'bg-slate-200 text-slate-700', ERROR: 'bg-rose-100 text-rose-700' };

function CampaignsContent() {
  const params = useSearchParams();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [q, setQ] = useState(params.get('q') || '');
  const [platform, setPlatform] = useState<PlatformId | 'ALL'>('ALL');
  const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'PAUSED' | 'ERROR'>('ALL');
  const [busy, setBusy] = useState<string | null>(null);
  const { syncing, sync, data } = useAnalytics(30);

  const load = useCallback(() => {
    fetch('/api/campaigns', { cache: 'no-store' }).then((r) => r.json()).then((d) => setRows(d.campaigns || [])).catch(() => setRows([]));
  }, []);
  useEffect(load, [load]);

  const toggle = async (c: Row) => {
    setBusy(c.id);
    await fetch(`/api/campaigns/${c.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ level: 'campaign', ids: [c.id], changes: { status: c.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED' } }) });
    setBusy(null);
    load();
  };

  const shown = useMemo(() => (rows || []).filter((c) => (platform === 'ALL' || c.platform === platform) && (status === 'ALL' || (status === 'ACTIVE' ? c.status === 'ACTIVE' || c.status === 'LEARNING' : c.status === status)) && c.name.toLowerCase().includes(q.toLowerCase())), [rows, platform, status, q]);
  const totals = useMemo(() => shown.reduce((a, c) => ({ spend: a.spend + c.totalSpend, won: a.won + c.customersWon }), { spend: 0, won: 0 }), [shown]);

  const exportCsv = () => {
    const head = 'Name,Platform,Status,Daily budget,Spend (30d),Results,Cost per result,ROAS\n';
    const body = shown.map((c) => [c.name, c.platform, c.status, c.dailyBudget, c.totalSpend, c.customersWon, c.costPerCustomer, c.roas].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([head + body], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'adoracle-campaigns.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Campaigns</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Every campaign from your connected accounts, with real results. Open one to manage its ad sets and ads.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={syncing || !data?.connected.length} onClick={() => sync(true)} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-blue-500 disabled:opacity-50 cursor-pointer"><RefreshCw size={13} className={syncing ? 'animate-spin' : ''} /> Sync now</button>
          <button type="button" disabled={!shown.length} onClick={exportCsv} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-blue-500 disabled:opacity-50 cursor-pointer"><Download size={13} /> Export CSV</button>
          <Link href="/builder" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-700 text-white text-xs font-bold hover:brightness-110"><Rocket size={13} /> New campaign</Link>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 space-y-3">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search campaigns…" className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" />
        </div>
        <div className="flex flex-wrap gap-2">
          {(['ALL', ...ALL_PLATFORMS] as const).map((p) => (
            <button key={p} type="button" onClick={() => setPlatform(p)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border cursor-pointer transition-all ${platform === p ? 'bg-blue-700 text-white border-blue-700' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-500'}`}>
              {p !== 'ALL' && <PlatformBadge id={p} size={16} />}{p === 'ALL' ? 'All platforms' : SPECS[p].short}
            </button>
          ))}
          <span className="w-px bg-slate-200 dark:bg-slate-700 mx-1" />
          {(['ALL', 'ACTIVE', 'PAUSED', 'ERROR'] as const).map((s) => (
            <button key={s} type="button" onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded-full text-[11px] font-bold border cursor-pointer transition-all ${status === s ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>{s === 'ALL' ? 'Any status' : s === 'ACTIVE' ? 'Running' : s === 'PAUSED' ? 'Paused' : 'Problems'}</button>
          ))}
        </div>
        {rows && rows.length > 0 && <p className="text-[11px] text-slate-500">{shown.length} campaign(s) · ${Math.round(totals.spend).toLocaleString()} spent · {totals.won.toLocaleString()} results</p>}
      </div>

      {rows === null && <p className="flex items-center gap-2 text-sm text-slate-500"><Loader2 size={16} className="animate-spin" /> Loading campaigns…</p>}

      {rows && rows.length === 0 && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">No campaigns yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">Connect an account and press Sync now to import the campaigns you already run, or create a brand new one with the builder.</p>
          <div className="flex justify-center gap-2 mt-4">
            <Link href="/settings?section=connections" className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200">Connect accounts</Link>
            <Link href="/builder" className="px-5 py-2.5 rounded-xl bg-blue-700 text-white text-xs font-bold">Create campaign</Link>
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        {shown.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.03 }} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 flex flex-col lg:flex-row lg:items-center gap-4 hover:border-blue-400 transition-colors">
            <div className="flex items-center gap-3 min-w-0 lg:w-80">
              <PlatformBadge id={c.platform} size={42} />
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">{c.name}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS[c.status]}`}>{c.status}</span>
                  {c.isDraft && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700"><Clock size={10} /> Draft</span>}
                  {c.launchStatus === 'PUSHED' && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700"><CheckCircle2 size={10} /> Published</span>}
                  {c.launchStatus === 'FAILED' && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700"><AlertTriangle size={10} /> Not published</span>}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 flex-1 text-center">
              {[['Daily budget', c.dailyBudget ? `$${c.dailyBudget.toFixed(0)}` : '—'], ['Spent (30d)', `$${Math.round(c.totalSpend).toLocaleString()}`], ['Results', c.customersWon.toLocaleString()], ['ROAS', c.roas ? `${c.roas.toFixed(1)}×` : '—']].map(([k, v]) => (
                <div key={k}><p className="text-sm font-extrabold tabular-nums text-slate-900 dark:text-white">{v}</p><p className="text-[10px] text-slate-500">{k}</p></div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" disabled={busy === c.id} onClick={() => toggle(c)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-500 cursor-pointer disabled:opacity-60">
                {c.status === 'PAUSED' ? <Play size={12} /> : <Pause size={12} />} {c.status === 'PAUSED' ? 'Resume' : 'Pause'}
              </button>
              <Link href={`/campaigns/${c.id}`} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-700 text-white hover:brightness-110"><Settings2 size={12} /> Manage</Link>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default function CampaignsView() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500">Loading campaigns…</div>}>
      <CampaignsContent />
    </Suspense>
  );
}
