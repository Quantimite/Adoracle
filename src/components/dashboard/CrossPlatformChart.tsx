'use client';

import React, { useState, useEffect } from 'react';
import { useMode } from '@/components/shared/ModeContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { Layers, Sparkles, Filter } from 'lucide-react';

const chartData = [
  {
    platform: 'Meta / IG',
    spend: 1185.4,
    customersWon: 62,
    cpa: 19.12,
    roas: 4.8,
    efficiencyScore: 88,
  },
  {
    platform: 'TikTok',
    spend: 532.8,
    customersWon: 36,
    cpa: 14.80,
    roas: 5.1,
    efficiencyScore: 94,
  },
  {
    platform: 'Google Search',
    spend: 898.8,
    customersWon: 42,
    cpa: 21.40,
    roas: 4.4,
    efficiencyScore: 82,
  },
  {
    platform: 'YouTube Shorts',
    spend: 297.0,
    customersWon: 18,
    cpa: 16.50,
    roas: 3.9,
    efficiencyScore: 78,
  },
  {
    platform: 'LinkedIn ABM',
    spend: 1160.0,
    customersWon: 16,
    cpa: 72.50,
    roas: 6.2,
    efficiencyScore: 71,
  },
];

export const CrossPlatformChart: React.FC = () => {
  const { mode } = useMode();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <div className="w-4 h-4 border-2 border-brand-pulse border-t-transparent rounded-full animate-spin" />
          <span>Synchronizing Cross-Platform Ad Metrics...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-deep" />
            <span>Cross-Platform Spend & Performance Efficiency</span>
          </CardTitle>
          <CardDescription>
            {mode === 'plain'
              ? 'Compare how many real customers each ad network won and how efficiently your dollars were spent'
              : 'Multi-network channel efficiency analysis: ROAS, CPA, and volume comparison'}
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-50 text-brand-deep border border-sky-200/80 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>70/30 Balanced Mix</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            {mode === 'plain' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis 
                  dataKey="platform" 
                  stroke="#64748B" 
                  fontSize={12} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#64748B" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip
                  formatter={(value: any, name: string) => {
                    if (name === 'Customers Won') return [`${value} buyers`, name];
                    if (name === 'Spend ($)') return [`$${value.toFixed(2)}`, name];
                    return [value, name];
                  }}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '0.75rem',
                    border: '1px solid #334155',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} 
                />
                <Bar 
                  dataKey="customersWon" 
                  name="Customers Won" 
                  fill="#0284C7" 
                  radius={[6, 6, 0, 0]} 
                />
                <Bar 
                  dataKey="efficiencyScore" 
                  name="Efficiency Score (0-100)" 
                  fill="#10B981" 
                  radius={[6, 6, 0, 0]} 
                />
              </BarChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis 
                  dataKey="platform" 
                  stroke="#64748B" 
                  fontSize={12} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#64748B" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip
                  formatter={(value: any, name: string) => {
                    if (name === 'ROAS') return [`${value}x`, name];
                    if (name === 'CPA ($)') return [`$${value}`, name];
                    return [value, name];
                  }}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '0.75rem',
                    border: '1px solid #334155',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} 
                />
                <Bar 
                  dataKey="roas" 
                  name="ROAS" 
                  fill="#38BDF8" 
                  radius={[6, 6, 0, 0]} 
                />
                <Bar 
                  dataKey="cpa" 
                  name="CPA ($)" 
                  fill="#F59E0B" 
                  radius={[6, 6, 0, 0]} 
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Channel Summary Badges */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6 pt-6 border-t border-cloudLine">
          {chartData.map((item) => (
            <div key={item.platform} className="p-3 rounded-xl bg-frostCanvas border border-cloudLine">
              <span className="text-[11px] font-bold text-obsidian block truncate">{item.platform}</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xs text-slateText">Spend:</span>
                <span className="text-xs font-bold text-obsidian">${item.spend.toFixed(0)}</span>
              </div>
              <div className="mt-0.5 flex items-baseline justify-between">
                <span className="text-xs text-slateText">CPA:</span>
                <span className="text-xs font-bold text-status-emerald">${item.cpa.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

