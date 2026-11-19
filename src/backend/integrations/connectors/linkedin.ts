import { PlatformConnector } from './types';
import { Campaign } from '@/shared/types';

export class LinkedInConnector implements PlatformConnector {
  platform = 'LINKEDIN' as const;

  async connect(credentials: { accessToken: string; accountId?: string }) {
    return {
      success: true,
      accountName: 'LinkedIn Campaign Manager (urn:li:adAccount:5098231)',
    };
  }

  async fetchCampaigns(workspaceId: string): Promise<Campaign[]> {
    return [
      {
        id: 'li-c-1',
        workspaceId,
        platform: 'LINKEDIN',
        name: 'ABM // Senior VPs & Directors of Growth [US]',
        status: 'ACTIVE',
        dailyBudget: 150.0,
        customersWon: 16,
        costPerCustomer: 72.5,
        totalSpend: 1160.0,
        roas: 6.2, // High B2B contract value
        cpm: 94.0,
        ctr: 1.15,
        frequency: 2.1,
        aiOptimizing: false,
        createdAt: '2026-11-04T11:00:00Z',
        updatedAt: '2026-11-13T09:00:00Z',
      },
    ];
  }

  async fetchMetrics(campaignId: string) {
    return {
      spend: 1160.0,
      impressions: 12340,
      clicks: 142,
      conversions: 16,
      cpa: 72.5,
      roas: 6.2,
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
      id: `li-c-${Date.now()}`,
      workspaceId: payload.workspaceId,
      platform: 'LINKEDIN',
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

export const linkedinConnector = new LinkedInConnector();

