'use client';

import React from 'react';
import { Search, Mail, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/shared/ThemeContext';
import { useMode } from '@/components/shared/ModeContext';

export function AppHeader() {
  const { theme, toggleTheme } = useTheme();
  const modeContext = useMode() as any;
  const isExpert = Boolean(
    modeContext?.isExpert ?? modeContext?.expertMode ?? modeContext?.mode === 'expert'
  );
  const toggleMode =
    modeContext?.toggleMode ?? (() => modeContext?.setExpertMode?.(!isExpert));

  return (
    <header className="sticky top-0 z-20 h-16 px-7 flex items-center justify-between bg-[#F5F7F6]/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800">
      {/* Pill Search Input with Shortcut Badge */}
      <div className="relative w-80">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Search campaigns or tasks"
          className="w-full pl-10 pr-12 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#1B6B48]"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-500">
          ⌘F
        </span>
      </div>

      {/* Right Circular Action Buttons + Profile */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={toggleMode}
          className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#1B6B48] transition-all"
        >
          {isExpert ? 'Expert View' : 'Simple View'}
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-[#1B6B48] transition-all"
        >
          {theme === 'light' ? <Moon size={15} /> : <Sun size={15} className="text-amber-400" />}
        </button>

        <button
          type="button"
          aria-label="Messages"
          className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-[#1B6B48] transition-all"
        >
          <Mail size={15} />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="relative w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-[#1B6B48] transition-all"
        >
          <Bell size={15} />
          <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-[#1B6B48]" />
        </button>

        <div className="flex items-center gap-2.5 pl-2">
          <div className="w-9 h-9 rounded-full bg-[#E6F4ED] text-[#114B32] font-bold text-xs flex items-center justify-center border border-[#1B6B48]/20">
            JD
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-xs font-bold text-slate-900 dark:text-white">Dinuja Ransara</p>
            <p className="text-[10px] text-slate-400">demo@adoracle.ai</p>
          </div>
        </div>
      </div>
    </header>
  );
}