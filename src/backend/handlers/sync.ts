import { NextRequest, NextResponse } from 'next/server';
import { getCtx, unauthorized } from '@/backend/auth/session';
import { syncWorkspace } from '@/backend/services/syncService';

/** POST → pull the newest real numbers from every connected platform right now. */
export async function POST(req: NextRequest) {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  const body = await req.json().catch(() => ({}));
  const reports = await syncWorkspace(ctx.workspaceId, { force: !!body.force });
  return NextResponse.json({ success: true, reports });
}
