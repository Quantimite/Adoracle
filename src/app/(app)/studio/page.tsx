'use client';

import React, { useState } from 'react';
import { CheckCircle2, Send, Video, ArrowRight, Plus, Trash2, ShieldCheck, Sparkles } from 'lucide-react';

// Extracted component to avoid hooks-in-map violation
function PlacementButton({ label, defaultActive }: { label: string; defaultActive: boolean }) {
  const [active, setActive] = useState(defaultActive);
  return (
    <button
      onClick={() => setActive(!active)}
      className={`p-3 rounded-xl border text-sm font-medium transition-all text-left flex items-center justify-between ${
        active
          ? 'bg-blue-50 border-blue-300 text-blue-800'
          : 'bg-white border-slate-200 text-slate-400'
      }`}
    >
      <span>{label}</span>
      <CheckCircle2 className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-slate-300'}`} />
    </button>
  );
}

type Tab = 'meta' | 'tiktok' | 'google' | 'linkedin';

export default function StudioPage() {
  const [tab, setTab] = useState<Tab>('meta');
  const [success, setSuccess] = useState<string | null>(null);

  // Meta state
  const [metaBudget, setMetaBudget] = useState(120);
  const [metaObjective, setMetaObjective] = useState('Sales');
  const [metaCbo, setMetaCbo] = useState(true);

  // TikTok state
  const [ttBudget, setTtBudget] = useState(85);
  const [ttHashtags, setTtHashtags] = useState(['#tiktokmademebuyit', '#trending']);
  const [ttNewTag, setTtNewTag] = useState('');

  // Google state
  const [gBudget, setGBudget] = useState(110);
  const [gFormat, setGFormat] = useState('Search RSA');
  const [gKeywords, setGKeywords] = useState(['"ai ad manager"', '[buy roas optimizer]']);
  const [gNewKw, setGNewKw] = useState('');

  // LinkedIn state
  const [liObjective, setLiObjective] = useState('Lead Gen Forms');
  const [liBudget, setLiBudget] = useState(150);

  const deploy = (platform: string) => {
    setSuccess(`✓ Campaign sent to ${platform}!`);
    setTimeout(() => setSuccess(null), 4000);
  };

  const tabs = [
    { id: 'meta', label: 'Meta & Instagram', color: 'bg-blue-600' },
    { id: 'tiktok', label: 'TikTok', color: 'bg-slate-900' },
    { id: 'google', label: 'Google & YouTube', color: 'bg-green-600' },
    { id: 'linkedin', label: 'LinkedIn', color: 'bg-sky-700' },
  ] as const;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-slate-900">Campaign Studio</h1>
        <p className="text-slate-500 mt-1 text-sm">Build ads for any platform without leaving Adoracle</p>
      </div>

      {/* Success notice */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {success}
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === t.id
                ? `${t.color} text-white shadow-md`
                : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* META TAB */}
      {tab === 'meta' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Objective */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-900 mb-4">Campaign Objective</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['Sales', 'Leads', 'Traffic', 'Awareness'].map(o => (
                  <button
                    key={o}
                    onClick={() => setMetaObjective(o)}
                    className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                      metaObjective === o
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget & structure */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-900 mb-4">Budget & Structure</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between text-sm font-semibold text-slate-700 mb-3">
                    <span>Daily Budget</span>
                    <span className="text-blue-600">${metaBudget}/day</span>
                  </div>
                  <input type="range" min="20" max="1000" step="10" value={metaBudget}
                    onChange={e => setMetaBudget(Number(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-3">Budget Optimization</label>
                  <div className="flex gap-2">
                    {['CBO (Campaign)', 'ABO (Ad Set)'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setMetaCbo(opt.startsWith('CBO'))}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                          (opt.startsWith('CBO') && metaCbo) || (opt.startsWith('ABO') && !metaCbo)
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-500 border-slate-200'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Placements */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-900 mb-4">Placements</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {['Instagram Reels', 'Instagram Feed', 'Facebook Feed', 'Instagram Stories', 'Explore Grid'].map((p, i) => (
                  <PlacementButton key={p} label={p} defaultActive={i < 4} />
                ))}
              </div>
            </div>

            {/* CAPI status */}
            <div className="bg-slate-900 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Conversions API (CAPI) Active</p>
                  <p className="text-xs text-slate-400">Server-to-server events — accurate attribution</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full">Connected</span>
            </div>
          </div>

          {/* Preview */}
          <div>
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sticky top-24">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Ad Preview</h3>
              <div className="rounded-xl overflow-hidden border border-slate-200">
                <div className="p-3 border-b border-slate-100 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold">A</div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Adoracle <span className="text-slate-400 font-normal">· Sponsored</span></p>
                    <p className="text-[10px] text-slate-400">Instagram</p>
                  </div>
                </div>
                <div className="h-40 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <div className="text-center">
                    <Video className="w-8 h-8 text-sky-400 mx-auto mb-2" />
                    <p className="text-xs text-white font-semibold">9:16 Creative Asset</p>
                    <p className="text-[10px] text-slate-400">Reels / Stories</p>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-[10px] text-sky-600 font-semibold">adoracle.com</p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">Stop Wasting 40% of Ad Spend</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">Unified AI-powered ad management across all platforms.</p>
                  <div className="mt-2 py-1.5 rounded-lg bg-blue-600 text-center text-xs font-bold text-white">
                    Start Free Trial →
                  </div>
                </div>
              </div>
              <button
                onClick={() => deploy('Meta Ads')}
                className="mt-4 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-200"
              >
                <Send className="w-4 h-4" />
                Deploy to Meta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TIKTOK TAB */}
      {tab === 'tiktok' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-900 mb-4">Objective</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['Conversions', 'Lead Forms', 'Video Views', 'Reach'].map(o => (
                  <button key={o}
                    className="py-3 rounded-xl text-sm font-semibold border border-slate-200 text-slate-500 hover:border-slate-900 hover:text-slate-900 transition-all">
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <div className="flex justify-between text-sm font-semibold text-slate-700 mb-3">
                <span>Daily Budget</span>
                <span className="text-slate-900">${ttBudget}/day</span>
              </div>
              <input type="range" min="30" max="800" step="5" value={ttBudget}
                onChange={e => setTtBudget(Number(e.target.value))} className="w-full" />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-900 mb-1">Hashtag Targeting</h2>
              <p className="text-sm text-slate-400 mb-4">Add hashtags to reach niche audiences</p>
              <div className="flex gap-2 mb-4">
                <input
                  value={ttNewTag}
                  onChange={e => setTtNewTag(e.target.value)}
                  placeholder="#trending"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
                <button
                  onClick={() => { if (ttNewTag) { setTtHashtags([...ttHashtags, ttNewTag.startsWith('#') ? ttNewTag : '#' + ttNewTag]); setTtNewTag(''); }}}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {ttHashtags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-sm font-medium text-slate-700">
                    {tag}
                    <button onClick={() => setTtHashtags(ttHashtags.filter((_, j) => j !== i))}
                      className="text-slate-400 hover:text-red-500 transition-colors">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sticky top-24">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">TikTok Preview</h3>
              <div className="rounded-xl bg-black aspect-[9/16] flex flex-col justify-between p-4 max-h-72">
                <div className="text-xs text-white font-bold">For You</div>
                <div className="space-y-2">
                  <p className="text-xs text-sky-400 font-bold">@viral_creator</p>
                  <p className="text-[11px] text-slate-200 leading-snug">If you run ads on Meta or TikTok, you NEED this... {ttHashtags.slice(0,2).join(' ')}</p>
                  <div className="p-2 rounded-lg bg-white text-black flex justify-between items-center">
                    <span className="text-[11px] font-bold">Shop Now — Free Trial</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
              <button
                onClick={() => deploy('TikTok')}
                className="mt-4 w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Deploy to TikTok
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GOOGLE TAB */}
      {tab === 'google' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-900 mb-4">Campaign Format</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['Search RSA', 'Performance Max', 'YouTube Shorts', 'Display'].map(f => (
                  <button key={f} onClick={() => setGFormat(f)}
                    className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                      gFormat === f ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <div className="flex justify-between text-sm font-semibold text-slate-700 mb-3">
                <span>Daily Budget</span>
                <span className="text-green-700">${gBudget}/day</span>
              </div>
              <input type="range" min="20" max="1000" step="10" value={gBudget}
                onChange={e => setGBudget(Number(e.target.value))} className="w-full" />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-900 mb-1">Keywords</h2>
              <p className="text-sm text-slate-400 mb-4">Add search terms to target high-intent buyers</p>
              <div className="flex gap-2 mb-4">
                <input value={gNewKw} onChange={e => setGNewKw(e.target.value)}
                  placeholder='"your keyword here"'
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono" />
                <button onClick={() => { if (gNewKw) { setGKeywords([...gKeywords, gNewKw]); setGNewKw(''); }}}
                  className="px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold">
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {gKeywords.map((kw, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-sm font-mono text-slate-800">{kw}</span>
                    <button onClick={() => setGKeywords(gKeywords.filter((_, j) => j !== i))}
                      className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sticky top-24">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Search Ad Preview</h3>
              <div className="p-4 border border-slate-200 rounded-xl space-y-1.5">
                <p className="text-[11px] text-slate-400">Sponsored · adoracle.com</p>
                <p className="text-sm font-bold text-blue-700">Adoracle™ AI Ad Manager | No More Guesswork</p>
                <p className="text-xs text-slate-600">Unify Meta, TikTok & Google from one dashboard. 70/30 AI budget split. Free trial.</p>
                <div className="flex gap-3 text-xs text-blue-700 pt-1 border-t border-slate-100">
                  <span>Pricing</span><span>Live Demo</span><span>Free Trial</span>
                </div>
              </div>
              <button
                onClick={() => deploy('Google Ads')}
                className="mt-4 w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Deploy to Google
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LINKEDIN TAB */}
      {tab === 'linkedin' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-900 mb-4">B2B Objective</h2>
              <div className="grid grid-cols-3 gap-3">
                {['Lead Gen Forms', 'Demo Bookings', 'Thought Leader Ads'].map(o => (
                  <button key={o} onClick={() => setLiObjective(o)}
                    className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                      liObjective === o ? 'bg-sky-700 text-white border-sky-700 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <div className="flex justify-between text-sm font-semibold text-slate-700 mb-3">
                <span>Daily Budget</span>
                <span className="text-sky-700">${liBudget}/day</span>
              </div>
              <input type="range" min="50" max="1000" step="10" value={liBudget}
                onChange={e => setLiBudget(Number(e.target.value))} className="w-full" />

              <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex gap-2">
                <span className="font-bold">⚠️ Note:</span>
                LinkedIn CPMs are $80–$140. Minimum recommended budget is $3,000/month for meaningful reach.
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-900 mb-4">Audience Targeting</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-2">Job Seniority</label>
                  <div className="space-y-2">
                    {['VP & Vice President', 'Director / Head of', 'C-Suite / Partner', 'Founder / Owner'].map(s => (
                      <div key={s} className="flex items-center justify-between p-2.5 rounded-lg bg-sky-50 border border-sky-200">
                        <span className="text-xs font-semibold text-slate-700">{s}</span>
                        <CheckCircle2 className="w-4 h-4 text-sky-600" />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-2">Company Size</label>
                  <div className="space-y-2">
                    {['51–200 employees', '201–500 employees', '500–1,000 employees', '1,000+ Enterprise'].map(s => (
                      <div key={s} className="flex items-center justify-between p-2.5 rounded-lg bg-sky-50 border border-sky-200">
                        <span className="text-xs font-semibold text-slate-700">{s}</span>
                        <CheckCircle2 className="w-4 h-4 text-sky-600" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sticky top-24">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">LinkedIn Feed Preview</h3>
              <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">CEO</div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Alex Rivera · Founder</p>
                    <p className="text-[10px] text-slate-400">Promoted · 1st</p>
                  </div>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Most growth teams are running into CPM traps on LinkedIn without a 70/30 Google + Meta retargeting engine. Here&apos;s the playbook...
                </p>
                <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-900">Download Enterprise Benchmark Report</span>
                  <span className="text-[10px] font-bold bg-sky-700 text-white px-2 py-0.5 rounded">Get</span>
                </div>
              </div>
              <button
                onClick={() => deploy('LinkedIn')}
                className="mt-4 w-full py-3 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Deploy to LinkedIn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
