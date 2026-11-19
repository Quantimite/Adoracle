'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Sparkles,
    TrendingUp,
    Users,
    DollarSign,
    MousePointerClick,
    Play,
    Pause,
    Calendar,
    Edit3,
    Globe,
    Plus,
    X,
    Target,
    Image as ImageIcon,
    Sliders,
    CheckCircle2,
    Clock,
    Lock,
} from 'lucide-react';

interface AdCreativeItem {
    id: string;
    name: string;
    type: 'Video' | 'Carousel' | 'Image';
    status: 'Active' | 'Paused' | 'In Review';
    headline: string;
    primaryText: string;
    ctaButton: string;
    mediaPlaceholder: string;
    spend: number;
    revenue: number;
    impressions: number;
    clicks: number;
    conversions: number;
}

interface CampaignItem {
    id: string;
    platform: 'meta' | 'tiktok' | 'google' | 'youtube' | 'linkedin';
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
    adCreatives: AdCreativeItem[];
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
            { date: 'Nov 08', spend: 110, revenue: 490, buyers: 6 },
            { date: 'Nov 09', spend: 115, revenue: 530, buyers: 7 },
            { date: 'Nov 10', spend: 120, revenue: 610, buyers: 8 },
            { date: 'Nov 11', spend: 120, revenue: 590, buyers: 7 },
            { date: 'Nov 12', spend: 120, revenue: 680, buyers: 8 },
            { date: 'Nov 13', spend: 120, revenue: 645, buyers: 7 },
            { date: 'Nov 14', spend: 120, revenue: 710, buyers: 5 },
        ],
        adCreatives: [
            {
                id: 'ad-meta-1',
                name: 'Reels Hook #1 - UGC Testimonial',
                type: 'Video',
                status: 'Active',
                headline: 'Transform your workflow in 60 seconds',
                primaryText: 'Join 10,000+ creators scaling faster with automated AI workflows.',
                ctaButton: 'Shop Now',
                mediaPlaceholder: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
                spend: 412,
                revenue: 2150,
                impressions: 34000,
                clicks: 820,
                conversions: 26,
            },
            {
                id: 'ad-meta-2',
                name: 'Catalog Carousel - Best Sellers',
                type: 'Carousel',
                status: 'Active',
                headline: 'Top rated tools for digital creators',
                primaryText: 'Explore our highest rated hardware and software bundles.',
                ctaButton: 'Learn More',
                mediaPlaceholder: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
                spend: 320,
                revenue: 1420,
                impressions: 22000,
                clicks: 510,
                conversions: 16,
            },
        ],
    },
];

function RealPlatformLogo({ id, size = 16 }: { id: string; size?: number }) {
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
        default:
            return <Globe size={size} className="text-blue-500" />;
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
            <div className="w-full h-2 rounded-full bg-blue-100/90 dark:bg-slate-800 overflow-hidden">
                <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#153E9E] via-[#1E57D0] to-[#36BAFC]"
                    animate={{ width: `${pct}%` }}
                    transition={{ type: 'spring', stiffness: 420, damping: 35 }}
                />
            </div>
            <motion.div
                className="pointer-events-none absolute w-4 h-4 rounded-full bg-[#153E9E] border-2 border-white shadow-[0_2px_8px_rgba(21,62,158,0.35)] group-hover:scale-125 transition-transform"
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
                aria-label="Daily budget slider"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
        </div>
    );
}

export default function CampaignAdManagerPage() {
    const params = useParams();
    const slug = params?.id as string;

    const [campaigns, setCampaigns] = useState<CampaignItem[]>(INITIAL_CAMPAIGNS);
    const [activeTab, setActiveTab] = useState<'ads' | 'audience' | 'history'>('ads');

    // Master Studio-Style Modal State
    const [editingAd, setEditingAd] = useState<AdCreativeItem | null>(null);
    const [formAdName, setFormAdName] = useState('');
    const [formAdType, setFormAdType] = useState<'Video' | 'Carousel' | 'Image'>('Video');
    const [formHeadline, setFormHeadline] = useState('');
    const [formPrimaryText, setFormPrimaryText] = useState('');
    const [formCta, setFormCta] = useState('Shop Now');
    const [formPlaceholder, setFormPlaceholder] = useState('');
    const [formAdBudget, setFormAdBudget] = useState(120);
    const [formAudience, setFormAudience] = useState('');
    const [formPlacement, setFormPlacement] = useState('');

    // Campaign Schedule States (Start date locked/read-only post-publication, End date editable by default)
    const [formStartDate] = useState('2026-11-08'); // Fixed post-publication
    const [formEndDate, setFormEndDate] = useState('2026-12-08');
    const [formScheduleMode, setFormScheduleMode] = useState<'Continuous' | 'Custom Range'>('Custom Range');

    const currentCampaign = campaigns.find((c) => c.id === slug || c.platform === slug) || campaigns[0];

    const handleBudgetChange = (newBudget: number) => {
        setCampaigns((prev) =>
            prev.map((c) => (c.id === currentCampaign.id ? { ...c, dailyBudget: newBudget } : c))
        );
    };

    const toggleAiPilot = () => {
        setCampaigns((prev) =>
            prev.map((c) => (c.id === currentCampaign.id ? { ...c, aiPilot: !c.aiPilot } : c))
        );
    };

    const toggleCampaignStatus = () => {
        setCampaigns((prev) =>
            prev.map((c) =>
                c.id === currentCampaign.id
                    ? { ...c, status: c.status === 'Paused' ? 'Active' : 'Paused' }
                    : c
            )
        );
    };

    const toggleAdStatus = (adId: string) => {
        setCampaigns((prev) =>
            prev.map((c) => {
                if (c.id !== currentCampaign.id) return c;
                const updatedAds = c.adCreatives.map((ad) =>
                    ad.id === adId
                        ? { ...ad, status: (ad.status === 'Active' ? 'Paused' : 'Active') as 'Active' | 'Paused' }
                        : ad
                );
                return { ...c, adCreatives: updatedAds };
            })
        );
    };

    const handleOpenEditAd = (ad: AdCreativeItem) => {
        setEditingAd(ad);
        setFormAdName(ad.name);
        setFormAdType(ad.type);
        setFormHeadline(ad.headline);
        setFormPrimaryText(ad.primaryText);
        setFormCta(ad.ctaButton || 'Shop Now');
        setFormPlaceholder(ad.mediaPlaceholder || '');
        setFormAdBudget(currentCampaign.dailyBudget);
        setFormAudience(currentCampaign.topAudience);
        setFormPlacement(currentCampaign.topPlacement);
    };

    const handleSaveAdEdits = () => {
        if (!editingAd) return;
        setCampaigns((prev) =>
            prev.map((c) => {
                if (c.id !== currentCampaign.id) return c;
                const updatedAds = c.adCreatives.map((ad) =>
                    ad.id === editingAd.id
                        ? {
                            ...ad,
                            name: formAdName,
                            type: formAdType,
                            headline: formHeadline,
                            primaryText: formPrimaryText,
                            ctaButton: formCta,
                            mediaPlaceholder: formPlaceholder,
                        }
                        : ad
                );
                return {
                    ...c,
                    dailyBudget: formAdBudget,
                    topAudience: formAudience,
                    topPlacement: formPlacement,
                    adCreatives: updatedAds,
                };
            })
        );
        setEditingAd(null);
    };

    const roas = currentCampaign.totalSpend > 0 ? (currentCampaign.revenueGenerated / currentCampaign.totalSpend).toFixed(1) : '0.0';
    const cpa = currentCampaign.customersWon > 0 ? (currentCampaign.totalSpend / currentCampaign.customersWon).toFixed(2) : '0.00';

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="space-y-7 pb-20 max-w-6xl mx-auto"
        >
            {/* Top Header Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <Link
                    href="/campaigns"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto"
                >
                    <ArrowLeft size={14} />
                    <span>Back to All Campaigns</span>
                </Link>

                <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EFF6FF] text-[#153E9E] text-xs font-bold">
                        <RealPlatformLogo id={currentCampaign.platform} size={15} />
                        <span>{currentCampaign.platformLabel} Ad Manager</span>
                    </span>
                    <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${currentCampaign.status === 'Active'
                                ? 'bg-[#EFF6FF] text-[#153E9E]'
                                : currentCampaign.status === 'Learning'
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-slate-100 text-slate-500'
                            }`}
                    >
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        {currentCampaign.status}
                    </span>
                </div>
            </div>

            {/* Campaign Command Control Center */}
            <div className="rounded-3xl bg-gradient-to-br from-[#0C1A3C] via-[#153E9E] to-[#1E57D0] p-7 sm:p-8 text-white shadow-lg space-y-6">
                <div className="space-y-2">
                    <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">
                        {currentCampaign.subtitle}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        {currentCampaign.name}
                    </h1>
                    <p className="text-xs text-blue-100/80">
                        Enterprise Ad Manager. Manage individual ad creatives, placeholders, schedules, budgets, and audience targeting after publishing.
                    </p>
                </div>

                {/* Budget Slider & Action Toolbar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-white/15 items-center">
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-blue-200">
                            <span>Daily Ad Spend Limit</span>
                            <span className="font-extrabold text-white">${currentCampaign.dailyBudget}/day</span>
                        </div>
                        <EmeraldBudgetSlider
                            value={currentCampaign.dailyBudget}
                            disabled={currentCampaign.status === 'Paused'}
                            onChange={handleBudgetChange}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 md:col-span-2 md:justify-end">
                        <button
                            type="button"
                            onClick={toggleAiPilot}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors ${currentCampaign.aiPilot ? 'bg-sky-400 text-[#0A1530]' : 'bg-white/10 text-white'
                                }`}
                        >
                            <Sparkles size={14} />
                            <span>{currentCampaign.aiPilot ? 'AI Auto-Pilot Active' : 'Manual Mode'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={toggleCampaignStatus}
                            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                        >
                            {currentCampaign.status === 'Paused' ? <Play size={14} /> : <Pause size={14} />}
                            <span>{currentCampaign.status === 'Paused' ? 'Resume Campaign' : 'Pause Campaign'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 4 Performance KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-blue-200/80 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-[11px] font-bold uppercase">Attributed Revenue</span>
                        <TrendingUp size={16} className="text-[#153E9E]" />
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        ${currentCampaign.revenueGenerated.toLocaleString()}
                    </div>
                    <span className="text-xs font-bold text-[#153E9E] mt-1 inline-block">
                        {roas}x ROAS Return
                    </span>
                </div>

                <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-blue-200/80 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-[11px] font-bold uppercase">Customers Won</span>
                        <Users size={16} className="text-[#153E9E]" />
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        {currentCampaign.customersWon} buyers
                    </div>
                    <span className="text-xs font-bold text-[#153E9E] mt-1 inline-block">
                        ${cpa} cost per buyer
                    </span>
                </div>

                <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-blue-200/80 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-[11px] font-bold uppercase">Total Ad Spend</span>
                        <DollarSign size={16} className="text-[#153E9E]" />
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        ${currentCampaign.totalSpend.toLocaleString()}
                    </div>
                    <span className="text-xs text-slate-500 mt-1 inline-block">
                        Protected by 70/30 spend rules
                    </span>
                </div>

                <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-blue-200/80 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-[11px] font-bold uppercase">Link Clicks &amp; CTR</span>
                        <MousePointerClick size={16} className="text-[#153E9E]" />
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        {currentCampaign.clicks.toLocaleString()}
                    </div>
                    <span className="text-xs font-bold text-[#153E9E] mt-1 inline-block">
                        {((currentCampaign.clicks / currentCampaign.impressions) * 100).toFixed(2)}% Click Rate
                    </span>
                </div>
            </div>

            {/* Tabs Switcher */}
            <div className="flex items-center gap-2 border-b border-blue-200/60 dark:border-slate-800 pb-3 overflow-x-auto no-scrollbar max-w-full">
                <button
                    type="button"
                    onClick={() => setActiveTab('ads')}
                    className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${activeTab === 'ads'
                            ? 'bg-[#153E9E] text-white shadow-md'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                        }`}
                >
                    Manage Ad Creatives &amp; Placeholders ({currentCampaign.adCreatives?.length || 0})
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('audience')}
                    className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${activeTab === 'audience'
                            ? 'bg-[#153E9E] text-white shadow-md'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                        }`}
                >
                    Audience &amp; Placements
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('history')}
                    className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${activeTab === 'history'
                            ? 'bg-[#153E9E] text-white shadow-md'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                        }`}
                >
                    7-Day Execution History
                </button>
            </div>

            {/* ================= TAB 1: MANAGE AD CREATIVES & PLACEHOLDERS ================= */}
            {activeTab === 'ads' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#153E9E] dark:text-sky-300">
                            Active Ad Variations &amp; Creative Assets
                        </h3>
                        <Link
                            href="/studio"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EFF6FF] hover:bg-blue-100 text-[#153E9E] text-xs font-bold transition-colors border border-blue-200"
                        >
                            <Plus size={14} />
                            <span>Create New Ad Variation</span>
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {currentCampaign.adCreatives?.map((ad) => {
                            const adRoas = ad.spend > 0 ? (ad.revenue / ad.spend).toFixed(1) : '0.0';
                            const isAdPaused = ad.status === 'Paused';

                            return (
                                <div
                                    key={ad.id}
                                    className={`rounded-3xl bg-white dark:bg-slate-900 border p-6 transition-all shadow-sm ${isAdPaused ? 'border-slate-200 opacity-70' : 'border-blue-200/80 dark:border-slate-800'
                                        }`}
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                        {/* Media Thumbnail & Details */}
                                        <div className="flex items-start gap-4 flex-1 min-w-0">
                                            {ad.mediaPlaceholder ? (
                                                <img
                                                    src={ad.mediaPlaceholder}
                                                    alt={ad.name}
                                                    className="w-16 h-16 rounded-2xl object-cover border border-blue-200 shrink-0"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                                                    <ImageIcon size={22} />
                                                </div>
                                            )}

                                            <div className="space-y-1.5 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2.5">
                                                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#153E9E] text-[10px] font-extrabold uppercase">
                                                        {ad.type} Ad
                                                    </span>
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${ad.status === 'Active' ? 'bg-[#EFF6FF] text-[#153E9E]' : 'bg-slate-100 text-slate-500'
                                                            }`}
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full ${ad.status === 'Active' ? 'bg-blue-500' : 'bg-slate-400'}`} />
                                                        {ad.status}
                                                    </span>
                                                    <span className="text-xs text-slate-400">CTA: <strong>{ad.ctaButton}</strong></span>
                                                </div>

                                                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                                                    {ad.name}
                                                </h4>

                                                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                                                    <p className="font-bold text-slate-800 dark:text-sky-300">Headline: {ad.headline}</p>
                                                    <p className="text-slate-500 truncate">Text: {ad.primaryText}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ad Metrics */}
                                        <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-7 border-y lg:border-y-0 lg:border-x border-slate-100 dark:border-slate-800 py-4 lg:py-0 lg:px-6 shrink-0">
                                            <div>
                                                <span className="text-[10px] text-slate-400 block">Spend</span>
                                                <span className="text-sm font-extrabold text-slate-900 dark:text-white">${ad.spend}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-slate-400 block">Revenue</span>
                                                <span className="text-sm font-extrabold text-[#153E9E] dark:text-sky-400">${ad.revenue}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-slate-400 block">Conversions</span>
                                                <span className="text-sm font-extrabold text-slate-900 dark:text-white">{ad.conversions} buyers</span>
                                            </div>
                                            <div className="px-3 py-1.5 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/60 border border-blue-200">
                                                <span className="text-[9px] font-bold uppercase text-[#153E9E] block">ROAS</span>
                                                <span className="text-sm font-extrabold text-[#153E9E] dark:text-sky-300">{adRoas}x</span>
                                            </div>
                                        </div>

                                        {/* Management Controls */}
                                        <div className="flex items-center gap-2.5 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenEditAd(ad)}
                                                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                                            >
                                                <Edit3 size={13} />
                                                <span>Manage &amp; Edit</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => toggleAdStatus(ad.id)}
                                                className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors ${isAdPaused ? 'bg-[#EFF6FF] text-[#153E9E]' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                                    }`}
                                            >
                                                {isAdPaused ? <Play size={13} /> : <Pause size={13} />}
                                                <span>{isAdPaused ? 'Resume' : 'Pause'}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ================= TAB 2: AUDIENCE & PLACEMENTS ================= */}
            {activeTab === 'audience' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-7 border border-blue-200/80 dark:border-slate-800 space-y-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-[#153E9E] dark:text-sky-300 flex items-center gap-2">
                                <Target size={16} /> Audience &amp; Placements Configuration
                            </span>
                            <button
                                type="button"
                                onClick={() => handleOpenEditAd(currentCampaign.adCreatives[0])}
                                className="px-3 py-1.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-[#153E9E] text-xs font-bold inline-flex items-center gap-1"
                            >
                                <Edit3 size={12} /> Edit Settings
                            </button>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1">
                                <span className="text-slate-400 font-bold uppercase text-[10px]">Target Audience</span>
                                <p className="font-extrabold text-slate-900 dark:text-white text-sm">{currentCampaign.topAudience}</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1">
                                <span className="text-slate-400 font-bold uppercase text-[10px]">Active Placements</span>
                                <p className="font-extrabold text-slate-900 dark:text-white text-sm">{currentCampaign.topPlacement}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl bg-[#153E9E] p-6 sm:p-7 text-white space-y-4 shadow-sm flex flex-col justify-between">
                        <div className="space-y-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                                <Sparkles size={13} /> AI Optimization Log
                            </span>
                            <p className="text-xs font-medium text-blue-50 leading-relaxed">
                                {currentCampaign.aiNote}
                            </p>
                        </div>
                        <div className="pt-3 border-t border-white/15 text-[11px] text-blue-200">
                            Smart budget guardrails are actively re-allocating funds toward top ad variations every 6 hours.
                        </div>
                    </div>
                </div>
            )}

            {/* ================= TAB 3: 7-DAY EXECUTION HISTORY TABLE ================= */}
            {activeTab === 'history' && (
                <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-7 border border-blue-200/80 dark:border-slate-800 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Calendar size={16} className="text-[#153E9E]" />
                            <span>7-Day Campaign Execution History</span>
                        </h3>
                        <span className="text-xs text-slate-400">Verified server-side conversions</span>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#F8FAFC] dark:bg-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Spend</th>
                                    <th className="p-4">Revenue</th>
                                    <th className="p-4">Buyers</th>
                                    <th className="p-4">ROAS Return</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {currentCampaign.historyLog.map((log) => {
                                    const dailyRoas = (log.revenue / log.spend).toFixed(1);
                                    return (
                                        <tr key={log.date} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                            <td className="p-4 font-bold text-slate-900 dark:text-white">{log.date}</td>
                                            <td className="p-4 text-slate-600 dark:text-slate-300">${log.spend}</td>
                                            <td className="p-4 font-extrabold text-[#153E9E] dark:text-sky-400">${log.revenue}</td>
                                            <td className="p-4 text-slate-600 dark:text-slate-300">{log.buyers} buyers</td>
                                            <td className="p-4 font-bold text-blue-600">{dailyRoas}x</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ================= STUDIO-MATCHED SETUP POP-UP MODAL (EDITABLE END DATE BY DEFAULT) ================= */}
            <AnimatePresence>
                {editingAd && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-blue-200 p-4 sm:p-7 space-y-6 my-auto"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div>
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#153E9E] dark:text-sky-400 block">
                                        Enterprise Ad &amp; Campaign Setup Suite
                                    </span>
                                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                                        Manage All Parameters: {editingAd.name}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEditingAd(null)}
                                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Studio Setup Sections */}
                            <div className="space-y-5 text-xs">
                                {/* SECTION 1: BUDGET & TARGETING */}
                                <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/40 border border-blue-200/70 dark:border-blue-800/50 shadow-sm space-y-4">
                                    <span className="font-extrabold uppercase text-[11px] text-[#153E9E] dark:text-sky-400 block tracking-wider">
                                        1. Campaign Budget &amp; Audience Targeting
                                    </span>

                                    <div className="space-y-1.5">
                                        <label className="font-bold text-slate-700 dark:text-slate-300 block">
                                            Daily Ad Budget ($ / day)
                                        </label>
                                        <input
                                            type="number"
                                            value={formAdBudget}
                                            onChange={(e) => setFormAdBudget(Number(e.target.value))}
                                            className="w-full px-4 py-2.5 rounded-xl border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#153E9E]"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="font-bold text-slate-700 dark:text-slate-300 block">Target Audience</label>
                                            <input
                                                type="text"
                                                value={formAudience}
                                                onChange={(e) => setFormAudience(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#153E9E]"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="font-bold text-slate-700 dark:text-slate-300 block">Active Placements</label>
                                            <input
                                                type="text"
                                                value={formPlacement}
                                                onChange={(e) => setFormPlacement(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#153E9E]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 2: CAMPAIGN SCHEDULE & CALENDAR (LOCKED START DATE, FULLY EDITABLE END DATE) */}
                                <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/40 border border-blue-200/70 dark:border-blue-800/50 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="font-extrabold uppercase text-[11px] text-[#153E9E] dark:text-sky-400 block tracking-wider flex items-center gap-1.5">
                                            <Calendar size={14} /> 2. Campaign Schedule &amp; Calendar
                                        </span>
                                        <select
                                            value={formScheduleMode}
                                            onChange={(e) => setFormScheduleMode(e.target.value as any)}
                                            className="px-3 py-1 rounded-lg border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-bold text-[#153E9E] dark:text-sky-300 focus:outline-none"
                                        >
                                            <option value="Custom Range">Set Custom End Date</option>
                                            <option value="Continuous">Run Continuously</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Start Date: Locked / Disabled post-publication */}
                                        <div className="space-y-1.5">
                                            <label className="font-bold text-slate-500 dark:text-slate-400 block flex items-center gap-1">
                                                <Lock size={12} className="text-amber-600" /> Start Date (Locked Post-Publish)
                                            </label>
                                            <input
                                                type="date"
                                                disabled
                                                value={formStartDate}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed focus:outline-none"
                                            />
                                        </div>

                                        {/* End Date: Fully Editable */}
                                        <div className="space-y-1.5">
                                            <label className="font-bold text-slate-700 dark:text-slate-300 block flex items-center gap-1">
                                                <Clock size={12} className="text-blue-600" /> End Date {formScheduleMode === 'Continuous' && '(Ongoing)'}
                                            </label>
                                            <input
                                                type="date"
                                                disabled={formScheduleMode === 'Continuous'}
                                                value={formEndDate}
                                                onChange={(e) => setFormEndDate(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#153E9E] disabled:opacity-40 disabled:cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 3: CREATIVE ASSET & PLACEHOLDER MANAGER */}
                                <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/40 border border-blue-200/70 dark:border-blue-800/50 shadow-sm space-y-4">
                                    <span className="font-extrabold uppercase text-[11px] text-[#153E9E] dark:text-sky-400 block tracking-wider">
                                        3. Creative Asset &amp; Placeholder Manager
                                    </span>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="font-bold text-slate-700 dark:text-slate-300 block">Ad Creative Name</label>
                                            <input
                                                type="text"
                                                value={formAdName}
                                                onChange={(e) => setFormAdName(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#153E9E]"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="font-bold text-slate-700 dark:text-slate-300 block">Ad Format / Type</label>
                                            <select
                                                value={formAdType}
                                                onChange={(e) => setFormAdType(e.target.value as any)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#153E9E]"
                                            >
                                                <option value="Video">Video Ad</option>
                                                <option value="Carousel">Carousel Ad</option>
                                                <option value="Image">Static Image Ad</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="font-bold text-slate-700 dark:text-slate-300 block">Media Asset Placeholder URL</label>
                                        <input
                                            type="text"
                                            value={formPlaceholder}
                                            onChange={(e) => setFormPlaceholder(e.target.value)}
                                            placeholder="https://images.unsplash.com/..."
                                            className="w-full px-4 py-2.5 rounded-xl border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#153E9E]"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="font-bold text-slate-700 dark:text-slate-300 block">Call to Action (CTA Button)</label>
                                            <select
                                                value={formCta}
                                                onChange={(e) => setFormCta(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#153E9E]"
                                            >
                                                <option value="Shop Now">Shop Now</option>
                                                <option value="Learn More">Learn More</option>
                                                <option value="Sign Up">Sign Up</option>
                                                <option value="Download">Download</option>
                                                <option value="Get Offer">Get Offer</option>
                                            </select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="font-bold text-slate-700 dark:text-slate-300 block">Ad Headline</label>
                                            <input
                                                type="text"
                                                value={formHeadline}
                                                onChange={(e) => setFormHeadline(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#153E9E]"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="font-bold text-slate-700 dark:text-slate-300 block">Primary Text / Ad Copy</label>
                                        <textarea
                                            rows={3}
                                            value={formPrimaryText}
                                            onChange={(e) => setFormPrimaryText(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#153E9E]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setEditingAd(null)}
                                    className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveAdEdits}
                                    className="px-6 py-2.5 rounded-xl bg-[#153E9E] hover:bg-[#1E57D0] text-white text-xs font-bold shadow-md transition-colors"
                                >
                                    Save &amp; Update Setup
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}