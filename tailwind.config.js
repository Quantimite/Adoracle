// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      colors: {
        // Legacy tokens mapped directly to the new Multi-Tone Green System
        skyPulse: '#10B981',      // Mint Pulse
        deepSky: '#169C69',       // Emerald Primary
        obsidianBlack: '#0B1F17', // Deep Forest Ink
        frostWhite: '#EFF7F3',    // Soft Sage Canvas
        cloudLine: '#B7DEC9',     // Botanical Sage Border
        pureWhite: '#FFFFFF',
        emeraldGreen: '#10B981',
        crimsonRed: '#E12D39',
        slateGray: '#4B6358',     // Muted Sage-Slate text

        // Dedicated Multi-Green Tokens for New Components
        forest: {
          950: '#07130F',
          900: '#0D241C',
          800: '#163D30',
        },
        emeraldBrand: {
          DEFAULT: '#169C69',
          dark: '#0F7A52',
          mint: '#10B981',
          jade: '#0D9488',
          lime: '#84CC16',
          sage: '#E2F3EA',
        },
      },
    },
  },
  plugins: [],
};

export default config;