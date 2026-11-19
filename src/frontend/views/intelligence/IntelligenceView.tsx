'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, ArrowUpRight, CheckCircle2, Info, Lightbulb, Loader2, PenLine, Play, Plus, ScanSearch, Sparkles, Trash2, Zap, Copy, Check } from 'lucide-react';
import { PlatformBadge } from '@/frontend/components/common/PlatformBadge';
import { AnimatedNumber } from '@/frontend/components/dashboard/ReachOverview';
import { ALL_PLATFORMS, PlatformId, SPECS } from '@/shared/adspec';

interface Insight { id: string; severity: 'critical' | 'warning' | 'opportunity' | 'info'; platform: string; campaignId: string | null; campaignName: string | null; title: string; detail: string; action: null | { type: 'PAUSE' | 'SCALE_UP' | 'SCALE_DOWN'; label: string }; demo: boolean }
interface Rule { id: string; name: string; platform: string; metric: string; operator: string; value: number; minSpend: number; action: string; enabled: boolean; lastRunAt: string | null; lastResult: string | null }
interface Overview { demo: boolean; score: number; targetCpa: number; insights: Insight[]; platforms: { platform: string; spend: number; customers: number; cpa: number | null; roas: number }[]; rules: Rule[]; profile: any; canEdit: boolean; aiCopy: boolean }

const input = 'w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#2A6FE0]';
const lbl = 'block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5';
const card = 'rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5';

const SEV = {
  critical: { cls: 'bg-rose-50 border-rose-200 text-rose-800', icon: AlertTriangle, label: 'Fix now' },
  warning: { cls: 'bg-amber-50 border-amber-200 text-amber-900', icon: AlertTriangle, label: 'Needs attention' },
  opportunity: { cls: 'bg-blue-50 border-blue-200 text-blue-900', icon: Lightbulb, label: 'Opportunity' },
  info: { cls: 'bg-slate-50 border-slate-200 text-slate-700', icon: Info, label: 'Good to know' },
} as const;

const RULE_TEXT = (r: Rule) => `When ${r.platform === 'ALL' ? 'any platform' : SPECS[r.platform as PlatformId]?.short || r.platform} ${r.metric === 'CPA' ? 'cost per customer' : r.metric === 'ROAS' ? 'ROAS' : 'total spend'} is ${r.operator === 'GT' ? 'above' : 'below'} ${r.metric === 'ROAS' ? r.value + '×' : '$' + r.value}${r.minSpend ? ` (after $${r.minSpend} spent)` : ''} → ${r.action === 'PAUSE' ? 'pause it' : r.action === 'SCALE_UP' ? 'raise budget 20%' : 'lower budget 20%'}`;

function ScoreRing({ score }: { score: number }) {
  const r = 52, c = 2 * Math.PI * r;
  const color = score >= 80 ? '#2A6FE0' : score >= 55 ? '#F59E0B' : '#E11D48';
  return (
    <div className="relative w-36 h-36 shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-200 dark:text-slate-800" />
        <motion.circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - score / 100) }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black tabular-nums text-slate-900 dark:text-white"><AnimatedNumber value={score} compact={false} /></span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Health</span>
      </div>
    </div>
  );
}

export default function IntelligenceView() {
  const [data, setData] = useState<Overview | null>(null);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState<'insights' | 'rules' | 'copy' | 'learn' | 'profile'>('insights');
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch('/api/intelligence', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : Promise.reject())).then(setData).catch(() => setFailed(true));
  }, []);
  useEffect(load, [load]);

  const apply = async (i: Insight) => {
    if (!i.action || !i.campaignId) return;
    setBusyId(i.id);
    const r = await fetch('/api/intelligence/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ campaignId: i.campaignId, type: i.action.type }) });
    const d = await r.json().catch(() => ({}));
    setBusyId(null);
    setToast({ ok: !!d.ok, text: d.message || d.error || 'Done.' });
    load();
  };

  if (failed) return <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-900 font-semibold">Could not load AI Intelligence. Check that the database is connected.</div>;
  if (!data) return <p className="flex items-center gap-2 text-sm text-slate-500"><Loader2 size={16} className="animate-spin" /> Analysing your campaigns…</p>;

  const tabs = [['insights', 'Insights', Sparkles], ['rules', 'Automation rules', Zap], ['copy', 'Ad copy writer', PenLine], ['learn', 'Platform comparison', ArrowUpRight], ['profile', 'Business profile', ScanSearch]] as const;
  const counts = { critical: data.insights.filter((i) => i.severity === 'critical').length, warning: data.insights.filter((i) => i.severity === 'warning').length, opportunity: data.insights.filter((i) => i.severity === 'opportunity').length };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pb-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">AI Intelligence</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Plain-language advice from your campaign numbers. You approve every change.</p>
      </div>

      {data.demo && (
        <p className="flex items-start gap-2 text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5"><Info size={14} className="mt-0.5 shrink-0" /> Showing sample campaigns. Create or connect real campaigns to get advice on your own numbers. <Link href="/builder" className="font-bold underline">Create a campaign</Link></p>
      )}
      {toast && <p className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl ${toast.ok ? 'bg-blue-50 text-blue-800' : 'bg-rose-50 text-rose-700'}`}>{toast.ok ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />} {toast.text}</p>}

      <div className={`${card} flex flex-col sm:flex-row items-center gap-6`}>
        <ScoreRing score={data.score} />
        <div className="flex-1 w-full">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{data.score >= 80 ? 'Your ads are in good shape' : data.score >= 55 ? 'A few things need attention' : 'Some campaigns need fixing now'}</h2>
          <p className="text-xs text-slate-500 mt-1">Based on cost per customer (target ${data.targetCpa}), return on ad spend and wasted spend.</p>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[['Fix now', counts.critical, 'text-rose-600'], ['Needs attention', counts.warning, 'text-amber-600'], ['Opportunities', counts.opportunity, 'text-blue-600']].map(([l, n, c]) => (
              <div key={String(l)} className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3 text-center"><p className={`text-2xl font-black tabular-nums ${c}`}>{n as number}</p><p className="text-[10px] font-semibold text-slate-500">{l}</p></div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(([id, label, Icon]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${tab === id ? 'bg-[#153E9E] text-white border-[#153E9E]' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-[#1E57D0]'}`}><Icon size={14} /> {label}</button>
        ))}
      </div>

      {tab === 'insights' && (
        <div className="space-y-3">
          {data.insights.length === 0 && <div className={`${card} text-center text-sm text-slate-600`}>Nothing needs your attention right now. 🎉</div>}
          {data.insights.map((i, idx) => {
            const S = SEV[i.severity];
            const Icon = S.icon;
            return (
              <motion.div key={i.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }} className={`rounded-2xl border p-4 ${S.cls}`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Icon size={18} className="mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 flex items-center gap-1.5">{S.label}{i.platform !== 'ALL' && SPECS[i.platform as PlatformId] && <><PlatformBadge id={i.platform as PlatformId} size={14} /> {SPECS[i.platform as PlatformId].short}</>}</p>
                      <p className="text-sm font-extrabold">{i.title}</p>
                      {i.campaignName && <p className="text-[11px] opacity-70 truncate">{i.campaignName}</p>}
                      <p className="text-xs mt-1 opacity-90 leading-relaxed">{i.detail}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {i.action && data.canEdit && (
                      <button type="button" disabled={busyId === i.id} onClick={() => apply(i)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold border border-black/10 hover:shadow-md disabled:opacity-60 cursor-pointer">{busyId === i.id && <Loader2 size={12} className="animate-spin" />} {i.action.label}</button>
                    )}
                    {i.campaignId && !i.demo && <Link href={`/campaigns/${i.campaignId}`} className="px-4 py-2 rounded-xl bg-white/60 text-xs font-bold border border-black/10">Open</Link>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {tab === 'rules' && <RulesTab rules={data.rules} canEdit={data.canEdit} reload={load} setToast={setToast} />}
      {tab === 'copy' && <CopyTab aiCopy={data.aiCopy} />}

      {tab === 'learn' && (
        <div className={card}>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Which platform brings customers for the least money?</h3>
          <p className="text-xs text-slate-500 mb-4">Cost per customer by platform. Lower is better.</p>
          {data.platforms.filter((p) => p.cpa !== null).length === 0 ? <p className="text-xs text-slate-500">Not enough results yet.</p> : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.platforms.filter((p) => p.cpa !== null).map((p) => ({ name: SPECS[p.platform as PlatformId]?.short || p.platform, 'Cost per customer ($)': p.cpa }))} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" strokeOpacity={0.2} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="Cost per customer ($)" fill="#2A6FE0" radius={[8, 8, 0, 0]} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {data.platforms.map((p) => (
              <div key={p.platform} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950">
                {SPECS[p.platform as PlatformId] && <PlatformBadge id={p.platform as PlatformId} size={30} />}
                <div className="text-xs"><p className="font-bold text-slate-900 dark:text-white">{SPECS[p.platform as PlatformId]?.short || p.platform}</p><p className="text-slate-500">${p.spend} spent · {p.customers} customers · {p.roas}× ROAS</p></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'profile' && <ProfileTab profile={data.profile} reload={load} />}
    </motion.div>
  );
}

function RulesTab({ rules, canEdit, reload, setToast }: { rules: Rule[]; canEdit: boolean; reload: () => void; setToast: (t: { ok: boolean; text: string }) => void }) {
  const [f, setF] = useState({ name: '', platform: 'ALL', metric: 'CPA', operator: 'GT', value: 40, minSpend: 30, action: 'PAUSE' });
  const [busy, setBusy] = useState(false);
  const post = async (body: object) => {
    setBusy(true);
    const r = await fetch('/api/intelligence/rules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    return { ok: r.ok, d };
  };
  const create = async () => {
    const { ok, d } = await post({ ...f, name: f.name || 'My rule' });
    setToast({ ok, text: ok ? 'Rule saved.' : d.error || 'Could not save.' });
    if (ok) reload();
  };
  const run = async () => {
    const { ok, d } = await post({ run: true });
    setToast({ ok, text: ok ? (d.log?.length ? `Applied: ${d.log.join('; ')}` : 'Checked all rules. Nothing needed changing.') : d.error || 'Failed.' });
    reload();
  };
  return (
    <div className="space-y-4">
      <div className={card}>
        <div className="flex items-center justify-between mb-3">
          <div><h3 className="text-sm font-bold text-slate-900 dark:text-white">Your automation rules</h3><p className="text-xs text-slate-500">Rules run once a day automatically, or when you press “Run now”. They only change campaigns created in Adoracle.</p></div>
          {canEdit && rules.length > 0 && <button type="button" disabled={busy} onClick={run} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#153E9E] text-white text-xs font-bold cursor-pointer disabled:opacity-60"><Play size={12} /> Run now</button>}
        </div>
        {rules.length === 0 ? <p className="text-xs text-slate-500">No rules yet. Add one below.</p> : (
          <ul className="space-y-2">
            {rules.map((r) => (
              <li key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                <button type="button" role="switch" aria-checked={r.enabled} disabled={!canEdit} onClick={async () => { await post({ id: r.id, enabled: !r.enabled }); reload(); }} className={`relative w-10 h-6 rounded-full shrink-0 cursor-pointer ${r.enabled ? 'bg-[#2A6FE0]' : 'bg-slate-300'}`}><span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${r.enabled ? 'translate-x-4' : ''}`} /></button>
                <div className="min-w-0 flex-1"><p className="text-xs font-bold text-slate-900 dark:text-white">{r.name}</p><p className="text-[11px] text-slate-500">{RULE_TEXT(r)}</p>{r.lastRunAt && <p className="text-[10px] text-slate-400">Last run {new Date(r.lastRunAt).toLocaleString()} · {r.lastResult}</p>}</div>
                {canEdit && <button type="button" aria-label="Delete rule" onClick={async () => { await fetch(`/api/intelligence/rules?id=${r.id}`, { method: 'DELETE' }); reload(); }} className="text-slate-400 hover:text-rose-600 cursor-pointer"><Trash2 size={15} /></button>}
              </li>
            ))}
          </ul>
        )}
      </div>
      {canEdit && (
        <div className={card}>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Add a rule</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div><span className={lbl}>Name</span><input className={input} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Stop expensive customers" /></div>
            <div><span className={lbl}>Platform</span><select className={input} value={f.platform} onChange={(e) => setF({ ...f, platform: e.target.value })}><option value="ALL">All platforms</option>{ALL_PLATFORMS.map((p) => <option key={p} value={p}>{SPECS[p].short}</option>)}</select></div>
            <div><span className={lbl}>When this measure…</span><select className={input} value={f.metric} onChange={(e) => setF({ ...f, metric: e.target.value })}><option value="CPA">Cost per customer ($)</option><option value="ROAS">Return on ad spend (×)</option><option value="SPEND">Total spend ($)</option></select></div>
            <div><span className={lbl}>…is</span><select className={input} value={f.operator} onChange={(e) => setF({ ...f, operator: e.target.value })}><option value="GT">Above</option><option value="LT">Below</option></select></div>
            <div><span className={lbl}>This number</span><input type="number" min={0} step="0.1" className={input} value={f.value} onChange={(e) => setF({ ...f, value: Number(e.target.value) })} /></div>
            <div><span className={lbl}>Only after spending ($)</span><input type="number" min={0} className={input} value={f.minSpend} onChange={(e) => setF({ ...f, minSpend: Number(e.target.value) })} /></div>
            <div className="sm:col-span-2 lg:col-span-3"><span className={lbl}>Then</span><select className={input} value={f.action} onChange={(e) => setF({ ...f, action: e.target.value })}><option value="PAUSE">Pause the campaign</option><option value="SCALE_UP">Raise daily budget 20%</option><option value="SCALE_DOWN">Lower daily budget 20%</option></select></div>
          </div>
          <button type="button" disabled={busy} onClick={create} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2A6FE0] text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-60 cursor-pointer"><Plus size={14} /> Save rule</button>
        </div>
      )}
    </div>
  );
}

function CopyTab({ aiCopy }: { aiCopy: boolean }) {
  const [f, setF] = useState({ product: '', audience: '', tone: 'friendly', platform: 'META' as PlatformId });
  const [out, setOut] = useState<{ variants: { headline: string; primaryText: string; cta: string }[]; usedAI: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState<number | null>(null);
  const go = async () => {
    setErr(''); setBusy(true);
    const r = await fetch('/api/intelligence/copy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setErr(d.error || 'Could not write copy.');
    setOut(d);
  };
  return (
    <div className="grid lg:grid-cols-5 gap-4">
      <div className={`${card} lg:col-span-2 space-y-3`}>
        <div><span className={lbl}>What are you selling?</span><textarea rows={3} className={input} value={f.product} onChange={(e) => setF({ ...f, product: e.target.value })} placeholder="Handmade leather wallets" /></div>
        <div><span className={lbl}>Who is it for?</span><input className={input} value={f.audience} onChange={(e) => setF({ ...f, audience: e.target.value })} placeholder="Young professionals" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><span className={lbl}>Tone</span><select className={input} value={f.tone} onChange={(e) => setF({ ...f, tone: e.target.value })}>{['friendly', 'professional', 'playful', 'urgent', 'luxury'].map((t) => <option key={t}>{t}</option>)}</select></div>
          <div><span className={lbl}>Platform</span><select className={input} value={f.platform} onChange={(e) => setF({ ...f, platform: e.target.value as PlatformId })}>{ALL_PLATFORMS.map((p) => <option key={p} value={p}>{SPECS[p].short}</option>)}</select></div>
        </div>
        {err && <p className="text-xs font-semibold text-rose-600">{err}</p>}
        <button type="button" disabled={busy} onClick={go} className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#153E9E] text-white text-xs font-bold hover:brightness-110 disabled:opacity-60 cursor-pointer">{busy ? <Loader2 size={14} className="animate-spin" /> : <PenLine size={14} />} Write 3 versions</button>
        <p className="text-[11px] text-slate-400">{aiCopy ? 'Written by Claude, kept within each platform’s character limits.' : 'Using built-in templates. Add an ANTHROPIC_API_KEY on the server for fully AI-written copy.'}</p>
      </div>
      <div className="lg:col-span-3 space-y-3">
        {!out && <div className={`${card} text-xs text-slate-500`}>Your ad versions will appear here. Copy one into the Campaign Builder.</div>}
        {out?.variants.map((v, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className={card}>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white">{v.headline}</p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{v.primaryText}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">{v.cta}</span>
              <button type="button" onClick={() => { navigator.clipboard?.writeText(`${v.headline}\n${v.primaryText}`); setCopied(i); setTimeout(() => setCopied(null), 1500); }} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2A6FE0] cursor-pointer">{copied === i ? <Check size={13} /> : <Copy size={13} />} {copied === i ? 'Copied' : 'Copy'}</button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">{v.headline.length} / {SPECS[f.platform].limits.headline} headline · {v.primaryText.length} / {SPECS[f.platform].limits.primary} text characters</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ProfileTab({ profile, reload }: { profile: any; reload: () => void }) {
  const [url, setUrl] = useState(profile?.websiteUrl || '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [kw, setKw] = useState<string[]>([]);
  const scan = async () => {
    setErr(''); setBusy(true);
    const r = await fetch('/api/intelligence/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setErr(d.error || 'Could not read that website.');
    setKw(d.keywords || []);
    reload();
  };
  return (
    <div className={`${card} space-y-4`}>
      <div><h3 className="text-sm font-bold text-slate-900 dark:text-white">Your business profile</h3><p className="text-xs text-slate-500">Adoracle reads your website to understand what you sell and who to reach. It is used for platform and budget suggestions.</p></div>
      <div className="flex flex-col sm:flex-row gap-2">
        <input className={input} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://yourwebsite.com" />
        <button type="button" disabled={busy || !url} onClick={scan} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#153E9E] text-white text-xs font-bold disabled:opacity-60 cursor-pointer whitespace-nowrap">{busy ? <Loader2 size={14} className="animate-spin" /> : <ScanSearch size={14} />} Scan website</button>
      </div>
      {err && <p className="text-xs font-semibold text-rose-600">{err}</p>}
      {profile && (
        <div className="grid sm:grid-cols-2 gap-3">
          {[['What you sell', profile.offerings], ['Price level', profile.priceTier === 'LOW' ? 'Everyday / low' : profile.priceTier === 'HIGH' ? 'Premium / high' : 'Mid-range'], ['Ideal buyers', profile.targetAudience], ['Where customers are', profile.reachType === 'LOCAL' ? 'Local area' : profile.reachType === 'GLOBAL' ? 'Worldwide' : 'Nationwide']].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3.5"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{k}</p><p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{v}</p></div>
          ))}
        </div>
      )}
      {kw.length > 0 && <div className="flex flex-wrap gap-1.5">{kw.map((k) => <span key={k} className="px-2.5 py-1 rounded-full bg-[#E6F1FF] text-[#153E9E] text-[11px] font-bold">{k}</span>)}</div>}
      {profile && <Link href="/platforms" className="inline-flex text-xs font-bold text-[#2A6FE0] hover:underline">See recommended platforms →</Link>}
    </div>
  );
}
