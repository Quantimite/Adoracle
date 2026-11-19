import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { db } from '@/backend/db/client';
import { getCtx, unauthorized, canEdit, forbidden } from '@/backend/auth/session';

const storageReady = () => !!process.env.BLOB_READ_WRITE_TOKEN;

/** GET → your uploaded media library (+ whether file storage is switched on). */
export async function GET() {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  const items = await db.mediaAsset.findMany({ where: { workspaceId: ctx.workspaceId }, orderBy: { createdAt: 'desc' }, take: 60 });
  return NextResponse.json({ configured: storageReady(), items });
}

/** POST → register a file that the browser just uploaded straight to storage. */
export async function POST(req: NextRequest) {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  if (!canEdit(ctx)) return forbidden();

  const { url, pathname, name, contentType, size } = await req.json();
  let host = '';
  try {
    host = new URL(String(url)).hostname;
  } catch {
    return NextResponse.json({ error: 'Invalid file link.' }, { status: 400 });
  }
  // Only accept files that really live in our blob storage
  if (!host.endsWith('.blob.vercel-storage.com')) return NextResponse.json({ error: 'File is not from Adoracle storage.' }, { status: 400 });

  const ct = String(contentType || '');
  const asset = await db.mediaAsset.create({
    data: {
      workspaceId: ctx.workspaceId,
      url: String(url),
      pathname: String(pathname || ''),
      name: String(name || 'upload').slice(0, 200),
      contentType: ct,
      size: Number(size) || 0,
      kind: ct.startsWith('video/') ? 'VIDEO' : 'IMAGE',
    },
  });
  return NextResponse.json({ success: true, asset });
}

export async function DELETE(req: NextRequest) {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  if (!canEdit(ctx)) return forbidden();
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const asset = await db.mediaAsset.findFirst({ where: { id, workspaceId: ctx.workspaceId } });
  if (!asset) return NextResponse.json({ success: true });
  try {
    if (storageReady()) await del(asset.url);
  } catch {
    /* file may already be gone */
  }
  await db.mediaAsset.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
