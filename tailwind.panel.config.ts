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
      colors: {
        ...colores,
        surface: { 1: "#100D1A", 2: "#161226", 3: "#1D1832" },
        canvas: "#0A0813", // zona de contenido (la barra lateral va sobre ink)
      },
    },
  },
};

export default config;
