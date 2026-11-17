import type { Metadata, Viewport } from "next";
import "./panel.css";

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
  icons: { apple: "/panel/icono-180.png" },
};

export const viewport: Viewport = { themeColor: "#03010B" };

export default function PanelRaizLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink text-white [color-scheme:dark]">
      <style>{`html,body{background:#03010B}`}</style>
      {children}
    </div>
  );
}
