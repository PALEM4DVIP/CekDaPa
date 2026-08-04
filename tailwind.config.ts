import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#171B24",
          light: "#4B5165",
        },
        surface: {
          light: "#FFFFFF",
          dark: "#131826",
        },
        canvas: {
          light: "#F5F6FA",
          dark: "#0B0E14",
        },
        border: {
          light: "#E4E6ED",
          dark: "#232A3A",
        },
        navy: {
          50: "#EEF0F6",
          100: "#D6DAE8",
          400: "#5B6688",
          600: "#2C3450",
          800: "#1B2436",
          900: "#12182A",
        },
        gold: {
          50: "#FBF3E2",
          200: "#EFCE8B",
          400: "#D6A94A",
          500: "#C4923A",
          600: "#A97A2C",
        },
        teal: {
          400: "#3AAE8E",
          500: "#2F8F76",
          600: "#227560",
        },
        coral: {
          400: "#E1654F",
          500: "#C74E3B",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgba(23, 27, 36, 0.04), 0 1px 3px 0 rgba(23, 27, 36, 0.06)",
        card: "0 2px 8px -2px rgba(23, 27, 36, 0.08), 0 4px 16px -4px rgba(23, 27, 36, 0.06)",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #E3B968 0%, #C4923A 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
