/** @type {import('tailwindcss').Config} */
export default {
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
