import { ModeProvider } from '@/components/shared/ModeContext';
import { AppSidebar } from '@/components/shared/AppSidebar';
import { AppHeader } from '@/components/shared/AppHeader';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <AppSidebar />
      <div className="flex-1 flex flex-col ml-64">
        <AppHeader />
        <main className="flex-1 p-8 pt-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

