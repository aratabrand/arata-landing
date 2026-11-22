import type { Metadata } from "next";
import { StepsSection } from "@/components/v2/HomeSections";
import { CtaCard, FaqSection } from "@/components/v2/Closing";
import IncludesBento from "@/components/v2/IncludesBento";
import {
  AddonCallout,
  CasesSection,
  ForWhoSection,
  NeedsSection,
  PriceSection,
  ServiceHero,
} from "@/components/v2/ServiceSections";
import { paginasWeb as c } from "@/content/servicios";
import JsonLd from "@/components/JsonLd";
import { paginaV2 } from "@/lib/seo";
import { migas, preguntas, servicio } from "@/lib/schema";
import { INICIO } from "@/content/inicio";
import { site } from "@/lib/site";

// Sitios y páginas (antes "Páginas que venden", D-176) — estructura 02-arquitectura.md §3.2, copy 03-copy.md (D-049 a D-051).
export const metadata: Metadata = paginaV2({
  path: "/paginas-web",
  title: c.meta.title,
  description: c.meta.description,
  image: "/og/og-paginas-web.png",
});

export default function PaginasWeb() {
  return (
    <>
      <JsonLd
        data={[
          servicio({ nombre: "Página Lista en 5 Días", tipo: "Diseño y desarrollo de páginas web", descripcion: c.meta.description, path: "/paginas-web", precioDesde: 400 }),
          preguntas(c.faq.items),
          {
            ...servicio({ nombre: "Sitio Corporativo con Panel", tipo: "Diseño y desarrollo de sitios web corporativos", descripcion: c.corporativo.intro.texto, path: "/paginas-web", precioDesde: 700 }),
            "@id": `${site.url}/paginas-web#corporativo`,
          },
          migas([{ nombre: "Inicio", path: INICIO }, { nombre: "Sitios y páginas", path: "/paginas-web" }]),
        ]}
      />
      <ServiceHero {...c.hero} tipo="pagina" />
      <ForWhoSection {...c.paraQuien} />
      <IncludesBento id="incluye" {...c.incluye} />
      <AddonCallout {...c.panel} />
      <CasesSection {...c.casos} />
      <NeedsSection {...c.necesitamos} />
      <StepsSection id="dias" {...c.dias} />
      <PriceSection {...c.precio} />
      {/* D-176: sitio corporativo con panel, con los mismos componentes de la página */}
      <div id="corporativo" className="scroll-mt-20">
        <AddonCallout {...c.corporativo.intro} />
      </div>
      <ForWhoSection {...c.corporativo.paraQuien} />
      <IncludesBento id="incluye-corporativo" {...c.corporativo.incluye} />
      <PriceSection {...c.corporativo.precio} />
      <FaqSection titulo={c.faq.titulo} subtitulo="" items={c.faq.items} />
      <CtaCard cta={c.cta} />
    </>
  );
}
