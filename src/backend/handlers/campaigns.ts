import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/backend/db/client';
import { getCtx, unauthorized, forbidden, canEdit } from '@/backend/auth/session';

/** GET → every campaign in this workspace (created in Adoracle or imported from the platforms). */
export async function GET() {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  const rows = await db.campaign.findMany({ where: { workspaceId: ctx.workspaceId }, orderBy: [{ totalSpend: 'desc' }, { createdAt: 'desc' }] });
  const campaigns = rows.map((c: any) => ({
    id: c.id, workspaceId: c.workspaceId, platform: c.platform, name: c.name, status: c.status, dailyBudget: c.dailyBudget,
    customersWon: c.customersWon, costPerCustomer: c.costPerCustomer, totalSpend: c.totalSpend, roas: c.roas, aiOptimizing: c.aiOptimizing,
    createdAt: c.createdAt.toISOString(), updatedAt: c.updatedAt.toISOString(),
    launchStatus: c.launchStatus, launchMessage: c.launchMessage, isDraft: String(c.externalCampaignId).startsWith('draft_'),
  }));
  return NextResponse.json({ success: true, campaigns });
}

export async function PATCH(req: NextRequest) {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  if (!canEdit(ctx)) return forbidden();
  const { id, dailyBudget, status, aiOptimizing } = await req.json();
  const mine = await db.campaign.findFirst({ where: { id: String(id), workspaceId: ctx.workspaceId } });
  if (!mine) return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 });
  const updated = await db.campaign.update({
    where: { id: mine.id },
    data: { ...(dailyBudget !== undefined && { dailyBudget }), ...(status !== undefined && { status }), ...(aiOptimizing !== undefined && { aiOptimizing }) },
  });
  return NextResponse.json({ success: true, campaign: updated });
}

export async function DELETE(req: NextRequest) {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  if (!canEdit(ctx)) return forbidden();
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await db.campaign.deleteMany({ where: { id, workspaceId: ctx.workspaceId } });
  return NextResponse.json({ success: true });
}
