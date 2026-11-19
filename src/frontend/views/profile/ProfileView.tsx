'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Save, KeyRound, Mail, ShieldCheck, Plug, CheckCircle2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { initialsOf } from '@/frontend/context/UserContext';

interface Profile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  jobTitle: string | null;
  company: string | null;
  timezone: string | null;
  phone: string | null;
  createdAt: string;
  hasPassword: boolean;
  providers: string[];
  workspaceName: string;
}

const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#2A6FE0] focus:bg-white dark:focus:bg-slate-900';
const labelCls = 'block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [form, setForm] = useState({ name: '', image: '', jobTitle: '', company: '', timezone: '', phone: '', workspaceName: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/profile', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(({ profile: p }: { profile: Profile }) => {
        setProfile(p);
        setForm({
          name: p.name || '',
          image: p.image || '',
          jobTitle: p.jobTitle || '',
          company: p.company || '',
          timezone: p.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || '',
          phone: p.phone || '',
          workspaceName: p.workspaceName || '',
        });
      })
      .catch(() => setLoadError(true));
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const res = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) return setMsg({ ok: false, text: data.error || 'Could not save.' });
    setMsg({ ok: true, text: 'Profile saved.' });
    router.refresh(); // updates the name/photo in the header
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (pw.next !== pw.confirm) return setPwMsg({ ok: false, text: 'The new passwords do not match.' });
    setPwSaving(true);
    const res = await fetch('/api/profile/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }),
    });
    const data = await res.json().catch(() => ({}));
    setPwSaving(false);
    if (!res.ok) return setPwMsg({ ok: false, text: data.error || 'Could not update password.' });
    setPwMsg({ ok: true, text: profile?.hasPassword ? 'Password updated.' : 'Password created. You can now also sign in with email.' });
    setPw({ current: '', next: '', confirm: '' });
    setProfile((p) => (p ? { ...p, hasPassword: true } : p));
  };

  if (loadError)
    return (
      <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-900 font-semibold">
        Could not load your profile. Make sure the database is connected, then refresh.
      </div>
    );
  if (!profile)
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 size={16} className="animate-spin" /> Loading your profile…
      </div>
    );

  const card = 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xs';
  const hasGoogle = profile.providers.includes('google');

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pb-10 max-w-3xl">
      <div className="flex items-center gap-4">
        {form.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.image} alt="" referrerPolicy="no-referrer" className="w-16 h-16 rounded-2xl object-cover border border-blue-500/30" />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-700 dark:text-sky-300 flex items-center justify-center text-xl font-black">
            {initialsOf(form.name || profile.email)}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white truncate">{profile.name || 'Your profile'}</h1>
          <p className="text-xs text-slate-500">
            {profile.email} · Member since {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <form onSubmit={save} className={`${card} space-y-4`}>
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Personal details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Full name</label>
            <input className={inputCls} value={form.name} onChange={set('name')} required maxLength={120} />
          </div>
          <div>
            <label className={labelCls}>Email (sign-in)</label>
            <input className={`${inputCls} opacity-70`} value={profile.email} readOnly />
          </div>
          <div>
            <label className={labelCls}>Job title</label>
            <input className={inputCls} value={form.jobTitle} onChange={set('jobTitle')} placeholder="Growth & Performance Lead" />
          </div>
          <div>
            <label className={labelCls}>Company / brand</label>
            <input className={inputCls} value={form.company} onChange={set('company')} placeholder="Quantimite" />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input className={inputCls} value={form.phone} onChange={set('phone')} placeholder="+94 ..." />
          </div>
          <div>
            <label className={labelCls}>Time zone</label>
            <input className={inputCls} value={form.timezone} onChange={set('timezone')} placeholder="Asia/Colombo" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Profile photo link (https://…)</label>
            <input className={inputCls} value={form.image} onChange={set('image')} placeholder="https://…/photo.jpg" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Workspace name</label>
            <input className={inputCls} value={form.workspaceName} onChange={set('workspaceName')} />
          </div>
        </div>

        {msg && (
          <p className={`flex items-center gap-2 text-xs font-semibold ${msg.ok ? 'text-blue-700' : 'text-rose-600'}`}>
            {msg.ok ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />} {msg.text}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2A6FE0] text-white text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-60 cursor-pointer"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save changes
        </button>
      </form>

      <div className={`${card} space-y-3`}>
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#2A6FE0]" /> Sign-in methods
        </h2>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${hasGoogle ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'}`}>
            Google {hasGoogle ? '· linked' : '· not linked'}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${profile.hasPassword ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'}`}>
            <Mail size={12} /> Email & password {profile.hasPassword ? '· set' : '· not set'}
          </span>
        </div>
        {!hasGoogle && (
          <p className="text-[11px] text-slate-500">
            To link Google, sign out and use “Continue with Google” with the same email address ({profile.email}).
          </p>
        )}
      </div>

      <form onSubmit={changePassword} className={`${card} space-y-4`}>
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <KeyRound size={16} className="text-[#2A6FE0]" /> {profile.hasPassword ? 'Change password' : 'Create a password'}
        </h2>
        {!profile.hasPassword && (
          <p className="text-xs text-slate-500">You signed up with Google. Add a password if you also want to sign in with your email.</p>
        )}
        <div className="grid sm:grid-cols-3 gap-4">
          {profile.hasPassword && (
            <div>
              <label className={labelCls}>Current password</label>
              <input type={showPw ? 'text' : 'password'} className={inputCls} value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} required />
            </div>
          )}
          <div>
            <label className={labelCls}>New password</label>
            <input type={showPw ? 'text' : 'password'} className={inputCls} minLength={8} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} required />
          </div>
          <div>
            <label className={labelCls}>Confirm new password</label>
            <input type={showPw ? 'text' : 'password'} className={inputCls} minLength={8} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required />
          </div>
        </div>
        <button type="button" onClick={() => setShowPw((v) => !v)} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer">
          {showPw ? <EyeOff size={13} /> : <Eye size={13} />} {showPw ? 'Hide' : 'Show'} passwords
        </button>
        {pwMsg && (
          <p className={`flex items-center gap-2 text-xs font-semibold ${pwMsg.ok ? 'text-blue-700' : 'text-rose-600'}`}>
            {pwMsg.ok ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />} {pwMsg.text}
          </p>
        )}
        <button
          type="submit"
          disabled={pwSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
        >
          {pwSaving && <Loader2 size={14} className="animate-spin" />} {profile.hasPassword ? 'Update password' : 'Create password'}
        </button>
      </form>

      <div className={`${card} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Plug size={16} className="text-[#2A6FE0]" /> Connected ad & social accounts
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Link Meta, Google, TikTok and LinkedIn to manage ads and publish posts.</p>
        </div>
        <Link
          href="/settings?section=connections"
          className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-[#2A6FE0] transition-colors text-center"
        >
          Manage connections
        </Link>
      </div>
    </motion.div>
  );
}
