import { PlatformConnector } from './types';
import { Campaign } from '@/shared/types';

export class TikTokConnector implements PlatformConnector {
  platform = 'TIKTOK' as const;

  async connect(credentials: { accessToken: string; accountId?: string }) {
    return {
      success: true,
      accountName: 'TikTok For Business (tt_adv_847192)',
    };
  }

  async fetchCampaigns(workspaceId: string): Promise<Campaign[]> {
    return [
      {
        id: 'tt-c-1',
        workspaceId,
        platform: 'TIKTOK',
        name: 'Spark Ads // Viral Creator Hook Review #12',
        status: 'ACTIVE',
        dailyBudget: 85.0,
        customersWon: 36,
        costPerCustomer: 14.8,
        totalSpend: 532.8,
        roas: 5.1,
        cpm: 8.9,
        ctr: 3.4,
        frequency: 1.4,
        aiOptimizing: true,
        createdAt: '2026-11-03T10:00:00Z',
        updatedAt: '2026-11-13T11:00:00Z',
      },
    ];
  }

  async fetchMetrics(campaignId: string) {
    return {
      spend: 532.8,
      impressions: 59865,
      clicks: 2035,
      conversions: 36,
      cpa: 14.8,
      roas: 5.1,
    };
  }

  async createCampaign(payload: {
    workspaceId: string;
    name: string;
    dailyBudget: number;
    objective: string;
    targeting: Record<string, any>;
  }): Promise<Campaign> {
    return {
      id: `tt-c-${Date.now()}`,
      workspaceId: payload.workspaceId,
      platform: 'TIKTOK',
      name: payload.name,
      status: 'LEARNING',
      dailyBudget: payload.dailyBudget,
      customersWon: 0,
      costPerCustomer: 0,
      totalSpend: 0,
      roas: 0,
      cpm: 0,
      ctr: 0,
      frequency: 1.0,
      aiOptimizing: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async authorizeSparkAdPost(tiktokPostCode: string) {
    return {
      authorized: true,
      spark_id: `spk_${Date.now()}`,
      creator_handle: '@viral_reviewer',
      video_duration: 34,
    };
  }
}

export const tiktokConnector = new TikTokConnector();

