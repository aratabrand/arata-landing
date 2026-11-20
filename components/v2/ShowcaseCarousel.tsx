"use client";

import Link from "next/link";
import HoverCapsule from "./HoverCapsule";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight } from "./iconos";
import { cn } from "@/lib/utils";

// Parte interactiva del portafolio destacado (ref. 21st.dev captura 01).
// Las vistas previas (`slides`) llegan ya renderizadas desde el servidor: este
// componente solo decide cuál se ve. Así el navegador no hidrata los mockups.
// El avance lo marca la animación CSS de la barra (onAnimationEnd), sin setInterval.
// Pausa con hover/foco. Con reduced-motion no avanza solo.
// D-157: solo se monta la captura que se ve; la siguiente se monta cuando el carrusel lleva
// un rato a la vista (o al pasar el mouse por los botones). Antes se bajaban las 4 capturas
// de una vez aunque se viera una (PageSpeed: "Mejora la entrega de imágenes").

export type SlideMeta = { slug: string; nombre: string; etiqueta: string; frase: string };

const DURACION_MS = 6000;

export default function ShowcaseCarousel({ items, slides }: { items: SlideMeta[]; slides: ReactNode[] }) {
  const [actual, setActual] = useState(0);
  const [pausa, setPausa] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [montadas, setMontadas] = useState<ReadonlySet<number>>(() => new Set([0]));
  const caja = useRef<HTMLDivElement>(null);

  const montar = (i: number) => setMontadas((m) => (m.has(i) ? m : new Set(m).add(i)));

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // La que se ve siempre está montada; la siguiente se prepara a la mitad de su turno si el carrusel está a la vista
  useEffect(() => {
    montar(actual);
    const el = caja.current;
    if (!el) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(([e]) => {
      clearTimeout(t);
      if (e.isIntersecting) t = setTimeout(() => montar((actual + 1) % items.length), DURACION_MS / 2);
    });
    io.observe(el);
    return () => {
      clearTimeout(t);
      io.disconnect();
    };
  }, [actual, items.length]);

  const siguiente = () => setActual((i) => (i + 1) % items.length);
  const p = items[actual];

  return (
    <div
      ref={caja}
      onPointerEnter={() => setPausa(true)}
      onPointerLeave={() => setPausa(false)}
      onFocusCapture={() => setPausa(true)}
      onBlurCapture={() => setPausa(false)}
    >
      {/* La imagen también lleva al caso (con mouse: cápsula "Ver proyecto"). Con teclado se usa "Ver caso". */}
      <Link href={`/portafolio/${p.slug}`} tabIndex={-1} aria-hidden className="block">
        <HoverCapsule className="v2-frame aspect-[16/10]">
          {slides.map((slide, i) => (
            <div
              key={items[i].slug}
              aria-hidden={i !== actual}
              className={cn("absolute inset-0 transition-opacity duration-500", i === actual ? "opacity-100" : "opacity-0")}
            >
              {montadas.has(i) && slide}
            </div>
          ))}
        </HoverCapsule>
      </Link>

      {/* Barra de progreso segmentada */}
      <div className="mt-1 flex gap-1.5 px-1" role="group" aria-label="Elegir proyecto">
        {items.map((it, i) => (
          <button
            key={it.slug}
            type="button"
            aria-current={i === actual ? "true" : undefined}
            aria-label={`Ver ${it.nombre}`}
            onPointerEnter={() => montar(i)}
            onFocus={() => montar(i)}
            onClick={() => setActual(i)}
            className="group flex h-10 flex-1 items-center"
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
          <p className="text-xs font-semibold text-fog">{p.etiqueta}</p>
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
