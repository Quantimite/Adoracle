'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Rocket, Network, RefreshCw, AlertTriangle, Lightbulb, ArrowRight, Loader2, DollarSign, Target, TrendingUp, ShoppingBag } from 'lucide-react';
import { useCurrentUser, firstNameOf } from '@/frontend/context/UserContext';
import { useAnalytics, money } from '@/frontend/hooks/useAnalytics';
import { ReachOverview, AnimatedNumber, Delta, EmptyAnalytics } from '@/frontend/components/dashboard/ReachOverview';
import { BrandLogo } from '@/frontend/components/common/BrandLogo';

interface Insight { id: string; severity: 'critical' | 'warning' | 'opportunity' | 'info'; title: string; detail: string; campaignId: string | null; platform: string }

function Attention() {
  const [items, setItems] = useState<Insight[] | null>(null);
  useEffect(() => {
    fetch('/api/intelligence', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).then((d) => setItems(d ? d.insights.filter((i: Insight) => i.severity !== 'info').slice(0, 3) : [])).catch(() => setItems([]));
  }, []);
  if (!items || items.length === 0) return null;
  return (
    <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Needs your attention</h2>
        <Link href="/intelligence" className="text-xs font-bold text-blue-600 hover:underline">All insights →</Link>
      </div>
      <ul className="space-y-2">
        {items.map((i) => {
          const bad = i.severity === 'critical' || i.severity === 'warning';
          return (
            <li key={i.id}>
              <Link href={i.campaignId ? `/campaigns/${i.campaignId}` : '/intelligence'} className={`flex items-start gap-3 p-3 rounded-xl border ${bad ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-blue-50 border-blue-100 text-blue-900'}`}>
                {bad ? <AlertTriangle size={16} className="mt-0.5 shrink-0" /> : <Lightbulb size={16} className="mt-0.5 shrink-0" />}
                <span className="min-w-0"><span className="block text-xs font-extrabold">{i.title}</span><span className="block text-[11px] opacity-80 line-clamp-2">{i.detail}</span></span>
                <ArrowRight size={14} className="ml-auto mt-0.5 shrink-0 opacity-60" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function DashboardView() {
  const user = useCurrentUser();
  const [days, setDays] = useState<7 | 30>(7);
  const [greeting, setGreeting] = useState('Hi');
  const { data, loading, error, syncing, syncMsg, sync } = useAnalytics(days);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');
  }, []);

  const t = data?.totals, p = data?.previous;
  const kpis = t && p ? [
    { label: 'Total ad spend', value: t.spend, prev: p.spend, prefix: '$', dec: 0, icon: DollarSign, invert: true, note: `${data!.connected.length} platform(s) connected` },
    { label: 'Results (sales & leads)', value: t.conversions, prev: p.conversions, prefix: '', dec: 0, icon: ShoppingBag, invert: false, note: 'Purchases and leads tracked by the platforms' },
    { label: 'Cost per result', value: t.cpa, prev: p.cpa, prefix: '$', dec: 2, icon: Target, invert: true, note: t.cpa ? 'Lower is better' : 'Needs tracked results' },
  ] : [];

  return (
    <div className="space-y-6 pb-14">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-3 rounded-3xl bg-gradient-to-r from-blue-50 to-white dark:from-blue-950/40 dark:to-slate-900 border border-blue-100 dark:border-blue-900 px-5 py-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-blue-700 dark:text-sky-300">{greeting}</p>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
            Hi, {firstNameOf(user.name)}{' '}
            <motion.span role="img" aria-label="waving hand" className="inline-block origin-[70%_70%]" animate={{ rotate: [0, 16, -8, 16, -4, 10, 0] }} transition={{ duration: 1.6, delay: 0.4 }}>👋</motion.span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Your ads and social results, straight from your connected accounts.</p>
        </div>
        <div className="hidden sm:flex -space-x-2 shrink-0">{(['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'GOOGLE', 'LINKEDIN'] as const).map((b) => <span key={b} className="ring-2 ring-white dark:ring-slate-900 rounded-xl"><BrandLogo id={b} size={30} /></span>)}</div>
      </motion.div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Command Center</h2>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
            {data?.lastSyncedAt ? `Last updated ${new Date(data.lastSyncedAt).toLocaleString()}` : 'No data synced yet'}
            {syncMsg && <span className="text-slate-400">· {syncMsg}</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-1 text-xs font-bold">
            {([7, 30] as const).map((d) => <button key={d} type="button" onClick={() => setDays(d)} className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${days === d ? 'bg-blue-700 text-white' : 'text-slate-500'}`}>Last {d} days</button>)}
          </div>
          <button type="button" disabled={syncing || !data?.connected.length} onClick={() => sync(true)} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-blue-500 disabled:opacity-50 cursor-pointer">
            <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} /> Sync now
          </button>
          <Link href="/builder" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-blue-800 to-blue-600 text-white text-xs font-bold shadow-md hover:brightness-110"><Rocket size={13} /> New campaign</Link>
          <Link href="/platforms" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-blue-500"><Network size={13} /> Manage platforms</Link>
        </div>
      </div>

      {data?.syncErrors && data.syncErrors.length > 0 && (
        <p className="flex items-start gap-2 text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5"><AlertTriangle size={14} className="mt-0.5 shrink-0" /> {data.syncErrors.map((e) => `${e.platform}: ${e.error}`).join(' · ')}. <Link href="/settings?section=connections" className="underline font-bold">Check connections</Link></p>
      )}
      {error && <p className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5">Could not load your analytics. Check that the database is connected.</p>}
      {loading && <p className="flex items-center gap-2 text-sm text-slate-500"><Loader2 size={16} className="animate-spin" /> Loading your results…</p>}

      {data && !data.hasData && <EmptyAnalytics data={data} />}

      {data && data.hasData && t && p && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl p-5 bg-gradient-to-br from-blue-800 to-blue-600 text-white shadow-lg col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between"><span className="text-xs font-semibold text-blue-100">Return on ad spend</span><TrendingUp size={16} className="text-blue-100" /></div>
              <p className="mt-3 text-4xl font-black tracking-tight tabular-nums">{t.roas ? <AnimatedNumber value={t.roas} suffix="×" compact={false} decimals={2} /> : '—'}</p>
              <p className="text-[11px] text-blue-100 mt-2">{t.roas ? `Revenue ${money(t.conversionValue)} from ${money(t.spend)} spent` : 'Needs purchase tracking (Meta Pixel / Google tag)'}</p>
            </motion.div>
            {kpis.map((k, i) => {
              const Icon = k.icon;
              return (
                <motion.div key={k.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * (i + 1) }} className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                  <div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-500">{k.label}</span><Icon size={16} className="text-blue-600" /></div>
                  <p className="mt-3 text-3xl font-black tracking-tight tabular-nums text-slate-900 dark:text-white">{k.value ? <AnimatedNumber value={k.value} prefix={k.prefix} compact={false} decimals={k.dec} /> : '—'}</p>
                  <div className="mt-2"><Delta cur={k.value} prev={k.prev} invert={k.invert} /></div>
                  <p className="text-[10px] text-slate-400 mt-1.5">{k.note}</p>
                </motion.div>
              );
            })}
          </div>
          <ReachOverview data={data} />
        </>
      )}

      <Attention />
    </div>
  );
}
