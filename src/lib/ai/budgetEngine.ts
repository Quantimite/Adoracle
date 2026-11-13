import { ChannelRecommendation, Platform } from '@/types';

export interface BudgetInputParams {
  buyerType: 'B2C' | 'B2B';
  intent: 'Search' | 'Scrolling';
  pricePoint: 'Low' | 'Mid' | 'High';
  monthlyBudget: number;
}

export interface ProfilerResult {
  recommendations: ChannelRecommendation[];
  whereNotToSpend: {
    platform: Platform;
    platformName: string;
    warningTitle: string;
    reason: string;
    thresholdNotice: string;
  }[];
  totalAllocated: number;
  provenBudget: number; // 70%
  growthBudget: number; // 30%
}

export function calculateChannelMix(params: BudgetInputParams): ProfilerResult {
  const { buyerType, intent, pricePoint, monthlyBudget } = params;

  const provenBudget = Math.round(monthlyBudget * 0.7);
  const growthBudget = monthlyBudget - provenBudget;

  const recommendations: ChannelRecommendation[] = [];
  const whereNotToSpend: ProfilerResult['whereNotToSpend'] = [];

  // Rules based on marketing intelligence:
  if (buyerType === 'B2B') {
    // B2B scenarios
    if (intent === 'Search') {
      recommendations.push({
        platform: 'GOOGLE',
        name: 'Google Search & PMax',
        matchScore: 96,
        recommendedBudget: Math.round(provenBudget * 0.75),
        budgetPercentage: 52,
        reasoning: 'High-intent B2B problem solvers searching specifically for your solution category.',
        enabled: true,
        tier: 'Proven Performance (70%)',
      });
      recommendations.push({
        platform: 'LINKEDIN',
        name: 'LinkedIn Ads (Targeted)',
        matchScore: monthlyBudget < 3000 ? 58 : 88,
        recommendedBudget: Math.round(provenBudget * 0.25),
        budgetPercentage: 18,
        reasoning: monthlyBudget < 3000 
          ? 'High CPM platform. Only viable for tightly gated senior ICP targeting.' 
          : 'Ideal for account-based targeting, verified job titles, and senior decision makers.',
        warning: monthlyBudget < 3000 ? 'Minimum suggested monthly spend for LinkedIn is $3,000+ due to $80-140 CPMs.' : undefined,
        enabled: monthlyBudget >= 3000,
        tier: monthlyBudget < 3000 ? 'Advisory Blocked' : 'Proven Performance (70%)',
      });
      recommendations.push({
        platform: 'YOUTUBE',
        name: 'YouTube In-Stream & Shorts',
        matchScore: 82,
        recommendedBudget: Math.round(growthBudget * 0.6),
        budgetPercentage: 18,
        reasoning: 'In-depth product walkthroughs and thought leadership videos for mid/high consideration buyers.',
        enabled: true,
        tier: 'Discovery / Growth (30%)',
      });
      recommendations.push({
        platform: 'META',
        name: 'Meta Retargeting & Lookalikes',
        matchScore: 78,
        recommendedBudget: Math.round(growthBudget * 0.4),
        budgetPercentage: 12,
        reasoning: 'Cost-effective retargeting of website visitors while they browse Instagram and Facebook.',
        enabled: true,
        tier: 'Discovery / Growth (30%)',
      });
      recommendations.push({
        platform: 'TIKTOK',
        name: 'TikTok Ads',
        matchScore: 35,
        recommendedBudget: 0,
        budgetPercentage: 0,
        reasoning: 'Generally low conversion efficiency for high-consideration B2B offerings.',
        warning: 'Avoid for direct B2B lead generation. CPM is cheap but lead qualification rate is historically under 5%.',
        enabled: false,
        tier: 'Advisory Blocked',
      });
    } else {
      // B2B Scrolling / Social Discovery
      recommendations.push({
        platform: 'LINKEDIN',
        name: 'LinkedIn Thought Leader Ads',
        matchScore: 92,
        recommendedBudget: Math.round(provenBudget * 0.6),
        budgetPercentage: 42,
        reasoning: 'Direct CEO and Founder thought leadership ads driving credibility into feeds.',
        enabled: monthlyBudget >= 2500,
        warning: monthlyBudget < 2500 ? 'Budget is under $2,500/mo. LinkedIn auction may stall.' : undefined,
        tier: 'Proven Performance (70%)',
      });
      recommendations.push({
        platform: 'META',
        name: 'Meta Ads (Founder Led)',
        matchScore: 86,
        recommendedBudget: Math.round(provenBudget * 0.4),
        budgetPercentage: 28,
        reasoning: 'Low-CPM founder-led direct response ads driving lead magnets and webinars.',
        enabled: true,
        tier: 'Proven Performance (70%)',
      });
      recommendations.push({
        platform: 'YOUTUBE',
        name: 'YouTube Ads',
        matchScore: 75,
        recommendedBudget: growthBudget,
        budgetPercentage: 30,
        reasoning: 'Case study video distribution across tech and industry channels.',
        enabled: true,
        tier: 'Discovery / Growth (30%)',
      });
      recommendations.push({
        platform: 'GOOGLE',
        name: 'Google Search Capture',
        matchScore: 70,
        recommendedBudget: 0,
        budgetPercentage: 0,
        reasoning: 'Lower priority when primary objective is passive social discovery.',
        enabled: false,
        tier: 'Discovery / Growth (30%)',
      });
      recommendations.push({
        platform: 'TIKTOK',
        name: 'TikTok Ads',
        matchScore: 40,
        recommendedBudget: 0,
        budgetPercentage: 0,
        reasoning: 'Low audience alignment for executive decision makers.',
        warning: 'High risk of wasted ad budget for enterprise B2B sales pipelines.',
        enabled: false,
        tier: 'Advisory Blocked',
      });
    }

    if (monthlyBudget < 3000) {
      whereNotToSpend.push({
        platform: 'LINKEDIN',
        platformName: 'LinkedIn Campaign Manager',
        warningTitle: 'High CPM Trap Alert',
        reason: 'At budgets under $3,000/mo, LinkedIn’s $80–$140 CPMs will only yield 25–40 clicks total, severely failing statistical ad testing significance.',
        thresholdNotice: 'Recommended minimum test budget: $3,000/mo.',
      });
    }

    whereNotToSpend.push({
      platform: 'TIKTOK',
      platformName: 'TikTok Ads Manager',
      warningTitle: 'Low Lead Quality Trap',
      reason: 'B2B conversion forms on TikTok frequently suffer from phantom auto-fills and non-business email submissions, resulting in low sales-accepted leads.',
      thresholdNotice: 'Recommended: Exclude unless building broad consumer developer brand.',
    });
  } else {
    // B2C scenarios
    if (intent === 'Search') {
      recommendations.push({
        platform: 'GOOGLE',
        name: 'Google Shopping & Search',
        matchScore: 98,
        recommendedBudget: Math.round(provenBudget * 0.7),
        budgetPercentage: 49,
        reasoning: 'Direct purchase intent from active shoppers looking to buy right now.',
        enabled: true,
        tier: 'Proven Performance (70%)',
      });
      recommendations.push({
        platform: 'META',
        name: 'Meta Advantage+ Catalog & Reels',
        matchScore: 90,
        recommendedBudget: Math.round(provenBudget * 0.3),
        budgetPercentage: 21,
        reasoning: 'Re-engages warm visitors with dynamic product carousel and visual lifestyle imagery.',
        enabled: true,
        tier: 'Proven Performance (70%)',
      });
      recommendations.push({
        platform: 'TIKTOK',
        name: 'TikTok Spark Ads & Shop',
        matchScore: 84,
        recommendedBudget: Math.round(growthBudget * 0.6),
        budgetPercentage: 18,
        reasoning: 'Organic-style creator UGC showcasing product unboxing and reviews.',
        enabled: true,
        tier: 'Discovery / Growth (30%)',
      });
      recommendations.push({
        platform: 'YOUTUBE',
        name: 'YouTube Shorts & In-Feed',
        matchScore: 78,
        recommendedBudget: Math.round(growthBudget * 0.4),
        budgetPercentage: 12,
        reasoning: 'Captures visual search queries with rapid unboxings and visual demonstrations.',
        enabled: true,
        tier: 'Discovery / Growth (30%)',
      });
      recommendations.push({
        platform: 'LINKEDIN',
        name: 'LinkedIn Ads',
        matchScore: 18,
        recommendedBudget: 0,
        budgetPercentage: 0,
        reasoning: 'Completely unsuited for direct B2C consumer shopping.',
        warning: 'Never run B2C consumer goods on LinkedIn. Severe waste of budget.',
        enabled: false,
        tier: 'Advisory Blocked',
      });
    } else {
      // B2C Scrolling / Impulse
      recommendations.push({
        platform: 'META',
        name: 'Meta & Instagram Advantage+ Sales',
        matchScore: 97,
        recommendedBudget: Math.round(provenBudget * 0.6),
        budgetPercentage: 42,
        reasoning: 'Deep algorithmic visual buyer profiling and dynamic lifestyle creative scaling.',
        enabled: true,
        tier: 'Proven Performance (70%)',
      });
      recommendations.push({
        platform: 'TIKTOK',
        name: 'TikTok Ads & Spark Posts',
        matchScore: 94,
        recommendedBudget: Math.round(provenBudget * 0.4),
        budgetPercentage: 28,
        reasoning: 'Viral hook videos and native sound UGC converting impulse shoppers.',
        enabled: true,
        tier: 'Proven Performance (70%)',
      });
      recommendations.push({
        platform: 'YOUTUBE',
        name: 'YouTube Shorts Ads',
        matchScore: 82,
        recommendedBudget: Math.round(growthBudget * 0.6),
        budgetPercentage: 18,
        reasoning: 'High volume short-form video reach converting across connected devices.',
        enabled: true,
        tier: 'Discovery / Growth (30%)',
      });
      recommendations.push({
        platform: 'GOOGLE',
        name: 'Google Performance Max (Brand Catch)',
        matchScore: 76,
        recommendedBudget: Math.round(growthBudget * 0.4),
        budgetPercentage: 12,
        reasoning: 'Catches branded search queries generated by TikTok and Meta impressions.',
        enabled: true,
        tier: 'Discovery / Growth (30%)',
      });
      recommendations.push({
        platform: 'LINKEDIN',
        name: 'LinkedIn Ads',
        matchScore: 12,
        recommendedBudget: 0,
        budgetPercentage: 0,
        reasoning: 'Unviable unit economics for standard consumer transactions.',
        warning: 'Prohibited for B2C consumer impulse products.',
        enabled: false,
        tier: 'Advisory Blocked',
      });
    }

    whereNotToSpend.push({
      platform: 'LINKEDIN',
      platformName: 'LinkedIn Campaign Manager',
      warningTitle: 'Prohibited for B2C Products',
      reason: 'LinkedIn charges $80+ CPMs for professional demographic data that has zero correlation to consumer goods purchases.',
      thresholdNotice: 'Cost Per Customer will be 10x higher than Meta/TikTok.',
    });
  }

  return {
    recommendations,
    whereNotToSpend,
    totalAllocated: monthlyBudget,
    provenBudget,
    growthBudget,
  };
}

