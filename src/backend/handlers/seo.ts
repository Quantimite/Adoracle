import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/backend/db/client';
import { getCtx, unauthorized, forbidden, canEdit } from '@/backend/auth/session';
import { auditPage, checkUrl } from '@/backend/services/seoService';

/** POST { url } → full on-page audit (content, technical, ad tracking, speed). */
export async function audit(req: NextRequest) {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: 'Enter a website address.' }, { status: 400 });
  try {
    const result = await auditPage(String(url));
    await db.seoAudit.create({
      data: {
        workspaceId: ctx.workspaceId,
        healthScore: result.score,
        organicClicks: 0,
        searchImpressions: 0,
        coreWebVitals: (result.speed?.performance ?? 0) >= 90,
        brokenLinksCount: result.brokenLinks.length,
        url: result.finalUrl,
        details: result as any,
      },
    });
    return NextResponse.json({ success: true, audit: result });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Could not check that website.' }, { status: 400 });
  }
}

/** POST { url } → quick link check (status, redirects, speed). */
export async function check(req: NextRequest) {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  const { url } = await req.json();
  try {
    const r = await checkUrl(String(url || ''));
    await db.urlAudit.create({ data: { workspaceId: ctx.workspaceId, url: r.url, statusCode: r.statusCode, isHealthy: r.ok, redirectUrl: r.finalUrl !== r.url ? r.finalUrl : null, responseMs: r.responseMs, source: 'MANUAL', chain: r.chain as any } });
    return NextResponse.json({ success: true, result: r });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Could not check that link.' }, { status: 400 });
  }
}

/** GET → recent audits (for the history list). */
export async function history() {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  const [audits, links] = await Promise.all([
    db.seoAudit.findMany({ where: { workspaceId: ctx.workspaceId }, orderBy: { auditedAt: 'desc' }, take: 8, select: { id: true, url: true, healthScore: true, brokenLinksCount: true, auditedAt: true } }),
    db.urlAudit.findMany({ where: { workspaceId: ctx.workspaceId, source: { startsWith: 'AD' } }, orderBy: { checkedAt: 'desc' }, take: 60 }),
  ]);
  // only the latest result per URL
  const seen = new Set<string>();
  const latest = links.filter((l: any) => (seen.has(l.url) ? false : (seen.add(l.url), true)));
  const user = await db.user.findUnique({ where: { id: ctx.userId }, select: { linkGuard: true } });
  return NextResponse.json({ audits, links: latest, linkGuard: user?.linkGuard ?? true });
}

/**
 * POST → Link Guard. Checks the destination link of every campaign and ad you created here.
 * If “auto-pause” is on, anything pointing to a broken page is paused so no money is wasted.
 */
export async function linkGuard() {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();

  const user = await db.user.findUnique({ where: { id: ctx.userId }, select: { linkGuard: true } });
  const campaigns = await db.campaign.findMany({ where: { workspaceId: ctx.workspaceId }, include: { adSets: { include: { ads: true } } } });

  const targets = new Map<string, { campaignIds: Set<string>; adIds: Set<string> }>();
  const add = (url: string | null | undefined, c: string, ad?: string) => {
    if (!url || !/^https?:\/\//i.test(url)) return;
    const t = targets.get(url) || { campaignIds: new Set<string>(), adIds: new Set<string>() };
    t.campaignIds.add(c);
    if (ad) t.adIds.add(ad);
    targets.set(url, t);
  };
  for (const c of campaigns) {
    add(c.destinationUrl, c.id);
    for (const as of c.adSets) for (const ad of as.ads) add(ad.destinationUrl, c.id, ad.id);
  }

  const urls = Array.from(targets.keys()).slice(0, 25);
  const out: any[] = [];
  let paused = 0;
  for (const url of urls) {
    const r = await checkUrl(url).catch((e) => ({ url, finalUrl: url, statusCode: 0, ok: false, redirects: 0, responseMs: 0, https: false, problem: e?.message, chain: [] as any[] }));
    await db.urlAudit.create({ data: { workspaceId: ctx.workspaceId, url, statusCode: r.statusCode, isHealthy: r.ok, redirectUrl: r.finalUrl !== url ? r.finalUrl : null, responseMs: r.responseMs, source: 'AD', chain: r.chain as any } });
    const t = targets.get(url)!;
    let didPause = false;
    if (!r.ok && user?.linkGuard && canEdit(ctx)) {
      await db.ad.updateMany({ where: { id: { in: Array.from(t.adIds) }, status: 'ACTIVE' }, data: { status: 'PAUSED' } });
      const res = await db.campaign.updateMany({ where: { id: { in: Array.from(t.campaignIds) }, status: 'ACTIVE', destinationUrl: url }, data: { status: 'PAUSED', launchMessage: `Auto-paused by Link Guard: ${r.problem || 'destination link is broken'}` } });
      didPause = res.count > 0 || t.adIds.size > 0;
      if (didPause) paused++;
    }
    out.push({ url, statusCode: r.statusCode, ok: r.ok, problem: r.problem, responseMs: r.responseMs, used: t.campaignIds.size, autoPaused: didPause });
  }
  return NextResponse.json({ success: true, checked: out.length, broken: out.filter((o) => !o.ok).length, paused, results: out, linkGuard: user?.linkGuard ?? true });
}

/** POST { oldUrl, newUrl } → swap a broken destination in every ad and campaign that uses it. */
export async function replaceUrl(req: NextRequest) {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();
  if (!canEdit(ctx)) return forbidden();
  const { oldUrl, newUrl } = await req.json();
  if (!/^https?:\/\//i.test(String(newUrl || ''))) return NextResponse.json({ error: 'The new link must start with https://' }, { status: 400 });
  const check = await checkUrl(String(newUrl)).catch(() => null);
  if (!check?.ok) return NextResponse.json({ error: 'The new link does not open correctly yet. Check it and try again.' }, { status: 400 });

  const a = await db.ad.updateMany({ where: { destinationUrl: oldUrl, adSet: { campaign: { workspaceId: ctx.workspaceId } } }, data: { destinationUrl: newUrl } });
  const c = await db.campaign.updateMany({ where: { workspaceId: ctx.workspaceId, destinationUrl: oldUrl }, data: { destinationUrl: newUrl } });
  return NextResponse.json({ success: true, adsUpdated: a.count, campaignsUpdated: c.count });
}
