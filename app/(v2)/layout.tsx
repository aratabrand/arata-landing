import type { Metadata } from "next";

// Layout del sitio v2 (Fase 3: muestra). Solo fondo oscuro (D-025).
// Mientras la v2 no se lanza, estas páginas NO se indexan y no van en el sitemap.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink text-white [color-scheme:dark]">
      {/* El body global es blanco (v1); en la v2 todo el fondo es ink, también al rebotar el scroll */}
      <style>{`html,body{background:#03010B}`}</style>
      {children}
    </div>
  );
}
