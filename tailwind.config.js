/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // New Organic Forest Emerald Palette
        forestDeep: "#114B32",
        forestPrimary: "#1B6B48",
        emeraldAccent: "#229A63",
        mintSoft: "#E6F4ED",
        sageCanvas: "#F5F7F6",

        // Nested Brand & Status Tokens (Preserved for existing components)
        brand: {
          pulse: "#1B6B48",
          deep: "#114B32",
        },
        status: {
          emerald: "#10B981",
          amber: "#F59E0B",
          crimson: "#EF4444",
        },

        // Legacy Flat Tokens (Preserved so zero existing classes break)
        skyPulse: "#1B6B48",
        deepSky: "#114B32",
        pureWhite: "#FFFFFF",
        frostWhite: "#F8FAFC",
        frostCanvas: "#F8FAFC",
        obsidian: "#0F172A",
        obsidianBlack: "#0F172A",
        slateGray: "#475569",
        slateText: "#475569",
        cloudLine: "#E2E8F0",
        emeraldGreen: "#10B981",
        amberGold: "#F59E0B",
        crimsonRed: "#EF4444",
      },
    },
  },
  plugins: [],
};