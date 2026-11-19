'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pause, Play, Copy, Trash2, Pencil, Loader2, AlertTriangle, CheckCircle2, MoreHorizontal, X, ExternalLink } from 'lucide-react';
import { PlatformBadge } from '@/frontend/components/common/PlatformBadge';
import { MediaUploader } from '@/frontend/components/media/MediaUploader';
import { PlatformId, SPECS } from '@/shared/adspec';

type Level = 'campaign' | 'adset' | 'ad';

interface AdRow { id: string; adSetId: string; name: string; status: string; format: string | null; primaryText: string; headline: string; description: string | null; cta: string; destinationUrl: string; mediaUrl: string | null; mediaType: string | null; sourcePostUrl: string | null; impressions: number; clicks: number; spend: number; conversions: number }
interface AdSetRow { id: string; name: string; status: string; budget: number | null; budgetType: string; startTime: string | null; endTime: string | null; audience: string | null; placements: string | null; bidStrategy: string | null; optimization: string | null; ads: AdRow[] }
interface CampaignFull { id: string; platform: PlatformId; name: string; status: string; dailyBudget: number; objective: string | null; launchStatus: string; launchMessage: string | null; adSets: AdSetRow[] }

const input = 'w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#2A6FE0]';
const lbl = 'block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5';
const toLocal = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

function StatusSwitch({ active, onToggle, disabled }: { active: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={active} aria-label={active ? 'Pause' : 'Activate'} disabled={disabled} onClick={onToggle}
      className={`relative w-10 h-6 rounded-full transition-colors shrink-0 cursor-pointer disabled:opacity-50 ${active ? 'bg-[#2A6FE0]' : 'bg-slate-300 dark:bg-slate-700'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${active ? 'translate-x-4' : ''}`} />
    </button>
  );
}

function RowMenu({ onEdit, onDuplicate, onDelete }: { onEdit: () => void; onDuplicate: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" aria-label="More actions" onClick={() => setOpen((v) => !v)} onBlur={() => setTimeout(() => setOpen(false), 150)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"><MoreHorizontal size={16} /></button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-40 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 text-xs font-semibold">
          <button type="button" onMouseDown={onEdit} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-left cursor-pointer"><Pencil size={13} /> Edit</button>
          <button type="button" onMouseDown={onDuplicate} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-left cursor-pointer"><Copy size={13} /> Duplicate</button>
          <button type="button" onMouseDown={onDelete} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-rose-50 text-rose-600 text-left cursor-pointer"><Trash2 size={13} /> Delete</button>
        </div>
      )}
    </div>
  );
}

export function CampaignManager({ id }: { id: string }) {
  const router = useRouter();
  const [c, setC] = useState<CampaignFull | null>(null);
  const [canEdit, setCanEdit] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'adsets' | 'ads'>('ads');
  const [sel, setSel] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [edit, setEdit] = useState<{ level: Level; item: any } | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  const load = useCallback(async () => {
    const r = await fetch(`/api/campaigns/${id}`, { cache: 'no-store' });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return setError(d.error || 'Could not load this campaign.');
    setC(d.campaign);
    setCanEdit(d.canEdit !== false);
  }, [id]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => setSel([]), [tab]);

  const patch = async (level: Level, ids: string[], changes: Record<string, any>) => {
    setBusy(true);
    setNote(null);
    const r = await fetch(`/api/campaigns/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ level, ids, changes }) });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setNote({ ok: false, text: d.error || 'Could not save.' }); return false; }
    setC(d.campaign);
    setNote({ ok: true, text: d.note || 'Saved.' });
    return true;
  };

  const dup = async (level: Level, itemId: string) => {
    setBusy(true);
    const r = await fetch(`/api/campaigns/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'duplicate', level, id: itemId }) });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setNote({ ok: false, text: d.error || 'Could not duplicate.' });
    if (level === 'campaign') return router.push(`/campaigns/${d.copy.id}`);
    setC(d.campaign);
    setNote({ ok: true, text: 'Duplicated (the copy is paused).' });
  };

  const del = async (level: Level, itemId: string, label: string) => {
    if (!window.confirm(`Delete “${label}”? This removes it from Adoracle.${c?.launchStatus === 'PUSHED' ? ' It does not delete anything on the ad platform.' : ''}`)) return;
    setBusy(true);
    await fetch(`/api/campaigns/${id}?level=${level}&id=${itemId}`, { method: 'DELETE' });
    setBusy(false);
    if (level === 'campaign') return router.push('/campaigns');
    setSel((s) => s.filter((x) => x !== itemId));
    load();
  };

  const openEdit = (level: Level, item: any) => {
    setEdit({ level, item });
    if (level === 'campaign') setForm({ name: item.name, dailyBudget: item.dailyBudget });
    if (level === 'adset') setForm({ name: item.name, budget: item.budget ?? '', startTime: toLocal(item.startTime), endTime: toLocal(item.endTime) });
    if (level === 'ad') setForm({ name: item.name, headline: item.headline, primaryText: item.primaryText, description: item.description || '', cta: item.cta, destinationUrl: item.destinationUrl, mediaUrl: item.mediaUrl || '', mediaType: item.mediaType || '' });
  };

  const saveEdit = async () => {
    if (!edit) return;
    const changes: Record<string, any> = { ...form };
    if (edit.level === 'adset' && !changes.budget) delete changes.budget;
    if (edit.level === 'adset') { changes.startTime = form.startTime || null; changes.endTime = form.endTime || null; }
    delete changes.mediaType;
    if (edit.level === 'ad' && !changes.mediaUrl) delete changes.mediaUrl;
    const ok = await patch(edit.level, [edit.item.id], changes);
    if (ok) setEdit(null);
  };

  if (error) return <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-sm text-rose-700 font-semibold">{error} <Link href="/campaigns" className="underline">Back to campaigns</Link></div>;
  if (!c) return <p className="flex items-center gap-2 text-sm text-slate-500"><Loader2 size={16} className="animate-spin" /> Loading campaign…</p>;

  const spec = SPECS[c.platform];
  const allAds = c.adSets.flatMap((a) => a.ads.map((ad) => ({ ...ad, adSetName: a.name })));
  const rows = tab === 'adsets' ? c.adSets : allAds;
  const level: Level = tab === 'adsets' ? 'adset' : 'ad';
  const allSelected = rows.length > 0 && sel.length === rows.length;
  const card = 'rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800';
  const campaignActive = c.status === 'ACTIVE' || c.status === 'LEARNING';

  return (
    <div className="space-y-4 pb-10">
      <Link href="/campaigns" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E57D0] dark:text-sky-400 hover:underline"><ArrowLeft size={13} /> All campaigns</Link>

      <div className={`${card} p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4`}>
        <div className="flex items-center gap-3 min-w-0">
          <PlatformBadge id={c.platform} size={46} />
          <div className="min-w-0">
            <h1 className="text-lg font-extrabold text-slate-900 dark:text-white truncate">{c.name}</h1>
            <p className="text-xs text-slate-500">{spec.managerName} · {c.objective || 'Objective'} · ${c.dailyBudget}/day · <span className="font-bold">{c.status}</span></p>
            {c.launchMessage && <p className="text-[11px] text-slate-500 mt-0.5">{c.launchMessage}</p>}
          </div>
        </div>
        {canEdit && (
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={() => patch('campaign', [c.id], { status: campaignActive ? 'PAUSED' : 'ACTIVE' })} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#153E9E] text-white hover:brightness-110 disabled:opacity-60 cursor-pointer">
              {campaignActive ? <Pause size={13} /> : <Play size={13} />} {campaignActive ? 'Pause campaign' : 'Activate campaign'}
            </button>
            <button type="button" onClick={() => openEdit('campaign', c)} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-[#2A6FE0] cursor-pointer"><Pencil size={13} /> Edit</button>
            <button type="button" onClick={() => dup('campaign', c.id)} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-[#2A6FE0] cursor-pointer"><Copy size={13} /> Duplicate</button>
            <button type="button" onClick={() => del('campaign', c.id, c.name)} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-rose-600 hover:border-rose-400 cursor-pointer"><Trash2 size={13} /> Delete</button>
          </div>
        )}
      </div>

      {note && <p className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl ${note.ok ? 'bg-blue-50 text-blue-800' : 'bg-rose-50 text-rose-700'}`}>{note.ok ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />} {note.text}</p>}

      <div className={`${card} p-4 sm:p-5`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold">
            {[['ads', `Ads (${allAds.length})`], ['adsets', `${spec.levels[1]}s (${c.adSets.length})`]].map(([k, label]) => (
              <button key={k} type="button" onClick={() => setTab(k as 'ads' | 'adsets')} className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${tab === k ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}>{label}</button>
            ))}
          </div>
          {canEdit && sel.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-600 dark:text-slate-300">{sel.length} selected</span>
              <button type="button" disabled={busy} onClick={async () => { if (await patch(level, sel, { status: 'ACTIVE' })) setSel([]); }} className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-800 font-bold cursor-pointer">Activate</button>
              <button type="button" disabled={busy} onClick={async () => { if (await patch(level, sel, { status: 'PAUSED' })) setSel([]); }} className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 font-bold cursor-pointer">Pause</button>
              {level === 'ad' && <button type="button" disabled={busy} onClick={async () => { const u = window.prompt('New destination link for the selected ads (https://…)'); if (u && (await patch('ad', sel, { destinationUrl: u }))) setSel([]); }} className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 font-bold cursor-pointer">Change link</button>}
              {level === 'ad' && <button type="button" disabled={busy} onClick={async () => { const t = window.prompt('New call to action for the selected ads', 'Learn more'); if (t && (await patch('ad', sel, { cta: t }))) setSel([]); }} className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 font-bold cursor-pointer">Change button</button>}
            </div>
          )}
        </div>

        {rows.length === 0 ? <p className="text-xs text-slate-500 py-6 text-center">Nothing here yet.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[680px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="py-2 pr-2 w-8"><input type="checkbox" aria-label="Select all" checked={allSelected} onChange={() => setSel(allSelected ? [] : rows.map((r: any) => r.id))} className="accent-[#2A6FE0]" /></th>
                  <th className="py-2 pr-3 w-14">On/Off</th>
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">{tab === 'ads' ? 'Message' : 'Audience & schedule'}</th>
                  <th className="py-2 pr-3 text-right">{tab === 'ads' ? 'Spend' : 'Budget'}</th>
                  {tab === 'ads' && <th className="py-2 pr-3 text-right">Clicks</th>}
                  <th className="py-2 w-10" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r: any) => (
                  <tr key={r.id} className="border-b border-slate-50 dark:border-slate-800/60 align-top">
                    <td className="py-3 pr-2"><input type="checkbox" aria-label={`Select ${r.name}`} checked={sel.includes(r.id)} onChange={() => setSel((s) => (s.includes(r.id) ? s.filter((x) => x !== r.id) : [...s, r.id]))} className="accent-[#2A6FE0]" /></td>
                    <td className="py-3 pr-3"><StatusSwitch active={r.status === 'ACTIVE'} disabled={!canEdit || busy} onToggle={() => patch(level, [r.id], { status: r.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' })} /></td>
                    <td className="py-3 pr-3 max-w-[220px]">
                      <div className="flex items-center gap-2.5">
                        {tab === 'ads' && (
                          <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0">
                            {r.mediaUrl ? (r.mediaType === 'VIDEO' ? <video src={r.mediaUrl} className="w-full h-full object-cover" muted preload="metadata" /> : // eslint-disable-next-line @next/next/no-img-element
                              <img src={r.mediaUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />) : null}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{r.name}</p>
                          <p className="text-[10px] text-slate-400">{tab === 'ads' ? `${r.adSetName?.split(' · ').pop()} · ${r.format || ''}` : `${r.ads.length} ad${r.ads.length === 1 ? '' : 's'}`}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-3 text-slate-600 dark:text-slate-300 max-w-[260px]">
                      {tab === 'ads' ? (
                        <>
                          <p className="font-semibold truncate">{r.headline}</p>
                          <p className="text-[10px] text-slate-400 truncate">{r.cta} → {r.destinationUrl}</p>
                          {r.sourcePostUrl && <a href={r.sourcePostUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2A6FE0]">Existing post <ExternalLink size={9} /></a>}
                        </>
                      ) : (
                        <>
                          <p className="truncate">{r.audience}</p>
                          <p className="text-[10px] text-slate-400">{r.startTime ? new Date(r.startTime).toLocaleString() : 'Starts now'} → {r.endTime ? new Date(r.endTime).toLocaleString() : 'continuous'}</p>
                        </>
                      )}
                    </td>
                    <td className="py-3 pr-3 text-right tabular-nums font-semibold">{tab === 'ads' ? `$${r.spend.toFixed(2)}` : r.budget !== null ? `$${r.budget}` : 'Campaign budget'}</td>
                    {tab === 'ads' && <td className="py-3 pr-3 text-right tabular-nums">{r.clicks}</td>}
                    <td className="py-3">{canEdit && <RowMenu onEdit={() => openEdit(level, r)} onDuplicate={() => dup(level, r.id)} onDelete={() => del(level, r.id, r.name)} />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-[11px] text-slate-400 mt-3">Edits are saved in Adoracle. Pausing or activating the whole campaign is also sent to {spec.short} when it was created there. Ad sets and ads are managed here until their live push is enabled.</p>
      </div>

      {edit && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60" role="dialog" aria-modal="true">
          <div className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Edit {edit.level === 'campaign' ? spec.levels[0] : edit.level === 'adset' ? spec.levels[1] : 'ad'}</h3>
              <button type="button" onClick={() => setEdit(null)} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"><X size={18} /></button>
            </div>
            <div><span className={lbl}>Name</span><input className={input} value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            {edit.level === 'campaign' && <div><span className={lbl}>Daily budget (USD)</span><input type="number" min={1} className={input} value={form.dailyBudget} onChange={(e) => setForm({ ...form, dailyBudget: e.target.value })} /></div>}
            {edit.level === 'adset' && (
              <>
                <div><span className={lbl}>Budget (USD)</span><input type="number" min={1} className={input} value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="Campaign budget is used" /></div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><span className={lbl}>Start time</span><input type="datetime-local" className={input} value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></div>
                  <div><span className={lbl}>End time</span><input type="datetime-local" className={input} value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></div>
                </div>
              </>
            )}
            {edit.level === 'ad' && (
              <>
                <div><span className={lbl}>Headline</span><input className={input} value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} /></div>
                <div><span className={lbl}>Primary text</span><textarea rows={3} className={input} value={form.primaryText} onChange={(e) => setForm({ ...form, primaryText: e.target.value })} /></div>
                <div><span className={lbl}>Description</span><input className={input} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><span className={lbl}>Button</span><select className={input} value={form.cta} onChange={(e) => setForm({ ...form, cta: e.target.value })}>{Array.from(new Set([form.cta, ...spec.ctas])).map((x) => <option key={x}>{x}</option>)}</select></div>
                  <div><span className={lbl}>Destination link</span><input className={input} value={form.destinationUrl} onChange={(e) => setForm({ ...form, destinationUrl: e.target.value })} /></div>
                </div>
                <div>
                  <span className={lbl}>Photo or video</span>
                  <MediaUploader value={form.mediaUrl ? { url: form.mediaUrl, type: (form.mediaType || 'IMAGE') as 'IMAGE' | 'VIDEO' } : null} onPick={(m) => setForm({ ...form, mediaUrl: m.url, mediaType: m.type })} onClear={() => setForm({ ...form, mediaUrl: '', mediaType: '' })} />
                </div>
              </>
            )}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setEdit(null)} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">Cancel</button>
              <button type="button" disabled={busy} onClick={saveEdit} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#2A6FE0] text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-60 cursor-pointer">{busy && <Loader2 size={13} className="animate-spin" />} Save changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
