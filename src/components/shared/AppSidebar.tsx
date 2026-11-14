'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutGrid,
  Compass,
  Layers,
  SlidersHorizontal,
  BrainCircuit,
  SearchCode,
  Settings,
  HelpCircle,
  LogOut,
  ShieldCheck,
  X,
} from 'lucide-react';
import { AdoracleLogo } from '@/components/shared/AdoracleLogo';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/selector', label: 'Platform Selector', icon: Compass },
  { href: '/studio', label: 'Campaign Studio', icon: Layers, badge: '4' },
  { href: '/campaigns', label: 'Campaigns', icon: SlidersHorizontal },
  { href: '/intelligence', label: 'AI Intelligence', icon: BrainCircuit },
  { href: '/seo', label: 'SEO & Safety', icon: SearchCode },
];

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ isOpen = false, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

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
                    className={`relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'text-slate-900 dark:text-white bg-white dark:bg-slate-900 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#1B6B48]" />
                    )}
                    <div className="flex items-center gap-3">
                      <Icon
                        size={16}
                        className={isActive ? 'text-[#1B6B48]' : 'text-slate-400'}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-[#114B32] text-white">
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
                href="/settings"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 transition-all"
              >
                <Settings size={16} className="text-slate-400" />
                <span>Settings</span>
              </Link>
              <Link
                href="/help"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 transition-all"
              >
                <HelpCircle size={16} className="text-slate-400" />
                <span>Help</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  handleLinkClick();
                  router.push('/login');
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50/70 transition-all"
              >
                <LogOut size={16} className="text-slate-400" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Dark Forest Green AI Guard Card */}
        <div className="relative rounded-2xl bg-gradient-to-br from-[#0F3D29] via-[#15573A] to-[#0B2E1F] p-4 text-white overflow-hidden shadow-md mt-6">
          <div
            className="pointer-events-none absolute -right-6 -bottom-6 w-28 h-28 rounded-full opacity-30 blur-xl"
            style={{ background: 'radial-gradient(circle, #34D399, transparent)' }}
          />
          <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center mb-2.5">
            <ShieldCheck size={15} className="text-emerald-300" />
          </div>
          <p className="text-xs font-bold leading-snug">
            Adoracle AI Guard
          </p>
          <p className="text-[11px] text-emerald-100/75 mt-0.5 mb-3">
            $980 wasted spend blocked automatically
          </p>
          <Link
            href="/seo"
            onClick={handleLinkClick}
            className="block w-full py-2 text-center rounded-xl bg-[#229A63] hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
          >
            View Safety Report
          </Link>
        </div>
      </aside>
    </>
  );
}
