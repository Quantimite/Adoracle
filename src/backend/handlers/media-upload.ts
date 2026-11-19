import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { getCtx, unauthorized, canEdit, forbidden } from '@/backend/auth/session';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm'];

/**
 * Hands the browser a short-lived upload token so large videos go straight to storage
 * (they never pass through our server, which has a small request size limit).
 */
export async function POST(req: NextRequest) {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  if (!canEdit(ctx)) return forbidden();
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'storage_not_configured', message: 'File storage is not switched on yet.' }, { status: 501 });
  }

  const body = (await req.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED,
        maximumSizeInBytes: 512 * 1024 * 1024,
        addRandomSuffix: true,
        tokenPayload: JSON.stringify({ workspaceId: ctx.workspaceId }),
      }),
      onUploadCompleted: async () => {
        /* the browser registers the file via POST /api/media */
      },
    });
    return NextResponse.json(json);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 400 });
  }
}
