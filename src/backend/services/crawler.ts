import * as cheerio from 'cheerio';
import { assertPublicUrl, auditPage } from '@/backend/services/seoService';

export interface ScrapedResult {
  url: string;
  offerings: string;
  priceTier: 'LOW' | 'MID' | 'HIGH';
  targetAudience: string;
  reachType: 'LOCAL' | 'NATIONAL' | 'GLOBAL';
  detectedKeywords: string[];
  brokenLinks: { url: string; destination: string; status: number; type: 'Checkout URL' | 'Landing Page' | 'Privacy Policy' | 'Product Link' }[];
  healthScore: number;
  coreWebVitalsMet: boolean;
}

const STOP = new Set('the and for you your with that this from are our have has was but not all can will more about into than they them their what when who how why its out one any new get use per via just also over only such like make made best free shop home page cart menu login sign'.split(' '));

/** Reads the real website: what it sells, price level, audience hints and link health. */
export async function crawlWebsite(targetUrl: string): Promise<ScrapedResult> {
  const u = await assertPublicUrl(targetUrl.trim());
  const res = await fetch(u.toString(), { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AdoracleBot/1.0)' }, redirect: 'follow', signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`The website answered with an error (${res.status}).`);
  const html = (await res.text()).slice(0, 1_500_000);
  const $ = cheerio.load(html);

  const title = $('title').first().text().trim();
  const desc = ($('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '').trim();
  const h1 = $('h1').first().text().trim();
  const offerings = (desc || h1 || title || 'Website content could not be read').slice(0, 160);

  const bodyText = $('body').text().replace(/\s+/g, ' ').toLowerCase();
  const words = (title + ' ' + desc + ' ' + h1 + ' ' + ($('meta[name="keywords"]').attr('content') || '') + ' ' + bodyText.slice(0, 6000)).toLowerCase().match(/[a-z]{4,}/g) || [];
  const freq = new Map<string, number>();
  for (const w of words) if (!STOP.has(w)) freq.set(w, (freq.get(w) || 0) + 1);
  const detectedKeywords = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([w]) => w);

  // Price level from the numbers shown on the page (USD-like; also accepts £ € Rs LKR)
  const prices = Array.from(bodyText.matchAll(/(?:\$|£|€|rs\.?|lkr)\s?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/g)).map((m) => Number(m[1].replace(/,/g, ''))).filter((n) => n > 0 && n < 1_000_000);
  prices.sort((a, b) => a - b);
  const median = prices.length ? prices[Math.floor(prices.length / 2)] : 0;
  const priceTier: ScrapedResult['priceTier'] = !median ? 'MID' : median < 60 ? 'LOW' : median < 500 ? 'MID' : 'HIGH';

  const b2b = /\b(enterprise|b2b|saas|agency|business|teams?|api|platform|solutions)\b/.test(bodyText.slice(0, 8000));
  const local = /\b(near me|our clinic|visit us|opening hours|directions|call us today|book an appointment)\b/.test(bodyText);
  const worldwide = /\b(worldwide|international shipping|ships globally|global)\b/.test(bodyText);
  const targetAudience = b2b ? 'Business owners, managers and professionals' : local ? 'Local residents who want a quick appointment or visit' : 'Online shoppers and consumers';
  const reachType: ScrapedResult['reachType'] = local ? 'LOCAL' : worldwide || $('link[hreflang]').length > 1 ? 'GLOBAL' : 'NATIONAL';

  // Real link + SEO health (speed test skipped here to keep this fast)
  let healthScore = 70;
  let brokenLinks: ScrapedResult['brokenLinks'] = [];
  try {
    const audit = await auditPage(u.toString(), { speed: false });
    healthScore = audit.score;
    brokenLinks = audit.brokenLinks.map((b) => ({
      url: b.url,
      destination: b.url,
      status: b.status,
      type: /checkout|cart|pay/i.test(b.url) ? 'Checkout URL' : /privacy|terms/i.test(b.url) ? 'Privacy Policy' : /product|item|shop/i.test(b.url) ? 'Product Link' : 'Landing Page',
    }));
  } catch {
    /* keep defaults */
  }

  return { url: u.toString(), offerings, priceTier, targetAudience, reachType, detectedKeywords, brokenLinks, healthScore, coreWebVitalsMet: healthScore >= 85 };
}
