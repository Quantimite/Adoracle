'use client';

import React from 'react';
import { Bell, Search, Sparkles, ToggleLeft, ToggleRight } from 'lucide-react';
import { useMode } from './ModeContext';
import Link from 'next/link';

export function AppHeader() {
  const { mode, toggleMode } = useMode();

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-8 sticky top-0 z-30">
      {/* Left — search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search campaigns, platforms..."
          className="pl-10 pr-4 py-2 rounded-lg bg-slate-100 border border-transparent text-sm text-slate-700 placeholder:text-slate-400 w-64 focus:bg-white focus:border-slate-300 transition-all"
        />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Mode toggle */}
        <button
          onClick={toggleMode}
          title="Switch between Plain Language and Expert mode"
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
            mode === 'plain'
              ? 'bg-sky-50 border-sky-200 text-sky-700'
              : 'bg-purple-50 border-purple-200 text-purple-700'
          }`}
        >
          {mode === 'plain' ? (
            <>
              <ToggleLeft className="w-4 h-4" />
              <span>Plain Mode</span>
            </>
          ) : (
            <>
              <ToggleRight className="w-4 h-4" />
              <span>Expert Mode</span>
            </>
          )}
        </button>

        {/* Notifications */}
        <Link
          href="/dashboard"
          className="relative w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all"
        >
          <Bell className="w-4 h-4 text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-white" />
        </Link>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center cursor-pointer">
          <span className="text-xs font-bold text-white">JD</span>
        </div>
      </div>
    </header>
  );
}

