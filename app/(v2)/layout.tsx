import type { Metadata } from "next";
import { V2_PUBLICADO } from "@/lib/lanzamiento";
import Grano from "@/components/v2/Grano";

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
      {/* Grano muy fino sobre toda la página (D-145): se dibuja en un canvas cuando el navegador está libre (D-147) */}
      <Grano />
      {/* Fondo continuo de toda la página (D-147): líneas verticales cada 80 px y haces de luz
          que bajan por algunas, lejos de la columna del texto. Fijo: no se repinta al bajar. */}
      <div aria-hidden className="v2-fondo">
        {[-7, -5, 5, 7].map((n, i) => (
          <span key={n} className="v2-haz" style={{ left: `calc(50% + ${n * 80}px - 0.5px)`, ["--d" as string]: `${i * 2.3}s` } as React.CSSProperties} />
        ))}
      </div>
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
