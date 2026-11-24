'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutGrid,
  Network,
  Rocket,
  SlidersHorizontal,
  Share2,
  BrainCircuit,
  SearchCode,
  Settings,
  HelpCircle,
  UserCircle,
  LogOut,
  X,
} from 'lucide-react';
import { AdoracleLogo } from '@/frontend/components/common/AdoracleLogo';

const navItems: { href: string; label: string; icon: React.ElementType; badge?: string }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/platforms', label: 'Platforms', icon: Network },
  { href: '/builder', label: 'Campaign Builder', icon: Rocket },
  { href: '/campaigns', label: 'Campaigns', icon: SlidersHorizontal },
  { href: '/posts', label: 'Social Posts', icon: Share2 },
  { href: '/intelligence', label: 'AI Intelligence', icon: BrainCircuit },
  { href: '/seo', label: 'SEO & Safety', icon: SearchCode },
];

export interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ isOpen = false, onClose }: AppSidebarProps) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 lg:z-30 w-64 h-screen overflow-y-auto bg-[#F7F8FA] dark:bg-slate-950 border-r border-slate-200/70 dark:border-slate-800 flex flex-col justify-between px-4 py-5 select-none transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Logo & Menu */}
        <div className="space-y-6">
          <div className="px-2 flex items-center justify-between">
            <Link href="/dashboard" onClick={handleLinkClick}>
              <AdoracleLogo variant="emerald" size="sm" />
            </Link>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Sidebar"
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div>
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Menu
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'text-slate-900 dark:text-white bg-white dark:bg-slate-900 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-[#36BAFC] to-[#1E57D0]" />
                    )}
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-gradient-to-br from-[#36BAFC] to-[#1E57D0] text-white shadow-md shadow-blue-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-blue-600'}`}>
                        <Icon size={15} />
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-[#153E9E] text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* General Section */}
          <div>
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              General
            </p>
            <div className="space-y-1">
              <Link
                href="/profile"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  pathname === '/profile'
                    ? 'text-slate-900 dark:text-white bg-white dark:bg-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-900/50'
                }`}
              >
                <UserCircle size={16} className="text-slate-400" />
                <span>My Profile</span>
              </Link>
              <Link
                href="/settings"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-900/50 transition-all"
              >
                <Settings size={16} className="text-slate-400" />
                <span>Settings</span>
              </Link>
              <Link
                href="/help"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-900/50 transition-all"
              >
                <HelpCircle size={16} className="text-slate-400" />
                <span>Help</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  handleLinkClick();
                  signOut({ callbackUrl: '/login' });
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50/70 dark:hover:bg-slate-900/50 transition-all"
              >
                <LogOut size={16} className="text-slate-400" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export const Sidebar = AppSidebar;
export default AppSidebar;
