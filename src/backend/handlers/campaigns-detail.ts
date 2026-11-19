import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/backend/db/client';
import { getCtx, unauthorized, forbidden, canEdit } from '@/backend/auth/session';
import { Level, cleanChanges, duplicate, loadCampaign, syncCampaignStatus } from '@/backend/services/adManagement';

type P = { params: { id: string } };
const isLevel = (v: any): v is Level => ['campaign', 'adset', 'ad'].includes(v);

/** GET → one campaign with all its ad sets and ads. */
export async function GET(_req: NextRequest, { params }: P) {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  const c = await loadCampaign(ctx.workspaceId, params.id);
  if (!c) return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 });
  return NextResponse.json({ campaign: c, canEdit: canEdit(ctx) });
}

/**
 * PATCH { level, ids?: string[], id?: string, changes }
 * Edit one item, or several items of the SAME level at once (bulk edit).
 */
export async function PATCH(req: NextRequest, { params }: P) {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  if (!canEdit(ctx)) return forbidden();

  const b = await req.json();
  if (!isLevel(b.level)) return NextResponse.json({ error: 'Unknown level.' }, { status: 400 });
  const ids: string[] = b.ids || (b.id ? [b.id] : []);
  if (!ids.length) return NextResponse.json({ error: 'Nothing selected.' }, { status: 400 });

  const { data, error } = cleanChanges(b.level, b.changes);
  if (error || !data) return NextResponse.json({ error }, { status: 400 });

  const campaign = await loadCampaign(ctx.workspaceId, params.id);
  if (!campaign) return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 });

  let note = 'Saved.';
  if (b.level === 'campaign') {
    await db.campaign.update({ where: { id: campaign.id }, data });
    if (data.status) note = await syncCampaignStatus(ctx.workspaceId, campaign, data.status);
    // Pausing a campaign pauses everything inside it so the picture stays consistent
    if (data.status === 'PAUSED') {
      await db.adSet.updateMany({ where: { campaignId: campaign.id }, data: { status: 'PAUSED' } });
      await db.ad.updateMany({ where: { campaignId: campaign.id }, data: { status: 'PAUSED' } });
    }
  } else if (b.level === 'adset') {
    await db.adSet.updateMany({ where: { id: { in: ids }, campaignId: campaign.id }, data });
    if (data.status === 'PAUSED') await db.ad.updateMany({ where: { adSetId: { in: ids } }, data: { status: 'PAUSED' } });
  } else {
    await db.ad.updateMany({ where: { id: { in: ids }, campaignId: campaign.id }, data });
  }
  return NextResponse.json({ success: true, note, campaign: await loadCampaign(ctx.workspaceId, params.id) });
}

/** POST { action: 'duplicate', level, id } */
export async function POST(req: NextRequest, { params }: P) {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  if (!canEdit(ctx)) return forbidden();
  const b = await req.json();
  if (b.action !== 'duplicate' || !isLevel(b.level)) return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  const copy = await duplicate(ctx.workspaceId, b.level, b.id || params.id);
  if (!copy) return NextResponse.json({ error: 'Item not found.' }, { status: 404 });
  return NextResponse.json({ success: true, copy, campaign: b.level === 'campaign' ? undefined : await loadCampaign(ctx.workspaceId, params.id) });
}

/** DELETE ?level=ad|adset|campaign&id=... */
export async function DELETE(req: NextRequest, { params }: P) {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  if (!canEdit(ctx)) return forbidden();
  const level = req.nextUrl.searchParams.get('level');
  const id = req.nextUrl.searchParams.get('id') || params.id;
  if (!isLevel(level)) return NextResponse.json({ error: 'Unknown level.' }, { status: 400 });

  if (level === 'campaign') await db.campaign.deleteMany({ where: { id: params.id, workspaceId: ctx.workspaceId } });
  else if (level === 'adset') await db.adSet.deleteMany({ where: { id, campaign: { workspaceId: ctx.workspaceId } } });
  else await db.ad.deleteMany({ where: { id, adSet: { campaign: { workspaceId: ctx.workspaceId } } } });
  return NextResponse.json({ success: true });
}
