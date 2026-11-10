import type { Metadata } from "next";
import PanelShell from "@/components/panel/PanelShell";
import { obtenerPanel } from "@/lib/panel/datos";

// Panel del cliente (docs/panel-cliente/). Privado: nunca se indexa, no va en el
// sitemap y robots.txt lo bloquea. Mismo sistema v2: solo fondo ink.
export const metadata: Metadata = {
  title: { default: "Panel · Arata San", template: "%s · Panel Arata San" },
  description: "Panel del cliente de Arata San: ventas, visitas, Instagram, clientes, proyectos y configuración del sitio.",
  robots: { index: false, follow: false, nocache: true },
};

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const { negocio } = obtenerPanel();
  return (
    <div className="min-h-screen bg-ink text-white [color-scheme:dark]">
      <style>{`html,body{background:#03010B}`}</style>
      <PanelShell negocio={negocio}>{children}</PanelShell>
    </div>
  );
}
