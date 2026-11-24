import type { Metadata } from "next";

// Grupo de las landings de campaña (/lp/…, D-188). Independientes del sitio: sin menú,
// sin footer de enlaces y sin la animación de entrada. Cada landing arma su marco con
// components/v2/campana/MarcoCampana.tsx (botón propio y, si hay oferta, su cinta, D-191).
// Nunca se indexan ni van al sitemap: son solo para tráfico pagado y no compiten en
// Google con las páginas del sitio.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CampanaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
