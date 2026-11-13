'use client';

import React from 'react';
import { useMode } from '@/components/shared/ModeContext';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
  Wrench,
  Sparkles,
  BarChart2,
  ArrowRight,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const chartData = [
  { name: 'Meta', spend: 1185, customers: 62, cpa: 19 },
  { name: 'TikTok', spend: 532, customers: 36, cpa: 15 },
  { name: 'Google', spend: 898, customers: 42, cpa: 21 },
  { name: 'YouTube', spend: 297, customers: 18, cpa: 17 },
  { name: 'LinkedIn', spend: 1160, customers: 16, cpa: 73 },
];

const alerts = [
  { id: 1, type: 'error', title: 'Broken checkout link detected', desc: '/checkout/v2/pay returns 404 — fix before spending', action: 'Auto-Fix' },
  { id: 2, type: 'error', title: 'Meta Pixel not firing', desc: 'Purchase events missing for 6 hours', action: 'Re-connect' },
  { id: 3, type: 'warning', title: 'TikTok budget pacing low', desc: 'Spark Ad authorization expires in 48 hrs', action: 'Renew' },
];

export default function DashboardPage() {
  const { mode } = useMode();
  const [resolved, setResolved] = React.useState<number[]>([]);

  const kpis = [
    {
      label: mode === 'plain' ? 'Customers Won' : 'Conversions',
      value: '156',
      unit: 'this week',
      change: '+24.8%',
      up: true,
      icon: Users,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
    },
    {
      label: mode === 'plain' ? 'Cost Per Customer' : 'Blended CPA',
      value: '$23.85',
      unit: mode === 'plain' ? 'per buyer' : 'vs $30 target',
      change: '-18.2%',
      up: false,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Total Ad Spend',
      value: '$3,721',
      unit: '7-day total',
      change: 'Pacing 98%',
      up: true,
      icon: BarChart2,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: mode === 'plain' ? 'Net Profit After Ads' : 'Blended ROAS',
      value: mode === 'plain' ? '$14,840' : '4.98×',
      unit: mode === 'plain' ? 'banked profit' : 'return on spend',
      change: '+31.5%',
      up: true,
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Page header */}
      <div className="flex items-start justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Good evening, Alex 👋</h1>
          <p className="text-slate-500 mt-1 text-sm">Here&apos;s how your campaigns are performing today.</p>
        </div>
        <Link
          href="/studio"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold transition-all shadow-md shadow-sky-200"
        >
          <Zap className="w-4 h-4" />
          New Campaign
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  kpi.up
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-sky-50 text-sky-700'
                }`}>
                  {kpi.change}
                </span>
              </div>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">{kpi.value}</div>
              <div className="mt-1 text-xs text-slate-400 font-medium">{kpi.label}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{kpi.unit}</div>
            </div>
          );
        })}
      </div>

      {/* Main 2-col grid */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Chart — 3 cols */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Channel Performance</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {mode === 'plain' ? 'Customers won vs. money spent' : 'CPA vs. spend by platform'}
              </p>
            </div>
            <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">Last 7 days</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barSize={28} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1E293B', border: 'none', borderRadius: '12px', color: '#F8FAFC', fontSize: '12px' }}
                cursor={{ fill: '#F8FAFC' }}
              />
              <Bar dataKey="customers" name={mode === 'plain' ? 'Customers' : 'Conversions'} fill="#38BDF8" radius={[6, 6, 0, 0]} />
              <Bar dataKey="cpa" name="Cost/Customer ($)" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Action Center — 2 cols */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-900">Action Center</h2>
            {resolved.length === alerts.length ? (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">All clear ✓</span>
            ) : (
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                {alerts.length - resolved.length} urgent
              </span>
            )}
          </div>

          <div className="space-y-3">
            {alerts.map((alert) => {
              const done = resolved.includes(alert.id);
              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border transition-all ${
                    done
                      ? 'bg-slate-50 border-slate-200 opacity-50'
                      : alert.type === 'error'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      done ? 'bg-emerald-100' : alert.type === 'error' ? 'bg-red-100' : 'bg-amber-100'
                    }`}>
                      {done
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        : alert.type === 'error'
                        ? <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                        : <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {alert.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{alert.desc}</p>
                    </div>
                  </div>
                  {!done && (
                    <button
                      onClick={() => setResolved((p) => [...p, alert.id])}
                      className={`mt-3 w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        alert.type === 'error'
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-amber-500 hover:bg-amber-600 text-white'
                      }`}
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      {alert.action}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { href: '/selector', title: 'AI Platform Selector', desc: 'Find the best channels for your business', color: 'sky' },
          { href: '/intelligence', title: 'AI Learning Loop', desc: '94.2% prediction accuracy — see what works', color: 'purple' },
          { href: '/seo', title: 'SEO & Safety Guard', desc: 'Check for broken links before you spend', color: 'emerald' },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-md hover:border-slate-300 transition-all flex items-center justify-between"
          >
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">{card.title}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{card.desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500 transition-colors flex-shrink-0 ml-3" />
          </Link>
        ))}
      </div>
    </div>
  );
}

