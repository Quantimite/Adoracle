'use client';

import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Wrench, AlertCircle, CheckCircle2, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

const keywords = [
  { term: 'cross platform ad manager', volume: 18200, rank: 3, change: 2, cvr: 5.4 },
  { term: 'ai ad budget optimization', volume: 14500, rank: 2, change: 1, cvr: 6.8 },
  { term: 'meta vs tiktok ad manager', volume: 9800, rank: 5, change: -1, cvr: 4.1 },
  { term: 'b2b linkedin cpa benchmarks', volume: 6400, rank: 4, change: 3, cvr: 7.2 },
  { term: '70 30 ad budget strategy', volume: 5100, rank: 1, change: 0, cvr: 8.9 },
];

export default function SeoPage() {
  const [broken, setBroken] = useState(2);
  const [fixing, setFixing] = useState(false);
  const [fixed, setFixed] = useState(false);

  const handleFix = async () => {
    setFixing(true);
    await new Promise(r => setTimeout(r, 800));
    setBroken(0);
    setFixing(false);
    setFixed(true);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-slate-900">SEO & Pre-Launch Safety</h1>
        <p className="text-slate-500 mt-1 text-sm">Check your website health before spending on ads</p>
      </div>

      {/* Safety banner */}
      {broken > 0 ? (
        <div className="bg-red-50 rounded-2xl border border-red-200 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-900">⚠️ {broken} broken links found — don&apos;t spend on ads yet!</h3>
              <p className="text-xs text-red-700 mt-1 leading-relaxed">
                Your checkout page returns a 404 error. Any ad clicks right now will be wasted money.
              </p>
              <div className="mt-2 flex gap-2 text-xs font-mono">
                <span className="bg-white/80 border border-red-200 text-red-800 px-2 py-0.5 rounded">404: /checkout/v2/pay</span>
                <span className="bg-white/80 border border-red-200 text-red-800 px-2 py-0.5 rounded">301 Loop: /lp/black-friday</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleFix}
            disabled={fixing}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all shadow-md whitespace-nowrap flex-shrink-0"
          >
            {fixing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Wrench className="w-4 h-4" />}
            {fixing ? 'Fixing...' : 'Auto-Fix Now'}
          </button>
        </div>
      ) : (
        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4 flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          <div>
            <span className="text-sm font-bold text-emerald-900">All clear — your website is ready for ad traffic!</span>
            <span className="text-xs text-emerald-700 ml-2">0 broken links detected</span>
          </div>
        </div>
      )}

      {/* Health metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {/* Health score */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col items-center justify-center text-center">
          <div className="relative w-20 h-20 mb-3">
            <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E2E8F0" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke="#10B981" strokeWidth="3"
                strokeDasharray="88 12" strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-black text-slate-900">88</span>
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-500">Site Health Score</p>
          <p className="text-xs text-emerald-600 font-semibold mt-0.5">Excellent</p>
        </div>

        {/* Core web vitals */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Core Web Vitals</span>
          </div>
          <div className="space-y-2.5 text-xs">
            {[
              { label: 'LCP', value: '1.4s', pass: true },
              { label: 'INP', value: '42ms', pass: true },
              { label: 'CLS', value: '0.02', pass: true },
            ].map(v => (
              <div key={v.label} className="flex justify-between items-center">
                <span className="text-slate-500">{v.label}</span>
                <span className="font-bold text-emerald-600">{v.value} ✓</span>
              </div>
            ))}
          </div>
          <p className="text-xs font-bold text-emerald-600 mt-3">3/3 Passed</p>
        </div>

        {/* Organic clicks */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Organic Clicks</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">14,820</p>
          <p className="text-xs text-slate-400 mt-0.5">30-day total</p>
          <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
            <ArrowUpRight className="w-3 h-3" />
            +18.4% MoM
          </div>
        </div>

        {/* Impressions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Search Impressions</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">248k</p>
          <p className="text-xs text-slate-400 mt-0.5">30-day total</p>
          <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
            <ArrowUpRight className="w-3 h-3" />
            +24.1% MoM
          </div>
        </div>
      </div>

      {/* Keyword rank table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Keyword Rankings</h2>
          <p className="text-sm text-slate-400 mt-0.5">Your target search terms and their performance</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide px-6 py-3">Search Term</th>
                <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide px-4 py-3">Monthly Searches</th>
                <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide px-4 py-3">Rank</th>
                <th className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide px-4 py-3">Change</th>
                <th className="text-right text-[11px] font-bold text-slate-400 uppercase tracking-wide px-6 py-3">Converts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {keywords.map((kw, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">{kw.term}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{kw.volume.toLocaleString()}</td>
                  <td className="px-4 py-4">
                    <span className="w-8 h-8 bg-sky-50 text-sky-700 rounded-lg flex items-center justify-center text-sm font-bold">
                      #{kw.rank}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {kw.change > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <ArrowUpRight className="w-3.5 h-3.5" />+{kw.change}
                      </span>
                    ) : kw.change < 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                        <ArrowDownRight className="w-3.5 h-3.5" />{kw.change}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-emerald-600">{kw.cvr}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

