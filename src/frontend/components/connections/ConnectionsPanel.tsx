'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShieldCheck, ExternalLink, CheckCircle2, AlertTriangle, Loader2, Link2, Unplug, RefreshCw, X, ChevronDown, Lock, XCircle } from 'lucide-react';
import { PlatformBadge } from '@/frontend/components/common/PlatformBadge';
import { PlatformId } from '@/shared/adspec';
import { AGREEMENT_POINTS, AGREEMENT_VERSION, FEATURES, FeatureId, scopesForFeatures } from '@/shared/connectFeatures';
import { useConnections, ConnectionInfo } from '@/frontend/hooks/useConnections';

const BADGE: Record<ConnectionInfo['key'], PlatformId> = { meta: 'META', google: 'GOOGLE', tiktok: 'TIKTOK', linkedin: 'LINKEDIN' };
const SHORT: Record<ConnectionInfo['key'], string> = { meta: 'Facebook / Instagram', google: 'Google & YouTube', tiktok: 'TikTok', linkedin: 'LinkedIn' };

const MESSAGES: Record<string, string> = {
  denied: 'You cancelled on the platform’s page, so nothing was connected. You can try again any time.',
  state_mismatch: 'The connection took too long and expired for your safety. Please try again.',
  exchange_failed: 'The platform did not finish the connection. Please try again in a minute.',
  not_configured: 'This platform is not switched on yet by the site owner.',
  unknown_provider: 'Unknown platform.',
  consent_required: 'Please choose what Adoracle may do and tick the agreement first.',
  verify_failed: 'We connected, but the platform did not confirm the login. Please try again.',
  role: 'Only owners and admins can connect accounts.',
};

/* ------------------------------------------------------------------ */
function ConnectModal({ conn, preselect, onClose }: { conn: ConnectionInfo; preselect?: FeatureId[]; onClose: () => void }) {
  const available = FEATURES.filter((f) => conn.supportedFeatures.includes(f.id));
  const [chosen, setChosen] = useState<FeatureId[]>(preselect?.length ? preselect : available.map((f) => f.id));
  const [agree, setAgree] = useState(false);
  const [showTech, setShowTech] = useState(false);
  const toggle = (id: FeatureId) => setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  const ready = agree && chosen.length > 0;
  const scopes = scopesForFeatures(conn.key, chosen);

  const go = () => {
    window.location.href = `/api/connect/${conn.key}/start?features=${chosen.join(',')}&agree=1`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60" role="dialog" aria-modal="true" aria-label={`Connect ${SHORT[conn.key]}`}>
      <div className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <PlatformBadge id={BADGE[conn.key]} size={42} />
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Connect {SHORT[conn.key]}</h3>
              <p className="text-xs text-slate-500">You will sign in on {SHORT[conn.key]}’s own page. We never see your password.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"><X size={18} /></button>
        </div>

        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white mb-2">1. What would you like Adoracle to do?</p>
          <div className="space-y-2">
            {available.map((f) => (
              <label key={f.id} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${chosen.includes(f.id) ? 'border-[#2A6FE0] bg-[#E6F1FF]/60 dark:bg-blue-950/30' : 'border-slate-200 dark:border-slate-800'}`}>
                <input type="checkbox" checked={chosen.includes(f.id)} onChange={() => toggle(f.id)} className="mt-0.5 w-4 h-4 accent-[#2A6FE0]" />
                <span>
                  <span className="block text-sm font-bold text-slate-900 dark:text-white">{f.title}</span>
                  <span className="block text-[11px] text-slate-500 leading-relaxed">{f.plain}</span>
                </span>
              </label>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">We only ask for the permissions these choices need. You can change your mind later by reconnecting.</p>
          <button type="button" onClick={() => setShowTech((v) => !v)} className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer">
            <ChevronDown size={12} className={showTech ? 'rotate-180' : ''} /> Technical details
          </button>
          {showTech && (
            <p className="mt-1.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 text-[10px] font-mono text-slate-500 break-words">
              {scopes.length ? scopes.map((s) => s.replace('https://www.googleapis.com/auth/', '')).join(', ') : 'Permissions are set by the TikTok app approval.'}
            </p>
          )}
        </div>

        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white mb-2">2. Please read and agree</p>
          <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed list-disc pl-4">
            {AGREEMENT_POINTS.map((p) => <li key={p}>{p}</li>)}
          </ul>
          <label className="flex items-start gap-2.5 mt-3 text-xs font-semibold text-slate-900 dark:text-white cursor-pointer">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#2A6FE0]" />
            I understand and agree (version {AGREEMENT_VERSION})
          </label>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">Cancel</button>
          <button type="button" disabled={!ready} onClick={go} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#2A6FE0] text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
            <Lock size={13} /> Continue to {SHORT[conn.key].split(' ')[0]}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
export function ConnectionsPanel() {
  const params = useSearchParams();
  const { connections, loading, failed, canManage, refresh, verify } = useConnections();
  const [busy, setBusy] = useState<string | null>(null);
  const [modal, setModal] = useState<{ conn: ConnectionInfo; pre?: FeatureId[] } | null>(null);
  const autoVerified = useRef(false);

  const connectedKey = params.get('connected');
  const partialKey = params.get('partial');
  const errorKey = params.get('error');

  // Every time this screen opens, quietly re-check each connected account with the platform itself.
  useEffect(() => {
    if (autoVerified.current || loading || !connections.length) return;
    autoVerified.current = true;
    (async () => {
      for (const c of connections.filter((x) => x.connected)) await verify(c.key);
    })();
  }, [loading, connections, verify]);

  const recheck = async (key: string) => {
    setBusy(key);
    await verify(key);
    setBusy(null);
  };

  const disconnect = async (c: ConnectionInfo) => {
    if (!window.confirm(`Disconnect ${SHORT[c.key]}?\n\nWe delete the saved login and ask ${SHORT[c.key]} to remove Adoracle’s access where possible. Your ads and posts on the platform are not touched.`)) return;
    setBusy(c.key);
    await fetch(`/api/connections?provider=${c.key}`, { method: 'DELETE' });
    await refresh();
    setBusy(null);
  };

  const chooseAccount = async (provider: string, accountId: string) => {
    setBusy(provider);
    await fetch('/api/connections', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider, accountId }) });
    await refresh();
    setBusy(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Connect your ad & social accounts</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">It takes about a minute per account. No technical knowledge needed.</p>
      </div>

      <ol className="grid sm:grid-cols-3 gap-2.5 text-xs">
        {[
          ['1', 'Choose what Adoracle may do', 'Only the permissions you tick are requested.'],
          ['2', 'Sign in on the platform’s page', 'Facebook, Google, TikTok or LinkedIn asks you to approve.'],
          ['3', 'We double-check with them', 'We confirm the login and permissions directly with the platform.'],
        ].map(([n, t, d]) => (
          <li key={n} className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
            <span className="w-6 h-6 shrink-0 rounded-full bg-[#2A6FE0] text-white text-[11px] font-black flex items-center justify-center">{n}</span>
            <span><span className="block font-bold text-slate-900 dark:text-white">{t}</span><span className="text-[11px] text-slate-500">{d}</span></span>
          </li>
        ))}
      </ol>

      {connectedKey && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-sky-300 font-semibold">
          <CheckCircle2 size={15} className="mt-0.5 shrink-0" /> Connected and verified with {SHORT[connectedKey as ConnectionInfo['key']] || 'the platform'}.
        </div>
      )}
      {partialKey && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-semibold">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" /> Connected, but the platform did not grant every permission you chose. See the list below and press “Allow missing permissions”.
        </div>
      )}
      {errorKey && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-semibold">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" /> {MESSAGES[errorKey] || 'Something went wrong.'}
        </div>
      )}

      {!canManage && <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">You have view-only access. Ask a workspace owner to connect accounts.</p>}

      <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#E6F1FF] dark:bg-blue-950/40 border border-[#BBD9FF] dark:border-blue-900">
        <ShieldCheck size={18} className="text-[#153E9E] dark:text-sky-300 mt-0.5 shrink-0" />
        <ul className="text-xs text-[#153E9E] dark:text-blue-200 leading-relaxed space-y-0.5 list-disc pl-4">
          <li>We never see your passwords. Saved logins are encrypted and never sent to your browser.</li>
          <li>New campaigns start <b>paused</b>. Nothing is posted or spent without your click.</li>
          <li>Disconnect any time. We also ask the platform to remove our access.</li>
        </ul>
      </div>

      {loading && <p className="flex items-center gap-2 text-xs text-slate-500"><Loader2 size={14} className="animate-spin" /> Loading…</p>}
      {failed && !loading && <p className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-semibold">Could not load connections. The database may not be set up yet. See the README.</p>}

      <div className="space-y-3">
        {connections.map((c) => {
          const v = c.verification;
          const available = FEATURES.filter((f) => c.supportedFeatures.includes(f.id));
          const missing = (v?.missingFeatures || []).filter((f) => c.chosenFeatures.includes(f));
          return (
            <div key={c.key} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <PlatformBadge id={BADGE[c.key]} size={42} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{SHORT[c.key]}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.connected ? 'bg-blue-100 text-blue-800' : c.needsReconnect ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'}`}>
                        {c.connected ? 'Connected' : c.needsReconnect ? 'Needs reconnecting' : 'Not connected'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {c.connected || c.needsReconnect ? `${c.accountName || 'Account'}${c.accountId && c.accountId !== 'pending' ? ' · ' + c.accountId : ''}` : available.map((f) => f.title).slice(0, 2).join(' · ')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {c.connected ? (
                    <>
                      <button type="button" disabled={busy === c.key} onClick={() => recheck(c.key)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-[#2A6FE0] cursor-pointer disabled:opacity-60">
                        {busy === c.key ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Check again
                      </button>
                      {canManage && <button type="button" onClick={() => setModal({ conn: c, pre: c.chosenFeatures })} className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-[#2A6FE0] cursor-pointer">Change permissions</button>}
                      {canManage && <button type="button" disabled={busy === c.key} onClick={() => disconnect(c)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-rose-400 hover:text-rose-600 cursor-pointer disabled:opacity-60"><Unplug size={13} /> Disconnect</button>}
                    </>
                  ) : c.configured ? (
                    canManage && <button type="button" onClick={() => setModal({ conn: c })} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#2A6FE0] text-white hover:bg-blue-700 cursor-pointer"><Link2 size={13} /> {c.needsReconnect ? 'Reconnect' : 'Connect'}</button>
                  ) : (
                    <span className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">Coming soon</span>
                  )}
                </div>
              </div>

              {!c.configured && !c.connected && (
                <details className="mt-3 text-[11px] text-slate-500">
                  <summary className="cursor-pointer font-semibold select-none">Site owner: how to switch this on</summary>
                  <p className="mt-1.5 leading-relaxed">
                    Create a developer app for this platform and add <code className="font-mono font-bold">{c.missingEnv.join(', ')}</code> to the Vercel environment variables. Register <code className="font-mono font-bold">/api/connect/{c.key}/callback</code> as the redirect URL.{' '}
                    <a href={c.docsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold underline">Developer docs <ExternalLink size={10} /></a>
                  </p>
                </details>
              )}

              {(c.connected || c.needsReconnect) && v && (
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Verified with {SHORT[c.key].split(' ')[0]}</p>
                    <ul className="space-y-1">
                      {v.checks.map((ck) => (
                        <li key={ck.label} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200">
                          {ck.ok ? <CheckCircle2 size={14} className="text-blue-600 mt-0.5 shrink-0" /> : <XCircle size={14} className="text-rose-600 mt-0.5 shrink-0" />}
                          <span>{ck.label}{ck.detail ? <span className="text-slate-400"> · {ck.detail}</span> : null}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-[10px] text-slate-400 mt-1.5">Last checked {new Date(v.checkedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">What Adoracle can do</p>
                    <ul className="space-y-1">
                      {available.map((f) => {
                        const on = v.grantedFeatures.includes(f.id);
                        const wanted = c.chosenFeatures.includes(f.id);
                        return (
                          <li key={f.id} className="flex items-start gap-2 text-xs">
                            {on ? <CheckCircle2 size={14} className="text-blue-600 mt-0.5 shrink-0" /> : <XCircle size={14} className={`${wanted ? 'text-rose-500' : 'text-slate-300'} mt-0.5 shrink-0`} />}
                            <span className={on ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}>{f.title}{!on && !wanted ? ' (not allowed)' : ''}{!on && wanted ? ' (permission missing)' : ''}</span>
                          </li>
                        );
                      })}
                    </ul>
                    {missing.length > 0 && canManage && (
                      <button type="button" onClick={() => setModal({ conn: c, pre: c.chosenFeatures })} className="mt-2 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-900 text-[11px] font-bold hover:bg-amber-200 cursor-pointer">Allow missing permissions</button>
                    )}
                  </div>
                </div>
              )}

              {c.connected && (
                <div className="mt-3 grid sm:grid-cols-2 gap-3">
                  {c.accounts.length > 1 && (
                    <label className="block">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Ad account to use</span>
                      <select value={c.accountId || ''} disabled={busy === c.key || !canManage} onChange={(e) => chooseAccount(c.key, e.target.value)} className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
                        {c.accounts.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.id})</option>)}
                      </select>
                    </label>
                  )}
                  {c.key === 'meta' && c.pages.length > 0 && (
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Pages & Instagram found</span>
                      <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-0.5">
                        {c.pages.slice(0, 4).map((p) => <li key={p.id}>{p.name}{p.instagram?.username ? <span className="text-slate-400"> · @{p.instagram.username}</span> : null}</li>)}
                      </ul>
                    </div>
                  )}
                  {c.accountId === 'pending' && (
                    <p className="sm:col-span-2 text-[11px] text-amber-700 font-semibold">Login worked, but this account has no ad account yet. Create one on the platform (or wait for approval) and press “Check again”.</p>
                  )}
                  {c.consent && <p className="sm:col-span-2 text-[10px] text-slate-400">Agreement v{c.consent.version} accepted {new Date(c.consent.grantedAt).toLocaleDateString()}{c.expiresAt ? ` · login valid until ${new Date(c.expiresAt).toLocaleDateString()}` : ''}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modal && <ConnectModal conn={modal.conn} preselect={modal.pre} onClose={() => setModal(null)} />}
    </div>
  );
}
