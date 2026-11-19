import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/backend/db/client';
import { getCtx } from '@/backend/auth/session';
import { encryptToken } from '@/backend/security/encryption';
import { PROVIDERS, isProviderKey, appOrigin } from '@/backend/integrations/oauth';
import { verifyConnection } from '@/backend/integrations/verify';
import { AGREEMENT_VERSION, FeatureId, scopesForFeatures } from '@/shared/connectFeatures';

export async function GET(req: NextRequest, { params }: { params: { provider: string } }) {
  const origin = appOrigin(req.url);
  const back = (q: string) => {
    const res = NextResponse.redirect(`${origin}/settings?section=connections&${q}`);
    res.cookies.delete('ado_oauth_state');
    return res;
  };

  const ctx = await getCtx();
  if (!ctx) return NextResponse.redirect(`${origin}/login`);

  const key = params.provider;
  if (!isProviderKey(key)) return back('error=unknown_provider');
  const provider = PROVIDERS[key];

  const sp = req.nextUrl.searchParams;
  if (sp.get('error')) return back(`error=denied&provider=${key}`);

  const code = sp.get(provider.codeParam);
  const state = sp.get('state');
  const [ck, cs, cf] = (req.cookies.get('ado_oauth_state')?.value || '').split('|');
  if (!code || !state || ck !== key || cs !== state) return back(`error=state_mismatch&provider=${key}`);
  const features = (cf || '').split('.').filter(Boolean) as FeatureId[];

  try {
    const ex = await provider.exchange(code, `${origin}/api/connect/${key}/callback`);

    // Second opinion: ask the platform itself what was actually granted
    const verification = await verifyConnection(key, ex.accessToken, features);

    const primary = ex.accounts[0];
    await db.integrationToken.deleteMany({ where: { workspaceId: ctx.workspaceId, platform: provider.dbPlatform } });
    await db.integrationToken.create({
      data: {
        workspaceId: ctx.workspaceId,
        platform: provider.dbPlatform,
        accountId: primary?.id || 'pending',
        accountName: primary?.name || verification.identity?.name || verification.identity?.email || 'Connected account',
        accessToken: encryptToken(ex.accessToken),
        refreshToken: ex.refreshToken ? encryptToken(ex.refreshToken) : null,
        scopes: verification.grantedScopes.join(' ') || ex.scopes || null,
        meta: { accounts: ex.accounts, features, verification, ...(ex.extraMeta || {}) } as any,
        expiresAt: ex.expiresIn ? new Date(Date.now() + ex.expiresIn * 1000) : null,
        status: verification.valid ? 'CONNECTED' : 'NEEDS_RECONNECT',
      },
    });

    // Remember exactly what the user agreed to
    await db.consentRecord.create({
      data: {
        workspaceId: ctx.workspaceId,
        userId: ctx.userId,
        provider: key,
        features,
        scopes: scopesForFeatures(key, features).join(' '),
        agreementVersion: AGREEMENT_VERSION,
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
        userAgent: req.headers.get('user-agent'),
      },
    });

    if (!verification.valid) return back(`error=verify_failed&provider=${key}`);
    if (verification.missingFeatures.some((f) => features.includes(f))) return back(`partial=${key}`);
    return back(`connected=${key}`);
  } catch (err) {
    console.error(`[connect:${key}]`, err);
    return back(`error=exchange_failed&provider=${key}`);
  }
}
