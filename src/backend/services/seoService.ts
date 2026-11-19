// src/backend/services/seoService.ts
// Real website checks: link health (404 / redirects), on-page SEO, ad-tracking readiness and page speed.
import dns from 'dns/promises';
import net from 'net';
import * as cheerio from 'cheerio';

/* ---------- Safety: never let the server be tricked into calling private/internal addresses ---------- */
function isPrivateIp(ip: string) {
  if (net.isIPv6(ip)) return ip === '::1' || ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80');
  const [a, b] = ip.split('.').map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254);
}

export async function assertPublicUrl(raw: string): Promise<URL> {
  let u: URL;
  try {
    u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    throw new Error('That does not look like a valid web address.');
  }
  if (!['http:', 'https:'].includes(u.protocol)) throw new Error('Only http and https links can be checked.');
  const host = u.hostname;
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) throw new Error('Private addresses cannot be checked.');
  const addrs = net.isIP(host) ? [{ address: host }] : await dns.lookup(host, { all: true }).catch(() => []);
  if (!addrs.length) throw new Error('This website address could not be found (DNS error).');
  if (addrs.some((a) => isPrivateIp(a.address))) throw new Error('Private addresses cannot be checked.');
  return u;
}

/* ---------- Link health ---------- */
export interface LinkCheck {
  url: string;
  finalUrl: string;
  statusCode: number;
  ok: boolean;
  redirects: number;
  responseMs: number;
  https: boolean;
  problem?: string;
  chain: { url: string; status: number }[];
}

const UA = 'Mozilla/5.0 (compatible; AdoracleBot/1.0; +https://adoracle.app)';

export async function checkUrl(raw: string): Promise<LinkCheck> {
  const start = Date.now();
  let current = (await assertPublicUrl(raw)).toString();
  const chain: LinkCheck['chain'] = [];
  let status = 0;
  let problem: string | undefined;

  for (let i = 0; i < 6; i++) {
    try {
      let res = await fetch(current, { method: 'HEAD', redirect: 'manual', headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(10000) });
      if (res.status === 405 || res.status === 403 || res.status === 501) {
        res = await fetch(current, { method: 'GET', redirect: 'manual', headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(10000) });
      }
      status = res.status;
      chain.push({ url: current, status });
      const loc = res.headers.get('location');
      if (status >= 300 && status < 400 && loc) {
        const next = new URL(loc, current).toString();
        await assertPublicUrl(next);
        current = next;
        continue;
      }
      break;
    } catch (e: any) {
      status = 0;
      problem = e?.name === 'TimeoutError' ? 'The page took longer than 10 seconds to answer.' : e?.message || 'Could not connect.';
      chain.push({ url: current, status: 0 });
      break;
    }
  }

  const redirects = Math.max(0, chain.length - 1);
  const ok = status >= 200 && status < 300;
  if (!problem) {
    if (status === 404 || status === 410) problem = 'Page not found (404). Customers clicking this ad see an error.';
    else if (status >= 500) problem = `The website is having a server error (${status}).`;
    else if (status >= 400) problem = `The website refused the visit (${status}).`;
    else if (status >= 300) problem = 'Too many redirects.';
    else if (redirects >= 3) problem = 'Several redirects slow the page down.';
  }
  return { url: raw, finalUrl: current, statusCode: status, ok, redirects, responseMs: Date.now() - start, https: current.startsWith('https://'), problem, chain };
}

/* ---------- On-page audit ---------- */
export type Status = 'pass' | 'warn' | 'fail';
export interface AuditCheck {
  id: string;
  group: 'Content' | 'Technical' | 'Ad tracking' | 'Speed';
  label: string;
  status: Status;
  detail: string;
  fix?: string;
  weight: number;
}

export interface PageAudit {
  url: string;
  finalUrl: string;
  score: number;
  checks: AuditCheck[];
  title: string;
  description: string;
  trackers: { meta: boolean; google: boolean; tiktok: boolean; linkedin: boolean };
  brokenLinks: { url: string; status: number }[];
  speed: { performance: number | null; lcp: string | null; cls: string | null; tbt: string | null } | null;
  pageKb: number;
  auditedAt: string;
}

async function exists(url: string) {
  try {
    const r = await fetch(url, { method: 'GET', redirect: 'follow', headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(6000) });
    return r.ok;
  } catch {
    return false;
  }
}

async function pageSpeed(url: string) {
  try {
    const key = process.env.GOOGLE_PSI_API_KEY ? `&key=${process.env.GOOGLE_PSI_API_KEY}` : '';
    const r = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance${key}`, { signal: AbortSignal.timeout(28000) });
    if (!r.ok) return null;
    const d = await r.json();
    const lh = d.lighthouseResult;
    const score = lh?.categories?.performance?.score;
    return {
      performance: typeof score === 'number' ? Math.round(score * 100) : null,
      lcp: lh?.audits?.['largest-contentful-paint']?.displayValue || null,
      cls: lh?.audits?.['cumulative-layout-shift']?.displayValue || null,
      tbt: lh?.audits?.['total-blocking-time']?.displayValue || null,
    };
  } catch {
    return null;
  }
}

export async function auditPage(raw: string, opts: { speed?: boolean } = {}): Promise<PageAudit> {
  const u = await assertPublicUrl(raw);
  const res = await fetch(u.toString(), { headers: { 'User-Agent': UA, Accept: 'text/html' }, redirect: 'follow', signal: AbortSignal.timeout(15000) });
  const finalUrl = res.url || u.toString();
  await assertPublicUrl(finalUrl);
  const buf = (await res.text()).slice(0, 1_500_000);
  const $ = cheerio.load(buf);
  const checks: AuditCheck[] = [];
  const add = (c: AuditCheck) => checks.push(c);

  // ---- Technical
  add({ id: 'status', group: 'Technical', label: 'Page loads', status: res.ok ? 'pass' : 'fail', detail: `Server answered ${res.status}`, fix: res.ok ? undefined : 'Fix the page or point your ads to a working page.', weight: 15 });
  add({ id: 'https', group: 'Technical', label: 'Secure connection (HTTPS)', status: finalUrl.startsWith('https://') ? 'pass' : 'fail', detail: finalUrl.startsWith('https://') ? 'Uses HTTPS' : 'Not secure', fix: 'Install an SSL certificate. Ad platforms and browsers warn about insecure pages.', weight: 8 });
  const viewport = $('meta[name="viewport"]').attr('content');
  add({ id: 'viewport', group: 'Technical', label: 'Mobile friendly', status: viewport ? 'pass' : 'fail', detail: viewport ? 'Viewport tag found' : 'No viewport tag', fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">. Most ad clicks come from phones.', weight: 8 });
  const robots = $('meta[name="robots"]').attr('content') || '';
  add({ id: 'noindex', group: 'Technical', label: 'Visible to search engines', status: /noindex/i.test(robots) ? 'fail' : 'pass', detail: /noindex/i.test(robots) ? 'Page is set to noindex' : 'Indexable', fix: 'Remove the noindex tag if you want this page to appear in Google.', weight: 6 });
  const canonical = $('link[rel="canonical"]').attr('href');
  add({ id: 'canonical', group: 'Technical', label: 'Canonical link', status: canonical ? 'pass' : 'warn', detail: canonical ? canonical : 'Missing', fix: 'Add a canonical link so duplicates (like ?utm= links) do not split your ranking.', weight: 4 });
  add({ id: 'lang', group: 'Technical', label: 'Language declared', status: $('html').attr('lang') ? 'pass' : 'warn', detail: $('html').attr('lang') || 'Missing', fix: 'Add lang="en" (or your language) to the <html> tag.', weight: 2 });
  const origin = new URL(finalUrl).origin;
  const [hasRobots, hasSitemap] = await Promise.all([exists(`${origin}/robots.txt`), exists(`${origin}/sitemap.xml`)]);
  add({ id: 'robots', group: 'Technical', label: 'robots.txt file', status: hasRobots ? 'pass' : 'warn', detail: hasRobots ? 'Found' : 'Not found', fix: 'Add /robots.txt to guide search engines.', weight: 2 });
  add({ id: 'sitemap', group: 'Technical', label: 'XML sitemap', status: hasSitemap ? 'pass' : 'warn', detail: hasSitemap ? 'Found' : 'Not found at /sitemap.xml', fix: 'Create a sitemap so search engines find all your pages.', weight: 3 });

  // ---- Content
  const title = ($('title').first().text() || '').trim();
  add({ id: 'title', group: 'Content', label: 'Page title', status: !title ? 'fail' : title.length >= 25 && title.length <= 65 ? 'pass' : 'warn', detail: title ? `${title.length} characters: “${title.slice(0, 70)}”` : 'Missing', fix: 'Write a clear title of about 30–60 characters that includes your main keyword.', weight: 10 });
  const description = ($('meta[name="description"]').attr('content') || '').trim();
  add({ id: 'description', group: 'Content', label: 'Meta description', status: !description ? 'fail' : description.length >= 70 && description.length <= 165 ? 'pass' : 'warn', detail: description ? `${description.length} characters` : 'Missing', fix: 'Add a 70–160 character summary. It is the text people see in Google results.', weight: 8 });
  const h1 = $('h1').length;
  add({ id: 'h1', group: 'Content', label: 'One main heading (H1)', status: h1 === 1 ? 'pass' : h1 === 0 ? 'fail' : 'warn', detail: `${h1} found`, fix: 'Use exactly one H1 that says what the page is about.', weight: 6 });
  const imgs = $('img');
  const noAlt = imgs.filter((_, el) => !($(el).attr('alt') || '').trim()).length;
  add({ id: 'alt', group: 'Content', label: 'Image descriptions (alt text)', status: imgs.length === 0 || noAlt === 0 ? 'pass' : noAlt / imgs.length > 0.4 ? 'fail' : 'warn', detail: `${noAlt} of ${imgs.length} images have no alt text`, fix: 'Describe each image in the alt attribute. It helps accessibility and image search.', weight: 4 });
  add({ id: 'og', group: 'Content', label: 'Social sharing preview (Open Graph)', status: $('meta[property="og:title"]').length && $('meta[property="og:image"]').length ? 'pass' : 'warn', detail: $('meta[property="og:image"]').length ? 'Title and image set' : 'og:title / og:image missing', fix: 'Add og:title, og:description and og:image so shared links look good.', weight: 3 });
  add({ id: 'schema', group: 'Content', label: 'Structured data', status: $('script[type="application/ld+json"]').length ? 'pass' : 'warn', detail: $('script[type="application/ld+json"]').length ? 'JSON-LD found' : 'None found', fix: 'Add Product / Organization schema for richer Google results.', weight: 3 });

  // ---- Ad tracking readiness
  const html = buf;
  const trackers = {
    meta: /fbq\(|connect\.facebook\.net\/[^"']*fbevents\.js/i.test(html),
    google: /gtag\(|googletagmanager\.com|google-analytics\.com|googleadservices/i.test(html),
    tiktok: /ttq\.load|analytics\.tiktok\.com/i.test(html),
    linkedin: /_linkedin_partner_id|snap\.licdn\.com/i.test(html),
  };
  const trackRow = (k: keyof typeof trackers, label: string, fix: string): AuditCheck => ({ id: `track-${k}`, group: 'Ad tracking', label, status: trackers[k] ? 'pass' : 'warn', detail: trackers[k] ? 'Detected' : 'Not detected on this page', fix, weight: 3 });
  checks.push(trackRow('meta', 'Meta Pixel', 'Install the Meta Pixel so Facebook & Instagram ads can optimize for purchases.'));
  checks.push(trackRow('google', 'Google tag (Ads / Analytics)', 'Install the Google tag to track conversions from Google & YouTube ads.'));
  checks.push(trackRow('tiktok', 'TikTok Pixel', 'Install the TikTok Pixel to measure TikTok ad conversions.'));
  checks.push(trackRow('linkedin', 'LinkedIn Insight Tag', 'Install the LinkedIn Insight Tag for conversion tracking.'));

  // ---- Broken links on the page (sample)
  const links = new Set<string>();
  $('a[href]').each((_, el) => {
    const h = $(el).attr('href') || '';
    if (!h || h.startsWith('#') || /^(mailto|tel|javascript):/i.test(h)) return;
    try {
      links.add(new URL(h, finalUrl).toString());
    } catch {}
  });
  const sample = Array.from(links).slice(0, 12);
  const checked = await Promise.all(sample.map((l) => checkUrl(l).then((r) => ({ url: l, status: r.statusCode, ok: r.ok || (r.statusCode >= 300 && r.statusCode < 400) })).catch(() => ({ url: l, status: 0, ok: false }))));
  const brokenLinks = checked.filter((c) => !c.ok).map((c) => ({ url: c.url, status: c.status }));
  add({ id: 'links', group: 'Technical', label: 'Links on the page work', status: brokenLinks.length === 0 ? 'pass' : brokenLinks.length > 2 ? 'fail' : 'warn', detail: `${brokenLinks.length} broken out of ${sample.length} checked`, fix: 'Fix or remove the broken links listed below.', weight: 8 });

  // ---- Speed
  const pageKb = Math.round(Buffer.byteLength(buf) / 1024);
  const speed = opts.speed === false ? null : await pageSpeed(finalUrl);
  if (speed?.performance != null) {
    add({ id: 'speed', group: 'Speed', label: 'Mobile speed score (Google PageSpeed)', status: speed.performance >= 90 ? 'pass' : speed.performance >= 50 ? 'warn' : 'fail', detail: `${speed.performance}/100 · LCP ${speed.lcp || '–'} · CLS ${speed.cls || '–'}`, fix: 'Compress images, enable caching and remove unused scripts. Slow pages waste ad spend.', weight: 12 });
  }
  add({ id: 'size', group: 'Speed', label: 'Page weight (HTML)', status: pageKb < 500 ? 'pass' : pageKb < 1200 ? 'warn' : 'fail', detail: `${pageKb} KB`, fix: 'Reduce page size.', weight: 2 });

  // ---- Score
  const pts = { pass: 1, warn: 0.5, fail: 0 } as const;
  const total = checks.reduce((a, c) => a + c.weight, 0);
  const got = checks.reduce((a, c) => a + c.weight * pts[c.status], 0);

  return { url: raw, finalUrl, score: Math.round((got / total) * 100), checks, title, description, trackers, brokenLinks, speed, pageKb, auditedAt: new Date().toISOString() };
}
