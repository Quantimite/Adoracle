'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  DollarSign,
  MousePointerClick,
  Play,
  Pause,
  Zap,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useMode } from '@/components/shared/ModeContext';

type PlatformFilter = 'all' | 'meta' | 'tiktok' | 'google' | 'youtube' | 'linkedin';

interface CampaignItem {
  id: string;
  platform: Exclude<PlatformFilter, 'all'>;
  platformLabel: string;
  name: string;
  subtitle: string;
  status: 'Active' | 'Learning' | 'Paused';
  aiPilot: boolean;
  dailyBudget: number;
  totalSpend: number;
  revenueGenerated: number;
  customersWon: number;
  impressions: number;
  clicks: number;
  topPlacement: string;
  topAudience: string;
  aiNote: string;
  dailyTrend: number[];
  historyLog: { date: string; spend: number; revenue: number; buyers: number }[];
}

const INITIAL_CAMPAIGNS: CampaignItem[] = [
  {
    id: 'camp-meta-1',
    platform: 'meta',
    platformLabel: 'Meta & Instagram',
    name: 'Evergreen Catalog & Reels Scaling',
    subtitle: 'Online Sales · Advantage+ Shopping',
    status: 'Active',
    aiPilot: true,
    dailyBudget: 120,
    totalSpend: 876,
    revenueGenerated: 4205,
    customersWon: 48,
    impressions: 64200,
    clicks: 1490,
    topPlacement: 'Facebook Feed (54%) & Instagram Reels (31%)',
    topAudience: '2% Past Buyer Lookalike · Ages 25–44',
    aiNote: 'Shifted +$25/day from Stories into Facebook Feed after return hit 4.8x.',
    dailyTrend: [480, 520, 610, 590, 680, 645, 710],
    historyLog: [
      { date: 'Nov 08', spend: 40, revenue: 110, buyers: 2 },
      { date: 'Nov 09', spend: 45, revenue: 125, buyers: 2 },
      { date: 'Nov 10', spend: 50, revenue: 130, buyers: 2 },
      { date: 'Nov 11', spend: 55, revenue: 145, buyers: 2 },
      { date: 'Nov 12', spend: 60, revenue: 150, buyers: 2 },
      { date: 'Nov 13', spend: 65, revenue: 160, buyers: 2 },
      { date: 'Nov 14', spend: 65, revenue: 169, buyers: 2 },
    ],
  },
  {
    id: 'camp-tiktok-1',
    platform: 'tiktok',
    platformLabel: 'TikTok',
    name: 'Viral Creator Hook Review #12',
    subtitle: 'Product Sales · Spark Ads Mode',
    status: 'Active',
    aiPilot: true,
    dailyBudget: 85,
    totalSpend: 533,
    revenueGenerated: 2718,
    customersWon: 36,
    impressions: 82400,
    clicks: 1940,
    topPlacement: 'TikTok For You Feed (86%) & TikTok Search (14%)',
    topAudience: '#TikTokMadeMeBuyIt · Watched 75%+ Video',
    aiNote: '3-second hook retention at 44% (top 10% benchmark). Smart+ bidding active.',
    dailyTrend: [310, 340, 390, 410, 385, 430, 465],
    historyLog: [
      { date: 'Nov 08', spend: 35, revenue: 100, buyers: 2 },
      { date: 'Nov 09', spend: 40, revenue: 115, buyers: 2 },
      { date: 'Nov 10', spend: 45, revenue: 120, buyers: 2 },
      { date: 'Nov 11', spend: 50, revenue: 135, buyers: 2 },
      { date: 'Nov 12', spend: 55, revenue: 140, buyers: 2 },
      { date: 'Nov 13', spend: 60, revenue: 150, buyers: 2 },
      { date: 'Nov 14', spend: 60, revenue: 160, buyers: 2 },
    ],
  },
  {
    id: 'camp-google-1',
    platform: 'google',
    platformLabel: 'Google Search',
    name: 'High-Intent Category Buyer Keywords',
    subtitle: 'Search Sales · Exact & Phrase Match',
    status: 'Active',
    aiPilot: true,
    dailyBudget: 110,
    totalSpend: 899,
    revenueGenerated: 3956,
    customersWon: 42,
    impressions: 19400,
    clicks: 1120,
    topPlacement: 'Google Search Top #1 Slot (92% Impression Share)',
    topAudience: 'In-Market Active Searchers · Exact Keywords',
    aiNote: 'Negative Keyword Shield blocked 64 irrelevant "free/jobs" clicks ($108 saved).',
    dailyTrend: [510, 540, 530, 580, 595, 601, 630],
    historyLog: [
      { date: 'Nov 08', spend: 50, revenue: 140, buyers: 3 },
      { date: 'Nov 09', spend: 55, revenue: 155, buyers: 3 },
      { date: 'Nov 10', spend: 60, revenue: 170, buyers: 3 },
      { date: 'Nov 11', spend: 65, revenue: 185, buyers: 3 },
      { date: 'Nov 12', spend: 70, revenue: 195, buyers: 3 },
      { date: 'Nov 13', spend: 75, revenue: 210, buyers: 4 },
      { date: 'Nov 14', spend: 75, revenue: 220, buyers: 4 },
    ],
  },
  {
    id: 'camp-linkedin-1',
    platform: 'linkedin',
    platformLabel: 'LinkedIn',
    name: 'Senior VPs & Directors of Growth (US)',
    subtitle: 'B2B Lead Gen · Decision-Maker Filter',
    status: 'Active',
    aiPilot: false,
    dailyBudget: 140,
    totalSpend: 1160,
    revenueGenerated: 7192,
    customersWon: 16,
    impressions: 14800,
    clicks: 385,
    topPlacement: 'LinkedIn Home Feed (Desktop & Mobile)',
    topAudience: 'Director, VP, CXO · 11–500 Employee SaaS/Retail',
    aiNote: 'Audience Network disabled to maintain 100% verified decision-maker lead quality.',
    dailyTrend: [920, 980, 1010, 990, 1080, 1100, 1150],
    historyLog: [
      { date: 'Nov 08', spend: 90, revenue: 420, buyers: 1 },
      { date: 'Nov 09', spend: 100, revenue: 460, buyers: 1 },
      { date: 'Nov 10', spend: 110, revenue: 510, buyers: 2 },
      { date: 'Nov 11', spend: 120, revenue: 550, buyers: 2 },
      { date: 'Nov 12', spend: 130, revenue: 600, buyers: 2 },
      { date: 'Nov 13', spend: 140, revenue: 650, buyers: 2 },
      { date: 'Nov 14', spend: 140, revenue: 680, buyers: 2 },
    ],
  },
];

const PLATFORM_SEGMENT_COLORS: Record<
  Exclude<PlatformFilter, 'all'>,
  { bar: string; text: string; ring: string }
> = {
  meta: { bar: '#38BDF8', text: '#082F49', ring: 'ring-sky-400' },
  linkedin: { bar: '#818CF8', text: '#1E1B4B', ring: 'ring-indigo-400' },
  google: { bar: '#FBBF24', text: '#451A03', ring: 'ring-amber-400' },
  tiktok: { bar: '#FB7185', text: '#4C0519', ring: 'ring-rose-400' },
  youtube: { bar: '#A3E635', text: '#1A2E05', ring: 'ring-lime-400' },
};

function RealPlatformLogo({ id, size = 16 }: { id: Exclude<PlatformFilter, 'all'>; size?: number }) {
  switch (id) {
    case 'meta':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <path
            d="M22.9 9.5C20.5 9.5 18.6 11.2 16.8 14.1L16 15.4L15.2 14.1C13.4 11.2 11.5 9.5 9.1 9.5C5.3 9.5 2.5 12.8 2.5 17.1C2.5 21.1 5.1 23.8 8.7 23.8C11.3 23.8 13.3 22.1 15.3 18.8L16 17.6L16.7 18.8C18.7 22.1 20.7 23.8 23.3 23.8C26.9 23.8 29.5 21.1 29.5 17.1C29.5 12.8 26.7 9.5 22.9 9.5ZM8.8 21.1C6.7 21.1 5.2 19.5 5.2 17.1C5.2 14.4 6.8 12.2 9.1 12.2C10.7 12.2 12.1 13.5 13.7 16.1L14.3 17.1C12.5 19.9 10.8 21.1 8.8 21.1ZM23.2 21.1C21.2 21.1 19.5 19.9 17.7 17.1L18.3 16.1C19.9 13.5 21.3 12.2 22.9 12.2C25.2 12.2 26.8 14.4 26.8 17.1C26.8 19.5 25.3 21.1 23.2 21.1Z"
            fill="#0081FB"
          />
        </svg>
      );
    case 'tiktok':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <path
            d="M21.8 6H18.4V19.6C18.4 21.4 17 22.8 15.2 22.8C13.4 22.8 12 21.4 12 19.6C12 17.9 13.3 16.5 15 16.4V12.9C11.4 13.1 8.6 16 8.6 19.6C8.6 23.3 11.6 26.3 15.3 26.3C19 26.3 22 23.3 22 19.6V12.6C23.3 13.6 24.9 14.2 26.6 14.2V10.8C23.9 10.8 21.8 8.7 21.8 6Z"
            fill="currentColor"
          />
          <path
            d="M22.6 7.1V10.5C24.3 10.5 25.9 9.9 27.2 8.9V12.3C25.5 12.3 23.9 11.7 22.6 10.7V17.7C22.6 21.4 19.6 24.4 15.9 24.4C14.6 24.4 13.4 24 12.4 23.4C13.6 25.1 15.5 26.3 17.7 26.3C21.4 26.3 24.4 23.3 24.4 19.6V12.6C25.7 13.6 27.3 14.2 29 14.2V10.8C26.3 10.8 24.1 9.2 22.6 7.1Z"
            fill="#FE2C55"
          />
        </svg>
      );
    case 'google':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <path
            d="M27.5 16.3C27.5 15.4 27.4 14.6 27.3 13.8H16V18.5H22.5C22.2 20 21.3 21.3 20 22.1V25.2H23.9C26.2 23.1 27.5 20 27.5 16.3Z"
            fill="#4285F4"
          />
          <path
            d="M16 28C19.2 28 21.9 26.9 23.9 25.2L20 22.1C18.9 22.8 17.6 23.3 16 23.3C12.9 23.3 10.3 21.2 9.4 18.4H5.4V21.5C7.4 25.4 11.4 28 16 28Z"
            fill="#34A853"
          />
          <path
            d="M9.4 18.4C9.1 17.7 9 16.9 9 16C9 15.1 9.1 14.3 9.4 13.6V10.5H5.4C4.6 12.1 4.1 14 4.1 16C4.1 18 4.6 19.9 5.4 21.5L9.4 18.4Z"
            fill="#FBBC05"
          />
          <path
            d="M16 8.7C17.8 8.7 19.3 9.3 20.6 10.5L24 7.1C21.9 5.2 19.2 4 16 4C11.4 4 7.4 6.6 5.4 10.5L9.4 13.6C10.3 10.8 12.9 8.7 16 8.7Z"
            fill="#EA4335"
          />
        </svg>
      );
    case 'youtube':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <rect x="3" y="7" width="26" height="18" rx="5.5" fill="#FF0000" />
          <path d="M13.5 12L20.5 16L13.5 20V12Z" fill="white" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <rect x="4" y="4" width="24" height="24" rx="5" fill="#0A66C2" />
          <path
            d="M11.3 13.5H8.5V22.5H11.3V13.5ZM9.9 9.2C9 9.2 8.3 9.9 8.3 10.8C8.3 11.7 9 12.4 9.9 12.4C10.8 12.4 11.5 11.7 11.5 10.8C11.5 9.9 10.8 9.2 9.9 9.2ZM23.5 17.2C23.5 14.6 22.1 13.3 20 13.3C18.4 13.3 17.6 14.2 17.2 14.8V13.5H14.5V22.5H17.3V17.8C17.3 16.6 17.6 15.5 19.1 15.5C20.5 15.5 20.7 16.8 20.7 17.9V22.5H23.5V17.2Z"
            fill="white"
          />
        </svg>
      );
  }
}

function EmeraldBudgetSlider({
  value,
  min = 15,
  max = 400,
  step = 5,
  disabled = false,
  onChange,
}: {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onChange: (val: number) => void;
}) {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className="relative flex items-center w-full h-6 select-none group">
      <div className="w-full h-2 rounded-full bg-emerald-100/90 dark:bg-slate-800 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#114B32] via-[#1B6B48] to-[#10B981]"
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 420, damping: 35 }}
        />
      </div>

      <motion.div
        className="pointer-events-none absolute w-4 h-4 rounded-full bg-[#114B32] border-2 border-white shadow-[0_2px_8px_rgba(17,75,50,0.35)] group-hover:scale-125 transition-transform"
        animate={{ left: `calc(${pct}% - 8px)` }}
        transition={{ type: 'spring', stiffness: 420, damping: 35 }}
      />

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Daily campaign budget"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
    </div>
  );
}

const PLATFORM_TABS: { id: PlatformFilter; label: string }[] = [
  { id: 'all', label: 'All Platforms' },
  { id: 'meta', label: 'Meta & IG' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'google', label: 'Google' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'linkedin', label: 'LinkedIn' },
];

export default function CampaignsAnalyticsPage() {
  const modeContext = useMode() as any;
  const isExpert = Boolean(
    modeContext?.isExpert ?? modeContext?.expertMode ?? modeContext?.mode === 'expert'
  );

  const [campaigns, setCampaigns] = useState<CampaignItem[]>(INITIAL_CAMPAIGNS);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const visibleCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesPlatform =
        selectedPlatform === 'all' || c.platform === selectedPlatform;
      const matchesSearch =
        !searchQuery.trim() ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.platformLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPlatform && matchesSearch;
    });
  }, [campaigns, selectedPlatform, searchQuery]);

  const totalDailyBudget = useMemo(
    () =>
      campaigns.reduce(
        (sum, c) => (c.status !== 'Paused' ? sum + c.dailyBudget : sum),
        0
      ),
    [campaigns]
  );

  const platformBudgetShares = useMemo(() => {
    const platforms: Exclude<PlatformFilter, 'all'>[] = [
      'meta',
      'linkedin',
      'google',
      'tiktok',
      'youtube',
    ];
    const total = totalDailyBudget || 1;
    return platforms.map((p) => {
      const sum = campaigns
        .filter((c) => c.platform === p && c.status !== 'Paused')
        .reduce((acc, c) => acc + c.dailyBudget, 0);
      return {
        id: p,
        label:
          p === 'meta'
            ? 'Meta'
            : p === 'tiktok'
              ? 'TikTok'
              : p === 'google'
                ? 'Google'
                : p === 'youtube'
                  ? 'YouTube'
                  : 'LinkedIn',
        amount: sum,
        pct: Math.round((sum / total) * 100),
        palette: PLATFORM_SEGMENT_COLORS[p],
      };
    });
  }, [campaigns, totalDailyBudget]);

  const handleBudgetChange = (id: string, newBudget: number) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, dailyBudget: newBudget } : c))
    );
  };

  const toggleAiPilot = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, aiPilot: !c.aiPilot } : c))
    );
  };

  const toggleCampaignStatus = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === 'Paused' ? 'Active' : 'Paused' }
          : c
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-7 pb-14"
    >
      {/* HERO DECK */}
      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#092B1C] via-[#114B32] to-[#1B6B48] p-7 sm:p-8 text-white shadow-lg"
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-emerald-200 text-[11px] font-bold">
              <Zap size={12} className="text-emerald-300" />
              <span>Live Multi-Channel Command Center · Pacing 98.4%</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Campaigns &amp; Platform Analytics
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              Click any platform card below to open its dedicated platform-wide management and history dashboard.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="px-5 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">
                Active Daily Budget
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  ${totalDailyBudget}
                </span>
                <span className="text-xs text-emerald-200">/ day</span>
              </div>
            </div>

            <Link
              href="/studio"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-[#072417] text-xs font-extrabold transition-colors shadow-md"
            >
              <Plus size={16} />
              <span>Create New Ad</span>
            </Link>
          </div>
        </div>

        {/* Platform Cards linking to Platform Management Hubs */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/15 space-y-4">
          <div className="flex items-center justify-between text-xs text-emerald-100">
            <span className="font-bold">Platform-Wide Ad Managers</span>
            <span className="text-emerald-200/80 text-[11px]">
              Click any card to open platform management dashboard
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {platformBudgetShares.map((seg) => {
              const isSelected = selectedPlatform === seg.id;
              return (
                <Link
                  key={seg.id}
                  href={`/campaigns/${seg.id}`}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 block hover:brightness-110 ${isSelected
                      ? 'bg-white text-slate-900 border-white shadow-md'
                      : 'bg-white/10 hover:bg-white/15 text-white border-white/15'
                    }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: seg.palette.bar }}
                      />
                      <span className="text-xs font-extrabold">{seg.label}</span>
                    </div>
                    <RealPlatformLogo id={seg.id} size={15} />
                  </div>
                  <div className="flex items-center justify-between w-full pt-1">
                    <span className="text-xs font-extrabold">${seg.amount}/d</span>
                    <span className="text-[10px] font-bold text-emerald-200 flex items-center gap-0.5">
                      Manage Ads <ArrowRight size={10} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* PLATFORM TABS & SEARCH */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 p-1.5 rounded-2xl bg-[#ECFDF5] dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 overflow-x-auto max-w-full">
          {PLATFORM_TABS.map((tab) => {
            const active = selectedPlatform === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedPlatform(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-colors z-10 ${active
                    ? 'text-white'
                    : 'text-[#114B32] dark:text-emerald-300 hover:bg-emerald-100/70'
                  }`}
              >
                {active && (
                  <motion.span
                    layoutId="campaignsGreenTabPill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#114B32] to-[#1B6B48] -z-10 shadow-sm"
                  />
                )}
                {tab.id !== 'all' && <RealPlatformLogo id={tab.id} size={15} />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1B6B48]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1B6B48]"
          />
        </div>
      </div>

      {/* CAMPAIGN ROWS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#114B32] dark:text-emerald-300">
            Active &amp; Scheduled Campaigns ({visibleCampaigns.length})
          </span>
          <span className="text-xs text-slate-400">
            Click campaign title for individual ad management &amp; 7-day history
          </span>
        </div>

        <div className="space-y-4">
          {visibleCampaigns.map((camp, index) => {
            const roas = camp.totalSpend > 0 ? (camp.revenueGenerated / camp.totalSpend).toFixed(1) : '0.0';
            const cpa = camp.customersWon > 0 ? (camp.totalSpend / camp.customersWon).toFixed(2) : '0.00';
            const isPaused = camp.status === 'Paused';

            return (
              <motion.div
                key={camp.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, delay: index * 0.05 }}
                className={`rounded-3xl bg-white dark:bg-slate-900 border transition-colors ${isPaused
                    ? 'border-slate-200/70 opacity-70'
                    : 'border-emerald-200/75 dark:border-slate-800 shadow-[0_2px_12px_rgba(15,23,42,0.02)]'
                  }`}
              >
                <div className="p-6 sm:p-7 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                  {/* Left: Platform Link & Campaign Title Link */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <Link
                      href={`/campaigns/${camp.platform}`}
                      title={`Manage all ${camp.platformLabel} ads`}
                      className="w-12 h-12 rounded-2xl bg-[#ECFDF5] dark:bg-emerald-950/70 border border-emerald-200/70 flex items-center justify-center shrink-0 mt-0.5 hover:bg-emerald-100 transition-colors"
                    >
                      <RealPlatformLogo id={camp.platform} size={22} />
                    </Link>

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <Link
                          href={`/campaigns/${camp.platform}`}
                          className="text-xs font-bold text-[#1B6B48] dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                        >
                          <span>{camp.platformLabel} Dashboard</span>
                          <ExternalLink size={10} />
                        </Link>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500">{camp.subtitle}</span>
                      </div>

                      <Link href={`/campaigns/${camp.id}`} className="group block">
                        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight group-hover:text-[#114B32] transition-colors inline-flex items-center gap-2">
                          <span>{camp.name}</span>
                          <span className="text-xs font-bold text-[#1B6B48] opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 bg-[#ECFDF5] px-2 py-0.5 rounded-full">
                            Manage Ad <ArrowRight size={11} />
                          </span>
                        </h3>
                      </Link>
                    </div>
                  </div>

                  {/* Middle: Metrics */}
                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-6 xl:px-6 xl:border-x border-emerald-100/90 dark:border-slate-800 shrink-0">
                    <div>
                      <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Customers Won</span>
                      <span className="text-lg font-extrabold text-slate-900 dark:text-white">{camp.customersWon}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Cost / Buyer</span>
                      <span className="text-lg font-extrabold text-slate-900 dark:text-white">${cpa}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Total Spent</span>
                      <span className="text-lg font-extrabold text-slate-900 dark:text-white">${camp.totalSpend}</span>
                    </div>
                    <div className="px-3.5 py-2 rounded-2xl bg-[#ECFDF5] dark:bg-emerald-950/60 border border-emerald-200/70">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B6B48] block">Return</span>
                      <span className="text-lg font-extrabold text-[#114B32] dark:text-emerald-300 leading-none">{roas}x</span>
                    </div>
                  </div>

                  {/* Right: Budget slider & Management actions */}
                  <div className="w-full xl:w-72 space-y-3 shrink-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">Daily Budget</span>
                      <span className="text-sm font-extrabold text-[#114B32] dark:text-emerald-400">
                        ${camp.dailyBudget}/day
                      </span>
                    </div>

                    <EmeraldBudgetSlider
                      value={camp.dailyBudget}
                      disabled={isPaused}
                      onChange={(val) => handleBudgetChange(camp.id, val)}
                    />

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => toggleAiPilot(camp.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors ${camp.aiPilot ? 'bg-[#ECFDF5] text-[#114B32] border border-emerald-200' : 'bg-slate-100 text-slate-500'
                          }`}
                      >
                        <Sparkles size={12} />
                        <span>{camp.aiPilot ? 'AI Auto' : 'Manual'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleCampaignStatus(camp.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5"
                      >
                        {isPaused ? <Play size={12} /> : <Pause size={12} />}
                        <span>{isPaused ? 'Resume' : 'Pause'}</span>
                      </button>

                      <Link
                        href={`/campaigns/${camp.id}`}
                        className="px-4 py-1.5 rounded-xl bg-[#114B32] hover:bg-[#1B6B48] text-white text-xs font-bold inline-flex items-center gap-1 transition-colors"
                      >
                        <span>Manage</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}