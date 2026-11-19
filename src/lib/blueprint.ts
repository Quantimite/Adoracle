// src/lib/blueprint.ts
// Turns ONE builder setup into a Campaign > Ad set > Ad tree for each selected platform.
import { PlatformId, SPECS, UniversalObjective } from '@/lib/adspec';

export interface BuilderConfig {
  platforms: PlatformId[];
  setupMode: 'unified' | 'custom';
  campaign: {
    name: string;
    objective: UniversalObjective;
    campaignTypes: Partial<Record<PlatformId, string>>;
    budgetStrategy: 'campaign' | 'adset';
    specialCategory: string;
    launchStatus: 'PAUSED' | 'ACTIVE';
  };
  adSet: {
    plan: 'single' | 'test';
    conversionLocation: string;
    conversionEvent: string;
    audienceMode: 'advantage' | 'manual';
    locations: string[];
    ageMin: number;
    ageMax: number;
    gender: 'all' | 'women' | 'men';
    languages: string[];
    interests: string[];
    excludeBuyers: boolean;
    placementMode: 'auto' | 'manual';
    placements: Partial<Record<PlatformId, string[]>>;
    budgetType: 'daily' | 'lifetime';
    totalBudget: number; // across every selected platform
    startDate: string;
    endDate: string;
    noEnd: boolean;
    bidStrategy: Partial<Record<PlatformId, string>>;
    costCap: number;
    attribution: string;
  };
  ad: {
    name: string;
    format: Partial<Record<PlatformId, string>>;
    mediaUrl: string;
    primaryText: string;
    headline: string;
    description: string;
    cta: string;
    destinationUrl: string;
    utm: boolean;
  };
  split: Partial<Record<PlatformId, number>>; // percent per platform (sums to 100)
  overrides: Partial<Record<PlatformId, { headline?: string; primaryText?: string; destinationUrl?: string }>>;
}

export interface BlueprintAd {
  name: string;
  format: string;
  primaryText: string;
  headline: string;
  description: string;
  cta: string;
  destinationUrl: string;
  mediaUrl: string;
  warnings: string[];
}

export interface BlueprintAdSet {
  name: string;
  budget: number | null; // null when budget lives on the campaign
  budgetType: 'daily' | 'lifetime';
  audience: string;
  placements: string[];
  bidStrategy: string;
  optimization: string;
  ads: BlueprintAd[];
}

export interface PlatformBlueprint {
  platform: PlatformId;
  managerName: string;
  levels: [string, string, string];
  campaign: {
    name: string;
    nativeObjective: string | null;
    type: string;
    budget: number | null;
    budgetType: 'daily' | 'lifetime';
    status: string;
    specialCategory: string;
  };
  adSets: BlueprintAdSet[];
  platformBudget: number;
  warnings: string[];
  supported: boolean;
}

export function withUtm(url: string, platform: PlatformId, campaign: string, on: boolean) {
  if (!on || !url) return url;
  try {
    const u = new URL(url);
    u.searchParams.set('utm_source', SPECS[platform].short.toLowerCase());
    u.searchParams.set('utm_medium', 'paid');
    u.searchParams.set(
      'utm_campaign',
      campaign.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    );
    return u.toString();
  } catch {
    return url;
  }
}

export function normalizeSplit(platforms: PlatformId[], split: BuilderConfig['split']) {
  const raw = platforms.map((p) => Math.max(0, Number(split[p] ?? 0)));
  const sum = raw.reduce((a, b) => a + b, 0);
  if (!platforms.length) return {} as Record<PlatformId, number>;
  const out: Record<string, number> = {};
  platforms.forEach((p, i) => {
    out[p] = sum > 0 ? (raw[i] / sum) * 100 : 100 / platforms.length;
  });
  return out as Record<PlatformId, number>;
}

export function buildBlueprints(cfg: BuilderConfig): PlatformBlueprint[] {
  const split = normalizeSplit(cfg.platforms, cfg.split);

  return cfg.platforms.map((platform) => {
    const spec = SPECS[platform];
    const share = (cfg.adSet.totalBudget * (split[platform] ?? 0)) / 100;
    const names = spec.adSetPlans[cfg.adSet.plan];
    const nativeObjective = spec.objectiveMap[cfg.campaign.objective];
    const campaignType = cfg.campaign.campaignTypes[platform] || spec.campaignTypes[0].id;
    const typeLabel = spec.campaignTypes.find((t) => t.id === campaignType)?.label || campaignType;
    const budgetOnCampaign = cfg.campaign.budgetStrategy === 'campaign' && spec.campaignBudget;
    const bid = cfg.adSet.bidStrategy[platform] || spec.bidStrategies[0].id;
    const bidLabel = spec.bidStrategies.find((b) => b.id === bid)?.label || bid;
    const ov = cfg.overrides[platform] || {};
    const warnings: string[] = [];

    if (nativeObjective === null) warnings.push(`${spec.short} has no "${cfg.campaign.objective.toLowerCase()}" objective, so it will be skipped.`);
    if (share > 0 && share < 10 && cfg.adSet.budgetType === 'daily') warnings.push(`Budget is low for ${spec.short} (${spec.minDailyBudgetHint}).`);

    const placements =
      cfg.adSet.placementMode === 'auto'
        ? ['Automatic placements']
        : (cfg.adSet.placements[platform]?.length ? cfg.adSet.placements[platform]! : spec.placements.map((p) => p.id)).map(
            (id) => spec.placements.find((p) => p.id === id)?.label || id
          );

    const audience =
      cfg.adSet.audienceMode === 'advantage'
        ? `Automated audience · ${cfg.adSet.locations.join(', ') || 'All locations'}`
        : `${cfg.adSet.locations.join(', ') || 'All locations'} · ${cfg.adSet.ageMin}–${cfg.adSet.ageMax} · ${
            cfg.adSet.gender === 'all' ? 'All genders' : cfg.adSet.gender
          }${cfg.adSet.interests.length ? ' · ' + cfg.adSet.interests.slice(0, 3).join(', ') : ''}`;

    const headline = ov.headline ?? cfg.ad.headline;
    const primary = ov.primaryText ?? cfg.ad.primaryText;
    const dest = withUtm(ov.destinationUrl ?? cfg.ad.destinationUrl, platform, cfg.campaign.name, cfg.ad.utm);
    const adWarnings: string[] = [];
    if (headline.length > spec.limits.headline) adWarnings.push(`Headline is ${headline.length} chars (limit ${spec.limits.headline})`);
    if (primary.length > spec.limits.primary) adWarnings.push(`Primary text is ${primary.length} chars (recommended ${spec.limits.primary})`);
    if (!dest) adWarnings.push('Missing destination URL');
    if (!cfg.ad.mediaUrl && platform !== 'GOOGLE') adWarnings.push('No creative attached yet');

    const adSets: BlueprintAdSet[] = names.map((n) => ({
      name: `${cfg.campaign.name} · ${n}`,
      budget: budgetOnCampaign ? null : Math.round((share / names.length) * 100) / 100,
      budgetType: cfg.adSet.budgetType,
      audience,
      placements,
      bidStrategy: bidLabel,
      optimization: `${cfg.adSet.conversionEvent || 'Default event'} on ${
        spec.conversionLocations.find((c) => c.id === cfg.adSet.conversionLocation)?.label || 'Website'
      }`,
      ads: [
        {
          name: `${cfg.ad.name} · ${n}`,
          format: spec.formats.find((f) => f.id === cfg.ad.format[platform])?.label || spec.formats[0].label,
          primaryText: primary,
          headline,
          description: cfg.ad.description,
          cta: cfg.ad.cta,
          destinationUrl: dest,
          mediaUrl: cfg.ad.mediaUrl,
          warnings: adWarnings,
        },
      ],
    }));

    return {
      platform,
      managerName: spec.managerName,
      levels: spec.levels,
      campaign: {
        name: `${cfg.campaign.name} [${spec.short}]`,
        nativeObjective,
        type: typeLabel,
        budget: budgetOnCampaign ? Math.round(share * 100) / 100 : null,
        budgetType: cfg.adSet.budgetType,
        status: cfg.campaign.launchStatus,
        specialCategory: cfg.campaign.specialCategory,
      },
      adSets,
      platformBudget: Math.round(share * 100) / 100,
      warnings,
      supported: nativeObjective !== null,
    };
  });
}
