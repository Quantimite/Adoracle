// src/app/(app)/ai-intelligence/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Send, Bot, User, Zap, TrendingUp, ShieldCheck,
  CheckCircle2, Radar, Flame, RefreshCw, Target, Play, Pause,
  Users, Download, ShieldAlert, Plus, Check, Sliders
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';

const channelEfficiencyData = [
  { name: 'Meta Retarget', roas: 4.8, spend: 2400 },
  { name: 'Google Brand', roas: 6.2, spend: 1800 },
  { name: 'TikTok Spark', roas: 3.1, spend: 3100 },
  { name: 'LinkedIn B2B', roas: 2.4, spend: 1500 },
  { name: 'YouTube Shorts', roas: 3.9, spend: 1200 },
];

const suggestedQuestions = [
  "Why did Meta CPA spike yesterday?",
  "Rebalance $1,000 for maximum ROAS",
  "Audit creative fatigue across all ads",
  "Build high-LTV lookalike audiences"
];

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  actionTag?: string;
  actionApplied?: boolean;
}

interface AutonomousAgent {
  id: string;
  name: string;
  role: string;
  savedThisWeek: string;
  active: boolean;
}

interface AudienceSegment {
  id: string;
  name: string;
  platform: string;
  size: string;
  predictedRoas: string;
  synced: boolean;
}

export default function AIIntelligencePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [toast, setToast] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // 1. Conversational Co-Pilot State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: "Welcome back! I've scanned 14 active campaigns across Meta, Google, and TikTok. Overall ROAS is up +12.4% this week, though 'TikTok_Cold_Scale' is showing early creative fatigue.",
      actionTag: 'Shift $250/day from TikTok Cold to Google Brand',
      actionApplied: false,
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 2. Autonomous Agents Switchboard State
  const [agents, setAgents] = useState<AutonomousAgent[]>([
    {
      id: 'ag-1',
      name: 'Bid Sentinel',
      role: 'Auto-caps CPC spikes > 25% above 7-day avg',
      savedThisWeek: '$420 saved',
      active: true,
    },
    {
      id: 'ag-2',
      name: 'Fatigue Guard',
      role: 'Rotates creatives when frequency exceeds 3.8x',
      savedThisWeek: '+14% CTR',
      active: true,
    },
    {
      id: 'ag-3',
      name: 'Budget Scaler',
      role: 'Pushes +15% spend into ad sets > 3.5x ROAS',
      savedThisWeek: '+$1,180 rev',
      active: false,
    },
  ]);

  // 3. AI Audience Persona & Lookalike Builder State
  const [audiencePrompt, setAudiencePrompt] = useState('');
  const [isBuildingAudience, setIsBuildingAudience] = useState(false);
  const [audiences, setAudiences] = useState<AudienceSegment[]>([
    {
      id: 'aud-1',
      name: 'High-LTV Repeat Buyers (Top 5%)',
      platform: 'Meta Advantage+',
      size: '1.4M Reach',
      predictedRoas: '5.1x',
      synced: true,
    },
    {
      id: 'aud-2',
      name: 'Cart Abandoners — High Intent (7d)',
      platform: 'Google & YouTube',
      size: '320K Reach',
      predictedRoas: '4.6x',
      synced: false,
    },
  ]);

  // 4. Competitor Radar State
  const [scanningCompetitors, setScanningCompetitors] = useState(false);
  const [lastScanTime, setLastScanTime] = useState('12 mins ago');

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const aiReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `Based on live attribution data for "${text}", your highest marginal return is currently in Google Brand Search (6.2x ROAS) and Meta Dynamic Retargeting (4.8x ROAS). Reallocating 18% of underperforming cold traffic will lift net profit by ~$640 over the next 14 days.`,
        actionTag: 'Execute 18% Budget Reallocation Now',
        actionApplied: false,
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 1000);
  };

  const applyChatAction = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, actionApplied: true } : m))
    );
    triggerToast('Campaign reallocation executed on live account');
  };

  const toggleAgent = (id: string) => {
    setAgents((prev) =>
      prev.map((ag) => {
        if (ag.id === id) {
          const next = !ag.active;
          triggerToast(`${ag.name} ${next ? 'activated' : 'paused'}`);
          return { ...ag, active: next };
        }
        return ag;
      })
    );
  };

  const handleGenerateAudience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!audiencePrompt.trim()) return;
    setIsBuildingAudience(true);

    setTimeout(() => {
      setIsBuildingAudience(false);
      const newAud: AudienceSegment = {
        id: `aud-${Date.now()}`,
        name: `AI Cluster: ${audiencePrompt}`,
        platform: 'Cross-Channel Sync',
        size: '890K Reach',
        predictedRoas: '4.4x',
        synced: false,
      };
      setAudiences((prev) => [newAud, ...prev]);
      setAudiencePrompt('');
      triggerToast('New AI audience segment synthesized');
    }, 900);
  };

  const syncAudience = (id: string) => {
    setAudiences((prev) =>
      prev.map((a) => (a.id === id ? { ...a, synced: true } : a))
    );
    triggerToast('Audience pushed to Meta & Google Ads Manager');
  };

  const triggerRadarScan = () => {
    setScanningCompetitors(true);
    setTimeout(() => {
      setScanningCompetitors(false);
      setLastScanTime('Just now');
      triggerToast('Auction & competitor telemetry refreshed');
    }, 1100);
  };

  const exportIntelligenceBrief = () => {
    const reportContent = `ADORACLE AI INTELLIGENCE EXECUTIVE BRIEF
Generated: ${new Date().toLocaleString()}
--------------------------------------------------
1. ACTIVE AUTOPILOT AGENTS: ${agents.filter((a) => a.active).length}/${agents.length}
2. TOP PERFORMING CHANNEL: Google Brand Search (6.2x ROAS)
3. WEEKLY AI GUARD SAVINGS: $1,600
4. RECOMMENDED ACTION: Reallocate 18% from cold TikTok placements into Dynamic Retargeting.
`;
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Adoracle-AI-Brief.txt';
    link.click();
    URL.revokeObjectURL(url);
    triggerToast('AI Executive Brief downloaded');
  };

  return (
    <div className="w-full space-y-6 text-slate-900 dark:text-slate-100 relative">
      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-slate-950" />
          {toast}
        </div>
      )}

      {/* Top Header with Export & Autopilot Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" /> Adoracle Neural Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-0.5">
            AI Intelligence Hub
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={exportIntelligenceBrief}
            className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Export AI Brief
          </button>

          <div className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold flex items-center gap-2 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-slate-600 dark:text-slate-300">Autopilot:</span>
            <span className="text-emerald-600 dark:text-emerald-400">
              {agents.filter((a) => a.active).length}/{agents.length} Active
            </span>
          </div>
        </div>
      </div>

      {/* BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* BENTO TILE 1: Conversational AI Co-Pilot (7 Columns) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-2xs min-h-[460px]">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Adoracle Strategy Co-Pilot
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ask questions, audit ROAS, or trigger live campaign changes
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Neural RAG v2.4
            </span>
          </div>

          {/* Chat Feed */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 max-h-[270px] pr-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${msg.sender === 'ai'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                >
                  {msg.sender === 'ai' ? <Sparkles className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`max-w-[82%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2.5 ${msg.sender === 'ai'
                      ? 'bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                      : 'bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 font-medium'
                    }`}
                >
                  <p>{msg.text}</p>

                  {msg.actionTag && (
                    <div className="pt-1">
                      {msg.actionApplied ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Optimization Executed
                        </span>
                      ) : (
                        <button
                          onClick={() => applyChatAction(msg.id)}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl transition-colors shadow-2xs cursor-pointer"
                        >
                          <Zap className="w-3 h-3" /> {msg.actionTag}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 pl-10">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                Analyzing live campaign vectors...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompt Chips & Input Box */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(q)}
                  className="whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(chatInput);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask AI Co-Pilot to analyze spend, forecast ROAS, or pause weak ads..."
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shrink-0 cursor-pointer"
                aria-label="Send prompt"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* BENTO TILE 2: Autonomous AI Agents Switchboard (5 Columns) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-2xs">
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Autonomous AI Agents
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                24/7 background guardrails protecting your ad spend
              </p>
            </div>

            <div className="space-y-3">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className={`p-4 rounded-2xl border transition-all ${agent.active
                      ? 'bg-slate-50 dark:bg-slate-950 border-emerald-500/30'
                      : 'bg-slate-50/50 dark:bg-slate-950/50 border-slate-200/60 dark:border-slate-800/60 opacity-75'
                    }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${agent.active ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                      />
                      <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {agent.name}
                      </h3>
                    </div>

                    <button
                      onClick={() => toggleAgent(agent.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer ${agent.active
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                    >
                      {agent.active ? (
                        <>
                          <Pause className="w-2.5 h-2.5" /> Running
                        </>
                      ) : (
                        <>
                          <Play className="w-2.5 h-2.5" /> Paused
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                    {agent.role}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">7-Day Impact</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      {agent.savedThisWeek}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-2xl bg-purple-500/5 border border-purple-500/20 flex items-center justify-between text-xs">
            <span className="font-semibold text-purple-900 dark:text-purple-200">
              Total AI Guard Savings
            </span>
            <span className="font-black text-purple-600 dark:text-purple-400">$1,600 / wk</span>
          </div>
        </div>

        {/* BENTO TILE 3: AI Audience Persona & Lookalike Builder (6 Columns) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xs">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> AI Audience & Lookalike Synthesizer
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Describe your ideal buyer to generate predictive targeting cohorts
            </p>
          </div>

          <form onSubmit={handleGenerateAudience} className="flex items-center gap-2">
            <input
              type="text"
              value={audiencePrompt}
              onChange={(e) => setAudiencePrompt(e.target.value)}
              placeholder="e.g., SaaS founders scaling DTC brands in US & UK..."
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={isBuildingAudience}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              {isBuildingAudience ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Build
            </button>
          </form>

          <div className="space-y-2.5">
            {audiences.map((aud) => (
              <div
                key={aud.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {aud.name}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{aud.platform}</span>
                    <span>•</span>
                    <span>{aud.size}</span>
                    <span>•</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      Est. {aud.predictedRoas}
                    </span>
                  </div>
                </div>

                {aud.synced ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg shrink-0">
                    <Check className="w-3 h-3" /> Synced
                  </span>
                ) : (
                  <button
                    onClick={() => syncAudience(aud.id)}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-[11px] font-bold text-slate-800 dark:text-slate-200 shrink-0 transition-colors cursor-pointer"
                  >
                    Push to Ads
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* BENTO TILE 4: Channel ROAS Efficiency Bar Chart (6 Columns) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> AI-Attributed Channel ROAS
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Multi-touch neural attribution across active ad networks
              </p>
            </div>
            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl">
              4.08x Avg
            </span>
          </div>

          <div className="h-52 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelEfficiencyData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={95}
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="roas" name="ROAS (x)" radius={[0, 8, 8, 0]} barSize={18}>
                    {channelEfficiencyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.roas >= 4.5 ? '#10b981' : entry.roas >= 3.0 ? '#8b5cf6' : '#f59e0b'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Loading attribution bars...
              </div>
            )}
          </div>
        </div>

        {/* BENTO TILE 5: Live Market & Competitor Signal Radar (7 Columns) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-2xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Radar className="w-4 h-4 text-amber-500" /> Market & Competitor Pulse
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Real-time auction CPM shifts & competitor creative launches • Updated {lastScanTime}
                </p>
              </div>
              <button
                onClick={triggerRadarScan}
                disabled={scanningCompetitors}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${scanningCompetitors ? 'animate-spin' : ''}`} />
                {scanningCompetitors ? 'Scanning' : 'Rescan'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400">
                    Auction Alert
                  </span>
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Meta CPMs dropped 11% in US East
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Window open for low-cost prospecting scale over next 18h.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-purple-600 dark:text-purple-400">
                    Creative Trend
                  </span>
                  <Target className="w-3.5 h-3.5 text-purple-500" />
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  UGC Comparison Hooks +28% CTR
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Top competitors shifted 60% of TikTok spend to split-screen demos.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Next automated auction sync in <strong className="text-slate-800 dark:text-slate-200">04:12</strong>
            </span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
              All Feeds Healthy <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* BENTO TILE 6: AI Fraud & Anomaly Shield Log (5 Columns) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-2xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" /> AI Fraud & Anomaly Shield
              </h3>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Active
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">412 Bot Clicks Filtered</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Google Search Display Network</p>
                </div>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">+$185</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Duplicate Pixel Event Blocked</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Meta CAPI Checkout Deduplication</p>
                </div>
                <span className="font-extrabold text-purple-600 dark:text-purple-400">99.8% Acc</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Zero unguarded spend leaks detected</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">24/7 Protection</span>
          </div>
        </div>
      </div>
    </div>
  );
}