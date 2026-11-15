'use client';

import React from 'react';
import { Search, Mail, Bell, Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '@/components/shared/ThemeContext';
import { useMode } from '@/components/shared/ModeContext';

export interface AppHeaderProps {
  onToggleSidebar?: () => void;
}

export function AppHeader({ onToggleSidebar }: AppHeaderProps = {}) {
  const { theme, toggleTheme } = useTheme();
  const modeContext = useMode() as any;
  const isExpert = Boolean(
    modeContext?.isExpert ?? modeContext?.expertMode ?? modeContext?.mode === 'expert'
  );
  const toggleMode =
    modeContext?.toggleMode ?? (() => modeContext?.setExpertMode?.(!isExpert));

  return (
    <header className="sticky top-0 z-20 h-16 px-4 sm:px-7 flex items-center justify-between gap-3 bg-[#F5F7F6]/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800">
      {/* Left: Hamburger menu toggle + Search */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle mobile menu"
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shrink-0 transition-colors"
        >
          <Menu size={18} />
        </button>

        {/* Responsive Pill Search Input */}
        <div className="relative w-full max-w-[200px] sm:max-w-xs md:max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search campaigns..."
            className="w-full pl-8 sm:pl-9 pr-3 sm:pr-10 py-1.5 sm:py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#1B6B48]"
          />
          <span className="hidden sm:inline absolute right-2.5 top-1/2 -translate-y-1/2 px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-500">
            ⌘F
          </span>
        </div>
      </div>

      {/* Right Circular Action Buttons + Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <button
          type="button"
          onClick={toggleMode}
          className="hidden sm:inline-flex px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#1B6B48] transition-all"
        >
          {isExpert ? 'Expert View' : 'Simple View'}
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-[#1B6B48] transition-all"
        >
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} className="text-amber-400" />}
        </button>

        <button
          type="button"
          aria-label="Messages"
          className="hidden xs:flex w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 items-center justify-center text-slate-600 dark:text-slate-300 hover:border-[#1B6B48] transition-all"
        >
          <Mail size={14} />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-[#1B6B48] transition-all"
        >
          <Bell size={14} />
          <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-[#1B6B48]" />
        </button>

        <div className="flex items-center gap-2 pl-1 sm:pl-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#E6F4ED] text-[#114B32] font-bold text-xs flex items-center justify-center border border-[#1B6B48]/20 shrink-0">
            JD
          </div>
          <div className="hidden md:block leading-tight">
            <p className="text-xs font-bold text-slate-900 dark:text-white">Dinuja Ransara</p>
            <p className="text-[10px] text-slate-400">demo@adoracle.ai</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;