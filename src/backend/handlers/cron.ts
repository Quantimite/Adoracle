import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/backend/db/client';
import { runRules } from '@/backend/services/intelligenceService';
import { publishDuePosts } from '@/backend/services/publisher';
import { syncWorkspace } from '@/backend/services/syncService';

// Vercel Cron sends:  Authorization: Bearer <CRON_SECRET>
function allowed(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  return !!secret && req.headers.get('authorization') === `Bearer ${secret}`;
}

export async function rulesCron(req: NextRequest) {
  if (!allowed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const ws = await db.automationRule.findMany({ where: { enabled: true }, distinct: ['workspaceId'], select: { workspaceId: true } });
  let changed = 0;
  for (const w of ws) changed += (await runRules(w.workspaceId)).length;
  return NextResponse.json({ workspaces: ws.length, changed });
}

export async function publishCron(req: NextRequest) {
  if (!allowed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ published: await publishDuePosts() });
}

/** Daily: refresh real analytics for every workspace with a connected account. */
export async function syncCron(req: NextRequest) {
  if (!allowed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const ws = await db.integrationToken.findMany({ where: { status: 'CONNECTED' }, distinct: ['workspaceId'], select: { workspaceId: true } });
  let ok = 0;
  for (const w of ws) {
    const r = await syncWorkspace(w.workspaceId, { force: true });
    ok += r.filter((x) => x.ok && !x.skipped).length;
  }
  return NextResponse.json({ workspaces: ws.length, synced: ok });
}
