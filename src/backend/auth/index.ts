// src/auth.ts
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { db } from '@/backend/db/client';
import { getOrCreateUserWorkspace } from '@/backend/db/workspace';

const googleClientId =
    process.env.AUTH_GOOGLE_ID ||
    process.env.GOOGLE_CLIENT_ID ||
    '';

const googleClientSecret =
    process.env.AUTH_GOOGLE_SECRET ||
    process.env.GOOGLE_CLIENT_SECRET ||
    '';

const authSecret =
    process.env.AUTH_SECRET ||
    process.env.BETTER_AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET;

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(db),
    session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 30 },
    secret: authSecret,
    // Required on Vercel so Auth.js trusts the deployment host (fixes callback URL problems)
    trustHost: true,
    debug: process.env.NODE_ENV === 'development',
    pages: {
        signIn: '/login',
        error: '/login',
    },
    providers: [
        Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            allowDangerousEmailAccountLinking: true,
        }),
        Credentials({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const email = String(credentials.email).toLowerCase().trim();
                const password = String(credentials.password);

                const user = await db.user.findUnique({ where: { email } });
                // Accounts created with Google have no password hash
                if (!user || !user.passwordHash) return null;

                const isValid = await bcrypt.compare(password, user.passwordHash);
                if (!isValid) return null;

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                };
            },
        }),
    ],
    events: {
        async createUser({ user }) {
            if (user.id) await getOrCreateUserWorkspace(user.id, user.name);
        },
        // Guarantees every signed-in user (Google or email) has a workspace
        async signIn({ user }) {
            if (user?.id) await getOrCreateUserWorkspace(user.id, user.name);
        },
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) token.id = user.id;
            // Lets the profile page update the header name/photo without re-login
            if (trigger === 'update' && session?.user) {
                if (session.user.name !== undefined) token.name = session.user.name;
                if (session.user.image !== undefined) token.picture = session.user.image;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = String(token.id);
            }
            return session;
        },
    },
});