'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, animate, useInView } from 'framer-motion';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowUpRight, Eye, MousePointerClick, Heart, Users, Plug, UserPlus } from 'lucide-react';
import { PlatformBadge } from '@/frontend/components/common/PlatformBadge';
import { PlatformId, SPECS } from '@/shared/adspec';
import { Analytics, pct } from '@/frontend/hooks/useAnalytics';

export function AnimatedNumber({ value, prefix = '', suffix = '', compact = true, decimals = 0 }: { value: number; prefix?: string; suffix?: string; compact?: boolean; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: false, margin: '-40px' });
  const prev = useRef(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(prev.current, value, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => { if (ref.current) ref.current.textContent = prefix + fmt(v, compact, decimals) + suffix; },
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, inView, prefix, suffix, compact, decimals]);

  return <span ref={ref}>{prefix + fmt(value, compact, decimals) + suffix}</span>;
}

export function fmt(n: number, compact: boolean, decimals = 0) {
  if (!compact) return decimals ? n.toFixed(decimals) : Math.round(n).toLocaleString();
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 10_000) return Math.round(n / 1000) + 'K';
  if (n >= 1_000) return (n / 1000).toFixed(1) + 'K';
  return String(Math.round(n));
}

export function Delta({ cur, prev, invert = false }: { cur: number; prev: number; invert?: boolean }) {
  const d = pct(cur, prev);
  if (d === null) return <span className="text-[11px] font-semibold text-slate-400">No earlier data</span>;
  const good = invert ? d <= 0 : d >= 0;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${good ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-sky-300' : 'bg-rose-50 text-rose-700'}`}>
      <ArrowUpRight size={11} className={d < 0 ? 'rotate-90' : ''} /> {d >= 0 ? '+' : ''}{d.toFixed(1)}%
    </span>
  );
}

export function EmptyAnalytics({ data }: { data: Analytics }) {
  const none = data.connected.length === 0;
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
      <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mb-3"><Plug size={22} /></div>
      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{none ? 'Connect an account to see your real numbers' : 'No results in this period yet'}</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
        {none ? 'Reach, clicks, spend and sales will appear here as soon as you connect Facebook, Instagram, Google, TikTok or LinkedIn.' : 'Your account is connected, but the platform reported no ad results for these dates. If you just started a campaign, check back after it runs, or press Sync now.'}
      </p>
      {none && <Link href="/settings?section=connections" className="inline-flex mt-4 px-5 py-2.5 rounded-xl bg-blue-700 text-white text-xs font-bold hover:brightness-110">Connect accounts</Link>}
    </div>
  );
}

/** Reach & engagement summary built only from real synced data. */
export function ReachOverview({ data }: { data: Analytics }) {
  if (!data.hasData) return <EmptyAnalytics data={data} />;
  const t = data.totals, p = data.previous;
  const maxImp = Math.max(1, ...data.byPlatform.map((x) => x.impressions));
  const tiles = [
    { label: 'Impressions', value: t.impressions, prev: p.impressions, icon: Eye, hint: 'Times your ads appeared on screen' },
    { label: 'Reach (daily total)', value: t.reach, prev: p.reach, icon: Users, hint: 'People reached each day, added up' },
    { label: 'Engagements', value: t.engagements, prev: p.engagements, icon: Heart, hint: 'Likes, comments, shares, saves' },
    { label: 'Clicks', value: t.clicks, prev: p.clicks, icon: MousePointerClick, hint: `Click-through rate ${t.ctr.toFixed(2)}%` },
  ];

  return (
    <section className="space-y-4" aria-label="Reach and engagement overview">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Reach & Engagement</h2>
        <p className="text-xs text-slate-500">Real results from your connected ad accounts. Compared with the previous {data.days} days.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {tiles.map((x, i) => {
          const Icon = x.icon;
          return (
            <motion.div key={x.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * i, duration: 0.45 }} whileHover={{ y: -3 }} title={x.hint} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">{x.label}</span>
                <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center"><Icon size={14} /></span>
              </div>
              <p className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums"><AnimatedNumber value={x.value} /></p>
              <div className="mt-1.5"><Delta cur={x.value} prev={x.prev} /></div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Impressions & clicks over time</h3>
            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Impressions</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Clicks</span>
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.series} margin={{ top: 6, right: 4, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gImp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2268DD" stopOpacity={0.5} /><stop offset="100%" stopColor="#2268DD" stopOpacity={0.03} /></linearGradient>
                  <linearGradient id="gClk" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#36BAFC" stopOpacity={0.5} /><stop offset="100%" stopColor="#36BAFC" stopOpacity={0.03} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" strokeOpacity={0.2} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} interval={data.days === 30 ? 4 : 0} />
                <YAxis yAxisId="l" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => fmt(v, true)} />
                <YAxis yAxisId="r" orientation="right" hide />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} formatter={(v: number) => v.toLocaleString()} />
                <Area yAxisId="l" type="monotone" dataKey="impressions" name="Impressions" stroke="#2268DD" strokeWidth={2} fill="url(#gImp)" animationDuration={1200} />
                <Area yAxisId="r" type="monotone" dataKey="clicks" name="Clicks" stroke="#36BAFC" strokeWidth={2} fill="url(#gClk)" animationDuration={1200} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Results by platform</h3>
          <div className="space-y-3">
            {data.byPlatform.sort((a, b) => b.impressions - a.impressions).map((r, i) => (
              <Link key={r.platform} href={`/platforms?p=${r.platform}`} className="block rounded-xl p-1.5 -m-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <div className="flex items-center gap-2.5">
                  <PlatformBadge id={r.platform as PlatformId} size={28} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-100">{SPECS[r.platform as PlatformId]?.short || r.platform}</span>
                      <span className="font-semibold text-slate-500 tabular-nums">{fmt(r.impressions, true)} views · ${Math.round(r.spend).toLocaleString()}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(r.impressions / maxImp) * 100}%` }} transition={{ delay: 0.1 * i, duration: 0.9 }} className="h-full rounded-full bg-gradient-to-r from-blue-700 to-sky-400" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {data.followers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><UserPlus size={11} /> Followers</p>
              {data.followers.map((f) => (
                <p key={f.label} className="flex items-center justify-between text-xs"><span className="text-slate-600 dark:text-slate-300 truncate">{f.label}</span><span className="font-bold tabular-nums text-slate-900 dark:text-white">{f.followers.toLocaleString()}</span></p>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top campaigns</h3>
          <Link href="/campaigns" className="text-xs font-bold text-blue-600 hover:underline">See all →</Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {data.topCampaigns.map((c, i) => (
            <motion.div key={`${c.platform}-${c.name}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.06 * i }}>
              <Link href={c.id ? `/campaigns/${c.id}` : '/campaigns'} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 hover:border-blue-500 transition-colors">
                <PlatformBadge id={c.platform as PlatformId} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{c.name}</p>
                  <p className="text-[11px] text-slate-500">${Math.round(c.spend).toLocaleString()} spent · {Math.round(c.conversions)} results{c.roas ? ` · ${c.roas.toFixed(1)}× ROAS` : ''}</p>
                </div>
                <ArrowUpRight size={14} className="text-slate-400 shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
