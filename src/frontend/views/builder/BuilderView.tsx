'use client';

import React, { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Rocket, Loader2, AlertTriangle, CheckCircle2, Clock, Plug, Info, X } from 'lucide-react';
import { CreativePicker } from '@/frontend/components/media/CreativePicker';
import { PlatformBadge } from '@/frontend/components/common/PlatformBadge';
import { ALL_PLATFORMS, DEFAULT_SPLIT_WEIGHTS, OBJECTIVES, PlatformId, SPECS } from '@/shared/adspec';
import { BuilderConfig, buildBlueprints, normalizeSplit } from '@/shared/blueprint';
import { useConnections, isPlatformConnected } from '@/frontend/hooks/useConnections';

const STEPS = ['Platforms', 'Campaign', 'Ad set', 'Ad', 'Review & launch'];
const pad = (n: number) => String(n).padStart(2, '0');
// local date-time for <input type="datetime-local"> (YYYY-MM-DDTHH:mm)
const localDT = (offsetDays = 0, hour?: number) => {
  const d = new Date(Date.now() + offsetDays * 864e5);
  if (hour !== undefined) d.setHours(hour, 0, 0, 0);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const input =
  'w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#2A6FE0] focus:bg-white dark:focus:bg-slate-900';
const label = 'block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5';
const card = 'rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5';

function Field({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <span className={label}>{title}</span>
      {children}
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

function Pills<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { id: T; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            value === o.id ? 'bg-[#153E9E] text-white border-[#153E9E]' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#1E57D0]'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function TagInput({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [text, setText] = useState('');
  const add = () => {
    const t = text.trim();
    if (t && !values.includes(t)) onChange([...values, t]);
    setText('');
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E6F1FF] text-[#153E9E] text-[11px] font-bold">
            {v}
            <button type="button" aria-label={`Remove ${v}`} onClick={() => onChange(values.filter((x) => x !== v))} className="cursor-pointer">
              <X size={11} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className={input}
          value={text}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" onClick={add} className="px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold cursor-pointer">
          Add
        </button>
      </div>
    </div>
  );
}

function initialConfig(pre: PlatformId[]): BuilderConfig {
  const platforms = pre.length ? pre : (['META', 'TIKTOK', 'GOOGLE'] as PlatformId[]);
  return {
    platforms,
    setupMode: 'unified',
    campaign: { name: '', objective: 'SALES', campaignTypes: {}, budgetStrategy: 'campaign', specialCategory: 'None', launchStatus: 'PAUSED' },
    adSet: {
      plan: 'single',
      conversionLocation: 'website',
      conversionEvent: 'Purchase',
      audienceMode: 'advantage',
      locations: ['Sri Lanka'],
      ageMin: 18,
      ageMax: 55,
      gender: 'all',
      languages: ['English'],
      interests: [],
      excludeBuyers: true,
      placementMode: 'auto',
      placements: {},
      budgetType: 'daily',
      totalBudget: 100,
      startTime: localDT(1, 9),
      endTime: localDT(31, 23),
      noEnd: false,
      bidStrategy: {},
      costCap: 25,
      attribution: '7-day click, 1-day view',
    },
    ad: { name: '', format: {}, mediaUrl: '', mediaType: '', sourcePost: null, primaryText: '', headline: '', description: '', cta: 'Learn more', destinationUrl: '', utm: true },
    split: Object.fromEntries(platforms.map((p) => [p, DEFAULT_SPLIT_WEIGHTS[p]])) as BuilderConfig['split'],
    overrides: {},
  };
}

function BuilderContent() {
  const params = useSearchParams();
  const pre = useMemo(() => {
    const raw = [params.get('platform'), ...(params.get('platforms') || '').split(',')].filter(Boolean).map((x) => String(x).toUpperCase());
    return ALL_PLATFORMS.filter((p) => raw.includes(p));
  }, [params]);

  const [cfg, setCfg] = useState<BuilderConfig>(() => initialConfig(pre));
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [launching, setLaunching] = useState(false);
  const [results, setResults] = useState<{ platform: PlatformId; status: string; message: string; steps?: string[] }[] | null>(null);
  const { connections } = useConnections();

  const upd = (fn: (c: BuilderConfig) => void) =>
    setCfg((c) => {
      const next = structuredClone(c);
      fn(next);
      return next;
    });

  const togglePlatform = (p: PlatformId) =>
    upd((c) => {
      if (c.platforms.includes(p)) c.platforms = c.platforms.filter((x) => x !== p);
      else {
        c.platforms = [...c.platforms, p];
        c.split[p] = DEFAULT_SPLIT_WEIGHTS[p];
      }
    });

  const blueprints = useMemo(() => buildBlueprints(cfg), [cfg]);
  const split = normalizeSplit(cfg.platforms, cfg.split);

  const validate = (s: number): string => {
    if (s === 0 && !cfg.platforms.length) return 'Pick at least one platform.';
    if (s === 1 && !cfg.campaign.name.trim()) return 'Give your campaign a name.';
    if (s === 2) {
      if (!(cfg.adSet.totalBudget > 0)) return 'Enter a budget greater than zero.';
      if (cfg.adSet.ageMin > cfg.adSet.ageMax) return 'Minimum age must be below maximum age.';
      if (!cfg.adSet.startTime) return 'Choose a start date and time.';
      if (!cfg.adSet.noEnd && cfg.adSet.endTime <= cfg.adSet.startTime) return 'The end time must be after the start time.';
    }
    if (s === 3) {
      if (!cfg.ad.headline.trim() || !cfg.ad.primaryText.trim()) return 'Add a headline and primary text.';
      if (!/^https?:\/\//i.test(cfg.ad.destinationUrl)) return 'Destination URL must start with https://';
    }
    return '';
  };

  const next = () => {
    const e = validate(step);
    setError(e);
    if (!e) setStep((s) => Math.min(4, s + 1));
  };

  const launch = async () => {
    for (let i = 0; i < 4; i++) {
      const e = validate(i);
      if (e) {
        setError(e);
        setStep(i);
        return;
      }
    }
    setLaunching(true);
    setError('');
    try {
      const res = await fetch('/api/campaigns/launch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ config: { ...cfg, adSet: { ...cfg.adSet, startTime: new Date(cfg.adSet.startTime).toISOString(), endTime: cfg.adSet.endTime ? new Date(cfg.adSet.endTime).toISOString() : '' } } }) });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Launch failed.');
      else setResults(data.results);
    } catch {
      setError('Could not reach the server.');
    }
    setLaunching(false);
  };

  if (results) {
    return (
      <div className="max-w-2xl space-y-4 pb-10">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Campaign submitted</h1>
        <div className="space-y-2.5">
          {results.map((r) => (
            <div key={r.platform} className={`${card} flex items-start gap-3`}>
              <PlatformBadge id={r.platform} size={36} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {SPECS[r.platform].short}
                  {r.status === 'PUSHED' && <span className="inline-flex items-center gap-1 text-[11px] text-blue-700"><CheckCircle2 size={12} /> Created</span>}
                  {r.status === 'QUEUED' && <span className="inline-flex items-center gap-1 text-[11px] text-amber-700"><Clock size={12} /> Saved as draft</span>}
                  {r.status === 'FAILED' && <span className="inline-flex items-center gap-1 text-[11px] text-rose-700"><AlertTriangle size={12} /> Failed</span>}
                  {r.status === 'SKIPPED' && <span className="text-[11px] text-slate-500">Skipped</span>}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{r.message}</p>
                {r.steps && r.steps.length > 0 && <ul className="mt-1.5 space-y-0.5">{r.steps.map((st) => <li key={st} className="text-[11px] text-slate-400">✓ {st}</li>)}</ul>}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/platforms" className="px-5 py-2.5 rounded-xl bg-[#153E9E] text-white text-xs font-bold">Manage platforms</Link>
          <Link href="/campaigns" className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200">All campaigns</Link>
          <button type="button" onClick={() => { setResults(null); setStep(0); setCfg(initialConfig(pre)); }} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
            Build another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Campaign Builder</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Set up once using the same three levels as Meta Ads Manager (Campaign › Ad set › Ad). Adoracle translates it for every platform.
        </p>
      </div>

      {/* Stepper */}
      <ol className="flex gap-2 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <li key={s} className="shrink-0">
            <button
              type="button"
              onClick={() => i <= step && setStep(i)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold border transition-all ${
                i === step ? 'bg-[#153E9E] text-white border-[#153E9E]' : i < step ? 'bg-[#E6F1FF] text-[#153E9E] border-[#BBD9FF] cursor-pointer' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">{i < step ? <Check size={11} /> : i + 1}</span>
              {s}
            </button>
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }} className="space-y-4">
          {/* STEP 0 */}
          {step === 0 && (
            <>
              <div className={card}>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">Where do you want to advertise?</h2>
                <p className="text-xs text-slate-500 mb-4">Pick one platform, or select several to create them all from this single setup.</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {ALL_PLATFORMS.map((p) => {
                    const on = cfg.platforms.includes(p);
                    const connected = isPlatformConnected(connections, p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePlatform(p)}
                        className={`text-left flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          on ? 'border-[#2A6FE0] bg-[#E6F1FF]/60 dark:bg-blue-950/30' : 'border-slate-200 dark:border-slate-800 hover:border-[#1E57D0]'
                        }`}
                      >
                        <PlatformBadge id={p} size={40} />
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-extrabold text-slate-900 dark:text-white">{SPECS[p].name}</span>
                          <span className="block text-[11px] text-slate-500">{SPECS[p].levels.join(' › ')}</span>
                          <span className={`inline-block mt-1 text-[10px] font-bold ${connected ? 'text-blue-700' : 'text-slate-400'}`}>{connected ? '● Connected' : '○ Not connected (will save as draft)'}</span>
                        </span>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center ${on ? 'bg-[#2A6FE0] text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>{on && <Check size={14} />}</span>
                      </button>
                    );
                  })}
                </div>
                <Link href="/settings?section=connections" className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-[#2A6FE0] hover:underline">
                  <Plug size={13} /> Connect more accounts
                </Link>
              </div>
            </>
          )}

          {/* STEP 1: CAMPAIGN LEVEL */}
          {step === 1 && (
            <div className={`${card} space-y-5`}>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Campaign level</h2>
                <p className="text-xs text-slate-500">The goal, the budget strategy and the rules that apply to everything below.</p>
              </div>
              <Field title="Campaign name">
                <input className={input} value={cfg.campaign.name} onChange={(e) => upd((c) => (c.campaign.name = e.target.value))} placeholder="Winter sale 2026" />
              </Field>
              <Field title="Objective" hint="Each platform gets its closest native objective (shown on the review step).">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {OBJECTIVES.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => upd((c) => (c.campaign.objective = o.id))}
                      className={`text-left p-3.5 rounded-xl border-2 transition-all cursor-pointer ${cfg.campaign.objective === o.id ? 'border-[#2A6FE0] bg-[#E6F1FF]/60 dark:bg-blue-950/30' : 'border-slate-200 dark:border-slate-800 hover:border-[#1E57D0]'}`}
                    >
                      <span className="block text-xs font-extrabold text-slate-900 dark:text-white">{o.label}</span>
                      <span className="block text-[11px] text-slate-500 mt-0.5">{o.desc}</span>
                    </button>
                  ))}
                </div>
              </Field>
              <Field title="Budget strategy" hint="Campaign budget lets the platform move money between ad sets automatically (Advantage+ campaign budget on Meta). LinkedIn always budgets per campaign.">
                <Pills
                  value={cfg.campaign.budgetStrategy}
                  onChange={(v) => upd((c) => (c.campaign.budgetStrategy = v))}
                  options={[{ id: 'campaign', label: 'Campaign budget (automatic split)' }, { id: 'adset', label: 'Ad set budgets (manual control)' }]}
                />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field title="Special ad category" hint="Required by Meta and Google for credit, jobs, housing and political ads.">
                  <select className={input} value={cfg.campaign.specialCategory} onChange={(e) => upd((c) => (c.campaign.specialCategory = e.target.value))}>
                    {SPECS.META.specialCategories.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field title="Status after creating" hint="Paused is safest: nothing spends until you review it.">
                  <Pills value={cfg.campaign.launchStatus} onChange={(v) => upd((c) => (c.campaign.launchStatus = v))} options={[{ id: 'PAUSED', label: 'Paused (recommended)' }, { id: 'ACTIVE', label: 'Active' }]} />
                </Field>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className={label}>Campaign type per platform</span>
                <div className="grid sm:grid-cols-2 gap-3">
                  {cfg.platforms.map((p) => (
                    <div key={p} className="flex items-center gap-2.5">
                      <PlatformBadge id={p} size={28} />
                      <select className={input} value={cfg.campaign.campaignTypes[p] || SPECS[p].campaignTypes[0].id} onChange={(e) => upd((c) => (c.campaign.campaignTypes[p] = e.target.value))}>
                        {SPECS[p].campaignTypes.map((t) => <option key={t.id} value={t.id}>{t.label}{t.hint ? ` — ${t.hint}` : ''}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: AD SET LEVEL */}
          {step === 2 && (
            <div className="space-y-4">
              <div className={`${card} space-y-5`}>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Ad set level · Audience</h2>
                  <p className="text-xs text-slate-500">Who sees it. Ad groups on TikTok / YouTube and campaigns on LinkedIn use the same answers.</p>
                </div>
                <Field title="Audience controls">
                  <Pills value={cfg.adSet.audienceMode} onChange={(v) => upd((c) => (c.adSet.audienceMode = v))} options={[{ id: 'advantage', label: 'Automated (Advantage+ / Smart targeting)' }, { id: 'manual', label: 'Manual targeting' }]} />
                </Field>
                <Field title="Locations"><TagInput values={cfg.adSet.locations} onChange={(v) => upd((c) => (c.adSet.locations = v))} placeholder="Add a country or city, press Enter" /></Field>
                {cfg.adSet.audienceMode === 'manual' && (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <Field title="Min age"><input type="number" min={13} max={65} className={input} value={cfg.adSet.ageMin} onChange={(e) => upd((c) => (c.adSet.ageMin = Number(e.target.value)))} /></Field>
                      <Field title="Max age"><input type="number" min={13} max={65} className={input} value={cfg.adSet.ageMax} onChange={(e) => upd((c) => (c.adSet.ageMax = Number(e.target.value)))} /></Field>
                      <Field title="Gender">
                        <select className={input} value={cfg.adSet.gender} onChange={(e) => upd((c) => (c.adSet.gender = e.target.value as any))}>
                          <option value="all">All</option><option value="women">Women</option><option value="men">Men</option>
                        </select>
                      </Field>
                    </div>
                    <Field title="Interests & keywords"><TagInput values={cfg.adSet.interests} onChange={(v) => upd((c) => (c.adSet.interests = v))} placeholder="e.g. fashion, online shopping" /></Field>
                    <Field title="Languages"><TagInput values={cfg.adSet.languages} onChange={(v) => upd((c) => (c.adSet.languages = v))} placeholder="Add a language" /></Field>
                  </>
                )}
                <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                  <input type="checkbox" checked={cfg.adSet.excludeBuyers} onChange={(e) => upd((c) => (c.adSet.excludeBuyers = e.target.checked))} className="accent-[#2A6FE0] w-4 h-4" />
                  Exclude existing customers (where the platform supports it)
                </label>
                <Field title="How many ad sets to create?" hint="“Test 3” splits the budget across different audience angles per platform so you can see what wins.">
                  <Pills value={cfg.adSet.plan} onChange={(v) => upd((c) => (c.adSet.plan = v))} options={[{ id: 'single', label: '1 ad set per platform' }, { id: 'test', label: 'Test 3 audience angles' }]} />
                </Field>
              </div>

              <div className={`${card} space-y-5`}>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Ad set level · Placements</h2>
                  <p className="text-xs text-slate-500">Where ads appear.</p>
                </div>
                <Pills value={cfg.adSet.placementMode} onChange={(v) => upd((c) => (c.adSet.placementMode = v))} options={[{ id: 'auto', label: 'Automatic placements (recommended)' }, { id: 'manual', label: 'Choose placements' }]} />
                {cfg.adSet.placementMode === 'manual' &&
                  cfg.platforms.map((p) => (
                    <div key={p}>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">{SPECS[p].short}</p>
                      <div className="flex flex-wrap gap-2">
                        {SPECS[p].placements.map((pl) => {
                          const list = cfg.adSet.placements[p] ?? SPECS[p].placements.map((x) => x.id);
                          const on = list.includes(pl.id);
                          return (
                            <button key={pl.id} type="button" onClick={() => upd((c) => (c.adSet.placements[p] = on ? list.filter((x) => x !== pl.id) : [...list, pl.id]))}
                              className={`px-3 py-1.5 rounded-full text-[11px] font-bold border cursor-pointer ${on ? 'bg-[#2A6FE0] text-white border-[#2A6FE0]' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700'}`}>
                              {pl.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>

              <div className={`${card} space-y-5`}>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Ad set level · Budget, schedule & optimization</h2>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Field title="Budget type">
                    <select className={input} value={cfg.adSet.budgetType} onChange={(e) => upd((c) => (c.adSet.budgetType = e.target.value as any))}>
                      <option value="daily">Daily budget</option><option value="lifetime">Lifetime budget</option>
                    </select>
                  </Field>
                  <Field title={`Total ${cfg.adSet.budgetType} budget (USD)`} hint="Shared across all selected platforms.">
                    <input type="number" min={1} className={input} value={cfg.adSet.totalBudget} onChange={(e) => upd((c) => (c.adSet.totalBudget = Number(e.target.value)))} />
                  </Field>
                  <Field title="Attribution window">
                    <select className={input} value={cfg.adSet.attribution} onChange={(e) => upd((c) => (c.adSet.attribution = e.target.value))}>
                      {['7-day click, 1-day view', '1-day click', '7-day click', '28-day click'].map((a) => <option key={a}>{a}</option>)}
                    </select>
                  </Field>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Field title="Start date & time"><input type="datetime-local" className={input} value={cfg.adSet.startTime} onChange={(e) => upd((c) => (c.adSet.startTime = e.target.value))} /></Field>
                  <Field title="End date & time">
                    <input type="datetime-local" disabled={cfg.adSet.noEnd} className={`${input} disabled:opacity-50`} value={cfg.adSet.endTime} onChange={(e) => upd((c) => (c.adSet.endTime = e.target.value))} />
                  </Field>
                  <label className="flex items-end pb-2.5 gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                    <input type="checkbox" checked={cfg.adSet.noEnd} onChange={(e) => upd((c) => (c.adSet.noEnd = e.target.checked))} className="accent-[#2A6FE0] w-4 h-4" /> Run continuously
                  </label>
                </div>
                <p className="text-[11px] text-slate-400 -mt-2">Times use your computer’s time zone. Platforms may show them in the ad account’s time zone.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field title="Conversion location" hint="Where the result happens. Choose None if you only want reach or clicks.">
                    <select className={input} value={cfg.adSet.conversionLocation} onChange={(e) => upd((c) => { c.adSet.conversionLocation = e.target.value; if (e.target.value === 'none') c.adSet.conversionEvent = 'none'; })}>
                      <option value="none">None</option>
                      {SPECS.META.conversionLocations.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                  </Field>
                  <Field title="Conversion event (pixel / tag)" hint={cfg.adSet.conversionEvent === 'none' ? 'No tracking: the platform optimizes for clicks or reach.' : 'Needs the platform pixel on your website.'}>
                    <select className={input} value={cfg.adSet.conversionEvent} disabled={cfg.adSet.conversionLocation === 'none'} onChange={(e) => upd((c) => (c.adSet.conversionEvent = e.target.value))}>
                      <option value="none">None</option>
                      {['Purchase', 'Lead', 'Add to cart', 'Initiate checkout', 'Complete registration', 'Contact', 'View content'].map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </Field>
                </div>
                <div>
                  <span className={label}>Bid strategy per platform</span>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {cfg.platforms.map((p) => (
                      <div key={p} className="flex items-center gap-2.5">
                        <PlatformBadge id={p} size={28} />
                        <select className={input} value={cfg.adSet.bidStrategy[p] || SPECS[p].bidStrategies[0].id} onChange={(e) => upd((c) => (c.adSet.bidStrategy[p] = e.target.value))}>
                          {SPECS[p].bidStrategies.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: AD LEVEL */}
          {step === 3 && (
            <div className={`${card} space-y-5`}>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Ad level · Creative</h2>
                <p className="text-xs text-slate-500">What people actually see. You can adjust the wording per platform on the next step.</p>
              </div>
              <Field title="Ad name"><input className={input} value={cfg.ad.name} onChange={(e) => upd((c) => (c.ad.name = e.target.value))} placeholder={cfg.campaign.name ? `${cfg.campaign.name} · Ad 1` : 'Ad 1'} /></Field>
              <div>
                <span className={label}>Creative (what people see)</span>
                <CreativePicker
                  value={{ mediaUrl: cfg.ad.mediaUrl, mediaType: cfg.ad.mediaType, sourcePost: cfg.ad.sourcePost }}
                  onChange={(v, text) => upd((c) => { c.ad.mediaUrl = v.mediaUrl; c.ad.mediaType = v.mediaType; c.ad.sourcePost = v.sourcePost; if (text && !c.ad.primaryText.trim()) c.ad.primaryText = text.slice(0, 500); })}
                />
              </div>
              <Field title="Headline"><input className={input} value={cfg.ad.headline} onChange={(e) => upd((c) => (c.ad.headline = e.target.value))} placeholder="Free shipping this week" /></Field>
              <Field title="Primary text"><textarea rows={3} className={input} value={cfg.ad.primaryText} onChange={(e) => upd((c) => (c.ad.primaryText = e.target.value))} placeholder="Tell people why they should click…" /></Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field title="Description (optional)"><input className={input} value={cfg.ad.description} onChange={(e) => upd((c) => (c.ad.description = e.target.value))} /></Field>
                <Field title="Call to action">
                  <select className={input} value={cfg.ad.cta} onChange={(e) => upd((c) => (c.ad.cta = e.target.value))}>
                    {SPECS.META.ctas.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
              <Field title="Destination URL"><input className={input} value={cfg.ad.destinationUrl} onChange={(e) => upd((c) => (c.ad.destinationUrl = e.target.value))} placeholder="https://yourstore.com/offer" /></Field>
              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                <input type="checkbox" checked={cfg.ad.utm} onChange={(e) => upd((c) => (c.ad.utm = e.target.checked))} className="accent-[#2A6FE0] w-4 h-4" />
                Add UTM tracking (source, medium, campaign) so each platform shows up separately in Google Analytics
              </label>
              <div>
                <span className={label}>Ad format per platform</span>
                <div className="grid sm:grid-cols-2 gap-3">
                  {cfg.platforms.map((p) => (
                    <div key={p} className="flex items-center gap-2.5">
                      <PlatformBadge id={p} size={28} />
                      <select className={input} value={cfg.ad.format[p] || SPECS[p].formats[0].id} onChange={(e) => upd((c) => (c.ad.format[p] = e.target.value))}>
                        {SPECS[p].formats.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW */}
          {step === 4 && (
            <div className="space-y-4">
              <div className={card}>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">Budget split</h2>
                <p className="text-xs text-slate-500 mb-4">
                  ${cfg.adSet.totalBudget} {cfg.adSet.budgetType} shared across {cfg.platforms.length} platform{cfg.platforms.length > 1 ? 's' : ''}. Drag to rebalance.
                </p>
                <div className="space-y-3">
                  {cfg.platforms.map((p) => (
                    <div key={p} className="flex items-center gap-3">
                      <PlatformBadge id={p} size={28} />
                      <span className="w-16 text-xs font-bold text-slate-700 dark:text-slate-200">{SPECS[p].short}</span>
                      <input type="range" min={0} max={100} value={cfg.split[p] ?? 0} onChange={(e) => upd((c) => (c.split[p] = Number(e.target.value)))} className="flex-1 accent-[#2A6FE0]" />
                      <span className="w-24 text-right text-xs font-bold tabular-nums text-slate-900 dark:text-white">
                        {split[p]?.toFixed(0)}% · ${((cfg.adSet.totalBudget * (split[p] || 0)) / 100).toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {blueprints.map((bp) => {
                const ov = cfg.overrides[bp.platform] || {};
                const spec = SPECS[bp.platform];
                return (
                  <div key={bp.platform} className={card}>
                    <div className="flex items-center gap-3 mb-3">
                      <PlatformBadge id={bp.platform} size={34} />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{spec.name}</h3>
                        <p className="text-[11px] text-slate-500">{bp.managerName} · ${bp.platformBudget} {cfg.adSet.budgetType}</p>
                      </div>
                      {!isPlatformConnected(connections, bp.platform) && <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Will save as draft</span>}
                    </div>

                    <div className="text-xs space-y-2 bg-slate-50 dark:bg-slate-950 rounded-xl p-3.5 border border-slate-200/60 dark:border-slate-800">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {bp.levels[0]}: {bp.campaign.name}
                        <span className="font-medium text-slate-500"> · {bp.campaign.type} · {bp.campaign.nativeObjective ?? 'Objective not available'}{bp.campaign.budget !== null ? ` · $${bp.campaign.budget} ${bp.campaign.budgetType}` : ''}</span>
                      </p>
                      {bp.adSets.map((as) => (
                        <div key={as.name} className="ml-3 pl-3 border-l-2 border-[#BBD9FF] space-y-0.5">
                          <p className="font-semibold text-slate-800 dark:text-slate-100">{bp.levels[1]}: {as.name.split(' · ').pop()}{as.budget !== null ? ` · $${as.budget}` : ''}</p>
                          <p className="text-slate-500">{as.audience}</p>
                          <p className="text-slate-500">Runs {as.startTime.replace('T', ' ')} → {as.endTime ? as.endTime.replace('T', ' ') : 'continuously'}</p>
                          <p className="text-slate-500">{as.placements.slice(0, 4).join(', ')}{as.placements.length > 4 ? '…' : ''} · {as.bidStrategy} · {as.optimization}</p>
                          {as.ads.map((ad) => (
                            <p key={ad.name} className="ml-3 text-slate-500">↳ {bp.levels[2]}: “{ad.headline}” · {ad.format} · {ad.cta}</p>
                          ))}
                        </div>
                      ))}
                    </div>

                    <details className="mt-3 group">
                      <summary className="text-xs font-bold text-[#2A6FE0] cursor-pointer select-none">Adjust wording for {spec.short} only</summary>
                      <div className="grid sm:grid-cols-2 gap-3 mt-3">
                        <Field title={`Headline (max ${spec.limits.headline})`}>
                          <input className={input} value={ov.headline ?? cfg.ad.headline} onChange={(e) => upd((c) => (c.overrides[bp.platform] = { ...c.overrides[bp.platform], headline: e.target.value }))} />
                        </Field>
                        <Field title={`Primary text (max ${spec.limits.primary})`}>
                          <input className={input} value={ov.primaryText ?? cfg.ad.primaryText} onChange={(e) => upd((c) => (c.overrides[bp.platform] = { ...c.overrides[bp.platform], primaryText: e.target.value }))} />
                        </Field>
                      </div>
                    </details>

                    {[...bp.warnings, ...Array.from(new Set(bp.adSets.flatMap((a) => a.ads.flatMap((x) => x.warnings))))].map((w) => (
                      <p key={w} className="flex items-start gap-1.5 text-[11px] text-amber-800 mt-2"><AlertTriangle size={12} className="mt-0.5 shrink-0" /> {w}</p>
                    ))}
                  </div>
                );
              })}

              <p className="flex items-start gap-2 text-[11px] text-slate-500">
                <Info size={13} className="mt-0.5 shrink-0" />
                Connected Meta and TikTok accounts get the campaign created (paused). Ad sets and ads are stored here, and platforms without a connection are saved as drafts you can push later.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {error && (
        <p className="flex items-center gap-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5">
          <AlertTriangle size={14} /> {error}
        </p>
      )}

      <div className="flex items-center justify-between pt-2">
        <button type="button" disabled={step === 0} onClick={() => { setError(''); setStep((s) => s - 1); }} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 disabled:opacity-40 cursor-pointer">
          <ChevronLeft size={14} /> Back
        </button>
        {step < 4 ? (
          <button type="button" onClick={next} className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#153E9E] text-white text-xs font-bold hover:brightness-110 transition-all cursor-pointer">
            Continue <ChevronRight size={14} />
          </button>
        ) : (
          <button type="button" onClick={launch} disabled={launching} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#153E9E] to-[#2F7DEB] text-white text-xs font-bold shadow-md hover:brightness-110 transition-all disabled:opacity-60 cursor-pointer">
            {launching ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />} Create on {cfg.platforms.length} platform{cfg.platforms.length > 1 ? 's' : ''}
          </button>
        )}
      </div>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500">Loading builder…</div>}>
      <BuilderContent />
    </Suspense>
  );
}
