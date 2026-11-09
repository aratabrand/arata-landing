import type { Metadata } from "next";
import { CtaCard } from "@/components/v2/Closing";
import { Container, Glow } from "@/components/v2/primitives";
import { CaseCard } from "@/components/v2/ServiceSections";
import PortfolioFilter from "@/components/v2/PortfolioFilter";
import { filtroATipo, portafolioPagina as c, proyectos } from "@/content/proyectos";
import JsonLd from "@/components/JsonLd";
import { paginaV2 } from "@/lib/seo";
import { coleccion, migas } from "@/lib/schema";
import { INICIO } from "@/content/inicio";

// Portafolio — estructura 02-arquitectura.md §3.4, copy 03-copy.md (D-052).
export const metadata: Metadata = paginaV2({
  path: "/portafolio",
  title: c.meta.title,
  description: c.meta.description,
  image: "/og/og-portafolio.png",
});

export default function Portafolio() {
  return (
    <>
      <JsonLd data={[coleccion(proyectos), migas([{ nombre: "Inicio", path: INICIO }, { nombre: "Portafolio", path: "/portafolio" }])]} />
      <section className="relative overflow-hidden pb-16 pt-28 sm:pb-24 sm:pt-32">
        <Glow className="left-1/2 top-[-18rem] h-[40rem] w-[60rem] -translate-x-1/2" />
        <Container className="relative">
          <h1 className="max-w-3xl font-display text-[clamp(2.1rem,7vw,4rem)] font-extrabold leading-[1.02] tracking-display text-white">
            {c.titulo}
          </h1>
          <p className="mt-5 max-w-xl text-v2-lead text-fog">{c.texto}</p>
          <div className="mt-10">
            <PortfolioFilter
              filtros={c.filtros.map((label) => ({ label, tipo: filtroATipo[label] }))}
              cards={proyectos.map((p, i) => ({
                key: p.slug,
                tipos: p.tipos,
                node: <CaseCard proyecto={p} nivel="h2" priority={i === 0} sizes="(min-width: 640px) 580px, 100vw" />,
              }))}
            />
          </div>
        </Container>
      </section>
      <CtaCard cta={c.cta} />
    </>
  );
}
