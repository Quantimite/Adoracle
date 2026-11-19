// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/backend/db/client';
import { getOrCreateUserWorkspace } from '@/backend/db/workspace';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const name = String(body.name || '').trim();
        const email = String(body.email || '').toLowerCase().trim();
        const password = String(body.password || '');

        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { error: 'Please enter a valid email address.' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters long.' },
                { status: 400 }
            );
        }

        const existingUser = await db.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json(
                { error: 'An account with this email already exists. Please sign in.' },
                { status: 409 }
            );
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await db.user.create({
            data: {
                name: name || email.split('@')[0],
                email,
                passwordHash,
            },
        });

        // Automatically create their default Workspace in PostgreSQL
        await getOrCreateUserWorkspace(user.id, user.name);

        return NextResponse.json(
            { id: user.id, name: user.name, email: user.email },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Failed to create account. Check database connection.' },
            { status: 500 }
        );
    }
}