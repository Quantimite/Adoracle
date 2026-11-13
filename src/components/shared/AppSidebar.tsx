'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Compass,
  Layers,
  Sliders,
  BrainCircuit,
  SearchCode,
  LogOut,
  Settings,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Platform Selector', href: '/selector', icon: Compass },
  { name: 'Campaign Studio', href: '/studio', icon: Layers },
  { name: 'Campaigns', href: '/campaigns', icon: Sliders },
  { name: 'AI Intelligence', href: '/intelligence', icon: BrainCircuit },
  { name: 'SEO & Safety', href: '/seo', icon: SearchCode },
];

const platforms = [
  { name: 'Meta & Instagram', color: 'bg-blue-500', active: true },
  { name: 'TikTok', color: 'bg-slate-900', active: true },
  { name: 'Google Ads', color: 'bg-green-500', active: true },
  { name: 'LinkedIn', color: 'bg-sky-700', active: false },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-md flex-shrink-0">
            <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5">
              <path d="M20 7L8 33H15L17.8 26.5H25.2L28 33H35L23 7H20Z" fill="white" fillRule="evenodd" clipRule="evenodd"/>
              <circle cx="34" cy="6" r="3" fill="#38BDF8"/>
              <path d="M34 4L34.6 5.8L36.5 6L35 7.2L35.6 9L34 8L32.4 9L33 7.2L31.5 6L33.4 5.8L34 4Z" fill="white"/>
            </svg>
          </div>
          <span className="text-lg font-bold text-white">Adoracle</span>
        </Link>
      </div>

      {/* Workspace badge */}
      <div className="mx-4 mb-6 mt-1 p-3 rounded-xl bg-slate-800 border border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
            A
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">Acme Direct</p>
            <p className="text-[11px] text-slate-400">Enterprise Workspace</p>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Navigation
        </p>
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all nav-link ${
                active
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              <span>{item.name}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70" />}
            </Link>
          );
        })}

        {/* Connected platforms */}
        <div className="pt-6 pb-2">
          <p className="px-3 pb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Connected Channels
          </p>
          <div className="space-y-1">
            {platforms.map((p) => (
              <div key={p.name} className="flex items-center gap-3 px-3 py-2 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${p.active ? p.color : 'bg-slate-600'} flex-shrink-0`} />
                <span className={`text-xs ${p.active ? 'text-slate-300' : 'text-slate-500'}`}>
                  {p.name}
                </span>
                <span className={`ml-auto text-[10px] font-semibold ${p.active ? 'text-green-400' : 'text-slate-500'}`}>
                  {p.active ? 'Live' : 'Off'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom actions */}
      <div className="p-3 space-y-1 border-t border-slate-800">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-all nav-link">
          <Settings className="w-[18px] h-[18px]" />
          <span>Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-all nav-link">
          <HelpCircle className="w-[18px] h-[18px]" />
          <span>Help & Support</span>
        </button>
        <button
          onClick={() => router.push('/login')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all nav-link"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}

