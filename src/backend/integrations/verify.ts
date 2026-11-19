// src/backend/integrations/verify.ts
// Asks the PLATFORM (not our database) whether a connection is still valid and which permissions the user really granted.
import { featuresCovered, FeatureId, FEATURES, PROVIDER_FEATURES, ProviderKey } from '@/shared/connectFeatures';

export interface VerifyResult {
  valid: boolean;
  identity?: { id?: string; name?: string; email?: string };
  grantedScopes: string[];
  grantedFeatures: FeatureId[];
  missingFeatures: FeatureId[];
  checks: { label: string; ok: boolean; detail?: string }[];
  checkedAt: string;
  error?: string;
}

const META_V = () => process.env.META_GRAPH_VERSION || 'v23.0';

async function getJson(url: string, init?: RequestInit) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(15000) });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

function finish(provider: ProviderKey, base: Partial<VerifyResult> & { valid: boolean; grantedScopes: string[]; checks: VerifyResult['checks'] }, wanted?: FeatureId[]): VerifyResult {
  const grantedFeatures = base.valid ? featuresCovered(provider, base.grantedScopes) : [];
  const target = wanted && wanted.length ? wanted : PROVIDER_FEATURES[provider];
  return {
    ...base,
    grantedFeatures,
    missingFeatures: target.filter((f) => !grantedFeatures.includes(f)),
    checkedAt: new Date().toISOString(),
  } as VerifyResult;
}

export async function verifyConnection(provider: ProviderKey, accessToken: string, wanted?: FeatureId[]): Promise<VerifyResult> {
  try {
    if (provider === 'meta') {
      const me = await getJson(`https://graph.facebook.com/${META_V()}/me?fields=id,name&access_token=${accessToken}`);
      if (!me.ok) return finish(provider, { valid: false, grantedScopes: [], checks: [{ label: 'Facebook accepts this login', ok: false, detail: me.data?.error?.message }], error: me.data?.error?.message }, wanted);
      const perms = await getJson(`https://graph.facebook.com/${META_V()}/me/permissions?access_token=${accessToken}`);
      const granted: string[] = (perms.data?.data || []).filter((p: any) => p.status === 'granted').map((p: any) => p.permission);
      return finish(provider, {
        valid: true,
        identity: { id: me.data.id, name: me.data.name },
        grantedScopes: granted,
        checks: [
          { label: 'Facebook accepts this login', ok: true, detail: me.data.name },
          { label: 'Permissions confirmed with Facebook', ok: perms.ok, detail: `${granted.length} granted` },
        ],
      }, wanted);
    }

    if (provider === 'google') {
      const info = await getJson(`https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`);
      if (!info.ok) return finish(provider, { valid: false, grantedScopes: [], checks: [{ label: 'Google accepts this login', ok: false, detail: info.data?.error_description }], error: info.data?.error_description }, wanted);
      const granted = String(info.data.scope || '').split(' ').filter(Boolean);
      return finish(provider, {
        valid: true,
        identity: { email: info.data.email },
        grantedScopes: granted,
        checks: [
          { label: 'Google accepts this login', ok: true, detail: info.data.email },
          { label: 'Permissions confirmed with Google', ok: true, detail: `${granted.length} granted` },
        ],
      }, wanted);
    }

    if (provider === 'tiktok') {
      const r = await getJson(
        `https://business-api.tiktok.com/open_api/v1.3/oauth2/advertiser/get/?app_id=${process.env.TIKTOK_APP_ID}&secret=${process.env.TIKTOK_APP_SECRET}`,
        { headers: { 'Access-Token': accessToken } }
      );
      const ok = r.ok && r.data?.code === 0;
      const list = r.data?.data?.list || [];
      // TikTok grants permissions per app, not per request, so a valid token means ads + reports are available
      return finish(provider, {
        valid: ok,
        grantedScopes: ok ? ['ads', 'reports'] : [],
        identity: { name: list[0]?.advertiser_name },
        checks: [
          { label: 'TikTok accepts this login', ok, detail: ok ? undefined : r.data?.message },
          { label: 'Advertiser accounts found', ok: list.length > 0, detail: `${list.length} account(s)` },
        ],
        error: ok ? undefined : r.data?.message,
      }, wanted);
    }

    // linkedin: token introspection
    const r = await getJson('https://www.linkedin.com/oauth/v2/introspectToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: process.env.LINKEDIN_CLIENT_ID || '', client_secret: process.env.LINKEDIN_CLIENT_SECRET || '', token: accessToken }),
    });
    const active = !!r.data?.active;
    const granted = String(r.data?.scope || '').split(/[ ,]/).filter(Boolean);
    return finish(provider, {
      valid: active,
      grantedScopes: granted,
      checks: [
        { label: 'LinkedIn accepts this login', ok: active },
        { label: 'Permissions confirmed with LinkedIn', ok: active, detail: `${granted.length} granted` },
      ],
      error: active ? undefined : 'Token is no longer active',
    }, wanted);
  } catch (e: any) {
    return { valid: false, grantedScopes: [], grantedFeatures: [], missingFeatures: wanted || PROVIDER_FEATURES[provider], checks: [{ label: 'Could not reach the platform', ok: false, detail: e?.message }], checkedAt: new Date().toISOString(), error: e?.message };
  }
}

export function featureTitle(id: FeatureId) {
  return FEATURES.find((f) => f.id === id)?.title || id;
}
