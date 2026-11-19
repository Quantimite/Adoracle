'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';
import { UploadCloud, Film, ImageIcon, Loader2, Trash2, Link2, AlertTriangle, Check } from 'lucide-react';

export interface PickedMedia {
  url: string;
  type: 'IMAGE' | 'VIDEO';
  name?: string;
}

interface Asset {
  id: string;
  url: string;
  name: string;
  kind: 'IMAGE' | 'VIDEO';
  size: number;
}

const MAX_MB = 512;
const OK = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm'];

/**
 * Upload a photo or video from your device (or reuse an earlier upload).
 * Large videos go straight to storage with a progress bar.
 */
export function MediaUploader({ value, onPick, onClear, allow = 'both' }: { value?: PickedMedia | null; onPick: (m: PickedMedia) => void; onClear?: () => void; allow?: 'both' | 'video' | 'image' }) {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [items, setItems] = useState<Asset[]>([]);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [link, setLink] = useState('');
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    fetch('/api/media', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { configured: false, items: [] }))
      .then((d) => {
        setConfigured(!!d.configured);
        setItems(d.items || []);
      })
      .catch(() => setConfigured(false));
  }, []);
  useEffect(load, [load]);

  const handleFile = async (file: File) => {
    setError('');
    if (!OK.includes(file.type)) return setError('Use a JPG, PNG, WebP, GIF, MP4, MOV or WebM file.');
    if (allow === 'video' && !file.type.startsWith('video/')) return setError('Please choose a video.');
    if (allow === 'image' && !file.type.startsWith('image/')) return setError('Please choose a photo.');
    if (file.size > MAX_MB * 1024 * 1024) return setError(`That file is larger than ${MAX_MB} MB.`);
    setProgress(0);
    try {
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/media/upload',
        multipart: file.size > 20 * 1024 * 1024,
        contentType: file.type,
        onUploadProgress: (p) => setProgress(Math.round(p.percentage)),
      });
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: blob.url, pathname: blob.pathname, name: file.name, contentType: file.type, size: file.size }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save the file.');
      onPick({ url: blob.url, type: file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE', name: file.name });
      load();
    } catch (e: any) {
      setError(e?.message?.includes('storage_not_configured') ? 'File storage is not switched on yet.' : e?.message || 'Upload failed. Please try again.');
    } finally {
      setProgress(null);
    }
  };

  const remove = async (id: string) => {
    await fetch(`/api/media?id=${id}`, { method: 'DELETE' });
    load();
  };

  const usePasted = () => {
    if (!/^https?:\/\//i.test(link)) return setError('The link must start with https://');
    setError('');
    onPick({ url: link, type: /\.(mp4|mov|webm)(\?|$)/i.test(link) ? 'VIDEO' : 'IMAGE' });
    setLink('');
  };

  const shown = items.filter((i) => allow === 'both' || (allow === 'video' ? i.kind === 'VIDEO' : i.kind === 'IMAGE'));

  return (
    <div className="space-y-3">
      {value ? (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#E6F1FF]/60 dark:bg-blue-950/30 border border-[#BBD9FF] dark:border-blue-900">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center">
            {value.type === 'VIDEO' ? <video src={value.url} className="w-full h-full object-cover" muted preload="metadata" /> : // eslint-disable-next-line @next/next/no-img-element
              <img src={value.url} alt="" className="w-full h-full object-cover" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5"><Check size={13} className="text-blue-600" /> {value.name || (value.type === 'VIDEO' ? 'Video' : 'Photo')}</p>
            <p className="text-[11px] text-slate-500">{value.type === 'VIDEO' ? 'Video ready' : 'Photo ready'}</p>
          </div>
          {onClear && <button type="button" onClick={onClear} className="text-xs font-bold text-rose-600 hover:underline cursor-pointer">Remove</button>}
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
          className={`rounded-2xl border-2 border-dashed p-5 text-center transition-colors ${drag ? 'border-[#2A6FE0] bg-[#E6F1FF]/60' : 'border-slate-300 dark:border-slate-700'}`}
        >
          {progress !== null ? (
            <div className="space-y-2">
              <p className="flex items-center justify-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200"><Loader2 size={14} className="animate-spin" /> Uploading… {progress}%</p>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden"><div className="h-full bg-[#2A6FE0] transition-all" style={{ width: `${progress}%` }} /></div>
            </div>
          ) : configured === false ? (
            <p className="text-xs text-slate-500 flex items-center justify-center gap-2"><AlertTriangle size={14} className="text-amber-600" /> Uploading from your device is not switched on yet. You can paste a link below.</p>
          ) : (
            <>
              <UploadCloud size={26} className="mx-auto text-[#2A6FE0]" />
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">Upload from your device</p>
              <p className="text-[11px] text-slate-500">Drag a file here, or choose one. Photos and videos up to {MAX_MB} MB. Vertical 9:16 video works best for Reels.</p>
              <button type="button" onClick={() => inputRef.current?.click()} className="mt-3 px-5 py-2.5 rounded-xl bg-[#153E9E] text-white text-xs font-bold hover:brightness-110 cursor-pointer">Choose file</button>
              <input ref={inputRef} type="file" hidden accept={allow === 'video' ? 'video/*' : allow === 'image' ? 'image/*' : 'image/*,video/*'} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
            </>
          )}
        </div>
      )}

      {error && <p className="flex items-center gap-2 text-xs font-semibold text-rose-600"><AlertTriangle size={13} /> {error}</p>}

      {!value && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="…or paste a link to an image or video (https://)" className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#2A6FE0]" />
          </div>
          <button type="button" onClick={usePasted} className="px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold cursor-pointer">Use link</button>
        </div>
      )}

      {!value && shown.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Your uploads</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {shown.slice(0, 15).map((a) => (
              <div key={a.id} className="group relative aspect-square rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800">
                <button type="button" onClick={() => onPick({ url: a.url, type: a.kind, name: a.name })} className="absolute inset-0 w-full h-full cursor-pointer" aria-label={`Use ${a.name}`}>
                  {a.kind === 'VIDEO' ? <video src={a.url} className="w-full h-full object-cover" muted preload="metadata" /> : // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.url} alt={a.name} className="w-full h-full object-cover" />}
                </button>
                <span className="absolute left-1 top-1 p-1 rounded bg-black/55 text-white pointer-events-none">{a.kind === 'VIDEO' ? <Film size={10} /> : <ImageIcon size={10} />}</span>
                <button type="button" onClick={() => remove(a.id)} aria-label="Delete upload" className="absolute right-1 top-1 p-1 rounded bg-black/55 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><Trash2 size={10} /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
