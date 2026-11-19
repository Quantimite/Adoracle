// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    
    
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      colors: {
        // Adoracle brand blues (from the logo) override Tailwind's blue / sky scales
        blue: { 50: '#EEF5FF', 100: '#E1EEFF', 200: '#BBD9FF', 300: '#8CC4FF', 400: '#4DA6FA', 500: '#2F86F0', 600: '#2268DD', 700: '#1E57D0', 800: '#1A47AB', 900: '#163A87', 950: '#0E2257' },
        sky: { 50: '#F0F9FF', 100: '#DDF1FF', 200: '#BCE5FF', 300: '#7DD0FD', 400: '#36BAFC', 500: '#1AA3EE', 600: '#1285CC', 700: '#1368A3', 800: '#145586', 900: '#12486F', 950: '#0B2E48' },
        // Neutral dark surfaces that match the logo background (#131418)
        slate: { 50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1', 400: '#94A3B8', 500: '#64748B', 600: '#475569', 700: '#333845', 800: '#232630', 900: '#1A1C23', 950: '#131418' },
        // Legacy token names now carry the Adoracle blue theme
        skyPulse: '#36BAFC',      // Mint Pulse
        deepSky: '#2A6FE0',       // Emerald Primary
        obsidianBlack: '#0B1A3A', // Deep Forest Ink
        frostWhite: '#EEF5FF',    // Soft Sage Canvas
        cloudLine: '#BBD9FF',     // Botanical Sage Border
        pureWhite: '#FFFFFF',
        emeraldGreen: '#36BAFC',
        crimsonRed: '#E12D39',
        slateGray: '#4B5B7A',     // Muted Sage-Slate text

        // Dedicated Multi-Green Tokens for New Components
        forest: {
          950: '#0C1018',
          900: '#12182A',
          800: '#1E2B4D',
        },
        emeraldBrand: {
          DEFAULT: '#2A6FE0',
          dark: '#1E57D0',
          mint: '#36BAFC',
          jade: '#1AA3EE',
          lime: '#A5DCFF',
          sage: '#E1EEFF',
        },
      },
    },
  },
  plugins: [],
};

export default config;