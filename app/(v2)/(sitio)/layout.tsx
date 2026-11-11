import SiteHeader from "@/components/v2/SiteHeader";
import { SiteFooter } from "@/components/v2/Closing";
import StickyBookBar from "@/components/v2/StickyBookBar";
import Preloader from "@/components/v2/Preloader";
import { textosSitio } from "@/lib/sitio-textos";

// Marco común de todas las páginas del sitio v2 (Fase 4): menú, footer y barra fija
// de "Agendar reunión" en celular (que se oculta sola en /agendar).
// El botón del menú se edita desde el panel (Mi sitio, D-117); se lee al construir.
export default async function SitioLayout({ children }: { children: React.ReactNode }) {
  const { menu } = await textosSitio();
  return (
    <>
      <Preloader />
      <SiteHeader cta={menu} />
      <main className="v2-main">{children}</main>
      <SiteFooter />
      <StickyBookBar cta={menu} />
    </>
  );
}
