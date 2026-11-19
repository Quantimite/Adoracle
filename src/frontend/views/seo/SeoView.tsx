'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, Link2, Loader2, ScanSearch, ShieldCheck, XCircle, RefreshCw, Gauge } from 'lucide-react';
import { AnimatedNumber } from '@/frontend/components/dashboard/ReachOverview';

type Status = 'pass' | 'warn' | 'fail';
interface Check { id: string; group: string; label: string; status: Status; detail: string; fix?: string }
interface Audit { url: string; finalUrl: string; score: number; checks: Check[]; title: string; description: string; trackers: Record<string, boolean>; brokenLinks: { url: string; status: number }[]; speed: { performance: number | null; lcp: string | null; cls: string | null; tbt: string | null } | null; pageKb: number; auditedAt: string }
interface LinkRow { url: string; statusCode: number; isHealthy: boolean; responseMs: number; checkedAt: string }
interface GuardResult { url: string; statusCode: number; ok: boolean; problem?: string; responseMs: number; used: number; autoPaused: boolean }

const input = 'w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#2A6FE0]';
const card = 'rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5';
const ICON = { pass: <CheckCircle2 size={16} className="text-blue-600 shrink-0" />, warn: <AlertTriangle size={16} className="text-amber-500 shrink-0" />, fail: <XCircle size={16} className="text-rose-600 shrink-0" /> };

function Ring({ score }: { score: number }) {
  const r = 52, c = 2 * Math.PI * r;
  const color = score >= 80 ? '#2A6FE0' : score >= 55 ? '#F59E0B' : '#E11D48';
  return (
    <div className="relative w-36 h-36 shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-200 dark:text-slate-800" />
        <motion.circle key={score} cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - score / 100) }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-black tabular-nums text-slate-900 dark:text-white"><AnimatedNumber value={score} compact={false} /></span><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Score</span></div>
    </div>
  );
}

export default function SeoView() {
  const [tab, setTab] = useState<'audit' | 'guard' | 'check'>('guard');
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pb-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">SEO & Safety</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Make sure the pages your ads send people to work, load fast and can track results.</p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {([['guard', 'Link Guard', ShieldCheck], ['audit', 'Website audit', ScanSearch], ['check', 'Quick link check', Link2]] as const).map(([id, label, Icon]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${tab === id ? 'bg-[#153E9E] text-white border-[#153E9E]' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-[#1E57D0]'}`}><Icon size={14} /> {label}</button>
        ))}
      </div>
      {tab === 'guard' && <GuardTab />}
      {tab === 'audit' && <AuditTab />}
      {tab === 'check' && <CheckTab />}
    </motion.div>
  );
}

/* ---------------- Link Guard ---------------- */
function GuardTab() {
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [guard, setGuard] = useState(true);
  const [running, setRunning] = useState(false);
  const [res, setRes] = useState<{ checked: number; broken: number; paused: number; results: GuardResult[] } | null>(null);
  const [fix, setFix] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(() => {
    fetch('/api/seo/history', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).then((d) => { if (d) { setLinks(d.links || []); setGuard(d.linkGuard); } });
  }, []);
  useEffect(load, [load]);

  const scan = async () => {
    setRunning(true); setMsg(null);
    const r = await fetch('/api/seo/link-guard', { method: 'POST' });
    const d = await r.json().catch(() => ({}));
    setRunning(false);
    if (!r.ok) return setMsg({ ok: false, text: d.error || 'Scan failed.' });
    setRes(d); load();
  };
  const toggle = async () => {
    const next = !guard; setGuard(next);
    await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ section: 'preferences', linkGuard: next }) });
  };
  const replace = async (oldUrl: string) => {
    setMsg(null);
    const r = await fetch('/api/seo/replace-url', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ oldUrl, newUrl: fix[oldUrl] }) });
    const d = await r.json().catch(() => ({}));
    setMsg({ ok: r.ok, text: r.ok ? `Updated ${d.adsUpdated} ad(s) and ${d.campaignsUpdated} campaign(s).` : d.error || 'Could not update.' });
    if (r.ok) scan();
  };

  const rows: { url: string; ok: boolean; status: number; problem?: string; ms: number; used?: number; paused?: boolean }[] = res
    ? res.results.map((x) => ({ url: x.url, ok: x.ok, status: x.statusCode, problem: x.problem, ms: x.responseMs, used: x.used, paused: x.autoPaused }))
    : links.map((l) => ({ url: l.url, ok: l.isHealthy, status: l.statusCode, ms: l.responseMs }));
  const broken = rows.filter((r) => !r.ok);

  return (
    <div className="space-y-4">
      <div className={`${card} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Protect your ad spend</h2>
          <p className="text-xs text-slate-500 mt-0.5">Link Guard opens the destination link of every campaign and ad you created here, and catches 404 pages before customers do.</p>
        </div>
        <button type="button" disabled={running} onClick={scan} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#153E9E] text-white text-xs font-bold hover:brightness-110 disabled:opacity-60 cursor-pointer whitespace-nowrap">{running ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Check my ad links now</button>
      </div>

      <label className={`${card} flex items-start gap-3 cursor-pointer`}>
        <button type="button" role="switch" aria-checked={guard} onClick={toggle} className={`relative w-11 h-6 rounded-full shrink-0 mt-0.5 cursor-pointer ${guard ? 'bg-[#2A6FE0]' : 'bg-slate-300'}`}><span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${guard ? 'translate-x-5' : ''}`} /></button>
        <span><span className="block text-sm font-bold text-slate-900 dark:text-white">Automatically pause ads with a broken link</span><span className="block text-xs text-slate-500">When a check finds a page that does not open, the ads and campaigns using it are paused so no money is wasted. You can resume them after fixing the link.</span></span>
      </label>

      {msg && <p className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl ${msg.ok ? 'bg-blue-50 text-blue-800' : 'bg-rose-50 text-rose-700'}`}>{msg.ok ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />} {msg.text}</p>}
      {res && <p className={`text-xs font-bold px-4 py-2.5 rounded-xl ${res.broken ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-800'}`}>{res.checked === 0 ? 'No ad links to check yet. Create a campaign first.' : res.broken ? `${res.broken} of ${res.checked} links are broken${res.paused ? ` · ${res.paused} auto-paused` : ''}.` : `All ${res.checked} links work.`}</p>}

      <div className={card}>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Your ad links</h3>
        {rows.length === 0 ? <p className="text-xs text-slate-500">No links checked yet. Press “Check my ad links now”. Links come from the campaigns you create in the <Link href="/builder" className="font-bold text-[#2A6FE0] underline">Campaign Builder</Link>.</p> : (
          <ul className="space-y-2">
            {rows.map((r) => (
              <li key={r.url} className={`p-3 rounded-xl border ${r.ok ? 'bg-slate-50 dark:bg-slate-950 border-slate-200/60 dark:border-slate-800' : 'bg-rose-50 border-rose-200'}`}>
                <div className="flex items-center gap-3">
                  {r.ok ? ICON.pass : ICON.fail}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{r.url}</p>
                    <p className="text-[11px] text-slate-500">{r.ok ? `Works · ${r.ms} ms` : r.problem || `Problem (status ${r.status || 'no answer'})`}{r.paused ? ' · ads paused' : ''}</p>
                  </div>
                  <span className={`text-[11px] font-black tabular-nums ${r.ok ? 'text-blue-700' : 'text-rose-700'}`}>{r.status || '—'}</span>
                </div>
                {!r.ok && (
                  <div className="flex flex-col sm:flex-row gap-2 mt-3">
                    <input className={input} value={fix[r.url] || ''} onChange={(e) => setFix({ ...fix, [r.url]: e.target.value })} placeholder="Working replacement link (https://…)" />
                    <button type="button" disabled={!fix[r.url]} onClick={() => replace(r.url)} className="px-4 py-2.5 rounded-xl bg-[#2A6FE0] text-white text-xs font-bold disabled:opacity-50 cursor-pointer whitespace-nowrap">Replace in all ads</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        {broken.length === 0 && rows.length > 0 && <p className="text-xs text-blue-700 font-semibold mt-3">Everything is working. 🎉</p>}
      </div>
    </div>
  );
}

/* ---------------- Website audit ---------------- */
function AuditTab() {
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [a, setA] = useState<Audit | null>(null);
  const [hist, setHist] = useState<{ id: string; url: string; healthScore: number; auditedAt: string }[]>([]);
  useEffect(() => { fetch('/api/seo/history').then((r) => (r.ok ? r.json() : null)).then((d) => d && setHist(d.audits || [])); }, [a]);

  const run = async (u = url) => {
    setErr(''); setBusy(true);
    const r = await fetch('/api/seo/audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: u }) });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setErr(d.error || 'Could not audit that website.');
    setA(d.audit);
  };

  const groups = ['Ad tracking', 'Technical', 'Content', 'Speed'];
  return (
    <div className="space-y-4">
      <div className={card}>
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Check any web page</h2>
        <p className="text-xs text-slate-500 mb-3">We look at the page like a visitor and a search engine would. Takes about 20–30 seconds.</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input className={input} value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && url && run()} placeholder="https://yourwebsite.com/landing-page" />
          <button type="button" disabled={busy || !url} onClick={() => run()} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#153E9E] text-white text-xs font-bold disabled:opacity-60 cursor-pointer whitespace-nowrap">{busy ? <Loader2 size={14} className="animate-spin" /> : <ScanSearch size={14} />} {busy ? 'Checking…' : 'Run audit'}</button>
        </div>
        {err && <p className="text-xs font-semibold text-rose-600 mt-2">{err}</p>}
        {hist.length > 0 && !a && (
          <div className="mt-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Recent</p><div className="flex flex-wrap gap-2">{hist.map((h) => <button key={h.id} type="button" onClick={() => { setUrl(h.url); run(h.url); }} className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">{h.url.replace(/^https?:\/\//, '').slice(0, 32)} · {h.healthScore}</button>)}</div></div>
        )}
      </div>

      {a && (
        <>
          <div className={`${card} flex flex-col sm:flex-row items-center gap-6`}>
            <Ring score={a.score} />
            <div className="flex-1 min-w-0 w-full">
              <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">{a.title || a.finalUrl}</p>
              <p className="text-xs text-slate-500 truncate">{a.finalUrl}</p>
              <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                {(['pass', 'warn', 'fail'] as Status[]).map((s) => <div key={s} className="rounded-xl bg-slate-50 dark:bg-slate-950 p-2.5"><p className="text-xl font-black tabular-nums text-slate-900 dark:text-white">{a.checks.filter((c) => c.status === s).length}</p><p className="text-[10px] font-semibold text-slate-500">{s === 'pass' ? 'Good' : s === 'warn' ? 'Improve' : 'Fix'}</p></div>)}
              </div>
              {a.speed?.performance != null && <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5"><Gauge size={13} /> Mobile speed {a.speed.performance}/100 · LCP {a.speed.lcp} · CLS {a.speed.cls}</p>}
            </div>
          </div>

          <div className={card}>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Can your ads track results on this page?</h3>
            <p className="text-xs text-slate-500 mb-3">Without a tracking pixel, platforms cannot optimize for purchases or leads.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[['meta', 'Meta Pixel'], ['google', 'Google tag'], ['tiktok', 'TikTok Pixel'], ['linkedin', 'LinkedIn Insight']].map(([k, l]) => (
                <div key={k} className={`rounded-xl p-3 text-center border ${a.trackers[k] ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'}`}>
                  <div className="flex justify-center">{a.trackers[k] ? ICON.pass : ICON.warn}</div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">{l}</p>
                  <p className="text-[10px] text-slate-500">{a.trackers[k] ? 'Installed' : 'Not found'}</p>
                </div>
              ))}
            </div>
          </div>

          {groups.map((g) => {
            const list = a.checks.filter((c) => c.group === g && !c.id.startsWith('track-'));
            if (!list.length) return null;
            return (
              <div key={g} className={card}>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">{g}</h3>
                <ul className="space-y-3">
                  {list.map((c) => (
                    <li key={c.id} className="flex items-start gap-3">
                      {ICON[c.status]}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{c.label} <span className="font-normal text-slate-500">· {c.detail}</span></p>
                        {c.status !== 'pass' && c.fix && <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 flex items-start gap-1.5"><Info size={11} className="mt-0.5 shrink-0" /> {c.fix}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
                {g === 'Technical' && a.brokenLinks.length > 0 && (
                  <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200"><p className="text-xs font-bold text-rose-800 mb-1">Broken links found</p>{a.brokenLinks.map((b) => <p key={b.url} className="text-[11px] text-rose-700 truncate">{b.status || 'no answer'} · {b.url}</p>)}</div>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

/* ---------------- Quick link check ---------------- */
function CheckTab() {
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [r, setR] = useState<any>(null);
  const go = async () => {
    setErr(''); setR(null); setBusy(true);
    const res = await fetch('/api/seo/check-url', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setErr(d.error || 'Could not check that link.');
    setR(d.result);
  };
  return (
    <div className="space-y-4">
      <div className={card}>
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Is this link OK to advertise?</h2>
        <p className="text-xs text-slate-500 mb-3">Paste any link. We follow redirects and tell you what a visitor would see.</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input className={input} value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && url && go()} placeholder="https://yourstore.com/offer" />
          <button type="button" disabled={busy || !url} onClick={go} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#153E9E] text-white text-xs font-bold disabled:opacity-60 cursor-pointer">{busy && <Loader2 size={14} className="animate-spin" />} Check link</button>
        </div>
        {err && <p className="text-xs font-semibold text-rose-600 mt-2">{err}</p>}
      </div>
      {r && (
        <div className={card}>
          <div className="flex items-center gap-3">{r.ok ? ICON.pass : ICON.fail}<p className="text-sm font-extrabold text-slate-900 dark:text-white">{r.ok ? 'This link works' : r.problem || 'This link has a problem'}</p></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-center">
            {[['Status', r.statusCode || '—'], ['Speed', `${r.responseMs} ms`], ['Redirects', r.redirects], ['Secure', r.https ? 'Yes' : 'No']].map(([k, v]) => <div key={String(k)} className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3"><p className="text-lg font-black text-slate-900 dark:text-white">{v}</p><p className="text-[10px] font-semibold text-slate-500">{k}</p></div>)}
          </div>
          {r.chain?.length > 1 && <div className="mt-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Path followed</p>{r.chain.map((c: any, i: number) => <p key={i} className="text-[11px] text-slate-600 dark:text-slate-300 truncate">{c.status || '—'} · {c.url}</p>)}</div>}
        </div>
      )}
    </div>
  );
}
