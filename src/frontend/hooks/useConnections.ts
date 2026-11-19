'use client';

import { useCallback, useEffect, useState } from 'react';
import type { FeatureId, ProviderKey } from '@/shared/connectFeatures';

export interface VerificationInfo {
  valid: boolean;
  identity?: { id?: string; name?: string; email?: string };
  grantedFeatures: FeatureId[];
  missingFeatures: FeatureId[];
  checks: { label: string; ok: boolean; detail?: string }[];
  checkedAt: string;
  error?: string;
}

export interface ConnectionInfo {
  key: ProviderKey;
  label: string;
  docsUrl: string;
  configured: boolean;
  missingEnv: string[];
  supportedFeatures: FeatureId[];
  connected: boolean;
  needsReconnect: boolean;
  accountId: string | null;
  accountName: string | null;
  accounts: { id: string; name: string }[];
  pages: { id: string; name: string; instagram?: { id: string; username?: string } | null }[];
  chosenFeatures: FeatureId[];
  verification: VerificationInfo | null;
  consent: { grantedAt: string; version: string; features: string[] } | null;
  connectedAt: string | null;
  expiresAt: string | null;
}

export function useConnections() {
  const [connections, setConnections] = useState<ConnectionInfo[]>([]);
  const [canManage, setCanManage] = useState(true);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/connections', { cache: 'no-store' });
      if (!res.ok) throw new Error('bad');
      const data = await res.json();
      setConnections(data.connections || []);
      setCanManage(data.canManage !== false);
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

  /** Asks the platform again whether the login and permissions are still good. */
  const verify = useCallback(
    async (provider: string) => {
      await fetch('/api/connections/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider }) });
      await refresh();
    },
    [refresh]
  );

  return { connections, loading, failed, canManage, refresh, verify };
}

/** Is this platform connected? (YouTube rides on the Google connection.) */
export function isPlatformConnected(connections: ConnectionInfo[], platform: string) {
  const key = platform === 'YOUTUBE' ? 'google' : platform.toLowerCase();
  return connections.some((c) => c.key === key && c.connected);
}

/** Did the user allow a feature (e.g. 'posts') on this platform? */
export function hasFeature(connections: ConnectionInfo[], platform: string, feature: FeatureId) {
  const key = platform === 'YOUTUBE' ? 'google' : platform.toLowerCase();
  const c = connections.find((x) => x.key === key && x.connected);
  return !!c && (c.verification?.grantedFeatures || c.chosenFeatures).includes(feature);
}
