import React from 'react';
import { PlatformId, SPECS } from '@/lib/adspec';

const GLYPH: Record<PlatformId, string> = { META: '∞', TIKTOK: '♪', GOOGLE: 'G', YOUTUBE: '▶', LINKEDIN: 'in' };

export function PlatformBadge({ id, size = 32 }: { id: PlatformId; size?: number }) {
  const color = SPECS[id].color;
  return (
    <span
      className="inline-flex items-center justify-center rounded-xl font-black text-white shrink-0 select-none"
      style={{ width: size, height: size, background: color, fontSize: size * 0.42 }}
      aria-hidden="true"
    >
      {GLYPH[id]}
    </span>
  );
}
