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
import JsonLd from "@/components/JsonLd";
import { site } from "@/lib/site";
import { paginaV2 } from "@/lib/seo";
import { migas, preguntas, servicio } from "@/lib/schema";
import { INICIO } from "@/content/inicio";

// Catálogos y sistemas a medida — estructura 02-arquitectura.md §3.3, copy 03-copy.md (D-049).
export const metadata: Metadata = paginaV2({
  path: "/catalogos-y-sistemas",
  title: c.meta.title,
  description: c.meta.description,
  image: "/og/og-catalogos-y-sistemas.png",
});

export default function CatalogosYSistemas() {
  return (
    <>
      <JsonLd
        data={[
          servicio({ nombre: "Tienda por WhatsApp en 5 Días", tipo: "Catálogo en línea con pedido por WhatsApp", descripcion: c.meta.description, path: "/catalogos-y-sistemas", precioDesde: 800 }),
          {
            ...servicio({ nombre: "Tu Negocio en Orden", tipo: "Sistemas a medida para negocios", descripcion: `${c.sistema.intro} reservas, menú digital, registro de clientes (CRM) o lo que tu negocio necesite. ${c.sistema.cierre}`, path: "/catalogos-y-sistemas" }),
            "@id": `${site.url}/catalogos-y-sistemas#sistemas`,
          },
          preguntas(c.faq.items),
          migas([{ nombre: "Inicio", path: INICIO }, { nombre: "Catálogos y sistemas a medida", path: "/catalogos-y-sistemas" }]),
        ]}
      />
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
