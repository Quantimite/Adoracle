'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Search, LifeBuoy, Bell, Sun, Moon, Menu, UserCircle, Settings, Plug, LogOut, AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/components/shared/ThemeContext';
import { useMode } from '@/components/shared/ModeContext';
import { useCurrentUser, initialsOf } from '@/components/shared/UserContext';

export interface AppHeaderProps {
  onToggleSidebar?: () => void;
}

const NOTIFICATIONS = [
  { id: 'n1', icon: AlertTriangle, tone: 'text-rose-600', title: 'Broken checkout link detected', sub: 'Meta Retargeting · auto-throttled', href: '/seo' },
  { id: 'n2', icon: TrendingUp, tone: 'text-emerald-600', title: 'TikTok Spark Ad is scaling', sub: 'ROAS 5.1× over the last 48h', href: '/campaigns' },
  { id: 'n3', icon: CheckCircle2, tone: 'text-emerald-600', title: 'New AI lesson learned', sub: 'Best converting hours updated', href: '/intelligence' },
];

function useClickOutside(ref: React.RefObject<HTMLElement>, onOutside: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onOutside]);
}

export function AppHeader({ onToggleSidebar }: AppHeaderProps = {}) {
  const router = useRouter();
  const user = useCurrentUser();
  const { theme, toggleTheme } = useTheme();
  const modeContext = useMode() as any;
  const isExpert = Boolean(modeContext?.isExpert ?? modeContext?.expertMode ?? modeContext?.mode === 'expert');
  const toggleMode = modeContext?.toggleMode ?? (() => modeContext?.setExpertMode?.(!isExpert));

  const [query, setQuery] = useState('');
  const [bellOpen, setBellOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useClickOutside(bellRef, () => setBellOpen(false));
  useClickOutside(menuRef, () => setMenuOpen(false));

  // ⌘F / Ctrl+F focuses the campaign search instead of the browser's find box
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/campaigns?q=${encodeURIComponent(q)}` : '/campaigns');
  };

  const roundBtn =
    'w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-[#1B6B48] transition-all cursor-pointer';

  return (
    <header className="sticky top-0 z-20 h-16 px-4 sm:px-7 flex items-center justify-between gap-3 bg-[#F5F7F6]/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle mobile menu"
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shrink-0 transition-colors cursor-pointer"
        >
          <Menu size={18} />
        </button>

        <form onSubmit={submitSearch} className="relative w-full max-w-[200px] sm:max-w-xs md:max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full pl-8 sm:pl-9 pr-3 sm:pr-10 py-1.5 sm:py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#1B6B48]"
          />
          <span className="hidden sm:inline absolute right-2.5 top-1/2 -translate-y-1/2 px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-500">
            ⌘F
          </span>
        </form>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <button
          type="button"
          onClick={toggleMode}
          className="hidden sm:inline-flex px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#1B6B48] transition-all cursor-pointer"
        >
          {isExpert ? 'Expert View' : 'Simple View'}
        </button>

        <button type="button" onClick={toggleTheme} aria-label="Toggle Theme" className={roundBtn}>
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} className="text-amber-400" />}
        </button>

        <Link href="/help" aria-label="Help & support" className={roundBtn + ' hidden xs:flex sm:flex'}>
          <LifeBuoy size={14} />
        </Link>

        {/* Notifications */}
        <div className="relative" ref={bellRef}>
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={bellOpen}
            onClick={() => {
              setBellOpen((v) => !v);
              setMenuOpen(false);
            }}
            className={roundBtn + ' relative'}
          >
            <Bell size={14} />
            <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-[#1B6B48]" />
          </button>
          {bellOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl p-2 z-30">
              <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Notifications</p>
              {NOTIFICATIONS.map((n) => {
                const Icon = n.icon;
                return (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => setBellOpen(false)}
                    className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Icon size={16} className={`${n.tone} mt-0.5 shrink-0`} />
                    <span className="min-w-0">
                      <span className="block text-xs font-bold text-slate-900 dark:text-white">{n.title}</span>
                      <span className="block text-[11px] text-slate-500">{n.sub}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Profile menu */}
        <div className="relative pl-1 sm:pl-2" ref={menuRef}>
          <button
            type="button"
            onClick={() => {
              setMenuOpen((v) => !v);
              setBellOpen(false);
            }}
            aria-expanded={menuOpen}
            className="flex items-center gap-2 rounded-full hover:bg-white/70 dark:hover:bg-slate-900 pr-1 md:pr-3 transition-colors cursor-pointer"
          >
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" referrerPolicy="no-referrer" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-[#1B6B48]/20" />
            ) : (
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#E6F4ED] text-[#114B32] font-bold text-xs flex items-center justify-center border border-[#1B6B48]/20 shrink-0">
                {initialsOf(user.name)}
              </div>
            )}
            <div className="hidden md:block leading-tight text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-white max-w-[140px] truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 max-w-[140px] truncate">{user.email}</p>
            </div>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl p-2 z-30">
              <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              </div>
              {[
                { href: '/profile', label: 'My profile', icon: UserCircle },
                { href: '/settings?section=integrations', label: 'Connected accounts', icon: Plug },
                { href: '/settings', label: 'Settings', icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Icon size={15} className="text-slate-400" />
                    {item.label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                <LogOut size={15} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
