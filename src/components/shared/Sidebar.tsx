'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { 
  LayoutDashboard, 
  Compass, 
  Layers, 
  Sliders, 
  BrainCircuit, 
  SearchCode, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Business Profiler',
    href: '/selector',
    icon: Compass,
    badge: 'AI Mixer',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-400/30',
  },
  {
    name: 'Platform Studio',
    href: '/studio',
    icon: Layers,
  },
  {
    name: 'Campaigns & Budgets',
    href: '/campaigns',
    icon: Sliders,
    badge: 'Live',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
  },
  {
    name: 'AI Learning Loop',
    href: '/intelligence',
    icon: BrainCircuit,
    badge: '94.2%',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
  },
  {
    name: 'Web SEO & Safety',
    href: '/seo',
    icon: SearchCode,
    badge: 'Alerts',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
  },
];

const platforms = [
  { name: 'Meta / IG', status: 'connected', color: 'bg-emerald-400' },
  { name: 'TikTok', status: 'connected', color: 'bg-emerald-400' },
  { name: 'Google Ads', status: 'connected', color: 'bg-emerald-400' },
  { name: 'LinkedIn', status: 'warning', color: 'bg-amber-400' },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-obsidian border-r border-slate-800 flex flex-col fixed top-0 bottom-0 left-0 z-40 text-slate-300 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <Link href="/dashboard" className="transition-transform hover:scale-[1.02]">
          <Logo size="md" />
        </Link>
      </div>

      {/* Workspace Indicator */}
      <div className="px-4 py-3 mx-3 my-3 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-pulse animate-pulse flex-shrink-0" />
          <div className="flex flex-col truncate">
            <span className="text-xs font-semibold text-white truncate">Acme Direct Global</span>
            <span className="text-[10px] text-slate-400">Enterprise Workspace</span>
          </div>
        </div>
        <ShieldCheck className="w-4 h-4 text-sky-400 flex-shrink-0" />
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Core Platform
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm shadow-sky-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Live Connectors Status Box */}
      <div className="p-4 m-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-300 tracking-wide uppercase">Unified Connectors</span>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Live Sync
          </span>
        </div>
        <div className="space-y-1.5">
          {platforms.map((p) => (
            <div key={p.name} className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${p.color}`} />
                {p.name}
              </span>
              <span className="text-[10px] text-slate-500">AES-256 Vault</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer System Status */}
      <div className="px-5 py-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Adoracle Core v1.0
        </span>
        <span className="text-[10px] text-slate-400">CAPI / APIs OK</span>
      </div>
    </aside>
  );
};

