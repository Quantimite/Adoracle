import React, { useId } from 'react';
import { BRAND_PATHS } from '@/shared/brandPaths';

export type BrandId = 'META' | 'FACEBOOK' | 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE' | 'GOOGLE' | 'LINKEDIN';

/**
 * Premium social / ad platform logos: official glyphs on a soft glossy tile.
 * size = tile size in px. variant "glyph" draws only the logo (no tile).
 */
export function BrandLogo({ id, size = 36, variant = 'tile', className = '' }: { id: BrandId; size?: number; variant?: 'tile' | 'glyph'; className?: string }) {
  const uid = useId().replace(/:/g, '');
  const r = Math.round(size * 0.28);
  const g = size * 0.56; // glyph size inside the tile
  const off = (size - g) / 2;

  const glyph = (() => {
    switch (id) {
      case 'META':
        return <path d={BRAND_PATHS.meta} fill={variant === 'tile' ? '#fff' : '#0467DF'} />;
      case 'FACEBOOK':
        return <path d={BRAND_PATHS.facebook} fill={variant === 'tile' ? '#fff' : '#0866FF'} />;
      case 'INSTAGRAM':
        return <path d={BRAND_PATHS.instagram} fill={variant === 'tile' ? '#fff' : `url(#ig${uid})`} />;
      case 'LINKEDIN':
        return <path d={BRAND_PATHS.linkedin} fill={variant === 'tile' ? '#fff' : '#0A66C2'} />;
      case 'YOUTUBE':
        return <path d={BRAND_PATHS.youtube} fill={variant === 'tile' ? '#fff' : '#FF0000'} />;
      case 'TIKTOK':
        return (
          <>
            <path d={BRAND_PATHS.tiktok} fill="#25F4EE" transform="translate(-0.7 -0.5)" />
            <path d={BRAND_PATHS.tiktok} fill="#FE2C55" transform="translate(0.7 0.5)" />
            <path d={BRAND_PATHS.tiktok} fill={variant === 'tile' ? '#fff' : '#000'} />
          </>
        );
      case 'GOOGLE':
        return (
          <>
            <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3a7.2 7.2 0 0 1-10.74-3.78H1.33v3.09A12 12 0 0 0 12 24z" />
            <path fill="#FBBC05" d="M5.32 14.31a7.2 7.2 0 0 1 0-4.62V6.6H1.33a12 12 0 0 0 0 10.8z" />
            <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.33 6.6l3.99 3.09A7.2 7.2 0 0 1 12 4.75z" />
          </>
        );
    }
  })();

  const defs = (
    <defs>
      <linearGradient id={`ig${uid}`} x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#FEDA75" /><stop offset="0.35" stopColor="#FA7E1E" /><stop offset="0.6" stopColor="#D62976" /><stop offset="1" stopColor="#4F5BD5" />
      </linearGradient>
      <linearGradient id={`bg${uid}`} x1="0" y1="0" x2="1" y2="1">
        {id === 'META' && (<><stop offset="0" stopColor="#2B8CFF" /><stop offset="1" stopColor="#0453C9" /></>)}
        {id === 'FACEBOOK' && (<><stop offset="0" stopColor="#2E8BFF" /><stop offset="1" stopColor="#0A5BE0" /></>)}
        {id === 'INSTAGRAM' && (<><stop offset="0" stopColor="#FEDA75" /><stop offset="0.3" stopColor="#FA7E1E" /><stop offset="0.6" stopColor="#D62976" /><stop offset="1" stopColor="#4F5BD5" /></>)}
        {id === 'TIKTOK' && (<><stop offset="0" stopColor="#1B1B1F" /><stop offset="1" stopColor="#000" /></>)}
        {id === 'YOUTUBE' && (<><stop offset="0" stopColor="#FF4A4A" /><stop offset="1" stopColor="#D40000" /></>)}
        {id === 'LINKEDIN' && (<><stop offset="0" stopColor="#1A86DB" /><stop offset="1" stopColor="#0A5AA8" /></>)}
        {id === 'GOOGLE' && (<><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#F1F4F9" /></>)}
      </linearGradient>
      <linearGradient id={`gl${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.28" /><stop offset="0.55" stopColor="#fff" stopOpacity="0" /></linearGradient>
    </defs>
  );

  if (variant === 'glyph') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} role="img" aria-label={id.toLowerCase()}>
        {defs}
        {glyph}
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={`shrink-0 ${className}`} role="img" aria-label={id.toLowerCase()} style={{ filter: 'drop-shadow(0 4px 8px rgba(15,23,42,0.18))' }}>
      {defs}
      <rect width={size} height={size} rx={r} fill={`url(#bg${uid})`} />
      <rect width={size} height={size} rx={r} fill={`url(#gl${uid})`} />
      <rect x="0.5" y="0.5" width={size - 1} height={size - 1} rx={r - 0.5} fill="none" stroke={id === 'GOOGLE' ? 'rgba(15,23,42,0.10)' : 'rgba(255,255,255,0.22)'} />
      <svg x={off} y={off} width={g} height={g} viewBox="0 0 24 24">{glyph}</svg>
    </svg>
  );
}
