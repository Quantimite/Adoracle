import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/backend/db/client';
import { getCtx, unauthorized, forbidden, canEdit } from '@/backend/auth/session';
import { decryptToken } from '@/backend/security/encryption';
import { PROVIDERS, ProviderKey, isProviderKey, providerConfigured, missingEnv } from '@/backend/integrations/oauth';
import { FEATURES, PROVIDER_FEATURES } from '@/shared/connectFeatures';
import { isSiteAdmin } from '@/backend/auth/admin';

/** GET → status of every platform for this workspace (never returns tokens). */
export async function GET() {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();

  let rows: any[] = [];
  let consents: any[] = [];
  try {
    rows = await db.integrationToken.findMany({ where: { workspaceId: ctx.workspaceId } });
    consents = await db.consentRecord.findMany({ where: { workspaceId: ctx.workspaceId, revokedAt: null }, orderBy: { grantedAt: 'desc' } });
  } catch (e) {
    console.error('connections read failed', e);
  }

  const connections = (Object.keys(PROVIDERS) as ProviderKey[]).map((key) => {
    const p = PROVIDERS[key];
    const row = rows.find((r) => r.platform === p.dbPlatform);
    const meta = (row?.meta || {}) as any;
    const consent = consents.find((c) => c.provider === key);
    return {
      key,
      label: p.label,
      docsUrl: p.docsUrl,
      configured: providerConfigured(p),
      missingEnv: missingEnv(p),
      supportedFeatures: PROVIDER_FEATURES[key],
      connected: !!row && row.status === 'CONNECTED',
      needsReconnect: !!row && row.status !== 'CONNECTED',
      accountId: row?.accountId ?? null,
      accountName: row?.accountName ?? null,
      accounts: meta.accounts ?? [],
      pages: meta.pages ?? [],
      chosenFeatures: meta.features ?? [],
      verification: meta.verification ?? null,
      consent: consent ? { grantedAt: consent.grantedAt, version: consent.agreementVersion, features: consent.features } : null,
      connectedAt: row?.connectedAt ?? null,
      expiresAt: row?.expiresAt ?? null,
    };
  });

  return NextResponse.json({
    connections,
    features: FEATURES.map((f) => ({ id: f.id, title: f.title, plain: f.plain, supported: Object.fromEntries((Object.keys(PROVIDERS) as ProviderKey[]).map((k) => [k, PROVIDER_FEATURES[k].includes(f.id)])) })),
    canManage: canEdit(ctx),
    isAdmin: isSiteAdmin(ctx.email),
  });
}

/** PATCH { provider, accountId } → choose which ad account is used. */
export async function PATCH(req: NextRequest) {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  if (!canEdit(ctx)) return forbidden();

  const { provider, accountId } = await req.json();
  if (!isProviderKey(provider)) return NextResponse.json({ error: 'Unknown platform' }, { status: 400 });

  const row = await db.integrationToken.findFirst({ where: { workspaceId: ctx.workspaceId, platform: PROVIDERS[provider as ProviderKey].dbPlatform } });
  if (!row) return NextResponse.json({ error: 'Not connected' }, { status: 404 });

  const accounts = ((row.meta as any)?.accounts || []) as { id: string; name: string }[];
  const chosen = accounts.find((a) => a.id === accountId);
  if (!chosen) return NextResponse.json({ error: 'Account not found on this connection' }, { status: 400 });

  await db.integrationToken.update({ where: { id: row.id }, data: { accountId: chosen.id, accountName: chosen.name } });
  return NextResponse.json({ success: true });
}

/** DELETE ?provider=meta → delete our stored tokens, mark consent as revoked, and (Meta) revoke on Facebook's side too. */
export async function DELETE(req: NextRequest) {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  if (!canEdit(ctx)) return forbidden();

  const provider = req.nextUrl.searchParams.get('provider') || '';
  if (!isProviderKey(provider)) return NextResponse.json({ error: 'Unknown platform' }, { status: 400 });
  const p = PROVIDERS[provider as ProviderKey];

  const row = await db.integrationToken.findFirst({ where: { workspaceId: ctx.workspaceId, platform: p.dbPlatform } });
  let revokedAtPlatform = false;
  if (row && provider === 'meta') {
    try {
      const v = process.env.META_GRAPH_VERSION || 'v23.0';
      const r = await fetch(`https://graph.facebook.com/${v}/me/permissions?access_token=${decryptToken(row.accessToken)}`, { method: 'DELETE', signal: AbortSignal.timeout(10000) });
      revokedAtPlatform = r.ok;
    } catch {
      /* best effort */
    }
  }
  if (row && provider === 'google') {
    try {
      const r = await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(decryptToken(row.refreshToken || row.accessToken))}`, { method: 'POST', signal: AbortSignal.timeout(10000) });
      revokedAtPlatform = r.ok;
    } catch {
      /* best effort */
    }
  }
  await db.integrationToken.deleteMany({ where: { workspaceId: ctx.workspaceId, platform: p.dbPlatform } });
  await db.consentRecord.updateMany({ where: { workspaceId: ctx.workspaceId, provider, revokedAt: null }, data: { revokedAt: new Date() } });
  return NextResponse.json({ success: true, revokedAtPlatform });
}
