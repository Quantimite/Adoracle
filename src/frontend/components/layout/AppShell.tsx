'use client';

import React, { useState } from 'react';
import { AppSidebar } from '@/frontend/components/layout/AppSidebar';
import { AppHeader } from '@/frontend/components/layout/AppHeader';
import { UserProvider, CurrentUser } from '@/frontend/context/UserContext';

export function AppShell({ user, children }: { user: CurrentUser; children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <UserProvider user={user}>
      <div className="flex min-h-screen bg-[#F3F6FB] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors overflow-x-hidden">
        <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col w-full min-w-0 lg:ml-64 transition-[margin]">
          <AppHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
          <main className="flex-1 px-3 sm:px-6 lg:px-7 py-4 sm:py-6 overflow-y-auto w-full min-w-0">
            <div className="max-w-6xl mx-auto w-full min-w-0">{children}</div>
          </main>
        </div>
      </div>
    </UserProvider>
  );
}
