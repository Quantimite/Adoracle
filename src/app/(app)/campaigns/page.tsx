'use client';

import React, { useState } from 'react';
import { initialCampaigns } from '@/lib/store';
import { Campaign, CampaignStatus, Platform } from '@/types';
import {
  Sparkles,
  CheckCircle2,
  PauseCircle,
  AlertCircle,
  TrendingUp,
  Search,
  Plus
} from 'lucide-react';
import Link from 'next/link';

function PlatformBadge({ platform }: { platform: Platform }) {
  const styles: Record<Platform, string> = {
    META: 'bg-blue-100 text-blue-700',
    TIKTOK: 'bg-slate-100 text-slate-700',
    GOOGLE: 'bg-green-100 text-green-700',
    YOUTUBE: 'bg-red-100 text-red-700',
    LINKEDIN: 'bg-sky-100 text-sky-700',
  };
  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${styles[platform]}`}>
      {platform}
    </span>
  );
}

function StatusBadge({ status }: { status: CampaignStatus }) {
  if (status === 'ACTIVE') return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      Active
    </span>
  );
  if (status === 'LEARNING') return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      Learning
    </span>
  );
  if (status === 'ERROR') return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-full">
      <AlertCircle className="w-3 h-3" />
      Error
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
      <PauseCircle className="w-3 h-3" />
      Paused
    </span>
  );
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const totalBudget = campaigns.reduce((a, c) => a + (c.status !== 'PAUSED' ? c.dailyBudget : 0), 0);

  const filtered = campaigns.filter(c => {
    const matchPlatform = filter === 'ALL' || c.platform === filter;
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchPlatform && matchSearch;
  });

  const handleBudget = (id: string, val: number) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, dailyBudget: val } : c));
  };

  const toggleStatus = (id: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id !== id) return c;
      return { ...c, status: c.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED' };
    }));
  };

  const toggleAI = (id: string) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, aiOptimizing: !c.aiOptimizing } : c));
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campaigns</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage and reallocate budgets across all platforms</p>
        </div>
        <Link
          href="/studio"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold transition-all shadow-md shadow-sky-200"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </Link>
      </div>

      {/* Budget bar summary */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Daily Budget Overview</h2>
            <p className="text-xs text-slate-400 mt-0.5">Reallocate budgets by adjusting sliders below</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900">${totalBudget.toFixed(0)}<span className="text-sm font-normal text-slate-400">/day</span></div>
            <div className="text-xs text-emerald-600 font-semibold">Pacing 98.4%</div>
          </div>
        </div>

        {/* Visual bar */}
        <div className="flex gap-1.5 h-5 rounded-xl overflow-hidden">
          {[
            { label: 'Meta', pct: 38, color: 'bg-blue-500' },
            { label: 'TikTok', pct: 18, color: 'bg-slate-800' },
            { label: 'Google', pct: 23, color: 'bg-green-500' },
            { label: 'YouTube', pct: 10, color: 'bg-red-500' },
            { label: 'LinkedIn', pct: 11, color: 'bg-sky-600' },
          ].map(seg => (
            <div
              key={seg.label}
              style={{ width: `${seg.pct}%` }}
              className={`${seg.color} rounded-md flex items-center justify-center transition-all duration-300`}
              title={`${seg.label}: ${seg.pct}%`}
            >
              <span className="text-[10px] text-white font-bold">{seg.pct}%</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 mt-3">
          {[
            { label: 'Meta', color: 'bg-blue-500' },
            { label: 'TikTok', color: 'bg-slate-800' },
            { label: 'Google', color: 'bg-green-500' },
            { label: 'YouTube', color: 'bg-red-500' },
            { label: 'LinkedIn', color: 'bg-sky-600' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 text-xs text-slate-500">
              <div className={`w-2 h-2 rounded-full ${l.color}`} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-slate-200/80 shadow-sm">
          {['ALL', 'META', 'TIKTOK', 'GOOGLE', 'YOUTUBE', 'LINKEDIN'].map(p => (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === p
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 w-52 focus:border-sky-400 transition-all"
          />
        </div>
      </div>

      {/* Campaign cards */}
      <div className="space-y-3">
        {filtered.map(c => (
          <div key={c.id} className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 transition-all ${c.status === 'PAUSED' ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-4">
              {/* Left info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <PlatformBadge platform={c.platform} />
                  <StatusBadge status={c.status} />
                  {c.aiOptimizing && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                      <Sparkles className="w-3 h-3" />
                      AI
                    </span>
                  )}
                </div>
                <h3 className="mt-2 text-sm font-semibold text-slate-900 truncate">{c.name}</h3>
                <div className="mt-3 flex items-center gap-6 text-xs text-slate-500">
                  <div>
                    <span className="block text-lg font-bold text-slate-900">{c.customersWon}</span>
                    <span>Customers Won</span>
                  </div>
                  <div>
                    <span className="block text-lg font-bold text-slate-900">${c.costPerCustomer.toFixed(2)}</span>
                    <span>Cost / Customer</span>
                  </div>
                  <div>
                    <span className="block text-lg font-bold text-slate-900">${c.totalSpend.toFixed(0)}</span>
                    <span>Total Spend</span>
                  </div>
                  {c.roas && (
                    <div>
                      <span className="block text-lg font-bold text-emerald-600">{c.roas}×</span>
                      <span>ROAS</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right controls */}
              <div className="flex flex-col gap-3 items-end flex-shrink-0 w-52">
                {/* Budget slider */}
                <div className="w-full">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span>Daily Budget</span>
                    <span className="text-sky-600">${c.dailyBudget}/day</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="5"
                    value={c.dailyBudget}
                    disabled={c.status === 'PAUSED'}
                    onChange={e => handleBudget(c.id, Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAI(c.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      c.aiOptimizing
                        ? 'bg-sky-100 text-sky-700'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {c.aiOptimizing ? 'AI On' : 'AI Off'}
                  </button>
                  <button
                    onClick={() => toggleStatus(c.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      c.status === 'PAUSED'
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {c.status === 'PAUSED' ? 'Resume' : 'Pause'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

