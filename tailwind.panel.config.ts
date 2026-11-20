import type { Config } from "tailwindcss";
import base from "./tailwind.config";

// Tailwind SOLO del panel (D-115). Mismo tema que el sitio; solo lee los archivos del
// panel. Lo usa `npm run panel:css` (styles/panel.src.css → styles/panel.generated.css), FUERA de Next.
// Así las clases del panel no engordan el CSS que va dentro de cada página pública (el sitio lo pone
// en línea para abrir rápido).
// OJO (D-126): no poner aquí `corePlugins: { preflight: false }`. panel.src.css no usa
// `@tailwind base`, así que no hace falta.
// OJO (D-135): nunca usar esta config con `@config` dentro de un CSS que importe Next. Dos configs de
// Tailwind en el mismo proceso de Next se pisan según el orden de construcción y el sitio sale sin estilos.
// D-136: el panel tiene sus propias superficies, un paso más claras y menos saturadas que las del
// sitio, para que las tarjetas se separen del fondo (el sitio usa surface 1/2/3 casi iguales a ink).
const colores = (base.theme?.extend?.colors ?? {}) as Record<string, unknown>;
const config: Config = {
  ...base,
  content: [
    "./app/(panel)/**/*.{ts,tsx}",
    "./components/panel/**/*.{ts,tsx}",
  ],
  theme: {
    ...base.theme,
    extend: {
      ...base.theme?.extend,
      // D-149: colores que cambian con el tema (oscuro/claro) como variables de styles/panel.src.css.
      // `white` también: en claro, text-white / bg-white/5 / border-white/10 pasan a tinta.
      // Fijos: brand (botones), ink y `blanco` (texto sobre morado). `lime` cambia en claro a morado (D-151).
      colors: {
        ...colores,
        white: "rgb(var(--pn-fg) / <alpha-value>)",
        blanco: "#FFFFFF",
        fog: { DEFAULT: "rgb(var(--pn-fog) / <alpha-value>)", dim: "rgb(var(--pn-fog-dim) / <alpha-value>)" },
        noche: "rgb(var(--pn-noche) / <alpha-value>)",
        canvas: "rgb(var(--pn-canvas) / <alpha-value>)", // zona de contenido (la barra lateral va sobre noche)
        surface: {
          1: "rgb(var(--pn-s1) / <alpha-value>)",
          2: "rgb(var(--pn-s2) / <alpha-value>)",
          3: "rgb(var(--pn-s3) / <alpha-value>)",
        },
        dato: "rgb(var(--pn-dato) / <alpha-value>)", // lima de las cifras (en claro, morado legible, D-151)
        lime: "rgb(var(--pn-lima) / <alpha-value>)", // rellenos de dato (en claro, morado claro con texto ink, D-151)
        alerta: { DEFAULT: "rgb(var(--pn-alerta) / <alpha-value>)", fuerte: "rgb(var(--pn-alerta-fuerte) / <alpha-value>)" },
        ambar: "rgb(var(--pn-ambar) / <alpha-value>)",
        verde: "rgb(var(--pn-verde) / <alpha-value>)", // semáforo (D-155)
      },
    },
  },
};

export default config;
