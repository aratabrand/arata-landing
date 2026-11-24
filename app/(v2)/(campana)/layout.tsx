import type { Metadata } from "next";
import CampanaHeader from "@/components/v2/campana/CampanaHeader";
import CampanaFooter from "@/components/v2/campana/CampanaFooter";
import StickyBookBar from "@/components/v2/StickyBookBar";

// Marco de las landings de campaña (/lp/…, D-188). Independiente del sitio:
// sin menú, sin footer de enlaces y sin la animación de entrada (quien llega de un
// anuncio ve el contenido de una vez). Nunca se indexan ni van al sitemap: son solo
// para tráfico pagado y no compiten en Google con las páginas del sitio.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const cta = { texto: "Agendar reunión", enlace: "/agendar?tipo=catalogo" };

export default function CampanaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CampanaHeader cta={cta} />
      <main className="v2-main">{children}</main>
      <CampanaFooter />
      <StickyBookBar cta={cta} />
    </>
  );
}
