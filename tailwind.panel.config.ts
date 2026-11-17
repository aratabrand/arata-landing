import type { Config } from "tailwindcss";
import base from "./tailwind.config";

// Tailwind SOLO del panel (D-115). Mismo tema que el sitio; solo lee los archivos del
// panel. Lo usa app/(panel)/panel/panel.css. Así las clases del panel no engordan el
// CSS que va dentro de cada página pública (el sitio lo pone en línea para abrir rápido).
// OJO (D-126): no poner aquí `corePlugins: { preflight: false }`. panel.css no usa
// `@tailwind base`, así que no hace falta; y al construir, Next le pegaba esa opción al
// CSS general: el sitio y el panel quedaban sin la capa base (enlaces subrayados, viñetas).
const config: Config = {
  ...base,
  content: [
    "./app/(panel)/**/*.{ts,tsx}",
    "./components/panel/**/*.{ts,tsx}",
  ],
};

export default config;
