import { NextRequest, NextResponse } from 'next/server';
import { getCtx, unauthorized } from '@/backend/auth/session';
import { getConnection } from '@/backend/integrations/tokens';

const V = () => process.env.META_GRAPH_VERSION || 'v23.0';

export interface LibraryItem {
  id: string;
  platform: 'META' | 'INSTAGRAM' | 'YOUTUBE';
  text: string;
  thumbnail: string | null;
  mediaUrl: string | null;
  url: string | null;
  type: 'IMAGE' | 'VIDEO' | 'TEXT';
  createdAt: string | null;
  source: string; // page / channel name
}

async function j(url: string) {
  const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
  return { ok: r.ok, data: await r.json().catch(() => ({})) };
}

/**
 * GET ?platform=META|YOUTUBE → the posts/videos that already exist on the connected account,
 * so they can be picked as an ad creative without uploading again.
 */
export async function GET(req: NextRequest) {
  const ctx = await getCtx();
  if (!ctx) return unauthorized();

  const platform = (req.nextUrl.searchParams.get('platform') || 'META').toUpperCase();
  const conn = await getConnection(ctx.workspaceId, platform);
  if (!conn) return NextResponse.json({ connected: false, items: [] });

  if (!(conn.meta.features || []).includes('library')) {
    return NextResponse.json({ connected: true, allowed: false, items: [], message: 'Reconnect and tick “Let me pick my existing posts” to use this.' });
  }

  const items: LibraryItem[] = [];
  const errors: string[] = [];

  try {
    if (platform === 'META') {
      const pages: any[] = conn.meta.pages || [];
      for (const page of pages.slice(0, 3)) {
        const tok = await j(`https://graph.facebook.com/${V()}/${page.id}?fields=access_token&access_token=${conn.accessToken}`);
        const pageToken = tok.data?.access_token;
        if (!pageToken) {
          errors.push(`No access to page ${page.name}`);
          continue;
        }
        const fb = await j(
          `https://graph.facebook.com/${V()}/${page.id}/published_posts?fields=id,message,created_time,full_picture,permalink_url,attachments{media_type}&limit=12&access_token=${pageToken}`
        );
        for (const p of fb.data?.data || []) {
          const mt = p.attachments?.data?.[0]?.media_type;
          items.push({
            id: p.id,
            platform: 'META',
            text: p.message || '',
            thumbnail: p.full_picture || null,
            mediaUrl: p.full_picture || null,
            url: p.permalink_url || null,
            type: mt === 'video' ? 'VIDEO' : p.full_picture ? 'IMAGE' : 'TEXT',
            createdAt: p.created_time || null,
            source: page.name,
          });
        }
        const igId = page.instagram?.id;
        if (igId) {
          const ig = await j(
            `https://graph.facebook.com/${V()}/${igId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=12&access_token=${pageToken}`
          );
          for (const m of ig.data?.data || []) {
            items.push({
              id: m.id,
              platform: 'INSTAGRAM',
              text: m.caption || '',
              thumbnail: m.thumbnail_url || m.media_url || null,
              mediaUrl: m.media_url || null,
              url: m.permalink || null,
              type: m.media_type === 'VIDEO' ? 'VIDEO' : 'IMAGE',
              createdAt: m.timestamp || null,
              source: `@${page.instagram.username || 'instagram'}`,
            });
          }
        }
      }
    } else if (platform === 'YOUTUBE' || platform === 'GOOGLE') {
      const auth = { headers: { Authorization: `Bearer ${conn.accessToken}` }, signal: AbortSignal.timeout(15000) };
      const ch = await (await fetch('https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&mine=true', auth)).json();
      const channel = ch.items?.[0];
      const uploads = channel?.contentDetails?.relatedPlaylists?.uploads;
      if (uploads) {
        const list = await (await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=18&playlistId=${uploads}`, auth)).json();
        for (const v of list.items || []) {
          const id = v.contentDetails?.videoId;
          items.push({
            id,
            platform: 'YOUTUBE',
            text: v.snippet?.title || '',
            thumbnail: v.snippet?.thumbnails?.medium?.url || v.snippet?.thumbnails?.default?.url || null,
            mediaUrl: null,
            url: id ? `https://www.youtube.com/watch?v=${id}` : null,
            type: 'VIDEO',
            createdAt: v.contentDetails?.videoPublishedAt || null,
            source: channel?.snippet?.title || 'YouTube',
          });
        }
      } else if (ch.error) errors.push(ch.error.message);
    }
  } catch (e: any) {
    errors.push(e?.message || 'Could not load posts');
  }

  items.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  return NextResponse.json({ connected: true, allowed: true, items, errors });
}
