"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Parte interactiva del portafolio destacado (ref. 21st.dev captura 01).
// Las vistas previas (`slides`) llegan ya renderizadas desde el servidor: este
// componente solo decide cuál se ve. Así el navegador no hidrata los mockups.
// El avance lo marca la animación CSS de la barra (onAnimationEnd), sin setInterval.
// Pausa con hover/foco. Con reduced-motion no avanza solo.

export type SlideMeta = { slug: string; nombre: string; etiqueta: string; frase: string };

const DURACION_MS = 6000;

export default function ShowcaseCarousel({ items, slides }: { items: SlideMeta[]; slides: ReactNode[] }) {
  const [actual, setActual] = useState(0);
  const [pausa, setPausa] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const siguiente = () => setActual((i) => (i + 1) % items.length);
  const p = items[actual];

  return (
    <div
      onPointerEnter={() => setPausa(true)}
      onPointerLeave={() => setPausa(false)}
      onFocusCapture={() => setPausa(true)}
      onBlurCapture={() => setPausa(false)}
    >
      <div className="v2-frame relative aspect-[16/10]">
        {slides.map((slide, i) => (
          <div
            key={items[i].slug}
            aria-hidden={i !== actual}
            className={cn("absolute inset-0 transition-opacity duration-500", i === actual ? "opacity-100" : "opacity-0")}
          >
            {slide}
          </div>
        ))}
      </div>

      {/* Barra de progreso segmentada */}
      <div className="mt-3 flex gap-1.5 px-1" role="group" aria-label="Elegir proyecto">
        {items.map((it, i) => (
          <button
            key={it.slug}
            type="button"
            aria-current={i === actual ? "true" : undefined}
            aria-label={`Ver ${it.nombre}`}
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
                style={{ ["--dur" as string]: `${DURACION_MS}ms`, animationPlayState: pausa ? "paused" : "running" }}
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
  );
}
