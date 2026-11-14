import React from 'react';
import { AppSidebar } from '@/components/shared/AppSidebar';
import { AppHeader } from '@/components/shared/AppHeader';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F5F7F6] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <AppSidebar />
      <div className="flex-1 flex flex-col ml-64">
        <AppHeader />
        <main className="flex-1 px-7 py-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}