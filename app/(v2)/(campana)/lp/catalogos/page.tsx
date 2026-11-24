import type { Metadata } from "next";
import { ProblemSection, StepsSection } from "@/components/v2/HomeSections";
import { CtaCard, FaqSection } from "@/components/v2/Closing";
import { CasesSection, PriceBar, ServiceHero } from "@/components/v2/ServiceSections";
import { Assurances } from "@/components/v2/Pricing";
import CasosExito from "@/components/v2/CasosExito";
import MarcoCampana from "@/components/v2/campana/MarcoCampana";
import CintaOferta from "@/components/v2/campana/CintaOferta";
import { ofertaVigente, textosLanding } from "@/content/campanas/catalogos";
import { paginaV2 } from "@/lib/seo";

// Landing de la campaña de Meta (D-189): copia de /catalogos-y-sistemas con marco propio.
// Textos en content/campanas/catalogos.ts (la página del sitio no se toca).
// noindex (lo pone el layout de (campana)), sin JSON-LD y fuera del sitemap.
// D-192: la oferta de noviembre termina sola. La página es estática pero se vuelve a armar
// cada hora: pasada la fecha sale sin cinta y con el precio normal.
export const revalidate = 3600;

const AGENDAR_CATALOGO = "/agendar?tipo=catalogo";

export function generateMetadata(): Metadata {
  const c = textosLanding(ofertaVigente());
  return paginaV2({
    path: "/lp/catalogos",
    title: c.meta.title,
    description: c.meta.description,
    image: "/og/og-catalogos-y-sistemas.png",
  });
}

export default function LandingCatalogos() {
  const conOferta = ofertaVigente();
  const c = textosLanding(conOferta);
  return (
    <MarcoCampana
      cta={{ texto: "Agendar reunión", enlace: AGENDAR_CATALOGO }}
      cinta={conOferta ? <CintaOferta enlace={AGENDAR_CATALOGO} /> : undefined}
    >
      <ServiceHero {...c.hero} tipo="catalogo" />
      <ProblemSection id="problema-catalogo" titulo={c.problema.titulo} cierre={c.problema.cierre} items={c.problema.items} />
      <CasosExito
        id="casos-catalogo"
        servicio="catalogo"
        sinEnlaces
        textos={c.casosExito}
        pie={
          <>
            <PriceBar
              precio={c.tienda.precio}
              antes={c.tienda.precioAntes}
              nota={c.tienda.precioNota}
              pago={c.tienda.pago}
              boton={c.tienda.boton}
              tipo="catalogo"
            />
            <Assurances className="mt-4" items={c.aseguramientos} />
          </>
        }
      />
      <CasesSection {...c.casos} sinEnlaces />
      <StepsSection id="proceso" {...c.proceso} />
      <FaqSection titulo={c.faq.titulo} subtitulo="" items={c.faq.items} />
      <CtaCard cta={c.cta} />
    </MarcoCampana>
  );
}
