import React from 'react';
import { PlatformId } from '@/shared/adspec';
import { BrandLogo, BrandId } from '@/frontend/components/common/BrandLogo';

/** Premium platform logo tile used across the whole app. */
export function PlatformBadge({ id, size = 32 }: { id: PlatformId | BrandId; size?: number }) {
  return <BrandLogo id={id as BrandId} size={size} />;
}
