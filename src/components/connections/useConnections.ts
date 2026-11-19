'use client';

import { useCallback, useEffect, useState } from 'react';

export interface ConnectionInfo {
  key: 'meta' | 'google' | 'tiktok' | 'linkedin';
  label: string;
  permissions: string[];
  docsUrl: string;
  configured: boolean;
  missingEnv: string[];
  connected: boolean;
  accountId: string | null;
  accountName: string | null;
  accounts: { id: string; name: string }[];
  pages: { id: string; name: string; instagram?: { id: string; username?: string } | null }[];
  connectedAt: string | null;
  expiresAt: string | null;
}

export function useConnections() {
  const [connections, setConnections] = useState<ConnectionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/connections', { cache: 'no-store' });
      if (!res.ok) throw new Error('bad');
      const data = await res.json();
      setConnections(data.connections || []);
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { connections, loading, failed, refresh };
}

/** Which of our 5 platform ids are connected (YouTube rides on the Google connection). */
export function isPlatformConnected(connections: ConnectionInfo[], platform: string) {
  const key = platform === 'YOUTUBE' ? 'google' : platform.toLowerCase();
  return connections.some((c) => c.key === key && c.connected);
}
