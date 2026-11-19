// src/backend/db/workspace.ts
import { db } from '@/backend/db/client';

export async function getOrCreateUserWorkspace(userId: string, userName?: string | null) {
  const membership = await db.workspaceMember.findFirst({
    where: { userId },
    include: { workspace: true },
    orderBy: { id: 'asc' },
  });
  if (membership?.workspace) return membership.workspace;

  // Was this person invited to someone's workspace? Join it instead of creating a new one.
  const user = await db.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (user?.email) {
    const invite = await db.workspaceInvite.findFirst({ where: { email: user.email.toLowerCase(), status: 'PENDING' }, include: { workspace: true } });
    if (invite) {
      await db.workspaceMember.create({ data: { userId, workspaceId: invite.workspaceId, role: invite.role } });
      await db.workspaceInvite.update({ where: { id: invite.id }, data: { status: 'ACCEPTED' } });
      return invite.workspace;
    }
  }

  return db.workspace.create({
    data: {
      name: userName ? `${userName}'s Workspace` : 'Adoracle Workspace',
      members: { create: { userId, role: 'OWNER' } },
    },
  });
}
