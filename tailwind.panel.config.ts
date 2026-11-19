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
const config: Config = {
  ...base,
  content: [
    "./app/(panel)/**/*.{ts,tsx}",
    "./components/panel/**/*.{ts,tsx}",
  ],
};

export default config;
