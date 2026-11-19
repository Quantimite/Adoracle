import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/backend/auth';
import { db } from '@/backend/db/client';
import { getOrCreateUserWorkspace } from '@/backend/db/workspace';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { accounts: { select: { provider: true } } },
  });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const ws = await getOrCreateUserWorkspace(user.id, user.name);

  return NextResponse.json({
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      jobTitle: user.jobTitle,
      company: user.company,
      timezone: user.timezone,
      phone: user.phone,
      createdAt: user.createdAt,
      hasPassword: !!user.passwordHash,
      providers: user.accounts.map((a: any) => a.provider),
      workspaceName: ws.name,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const b = await req.json();
  const clean = (v: unknown, max = 120) => (typeof v === 'string' ? v.trim().slice(0, max) : undefined);

  const name = clean(b.name);
  if (name !== undefined && name.length < 1) return NextResponse.json({ error: 'Name cannot be empty.' }, { status: 400 });

  let image = clean(b.image, 2000);
  if (image && !/^https?:\/\//i.test(image)) return NextResponse.json({ error: 'Photo must be an https:// link.' }, { status: 400 });

  const user = await db.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined && { name }),
      ...(image !== undefined && { image: image || null }),
      ...(clean(b.jobTitle) !== undefined && { jobTitle: clean(b.jobTitle) }),
      ...(clean(b.company) !== undefined && { company: clean(b.company) }),
      ...(clean(b.timezone) !== undefined && { timezone: clean(b.timezone) }),
      ...(clean(b.phone, 40) !== undefined && { phone: clean(b.phone, 40) }),
    },
  });

  const workspaceName = clean(b.workspaceName);
  if (workspaceName) {
    const ws = await getOrCreateUserWorkspace(user.id, user.name);
    await db.workspace.update({ where: { id: ws.id }, data: { name: workspaceName } });
  }

  return NextResponse.json({ success: true, name: user.name, image: user.image });
}
