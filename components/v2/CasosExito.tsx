import type { ReactNode } from "react";
import CasosReel, { type CasoReel } from "./CasosReel";
import { Container, Eyebrow, Glow } from "./primitives";
import Reveal from "@/components/Reveal";
import { casosExito, casosVisibles, datosDelCaso } from "@/content/casos-exito";
import { proyectos } from "@/content/proyectos";

// Sección "Casos de éxito" del Inicio (D-128). Componente de servidor: arma los datos
// y el celular con el reel es la única parte con JavaScript. Sin casos publicables, no se muestra.
// En /catalogos-y-sistemas va con `servicio="catalogo"` (solo casos de catálogo) y la franja de precio en `pie` (D-129).
export default function CasosExito({
  id = "casos",
  servicio,
  pie,
}: {
  id?: string;
  servicio?: "pagina" | "catalogo";
  pie?: ReactNode;
} = {}) {
  const items: CasoReel[] = casosVisibles(servicio).flatMap((c) => {
    const p = proyectos.find((x) => x.slug === c.slug);
    if (!p) return [];
    return [
      {
        slug: c.slug,
        nombre: p.nombre,
        servicios: p.ficha.servicios,
        lugar: [p.ficha.sector, p.ficha.ciudad].filter(Boolean).join(" · "),
        titulo: c.titulo,
        descripcion: c.descripcion,
        testimonio: c.testimonio,
        logo: c.logo,
        muestra: c.muestra,
        video: c.video,
        datos: datosDelCaso(c.slug),
      },
    ];
  });

  if (items.length === 0) return null;

  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className="relative scroll-mt-20 overflow-hidden py-20 sm:py-28">
      <Glow className="left-[-10%] top-[30%] h-[520px] w-[520px] opacity-60" />
      <Container className="relative">
        <Reveal className="max-w-2xl">
          <Eyebrow>{casosExito.eyebrow}</Eyebrow>
          <h2 id={`${id}-titulo`} className="mt-3 font-display text-v2-h2 font-bold tracking-heading text-white">
            {casosExito.titulo}
          </h2>
          <p className="mt-3 max-w-xl text-v2-lead text-fog">{casosExito.texto}</p>
        </Reveal>

        <Reveal className="mt-14 sm:mt-16" variant="scale">
          <CasosReel
            items={items}
            textos={{
              sonidoActivar: casosExito.sonidoActivar,
              sonidoQuitar: casosExito.sonidoQuitar,
              pausar: casosExito.pausar,
              reproducir: casosExito.reproducir,
              anterior: casosExito.anterior,
              siguiente: casosExito.siguiente,
              verCaso: casosExito.verCaso,
            }}
          />
        </Reveal>
        {pie && <div className="mt-16 sm:mt-20">{pie}</div>}
      </Container>
    </section>
  );
}
