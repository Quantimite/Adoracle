'use client';

import React, { useState } from 'react';
import { crawlWebsite, ScrapedResult } from '@/lib/crawler/crawler';
import { calculateChannelMix } from '@/lib/ai/budgetEngine';
import { Platform } from '@/types';
import {
  Globe,
  Search,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Users,
  Building2,
  ShieldAlert,
  Info,
} from 'lucide-react';
import Link from 'next/link';

const platformColors: Record<Platform, string> = {
  META: 'bg-blue-500',
  TIKTOK: 'bg-slate-900',
  GOOGLE: 'bg-green-500',
  YOUTUBE: 'bg-red-500',
  LINKEDIN: 'bg-sky-700',
};

export default function SelectorPage() {
  const [url, setUrl] = useState('https://acmedirect-apparel.com');
  const [crawling, setCrawling] = useState(false);
  const [profile, setProfile] = useState<ScrapedResult | null>({
    url: 'https://acmedirect-apparel.com',
    offerings: 'Direct-to-Consumer Apparel & Lifestyle Goods',
    priceTier: 'LOW',
    targetAudience: 'Millennials & Gen-Z Mobile Shoppers',
    reachType: 'NATIONAL',
    detectedKeywords: ['fashion', 'streetwear', 'free shipping'],
    brokenLinks: [],
    healthScore: 88,
    coreWebVitalsMet: true,
  });

  const [buyerType, setBuyerType] = useState<'B2C' | 'B2B'>('B2C');
  const [intent, setIntent] = useState<'Search' | 'Scrolling'>('Scrolling');
  const [pricePoint, setPricePoint] = useState<'Low' | 'Mid' | 'High'>('Low');
  const [budget, setBudget] = useState(6000);

  const result = calculateChannelMix({ buyerType, intent, pricePoint, monthlyBudget: budget });

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setCrawling(true);
    try {
      const res = await crawlWebsite(url);
      setProfile(res);
    } finally {
      setCrawling(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-slate-900">Platform Selector</h1>
        <p className="text-slate-500 mt-1 text-sm">Get AI-powered channel recommendations for your budget</p>
      </div>

      {/* Website scanner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-900 mb-1">Scan Your Website</h2>
        <p className="text-sm text-slate-400 mb-5">We&apos;ll analyze your products and audience automatically</p>
        <form onSubmit={handleScan} className="flex gap-3">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://yourbrand.com"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:bg-white focus:border-sky-400 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={crawling}
            className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-60"
          >
            {crawling ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
            {crawling ? 'Scanning...' : 'Scan Site'}
          </button>
        </form>

        {profile && (
          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Products / Offerings', value: profile.offerings.substring(0, 32) + '...' },
              { label: 'Price Tier', value: `${profile.priceTier} AOV` },
              { label: 'Market Reach', value: profile.reachType },
              { label: 'Target Audience', value: profile.targetAudience.substring(0, 28) + '...' },
            ].map(item => (
              <div key={item.label} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{item.label}</p>
                <p className="text-sm font-semibold text-slate-900 mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Budget & persona toggles */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-900 mb-5">Your Business Profile</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Buyer type */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Buyer Type</label>
            <div className="flex gap-2">
              {(['B2C', 'B2B'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setBuyerType(t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    buyerType === t
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Intent */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Intent</label>
            <div className="flex gap-2">
              {(['Search', 'Scrolling'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setIntent(t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    intent === t
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Price Point</label>
            <div className="flex gap-2">
              {(['Low', 'Mid', 'High'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setPricePoint(t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    pricePoint === t
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex justify-between mb-2">
              <span>Monthly Budget</span>
              <span className="text-sky-600 normal-case font-bold">${budget.toLocaleString()}</span>
            </label>
            <input
              type="range"
              min="1000"
              max="30000"
              step="500"
              value={budget}
              onChange={e => setBudget(Number(e.target.value))}
              className="w-full mt-2"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>$1k</span>
              <span>$30k</span>
            </div>
          </div>
        </div>

        {/* 70/30 split notice */}
        <div className="mt-5 flex items-center gap-3 p-4 rounded-xl bg-sky-50 border border-sky-200">
          <Sparkles className="w-5 h-5 text-sky-600 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-bold text-sky-900">70/30 Budget Rule: </span>
            <span className="text-sky-800">
              <strong>${result.provenBudget.toLocaleString()}</strong> goes to proven channels →{' '}
              <strong>${result.growthBudget.toLocaleString()}</strong> for discovery growth
            </span>
          </div>
        </div>
      </div>

      {/* Warning advisory */}
      {result.whereNotToSpend.length > 0 && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-bold text-amber-900">Where NOT to spend your budget</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.whereNotToSpend.map(w => (
              <div key={w.platform} className="bg-white rounded-xl border border-amber-200 p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-bold text-slate-900">{w.platformName}</span>
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{w.warningTitle}</span>
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{w.reason}</p>
                <p className="text-[11px] font-semibold text-amber-700 mt-2 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  {w.thresholdNotice}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Channel recommendations */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-4">Recommended Channels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {result.recommendations.map(rec => (
            <div
              key={rec.platform}
              className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${
                rec.enabled
                  ? 'border-sky-300 shadow-sky-50'
                  : 'border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 ${platformColors[rec.platform]} rounded-lg flex items-center justify-center`}>
                    <span className="text-[10px] font-black text-white">{rec.platform.substring(0,2)}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{rec.name}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  rec.matchScore >= 85 ? 'bg-emerald-50 text-emerald-700' :
                  rec.matchScore >= 60 ? 'bg-amber-50 text-amber-700' :
                  'bg-red-50 text-red-700'
                }`}>
                  {rec.matchScore}%
                </span>
              </div>

              <div className="mb-3">
                <span className="text-2xl font-bold text-slate-900">${rec.recommendedBudget.toLocaleString()}</span>
                <span className="text-xs text-slate-400 ml-1">/ month</span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed mb-3">{rec.reasoning}</p>

              {rec.warning && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{rec.warning}</span>
                </div>
              )}

              <div className={`mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs`}>
                <span className={`font-semibold ${rec.enabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {rec.tier}
                </span>
                <div className={`w-8 h-4 rounded-full transition-colors ${rec.enabled ? 'bg-emerald-500' : 'bg-slate-300'} relative`}>
                  <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${rec.enabled ? 'left-4' : 'left-0.5'}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-slate-900 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Ready to build your campaigns?</h3>
          <p className="text-sm text-slate-400 mt-0.5">Your channel mix is ready — open Campaign Studio to create ads</p>
        </div>
        <Link
          href="/studio"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-sm font-bold transition-all shadow-lg shadow-sky-900/30 flex-shrink-0"
        >
          Open Studio
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

