/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ledger: {
          bg: "#F6F4EE",
          ink: "#1B2A4A",
          inkSoft: "#3C4D6E",
          line: "#DAD5C6",
          gold: "#C9971C",
          goldSoft: "#EFDFAF",
          good: "#2E6B4F",
          bad: "#A73E3E",
          panel: "#FFFFFF",
          dark: {
            bg: "#111827",
            ink: "#E5E7EB",
            inkSoft: "#9CA3AF",
            line: "#374151",
            gold: "#D4A72C",
            goldSoft: "#3D3420",
            good: "#4ADE80",
            bad: "#F87171",
            panel: "#1F2937",
          },
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      borderRadius: {
        sm: "4px",
      },
    },
  },
  plugins: [],
};
