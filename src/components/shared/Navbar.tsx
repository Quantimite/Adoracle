'use client';

import React from 'react';
import { useMode } from './ModeContext';
import { 
  Bell, 
  HelpCircle, 
  Sparkles, 
  ToggleLeft, 
  ToggleRight, 
  ShieldAlert, 
  CheckCircle2, 
  Wallet,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

export const Navbar: React.FC = () => {
  const { mode, toggleMode } = useMode();

  return (
    <header className="h-16 bg-obsidian border-b border-slate-800 fixed top-0 right-0 left-64 z-30 flex items-center justify-between px-8 text-white select-none">
      {/* Left: Mode Description & Quick Status */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Current Intelligence Mode:</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold">
            {mode === 'plain' ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-sky-300">Plain Language Mode</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span className="text-purple-300">Expert Performance Mode</span>
              </>
            )}
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 border-l border-slate-800 pl-6">
          <span className="text-slate-400">Daily Budget Active:</span>
          <span className="font-bold text-white tracking-wide">$480.00 / day</span>
          <span className="text-emerald-400 text-[11px] font-semibold flex items-center">
            (Pacing 98.4%)
          </span>
        </div>
      </div>

      {/* Right Controls: Plain vs Expert Switcher + Alerts + Actions */}
      <div className="flex items-center gap-4">
        {/* The Master Toggle Switch */}
        <div 
          onClick={toggleMode}
          className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-sky-500/50 cursor-pointer transition-all duration-200 group shadow-sm"
          title="Toggle between Plain Business English and Technical Growth Marketing Terms (ROAS/CPA/CPM)"
        >
          <span className={`text-xs font-medium transition-colors ${mode === 'plain' ? 'text-sky-400 font-bold' : 'text-slate-400'}`}>
            Plain English
          </span>
          <div className="relative inline-flex items-center">
            {mode === 'plain' ? (
              <ToggleLeft className="w-7 h-7 text-sky-400 transition-transform group-hover:scale-105" />
            ) : (
              <ToggleRight className="w-7 h-7 text-purple-400 transition-transform group-hover:scale-105" />
            )}
          </div>
          <span className={`text-xs font-medium transition-colors ${mode === 'expert' ? 'text-purple-400 font-bold' : 'text-slate-400'}`}>
            Expert Marketer
          </span>
        </div>

        {/* Action Center Alert Bell */}
        <Link 
          href="/dashboard" 
          className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          title="3 Action Center Issues Detected"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-status-crimson text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            3
          </span>
        </Link>

        {/* Quick Launch Button */}
        <Link 
          href="/studio"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-pulse to-brand-deep text-obsidian font-bold text-xs hover:opacity-95 shadow-md shadow-sky-500/20 transition-all hover:scale-[1.02]"
        >
          <span>New Campaign</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </header>
  );
};

