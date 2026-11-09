import type { Metadata } from "next";
import { ProblemSection, StepsSection } from "@/components/v2/HomeSections";
import { CtaCard, FaqSection } from "@/components/v2/Closing";
import {
  CasesSection,
  CustomSystemSection,
  IncludesSection,
  PriceBar,
  ServiceHero,
} from "@/components/v2/ServiceSections";
import { Assurances } from "@/components/v2/Pricing";
import { catalogos as c } from "@/content/servicios";

// Catálogos y sistemas a medida — estructura 02-arquitectura.md §3.3, copy 03-copy.md (D-049).
export const metadata: Metadata = {
  title: c.meta.title,
  description: c.meta.description,
  alternates: { canonical: "/catalogos-y-sistemas" },
};

export default function CatalogosYSistemas() {
  return (
    <>
      <ServiceHero {...c.hero} tipo="catalogo" />
      <ProblemSection id="problema-catalogo" titulo={c.problema.titulo} cierre="" items={c.problema.items} />
      <IncludesSection
        id="tienda"
        titulo={c.tienda.titulo}
        items={c.tienda.items}
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
      <CasesSection {...c.casos} />
      <StepsSection id="proceso" {...c.proceso} />
      <FaqSection titulo={c.faq.titulo} subtitulo="" items={c.faq.items} />
      <CtaCard cta={c.cta} />
    </>
  );
}
