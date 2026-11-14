import './globals.css';
import type { Metadata } from 'next';
import { ModeProvider } from '@/components/shared/ModeContext';
import { ThemeProvider } from '@/components/shared/ThemeContext';

export const metadata: Metadata = {
  title: 'Adoracle — Unified Ad Management & Business Intelligence',
  description:
    'AI-driven multi-platform ad management across Meta, TikTok, Google, YouTube, LinkedIn, and SEO.',
  icons: {
    icon: '/images/adoracle-logo.jpg',
    apple: '/images/adoracle-logo.jpg',
  },
  openGraph: {
    title: 'Adoracle — Unified Ad Management & Business Intelligence',
    description: 'AI-driven multi-platform ad management and automated waste reduction.',
    images: ['/images/adoracle-logo.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#F6F8FB] dark:bg-[#0B1120] text-obsidianBlack dark:text-slate-100 font-sans antialiased transition-colors duration-300">
        <ThemeProvider>
          <ModeProvider>{children}</ModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}