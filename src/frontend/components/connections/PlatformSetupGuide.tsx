'use client';

import React, { useState } from 'react';
import { CheckCircle2, Circle, Copy, Check, ExternalLink, RefreshCw } from 'lucide-react';
import { BrandLogo, BrandId } from '@/frontend/components/common/BrandLogo';
import { useConnections, ConnectionInfo } from '@/frontend/hooks/useConnections';

const GUIDE: Record<ConnectionInfo['key'], { logo: BrandId; name: string; console: string; consoleLabel: string; steps: string[]; envs: string[] }> = {
  meta: {
    logo: 'META', name: 'Facebook & Instagram (Meta)', console: 'https://developers.facebook.com/apps/', consoleLabel: 'Meta for Developers',
    steps: ['Click “Create App”, choose “Business”, and name it Adoracle.', 'Add the products “Facebook Login for Business” and “Marketing API”.', 'Paste the redirect link below into Facebook Login → Valid OAuth Redirect URIs.', 'Copy the App ID and App Secret (Settings → Basic) into the variables below.', 'Before other people can connect, submit the permissions for App Review. Your own account works right away in development mode.'],
    envs: ['META_APP_ID', 'META_APP_SECRET'],
  },
  google: {
    logo: 'GOOGLE', name: 'Google Ads & YouTube', console: 'https://console.cloud.google.com/apis/credentials', consoleLabel: 'Google Cloud Console',
    steps: ['Create a project and enable “Google Ads API” and “YouTube Data API v3”.', 'Credentials → Create OAuth client ID → Web application.', 'Paste the redirect link below into Authorized redirect URIs.', 'Copy the Client ID and Secret into the variables below.', 'Apply for a Google Ads developer token (Google Ads → Tools → API Center) and add it too.'],
    envs: ['GOOGLE_ADS_CLIENT_ID', 'GOOGLE_ADS_CLIENT_SECRET', 'GOOGLE_ADS_DEVELOPER_TOKEN'],
  },
  tiktok: {
    logo: 'TIKTOK', name: 'TikTok Ads', console: 'https://business-api.tiktok.com/portal/apps', consoleLabel: 'TikTok for Business Developers',
    steps: ['Create a developer account and click “Create an app”.', 'Choose the Ads Management and Reporting permissions.', 'Paste the redirect link below as the Redirect URL.', 'Copy the App ID and Secret into the variables below.'],
    envs: ['TIKTOK_APP_ID', 'TIKTOK_APP_SECRET'],
  },
  linkedin: {
    logo: 'LINKEDIN', name: 'LinkedIn Ads', console: 'https://www.linkedin.com/developers/apps', consoleLabel: 'LinkedIn Developers',
    steps: ['Create an app linked to a LinkedIn Company Page.', 'Request the “Advertising API” product (needs approval).', 'Auth tab → paste the redirect link below into Authorized redirect URLs.', 'Copy the Client ID and Secret into the variables below.'],
    envs: ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET'],
  },
};

function CopyBox({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
      <code className="flex-1 min-w-0 text-[11px] font-mono text-slate-700 dark:text-slate-200 truncate">{value}</code>
      <button type="button" onClick={() => { navigator.clipboard?.writeText(value); setDone(true); setTimeout(() => setDone(false), 1500); }} className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 cursor-pointer">
        {done ? <Check size={12} /> : <Copy size={12} />} {done ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

/** One-time setup for the person who deployed Adoracle. After this, every user connects with one click. */
export function PlatformSetupGuide() {
  const { connections, refresh, loading } = useConnections();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Platform setup (one time, for the site owner)</h2>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Each ad platform needs one registered “app” for Adoracle. You do this once. After that, your users never see anything technical. They just press Connect and approve on Facebook, Google, TikTok or LinkedIn.</p>
      </div>
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200">
        <span>After adding the variables in Vercel (Settings → Environment Variables) redeploy, then press Check setup.</span>
        <button type="button" onClick={refresh} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 font-bold cursor-pointer whitespace-nowrap"><RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Check setup</button>
      </div>

      {(Object.keys(GUIDE) as ConnectionInfo['key'][]).map((k) => {
        const g = GUIDE[k];
        const c = connections.find((x) => x.key === k);
        const ready = !!c?.configured;
        return (
          <div key={k} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <BrandLogo id={g.logo} size={40} />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{g.name}</h3>
                <p className={`text-[11px] font-bold ${ready ? 'text-blue-600' : 'text-amber-600'}`}>{ready ? 'Ready: users can connect' : 'Needs setup'}</p>
              </div>
              <a href={g.console} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-blue-500">{g.consoleLabel} <ExternalLink size={12} /></a>
            </div>
            <ol className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 list-decimal pl-5 leading-relaxed">{g.steps.map((s) => <li key={s}>{s}</li>)}</ol>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Redirect link to paste</p>
              <CopyBox value={`${origin}/api/connect/${k}/callback`} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Variables to add in Vercel</p>
              <ul className="space-y-1">
                {g.envs.map((e) => {
                  const missing = c?.missingEnv.includes(e);
                  const unknownDevToken = e === 'GOOGLE_ADS_DEVELOPER_TOKEN';
                  return (
                    <li key={e} className="flex items-center gap-2 text-xs">
                      {unknownDevToken ? <Circle size={14} className="text-slate-300" /> : missing ? <Circle size={14} className="text-amber-500" /> : <CheckCircle2 size={14} className="text-blue-600" />}
                      <code className="font-mono text-slate-700 dark:text-slate-200">{e}</code>
                      <span className="text-slate-400">{unknownDevToken ? 'needed for ads data (cannot be checked here)' : missing ? 'missing' : 'found'}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}
