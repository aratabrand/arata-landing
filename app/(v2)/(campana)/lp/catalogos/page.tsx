import type { Metadata } from "next";
import { ProblemSection, StepsSection } from "@/components/v2/HomeSections";
import { CtaCard, FaqSection } from "@/components/v2/Closing";
import { CasesSection, IncludesSection, PriceBar, ServiceHero } from "@/components/v2/ServiceSections";
import { Assurances } from "@/components/v2/Pricing";
import CasosExito from "@/components/v2/CasosExito";
import MarcoCampana from "@/components/v2/campana/MarcoCampana";
import CintaOferta from "@/components/v2/campana/CintaOferta";
import { AGENDAR_LP, ofertaVigente, textosLanding } from "@/content/campanas/catalogos";
import { paginaV2 } from "@/lib/seo";

// Landing de la campaña de Meta (D-189): copia de /catalogos-y-sistemas con marco propio.
// Textos en content/campanas/catalogos.ts (la página del sitio no se toca).
// noindex (lo pone el layout de (campana)), sin JSON-LD y fuera del sitemap.
// D-192: la oferta de noviembre termina sola. La página es estática pero se vuelve a armar
// cada hora: pasada la fecha sale sin cinta y con el precio normal.
export const revalidate = 3600;

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
      cta={{ texto: "Agendar reunión", enlace: AGENDAR_LP }}
      cinta={conOferta ? <CintaOferta enlace={AGENDAR_LP} /> : undefined}
    >
      <ServiceHero {...c.hero} tipo="catalogo" enlace={AGENDAR_LP} />
      <ProblemSection id="problema-catalogo" titulo={c.problema.titulo} cierre={c.problema.cierre} items={c.problema.items} />
      <CasosExito id="casos-catalogo" servicio="catalogo" sinEnlaces textos={c.casosExito} />
      {/* D-198: primero todo lo que recibe (pila de valor), después el bono, el precio y las garantías */}
      <IncludesSection
        id="incluye"
        titulo={c.incluye.titulo}
        items={c.incluye.items}
        pie={
          <div className="mt-10 space-y-4">
            {c.incluye.bono && (
              <div className="flex flex-col gap-2 rounded-card border border-lime/30 bg-surface-1 p-5 sm:flex-row sm:items-center sm:gap-4 sm:p-6">
                <span className="inline-flex w-fit rounded-full bg-lime px-3 py-1 text-xs font-semibold text-ink">{c.incluye.bono.etiqueta}</span>
                <p className="font-display text-lg font-bold tracking-heading text-white">{c.incluye.bono.texto}</p>
              </div>
            )}
            <PriceBar
              precio={c.tienda.precio}
              antes={c.tienda.precioAntes}
              enlace={AGENDAR_LP}
              nota={c.tienda.precioNota}
              pago={c.tienda.pago}
              boton={c.tienda.boton}
              tipo="catalogo"
            />
            <article className="v2-card p-6">
              <span className="inline-flex rounded-full bg-lime px-3 py-1 text-xs font-semibold text-ink">{c.garantia.etiqueta}</span>
              <h3 className="mt-3 font-display text-xl font-bold tracking-heading text-white">{c.garantia.titulo}</h3>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-fog">{c.garantia.texto}</p>
            </article>
            <Assurances items={c.aseguramientos} />
          </div>
        }
      />
      <CasesSection {...c.casos} sinEnlaces />
      <StepsSection id="proceso" {...c.proceso} />
      <FaqSection titulo={c.faq.titulo} subtitulo="" items={c.faq.items} />
      <CtaCard cta={c.cta} />
    </MarcoCampana>
  );
}
