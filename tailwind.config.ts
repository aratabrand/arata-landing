import type { Config } from "tailwindcss";

const config: Config = {
  // El panel tiene su propio Tailwind (tailwind.panel.config.ts, D-115), que se compila APARTE de Next
  // con `npm run panel:css` (D-135): sus clases no entran al CSS del sitio público, que va en línea en cada página.
  content: [
    "./app/**/*.{ts,tsx}",
    "!./app/(panel)/**",
    "./components/**/*.{ts,tsx}",
    "!./components/panel/**",
  ],
  theme: {
    extend: {
      colors: {
        // Sistema de marca Arata San (CLAUDE.md — fuente de verdad)
        brand: {
          DEFAULT: "#7D53FF", // morado
          ink: "#3B1D99",     // morado profundo (texto secundario)
          soft: "#B9A4FF",    // v2: morado claro para texto sobre oscuro (≈9.7:1)
        },
        lime: "#B6FF00",       // acento
        ink: "#03010B",        // texto principal / superficie oscura
        noche: "#020104",      // D-145: fondo del sitio v2 (negro casi neutro; el panel sigue en ink)
        paper: "#FFFFFF",
        muted: "#615C77",      // gris de apoyo derivado de la marca
        line: "#ECEAF3",       // hairlines sobre claro

        // ── v2 (sitio de agencia, solo fondo oscuro) — docs/blueprint/04-sistema-de-diseno.md ──
        surface: {
          // D-146: neutras (sin tinte morado). El panel usa las suyas (tailwind.panel.config.ts)
          1: "#0B0B0D", // tarjetas
          2: "#121215", // hover / elevado / botón secundario
          3: "#19191D", // menús desplegables, modales
        },
        fog: {
          DEFAULT: "#B8B8BE", // texto secundario, gris neutro (D-162; antes lila #B4AECB) ≈10:1 sobre ink
          dim: "#8E8E96",     // etiquetas y notas, gris neutro (D-162; antes #8A84A8) ≈6:1, AA
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      opacity: {
        6: "0.06",
        8: "0.08", // v2: bordes finos (sin esto, `/8` no existe y sale invisible)
        16: "0.16",
        12: "0.12",
        14: "0.14",
        15: "0.15",
        65: "0.65",
        85: "0.85",
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.75rem",
        // v2
        btn: "10px",
        frame: "16px",
        card: "24px",
      },
      letterSpacing: {
        // v2: títulos enormes y apretados (estilo de referencia 21st.dev)
        display: "-0.04em",
        heading: "-0.03em",
      },
      fontSize: {
        // v2: escala mobile-first (360 px → crece con el viewport)
        // medido: 3 líneas en 360–430 px y 2 en escritorio (regla CLAUDE.md: máx. 3)
        "v2-hero": ["clamp(1.8rem, 5.8vw, 4.25rem)", { lineHeight: "1" }],
        "v2-h2": ["clamp(1.9rem, 4.4vw, 3.4rem)", { lineHeight: "1.02" }],
        "v2-h3": ["clamp(1.25rem, 2vw, 1.5rem)", { lineHeight: "1.15" }],
        "v2-lead": ["clamp(1.05rem, 1.4vw, 1.25rem)", { lineHeight: "1.55" }],
      },
      boxShadow: {
        // v2: brillo morado de la tarjeta recomendada
        "glow-purple": "0 0 0 1px rgba(125,83,255,0.7), 0 0 48px -10px rgba(125,83,255,0.55)",
      },
      maxWidth: {
        content: "1180px",
        v2: "1200px",
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
