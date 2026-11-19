// src/lib/oauth.ts
// OAuth connection helpers for Meta, Google Ads/YouTube, TikTok and LinkedIn.
// Tokens are exchanged on the server only and stored AES-256-GCM encrypted (see encryption.ts).

import type { ProviderKey } from '@/shared/connectFeatures';
export type { ProviderKey };
export type DbPlatform = 'META' | 'GOOGLE' | 'TIKTOK' | 'LINKEDIN';

export interface ConnectedAccount {
  id: string;
  name: string;
  extra?: Record<string, unknown>;
}

export interface ExchangeResult {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  scopes?: string;
  accounts: ConnectedAccount[];
  extraMeta?: Record<string, unknown>;
}

export interface ProviderConfig {
  key: ProviderKey;
  label: string;
  dbPlatform: DbPlatform;
  requiredEnv: string[];
  scopes: string[];
  /** Plain-language list shown in the UI so people know what they are granting */
  permissions: string[];
  docsUrl: string;
  codeParam: string; // name of the query param that carries the auth code on callback
  buildAuthUrl(state: string, redirectUri: string, scopes: string[]): string;
  exchange(code: string, redirectUri: string): Promise<ExchangeResult>;
}

const env = (k: string) => process.env[k] || '';

async function jsonFetch(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  const text = await res.text();
  let data: any = {};
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    throw new Error(data?.error?.message || data?.error_description || data?.message || `Request failed (${res.status})`);
  }
  return data;
}

const META_VERSION = () => env('META_GRAPH_VERSION') || 'v23.0';

const meta: ProviderConfig = {
  key: 'meta',
  label: 'Meta (Facebook & Instagram)',
  dbPlatform: 'META',
  requiredEnv: ['META_APP_ID', 'META_APP_SECRET'],
  scopes: [
    'ads_management',
    'ads_read',
    'business_management',
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_posts',
    'instagram_basic',
    'instagram_content_publish',
  ],
  permissions: [
    'Create and manage ads in your ad accounts',
    'Read ad performance and reach reports',
    'Publish posts to your Facebook Pages and Instagram business account',
  ],
  docsUrl: 'https://developers.facebook.com/docs/marketing-apis',
  codeParam: 'code',
  buildAuthUrl(state, redirectUri, scopes) {
    const p = new URLSearchParams({
      client_id: env('META_APP_ID'),
      redirect_uri: redirectUri,
      state,
      response_type: 'code',
      scope: scopes.join(','),
      auth_type: 'rerequest', // re-ask for permissions the user declined earlier
    });
    return `https://www.facebook.com/${META_VERSION()}/dialog/oauth?${p}`;
  },
  async exchange(code, redirectUri) {
    const v = META_VERSION();
    const short = await jsonFetch(
      `https://graph.facebook.com/${v}/oauth/access_token?` +
        new URLSearchParams({
          client_id: env('META_APP_ID'),
          client_secret: env('META_APP_SECRET'),
          redirect_uri: redirectUri,
          code,
        })
    );
    // Swap the 1-hour token for a ~60-day token
    const long = await jsonFetch(
      `https://graph.facebook.com/${v}/oauth/access_token?` +
        new URLSearchParams({
          grant_type: 'fb_exchange_token',
          client_id: env('META_APP_ID'),
          client_secret: env('META_APP_SECRET'),
          fb_exchange_token: short.access_token,
        })
    );
    const token: string = long.access_token || short.access_token;

    let accounts: ConnectedAccount[] = [];
    let pages: any[] = [];
    try {
      const ad = await jsonFetch(
        `https://graph.facebook.com/${v}/me/adaccounts?fields=id,name,account_status,currency&limit=50&access_token=${token}`
      );
      accounts = (ad.data || []).map((a: any) => ({
        id: a.id, // act_123...
        name: a.name || a.id,
        extra: { currency: a.currency, status: a.account_status },
      }));
    } catch {
      /* ad accounts optional until the app has ads_management access */
    }
    try {
      const pg = await jsonFetch(
        `https://graph.facebook.com/${v}/me/accounts?fields=id,name,instagram_business_account{id,username}&limit=50&access_token=${token}`
      );
      pages = (pg.data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        instagram: p.instagram_business_account || null,
      }));
    } catch {
      /* pages optional */
    }

    return {
      accessToken: token,
      expiresIn: long.expires_in,
      scopes: '',
      accounts,
      extraMeta: { pages },
    };
  },
};

const google: ProviderConfig = {
  key: 'google',
  label: 'Google Ads & YouTube',
  dbPlatform: 'GOOGLE',
  requiredEnv: ['GOOGLE_ADS_CLIENT_ID', 'GOOGLE_ADS_CLIENT_SECRET'],
  scopes: [
    'openid',
    'email',
    'https://www.googleapis.com/auth/adwords',
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube.upload',
  ],
  permissions: [
    'Manage Google Ads campaigns (Search, Shopping, Performance Max, Demand Gen)',
    'Read YouTube channel and upload videos / Shorts',
  ],
  docsUrl: 'https://developers.google.com/google-ads/api/docs/oauth/overview',
  codeParam: 'code',
  buildAuthUrl(state, redirectUri, scopes) {
    const p = new URLSearchParams({
      client_id: env('GOOGLE_ADS_CLIENT_ID'),
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true',
      state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${p}`;
  },
  async exchange(code, redirectUri) {
    const tok = await jsonFetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env('GOOGLE_ADS_CLIENT_ID'),
        client_secret: env('GOOGLE_ADS_CLIENT_SECRET'),
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    let accounts: ConnectedAccount[] = [];
    const devToken = env('GOOGLE_ADS_DEVELOPER_TOKEN');
    if (devToken) {
      try {
        const v = env('GOOGLE_ADS_API_VERSION') || 'v21';
        const list = await jsonFetch(`https://googleads.googleapis.com/${v}/customers:listAccessibleCustomers`, {
          headers: { Authorization: `Bearer ${tok.access_token}`, 'developer-token': devToken },
        });
        accounts = (list.resourceNames || []).map((r: string) => {
          const id = r.replace('customers/', '');
          return { id, name: `Google Ads account ${id}` };
        });
      } catch {
        /* developer token may still be pending approval */
      }
    }

    return {
      accessToken: tok.access_token,
      refreshToken: tok.refresh_token,
      expiresIn: tok.expires_in,
      scopes: tok.scope,
      accounts,
    };
  },
};

const tiktok: ProviderConfig = {
  key: 'tiktok',
  label: 'TikTok Ads',
  dbPlatform: 'TIKTOK',
  requiredEnv: ['TIKTOK_APP_ID', 'TIKTOK_APP_SECRET'],
  scopes: [],
  permissions: [
    'Create and manage TikTok campaigns, ad groups and ads',
    'Read ad reporting (impressions, clicks, conversions)',
  ],
  docsUrl: 'https://business-api.tiktok.com/portal/docs',
  codeParam: 'auth_code',
  buildAuthUrl(state, redirectUri, scopes) {
    const p = new URLSearchParams({
      app_id: env('TIKTOK_APP_ID'),
      state,
      redirect_uri: redirectUri,
    });
    return `https://business-api.tiktok.com/portal/auth?${p}`;
  },
  async exchange(code) {
    const res = await jsonFetch('https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: env('TIKTOK_APP_ID'),
        secret: env('TIKTOK_APP_SECRET'),
        auth_code: code,
      }),
    });
    if (res.code !== 0 || !res.data?.access_token) {
      throw new Error(res.message || 'TikTok did not return an access token');
    }
    const ids: string[] = res.data.advertiser_ids || [];
    let accounts: ConnectedAccount[] = ids.map((id) => ({ id, name: `TikTok advertiser ${id}` }));
    try {
      if (ids.length) {
        const info = await jsonFetch(
          `https://business-api.tiktok.com/open_api/v1.3/advertiser/info/?advertiser_ids=${encodeURIComponent(
            JSON.stringify(ids)
          )}&fields=${encodeURIComponent(JSON.stringify(['advertiser_id', 'name', 'currency']))}`,
          { headers: { 'Access-Token': res.data.access_token } }
        );
        const list = info?.data?.list || [];
        accounts = ids.map((id) => {
          const hit = list.find((a: any) => String(a.advertiser_id) === String(id));
          return { id, name: hit?.name || `TikTok advertiser ${id}`, extra: { currency: hit?.currency } };
        });
      }
    } catch {
      /* names optional */
    }
    return { accessToken: res.data.access_token, scopes: (res.data.scope || []).join?.(',') || '', accounts };
  },
};

const linkedin: ProviderConfig = {
  key: 'linkedin',
  label: 'LinkedIn Ads',
  dbPlatform: 'LINKEDIN',
  requiredEnv: ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET'],
  scopes: ['r_ads', 'rw_ads', 'r_ads_reporting', 'w_member_social'],
  permissions: [
    'Create and manage LinkedIn campaign groups, campaigns and ads',
    'Read ad reporting',
    'Publish posts as you',
  ],
  docsUrl: 'https://learn.microsoft.com/linkedin/marketing/',
  codeParam: 'code',
  buildAuthUrl(state, redirectUri, scopes) {
    const p = new URLSearchParams({
      response_type: 'code',
      client_id: env('LINKEDIN_CLIENT_ID'),
      redirect_uri: redirectUri,
      state,
      scope: scopes.join(' '),
    });
    return `https://www.linkedin.com/oauth/v2/authorization?${p}`;
  },
  async exchange(code, redirectUri) {
    const tok = await jsonFetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: env('LINKEDIN_CLIENT_ID'),
        client_secret: env('LINKEDIN_CLIENT_SECRET'),
      }),
    });

    let accounts: ConnectedAccount[] = [];
    try {
      const list = await jsonFetch('https://api.linkedin.com/rest/adAccounts?q=search', {
        headers: {
          Authorization: `Bearer ${tok.access_token}`,
          'LinkedIn-Version': env('LINKEDIN_API_VERSION') || '202510',
          'X-Restli-Protocol-Version': '2.0.0',
        },
      });
      accounts = (list.elements || []).map((a: any) => ({ id: String(a.id), name: a.name || `Ad account ${a.id}` }));
    } catch {
      /* optional */
    }

    return {
      accessToken: tok.access_token,
      refreshToken: tok.refresh_token,
      expiresIn: tok.expires_in,
      scopes: tok.scope,
      accounts,
    };
  },
};

export const PROVIDERS: Record<ProviderKey, ProviderConfig> = { meta, google, tiktok, linkedin };

export function isProviderKey(v: string): v is ProviderKey {
  return v in PROVIDERS;
}

export function providerConfigured(p: ProviderConfig) {
  return p.requiredEnv.every((k) => !!process.env[k]);
}

export function missingEnv(p: ProviderConfig) {
  return p.requiredEnv.filter((k) => !process.env[k]);
}

export function appOrigin(reqUrl: string) {
  const fromEnv = process.env.AUTH_URL || process.env.NEXTAUTH_URL;
  return (fromEnv || new URL(reqUrl).origin).replace(/\/$/, '');
}
