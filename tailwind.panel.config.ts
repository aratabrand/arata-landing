import type { Config } from "tailwindcss";
import base from "./tailwind.config";

// Tailwind SOLO del panel (D-115). Mismo tema que el sitio; solo lee los archivos del
// panel. Lo usa app/(panel)/panel/panel.css. Así las clases del panel no engordan el
// CSS que va dentro de cada página pública (el sitio lo pone en línea para abrir rápido).
const config: Config = {
  ...base,
  content: [
    "./app/(panel)/**/*.{ts,tsx}",
    "./components/panel/**/*.{ts,tsx}",
  ],
  corePlugins: { ...(base.corePlugins as object), preflight: false },
};

export default config;
