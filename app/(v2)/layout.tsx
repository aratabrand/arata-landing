import type { Metadata } from "next";
import { V2_PUBLICADO } from "@/lib/lanzamiento";

// Layout del sitio v2 (Fase 3: muestra). Solo fondo oscuro (D-025).
// Mientras la v2 no se lanza, estas páginas NO se indexan y no van en el sitemap.
// Al lanzar (V2_PUBLICADO), se indexan. /sistema y /agendar/gracias siguen noindex por su cuenta.
export const metadata: Metadata = {
  robots: V2_PUBLICADO ? { index: true, follow: true } : { index: false, follow: false },
};

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-noche text-white [color-scheme:dark]">
      {/* El body global es blanco (v1); en la v2 todo el fondo es negro (#020104, D-145), también al rebotar el scroll */}
      <style>{`html,body{background:#020104}`}</style>
      {/* Grano muy fino sobre toda la página (D-145): quita el look "digital liso" sin pesar (SVG en línea) */}
      <div aria-hidden className="v2-grano" />
      {children}
    </div>
  );
}
