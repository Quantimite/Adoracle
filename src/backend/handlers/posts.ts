import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/backend/db/client';
import { getCtx, unauthorized, forbidden, canEdit } from '@/backend/auth/session';
import { publishToPlatforms } from '@/backend/services/publisher';

export async function GET() {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  const posts = await db.socialPost.findMany({ where: { workspaceId: ctx.workspaceId }, orderBy: { createdAt: 'desc' }, take: 50 });
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  if (!canEdit(ctx)) return forbidden();

  const b = await req.json();
  const caption = String(b.caption || '').trim();
  const platforms: string[] = Array.isArray(b.platforms) ? b.platforms : [];
  if (!caption && !b.mediaUrl) return NextResponse.json({ error: 'Write a caption or add a photo/video first.' }, { status: 400 });
  if (!platforms.length) return NextResponse.json({ error: 'Pick at least one platform.' }, { status: 400 });
  if (b.postType === 'REEL' && b.mediaType !== 'VIDEO') return NextResponse.json({ error: 'A Reel needs a video.' }, { status: 400 });

  const input = {
    caption,
    link: b.link || null,
    mediaUrl: b.mediaUrl || null,
    mediaType: b.mediaType || null,
    postType: b.postType === 'REEL' ? 'REEL' : 'POST',
    alsoInstagram: !!b.alsoInstagram,
    platforms,
  };

  let status = b.scheduledAt ? 'SCHEDULED' : 'DRAFT';
  let results: Record<string, string> = {};
  if (b.publishNow) {
    const r = await publishToPlatforms(ctx.workspaceId, input);
    status = r.status;
    results = r.results;
  }

  const post = await db.socialPost.create({
    data: {
      workspaceId: ctx.workspaceId,
      caption,
      mediaUrl: input.mediaUrl,
      mediaType: input.mediaType,
      postType: input.postType,
      alsoInstagram: input.alsoInstagram,
      link: input.link,
      platforms,
      status,
      scheduledAt: b.scheduledAt ? new Date(b.scheduledAt) : null,
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
      results: results as any,
    },
  });
  return NextResponse.json({ success: true, post });
}

export async function DELETE(req: NextRequest) {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  if (!canEdit(ctx)) return forbidden();
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await db.socialPost.deleteMany({ where: { id, workspaceId: ctx.workspaceId } });
  return NextResponse.json({ success: true });
}
