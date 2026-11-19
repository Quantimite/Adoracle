import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/backend/auth';
import { db } from '@/backend/db/client';
import { AppShell } from '@/frontend/components/layout/AppShell';

export const dynamic = 'force-dynamic';

// Server-side gate: nobody reaches the app pages without a valid session.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  // Read the freshest name/photo from the database so profile edits show immediately
  let name = session.user.name || '';
  let email = session.user.email || '';
  let image = session.user.image || null;
  try {
    const u = await db.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, image: true },
    });
    if (u) {
      name = u.name || name;
      email = u.email || email;
      image = u.image ?? image;
    }
  } catch {
    /* fall back to the session values */
  }

  return (
    <AppShell user={{ id: session.user.id, name: name || email.split('@')[0] || 'User', email, image }}>
      {children}
    </AppShell>
  );
}
