// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'dinuja@adoracle.dev';
    const plainPassword = 'Password@123';
    const passwordHash = await bcrypt.hash(plainPassword, 12);

    // 1. Upsert User
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            name: 'Dinuja Abeywickrama',
            passwordHash,
            jobTitle: 'Founder & Lead Architect',
        },
        create: {
            name: 'Dinuja Abeywickrama',
            email,
            passwordHash,
            jobTitle: 'Founder & Lead Architect',
        },
    });

    // 2. Ensure Workspace & Membership exist
    const existingMembership = await prisma.workspaceMember.findFirst({
        where: { userId: user.id },
        include: { workspace: true },
    });

    if (!existingMembership) {
        const workspace = await prisma.workspace.create({
            data: {
                name: 'Adoracle HQ',
                members: {
                    create: {
                        userId: user.id,
                        role: 'OWNER',
                    },
                },
            },
        });
        console.log(`Created workspace: ${workspace.name}`);
    }

    console.log('Sample user ready in PostgreSQL:');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${plainPassword}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });