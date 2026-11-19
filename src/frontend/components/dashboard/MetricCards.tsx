'use client';

import React from 'react';
import { useMode } from '@/frontend/context/ModeContext';
import { Card } from '@/frontend/components/ui/card';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Coins, 
  Gauge, 
  Target,
  Sparkles
} from 'lucide-react';

export const MetricCards: React.FC = () => {
  const { mode } = useMode();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* Metric 1: Customers / Conversions */}
      <Card className="p-6 relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-pulse to-brand-deep opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slateText uppercase tracking-wider">
            {mode === 'plain' ? 'Customers Won This Week' : 'Blended Conversions'}
          </span>
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-brand-deep flex items-center justify-center">
            {mode === 'plain' ? <Users className="w-5 h-5" /> : <Target className="w-5 h-5" />}
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-obsidian tracking-tight">
            156
          </span>
          <span className="text-xs text-slateText">buyers</span>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-cloudLine/60">
          <div className="inline-flex items-center gap-1 font-semibold text-status-emerald bg-blue-50 px-2 py-0.5 rounded-full">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+24.8% vs last week</span>
          </div>
          <span className="text-slateText font-medium text-[11px]">
            {mode === 'plain' ? 'Across 4 channels' : 'Conv. Rate 3.82%'}
          </span>
        </div>
      </Card>

      {/* Metric 2: Cost Per Customer / CPA */}
      <Card className="p-6 relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slateText uppercase tracking-wider">
            {mode === 'plain' ? 'Cost Per Customer' : 'Blended CPA & Target'}
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-status-emerald flex items-center justify-center">
            {mode === 'plain' ? <Coins className="w-5 h-5" /> : <Gauge className="w-5 h-5" />}
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-obsidian tracking-tight">
            $23.85
          </span>
          <span className="text-xs text-slateText">
            {mode === 'plain' ? 'avg per buyer' : 'vs $30.00 target'}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-cloudLine/60">
          <div className="inline-flex items-center gap-1 font-semibold text-status-emerald bg-blue-50 px-2 py-0.5 rounded-full">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>-18.2% cost drop</span>
          </div>
          <span className="text-slateText font-medium text-[11px]">
            {mode === 'plain' ? 'AI Auto-Optimized' : 'Eff: +20.5%'}
          </span>
        </div>
      </Card>

      {/* Metric 3: Total Ad Spend / Aggregate Spend */}
      <Card className="p-6 relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slateText uppercase tracking-wider">
            {mode === 'plain' ? 'Total Ad Spend' : 'Aggregate Spend & Freq'}
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-obsidian tracking-tight">
            $3,721.20
          </span>
          <span className="text-xs text-slateText">
            {mode === 'plain' ? '7-day spend' : 'Avg Freq: 1.48'}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-cloudLine/60">
          <div className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
            <span>Pacing 98.4%</span>
          </div>
          <span className="text-slateText font-medium text-[11px]">
            $480.00 / day cap
          </span>
        </div>
      </Card>

      {/* Metric 4: Net Profit / Blended ROAS */}
      <Card className="p-6 relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-deep to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slateText uppercase tracking-wider">
            {mode === 'plain' ? 'Net Profit After Ads' : 'Blended Net ROAS (MER)'}
          </span>
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-obsidian tracking-tight">
            {mode === 'plain' ? '$14,840.00' : '4.98x'}
          </span>
          <span className="text-xs text-slateText">
            {mode === 'plain' ? 'banked profit' : '($14.8k Profit)'}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-cloudLine/60">
          <div className="inline-flex items-center gap-1 font-semibold text-status-emerald bg-blue-50 px-2 py-0.5 rounded-full">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+31.5% margin</span>
          </div>
          <span className="text-slateText font-medium text-[11px]">
            {mode === 'plain' ? 'Zero Ad Trap Waste' : 'LTV/CAC 5.2x'}
          </span>
        </div>
      </Card>
    </div>
  );
};

