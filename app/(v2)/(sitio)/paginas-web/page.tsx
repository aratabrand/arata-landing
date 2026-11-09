import type { Metadata } from "next";
import { StepsSection } from "@/components/v2/HomeSections";
import { CtaCard, FaqSection } from "@/components/v2/Closing";
import {
  AddonCallout,
  CasesSection,
  ForWhoSection,
  IncludesSection,
  NeedsSection,
  PriceSection,
  ServiceHero,
} from "@/components/v2/ServiceSections";
import { paginasWeb as c } from "@/content/servicios";

// Páginas que venden — estructura 02-arquitectura.md §3.2, copy 03-copy.md (D-049 a D-051).
export const metadata: Metadata = {
  title: c.meta.title,
  description: c.meta.description,
  alternates: { canonical: "/paginas-web" },
};

export default function PaginasWeb() {
  return (
    <>
      <ServiceHero {...c.hero} tipo="pagina" />
      <ForWhoSection {...c.paraQuien} />
      <IncludesSection id="incluye" {...c.incluye} conRejilla />
      <AddonCallout {...c.panel} />
      <CasesSection {...c.casos} />
      <NeedsSection {...c.necesitamos} />
      <StepsSection id="dias" {...c.dias} />
      <PriceSection {...c.precio} />
      <FaqSection titulo={c.faq.titulo} subtitulo="" items={c.faq.items} />
      <CtaCard cta={c.cta} />
    </>
  );
}
