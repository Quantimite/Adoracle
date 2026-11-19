// src/backend/services/publisher.ts
// Publishes a saved post to the connected platforms.
import { db } from '@/backend/db/client';
import { getConnection } from '@/backend/integrations/tokens';

const V = () => process.env.META_GRAPH_VERSION || 'v23.0';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function graph(path: string, body: Record<string, string>) {
  const res = await fetch(`https://graph.facebook.com/${V()}/${path}`, { method: 'POST', body: new URLSearchParams(body), signal: AbortSignal.timeout(30000) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.error_user_msg || data?.error?.message || 'Facebook rejected the request');
  return data;
}

export interface PostInput {
  caption: string;
  link?: string | null;
  mediaUrl?: string | null;
  mediaType?: string | null; // IMAGE | VIDEO
  postType?: string | null; // POST | REEL
  alsoInstagram?: boolean;
  platforms: string[];
}

async function publishMeta(p: PostInput, conn: NonNullable<Awaited<ReturnType<typeof getConnection>>>): Promise<string> {
  const page = (conn.meta.pages || [])[0];
  if (!page?.id) throw new Error('No Facebook Page found on the connected account.');

  const tokRes = await fetch(`https://graph.facebook.com/${V()}/${page.id}?fields=access_token&access_token=${conn.accessToken}`, { signal: AbortSignal.timeout(15000) });
  const pageToken = (await tokRes.json())?.access_token;
  if (!pageToken) throw new Error('Could not get permission to post on this Page. Reconnect and allow “Publish posts & reels”.');

  const done: string[] = [];
  const isVideo = p.mediaType === 'VIDEO';
  const isReel = p.postType === 'REEL' && isVideo;

  // ---- Facebook
  if (!p.mediaUrl) {
    const body: Record<string, string> = { message: p.caption, access_token: pageToken };
    if (p.link) body.link = p.link;
    await graph(`${page.id}/feed`, body);
  } else if (!isVideo) {
    await graph(`${page.id}/photos`, { url: p.mediaUrl, caption: p.caption, access_token: pageToken });
  } else if (isReel) {
    const start = await graph(`${page.id}/video_reels`, { upload_phase: 'start', access_token: pageToken });
    const up = await fetch(start.upload_url, { method: 'POST', headers: { Authorization: `OAuth ${pageToken}`, file_url: p.mediaUrl }, signal: AbortSignal.timeout(60000) });
    if (!up.ok) throw new Error('Facebook could not fetch the video file.');
    await graph(`${page.id}/video_reels`, { upload_phase: 'finish', video_id: start.video_id, video_state: 'PUBLISHED', description: p.caption, access_token: pageToken });
  } else {
    await graph(`${page.id}/videos`, { file_url: p.mediaUrl, description: p.caption, access_token: pageToken });
  }
  done.push(`Facebook Page “${page.name}”${isReel ? ' (Reel)' : ''}`);

  // ---- Instagram (same media)
  if (p.alsoInstagram) {
    const igId = page.instagram?.id;
    if (!igId) done.push('Instagram skipped: no Instagram business account linked to this Page');
    else if (!p.mediaUrl) done.push('Instagram skipped: Instagram needs a photo or video');
    else {
      const container = await graph(`${igId}/media`, isVideo ? { media_type: 'REELS', video_url: p.mediaUrl, caption: p.caption, access_token: pageToken } : { image_url: p.mediaUrl, caption: p.caption, access_token: pageToken });
      for (let i = 0; i < 15; i++) {
        const st = await (await fetch(`https://graph.facebook.com/${V()}/${container.id}?fields=status_code&access_token=${pageToken}`)).json();
        if (st.status_code === 'FINISHED') break;
        if (st.status_code === 'ERROR') throw new Error('Instagram could not process the video.');
        await sleep(3000);
      }
      await graph(`${igId}/media_publish`, { creation_id: container.id, access_token: pageToken });
      done.push(`Instagram @${page.instagram.username || igId}${isVideo ? ' (Reel)' : ''}`);
    }
  }
  return `Published to ${done.join(' + ')}`;
}

/** Publishes a post to each selected platform. Returns the status and a message per platform. */
export async function publishToPlatforms(workspaceId: string, p: PostInput) {
  const results: Record<string, string> = {};
  let ok = 0;
  for (const platform of p.platforms) {
    try {
      const conn = await getConnection(workspaceId, platform);
      if (!conn) {
        results[platform] = 'Not connected. Connect it in Settings first.';
        continue;
      }
      if (!(conn.meta.features || []).includes('posts')) {
        results[platform] = 'Publishing permission was not granted. Reconnect and tick “Publish posts & reels”.';
        continue;
      }
      if (platform === 'META') {
        results[platform] = await publishMeta(p, conn);
        ok++;
      } else {
        results[platform] = 'Saved. Direct publishing to this platform is not enabled yet.';
      }
    } catch (e: any) {
      results[platform] = e?.message || 'Failed';
    }
  }
  return { status: ok > 0 ? 'PUBLISHED' : 'FAILED', results };
}

/** Publishes every scheduled post whose time has come (called by the cron job). */
export async function publishDuePosts() {
  const due = await db.socialPost.findMany({ where: { status: 'SCHEDULED', scheduledAt: { lte: new Date() } }, take: 20 });
  for (const post of due) {
    const r = await publishToPlatforms(post.workspaceId, {
      caption: post.caption, link: post.link, mediaUrl: post.mediaUrl, mediaType: post.mediaType, postType: post.postType, alsoInstagram: post.alsoInstagram, platforms: post.platforms,
    });
    await db.socialPost.update({ where: { id: post.id }, data: { status: r.status, results: r.results as any, publishedAt: r.status === 'PUBLISHED' ? new Date() : null } });
  }
  return due.length;
}
