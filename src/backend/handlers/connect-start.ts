import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getCtx } from '@/backend/auth/session';
import { PROVIDERS, isProviderKey, providerConfigured, appOrigin } from '@/backend/integrations/oauth';
import { FeatureId, PROVIDER_FEATURES, scopesForFeatures } from '@/shared/connectFeatures';

/**
 * Starts the connection. Requires the person to have ticked the agreement and chosen at least one feature,
 * and only asks the platform for the permissions those features need (least privilege).
 */
export async function GET(req: NextRequest, { params }: { params: { provider: string } }) {
  const origin = appOrigin(req.url);
  const ctx = await getCtx();
  if (!ctx) return NextResponse.redirect(`${origin}/login`);

  const key = params.provider;
  const back = (q: string) => NextResponse.redirect(`${origin}/settings?section=connections&${q}`);
  if (!isProviderKey(key)) return back('error=unknown_provider');
  if (ctx.role === 'VIEWER') return back('error=role');

  const provider = PROVIDERS[key];
  if (!providerConfigured(provider)) return back(`error=not_configured&provider=${key}`);

  const sp = req.nextUrl.searchParams;
  const features = (sp.get('features') || '').split(',').filter((f): f is FeatureId => (PROVIDER_FEATURES[key] as string[]).includes(f));
  if (sp.get('agree') !== '1' || features.length === 0) return back(`error=consent_required&provider=${key}`);

  const state = crypto.randomBytes(24).toString('hex');
  const url = provider.buildAuthUrl(state, `${origin}/api/connect/${key}/callback`, scopesForFeatures(key, features));

  const res = NextResponse.redirect(url);
  res.cookies.set('ado_oauth_state', `${key}|${state}|${features.join('.')}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  return res;
}
