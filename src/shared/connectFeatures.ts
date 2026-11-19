// src/shared/connectFeatures.ts
// Plain-language "what do you want Adoracle to do?" → the exact permissions each platform needs.
// Used by the connect screen (frontend) and by the OAuth + verification code (backend).

export type ProviderKey = 'meta' | 'google' | 'tiktok' | 'linkedin';
export type FeatureId = 'ads' | 'reports' | 'posts' | 'library';

export const AGREEMENT_VERSION = '2026-11-17';

export interface FeatureInfo {
  id: FeatureId;
  title: string;
  plain: string;
  /** Exact permissions requested from each platform for this feature (empty = not supported there) */
  scopes: Record<ProviderKey, string[] | null>;
}

const G = 'https://www.googleapis.com/auth/';

export const FEATURES: FeatureInfo[] = [
  {
    id: 'ads',
    title: 'Create & manage my ads',
    plain: 'Create campaigns, change budgets, pause or resume ads. Campaigns are always created paused first.',
    scopes: { meta: ['ads_management', 'business_management'], google: [G + 'adwords'], tiktok: [], linkedin: ['rw_ads'] },
  },
  {
    id: 'reports',
    title: 'Show my ad results',
    plain: 'Read spend, reach, clicks and conversions so your dashboard shows real numbers.',
    scopes: { meta: ['ads_read'], google: [G + 'adwords'], tiktok: [], linkedin: ['r_ads_reporting'] },
  },
  {
    id: 'posts',
    title: 'Publish posts & reels for me',
    plain: 'Post photos, videos and reels to your Pages and channels when you press Publish.',
    scopes: {
      meta: ['pages_show_list', 'pages_manage_posts', 'pages_read_engagement', 'instagram_basic', 'instagram_content_publish'],
      google: [G + 'youtube.upload'],
      tiktok: null,
      linkedin: ['w_member_social'],
    },
  },
  {
    id: 'library',
    title: 'Let me pick my existing posts',
    plain: 'Read your published posts and videos so you can select one as an ad, without re-uploading.',
    scopes: { meta: ['pages_show_list', 'pages_read_engagement', 'instagram_basic'], google: [G + 'youtube.readonly'], tiktok: null, linkedin: null },
  },
];

export const BASE_SCOPES: Record<ProviderKey, string[]> = {
  meta: ['public_profile'],
  google: ['openid', 'email'],
  tiktok: [],
  linkedin: [],
};

export const PROVIDER_FEATURES: Record<ProviderKey, FeatureId[]> = {
  meta: ['ads', 'reports', 'posts', 'library'],
  google: ['ads', 'reports', 'posts', 'library'],
  tiktok: ['ads', 'reports'],
  linkedin: ['ads', 'reports', 'posts'],
};

export function scopesForFeatures(provider: ProviderKey, features: FeatureId[]): string[] {
  const set = new Set<string>(BASE_SCOPES[provider]);
  for (const f of FEATURES) {
    if (!features.includes(f.id)) continue;
    (f.scopes[provider] || []).forEach((s) => set.add(s));
  }
  return Array.from(set);
}

/** Which features are fully covered by a list of granted permissions. */
export function featuresCovered(provider: ProviderKey, granted: string[]): FeatureId[] {
  return PROVIDER_FEATURES[provider].filter((id) => {
    const need = FEATURES.find((f) => f.id === id)!.scopes[provider] || [];
    return need.every((s) => granted.includes(s));
  });
}

export const AGREEMENT_POINTS: string[] = [
  'I am allowed to manage these accounts (I own them or have permission from the owner).',
  'Adoracle may use the permissions I selected, and only for the features I selected.',
  'Adoracle will never post, spend money or change an ad without me pressing a button, except for the automation rules I switch on myself.',
  'My login password is never shared with Adoracle. I can disconnect at any time, and I can also remove access inside the platform’s own settings.',
  'Ad spend is billed by the ad platform, not by Adoracle.',
];
