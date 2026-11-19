'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Send, Save, Trash2, Loader2, AlertTriangle, CheckCircle2, Plug, Calendar, Clapperboard, Image as ImageIcon, Instagram } from 'lucide-react';
import { PlatformBadge } from '@/frontend/components/common/PlatformBadge';
import { MediaUploader, PickedMedia } from '@/frontend/components/media/MediaUploader';
import { PlatformId, SPECS } from '@/shared/adspec';
import { useConnections, isPlatformConnected, hasFeature } from '@/frontend/hooks/useConnections';

const POST_PLATFORMS: PlatformId[] = ['META', 'TIKTOK', 'YOUTUBE', 'LINKEDIN'];
const CAPTION_LIMIT: Record<string, number> = { META: 2200, TIKTOK: 2200, YOUTUBE: 5000, LINKEDIN: 3000 };

interface Post {
  id: string;
  caption: string;
  platforms: string[];
  status: string;
  postType: string;
  mediaUrl: string | null;
  mediaType: string | null;
  scheduledAt: string | null;
  createdAt: string;
  results: Record<string, string> | null;
}

const input =
  'w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#2A6FE0] focus:bg-white dark:focus:bg-slate-900';
const lbl = 'block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5';

function PostsContent() {
  const params = useSearchParams();
  const pre = (params.get('platform') || '').toUpperCase() as PlatformId;
  const { connections } = useConnections();
  const [selected, setSelected] = useState<PlatformId[]>(POST_PLATFORMS.includes(pre) ? [pre] : ['META']);
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState<PickedMedia | null>(null);
  const [postType, setPostType] = useState<'POST' | 'REEL'>('POST');
  const [alsoInstagram, setAlsoInstagram] = useState(true);
  const [link, setLink] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [busy, setBusy] = useState<'publish' | 'save' | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  const load = () =>
    fetch('/api/posts', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { posts: [] }))
      .then((d) => setPosts(d.posts || []))
      .catch(() => {});
  useEffect(() => {
    load();
  }, []);

  const toggle = (p: PlatformId) => setSelected((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]));
  const tooLong = selected.filter((p) => caption.length > CAPTION_LIMIT[p]);
  const isReel = postType === 'REEL';
  const canReel = media?.type === 'VIDEO';
  const noPermission = selected.filter((p) => isPlatformConnected(connections, p) && !hasFeature(connections, p, 'posts'));

  const submit = async (publishNow: boolean) => {
    setMsg(null);
    if (!caption.trim() && !media) return setMsg({ ok: false, text: 'Add a caption, a photo or a video first.' });
    if (!selected.length) return setMsg({ ok: false, text: 'Pick at least one platform.' });
    if (isReel && !canReel) return setMsg({ ok: false, text: 'A Reel needs a video. Upload one above.' });
    if (tooLong.length) return setMsg({ ok: false, text: `Caption is too long for ${tooLong.map((p) => SPECS[p].short).join(', ')}.` });
    setBusy(publishNow ? 'publish' : 'save');
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption, mediaUrl: media?.url || '', mediaType: media?.type || '', postType, alsoInstagram: selected.includes('META') && alsoInstagram, link, platforms: selected, publishNow, scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) return setMsg({ ok: false, text: data.error || 'Something went wrong.' });
    const detail = data.post?.results ? Object.values(data.post.results).join(' · ') : '';
    setMsg({ ok: data.post.status !== 'FAILED', text: publishNow ? detail || 'Done.' : scheduledAt ? 'Scheduled and saved.' : 'Draft saved.' });
    if (data.post.status !== 'FAILED') {
      setCaption('');
      setMedia(null);
    }
    load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/posts?id=${id}`, { method: 'DELETE' });
    load();
  };

  const card = 'rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5';

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pb-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Social Posts</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Upload a photo, video or Reel once and send it to your accounts from one place.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <div className={`${card} lg:col-span-3 space-y-5`}>
          <div>
            <span className={lbl}>1. Where to post</span>
            <div className="flex flex-wrap gap-2">
              {POST_PLATFORMS.map((p) => {
                const on = selected.includes(p);
                const connected = isPlatformConnected(connections, p);
                return (
                  <button key={p} type="button" onClick={() => toggle(p)} className={`inline-flex items-center gap-2 pl-2 pr-3.5 py-1.5 rounded-full text-xs font-bold border-2 transition-all cursor-pointer ${on ? 'border-[#2A6FE0] bg-[#E6F1FF]/60 dark:bg-blue-950/30' : 'border-slate-200 dark:border-slate-800 text-slate-500'}`}>
                    <PlatformBadge id={p} size={22} />
                    {SPECS[p].short}
                    <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-blue-500' : 'bg-slate-300'}`} title={connected ? 'Connected' : 'Not connected'} />
                  </button>
                );
              })}
            </div>
            {selected.some((p) => !isPlatformConnected(connections, p)) && (
              <p className="text-[11px] text-slate-500 mt-1.5">Grey dot = not connected. It will be saved as a draft. <Link href="/settings?section=connections" className="font-bold text-[#2A6FE0] underline">Connect it</Link></p>
            )}
            {noPermission.length > 0 && (
              <p className="text-[11px] text-amber-800 mt-1.5">You connected {noPermission.map((p) => SPECS[p].short).join(', ')} without “Publish posts & reels”. <Link href="/settings?section=connections" className="font-bold underline">Allow it</Link></p>
            )}
          </div>

          <div>
            <span className={lbl}>2. Type</span>
            <div className="flex gap-2">
              {[{ id: 'POST', label: 'Photo / video post', icon: ImageIcon }, { id: 'REEL', label: 'Reel (short vertical video)', icon: Clapperboard }].map((t) => {
                const Icon = t.icon;
                return (
                  <button key={t.id} type="button" onClick={() => setPostType(t.id as 'POST' | 'REEL')} className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${postType === t.id ? 'border-[#2A6FE0] bg-[#E6F1FF]/60 dark:bg-blue-950/30 text-[#153E9E] dark:text-blue-200' : 'border-slate-200 dark:border-slate-800 text-slate-500'}`}>
                    <Icon size={14} /> {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className={lbl}>3. Photo or video</span>
            <MediaUploader value={media} onPick={setMedia} onClear={() => setMedia(null)} allow={isReel ? 'video' : 'both'} />
          </div>

          <div>
            <span className={lbl}>4. Caption</span>
            <textarea rows={5} className={input} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="What do you want to say?" />
            <p className={`text-[11px] mt-1 ${tooLong.length ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>{caption.length} characters</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <span className={lbl}>Link to share (optional)</span>
              <input className={input} value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://yourwebsite.com" />
            </div>
            <div>
              <span className={lbl}>Schedule for later (optional)</span>
              <input type="datetime-local" className={input} value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
          </div>

          {selected.includes('META') && (
            <label className="flex items-start gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
              <input type="checkbox" checked={alsoInstagram} onChange={(e) => setAlsoInstagram(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#2A6FE0]" />
              <span className="inline-flex items-center gap-1.5"><Instagram size={14} /> Also post to the linked Instagram account (needs a photo or video)</span>
            </label>
          )}

          {msg && (
            <p className={`flex items-start gap-2 text-xs font-semibold ${msg.ok ? 'text-blue-700' : 'text-rose-600'}`}>
              {msg.ok ? <CheckCircle2 size={14} className="mt-0.5 shrink-0" /> : <AlertTriangle size={14} className="mt-0.5 shrink-0" />} {msg.text}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={!!busy} onClick={() => submit(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#153E9E] text-white text-xs font-bold hover:brightness-110 disabled:opacity-60 cursor-pointer">
              {busy === 'publish' ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Publish now
            </button>
            <button type="button" disabled={!!busy} onClick={() => submit(false)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-[#1E57D0] disabled:opacity-60 cursor-pointer">
              {busy === 'save' ? <Loader2 size={14} className="animate-spin" /> : scheduledAt ? <Calendar size={14} /> : <Save size={14} />} {scheduledAt ? 'Schedule' : 'Save draft'}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">Facebook Page and Instagram publishing (photos, videos and Reels) works today. TikTok, YouTube and LinkedIn posts are saved here until their publishing is enabled. Scheduled posts go out when the daily scheduler runs.</p>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className={card}>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Preview</h3>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950">
              {media ? (
                media.type === 'VIDEO' ? <video src={media.url} controls className={`w-full bg-black ${isReel ? 'aspect-[9/16] max-h-96 object-contain' : 'max-h-72'}`} /> : // eslint-disable-next-line @next/next/no-img-element
                  <img src={media.url} alt="" className="w-full max-h-72 object-cover" />
              ) : (
                <div className="h-32 flex items-center justify-center text-xs text-slate-400">No photo or video yet</div>
              )}
              <p className="p-3 text-xs text-slate-800 dark:text-slate-100 whitespace-pre-wrap break-words">{caption || 'Your caption will appear here.'}</p>
            </div>
          </div>

          <div className={card}>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Your posts</h3>
            {posts.length === 0 ? (
              <p className="text-xs text-slate-500">Nothing yet. Drafts, scheduled and published posts will appear here.</p>
            ) : (
              <ul className="space-y-2.5">
                {posts.map((p) => (
                  <li key={p.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                    <p className="text-xs text-slate-800 dark:text-slate-100 line-clamp-2">{p.postType === 'REEL' ? '🎬 ' : ''}{p.caption || '(media only)'}</p>
                    {p.results && Object.values(p.results).length > 0 && <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{Object.values(p.results).join(' · ')}</p>}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        {p.platforms.map((x) => <PlatformBadge key={x} id={x as PlatformId} size={18} />)}
                        <span className={`ml-1 text-[10px] font-bold ${p.status === 'PUBLISHED' ? 'text-blue-700' : p.status === 'FAILED' ? 'text-rose-600' : 'text-slate-500'}`}>{p.status}{p.scheduledAt ? ` · ${new Date(p.scheduledAt).toLocaleString()}` : ''}</span>
                      </div>
                      <button type="button" aria-label="Delete post" onClick={() => remove(p.id)} className="text-slate-400 hover:text-rose-600 cursor-pointer"><Trash2 size={14} /></button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Link href="/settings?section=connections" className="flex items-center gap-2 text-xs font-bold text-[#2A6FE0] hover:underline"><Plug size={13} /> Manage connected accounts</Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function PostsView() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500">Loading…</div>}>
      <PostsContent />
    </Suspense>
  );
}
