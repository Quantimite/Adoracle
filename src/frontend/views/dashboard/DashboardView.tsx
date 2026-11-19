'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  Plus,
  Upload,
  Pause,
  Play,
  RotateCcw,
  TrendingUp,
} from 'lucide-react';
import { useMode } from '@/frontend/context/ModeContext';
import { PlatformMark } from '@/frontend/components/ui/AdoracleGlyphs';
import { ReachOverview } from '@/frontend/components/dashboard/ReachOverview';
import { useCurrentUser, firstNameOf } from '@/frontend/context/UserContext';

type TimeRange = '7D' | '30D';

interface GuardAlert {
  id: string;
  category: 'Safety Guard' | 'Tracking' | 'Creative Fatigue';
  title: string;
  detail: string;
  impact: string;
  actionLabel: string;
  resolvedLabel: string;
}

const initialAlerts: GuardAlert[] = [
  {
    id: 'checkout-404',
    category: 'Safety Guard',
    title: 'Broken checkout link on Meta Retargeting',
    detail: '/checkout/v2/pay returned 404 — ad set throttled automatically.',
    impact: 'Saves $140/day',
    actionLabel: 'Auto-Fix 301 Redirect',
    resolvedLabel: 'Redirect active → /checkout/pay ($140/day saved)',
  },
  {
    id: 'meta-capi',
    category: 'Tracking',
    title: 'Meta CAPI server event lag detected',
    detail: 'Deduplication key desynced 3h ago. Re-syncing restores full ROAS.',
    impact: '+18% attribution',
    actionLabel: 'Resync CAPI Token',
    resolvedLabel: 'Meta CAPI 99.4% Event Match Quality restored',
  },
  {
    id: 'yt-fatigue',
    category: 'Creative Fatigue',
    title: 'YouTube Shorts Hook A frequency > 3.8',
    detail: '3-sec thumb-stop dropped to 24%. Hook Variant B leads by +11%.',
    impact: '+11% est. CTR',
    actionLabel: 'Rotate to Hook B',
    resolvedLabel: 'Hook Variant B promoted to 85% traffic share',
  },
];

const dashboardData: Record<
  TimeRange,
  {
    conversions: string;
    convDelta: string;
    cpa: string;
    cpaDelta: string;
    spend: string;
    roas: string;
    netProfit: string;
    roasDelta: string;
    provenBudget: string;
    labBudget: string;
    bars: { day: string; height: number; active: boolean; conv: number; spend: string; highlight?: boolean }[];
    channels: {
      platform: 'GOOGLE' | 'META' | 'TIKTOK' | 'YOUTUBE';
      name: string;
      campaignType: string;
      conversions: number;
      cpa: string;
      roas: string;
      spend: string;
      status: 'Scaling' | 'Optimal' | 'Testing';
    }[];
  }
> = {
  '7D': {
    conversions: '169',
    convDelta: '+24.8%',
    cpa: '$22.02',
    cpaDelta: '-18.2%',
    spend: '$3,721',
    roas: '5.18×',
    netProfit: '$15,554',
    roasDelta: '+31.5%',
    provenBudget: '$2,605',
    labBudget: '$1,116',
    bars: [
      { day: 'Sun', height: 54, active: true, conv: 19, spend: '$410' },
      { day: 'Mon', height: 72, active: true, conv: 26, spend: '$540' },
      { day: 'Tue', height: 66, active: true, conv: 24, spend: '$515' },
      { day: 'Wed', height: 94, active: true, conv: 35, spend: '$690', highlight: true },
      { day: 'Thu', height: 80, active: true, conv: 29, spend: '$610' },
      { day: 'Fri', height: 68, active: false, conv: 21, spend: '$490 est' },
      { day: 'Sat', height: 60, active: false, conv: 15, spend: '$466 est' },
    ],
    channels: [
      {
        platform: 'GOOGLE',
        name: 'Google Search',
        campaignType: 'Exact Intent Keywords',
        conversions: 64,
        cpa: '$18.40',
        roas: '6.1×',
        spend: '$1,180',
        status: 'Scaling',
      },
      {
        platform: 'META',
        name: 'Meta & Instagram',
        campaignType: 'Advantage+ CBO Reels',
        conversions: 66,
        cpa: '$21.50',
        roas: '5.4×',
        spend: '$1,420',
        status: 'Optimal',
      },
      {
        platform: 'TIKTOK',
        name: 'TikTok Spark Ads',
        campaignType: 'Creator UGC Whitelisting',
        conversions: 26,
        cpa: '$26.10',
        roas: '4.2×',
        spend: '$680',
        status: 'Testing',
      },
      {
        platform: 'YOUTUBE',
        name: 'YouTube Shorts',
        campaignType: 'Product Demo Hooks',
        conversions: 13,
        cpa: '$29.00',
        roas: '3.8×',
        spend: '$441',
        status: 'Testing',
      },
    ],
  },
  '30D': {
    conversions: '725',
    convDelta: '+29.4%',
    cpa: '$21.24',
    cpaDelta: '-21.0%',
    spend: '$15,400',
    roas: '5.42×',
    netProfit: '$68,068',
    roasDelta: '+34.2%',
    provenBudget: '$10,780',
    labBudget: '$4,620',
    bars: [
      { day: 'W1', height: 64, active: true, conv: 152, spend: '$3,420' },
      { day: 'W2', height: 78, active: true, conv: 184, spend: '$3,890' },
      { day: 'W3', height: 92, active: true, conv: 215, spend: '$4,210', highlight: true },
      { day: 'W4', height: 84, active: true, conv: 174, spend: '$3,880' },
      { day: 'Next', height: 88, active: false, conv: 196, spend: '$4,050 est' },
    ],
    channels: [
      {
        platform: 'GOOGLE',
        name: 'Google Search',
        campaignType: 'Exact Intent Keywords',
        conversions: 274,
        cpa: '$17.90',
        roas: '6.3×',
        spend: '$4,920',
        status: 'Scaling',
      },
      {
        platform: 'META',
        name: 'Meta & Instagram',
        campaignType: 'Advantage+ CBO Reels',
        conversions: 283,
        cpa: '$20.80',
        roas: '5.6×',
        spend: '$5,890',
        status: 'Scaling',
      },
      {
        platform: 'TIKTOK',
        name: 'TikTok Spark Ads',
        campaignType: 'Creator UGC Whitelisting',
        conversions: 110,
        cpa: '$24.90',
        roas: '4.5×',
        spend: '$2,740',
        status: 'Optimal',
      },
      {
        platform: 'YOUTUBE',
        name: 'YouTube Shorts',
        campaignType: 'Product Demo Hooks',
        conversions: 58,
        cpa: '$27.50',
        roas: '4.0×',
        spend: '$1,850',
        status: 'Testing',
      },
    ],
  },
};

export default function DashboardPage() {
  const user = useCurrentUser();
  const [greeting, setGreeting] = useState('Hi');
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');
  }, []);
  const modeContext = useMode() as any;
  const isExpert = Boolean(
    modeContext?.isExpert ?? modeContext?.expertMode ?? modeContext?.mode === 'expert'
  );

  const [timeRange, setTimeRange] = useState<TimeRange>('7D');
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const [fixingId, setFixingId] = useState<string | null>(null);
  const [aiRunning, setAiRunning] = useState(true);
  const [secondsElapsed, setSecondsElapsed] = useState(5048); // 01:24:08
  const [hoveredBarIdx, setHoveredBarIdx] = useState<number | null>(null);

  const [rules, setRules] = useState([
    {
      id: 'cpa-cap',
      name: 'Auto-Pause CPA > $32',
      desc: 'Stops ad sets exceeding target ceiling',
      enabled: true,
    },
    {
      id: 'scale-win',
      name: 'Scale Winners +20%',
      desc: 'Boosts budget when ROAS > 5.0× for 48h',
      enabled: true,
    },
    {
      id: 'link-guard',
      name: '404 Landing Page Shield',
      desc: 'Instant pause on broken checkout URLs',
      enabled: true,
    },
  ]);

  useEffect(() => {
    if (!aiRunning) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [aiRunning]);

  const formatTimer = (totalSeconds: number) => {
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSeconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const handleResolveAlert = (id: string) => {
    setFixingId(id);
    setTimeout(() => {
      setFixingId(null);
      setResolvedIds((prev) => [...prev, id]);
    }, 650);
  };

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const current = dashboardData[timeRange];
  const openAlerts = initialAlerts.filter((a) => !resolvedIds.includes(a.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-full overflow-x-hidden space-y-5 pb-10"
    >
      {/* 0. PERSONAL GREETING */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between gap-3 rounded-3xl bg-gradient-to-r from-[#E6F1FF] to-white dark:from-blue-950/50 dark:to-slate-900 border border-[#BBD9FF]/60 dark:border-blue-900 px-5 py-4"
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#1E57D0] dark:text-sky-300">{greeting}</p>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
            Hi, {firstNameOf(user.name)}{' '}
            <motion.span
              role="img"
              aria-label="waving hand"
              className="inline-block origin-[70%_70%]"
              animate={{ rotate: [0, 16, -8, 16, -4, 10, 0] }}
              transition={{ duration: 1.6, delay: 0.4 }}
            >
              👋
            </motion.span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Here is how your ads and social content are performing.</p>
        </div>
        <Link
          href="/profile"
          className="hidden sm:inline-flex shrink-0 px-3.5 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#1E57D0] transition-all"
        >
          My profile
        </Link>
      </motion.div>

      {/* 1. TOP COMMAND HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#E6F1FF] dark:bg-blue-950/60 text-[#153E9E] dark:text-sky-300 text-[11px] font-bold mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2A6FE0] animate-pulse" />
            <span>Workspace Healthy · $980.00 waste blocked this week</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Unified cross-channel attribution, automated budget pacing, and safety guardrails.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* 7D / 30D Pill Switcher */}
          <div className="inline-flex p-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            {(['7D', '30D'] as TimeRange[]).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${timeRange === range
                    ? 'bg-[#153E9E] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                {range === '7D' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>

          <Link
            href="/builder"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#153E9E] to-[#1E57D0] text-white text-xs font-semibold shadow-sm hover:brightness-110 transition-all"
          >
            <Plus size={15} />
            <span>New Campaign</span>
          </Link>

          <Link
            href="/platforms"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:border-[#1E57D0] transition-all"
          >
            <Upload size={14} />
            <span>Manage Platforms</span>
          </Link>
        </div>
      </div>

      {/* 2. TOP 4 BENTO KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hero Blue Card */}
        <div className="rounded-3xl bg-gradient-to-br from-[#153E9E] via-[#163F9A] to-[#2F7DEB] p-5 text-white shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-100">
              {isExpert ? 'Blended ROAS' : 'Net Return After Ads'}
            </span>
            <Link
              href="/intelligence"
              className="w-7 h-7 rounded-full bg-white text-[#153E9E] flex items-center justify-center hover:scale-105 transition-transform"
            >
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="my-3 text-3xl sm:text-4xl font-bold tracking-tight">
            {isExpert ? current.roas : current.netProfit}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-blue-100/90">
            <span className="px-1.5 py-0.5 rounded bg-white/15 font-bold">
              {current.roasDelta}
            </span>
            <span>
              {isExpert ? `Net profit: ${current.netProfit}` : `Blended ROAS: ${current.roas}`}
            </span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {isExpert ? 'Verified Conversions' : 'Customers Acquired'}
            </span>
            <Link
              href="/campaigns"
              className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:border-[#1E57D0] transition-colors"
            >
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="my-3 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            {current.conversions}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="px-1.5 py-0.5 rounded bg-[#E6F1FF] text-[#153E9E] font-bold">
              {current.convDelta}
            </span>
            <span>CAPI &amp; Server verified</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {isExpert ? 'Blended CPA' : 'Cost Per Customer'}
            </span>
            <Link
              href="/intelligence"
              className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:border-[#1E57D0] transition-colors"
            >
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="my-3 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            {current.cpa}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="px-1.5 py-0.5 rounded bg-[#E6F1FF] text-[#153E9E] font-bold">
              {current.cpaDelta}
            </span>
            <span>Below $30.00 target ceiling</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Total Ad Spend
            </span>
            <Link
              href="/campaigns"
              className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:border-[#1E57D0] transition-colors"
            >
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="my-3 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            {current.spend}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="px-1.5 py-0.5 rounded bg-[#E6F1FF] text-[#153E9E] font-bold">
              98% Paced
            </span>
            <span>70/30 AI budget split active</span>
          </div>
        </div>
      </div>

      {/* 2b. REACH & ENGAGEMENT SUMMARY (all ads + social content, animated) */}
      <ReachOverview range={timeRange} />

      {/* 3. BALANCED MIDDLE BENTO ROW (7 Cols Left Stack + 5 Cols Right Queue — Zero Overflow, Zero Dead Space) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* LEFT STACK (7 cols): Velocity Chart + Autopilot Rules */}
        <div className="lg:col-span-7 min-w-0 flex flex-col gap-4">
          {/* Compact Capsule Velocity Chart */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isExpert ? 'Conversion & Spend Velocity' : 'Daily Customer Flow'}
                </h2>
                <p className="text-[11px] text-slate-400">
                  Solid bars = actuals · Striped = AI forecast
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E6F1FF] text-[#153E9E] text-[11px] font-bold shrink-0">
                <TrendingUp size={12} /> Peak Wed
              </span>
            </div>

            <div className="h-32 flex items-end justify-between gap-3 pt-5 px-2">
              {current.bars.map((bar, idx) => {
                const isHovered = hoveredBarIdx === idx;
                return (
                  <div
                    key={bar.day}
                    onMouseEnter={() => setHoveredBarIdx(idx)}
                    onMouseLeave={() => setHoveredBarIdx(null)}
                    className="relative flex-1 flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer"
                  >
                    {(bar.highlight || isHovered) && (
                      <span className="absolute -top-1 whitespace-nowrap px-2 py-0.5 rounded-md bg-[#153E9E] text-white text-[10px] font-bold shadow-sm z-10">
                        {bar.conv} · {bar.spend}
                      </span>
                    )}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${bar.height}%` }}
                      transition={{ duration: 0.65, delay: idx * 0.05 }}
                      className={`w-full max-w-[36px] rounded-full transition-transform ${isHovered ? 'scale-105' : ''
                        } ${bar.active
                          ? bar.highlight
                            ? 'bg-[#153E9E]'
                            : 'bg-[#2A6FE0]'
                          : 'border border-slate-200 dark:border-slate-700'
                        }`}
                      style={
                        !bar.active
                          ? {
                            backgroundImage:
                              'repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(148,163,184,0.22) 4px, rgba(148,163,184,0.22) 7px)',
                          }
                          : undefined
                      }
                    />
                    <span className="text-[11px] font-semibold text-slate-400">{bar.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Autopilot Guard Rules Card (Fills Left Column Height Naturally) */}
          <div className="flex-1 rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Autopilot Guardrails
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Real-time rules protecting margin and scaling winners
                  </p>
                </div>
                <Link
                  href="/campaigns"
                  className="text-xs font-semibold text-[#1E57D0] hover:underline"
                >
                  Configure →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between gap-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rule.enabled
                            ? 'bg-[#E6F1FF] text-[#153E9E]'
                            : 'bg-slate-200 text-slate-600'
                          }`}
                      >
                        {rule.enabled ? 'Active' : 'Paused'}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleRule(rule.id)}
                        aria-label={`Toggle ${rule.name}`}
                        className={`w-8 h-4 rounded-full p-0.5 transition-colors shrink-0 ${rule.enabled ? 'bg-[#1E57D0]' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full bg-white transition-transform ${rule.enabled ? 'translate-x-4' : 'translate-x-0'
                            }`}
                        />
                      </button>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                        {rule.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {rule.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 cols): AI Safety & Action Queue (Fits Cleanly Inside Container) */}
        <div className="lg:col-span-5 min-w-0 rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                AI Safety &amp; Action Queue
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E6F1FF] text-[#153E9E] text-[10px] font-bold shrink-0">
                {openAlerts.length > 0 ? `${openAlerts.length} Open` : 'All Clear'}
              </span>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {initialAlerts.map((alert) => {
                  const isDone = resolvedIds.includes(alert.id);
                  const isFixing = fixingId === alert.id;

                  return (
                    <motion.div
                      key={alert.id}
                      layout
                      className={`p-3.5 rounded-2xl border transition-colors ${isDone
                          ? 'bg-[#E6F1FF]/60 dark:bg-blue-950/30 border-blue-500/20'
                          : 'bg-[#F8FAFC] dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-800'
                        }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[10px] font-bold mb-1">
                        <span
                          className={
                            isDone
                              ? 'text-[#153E9E] dark:text-sky-400'
                              : 'text-amber-700 dark:text-amber-300'
                          }
                        >
                          {isDone ? '✓ Resolved' : alert.category}
                        </span>
                        <span className="text-slate-400 shrink-0">{alert.impact}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug break-words">
                        {alert.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 mb-2.5 leading-relaxed break-words">
                        {isDone ? alert.resolvedLabel : alert.detail}
                      </p>
                      {!isDone && (
                        <button
                          type="button"
                          disabled={isFixing}
                          onClick={() => handleResolveAlert(alert.id)}
                          className="w-full py-2 px-3 rounded-full bg-[#153E9E] hover:bg-[#1E57D0] text-white text-[11px] font-semibold transition-colors"
                        >
                          {isFixing ? 'Applying fix...' : alert.actionLabel}
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM BENTO ROW: Channel Attribution + 70/30 Gauge + Live AI Engine Clock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Cross-Channel Attribution Matrix (5 cols) */}
        <div className="lg:col-span-5 min-w-0 rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Channel Attribution &amp; ROAS
            </h2>
            <Link
              href="/studio"
              className="px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-[#1E57D0]"
            >
              + Launch Ad
            </Link>
          </div>

          <div className="space-y-3">
            {current.channels.map((ch) => (
              <div key={ch.name} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <PlatformMark platform={ch.platform} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {ch.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {ch.conversions} {isExpert ? 'conv.' : 'customers'} · {ch.cpa} CPA · {ch.spend}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {ch.roas}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${ch.status === 'Testing'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                        : 'bg-[#E6F1FF] text-[#153E9E] dark:bg-blue-950/60 dark:text-sky-300'
                      }`}
                  >
                    {ch.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Semi-Circle 70/30 Capital Split Gauge (4 cols) */}
        <div className="lg:col-span-4 min-w-0 rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between items-center text-center">
          <div className="w-full flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              70/30 Budget Allocation
            </h2>
            <span className="text-[11px] font-semibold text-[#1E57D0]">Auto-Balanced</span>
          </div>

          <div className="relative w-44 h-24 flex items-end justify-center my-1">
            <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible">
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="22"
                strokeLinecap="round"
              />
              <motion.path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#1E57D0"
                strokeWidth="22"
                strokeLinecap="round"
                strokeDasharray="251"
                initial={{ strokeDashoffset: 251 }}
                animate={{ strokeDashoffset: 251 * (1 - 0.7) }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute bottom-0 text-center">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white block leading-none">
                70%
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                Proven ({current.provenBudget})
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1E57D0]" /> Proven ({current.provenBudget})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-200" /> Creative Lab ({current.labBudget})
            </span>
          </div>
        </div>

        {/* Dark Navy Live AI Bid & Guard Tracker (3 cols) */}
        <div className="lg:col-span-3 min-w-0 rounded-3xl bg-gradient-to-br from-[#0E1D44] via-[#153E9E] to-[#163F9A] p-5 text-white flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-100">AI Bid &amp; Guard Loop</span>
            <span
              className={`w-2 h-2 rounded-full ${aiRunning ? 'bg-sky-400 animate-ping' : 'bg-amber-400'
                }`}
            />
          </div>

          <div className="my-3 text-center">
            <div className="text-3xl font-bold tracking-wider font-mono">
              {formatTimer(secondsElapsed)}
            </div>
            <p className="text-[10px] text-blue-200/80 mt-1">
              {aiRunning ? 'Scanning 12 active ad sets' : 'Autopilot paused'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setAiRunning(!aiRunning)}
              aria-label={aiRunning ? 'Pause AI Loop' : 'Resume AI Loop'}
              className="w-9 h-9 rounded-full bg-white text-[#153E9E] flex items-center justify-center hover:scale-105 transition-transform shadow"
            >
              {aiRunning ? <Pause size={15} /> : <Play size={15} />}
            </button>
            <button
              type="button"
              onClick={() => {
                setAiRunning(false);
                setSecondsElapsed(0);
              }}
              aria-label="Reset Loop Timer"
              className="w-9 h-9 rounded-full bg-rose-500 text-white flex items-center justify-center hover:scale-105 transition-transform shadow"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}