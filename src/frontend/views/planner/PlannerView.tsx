'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Sparkles,
  ArrowRight,
  Check,
  AlertTriangle,
  BarChart3,
  PlusCircle,
  SlidersHorizontal,
  Users,
  ShoppingBag,
  Search,
  Smartphone,
} from 'lucide-react';

type PlatformId = 'meta' | 'tiktok' | 'youtube' | 'google' | 'linkedin';

interface PlatformConfig {
  id: PlatformId;
  name: string;
  shortName: string;
  studioHref: string;
  tagline: string;
  simpleSummary: string;
  matchScoreB2C: number;
  matchScoreB2B: number;
  weight: number;
  bucket: 'Core Winners (70%)' | 'Growth Testing (30%)';
  avgCostPerCustomer: string;
  estimatedReach: string;
  bestAdFormat: string;
  cautionB2C?: string;
}

const PLATFORMS: PlatformConfig[] = [
  {
    id: 'meta',
    name: 'Meta & Instagram',
    shortName: 'Meta',
    studioHref: '/builder?platform=META',
    tagline: 'Facebook Feed, Reels & Instagram Stories',
    simpleSummary:
      'Great for showing visual product photos and short videos to people scrolling on their phones.',
    matchScoreB2C: 97,
    matchScoreB2B: 64,
    weight: 0.42,
    bucket: 'Core Winners (70%)',
    avgCostPerCustomer: '$19 – $24',
    estimatedReach: '48,000+ local & national shoppers',
    bestAdFormat: 'Carousel & 15-sec Vertical Reels',
  },
  {
    id: 'tiktok',
    name: 'TikTok Ads & Spark',
    shortName: 'TikTok',
    studioHref: '/builder?platform=TIKTOK',
    tagline: 'Short-Form Creator & Viral Discovery Videos',
    simpleSummary:
      'Turns authentic, casual phone-shot videos into fast impulse purchases from younger buyers.',
    matchScoreB2C: 94,
    matchScoreB2B: 42,
    weight: 0.28,
    bucket: 'Core Winners (70%)',
    avgCostPerCustomer: '$21 – $27',
    estimatedReach: '62,000+ active video viewers',
    bestAdFormat: 'Creator-Style Spark Video (9:16)',
  },
  {
    id: 'youtube',
    name: 'YouTube Shorts & Video',
    shortName: 'YouTube',
    studioHref: '/builder?platform=YOUTUBE',
    tagline: 'YouTube Shorts & Pre-Video Product Demos',
    simpleSummary:
      'Builds strong trust by showing how your product works in quick 20-second video demonstrations.',
    matchScoreB2C: 84,
    matchScoreB2B: 76,
    weight: 0.18,
    bucket: 'Growth Testing (30%)',
    avgCostPerCustomer: '$25 – $31',
    estimatedReach: '35,000+ engaged viewers',
    bestAdFormat: 'YouTube Shorts Hook Video',
  },
  {
    id: 'google',
    name: 'Google Search & Shopping',
    shortName: 'Google',
    studioHref: '/builder?platform=GOOGLE',
    tagline: 'Top Search Results When Buyers Type What You Sell',
    simpleSummary:
      'Captures ready-to-buy customers the exact moment they search for your product on Google.',
    matchScoreB2C: 81,
    matchScoreB2B: 93,
    weight: 0.12,
    bucket: 'Growth Testing (30%)',
    avgCostPerCustomer: '$17 – $22',
    estimatedReach: '14,500+ high-intent searches',
    bestAdFormat: 'Search Text + Product Shopping Card',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Ads',
    shortName: 'LinkedIn',
    studioHref: '/builder?platform=LINKEDIN',
    tagline: 'Reach Company Founders, Managers & Decision Makers',
    simpleSummary:
      'Targets professionals by job title, company size, and industry—ideal for business services.',
    matchScoreB2C: 14,
    matchScoreB2B: 96,
    weight: 0.35,
    bucket: 'Core Winners (70%)',
    avgCostPerCustomer: '$45 – $65',
    estimatedReach: '9,200+ verified professionals',
    bestAdFormat: 'Sponsored Insight Post & Lead Form',
    cautionB2C:
      'Not recommended for everyday consumer products—clicks cost 5× more than Meta or TikTok.',
  },
];

/* Official Brand SVG Logos */
function RealPlatformLogo({ id, size = 24 }: { id: PlatformId; size?: number }) {
  switch (id) {
    case 'meta':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <defs>
            <linearGradient id="metaGrad" x1="2" y1="8" x2="30" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0081FB" />
              <stop offset="1" stopColor="#0064E0" />
            </linearGradient>
          </defs>
          <path
            d="M22.9 9.5C20.5 9.5 18.6 11.2 16.8 14.1L16 15.4L15.2 14.1C13.4 11.2 11.5 9.5 9.1 9.5C5.3 9.5 2.5 12.8 2.5 17.1C2.5 21.1 5.1 23.8 8.7 23.8C11.3 23.8 13.3 22.1 15.3 18.8L16 17.6L16.7 18.8C18.7 22.1 20.7 23.8 23.3 23.8C26.9 23.8 29.5 21.1 29.5 17.1C29.5 12.8 26.7 9.5 22.9 9.5ZM8.8 21.1C6.7 21.1 5.2 19.5 5.2 17.1C5.2 14.4 6.8 12.2 9.1 12.2C10.7 12.2 12.1 13.5 13.7 16.1L14.3 17.1C12.5 19.9 10.8 21.1 8.8 21.1ZM23.2 21.1C21.2 21.1 19.5 19.9 17.7 17.1L18.3 16.1C19.9 13.5 21.3 12.2 22.9 12.2C25.2 12.2 26.8 14.4 26.8 17.1C26.8 19.5 25.3 21.1 23.2 21.1Z"
            fill="url(#metaGrad)"
          />
        </svg>
      );
    case 'tiktok':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <path
            d="M21.8 6H18.4V19.6C18.4 21.4 17 22.8 15.2 22.8C13.4 22.8 12 21.4 12 19.6C12 17.9 13.3 16.5 15 16.4V12.9C11.4 13.1 8.6 16 8.6 19.6C8.6 23.3 11.6 26.3 15.3 26.3C19 26.3 22 23.3 22 19.6V12.6C23.3 13.6 24.9 14.2 26.6 14.2V10.8C23.9 10.8 21.8 8.7 21.8 6Z"
            fill="#0F172A"
            className="dark:fill-white"
          />
          <path
            d="M20.8 5H17.4V18.6C17.4 20.4 16 21.8 14.2 21.8C13.5 21.8 12.9 21.6 12.4 21.2C13 22.2 14.1 22.8 15.3 22.8C17.1 22.8 18.5 21.4 18.5 19.6V6H20.8V5Z"
            fill="#25F4EE"
          />
          <path
            d="M22.6 7.1V10.5C24.3 10.5 25.9 9.9 27.2 8.9V12.3C25.5 12.3 23.9 11.7 22.6 10.7V17.7C22.6 21.4 19.6 24.4 15.9 24.4C14.6 24.4 13.4 24 12.4 23.4C13.6 25.1 15.5 26.3 17.7 26.3C21.4 26.3 24.4 23.3 24.4 19.6V12.6C25.7 13.6 27.3 14.2 29 14.2V10.8C26.3 10.8 24.1 9.2 22.6 7.1Z"
            fill="#FE2C55"
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

export default function PlatformSelectorPage() {
  const [websiteUrl, setWebsiteUrl] = useState('https://acmedirect-apparel.com');
  const [isScanning, setIsScanning] = useState(false);
  const [scanCompleted, setScanCompleted] = useState(true);

  const [buyerType, setBuyerType] = useState<'shoppers' | 'businesses'>('shoppers');
  const [customerHabit, setCustomerHabit] = useState<'scrolling' | 'searching'>('scrolling');
  const [productPrice, setProductPrice] = useState<'everyday' | 'mid' | 'premium'>('everyday');
  const [monthlyBudget, setMonthlyBudget] = useState<number>(6000);

  const [enabledPlatforms, setEnabledPlatforms] = useState<Record<PlatformId, boolean>>({
    meta: true,
    tiktok: true,
    youtube: true,
    google: true,
    linkedin: false,
  });

  const [focusedPlatformId, setFocusedPlatformId] = useState<PlatformId>('meta');

  const handleScanWebsite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteUrl.trim()) return;
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanCompleted(true);
    }, 850);
  };

  const handleBuyerTypeSwitch = (type: 'shoppers' | 'businesses') => {
    setBuyerType(type);
    if (type === 'businesses') {
      setEnabledPlatforms({
        meta: false,
        tiktok: false,
        youtube: true,
        google: true,
        linkedin: true,
      });
      setFocusedPlatformId('linkedin');
    } else {
      setEnabledPlatforms({
        meta: true,
        tiktok: true,
        youtube: true,
        google: true,
        linkedin: false,
      });
      setFocusedPlatformId('meta');
    }
  };

  const togglePlatform = (id: PlatformId) => {
    setEnabledPlatforms((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Dynamically calculate monthly budget share across active platforms
  const activePlatformList = PLATFORMS.filter((p) => enabledPlatforms[p.id]);
  const totalActiveWeight =
    activePlatformList.reduce((sum, p) => sum + p.weight, 0) || 1;

  const getMonthlyAllocation = (platform: PlatformConfig) => {
    if (!enabledPlatforms[platform.id]) return 0;
    return Math.round((platform.weight / totalActiveWeight) * monthlyBudget);
  };

  const focusedPlatform =
    PLATFORMS.find((p) => p.id === focusedPlatformId) || PLATFORMS[0];

  const provenAmount = Math.round(monthlyBudget * 0.7);
  const testingAmount = monthlyBudget - provenAmount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 pb-12"
    >
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/platforms" className="text-xs font-bold text-[#1E57D0] dark:text-sky-400 hover:underline">
            ← Back to Platforms
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            AI Platform Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Scan your website and get a recommended platform and budget split. Then launch from the builder, or manage each platform on the Platforms page.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#E6F1FF] dark:bg-blue-950/60 text-[#153E9E] dark:text-sky-300 text-xs font-bold self-start sm:self-auto">
          <Sparkles size={14} />
          <span>{activePlatformList.length} Platforms Active</span>
        </div>
      </div>

      {/* 2. SIMPLE WEBSITE AUTO-ANALYZER */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200/70 dark:border-slate-800 shadow-[0_2px_12px_rgb(15,23,42,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              1. Scan Your Website
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your store or business link so Adoracle can match your products to the right audience.
            </p>
          </div>
          {scanCompleted && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E57D0] dark:text-sky-400">
              <Check size={14} /> Store profile synced
            </span>
          )}
        </div>

        <form onSubmit={handleScanWebsite} className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Globe
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#1E57D0] transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isScanning}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#153E9E] to-[#1E57D0] text-white text-xs font-bold hover:brightness-110 transition-all shadow-sm shrink-0"
          >
            {isScanning ? 'Analyzing Store...' : 'Analyze Website'}
          </button>
        </form>

        {/* Plain-English Detected Store Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: 'What You Sell',
              value: buyerType === 'shoppers' ? 'Everyday Apparel & Lifestyle' : 'B2B Software & Services',
            },
            {
              label: 'Typical Product Price',
              value:
                productPrice === 'everyday'
                  ? 'Everyday ($15 – $60)'
                  : productPrice === 'mid'
                    ? 'Mid-Range ($60 – $250)'
                    : 'Premium ($250+)',
            },
            {
              label: 'Where Customers Live',
              value: 'Nationwide Shipping',
            },
            {
              label: 'Ideal Buyers',
              value:
                buyerType === 'shoppers'
                  ? 'Mobile Shoppers (Ages 18–44)'
                  : 'Founders, Directors & Team Leads',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-3.5 rounded-2xl bg-[#F3F6FB] dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {stat.label}
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white mt-1 block truncate">
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. EASY BUSINESS & BUDGET CONTROLS */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200/70 dark:border-slate-800 shadow-[0_2px_12px_rgb(15,23,42,0.02)]">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          2. Customize Your Audience &amp; Monthly Budget
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
          {/* Who buys from you? */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Who Buys From You?
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#F3F6FB] dark:bg-slate-800">
              <button
                type="button"
                onClick={() => handleBuyerTypeSwitch('shoppers')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${buyerType === 'shoppers'
                    ? 'bg-[#153E9E] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                  }`}
              >
                <ShoppingBag size={13} /> Shoppers
              </button>
              <button
                type="button"
                onClick={() => handleBuyerTypeSwitch('businesses')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${buyerType === 'businesses'
                    ? 'bg-[#153E9E] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                  }`}
              >
                <Users size={13} /> Businesses
              </button>
            </div>
          </div>

          {/* How do they discover you? */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              How Do They Find You?
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#F3F6FB] dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setCustomerHabit('scrolling')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${customerHabit === 'scrolling'
                    ? 'bg-[#153E9E] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                  }`}
              >
                <Smartphone size={13} /> Social Feeds
              </button>
              <button
                type="button"
                onClick={() => setCustomerHabit('searching')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${customerHabit === 'searching'
                    ? 'bg-[#153E9E] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                  }`}
              >
                <Search size={13} /> Search Bar
              </button>
            </div>
          </div>

          {/* Product Price Range */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Product Price Level
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-[#F3F6FB] dark:bg-slate-800">
              {[
                { id: 'everyday' as const, label: 'Low' },
                { id: 'mid' as const, label: 'Medium' },
                { id: 'premium' as const, label: 'High' },
              ].map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setProductPrice(tier.id)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${productPrice === tier.id
                      ? 'bg-[#153E9E] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                    }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          {/* Monthly Budget Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Monthly Ad Budget
              </label>
              <span className="text-sm font-extrabold text-[#153E9E] dark:text-sky-400">
                ${monthlyBudget.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={1000}
              max={20000}
              step={500}
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(Number(e.target.value))}
              className="w-full accent-[#1E57D0] cursor-pointer h-2 rounded-lg bg-slate-200 dark:bg-slate-700"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>$1,000</span>
              <span>$20,000</span>
            </div>
          </div>
        </div>

        {/* Friendly 70/30 Safety Split Banner */}
        <div className="mt-5 px-4 py-3 rounded-2xl bg-[#E6F1FF] dark:bg-blue-950/40 border border-[#1E57D0]/20 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[#153E9E] dark:text-sky-300 font-semibold">
            <Sparkles size={15} />
            <span>
              Smart 70/30 Protection:{' '}
              <strong>${provenAmount.toLocaleString()}</strong> goes to your top proven networks, and{' '}
              <strong>${testingAmount.toLocaleString()}</strong> tests new growth opportunities.
            </span>
          </div>
        </div>
      </div>

      {/* 4. INTERACTIVE PLATFORM CARDS + LIVE PLATFORM INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT 8 COLS: Selectable Social Media Platform Grid */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              3. Choose Your Social &amp; Ad Platforms
            </h2>
            <span className="text-xs text-slate-400">
              Click any card to preview analytics &amp; create ads
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PLATFORMS.map((platform) => {
              const isEnabled = enabledPlatforms[platform.id];
              const isFocused = focusedPlatformId === platform.id;
              const matchScore =
                buyerType === 'shoppers'
                  ? platform.matchScoreB2C
                  : platform.matchScoreB2B;
              const monthlyShare = getMonthlyAllocation(platform);
              const showCaution = buyerType === 'shoppers' && platform.id === 'linkedin';

              return (
                <motion.div
                  key={platform.id}
                  layout
                  whileHover={{ y: -2 }}
                  onClick={() => setFocusedPlatformId(platform.id)}
                  className={`relative p-5 rounded-3xl border transition-all cursor-pointer ${isFocused
                      ? 'bg-white dark:bg-slate-900 border-[#1E57D0] ring-2 ring-[#1E57D0]/15 shadow-md'
                      : isEnabled
                        ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-[#1E57D0]/50'
                        : 'bg-[#F8FAFC] dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/60 opacity-80'
                    }`}
                >
                  {/* Top Row: Real Brand Logo + Match Score Pill */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#F3F6FB] dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <RealPlatformLogo id={platform.id} size={24} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {platform.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {platform.tagline}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold shrink-0 ${matchScore >= 80
                          ? 'bg-[#E6F1FF] text-[#153E9E]'
                          : matchScore >= 50
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                    >
                      {matchScore}% Match
                    </span>
                  </div>

                  {/* Monthly Budget Share */}
                  <div className="my-3 flex items-baseline gap-1.5">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      ${monthlyShare.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400">/ month planned</span>
                  </div>

                  {/* Plain-English Explanation */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    {platform.simpleSummary}
                  </p>

                  {/* Friendly Warning for Mismatched Platform */}
                  {showCaution && (
                    <div className="mb-4 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/50 flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300">
                      <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-600" />
                      <span>{platform.cautionB2C}</span>
                    </div>
                  )}

                  {/* Bottom Row: Direct Studio Link + Smooth On/Off Toggle */}
                  <div
                    className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      href={platform.studioHref}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E57D0] dark:text-sky-400 hover:underline"
                    >
                      <PlusCircle size={14} />
                      <span>Create {platform.shortName} Ad</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => togglePlatform(platform.id)}
                      aria-label={`Enable or disable ${platform.name}`}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors flex items-center ${isEnabled ? 'bg-[#1E57D0]' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                    >
                      <motion.span
                        layout
                        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                        className={`w-5 h-5 rounded-full bg-white shadow ${isEnabled ? 'ml-auto' : 'ml-0'
                          }`}
                      />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* RIGHT 4 COLS: Sticky Platform Spotlight & Quick Launch Panel */}
        <div className="lg:col-span-4 lg:sticky lg:top-20 rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Selected Platform Details
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E6F1FF] text-[#153E9E] text-[10px] font-bold">
              {focusedPlatform.bucket}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={focusedPlatform.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#F3F6FB] dark:bg-slate-800 flex items-center justify-center">
                  <RealPlatformLogo id={focusedPlatform.id} size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {focusedPlatform.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {enabledPlatforms[focusedPlatform.id]
                      ? `Allocated $${getMonthlyAllocation(focusedPlatform).toLocaleString()}/mo`
                      : 'Currently turned off'}
                  </p>
                </div>
              </div>

              {/* Simple Analytics Forecast Box */}
              <div className="p-4 rounded-2xl bg-[#F3F6FB] dark:bg-slate-800/60 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Est. Cost per Customer</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {focusedPlatform.avgCostPerCustomer}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Monthly People Reached</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {focusedPlatform.estimatedReach}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Best Performing Ad Style</span>
                  <span className="font-bold text-[#153E9E] dark:text-sky-400">
                    {focusedPlatform.bestAdFormat}
                  </span>
                </div>
              </div>

              {/* Direct Action Buttons for this Platform */}
              <div className="space-y-2.5 pt-1">
                <Link
                  href={focusedPlatform.studioHref}
                  className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-[#153E9E] to-[#1E57D0] text-white text-xs font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-sm"
                >
                  <PlusCircle size={15} />
                  <span>Create Ad on {focusedPlatform.shortName}</span>
                </Link>

                <Link
                  href={`/platforms?p=${focusedPlatform.id.toUpperCase()}`}
                  className="w-full py-2.5 px-4 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 hover:border-[#1E57D0] transition-all"
                >
                  <BarChart3 size={14} />
                  <span>View {focusedPlatform.shortName} Analytics</span>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 5. BOTTOM ACTION BAR */}
      <div className="rounded-3xl bg-gradient-to-r from-[#12285E] via-[#163F9A] to-[#1E57D0] p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <h3 className="text-base font-bold">
            Ready to launch ads across your {activePlatformList.length} selected platforms?
          </h3>
          <p className="text-xs text-blue-100/80 mt-0.5">
            Open the Campaign Builder to set up all of them at once and publish in one click.
          </p>
        </div>

        <Link
          href={`/builder?platforms=${activePlatformList.map((p: any) => String(p.id).toUpperCase()).join(',')}`}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-[#153E9E] text-xs font-bold hover:bg-blue-50 transition-all shrink-0 shadow"
        >
          <span>Open Campaign Builder</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </motion.div>
  );
}