import { NextRequest, NextResponse } from 'next/server';
import { initialCampaigns } from '@/lib/store';
import { Campaign } from '@/types';

let currentCampaigns = [...initialCampaigns];

export async function GET() {
  return NextResponse.json({ success: true, campaigns: currentCampaigns });
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, dailyBudget, status, aiOptimizing } = await req.json();
    currentCampaigns = currentCampaigns.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          dailyBudget: dailyBudget !== undefined ? dailyBudget : c.dailyBudget,
          status: status !== undefined ? status : c.status,
          aiOptimizing: aiOptimizing !== undefined ? aiOptimizing : c.aiOptimizing,
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });

    const updated = currentCampaigns.find((c) => c.id === id);
    return NextResponse.json({ success: true, campaign: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

