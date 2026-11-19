// src/app/layout.tsx
import '@/frontend/styles/globals.css';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { ModeProvider } from '@/frontend/context/ModeContext';
import { ThemeProvider } from '@/frontend/context/ThemeContext';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

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
    <html
      lang="en"
      className={`${plusJakarta.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-[#F2F7FF] dark:bg-[#08110E] text-[#0D1F18] dark:text-[#EFF6FF] font-sans text-[15px] sm:text-base leading-relaxed antialiased selection:bg-[#2A6FE0] selection:text-white transition-colors duration-300">
        <ThemeProvider>
          <ModeProvider>{children}</ModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}