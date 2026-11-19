'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShieldCheck, Lock, ExternalLink, CheckCircle2, AlertTriangle, Loader2, Link2, Unplug } from 'lucide-react';
import { PlatformBadge } from '@/components/shared/PlatformBadge';
import { PlatformId } from '@/lib/adspec';
import { useConnections, ConnectionInfo } from '@/components/connections/useConnections';

const BADGE: Record<ConnectionInfo['key'], PlatformId> = { meta: 'META', google: 'GOOGLE', tiktok: 'TIKTOK', linkedin: 'LINKEDIN' };

const ERRORS: Record<string, string> = {
  denied: 'The connection was cancelled on the platform side.',
  state_mismatch: 'Security check failed (the request expired). Please try connecting again.',
  exchange_failed: 'The platform did not accept the login. Check the app keys and the redirect URL, then retry.',
  not_configured: 'This platform is not set up on the server yet.',
  unknown_provider: 'Unknown platform.',
};

export function ConnectionsPanel() {
  const params = useSearchParams();
  const { connections, loading, failed, refresh } = useConnections();
  const [busy, setBusy] = useState<string | null>(null);

  const connectedKey = params.get('connected');
  const errorKey = params.get('error');

  const disconnect = async (key: string) => {
    if (!window.confirm('Disconnect this platform? Stored access tokens will be deleted.')) return;
    setBusy(key);
    await fetch(`/api/connections?provider=${key}`, { method: 'DELETE' });
    await refresh();
    setBusy(null);
  };

  const chooseAccount = async (provider: string, accountId: string) => {
    setBusy(provider);
    await fetch('/api/connections', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, accountId }),
    });
    await refresh();
    setBusy(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Connected Ad & Social Accounts</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Link your real ad managers and social pages once. Adoracle uses them to create campaigns and publish posts for you.
        </p>
      </div>

      {connectedKey && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
          <CheckCircle2 size={15} className="mt-0.5 shrink-0" /> Connected successfully.
        </div>
      )}
      {errorKey && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-semibold">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" /> {ERRORS[errorKey] || 'Something went wrong.'}
        </div>
      )}

      <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#E6F4ED] dark:bg-emerald-950/40 border border-[#B7DEC9] dark:border-emerald-900">
        <ShieldCheck size={18} className="text-[#114B32] dark:text-emerald-300 mt-0.5 shrink-0" />
        <div className="text-xs text-[#114B32] dark:text-emerald-200 leading-relaxed">
          <p className="font-bold mb-1">How your accounts stay safe</p>
          <ul className="space-y-0.5 list-disc pl-4">
            <li>You sign in on the platform's own page. Adoracle never sees your Facebook, Google, TikTok or LinkedIn password.</li>
            <li>Access tokens are encrypted (AES-256-GCM) before they are stored and are never sent back to your browser.</li>
            <li>Campaigns are created <b>paused</b> so nothing spends until you approve it.</li>
            <li>You can disconnect at any time here, or revoke access from the platform's own security settings.</li>
          </ul>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Loader2 size={14} className="animate-spin" /> Loading connections…
        </div>
      )}
      {failed && !loading && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-semibold">
          Could not load connections. Check that DATABASE_URL is set and the database schema is pushed (npm run db:push).
        </div>
      )}

      <div className="space-y-3">
        {connections.map((c) => (
          <div key={c.key} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <PlatformBadge id={BADGE[c.key]} size={38} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{c.label}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.connected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {c.connected ? 'Connected' : 'Not connected'}
                    </span>
                  </div>
                  {c.connected ? (
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {c.accountName} · <code className="font-mono">{c.accountId}</code>
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-500 mt-0.5">{c.permissions[0]}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {c.connected ? (
                  <>
                    <a
                      href={`/api/connect/${c.key}/start`}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#169C69] transition-colors"
                    >
                      Reconnect
                    </a>
                    <button
                      type="button"
                      disabled={busy === c.key}
                      onClick={() => disconnect(c.key)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-400 hover:text-rose-600 transition-colors cursor-pointer disabled:opacity-60"
                    >
                      <Unplug size={13} /> Disconnect
                    </button>
                  </>
                ) : c.configured ? (
                  <a
                    href={`/api/connect/${c.key}/start`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#169C69] text-white hover:bg-emerald-700 transition-colors"
                  >
                    <Link2 size={13} /> Connect {c.label.split(' ')[0]}
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-200 text-slate-500 cursor-not-allowed">
                    <Lock size={13} /> Setup needed
                  </span>
                )}
              </div>
            </div>

            {!c.connected && !c.configured && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
                The site owner needs to add <code className="font-mono font-bold">{c.missingEnv.join(', ')}</code> in the Vercel environment
                variables, and register <code className="font-mono font-bold">/api/connect/{c.key}/callback</code> as the redirect URL in the
                platform's developer console.{' '}
                <a href={c.docsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold underline">
                  Developer docs <ExternalLink size={10} />
                </a>
              </div>
            )}

            {c.connected && (
              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                {c.accounts.length > 1 && (
                  <label className="block">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Ad account in use</span>
                    <select
                      value={c.accountId || ''}
                      disabled={busy === c.key}
                      onChange={(e) => chooseAccount(c.key, e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    >
                      {c.accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.id})
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {c.key === 'meta' && c.pages.length > 0 && (
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Pages & Instagram</span>
                    <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-0.5">
                      {c.pages.slice(0, 4).map((p) => (
                        <li key={p.id}>
                          {p.name}
                          {p.instagram?.username ? <span className="text-slate-400"> · @{p.instagram.username}</span> : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {c.accountId === 'pending' && (
                  <p className="sm:col-span-2 text-[11px] text-amber-700 font-semibold">
                    Login worked, but no ad account was returned yet. This usually means the app is still waiting for platform approval or the
                    account has no ad access.
                  </p>
                )}
                <p className="sm:col-span-2 text-[10px] text-slate-400">
                  Connected {c.connectedAt ? new Date(c.connectedAt).toLocaleDateString() : ''}
                  {c.expiresAt ? ` · token renews before ${new Date(c.expiresAt).toLocaleDateString()}` : ''}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
