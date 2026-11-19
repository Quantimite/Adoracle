'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Bell, CreditCard, Download, Loader2, Plug, ShieldCheck, SlidersHorizontal, Trash2, Users, UserCircle, CheckCircle2, AlertTriangle, Building2, Mail } from 'lucide-react';
import { ConnectionsPanel } from '@/frontend/components/connections/ConnectionsPanel';
import { useTheme } from '@/frontend/context/ThemeContext';

type Section = 'preferences' | 'workspace' | 'connections' | 'notifications' | 'billing' | 'privacy';

interface SettingsData {
  role: 'OWNER' | 'ADMIN' | 'VIEWER';
  email: string;
  preferences: { currency: string; plainLanguage: boolean; linkGuard: boolean };
  notifications: Record<string, boolean>;
  workspace: { name: string; billingEmail: string; taxId: string };
  members: { id: string; userId: string; role: string; name: string | null; email: string; isYou: boolean }[];
  invites: { id: string; email: string; role: string }[];
  consents: { id: string; provider: string; features: string[]; version: string; grantedAt: string; revokedAt: string | null }[];
}

const NAV: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'connections', label: 'Connected accounts', icon: Plug },
  { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
  { id: 'workspace', label: 'Workspace & team', icon: Users },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'billing', label: 'Billing details', icon: CreditCard },
  { id: 'privacy', label: 'Privacy & data', icon: ShieldCheck },
];

const NOTIF_LABELS: Record<string, [string, string]> = {
  brokenLinks: ['Broken ad links', 'When a landing page stops working'],
  overspend: ['Overspending or wasted spend', 'When a campaign spends without results'],
  campaignErrors: ['Campaign errors', 'When a platform rejects or errors a campaign'],
  ruleActions: ['Automation actions', 'When one of your rules pauses or changes a campaign'],
  weeklyReport: ['Weekly summary', 'A short recap of reach, spend and results'],
  productNews: ['Product news', 'New Adoracle features'],
};

const input = 'w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#2A6FE0]';
const lbl = 'block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5';
const card = 'rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6';

function Toggle({ on, onChange, disabled }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={on} disabled={disabled} onClick={() => onChange(!on)} className={`relative w-11 h-6 rounded-full shrink-0 transition-colors cursor-pointer disabled:opacity-50 ${on ? 'bg-[#2A6FE0]' : 'bg-slate-300 dark:bg-slate-700'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : ''}`} />
    </button>
  );
}

function Msg({ m }: { m: { ok: boolean; text: string } | null }) {
  if (!m) return null;
  return <p className={`flex items-start gap-2 text-xs font-semibold ${m.ok ? 'text-blue-700' : 'text-rose-600'}`}>{m.ok ? <CheckCircle2 size={14} className="mt-0.5 shrink-0" /> : <AlertTriangle size={14} className="mt-0.5 shrink-0" />} {m.text}</p>;
}

async function send(method: string, url: string, body?: object) {
  const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const d = await r.json().catch(() => ({}));
  return { ok: r.ok, d };
}

function SettingsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const [section, setSection] = useState<Section>('connections');
  const [data, setData] = useState<SettingsData | null>(null);
  const [failed, setFailed] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [wsName, setWsName] = useState('');
  const [bill, setBill] = useState({ billingEmail: '', taxId: '' });
  const [invite, setInvite] = useState({ email: '', role: 'VIEWER' });
  const [confirmEmail, setConfirmEmail] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const s = params.get('section');
    if (s && NAV.some((n) => n.id === s)) setSection(s as Section);
  }, [params]);
  useEffect(() => setMsg(null), [section]);

  const load = useCallback(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: SettingsData) => { setData(d); setWsName(d.workspace.name || ''); setBill({ billingEmail: d.workspace.billingEmail, taxId: d.workspace.taxId }); })
      .catch(() => setFailed(true));
  }, []);
  useEffect(load, [load]);

  const save = async (body: object, ok = 'Saved.') => {
    setBusy(true);
    const r = await send('PATCH', '/api/settings', body);
    setBusy(false);
    setMsg({ ok: r.ok, text: r.ok ? ok : r.d.error || 'Could not save.' });
    if (r.ok) load();
    return r.ok;
  };

  const canEdit = data?.role === 'OWNER' || data?.role === 'ADMIN';
  const isOwner = data?.role === 'OWNER';

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pb-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Connect accounts, set preferences and manage your team. Your name, photo and password are on <Link href="/profile" className="font-bold text-[#2A6FE0] underline">My profile</Link>.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-5">
        <nav className="lg:col-span-1 flex lg:flex-col gap-1.5 overflow-x-auto pb-1" aria-label="Settings sections">
          {NAV.map((n) => {
            const Icon = n.icon;
            return (
              <button key={n.id} type="button" onClick={() => { setSection(n.id); router.replace(`/settings?section=${n.id}`, { scroll: false }); }} className={`shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${section === n.id ? 'bg-[#153E9E] text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:border-[#1E57D0]'}`}>
                <Icon size={15} /> {n.label}
              </button>
            );
          })}
        </nav>

        <div className="lg:col-span-3 space-y-4">
          {section === 'connections' && <div className={card}><ConnectionsPanel /></div>}

          {section !== 'connections' && failed && <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-900 font-semibold">Could not load your settings. Check that the database is connected.</div>}
          {section !== 'connections' && !failed && !data && <p className="flex items-center gap-2 text-sm text-slate-500"><Loader2 size={16} className="animate-spin" /> Loading…</p>}

          {data && section === 'preferences' && (
            <div className={`${card} space-y-5`}>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Preferences</h2>
              <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-bold text-slate-900 dark:text-white">Dark mode</p><p className="text-xs text-slate-500">Easier on the eyes at night.</p></div><Toggle on={theme === 'dark'} onChange={() => toggleTheme()} /></div>
              <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-bold text-slate-900 dark:text-white">Plain-language mode</p><p className="text-xs text-slate-500">Explain ads results in simple words.</p></div><Toggle on={data.preferences.plainLanguage} onChange={(v) => save({ section: 'preferences', plainLanguage: v })} /></div>
              <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-bold text-slate-900 dark:text-white">Link Guard auto-pause</p><p className="text-xs text-slate-500">Pause ads automatically if their link breaks. <Link href="/seo" className="font-bold text-[#2A6FE0] underline">Open SEO & Safety</Link></p></div><Toggle on={data.preferences.linkGuard} onChange={(v) => save({ section: 'preferences', linkGuard: v })} /></div>
              <div className="max-w-xs"><label className={lbl}>Display currency</label>
                <select className={input} value={data.preferences.currency || 'USD ($)'} onChange={(e) => save({ section: 'preferences', currency: e.target.value })}>{['USD ($)', 'LKR (Rs)', 'EUR (€)', 'GBP (£)', 'INR (₹)', 'AUD ($)', 'AED (AED)'].map((c) => <option key={c}>{c}</option>)}</select>
                <p className="text-[11px] text-slate-400 mt-1">Budgets on ad platforms use each ad account’s own currency.</p>
              </div>
              <Msg m={msg} />
            </div>
          )}

          {data && section === 'workspace' && (
            <>
              <div className={`${card} space-y-4`}>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2"><Building2 size={16} className="text-[#2A6FE0]" /> Workspace</h2>
                <div className="max-w-md"><label className={lbl}>Workspace name</label><input className={input} value={wsName} disabled={!canEdit} onChange={(e) => setWsName(e.target.value)} /></div>
                <p className="text-[11px] text-slate-500">Your role: <b>{data.role}</b>. Owners and admins can change settings, connect accounts and edit campaigns. Viewers can only look.</p>
                <button type="button" disabled={!canEdit || busy} onClick={() => save({ section: 'workspace', name: wsName }, 'Workspace renamed.')} className="px-5 py-2.5 rounded-xl bg-[#2A6FE0] text-white text-xs font-bold disabled:opacity-50 cursor-pointer">Save name</button>
                <Msg m={msg} />
              </div>

              <div className={`${card} space-y-4`}>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2"><Users size={16} className="text-[#2A6FE0]" /> Team</h2>
                <ul className="space-y-2">
                  {data.members.map((m) => (
                    <li key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950">
                      <span className="w-8 h-8 rounded-full bg-[#E6F1FF] text-[#153E9E] text-xs font-black flex items-center justify-center">{(m.name || m.email)[0].toUpperCase()}</span>
                      <div className="min-w-0 flex-1"><p className="text-xs font-bold text-slate-900 dark:text-white truncate">{m.name || m.email}{m.isYou ? ' (you)' : ''}</p><p className="text-[11px] text-slate-500 truncate">{m.email}</p></div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{m.role}</span>
                      {isOwner && !m.isYou && <button type="button" aria-label="Remove member" onClick={async () => { if (window.confirm('Remove this person from the workspace?')) { await send('DELETE', `/api/settings/team?memberId=${m.id}`); load(); } }} className="text-slate-400 hover:text-rose-600 cursor-pointer"><Trash2 size={15} /></button>}
                    </li>
                  ))}
                  {data.invites.map((i) => (
                    <li key={i.id} className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                      <Mail size={16} className="text-slate-400" /><div className="min-w-0 flex-1"><p className="text-xs font-bold text-slate-900 dark:text-white truncate">{i.email}</p><p className="text-[11px] text-slate-500">Invited · waiting for them to sign up</p></div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">{i.role}</span>
                      {isOwner && <button type="button" aria-label="Cancel invite" onClick={async () => { await send('DELETE', `/api/settings/team?inviteId=${i.id}`); load(); }} className="text-slate-400 hover:text-rose-600 cursor-pointer"><Trash2 size={15} /></button>}
                    </li>
                  ))}
                </ul>
                {canEdit && (
                  <div className="grid sm:grid-cols-[1fr_auto_auto] gap-2">
                    <input className={input} type="email" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} placeholder="teammate@company.com" />
                    <select className={input} value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value })}><option value="VIEWER">Viewer</option><option value="ADMIN">Admin</option></select>
                    <button type="button" disabled={!invite.email || busy} onClick={async () => { setBusy(true); const r = await send('POST', '/api/settings/team', invite); setBusy(false); setMsg({ ok: r.ok, text: r.ok ? r.d.note : r.d.error }); if (r.ok) { setInvite({ email: '', role: 'VIEWER' }); load(); } }} className="px-5 py-2.5 rounded-xl bg-[#153E9E] text-white text-xs font-bold disabled:opacity-50 cursor-pointer">Invite</button>
                  </div>
                )}
                <Msg m={msg} />
              </div>
            </>
          )}

          {data && section === 'notifications' && (
            <div className={`${card} space-y-4`}>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Notifications</h2>
              <p className="text-xs text-slate-500">Choose what appears in your notification bell. Email delivery is not set up yet.</p>
              {Object.entries(NOTIF_LABELS).map(([k, [t, d]]) => (
                <div key={k} className="flex items-center justify-between gap-4"><div><p className="text-sm font-bold text-slate-900 dark:text-white">{t}</p><p className="text-xs text-slate-500">{d}</p></div>
                  <Toggle on={!!data.notifications[k]} onChange={(v) => save({ section: 'notifications', prefs: { ...data.notifications, [k]: v } })} /></div>
              ))}
              <Msg m={msg} />
            </div>
          )}

          {data && section === 'billing' && (
            <div className={`${card} space-y-4`}>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Billing details</h2>
              <p className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-950 rounded-xl p-3 leading-relaxed">Ad spend is charged by each ad platform (Meta, Google, TikTok, LinkedIn) to the payment method on <i>their</i> account. Adoracle never asks for or stores card numbers.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className={lbl}>Invoice email</label><input className={input} type="email" disabled={!isOwner} value={bill.billingEmail} onChange={(e) => setBill({ ...bill, billingEmail: e.target.value })} placeholder="accounts@company.com" /></div>
                <div><label className={lbl}>Tax / VAT number</label><input className={input} disabled={!isOwner} value={bill.taxId} onChange={(e) => setBill({ ...bill, taxId: e.target.value })} /></div>
              </div>
              {!isOwner && <p className="text-[11px] text-slate-500">Only the workspace owner can change billing details.</p>}
              <button type="button" disabled={!isOwner || busy} onClick={() => save({ section: 'billing', ...bill })} className="px-5 py-2.5 rounded-xl bg-[#2A6FE0] text-white text-xs font-bold disabled:opacity-50 cursor-pointer">Save billing details</button>
              <Msg m={msg} />
            </div>
          )}

          {data && section === 'privacy' && (
            <>
              <div className={`${card} space-y-3`}>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">What you have agreed to</h2>
                {data.consents.length === 0 ? <p className="text-xs text-slate-500">You have not connected any accounts yet.</p> : (
                  <ul className="space-y-2">
                    {data.consents.map((c) => (
                      <li key={c.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs">
                        <p className="font-bold text-slate-900 dark:text-white capitalize">{c.provider} · agreement v{c.version}</p>
                        <p className="text-slate-500">Allowed: {c.features.join(', ') || '—'}</p>
                        <p className="text-[11px] text-slate-400">Accepted {new Date(c.grantedAt).toLocaleString()}{c.revokedAt ? ` · withdrawn ${new Date(c.revokedAt).toLocaleDateString()}` : ''}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className={`${card} space-y-3`}>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Your data</h2>
                <a href="/api/settings/export" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-[#2A6FE0]"><Download size={14} /> Download my data (JSON)</a>
                <p className="text-[11px] text-slate-400">Includes your profile, campaigns, posts, rules and agreements. Saved platform logins are never included.</p>
              </div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50/60 dark:bg-rose-950/20 p-5 sm:p-6 space-y-3">
                <h2 className="text-base font-extrabold text-rose-700 flex items-center gap-2"><UserCircle size={16} /> Delete my account</h2>
                <p className="text-xs text-rose-800/80">This permanently removes your account, and any workspace where you are the only member, with its campaigns, posts and saved logins. It cannot be undone. Ads already running on the platforms are not stopped.</p>
                <input className={input} value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} placeholder={`Type ${data.email} to confirm`} />
                <button type="button" disabled={busy || confirmEmail.toLowerCase() !== data.email.toLowerCase()} onClick={async () => { setBusy(true); const r = await send('DELETE', '/api/settings/account', { confirmEmail }); setBusy(false); if (r.ok) signOut({ callbackUrl: '/login' }); else setMsg({ ok: false, text: r.d.error || 'Could not delete.' }); }} className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold disabled:opacity-40 cursor-pointer">Delete everything</button>
                <Msg m={msg} />
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function SettingsView() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500">Loading settings…</div>}>
      <SettingsContent />
    </Suspense>
  );
}
