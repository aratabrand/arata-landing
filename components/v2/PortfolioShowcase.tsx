"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Ring from "@/components/Ring";
import { Button } from "./Button";
import { Container, SectionHeader } from "./primitives";
import Spotlight from "./Spotlight";
import ProjectPreview from "./ProjectPreview";
import { portafolio } from "@/content/inicio";
import { proyectos } from "@/content/proyectos";
import { cn } from "@/lib/utils";

// Portafolio destacado (ref. 21st.dev captura 01):
// tarjeta grande con vista previa enmarcada + barra de progreso segmentada que avanza sola.
// El avance lo marca la animación CSS de la barra (onAnimationEnd), sin setInterval.
// Pausa con hover/foco. Con reduced-motion no avanza solo (se elige con los segmentos).

const DURACION_MS = 6000;

export default function PortfolioShowcase() {
  const [actual, setActual] = useState(0);
  const [pausa, setPausa] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const siguiente = () => setActual((i) => (i + 1) % proyectos.length);
  const p = proyectos[actual];

  return (
    <section id="trabajos" aria-labelledby="portafolio" className="scroll-mt-20 py-20 sm:py-28">
      <Container>
        <SectionHeader
          id="portafolio"
          title={portafolio.titulo}
          action={
            <Button href="/portafolio" variant="secondary">
              {portafolio.boton}
            </Button>
          }
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {/* Carrusel */}
          <Spotlight
            as="article"
            className="p-2 lg:col-span-2"
          >
            <div
              onPointerEnter={() => setPausa(true)}
              onPointerLeave={() => setPausa(false)}
              onFocusCapture={() => setPausa(true)}
              onBlurCapture={() => setPausa(false)}
            >
              <div className="v2-frame relative aspect-[16/10]">
                {proyectos.map((proj, i) => (
                  <div
                    key={proj.slug}
                    aria-hidden={i !== actual}
                    className={cn(
                      "absolute inset-0 transition-opacity duration-500",
                      i === actual ? "opacity-100" : "opacity-0"
                    )}
                  >
                    <ProjectPreview proyecto={proj} />
                  </div>
                ))}
              </div>

              {/* Barra de progreso segmentada */}
              <div className="mt-3 flex gap-1.5 px-1" role="group" aria-label="Elegir proyecto">
                {proyectos.map((proj, i) => (
                  <button
                    key={proj.slug}
                    type="button"
                    aria-current={i === actual ? "true" : undefined}
                    aria-label={`Ver ${proj.nombre}`}
                    onClick={() => setActual(i)}
                    className="group flex h-6 flex-1 items-center"
                  >
                    <span className="relative block h-[3px] w-full overflow-hidden rounded-full bg-white/10 group-hover:bg-white/16">
                      <span
                        className={cn(
                          "v2-progress-fill absolute inset-0 rounded-full bg-white",
                          i < actual && "is-done",
                          i === actual && (reduced ? "is-done" : "is-active")
                        )}
                        style={{
                          ["--dur" as string]: `${DURACION_MS}ms`,
                          animationPlayState: pausa ? "paused" : "running",
                        }}
                        onAnimationEnd={i === actual ? siguiente : undefined}
                      />
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3 px-3 pb-3 pt-3 sm:flex-row sm:items-end sm:justify-between sm:px-4">
                <div aria-live="polite">
                  <p className="text-xs font-semibold text-brand-soft">{p.etiqueta}</p>
                  <h3 className="mt-1 font-display text-v2-h3 font-bold tracking-heading text-white">{p.nombre}</h3>
                  <p className="mt-1 max-w-lg text-sm text-fog">{p.frase}</p>
                </div>
                <Link
                  href={`/portafolio/${p.slug}`}
                  className="inline-flex h-11 shrink-0 items-center gap-1.5 text-sm font-semibold text-white hover:text-lime"
                >
                  Ver caso <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Spotlight>

          {/* Dato útil en vez de decoración (CLAUDE.md §3): velocidad real */}
          <Spotlight as="article" className="flex flex-col justify-between gap-8 p-6">
            <div>
              <p className="text-xs font-semibold text-brand-soft">Medido en Google PageSpeed</p>
              <h3 className="mt-2 font-display text-v2-h3 font-bold tracking-heading text-white">
                Así de rápido es nuestro sitio
              </h3>
            </div>
            <div className="flex items-center justify-around gap-4">
              <Ring value={100} centerValue={100} size={116} stroke={10} label="Escritorio" />
              <Ring value={93} centerValue={93} size={116} stroke={10} label="Celular" />
            </div>
            <p className="text-sm text-fog">
              Lo mismo que te garantizamos: <span className="font-semibold text-white">90 o más</span> en tu página.
            </p>
          </Spotlight>
        </div>
      </Container>
    </section>
  );
}
