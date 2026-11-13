import { PlatformConnector } from './types';
import { Campaign } from '@/types';

export class GoogleConnector implements PlatformConnector {
  platform = 'GOOGLE' as const;

  async connect(credentials: { accessToken: string; accountId?: string }) {
    return {
      success: true,
      accountName: 'Google Ads Manager (932-104-8841)',
    };
  }

  async fetchCampaigns(workspaceId: string): Promise<Campaign[]> {
    return [
      {
        id: 'goog-c-1',
        workspaceId,
        platform: 'GOOGLE',
        name: 'Search // High-Intent Category Buyer Terms [Exact+Phrase]',
        status: 'ACTIVE',
        dailyBudget: 110.0,
        customersWon: 42,
        costPerCustomer: 21.4,
        totalSpend: 898.8,
        roas: 4.4,
        cpm: 28.5,
        ctr: 5.6,
        frequency: 1.1,
        aiOptimizing: true,
        createdAt: '2026-11-02T09:00:00Z',
        updatedAt: '2026-11-13T10:15:00Z',
      },
      {
        id: 'goog-c-2',
        workspaceId,
        platform: 'YOUTUBE',
        name: 'YouTube Shorts // Product Demo 30s Interactive',
        status: 'ACTIVE',
        dailyBudget: 50.0,
        customersWon: 18,
        costPerCustomer: 16.5,
        totalSpend: 297.0,
        roas: 3.9,
        cpm: 7.2,
        ctr: 2.1,
        frequency: 1.3,
        aiOptimizing: true,
        createdAt: '2026-11-05T14:00:00Z',
        updatedAt: '2026-11-13T08:00:00Z',
      },
    ];
  }

  async fetchMetrics(campaignId: string) {
    return {
      spend: 898.8,
      impressions: 16050,
      clicks: 898,
      conversions: 42,
      cpa: 21.4,
      roas: 4.4,
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
      id: `goog-c-${Date.now()}`,
      workspaceId: payload.workspaceId,
      platform: 'GOOGLE',
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
}

export const googleConnector = new GoogleConnector();

