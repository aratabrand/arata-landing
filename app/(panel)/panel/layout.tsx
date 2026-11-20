import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { COOKIE_TEMA, FONDO_TEMA, temaDe } from "@/lib/panel/tema";
// D-135: CSS del panel generado aparte (npm run panel:css) desde styles/panel.src.css.
import "@/styles/panel.generated.css";

// Panel (docs/panel-cliente/). Privado: nunca se indexa, no va en el sitemap
// y robots.txt lo bloquea. Mismo sistema v2: solo fondo ink.
// (app)    → módulos con menú (piden sesión con doble factor, ver proxy.ts)
// (acceso) → entrar y doble factor, sin menú
export const metadata: Metadata = {
  title: { default: "Panel · Arata San", template: "%s · Panel Arata San" },
  description: "Panel de Arata San: ventas, visitas, Instagram, clientes, proyectos y configuración del sitio.",
  robots: { index: false, follow: false, nocache: true },
  // Se puede instalar como app (necesario en iPhone para recibir avisos, D-119)
  manifest: "/panel/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Arata Panel", statusBarStyle: "black-translucent" },
  // D-136: `icons` reemplaza por completo al del sitio (no se mezclan), por eso aquí van los dos:
  // sin `icon`, el panel se quedaba sin favicon y solo conservaba el de Apple.
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }], apple: "/panel/icono-180.png" },
};

export const viewport: Viewport = { themeColor: "#020104" };

// D-149: tema oscuro (por defecto) o claro, desde la cookie `pn-tema` (interruptor en el menú de la cuenta).
// El servidor lo pone en data-tema: sin destello al abrir. Colores en styles/panel.src.css.
export default async function PanelRaizLayout({ children }: { children: React.ReactNode }) {
  const tema = temaDe((await cookies()).get(COOKIE_TEMA)?.value);
  return (
    <div className="pn-root min-h-screen bg-noche text-white" data-tema={tema}>
      <style>{`html,body{background:${FONDO_TEMA[tema]}}`}</style>
      {children}
    </div>
  );
}
