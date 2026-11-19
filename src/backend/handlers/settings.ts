import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/backend/db/client';
import { getCtx, unauthorized, forbidden, canEdit } from '@/backend/auth/session';

const DEFAULT_NOTIFS = { brokenLinks: true, overspend: true, campaignErrors: true, weeklyReport: true, ruleActions: true, productNews: false };

export async function getSettings() {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  const [user, ws, members, invites, consents] = await Promise.all([
    db.user.findUnique({ where: { id: ctx.userId }, select: { currency: true, plainLanguage: true, linkGuard: true, notificationPrefs: true, email: true } }),
    db.workspace.findUnique({ where: { id: ctx.workspaceId }, select: { name: true, billingEmail: true, taxId: true } }),
    db.workspaceMember.findMany({ where: { workspaceId: ctx.workspaceId }, include: { user: { select: { name: true, email: true, image: true } } } }),
    db.workspaceInvite.findMany({ where: { workspaceId: ctx.workspaceId, status: 'PENDING' } }),
    db.consentRecord.findMany({ where: { workspaceId: ctx.workspaceId }, orderBy: { grantedAt: 'desc' }, take: 20 }),
  ]);
  return NextResponse.json({
    role: ctx.role,
    email: user?.email,
    preferences: { currency: user?.currency, plainLanguage: user?.plainLanguage, linkGuard: user?.linkGuard },
    notifications: { ...DEFAULT_NOTIFS, ...((user?.notificationPrefs as object) || {}) },
    workspace: { name: ws?.name, billingEmail: ws?.billingEmail || '', taxId: ws?.taxId || '' },
    members: members.map((m: any) => ({ id: m.id, userId: m.userId, role: m.role, name: m.user?.name, email: m.user?.email, image: m.user?.image, isYou: m.userId === ctx.userId })),
    invites: invites.map((i: any) => ({ id: i.id, email: i.email, role: i.role })),
    consents: consents.map((c: any) => ({ id: c.id, provider: c.provider, features: c.features, version: c.agreementVersion, grantedAt: c.grantedAt, revokedAt: c.revokedAt })),
  });
}

export async function patchSettings(req: NextRequest) {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  const b = await req.json();

  if (b.section === 'preferences') {
    await db.user.update({
      where: { id: ctx.userId },
      data: {
        ...(typeof b.currency === 'string' && { currency: b.currency.slice(0, 20) }),
        ...(typeof b.plainLanguage === 'boolean' && { plainLanguage: b.plainLanguage }),
        ...(typeof b.linkGuard === 'boolean' && { linkGuard: b.linkGuard }),
      },
    });
    return NextResponse.json({ success: true });
  }
  if (b.section === 'notifications') {
    const prefs: Record<string, boolean> = {};
    for (const k of Object.keys(DEFAULT_NOTIFS)) if (typeof b.prefs?.[k] === 'boolean') prefs[k] = b.prefs[k];
    await db.user.update({ where: { id: ctx.userId }, data: { notificationPrefs: prefs } });
    return NextResponse.json({ success: true });
  }
  if (!canEdit(ctx)) return forbidden();
  if (b.section === 'workspace') {
    const name = String(b.name || '').trim().slice(0, 80);
    if (!name) return NextResponse.json({ error: 'Workspace name cannot be empty.' }, { status: 400 });
    await db.workspace.update({ where: { id: ctx.workspaceId }, data: { name } });
    return NextResponse.json({ success: true });
  }
  if (b.section === 'billing') {
    if (ctx.role !== 'OWNER') return forbidden();
    const email = String(b.billingEmail || '').trim();
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'Enter a valid billing email.' }, { status: 400 });
    await db.workspace.update({ where: { id: ctx.workspaceId }, data: { billingEmail: email || null, taxId: String(b.taxId || '').trim().slice(0, 40) || null } });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: 'Unknown section.' }, { status: 400 });
}

/** POST { email, role } → invite a teammate. They join automatically when they create their account with that email. */
export async function team(req: NextRequest) {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  if (!canEdit(ctx)) return forbidden();
  const { email, role } = await req.json();
  const e = String(email || '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(e)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  const r = role === 'ADMIN' ? 'ADMIN' : 'VIEWER';

  const existing = await db.user.findUnique({ where: { email: e } });
  if (existing) {
    const already = await db.workspaceMember.findFirst({ where: { userId: existing.id, workspaceId: ctx.workspaceId } });
    if (already) return NextResponse.json({ error: 'This person is already on your team.' }, { status: 400 });
    return NextResponse.json({ error: 'That person already has their own Adoracle workspace. Switching between workspaces is not available yet, so invite a different email.' }, { status: 400 });
  }
  const invite = await db.workspaceInvite.upsert({
    where: { workspaceId_email: { workspaceId: ctx.workspaceId, email: e } },
    create: { workspaceId: ctx.workspaceId, email: e, role: r, invitedBy: ctx.userId },
    update: { role: r, status: 'PENDING' },
  });
  return NextResponse.json({ success: true, invite, note: 'Invitation saved. Ask them to sign up with this exact email. Email sending is not set up, so share the sign-up link yourself.' });
}

export async function removeTeam(req: NextRequest) {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  if (ctx.role !== 'OWNER') return forbidden();
  const memberId = req.nextUrl.searchParams.get('memberId');
  const inviteId = req.nextUrl.searchParams.get('inviteId');
  if (inviteId) await db.workspaceInvite.deleteMany({ where: { id: inviteId, workspaceId: ctx.workspaceId } });
  if (memberId) {
    const m = await db.workspaceMember.findFirst({ where: { id: memberId, workspaceId: ctx.workspaceId } });
    if (m && m.userId === ctx.userId) return NextResponse.json({ error: 'You cannot remove yourself.' }, { status: 400 });
    if (m) await db.workspaceMember.delete({ where: { id: m.id } });
  }
  return NextResponse.json({ success: true });
}

/** GET → everything we store about you, as a JSON file (tokens are never included). */
export async function exportData() {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  const [user, ws, campaigns, posts, consents, rules, profile] = await Promise.all([
    db.user.findUnique({ where: { id: ctx.userId }, select: { name: true, email: true, image: true, jobTitle: true, company: true, timezone: true, phone: true, createdAt: true } }),
    db.workspace.findUnique({ where: { id: ctx.workspaceId }, select: { name: true, billingEmail: true } }),
    db.campaign.findMany({ where: { workspaceId: ctx.workspaceId }, include: { adSets: { include: { ads: true } } } }),
    db.socialPost.findMany({ where: { workspaceId: ctx.workspaceId } }),
    db.consentRecord.findMany({ where: { workspaceId: ctx.workspaceId } }),
    db.automationRule.findMany({ where: { workspaceId: ctx.workspaceId } }),
    db.businessProfile.findUnique({ where: { workspaceId: ctx.workspaceId } }),
  ]);
  return new NextResponse(JSON.stringify({ exportedAt: new Date().toISOString(), user, workspace: ws, businessProfile: profile, campaigns, posts, consents, rules }, null, 2), {
    headers: { 'Content-Type': 'application/json', 'Content-Disposition': 'attachment; filename="adoracle-my-data.json"' },
  });
}

/** DELETE { confirmEmail } → permanently deletes the account and any workspace where you are the only member. */
export async function deleteAccount(req: NextRequest) {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  const { confirmEmail } = await req.json();
  if (String(confirmEmail || '').trim().toLowerCase() !== ctx.email.toLowerCase()) return NextResponse.json({ error: 'Type your email address exactly to confirm.' }, { status: 400 });

  const memberships = await db.workspaceMember.findMany({ where: { userId: ctx.userId } });
  for (const m of memberships) {
    const count = await db.workspaceMember.count({ where: { workspaceId: m.workspaceId } });
    if (count <= 1) await db.workspace.delete({ where: { id: m.workspaceId } });
  }
  await db.user.delete({ where: { id: ctx.userId } });
  return NextResponse.json({ success: true });
}
