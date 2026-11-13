import type { Metadata } from 'next';
import './globals.css';
import { ModeProvider } from '@/components/shared/ModeContext';

export const metadata: Metadata = {
  title: 'Adoracle — AI Ad Management',
  description: 'Unified multi-platform advertising management, AI budget optimization, and growth intelligence.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ModeProvider>
          {children}
        </ModeProvider>
      </body>
    </html>
  );
}
