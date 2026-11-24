'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket, Share2, Plug, Sparkles, ExternalLink, Pause, Play, ChevronDown, Loader2, Layers, ArrowRight, CheckCircle2, Clock, AlertTriangle,
} from 'lucide-react';
import { PlatformBadge } from '@/frontend/components/common/PlatformBadge';
import { ALL_PLATFORMS, PlatformId, SPECS } from '@/shared/adspec';
import { PlatformBlueprint } from '@/shared/blueprint';
import { useConnections, isPlatformConnected } from '@/frontend/hooks/useConnections';
import { useAnalytics, Analytics } from '@/frontend/hooks/useAnalytics';
import { AnimatedNumber } from '@/frontend/components/dashboard/ReachOverview';

interface ApiCampaign {
  id: string;
  platform: PlatformId;
  name: string;
  status: 'ACTIVE' | 'LEARNING' | 'ERROR' | 'PAUSED';
  dailyBudget: number;
  totalSpend: number;
  customersWon: number;
  costPerCustomer: number;
  roas?: number;
  launchStatus?: string;
  launchMessage?: string | null;
  isDraft?: boolean;
  structure?: PlatformBlueprint | null;
}

const MANAGER_URL: Record<PlatformId, string> = {
  META: 'https://adsmanager.facebook.com/',
  TIKTOK: 'https://ads.tiktok.com/',
  GOOGLE: 'https://ads.google.com/',
  YOUTUBE: 'https://ads.google.com/',
  LINKEDIN: 'https://www.linkedin.com/campaignmanager/',
};

const statusStyle: Record<string, string> = {
  ACTIVE: 'bg-blue-100 text-blue-800',
  LEARNING: 'bg-sky-100 text-sky-800',
  PAUSED: 'bg-slate-200 text-slate-700',
  ERROR: 'bg-rose-100 text-rose-700',
};

function PlatformsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const raw = (params.get('p') || 'ALL').toUpperCase();
  const tab: PlatformId | 'ALL' = (ALL_PLATFORMS as string[]).includes(raw) ? (raw as PlatformId) : 'ALL';

  const { connections } = useConnections();
  const { data: all } = useAnalytics(7);
  const { data: one, syncing, sync } = useAnalytics(7, tab === 'ALL' ? 'ALL' : tab);
  const [campaigns, setCampaigns] = useState<ApiCampaign[]>([]);
  const [loadingC, setLoadingC] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [breakdown, setBreakdown] = useState<string>('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadCampaigns = () =>
    fetch('/api/campaigns', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setCampaigns(d.campaigns || []))
      .catch(() => setCampaigns([]))
      .finally(() => setLoadingC(false));

  useEffect(() => {
    loadCampaigns();
  }, []);

  const go = (p: PlatformId | 'ALL') => router.replace(p === 'ALL' ? '/platforms' : `/platforms?p=${p}`, { scroll: false });

  useEffect(() => {
    if (tab !== 'ALL') setBreakdown(SPECS[tab].breakdowns[0]);
  }, [tab]);

  const toggleStatus = async (c: ApiCampaign) => {
    setBusyId(c.id);
    const next = c.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED';
    await fetch('/api/campaigns', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: c.id, status: next }) });
    await loadCampaigns();
    setBusyId(null);
  };

  const byPlatform = useMemo(() => {
    const m = {} as Record<PlatformId, ApiCampaign[]>;
    ALL_PLATFORMS.forEach((p) => (m[p] = campaigns.filter((c) => c.platform === p)));
    return m;
  }, [campaigns]);

  const quick = [
    { href: '/builder', title: 'Create on all platforms', sub: 'One setup, every platform at once', icon: Rocket, primary: true },
    { href: tab === 'ALL' ? '/posts' : `/posts?platform=${tab}`, title: 'Create a social post', sub: 'Write once, publish to many', icon: Share2 },
    { href: '/selector', title: 'AI platform planner', sub: 'Scan your website, get a budget split', icon: Sparkles },
    { href: '/settings?section=connections', title: 'Connect accounts', sub: 'Safe OAuth, tokens encrypted', icon: Plug },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pb-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Platforms</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage each ad platform on its own, or launch the same campaign on all of them in one go.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {quick.map((q) => {
          const Icon = q.icon;
          return (
            <Link
              key={q.title}
              href={q.href}
              className={`group flex items-center gap-3 p-4 rounded-2xl border transition-all hover:-translate-y-0.5 ${
                q.primary
                  ? 'bg-gradient-to-br from-[#153E9E] to-[#2F7DEB] text-white border-transparent shadow-md'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-[#1E57D0]'
              }`}
            >
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${q.primary ? 'bg-white/15' : 'bg-[#E6F1FF] text-[#1E57D0]'}`}>
                <Icon size={18} />
              </span>
              <span className="min-w-0">
                <span className={`block text-sm font-bold ${q.primary ? '' : 'text-slate-900 dark:text-white'}`}>{q.title}</span>
                <span className={`block text-[11px] ${q.primary ? 'text-blue-100' : 'text-slate-500'}`}>{q.sub}</span>
              </span>
            </Link>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {(['ALL', ...ALL_PLATFORMS] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => go(p)}
            className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
              tab === p
                ? 'bg-[#153E9E] text-white border-[#153E9E] shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-[#1E57D0]'
            }`}
          >
            {p !== 'ALL' && <PlatformBadge id={p} size={18} />}
            {p === 'ALL' ? 'All platforms' : SPECS[p].short}
          </button>
        ))}
      </div>

      {/* ALL overview */}
      {tab === 'ALL' && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {ALL_PLATFORMS.map((p, i) => {
            const spec = SPECS[p];
            const connected = isPlatformConnected(connections, p);
            const list = byPlatform[p] || [];
            const d = all?.byPlatform.find((x) => x.platform === p);
            return (
              <motion.div
                key={p}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 flex flex-col"
              >
                <div className="flex items-center gap-3">
                  <PlatformBadge id={p} size={40} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">{spec.name}</h3>
                    <p className="text-[11px] text-slate-500">{spec.managerName}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${connected ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'}`}>
                    {connected ? 'Connected' : 'Not connected'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-2">
                    <p className="text-sm font-extrabold tabular-nums text-slate-900 dark:text-white">
                      <AnimatedNumber value={d?.spend || 0} prefix="$" compact={false} />
                    </p>
                    <p className="text-[10px] text-slate-500">Spend (7d)</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-2">
                    <p className="text-sm font-extrabold tabular-nums text-slate-900 dark:text-white">{d?.roas ? `${d.roas.toFixed(1)}×` : '—'}</p>
                    <p className="text-[10px] text-slate-500">ROAS</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-2">
                    <p className="text-sm font-extrabold tabular-nums text-slate-900 dark:text-white">{list.length}</p>
                    <p className="text-[10px] text-slate-500">Campaigns</p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 mt-3">
                  Structure: {spec.levels.join(' › ')}
                </p>

                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => go(p)}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-bold bg-[#153E9E] text-white hover:brightness-110 transition-all cursor-pointer"
                  >
                    Manage {spec.short}
                  </button>
                  <Link
                    href={`/builder?platform=${p}`}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-[#1E57D0] transition-colors"
                  >
                    New campaign
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Single platform */}
      {tab !== 'ALL' && (
        <PlatformDetail
          platform={tab}
          connected={isPlatformConnected(connections, tab)}
          campaigns={byPlatform[tab] || []}
          loading={loadingC}
          expanded={expanded}
          setExpanded={setExpanded}
          breakdown={breakdown}
          setBreakdown={setBreakdown}
          busyId={busyId}
          toggleStatus={toggleStatus}
          analytics={one}
          syncing={syncing}
          onSync={() => sync(true)}
        />
      )}
    </motion.div>
  );
}

function PlatformDetail(props: {
  platform: PlatformId;
  connected: boolean;
  campaigns: ApiCampaign[];
  loading: boolean;
  expanded: string | null;
  setExpanded: (id: string | null) => void;
  breakdown: string;
  setBreakdown: (b: string) => void;
  busyId: string | null;
  toggleStatus: (c: ApiCampaign) => void;
  analytics: Analytics | null;
  syncing: boolean;
  onSync: () => void;
}) {
  const { platform, connected, campaigns, loading, expanded, setExpanded, breakdown, setBreakdown, busyId, toggleStatus, analytics, syncing, onSync } = props;
  const spec = SPECS[platform];
  const d = analytics?.totals;
  const rows = (analytics?.breakdowns[breakdown || spec.breakdowns[0]] || []).slice(0, 8);
  const card = 'rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`${card} p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4`}>
        <div className="flex items-center gap-3 min-w-0">
          <PlatformBadge id={platform} size={46} />
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{spec.name}</h2>
            <p className="text-xs text-slate-500">
              {connected ? 'Account connected' : 'Not connected yet'} · {spec.managerName}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!connected && (
            <Link href="/settings?section=connections" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#2A6FE0] text-white hover:bg-blue-700 transition-colors">
              <Plug size={14} /> Connect {spec.short}
            </Link>
          )}
          <Link href={`/builder?platform=${platform}`} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#153E9E] text-white hover:brightness-110 transition-all">
            <Rocket size={14} /> New {spec.short} campaign
          </Link>
          <Link href={`/posts?platform=${platform}`} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-[#1E57D0] transition-colors">
            <Share2 size={14} /> Create post
          </Link>
          {connected && (
            <button type="button" disabled={syncing} onClick={onSync} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-500 transition-colors cursor-pointer disabled:opacity-60">{syncing ? 'Syncing…' : 'Sync now'}</button>
          )}
          <a href={MANAGER_URL[platform]} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-[#1E57D0] transition-colors">
            <ExternalLink size={14} /> Open {spec.managerName}
          </a>
        </div>
      </div>

      {!connected && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
          Connect your {spec.short} account to see real results here.
        </p>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { l: 'Spend (7d)', v: d?.spend || 0, prefix: '$', compact: false },
          { l: 'Impressions', v: d?.impressions || 0, compact: true },
          { l: 'Clicks', v: d?.clicks || 0, compact: true },
          { l: 'Results', v: d?.conversions || 0, compact: false },
        ].map((k) => (
          <div key={k.l} className={`${card} p-4`}>
            <p className="text-[11px] font-semibold text-slate-500">{k.l}</p>
            <p className="text-2xl font-extrabold tabular-nums text-slate-900 dark:text-white mt-1">
              <AnimatedNumber value={k.v} prefix={k.prefix} compact={k.compact} />
            </p>
          </div>
        ))}
        <div className={`${card} p-4 bg-gradient-to-br from-[#153E9E] to-[#2F7DEB] !border-transparent`}>
          <p className="text-[11px] font-semibold text-blue-100">ROAS</p>
          <p className="text-2xl font-extrabold tabular-nums text-white mt-1">{d?.roas ? `${d.roas.toFixed(1)}×` : '—'}</p>
        </div>
      </div>

      {/* Levels */}
      <div className={`${card} p-5`}>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Layers size={15} className="text-[#2A6FE0]" /> How {spec.short} organizes ads
        </h3>
        <div className="grid md:grid-cols-3 gap-3">
          {spec.levels.map((lv, i) => (
            <div key={lv} className="relative rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2A6FE0]">Level {i + 1}</span>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">{lv}</p>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{spec.levelHelp[i]}</p>
              {i < 2 && <ArrowRight size={14} className="hidden md:block absolute -right-2.5 top-1/2 -translate-y-1/2 text-slate-300 z-10" />}
            </div>
          ))}
        </div>
      </div>

      {/* Campaigns */}
      <div className={`${card} p-5`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{spec.short} campaigns</h3>
          <Link href={`/builder?platform=${platform}`} className="text-xs font-bold text-[#2A6FE0] hover:underline">
            + New campaign
          </Link>
        </div>
        {loading ? (
          <p className="flex items-center gap-2 text-xs text-slate-500"><Loader2 size={14} className="animate-spin" /> Loading…</p>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No {spec.short} campaigns yet</p>
            <p className="text-xs text-slate-500 mt-1">Create your first one with the builder.</p>
            <Link href={`/builder?platform=${platform}`} className="inline-flex mt-3 px-4 py-2 rounded-xl text-xs font-bold bg-[#153E9E] text-white">
              Create campaign
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {campaigns.map((c) => (
              <div key={c.id} className="rounded-xl border border-slate-200/70 dark:border-slate-800 overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center gap-3 p-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{c.name}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusStyle[c.status]}`}>{c.status}</span>
                      {c.launchStatus === 'QUEUED' && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700"><Clock size={10} /> Draft</span>}
                      {c.launchStatus === 'PUSHED' && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700"><CheckCircle2 size={10} /> Created on platform</span>}
                      {c.launchStatus === 'FAILED' && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700"><AlertTriangle size={10} /> Push failed</span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center text-[11px] md:w-72">
                    <div><p className="font-extrabold text-slate-900 dark:text-white tabular-nums">${c.dailyBudget.toFixed(0)}</p><p className="text-slate-500">Daily</p></div>
                    <div><p className="font-extrabold text-slate-900 dark:text-white tabular-nums">${c.totalSpend.toFixed(0)}</p><p className="text-slate-500">Spent</p></div>
                    <div><p className="font-extrabold text-slate-900 dark:text-white tabular-nums">{c.roas ? `${c.roas}×` : '—'}</p><p className="text-slate-500">ROAS</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busyId === c.id}
                      onClick={() => toggleStatus(c)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-[#1E57D0] transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {c.status === 'PAUSED' ? <Play size={12} /> : <Pause size={12} />}
                      {c.status === 'PAUSED' ? 'Resume' : 'Pause'}
                    </button>
                    {c.structure && (
                      <button
                        type="button"
                        onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                        aria-label="Show campaign structure"
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#1E57D0] transition-colors cursor-pointer"
                      >
                        <ChevronDown size={14} className={`transition-transform ${expanded === c.id ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>
                <AnimatePresence>
                  {expanded === c.id && c.structure && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 pt-1 bg-slate-50 dark:bg-slate-950 text-xs space-y-2">
                        {c.launchMessage && <p className="text-slate-600 dark:text-slate-300">{c.launchMessage}</p>}
                        <p className="font-bold text-slate-900 dark:text-white">
                          {c.structure.levels[0]}: {c.structure.campaign.type} · {c.structure.campaign.nativeObjective}
                        </p>
                        {c.structure.adSets.map((as) => (
                          <div key={as.name} className="ml-3 pl-3 border-l-2 border-[#BBD9FF]">
                            <p className="font-semibold text-slate-800 dark:text-slate-100">{c.structure!.levels[1]}: {as.name}</p>
                            <p className="text-slate-500">{as.audience} · {as.budget !== null ? `$${as.budget}` : 'campaign budget'}</p>
                            {as.ads.map((ad) => (
                              <p key={ad.name} className="ml-3 text-slate-500">↳ {c.structure!.levels[2]}: {ad.headline} ({ad.format})</p>
                            ))}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Breakdowns */}
      <div className={`${card} p-5`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Performance breakdown</h3>
          <div className="flex flex-wrap gap-1.5">
            {spec.breakdowns.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBreakdown(b)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                  breakdown === b ? 'bg-[#153E9E] text-white border-[#153E9E]' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#1E57D0]'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2.5">
          {rows.length === 0 && <p className="text-xs text-slate-500">{connected ? 'No breakdown data for this view yet. Run Sync now after your ads have results.' : 'Connect this platform to see the breakdown.'}</p>}
          {rows.map((r, i) => (
            <div key={`${breakdown}-${r.key}`} className="flex items-center gap-3 text-xs">
              <span className="w-28 sm:w-36 truncate font-semibold text-slate-700 dark:text-slate-200">{r.key}</span>
              <div className="flex-1 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <motion.div
                  key={breakdown}
                  initial={{ width: 0 }}
                  animate={{ width: `${r.share}%` }}
                  transition={{ delay: i * 0.05, duration: 0.7 }}
                  className="h-full rounded-full bg-gradient-to-r from-[#2A6FE0] to-[#7CCBFF]"
                />
              </div>
              <span className="w-12 text-right tabular-nums font-bold text-slate-900 dark:text-white">{r.share.toFixed(0)}%</span>
              <span className="w-20 text-right tabular-nums text-slate-500 hidden sm:block">{r.conversions > 0 ? `$${(r.spend / r.conversions).toFixed(2)} CPA` : `$${r.spend.toFixed(0)} spent`}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 mt-3">Share of results by {breakdown.toLowerCase()} over the last 30 days, from your ad account.</p>
      </div>
    </div>
  );
}

export default function PlatformsPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500">Loading platforms…</div>}>
      <PlatformsContent />
    </Suspense>
  );
}
