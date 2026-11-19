// src/backend/auth/session.ts
import { NextResponse } from 'next/server';
import { auth } from '@/backend/auth';
import { db } from '@/backend/db/client';
import { getOrCreateUserWorkspace } from '@/backend/db/workspace';

export interface Ctx {
  userId: string;
  name: string | null;
  email: string;
  workspaceId: string;
  workspaceName: string;
  role: 'OWNER' | 'ADMIN' | 'VIEWER';
}

/** Returns the signed-in user + their workspace + role, or null if signed out. */
export async function getCtx(): Promise<Ctx | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const ws = await getOrCreateUserWorkspace(session.user.id, session.user.name);
  const member = await db.workspaceMember.findFirst({ where: { userId: session.user.id, workspaceId: ws.id } });
  return {
    userId: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email || '',
    workspaceId: ws.id,
    workspaceName: ws.name,
    role: ((member?.role as Ctx['role']) || 'OWNER'),
  };
}

export const unauthorized = () => NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });
export const forbidden = () => NextResponse.json({ error: 'Your role in this workspace does not allow that.' }, { status: 403 });
export const canEdit = (c: Ctx) => c.role === 'OWNER' || c.role === 'ADMIN';
