'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, animate, useInView } from 'framer-motion';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowUpRight, Eye, Megaphone, MousePointerClick, Heart, Info, Users } from 'lucide-react';
import { PlatformBadge } from '@/components/shared/PlatformBadge';
import { ALL_PLATFORMS, PlatformId, SPECS } from '@/lib/adspec';
import { useConnections } from '@/components/connections/useConnections';

type Range = '7D' | '30D';

// Sample figures shown until real accounts are connected and synced.
const BASE: Record<PlatformId, { paid: number; organic: number; impressions: number; engagements: number; clicks: number; followers: number }> = {
  META: { paid: 182000, organic: 64000, impressions: 310000, engagements: 14200, clicks: 5100, followers: 320 },
  TIKTOK: { paid: 144000, organic: 98000, impressions: 260000, engagements: 21400, clicks: 3900, followers: 610 },
  GOOGLE: { paid: 96000, organic: 38000, impressions: 150000, engagements: 3100, clicks: 6200, followers: 0 },
  YOUTUBE: { paid: 74000, organic: 41000, impressions: 120000, engagements: 5800, clicks: 1700, followers: 145 },
  LINKEDIN: { paid: 21000, organic: 12000, impressions: 40000, engagements: 1900, clicks: 800, followers: 88 },
};

const TOP_CONTENT = [
  { id: 1, platform: 'TIKTOK' as PlatformId, title: 'Creator hook review #12 (Spark Ad)', kind: 'Paid', reach: 96400, rate: '8.2%', href: '/campaigns' },
  { id: 2, platform: 'META' as PlatformId, title: 'Reels · Product demo carousel', kind: 'Paid', reach: 71800, rate: '5.6%', href: '/campaigns' },
  { id: 3, platform: 'YOUTUBE' as PlatformId, title: 'Shorts · 30s how-it-works', kind: 'Organic', reach: 41200, rate: '6.9%', href: '/posts' },
  { id: 4, platform: 'LINKEDIN' as PlatformId, title: 'Founder story · document post', kind: 'Organic', reach: 12300, rate: '4.1%', href: '/posts' },
];

export function AnimatedNumber({ value, prefix = '', suffix = '', compact = true }: { value: number; prefix?: string; suffix?: string; compact?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: false, margin: '-40px' });
  const prev = useRef(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(prev.current, value, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = prefix + fmt(v, compact) + suffix;
      },
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, inView, prefix, suffix, compact]);

  return <span ref={ref}>{prefix + fmt(0, compact) + suffix}</span>;
}

function fmt(n: number, compact: boolean) {
  if (!compact) return Math.round(n).toLocaleString();
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 10_000) return Math.round(n / 1000) + 'K';
  if (n >= 1_000) return (n / 1000).toFixed(1) + 'K';
  return String(Math.round(n));
}

function buildSeries(range: Range, totalPaid: number, totalOrganic: number) {
  const days = range === '7D' ? 7 : 30;
  const labels = range === '7D' ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : Array.from({ length: 30 }, (_, i) => `D${i + 1}`);
  const weights = Array.from({ length: days }, (_, i) => 0.8 + 0.35 * Math.sin((i / days) * Math.PI * 1.6 + 0.6) + (i / days) * 0.25);
  const wsum = weights.reduce((a, b) => a + b, 0);
  return labels.map((day, i) => ({
    day,
    Paid: Math.round((totalPaid * weights[i]) / wsum),
    Organic: Math.round((totalOrganic * (weights[days - 1 - i] * 0.6 + 0.4)) / wsum),
  }));
}

export function ReachOverview({ range }: { range: Range }) {
  const { connections, loading } = useConnections();
  const live = connections.some((c) => c.connected);
  const mult = range === '7D' ? 1 : 4.2;
  const [focus, setFocus] = useState<PlatformId | 'ALL'>('ALL');

  const rows = useMemo(
    () =>
      ALL_PLATFORMS.map((p) => {
        const b = BASE[p];
        return {
          id: p,
          paid: Math.round(b.paid * mult),
          organic: Math.round(b.organic * mult),
          impressions: Math.round(b.impressions * mult),
          engagements: Math.round(b.engagements * mult),
          clicks: Math.round(b.clicks * mult),
          followers: Math.round(b.followers * mult),
        };
      }),
    [mult]
  );

  const picked = focus === 'ALL' ? rows : rows.filter((r) => r.id === focus);
  const sum = (k: 'paid' | 'organic' | 'impressions' | 'engagements' | 'clicks' | 'followers') => picked.reduce((a, r) => a + r[k], 0);
  const totalReach = sum('paid') + sum('organic');
  const maxReach = Math.max(...rows.map((r) => r.paid + r.organic));
  const series = useMemo(() => buildSeries(range, sum('paid'), sum('organic')), [range, focus, mult]); // eslint-disable-line react-hooks/exhaustive-deps

  const tiles = [
    { label: 'Total reach', value: totalReach, icon: Users, delta: '+18.4%', hint: 'People who saw your ads or posts' },
    { label: 'Impressions', value: sum('impressions'), icon: Eye, delta: '+12.1%', hint: 'Times content appeared on screen' },
    { label: 'Engagements', value: sum('engagements'), icon: Heart, delta: '+22.7%', hint: 'Likes, comments, shares, saves' },
    { label: 'Link clicks', value: sum('clicks'), icon: MousePointerClick, delta: '+9.3%', hint: 'Visits sent to your website' },
  ];

  return (
    <section className="space-y-4" aria-label="Reach and engagement overview">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Reach & Engagement</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">All paid ads and social content, across every platform.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['ALL', ...ALL_PLATFORMS] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFocus(p)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                focus === p
                  ? 'bg-[#114B32] text-white border-[#114B32]'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-[#1B6B48]'
              }`}
            >
              {p === 'ALL' ? 'All platforms' : SPECS[p].short}
            </button>
          ))}
        </div>
      </div>

      {!loading && !live && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200">
          <Info size={15} className="shrink-0" />
          <span className="flex-1">
            You are looking at <b>sample data</b>. Connect your ad and social accounts to see your real numbers here.
          </span>
          <Link href="/settings?section=integrations" className="font-bold underline whitespace-nowrap">
            Connect accounts
          </Link>
        </div>
      )}

      {/* Animated stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {tiles.map((t, i) => {
          const Icon = t.icon;
          return (
            <motion.div
              key={t.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * i, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -3 }}
              title={t.hint}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{t.label}</span>
                <span className="w-7 h-7 rounded-lg bg-[#E6F4ED] dark:bg-emerald-950/60 text-[#1B6B48] flex items-center justify-center">
                  <Icon size={14} />
                </span>
              </div>
              <p className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums">
                <AnimatedNumber value={t.value} />
              </p>
              <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                <ArrowUpRight size={11} /> {t.delta}
              </span>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Reach over time */}
        <div className="lg:col-span-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Reach over time</h3>
            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#169C69]" /> Paid ads</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#7DD3B0]" /> Organic posts</span>
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gPaid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#169C69" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#169C69" stopOpacity={0.03} />
                  </linearGradient>
                  <linearGradient id="gOrg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7DD3B0" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#7DD3B0" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" strokeOpacity={0.2} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} interval={range === '30D' ? 4 : 0} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => fmt(v, true)} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
                  formatter={(v: number) => v.toLocaleString()}
                />
                <Area type="monotone" dataKey="Organic" stackId="1" stroke="#7DD3B0" strokeWidth={2} fill="url(#gOrg)" animationDuration={1200} />
                <Area type="monotone" dataKey="Paid" stackId="1" stroke="#169C69" strokeWidth={2} fill="url(#gPaid)" animationDuration={1200} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform breakdown */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Reach by platform</h3>
          <div className="space-y-3">
            {rows.map((r, i) => {
              const total = r.paid + r.organic;
              const width = (total / maxReach) * 100;
              return (
                <Link
                  key={r.id}
                  href={`/platforms?p=${r.id}`}
                  className={`block group rounded-xl p-1.5 -m-1.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                    focus !== 'ALL' && focus !== r.id ? 'opacity-40' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <PlatformBadge id={r.id} size={26} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-100">{SPECS[r.id].short}</span>
                        <span className="font-semibold text-slate-500 tabular-nums">{fmt(total, true)}</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${width}%` }}
                          transition={{ delay: 0.1 * i, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full flex"
                        >
                          <span className="h-full bg-[#169C69]" style={{ width: `${(r.paid / total) * 100}%` }} />
                          <span className="h-full bg-[#7DD3B0]" style={{ width: `${(r.organic / total) * 100}%` }} />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Megaphone size={12} /> Dark = paid ads · light = organic posts. Tap a row to manage that platform.
          </p>
        </div>
      </div>

      {/* Top content */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top performing content</h3>
          <Link href="/posts" className="text-xs font-bold text-[#169C69] hover:underline">
            Create a post →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {TOP_CONTENT.filter((c) => focus === 'ALL' || c.platform === focus).map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.07 * i }}>
              <Link
                href={c.href}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 hover:border-[#1B6B48] transition-colors"
              >
                <PlatformBadge id={c.platform} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{c.title}</p>
                  <p className="text-[11px] text-slate-500">
                    {c.kind} · {fmt(c.reach, true)} reach · {c.rate} engagement
                  </p>
                </div>
                <ArrowUpRight size={14} className="text-slate-400 shrink-0" />
              </Link>
            </motion.div>
          ))}
          {focus !== 'ALL' && !TOP_CONTENT.some((c) => c.platform === focus) && (
            <p className="text-xs text-slate-500 col-span-2">No content to show for this platform yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
