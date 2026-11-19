import { Campaign, Platform } from '@/shared/types';

export interface PlatformConnector {
  platform: Platform;
  connect(credentials: { accessToken: string; accountId?: string }): Promise<{ success: boolean; accountName: string }>;
  fetchCampaigns(workspaceId: string): Promise<Campaign[]>;
  fetchMetrics(campaignId: string): Promise<{
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    cpa: number;
    roas: number;
  }>;
  createCampaign(payload: {
    workspaceId: string;
    name: string;
    dailyBudget: number;
    objective: string;
    targeting: Record<string, any>;
  }): Promise<Campaign>;
}

