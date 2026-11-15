// src/lib/workspace.ts
import { db } from '@/lib/db';

export async function getOrCreateUserWorkspace(userId: string, userName?: string | null) {
    const membership = await db.workspaceMember.findFirst({
        where: { userId },
        include: { workspace: true },
    });

    if (membership?.workspace) {
        return membership.workspace;
    }

    const workspace = await db.workspace.create({
        data: {
            name: userName ? `${userName}'s Workspace` : 'Adoracle Workspace',
            members: {
                create: {
                    userId,
                    role: 'OWNER',
                },
            },
        },
    });

    return workspace;
}