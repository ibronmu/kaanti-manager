import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#0B1B3B", 50: "#F1F4FA", 900: "#0B1B3B" },
        emerald: { DEFAULT: "#0F8F5D", 500: "#0F8F5D", 600: "#0C7A4F" },
        teal: { DEFAULT: "#0E7C86" },
        gold: { DEFAULT: "#C9A227" },
        offwhite: "#F7F8FB",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;