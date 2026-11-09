import SiteHeader from "@/components/v2/SiteHeader";
import { SiteFooter } from "@/components/v2/Closing";
import StickyBookBar from "@/components/v2/StickyBookBar";
import Preloader from "@/components/v2/Preloader";

// Marco común de todas las páginas del sitio v2 (Fase 4): menú, footer y barra fija
// de "Agendar reunión" en celular (que se oculta sola en /agendar).
export default function SitioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Preloader />
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <StickyBookBar />
    </>
  );
}
