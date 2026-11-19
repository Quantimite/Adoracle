// src/backend/integrations/tokens.ts
// Reads a workspace's stored connection and returns a usable access token (refreshing Google tokens when expired).
import { db } from '@/backend/db/client';
import { decryptToken, encryptToken } from '@/backend/security/encryption';

export type DbPlatformKey = 'META' | 'GOOGLE' | 'TIKTOK' | 'LINKEDIN';

export function dbPlatformFor(platform: string): DbPlatformKey {
  return (platform === 'YOUTUBE' || platform === 'INSTAGRAM' ? (platform === 'YOUTUBE' ? 'GOOGLE' : 'META') : platform) as DbPlatformKey;
}

export async function getConnection(workspaceId: string, platform: string) {
  const row = await db.integrationToken.findFirst({ where: { workspaceId, platform: dbPlatformFor(platform) } });
  if (!row || row.status !== 'CONNECTED') return null;

  let accessToken = decryptToken(row.accessToken);

  // Google access tokens last ~1 hour. Use the refresh token to get a new one.
  if (row.platform === 'GOOGLE' && row.refreshToken && row.expiresAt && row.expiresAt.getTime() < Date.now() + 60_000) {
    try {
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_ADS_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
          refresh_token: decryptToken(row.refreshToken),
          grant_type: 'refresh_token',
        }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json();
      if (data.access_token) {
        accessToken = data.access_token;
        await db.integrationToken.update({
          where: { id: row.id },
          data: { accessToken: encryptToken(accessToken), expiresAt: new Date(Date.now() + (data.expires_in || 3600) * 1000) },
        });
      } else {
        await db.integrationToken.update({ where: { id: row.id }, data: { status: 'NEEDS_RECONNECT' } });
        return null;
      }
    } catch {
      return null;
    }
  }

  return { row, accessToken, meta: (row.meta || {}) as any };
}
