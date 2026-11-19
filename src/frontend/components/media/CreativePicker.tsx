'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Check, Film, ImageIcon, Plug } from 'lucide-react';
import { MediaUploader, PickedMedia } from '@/frontend/components/media/MediaUploader';

export interface SourcePost {
  platform: string;
  id: string;
  url: string | null;
  text: string;
}

interface LibraryItem {
  id: string;
  platform: 'META' | 'INSTAGRAM' | 'YOUTUBE';
  text: string;
  thumbnail: string | null;
  mediaUrl: string | null;
  url: string | null;
  type: 'IMAGE' | 'VIDEO' | 'TEXT';
  createdAt: string | null;
  source: string;
}

export interface CreativeValue {
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO' | '';
  sourcePost: SourcePost | null;
}

/**
 * Choose what the ad shows:
 *  • a new photo/video from your device, an earlier upload or a link
 *  • or a post/video that already exists on your connected Facebook, Instagram or YouTube
 */
export function CreativePicker({ value, onChange }: { value: CreativeValue; onChange: (v: CreativeValue, text?: string) => void }) {
  const [tab, setTab] = useState<'upload' | 'existing'>(value.sourcePost ? 'existing' : 'upload');
  const [source, setSource] = useState<'META' | 'YOUTUBE'>('META');
  const [state, setState] = useState<{ loading: boolean; connected: boolean; allowed: boolean; items: LibraryItem[]; message?: string; errors?: string[] }>({ loading: false, connected: true, allowed: true, items: [] });

  useEffect(() => {
    if (tab !== 'existing') return;
    setState((s) => ({ ...s, loading: true }));
    fetch(`/api/social/library?platform=${source}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setState({ loading: false, connected: d.connected !== false, allowed: d.allowed !== false, items: d.items || [], message: d.message, errors: d.errors }))
      .catch(() => setState({ loading: false, connected: true, allowed: true, items: [], message: 'Could not load your posts.' }));
  }, [tab, source]);

  const media: PickedMedia | null = value.mediaUrl && !value.sourcePost ? { url: value.mediaUrl, type: (value.mediaType || 'IMAGE') as 'IMAGE' | 'VIDEO' } : null;

  return (
    <div className="space-y-3">
      <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold">
        {[['upload', 'Upload or link'], ['existing', 'Pick an existing post']].map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id as 'upload' | 'existing')} className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${tab === id ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'upload' && (
        <MediaUploader
          value={media}
          onPick={(m) => onChange({ mediaUrl: m.url, mediaType: m.type, sourcePost: null })}
          onClear={() => onChange({ mediaUrl: '', mediaType: '', sourcePost: null })}
        />
      )}

      {tab === 'existing' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            {[['META', 'Facebook & Instagram'], ['YOUTUBE', 'YouTube']].map(([id, label]) => (
              <button key={id} type="button" onClick={() => setSource(id as 'META' | 'YOUTUBE')} className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold border cursor-pointer ${source === id ? 'bg-[#153E9E] text-white border-[#153E9E]' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>{label}</button>
            ))}
          </div>

          {state.loading && <p className="flex items-center gap-2 text-xs text-slate-500"><Loader2 size={14} className="animate-spin" /> Loading your posts…</p>}

          {!state.loading && !state.connected && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
              Connect your account to see your posts here.{' '}
              <Link href="/settings?section=connections" className="inline-flex items-center gap-1 font-bold text-[#2A6FE0] underline"><Plug size={12} /> Connect</Link>
            </div>
          )}
          {!state.loading && state.connected && !state.allowed && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              {state.message || 'Permission to read your posts was not given.'}{' '}
              <Link href="/settings?section=connections" className="font-bold underline">Open connections</Link>
            </div>
          )}
          {!state.loading && state.allowed && state.connected && state.items.length === 0 && (
            <p className="text-xs text-slate-500">{state.errors?.[0] || 'No posts found on this account yet.'}</p>
          )}

          {state.items.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
              {state.items.map((it) => {
                const selected = value.sourcePost?.id === it.id;
                return (
                  <button
                    key={`${it.platform}-${it.id}`}
                    type="button"
                    onClick={() => onChange({ mediaUrl: it.mediaUrl || it.thumbnail || '', mediaType: it.type === 'VIDEO' ? 'VIDEO' : it.type === 'IMAGE' ? 'IMAGE' : '', sourcePost: { platform: it.platform, id: it.id, url: it.url, text: it.text } }, it.text)}
                    className={`text-left rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${selected ? 'border-[#2A6FE0] ring-2 ring-[#2A6FE0]/30' : 'border-slate-200 dark:border-slate-800 hover:border-[#1E57D0]'}`}
                  >
                    <div className="relative aspect-video bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                      {it.thumbnail ? // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.thumbnail} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <ImageIcon className="text-slate-400" />}
                      <span className="absolute left-1.5 top-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold inline-flex items-center gap-1">
                        {it.type === 'VIDEO' ? <Film size={9} /> : null}{it.platform === 'INSTAGRAM' ? 'Instagram' : it.platform === 'YOUTUBE' ? 'YouTube' : 'Facebook'}
                      </span>
                      {selected && <span className="absolute right-1.5 top-1.5 w-5 h-5 rounded-full bg-[#2A6FE0] text-white flex items-center justify-center"><Check size={12} /></span>}
                    </div>
                    <div className="p-2">
                      <p className="text-[11px] text-slate-800 dark:text-slate-100 line-clamp-2">{it.text || '(no caption)'}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{it.source}{it.createdAt ? ` · ${new Date(it.createdAt).toLocaleDateString()}` : ''}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          {value.sourcePost && <p className="text-[11px] text-blue-700 font-semibold">Selected: this existing post will be reused as the ad. Likes and comments on it carry over on Meta.</p>}
        </div>
      )}
    </div>
  );
}
