/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          pulse: "#38BDF8",
          deep: "#0284C7",
        },
        obsidian: "#0F172A",
        slateText: "#475569",
        cloudLine: "#E2E8F0",
        frostCanvas: "#F8FAFC",
        status: {
          emerald: "#10B981",
          amber: "#F59E0B",
          crimson: "#EF4444",
        },
      },
    },
  },
  plugins: [],
};

