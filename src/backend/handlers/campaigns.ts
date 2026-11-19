import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/backend/auth';
import { db } from '@/backend/db/client';
import { getOrCreateUserWorkspace } from '@/backend/db/workspace';
import { initialCampaigns } from '@/shared/demoData';
import { Campaign } from '@/shared/types';

// Demo campaigns shown until the workspace has its own
let currentCampaigns = [...initialCampaigns];

function fromDb(c: any): Campaign & { launchStatus?: string; launchMessage?: string | null; isDraft?: boolean; structure?: unknown } {
  return {
    id: c.id,
    workspaceId: c.workspaceId,
    platform: c.platform,
    name: c.name,
    status: c.status,
    dailyBudget: c.dailyBudget,
    customersWon: c.customersWon,
    costPerCustomer: c.costPerCustomer,
    totalSpend: c.totalSpend,
    roas: c.roas,
    aiOptimizing: c.aiOptimizing,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    launchStatus: c.launchStatus,
    launchMessage: c.launchMessage,
    isDraft: String(c.externalCampaignId).startsWith('draft_'),
    structure: c.structure ?? null,
  };
}

export async function GET() {
  let own: Campaign[] = [];
  try {
    const session = await auth();
    if (session?.user?.id) {
      const ws = await getOrCreateUserWorkspace(session.user.id, session.user.name);
      const rows = await db.campaign.findMany({ where: { workspaceId: ws.id }, orderBy: { createdAt: 'desc' } });
      own = rows.map(fromDb);
    }
  } catch (e) {
    console.error('campaign read failed', e);
  }
  return NextResponse.json({ success: true, campaigns: [...own, ...currentCampaigns] });
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, dailyBudget, status, aiOptimizing } = await req.json();

    // Real (database) campaign?
    const session = await auth();
    if (session?.user?.id) {
      const ws = await getOrCreateUserWorkspace(session.user.id, session.user.name);
      const mine = await db.campaign.findFirst({ where: { id: String(id), workspaceId: ws.id } });
      if (mine) {
        const updated = await db.campaign.update({
          where: { id: mine.id },
          data: {
            ...(dailyBudget !== undefined && { dailyBudget }),
            ...(status !== undefined && { status }),
            ...(aiOptimizing !== undefined && { aiOptimizing }),
          },
        });
        return NextResponse.json({ success: true, campaign: fromDb(updated) });
      }
    }

    currentCampaigns = currentCampaigns.map((c) =>
      c.id === id
        ? {
            ...c,
            dailyBudget: dailyBudget !== undefined ? dailyBudget : c.dailyBudget,
            status: status !== undefined ? status : c.status,
            aiOptimizing: aiOptimizing !== undefined ? aiOptimizing : c.aiOptimizing,
            updatedAt: new Date().toISOString(),
          }
        : c
    );
    return NextResponse.json({ success: true, campaign: currentCampaigns.find((c) => c.id === id) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const ws = await getOrCreateUserWorkspace(session.user.id, session.user.name);
  await db.campaign.deleteMany({ where: { id, workspaceId: ws.id } });
  return NextResponse.json({ success: true });
}
