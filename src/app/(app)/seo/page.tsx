// src/app/(app)/seo/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Wrench,
  Activity,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  Search,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Users,
  MapPin,
  Layers,
  Eye,
  Clock,
  Sparkles,
  FileText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface PageBreakdown {
  path: string;
  title: string;
  status: 'Healthy' | 'Warning' | 'Critical';
  views30d: string;
  uniqueVisitors: string;
  avgTimeOnPage: string;
  bounceRate: string;
  conversionRate: string;
  newVsReturning: { newPct: number; returningPct: number };
  genderSplit: { label: string; pct: number; color: string }[];
  ageGroups: { range: string; pct: number }[];
  topCountries: { country: string; code: string; share: number; convRate: string }[];
  deviceSplit: { name: string; value: number; color: string }[];
  retentionCurve: { section: string; retained: number; benchmark: number }[];
  trafficSources: { source: string; share: number; color: string }[];
  lcpMobile: string;
  inpMobile: string;
  clsMobile: string;
  aiOverviewCited: boolean;
}

const pageAnalyticsData: PageBreakdown[] = [
  {
    path: '/pricing',
    title: 'Pricing & Plans — Adoracle',
    status: 'Healthy',
    views30d: '42,810',
    uniqueVisitors: '31,420',
    avgTimeOnPage: '02:48',
    bounceRate: '24.1%',
    conversionRate: '6.8%',
    newVsReturning: { newPct: 62, returningPct: 38 },
    genderSplit: [
      { label: 'Male', pct: 58, color: 'bg-emerald-500' },
      { label: 'Female', pct: 39, color: 'bg-purple-500' },
      { label: 'Other / Undisclosed', pct: 3, color: 'bg-slate-400' },
    ],
    ageGroups: [
      { range: '18–24', pct: 14 },
      { range: '25–34', pct: 44 },
      { range: '35–44', pct: 28 },
      { range: '45–54', pct: 10 },
      { range: '55+', pct: 4 },
    ],
    topCountries: [
      { country: 'United States', code: 'US', share: 46, convRate: '7.4%' },
      { country: 'United Kingdom', code: 'UK', share: 18, convRate: '6.9%' },
      { country: 'Canada', code: 'CA', share: 12, convRate: '6.2%' },
      { country: 'Australia', code: 'AU', share: 9, convRate: '5.8%' },
      { country: 'Germany', code: 'DE', share: 8, convRate: '5.1%' },
    ],
    deviceSplit: [
      { name: 'Desktop', value: 56, color: '#10b981' },
      { name: 'Mobile', value: 39, color: '#8b5cf6' },
      { name: 'Tablet', value: 5, color: '#f59e0b' },
    ],
    retentionCurve: [
      { section: 'Hero (0%)', retained: 100, benchmark: 100 },
      { section: 'Tier Cards (25%)', retained: 84, benchmark: 76 },
      { section: 'ROI Calc (50%)', retained: 71, benchmark: 58 },
      { section: 'Feature Matrix (75%)', retained: 54, benchmark: 42 },
      { section: 'FAQ & Footer (100%)', retained: 39, benchmark: 28 },
    ],
    trafficSources: [
      { source: 'Paid Search & Social', share: 48, color: 'bg-emerald-500' },
      { source: 'Organic Google Search', share: 31, color: 'bg-blue-500' },
      { source: 'AI Overviews / LLMs', share: 13, color: 'bg-purple-500' },
      { source: 'Direct & Referral', share: 8, color: 'bg-amber-500' },
    ],
    lcpMobile: '1.3s',
    inpMobile: '38ms',
    clsMobile: '0.01',
    aiOverviewCited: true,
  },
  {
    path: '/',
    title: 'Homepage — Cross-Platform Ad Intelligence',
    status: 'Healthy',
    views30d: '94,120',
    uniqueVisitors: '72,890',
    avgTimeOnPage: '02:14',
    bounceRate: '31.4%',
    conversionRate: '4.9%',
    newVsReturning: { newPct: 74, returningPct: 26 },
    genderSplit: [
      { label: 'Male', pct: 54, color: 'bg-emerald-500' },
      { label: 'Female', pct: 43, color: 'bg-purple-500' },
      { label: 'Other / Undisclosed', pct: 3, color: 'bg-slate-400' },
    ],
    ageGroups: [
      { range: '18–24', pct: 19 },
      { range: '25–34', pct: 41 },
      { range: '35–44', pct: 24 },
      { range: '45–54', pct: 11 },
      { range: '55+', pct: 5 },
    ],
    topCountries: [
      { country: 'United States', code: 'US', share: 42, convRate: '5.3%' },
      { country: 'United Kingdom', code: 'UK', share: 16, convRate: '4.8%' },
      { country: 'India', code: 'IN', share: 14, convRate: '3.9%' },
      { country: 'Canada', code: 'CA', share: 11, convRate: '5.1%' },
      { country: 'Singapore', code: 'SG', share: 7, convRate: '6.0%' },
    ],
    deviceSplit: [
      { name: 'Mobile', value: 52, color: '#8b5cf6' },
      { name: 'Desktop', value: 43, color: '#10b981' },
      { name: 'Tablet', value: 5, color: '#f59e0b' },
    ],
    retentionCurve: [
      { section: 'Hero (0%)', retained: 100, benchmark: 100 },
      { section: 'Social Proof (25%)', retained: 79, benchmark: 74 },
      { section: 'Live Demo (50%)', retained: 63, benchmark: 55 },
      { section: 'Integrations (75%)', retained: 46, benchmark: 39 },
      { section: 'Bottom CTA (100%)', retained: 31, benchmark: 25 },
    ],
    trafficSources: [
      { source: 'Organic Google Search', share: 44, color: 'bg-blue-500' },
      { source: 'Paid Search & Social', share: 34, color: 'bg-emerald-500' },
      { source: 'AI Overviews / LLMs', share: 14, color: 'bg-purple-500' },
      { source: 'Direct & Referral', share: 8, color: 'bg-amber-500' },
    ],
    lcpMobile: '1.5s',
    inpMobile: '45ms',
    clsMobile: '0.02',
    aiOverviewCited: true,
  },
  {
    path: '/checkout/v2',
    title: 'Checkout Flow v2 — Subscription Activation',
    status: 'Critical',
    views30d: '11,490',
    uniqueVisitors: '9,810',
    avgTimeOnPage: '01:05',
    bounceRate: '58.2%',
    conversionRate: '2.1%',
    newVsReturning: { newPct: 48, returningPct: 52 },
    genderSplit: [
      { label: 'Male', pct: 61, color: 'bg-emerald-500' },
      { label: 'Female', pct: 37, color: 'bg-purple-500' },
      { label: 'Other / Undisclosed', pct: 2, color: 'bg-slate-400' },
    ],
    ageGroups: [
      { range: '18–24', pct: 11 },
      { range: '25–34', pct: 47 },
      { range: '35–44', pct: 29 },
      { range: '45–54', pct: 9 },
      { range: '55+', pct: 4 },
    ],
    topCountries: [
      { country: 'United States', code: 'US', share: 51, convRate: '2.4%' },
      { country: 'United Kingdom', code: 'UK', share: 19, convRate: '2.1%' },
      { country: 'Canada', code: 'CA', share: 11, convRate: '1.9%' },
      { country: 'Australia', code: 'AU', share: 8, convRate: '1.7%' },
      { country: 'Netherlands', code: 'NL', share: 5, convRate: '2.2%' },
    ],
    deviceSplit: [
      { name: 'Mobile', value: 64, color: '#8b5cf6' },
      { name: 'Desktop', value: 32, color: '#10b981' },
      { name: 'Tablet', value: 4, color: '#f59e0b' },
    ],
    retentionCurve: [
      { section: 'Load (0%)', retained: 100, benchmark: 100 },
      { section: 'Plan Summary (25%)', retained: 68, benchmark: 82 },
      { section: 'Payment Form (50%)', retained: 41, benchmark: 69 },
      { section: 'Redirect / Pay (75%)', retained: 19, benchmark: 58 },
      { section: 'Confirmation (100%)', retained: 14, benchmark: 51 },
    ],
    trafficSources: [
      { source: 'Paid Search & Social', share: 62, color: 'bg-emerald-500' },
      { source: 'Direct & Referral', share: 22, color: 'bg-amber-500' },
      { source: 'Organic Google Search', share: 14, color: 'bg-blue-500' },
      { source: 'AI Overviews / LLMs', share: 2, color: 'bg-purple-500' },
    ],
    lcpMobile: '2.7s',
    inpMobile: '185ms',
    clsMobile: '0.09',
    aiOverviewCited: false,
  },
  {
    path: '/features/ai-studio',
    title: 'AI Intelligence Studio — Autonomous Bidding',
    status: 'Warning',
    views30d: '28,640',
    uniqueVisitors: '21,300',
    avgTimeOnPage: '03:19',
    bounceRate: '27.8%',
    conversionRate: '5.6%',
    newVsReturning: { newPct: 68, returningPct: 32 },
    genderSplit: [
      { label: 'Male', pct: 63, color: 'bg-emerald-500' },
      { label: 'Female', pct: 34, color: 'bg-purple-500' },
      { label: 'Other / Undisclosed', pct: 3, color: 'bg-slate-400' },
    ],
    ageGroups: [
      { range: '18–24', pct: 16 },
      { range: '25–34', pct: 49 },
      { range: '35–44', pct: 23 },
      { range: '45–54', pct: 8 },
      { range: '55+', pct: 4 },
    ],
    topCountries: [
      { country: 'United States', code: 'US', share: 48, convRate: '6.1%' },
      { country: 'United Kingdom', code: 'UK', share: 17, convRate: '5.5%' },
      { country: 'Germany', code: 'DE', share: 12, convRate: '5.2%' },
      { country: 'Canada', code: 'CA', share: 10, convRate: '5.4%' },
      { country: 'UAE', code: 'AE', share: 6, convRate: '6.3%' },
    ],
    deviceSplit: [
      { name: 'Desktop', value: 61, color: '#10b981' },
      { name: 'Mobile', value: 35, color: '#8b5cf6' },
      { name: 'Tablet', value: 4, color: '#f59e0b' },
    ],
    retentionCurve: [
      { section: 'Hero (0%)', retained: 100, benchmark: 100 },
      { section: 'Co-Pilot Tour (25%)', retained: 82, benchmark: 75 },
      { section: 'ROAS Simulator (50%)', retained: 69, benchmark: 57 },
      { section: 'Case Studies (75%)', retained: 51, benchmark: 40 },
      { section: 'Footer CTA (100%)', retained: 35, benchmark: 26 },
    ],
    trafficSources: [
      { source: 'AI Overviews / LLMs', share: 36, color: 'bg-purple-500' },
      { source: 'Organic Google Search', share: 33, color: 'bg-blue-500' },
      { source: 'Paid Search & Social', share: 23, color: 'bg-emerald-500' },
      { source: 'Direct & Referral', share: 8, color: 'bg-amber-500' },
    ],
    lcpMobile: '1.9s',
    inpMobile: '92ms',
    clsMobile: '0.04',
    aiOverviewCited: true,
  },
];

interface KeywordRow {
  term: string;
  monthlySearches: string;
  rank: number;
  change: number;
  converts: string;
  aiOverview: boolean;
}

const initialKeywords: KeywordRow[] = [
  {
    term: 'cross platform ad manager',
    monthlySearches: '18,200',
    rank: 3,
    change: 2,
    converts: '5.4%',
    aiOverview: true,
  },
  {
    term: 'ai ad budget optimization',
    monthlySearches: '14,500',
    rank: 2,
    change: 1,
    converts: '6.8%',
    aiOverview: true,
  },
  {
    term: 'meta vs tiktok ad manager',
    monthlySearches: '9,800',
    rank: 5,
    change: -1,
    converts: '4.1%',
    aiOverview: false,
  },
  {
    term: 'b2b linkedin cpa benchmarks',
    monthlySearches: '6,400',
    rank: 4,
    change: 3,
    converts: '7.2%',
    aiOverview: true,
  },
  {
    term: '70 30 ad budget strategy',
    monthlySearches: '5,100',
    rank: 1,
    change: 0,
    converts: '8.9%',
    aiOverview: true,
  },
];

export default function SEOSafetyPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [isFixing, setIsFixing] = useState(false);
  const [issuesFixed, setIssuesFixed] = useState(false);
  const [selectedPagePath, setSelectedPagePath] = useState<string>('/pricing');
  const [activeStudioTab, setActiveStudioTab] = useState<'audience' | 'engagement' | 'technical'>('audience');
  const [deviceView, setDeviceView] = useState<'mobile' | 'desktop'>('mobile');
  const [keywordFilter, setKeywordFilter] = useState('');
  const [scanUrl, setScanUrl] = useState('https://adoracle.ai/checkout/v2');
  const [isScanningUrl, setIsScanningUrl] = useState(false);
  const [urlScanFeedback, setUrlScanFeedback] = useState<string | null>(null);

  const selectedPage =
    pageAnalyticsData.find((p) => p.path === selectedPagePath) || pageAnalyticsData[0];

  const siteScore = issuesFixed ? 98 : 88;
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (siteScore / 100) * circumference;

  const handleAutoFix = () => {
    setIsFixing(true);
    setTimeout(() => {
      setIsFixing(false);
      setIssuesFixed(true);
    }, 1100);
  };

  const handleUrlCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanUrl.trim()) return;
    setIsScanningUrl(true);
    setUrlScanFeedback(null);

    setTimeout(() => {
      setIsScanningUrl(false);
      setUrlScanFeedback(
        `200 OK • SSL Valid • CrUX Field Data Healthy • Meta & Google CAPI firing on ${scanUrl}`
      );
    }, 850);
  };

  const filteredKeywords = initialKeywords.filter((item) =>
    item.term.toLowerCase().includes(keywordFilter.toLowerCase())
  );

  return (
    <div className="w-full space-y-6 text-slate-900 dark:text-slate-100">
      {/* Header & Live URL Pre-Flight Scanner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            SEO & Pre-Launch Safety
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deep audience demographics, device splits, retention curves, and destination link safety
          </p>
        </div>

        <form
          onSubmit={handleUrlCheck}
          className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-1.5 shadow-2xs"
        >
          <div className="flex items-center gap-2 pl-2.5 text-slate-400">
            <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <input
              type="text"
              value={scanUrl}
              onChange={(e) => setScanUrl(e.target.value)}
              placeholder="Audit any landing page URL..."
              className="bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none w-44 sm:w-56"
            />
          </div>
          <button
            type="submit"
            disabled={isScanningUrl}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 text-xs font-bold transition-colors shrink-0 cursor-pointer"
          >
            {isScanningUrl ? 'Auditing...' : 'Audit URL'}
          </button>
        </form>
      </div>

      {urlScanFeedback && (
        <div className="px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            {urlScanFeedback}
          </span>
          <button
            onClick={() => setUrlScanFeedback(null)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Critical Pre-Launch Alert Banner */}
      {!issuesFixed ? (
        <div className="rounded-2xl bg-[#FDF2F2] dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-500/30 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#E12D39] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>

            <div className="space-y-2">
              <div>
                <h2 className="text-sm font-extrabold text-rose-950 dark:text-rose-200">
                  ⚠️ 2 broken links found — don&apos;t spend on ads yet!
                </h2>
                <p className="text-xs text-rose-700 dark:text-rose-300/90 mt-0.5">
                  Your checkout page returns a 404 error. Any ad clicks right now will be wasted money.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <code className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-500/30 text-[11px] font-mono font-semibold text-rose-700 dark:text-rose-300">
                  404: /checkout/v2/pay
                </code>
                <code className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-500/30 text-[11px] font-mono font-semibold text-rose-700 dark:text-rose-300">
                  301 Loop: /lp/black-friday
                </code>
              </div>
            </div>
          </div>

          <button
            onClick={handleAutoFix}
            disabled={isFixing}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#E12D39] hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer disabled:opacity-70"
          >
            {isFixing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Repairing Redirects...
              </>
            ) : (
              <>
                <Wrench className="w-3.5 h-3.5" /> Auto-Fix Now
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-200">
                All destination URLs verified — Safe to launch campaigns!
              </h2>
              <p className="text-xs text-emerald-700 dark:text-emerald-300/90 mt-0.5">
                301 redirects applied for <code className="font-mono">/checkout/v2/pay</code> and{' '}
                <code className="font-mono">/lp/black-friday</code>. Zero dead clicks detected.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIssuesFixed(false)}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0"
          >
            Reset Alert
          </button>
        </div>
      )}

      {/* 4-Card Top Overview Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Site Health Score */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-2xs">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                className="text-slate-100 dark:text-slate-800"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="text-[#169C69] transition-all duration-700 ease-out"
              />
            </svg>
            <span className="absolute text-xl font-black text-slate-900 dark:text-white">
              {siteScore}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
            Site Health Score
          </p>
          <span className="text-xs font-extrabold text-[#169C69] mt-0.5">
            {siteScore >= 95 ? 'Optimal' : 'Excellent'}
          </span>
        </div>

        {/* Card 2: Core Web Vitals */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <Activity className="w-3.5 h-3.5 text-[#169C69]" /> Core Web Vitals
            </span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
              <button
                onClick={() => setDeviceView('mobile')}
                className={`p-1 rounded-md transition-colors ${deviceView === 'mobile'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-2xs'
                  : 'text-slate-400'
                  }`}
                title="Mobile Field Data"
              >
                <Smartphone className="w-3 h-3" />
              </button>
              <button
                onClick={() => setDeviceView('desktop')}
                className={`p-1 rounded-md transition-colors ${deviceView === 'desktop'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-2xs'
                  : 'text-slate-400'
                  }`}
                title="Desktop Field Data"
              >
                <Monitor className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="space-y-2 my-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">LCP</span>
              <span className="font-bold text-[#169C69]">
                {deviceView === 'mobile' ? '1.4s ✓' : '0.9s ✓'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">INP</span>
              <span className="font-bold text-[#169C69]">
                {deviceView === 'mobile' ? '42ms ✓' : '24ms ✓'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">CLS</span>
              <span className="font-bold text-[#169C69]">
                {deviceView === 'mobile' ? '0.02 ✓' : '0.00 ✓'}
              </span>
            </div>
          </div>

          <div className="text-xs font-extrabold text-[#169C69]">3/3 Passed</div>
        </div>

        {/* Card 3: Organic Clicks */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Organic Clicks
            </span>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
              14,820
            </div>
            <p className="text-xs text-slate-400 mt-1">30-day total</p>
          </div>

          <div className="pt-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-[#169C69] text-[11px] font-extrabold">
              <ArrowUpRight className="w-3.5 h-3.5" /> +18.4% MoM
            </span>
          </div>
        </div>

        {/* Card 4: Search Impressions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Search Impressions
            </span>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
              248k
            </div>
            <p className="text-xs text-slate-400 mt-1">30-day total</p>
          </div>

          <div className="pt-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-[#169C69] text-[11px] font-extrabold">
              <ArrowUpRight className="w-3.5 h-3.5" /> +24.1% MoM
            </span>
          </div>
        </div>
      </div>

      {/* YOUTUBE STUDIO STYLE: DEEP PAGE & AUDIENCE ANALYTICS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-2xs space-y-6">
        {/* Page Picker Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" /> YouTube-Style Page Analytics
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
              Inspecting Web Page: <code className="text-emerald-600 dark:text-emerald-400">{selectedPage.path}</code>
            </h2>
          </div>

          {/* Interactive Page Selector Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {pageAnalyticsData.map((page) => {
              const isSelected = page.path === selectedPage.path;
              const effectiveStatus =
                page.path === '/checkout/v2' && issuesFixed ? 'Healthy' : page.status;

              return (
                <button
                  key={page.path}
                  onClick={() => setSelectedPagePath(page.path)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer ${isSelected
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                    }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${effectiveStatus === 'Healthy'
                      ? 'bg-emerald-500'
                      : effectiveStatus === 'Warning'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                      }`}
                  />
                  {page.path}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Page Key Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-blue-500" /> Views (30d)
            </span>
            <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
              {selectedPage.views30d}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-purple-500" /> Unique Visitors
            </span>
            <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
              {selectedPage.uniqueVisitors}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> Avg. Watch/Dwell
            </span>
            <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
              {selectedPage.avgTimeOnPage}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500">Bounce Rate</span>
            <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
              {selectedPage.bounceRate}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500">Conv. Rate</span>
            <div className="text-lg font-black text-[#169C69] mt-1">
              {selectedPage.conversionRate}
            </div>
          </div>
        </div>

        {/* YouTube Studio Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveStudioTab('audience')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${activeStudioTab === 'audience'
              ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-2xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
          >
            Audience (Gender, Age, Country & Device)
          </button>
          <button
            onClick={() => setActiveStudioTab('engagement')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${activeStudioTab === 'engagement'
              ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-2xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
          >
            Engagement & Visitor Retention Curve
          </button>
          <button
            onClick={() => setActiveStudioTab('technical')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${activeStudioTab === 'technical'
              ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-2xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
          >
            Technical & AI Search Audit
          </button>
        </div>

        {/* TAB 1: FULL AUDIENCE BREAKDOWNS (GENDER, AGE, COUNTRY, DEVICE, NEW VS RETURNING) */}
        {activeStudioTab === 'audience' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
            {/* 1. Top Countries Breakdown (5 Columns) */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Top Geographies
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Visitor share & conversion rate by country
                  </p>
                </div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Conv. Rate</span>
              </div>

              <div className="space-y-3">
                {selectedPage.topCountries.map((item) => (
                  <div key={item.country} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-[10px] font-extrabold text-slate-600 dark:text-slate-300">
                          {item.code}
                        </span>
                        {item.country}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          {item.share}%
                        </span>
                        <span className="text-[11px] font-bold text-[#169C69] w-10 text-right">
                          {item.convRate}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${item.share}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Age & Gender Demographics (4 Columns) */}
            <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between space-y-5">
              {/* Gender Split */}
              <div className="space-y-2.5">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Gender & Age Split
                </h3>
                <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-800">
                  {selectedPage.genderSplit.map((g) => (
                    <div
                      key={g.label}
                      className={`${g.color} h-full`}
                      style={{ width: `${g.pct}%` }}
                      title={`${g.label}: ${g.pct}%`}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  {selectedPage.genderSplit.map((g) => (
                    <span key={g.label} className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
                      <span className={`w-2 h-2 rounded-full ${g.color}`} />
                      {g.label}: <strong>{g.pct}%</strong>
                    </span>
                  ))}
                </div>
              </div>

              {/* Age Groups Bar Chart */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Age Distribution
                </span>
                <div className="h-36 w-full">
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={selectedPage.ageGroups} layout="vertical" margin={{ left: -15, right: 15 }}>
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="range"
                          type="category"
                          width={55}
                          tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#1e293b',
                            borderRadius: '0.75rem',
                            color: '#f8fafc',
                            fontSize: '11px',
                          }}
                        />
                        <Bar dataKey="pct" name="Share (%)" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={14} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : null}
                </div>
              </div>
            </div>

            {/* 3. Device Type & New vs Returning Visitors (3 Columns) */}
            <div className="lg:col-span-3 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Device Breakdown
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Sessions by hardware type
                </p>

                <div className="h-36 w-full flex items-center justify-center">
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={selectedPage.deviceSplit}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={32}
                          outerRadius={52}
                          paddingAngle={4}
                        >
                          {selectedPage.deviceSplit.map((entry, idx) => (
                            <Cell key={`dev-${idx}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#1e293b',
                            borderRadius: '0.75rem',
                            color: '#f8fafc',
                            fontSize: '11px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : null}
                </div>

                <div className="space-y-1.5 text-xs">
                  {selectedPage.deviceSplit.map((dev) => (
                    <div key={dev.name} className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                        {dev.name === 'Mobile' && <Smartphone className="w-3.5 h-3.5 text-purple-500" />}
                        {dev.name === 'Desktop' && <Monitor className="w-3.5 h-3.5 text-emerald-500" />}
                        {dev.name === 'Tablet' && <Tablet className="w-3.5 h-3.5 text-amber-500" />}
                        {dev.name}
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-white">{dev.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* New vs Returning Bar */}
              <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800 space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-emerald-600 dark:text-emerald-400">
                    New {selectedPage.newVsReturning.newPct}%
                  </span>
                  <span className="text-purple-600 dark:text-purple-400">
                    Returning {selectedPage.newVsReturning.returningPct}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden flex bg-purple-500">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${selectedPage.newVsReturning.newPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VISITOR RETENTION CURVE + TRAFFIC SOURCES */}
        {activeStudioTab === 'engagement' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Visitor Scroll & Attention Retention
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Percentage of ad clicks still engaged down the page vs. industry benchmark
                  </p>
                </div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  ● This Page &nbsp; <span className="text-slate-400">--- Benchmark</span>
                </span>
              </div>

              <div className="h-60 w-full pt-2">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedPage.retentionCurve}>
                      <defs>
                        <linearGradient id="retentionFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#169C69" stopOpacity={0.28} />
                          <stop offset="95%" stopColor="#169C69" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="section" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} unit="%" domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#1e293b',
                          borderRadius: '0.75rem',
                          color: '#f8fafc',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="benchmark"
                        name="Industry Avg (%)"
                        stroke="#94a3b8"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        fill="transparent"
                      />
                      <Area
                        type="monotone"
                        dataKey="retained"
                        name="Visitor Retention (%)"
                        stroke="#169C69"
                        strokeWidth={3}
                        fill="url(#retentionFill)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : null}
              </div>
            </div>

            <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  How Visitors Find This Page
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Traffic source distribution over the last 30 days
                </p>
              </div>

              <div className="space-y-3.5">
                {selectedPage.trafficSources.map((src) => (
                  <div key={src.source} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-300">{src.source}</span>
                      <span className="text-slate-900 dark:text-white">{src.share}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${src.color}`}
                        style={{ width: `${src.share}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TECHNICAL & AI SEARCH AUDIT */}
        {activeStudioTab === 'technical' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 space-y-2">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                Mobile CrUX Field Vitals
              </span>
              <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Largest Contentful Paint (LCP):</span>
                  <strong className="text-slate-900 dark:text-white">{selectedPage.lcpMobile}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Interaction to Next Paint (INP):</span>
                  <strong className="text-slate-900 dark:text-white">{selectedPage.inpMobile}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Cumulative Layout Shift (CLS):</span>
                  <strong className="text-slate-900 dark:text-white">{selectedPage.clsMobile}</strong>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 space-y-2">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" /> AI Search & LLM Visibility
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedPage.aiOverviewCited
                  ? 'Indexed and actively cited in Google AI Overviews and conversational search answers.'
                  : 'Not yet cited in AI Overviews — add structured FAQ schema and faster mobile LCP.'}
              </p>
              <span
                className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full ${selectedPage.aiOverviewCited
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}
              >
                {selectedPage.aiOverviewCited ? 'AI Overview Eligible' : 'Needs Schema Optimization'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 space-y-2">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-500" /> On-Page Meta & Tracking
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                {selectedPage.title}
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ Canonical Tag Valid • ✓ Meta Pixel & GA4 Verified
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Keyword Rankings Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Keyword Rankings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Your target search terms, AI Overview presence, and conversion rates
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={keywordFilter}
              onChange={(e) => setKeywordFilter(e.target.value)}
              placeholder="Filter search terms..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pr-4">Search Term</th>
                <th className="pb-3 px-4">Monthly Searches</th>
                <th className="pb-3 px-4">Rank</th>
                <th className="pb-3 px-4">Change</th>
                <th className="pb-3 px-4">AI Overview</th>
                <th className="pb-3 pl-4 text-right">Converts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {filteredKeywords.map((row) => (
                <tr
                  key={row.term}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-4 pr-4 font-bold text-slate-900 dark:text-white">
                    {row.term}
                  </td>
                  <td className="py-4 px-4 text-slate-500 dark:text-slate-400 font-medium">
                    {row.monthlySearches}
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-[11px]">
                      #{row.rank}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold">
                    {row.change > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[#169C69]">
                        <ArrowUpRight className="w-3.5 h-3.5" /> +{row.change}
                      </span>
                    )}
                    {row.change < 0 && (
                      <span className="inline-flex items-center gap-0.5 text-rose-500">
                        <ArrowDownRight className="w-3.5 h-3.5" /> {row.change}
                      </span>
                    )}
                    {row.change === 0 && (
                      <span className="inline-flex items-center text-slate-400">
                        <Minus className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {row.aiOverview ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-extrabold">
                        <Sparkles className="w-2.5 h-2.5" /> Cited
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-4 pl-4 text-right font-extrabold text-[#169C69]">
                    {row.converts}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}