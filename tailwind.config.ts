import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sistema de marca Arata San (CLAUDE.md — fuente de verdad)
        brand: {
          DEFAULT: "#7D53FF", // morado
          ink: "#3B1D99",     // morado profundo (texto secundario)
        },
        lime: "#B6FF00",       // acento
        ink: "#03010B",        // texto principal / superficie oscura
        paper: "#FFFFFF",
        muted: "#615C77",      // gris de apoyo derivado de la marca
        line: "#ECEAF3",       // hairlines sobre claro
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      opacity: {
        6: "0.06",
        12: "0.12",
        14: "0.14",
        15: "0.15",
        65: "0.65",
        85: "0.85",
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.75rem",
      },
      maxWidth: {
        content: "1180px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.15" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "blink": "blink 1.1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
