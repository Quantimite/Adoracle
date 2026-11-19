import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/backend/db/client';
import { getCtx, unauthorized } from '@/backend/auth/session';
import { getConnection } from '@/backend/integrations/tokens';
import { verifyConnection } from '@/backend/integrations/verify';
import { PROVIDERS, ProviderKey, isProviderKey } from '@/backend/integrations/oauth';

/** POST { provider } → re-checks the connection directly with the platform and stores the result. */
export async function POST(req: NextRequest) {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();

  const { provider } = await req.json();
  if (!isProviderKey(provider)) return NextResponse.json({ error: 'Unknown platform' }, { status: 400 });
  const key = provider as ProviderKey;

  const conn = await getConnection(ctx.workspaceId, PROVIDERS[key].dbPlatform);
  if (!conn) {
    await db.integrationToken.updateMany({ where: { workspaceId: ctx.workspaceId, platform: PROVIDERS[key].dbPlatform }, data: { status: 'NEEDS_RECONNECT' } });
    return NextResponse.json({ valid: false, needsReconnect: true, error: 'The saved login has expired or was removed.' });
  }

  const wanted = conn.meta.features || [];
  const result = await verifyConnection(key, conn.accessToken, wanted);
  await db.integrationToken.update({
    where: { id: conn.row.id },
    data: {
      status: result.valid ? 'CONNECTED' : 'NEEDS_RECONNECT',
      scopes: result.grantedScopes.join(' ') || conn.row.scopes,
      lastSyncedAt: new Date(),
      meta: { ...conn.meta, verification: result } as any,
    },
  });
  return NextResponse.json({ ...result, needsReconnect: !result.valid });
}
