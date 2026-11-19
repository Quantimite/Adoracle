export type Platform = 'META' | 'TIKTOK' | 'GOOGLE' | 'YOUTUBE' | 'LINKEDIN';

export type CampaignStatus = 'ACTIVE' | 'LEARNING' | 'ERROR' | 'PAUSED';

export type ViewMode = 'plain' | 'expert';

export interface Workspace {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationToken {
  id: string;
  workspaceId: string;
  platform: Platform;
  accessToken: string; // Encrypted via AES-256
  refreshToken?: string;
  expiresAt?: string;
  connectedAt: string;
}

export interface BusinessProfile {
  id: string;
  workspaceId: string;
  websiteUrl: string;
  offerings: string;
  priceTier: 'LOW' | 'MID' | 'HIGH';
  targetAudience: string;
  reachType: 'LOCAL' | 'NATIONAL' | 'GLOBAL';
  scrapedAt: string;
}

export interface Campaign {
  id: string;
  workspaceId: string;
  platform: Platform;
  name: string;
  status: CampaignStatus;
  dailyBudget: number;
  customersWon: number;
  costPerCustomer: number; // CPA
  totalSpend: number;
  roas?: number;
  cpm?: number;
  ctr?: number;
  frequency?: number;
  aiOptimizing: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LearningLesson {
  id: string;
  workspaceId: string;
  category: string;
  description: string;
  confidence: 'High Confidence' | 'Medium Confidence';
  createdAt: string;
  impactTag?: string;
  metricsLift?: string;
}

export interface SeoAudit {
  id: string;
  workspaceId: string;
  healthScore: number;
  organicClicks: number;
  searchImpressions: number;
  coreWebVitals: boolean; // True if 3/3 met
  brokenLinksCount: number;
  auditedAt: string;
  brokenLinksList?: { url: string; destination: string; status: number; type: string }[];
}

export interface KeywordRank {
  id: string;
  term: string;
  volume: number;
  geo: string;
  rank: number;
  change: number; // e.g. +3, -1
  conversionRate: number; // e.g. 4.2%
}

export interface ActionCenterItem {
  id: string;
  severity: 'crimson' | 'amber' | 'emerald';
  title: string;
  description: string;
  actionLabel: string;
  resolved: boolean;
  platform?: Platform;
}

export interface ChannelRecommendation {
  platform: Platform;
  name: string;
  matchScore: number; // 0 - 100
  recommendedBudget: number;
  budgetPercentage: number;
  reasoning: string;
  warning?: string;
  enabled: boolean;
  tier: 'Proven Performance (70%)' | 'Discovery / Growth (30%)' | 'Advisory Blocked';
}

