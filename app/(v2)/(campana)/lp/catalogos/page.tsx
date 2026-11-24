import type { Metadata } from "next";
import { ProblemSection, StepsSection } from "@/components/v2/HomeSections";
import { CtaCard, FaqSection } from "@/components/v2/Closing";
import {
  CasesSection,
  CustomSystemSection,
  PriceBar,
  ServiceHero,
} from "@/components/v2/ServiceSections";
import { Assurances } from "@/components/v2/Pricing";
import CasosExito from "@/components/v2/CasosExito";
import { lpCatalogos as c } from "@/content/campanas/catalogos";
import { paginaV2 } from "@/lib/seo";

// Landing de la campaña de Meta (D-188): copia de /catalogos-y-sistemas con marco propio.
// Los textos se cambian en content/campanas/catalogos.ts sin tocar la página del sitio.
// noindex (lo pone el layout de (campana)), sin JSON-LD y fuera del sitemap.
export const metadata: Metadata = paginaV2({
  path: "/lp/catalogos",
  title: c.meta.title,
  description: c.meta.description,
  image: "/og/og-catalogos-y-sistemas.png",
});

export default function LandingCatalogos() {
  return (
    <>
      <ServiceHero {...c.hero} tipo="catalogo" />
      <ProblemSection id="problema-catalogo" titulo={c.problema.titulo} cierre="" items={c.problema.items} />
      <CasosExito
        id="casos-catalogo"
        servicio="catalogo"
        sinEnlaces
        pie={
          <>
            <PriceBar
              precio={c.tienda.precio}
              nota={c.tienda.precioNota}
              pago={c.tienda.pago}
              boton={c.tienda.boton}
              tipo="catalogo"
            />
            <Assurances className="mt-4" />
          </>
        }
      />
      <CustomSystemSection {...c.sistema} />
      <CasesSection {...c.casos} sinEnlaces />
      <StepsSection id="proceso" {...c.proceso} />
      <FaqSection titulo={c.faq.titulo} subtitulo="" items={c.faq.items} />
      <CtaCard cta={c.cta} />
    </>
  );
}
