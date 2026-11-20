"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronUp, Pause, Play, Volume2, VolumeX } from "./iconos";
import { medir } from "@/lib/medir";
import type { Testimonio } from "@/content/casos-exito";

// Casos de éxito (D-128): el video de cada proyecto dentro de un celular, con su descripción y testimonio al lado.
// - Con 2+ casos: flechas arriba/abajo; el cambio es vertical, tipo reel (el siguiente sube desde abajo).
//   Video, textos y datos cambian juntos.
// - Rendimiento: el video no se pide hasta que la sección está cerca (600 px); solo el activo se reproduce,
//   y se pausa al salir de pantalla. Solo se animan transform y opacity.
// - Arranca sin sonido (regla de los navegadores); el botón dentro del video lo activa.
// - Movimiento reducido: sin reproducción automática ni deslizamientos.

export type CasoReel = {
  slug: string;
  nombre: string;
  servicios: string;
  lugar: string;
  titulo: string;
  descripcion: string;
  testimonio?: Testimonio;
  logo?: string;
  muestra?: boolean;
  video: { mp4: string; poster: string; audio: boolean; ajuste?: "cover" | "contain" };
  datos: { valor: string; texto: string }[];
};

export type TextosReel = {
  sonidoActivar: string;
  sonidoQuitar: string;
  pausar: string;
  reproducir: string;
  anterior: string;
  siguiente: string;
  verCaso: string;
};

function Estrellas({ n }: { n: number }) {
  return (
    <div className="flex gap-1" role="img" aria-label={`${n} de 5 estrellas`}>
      {Array.from({ length: 5 }, (_, k) => (
        <svg key={k} viewBox="0 0 20 20" className={k < n ? "h-4 w-4 fill-lime" : "h-4 w-4 fill-white/15"} aria-hidden>
          <path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z" />
        </svg>
      ))}
    </div>
  );
}

export default function CasosReel({ items, textos }: { items: CasoReel[]; textos: TextosReel }) {
  const [i, setI] = useState(0);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const root = useRef<HTMLDivElement | null>(null);
  const phone = useRef<HTMLDivElement | null>(null);
  const vids = useRef<(HTMLVideoElement | null)[]>([]);
  const bar = useRef<HTMLSpanElement | null>(null);
  const varios = items.length > 1;
  const activo = items[i];

  // Cerca (pide el video) y en pantalla (reproduce). Un solo observer por estado.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPaused(true);
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      setInView(true);
      return;
    }
    const cerca = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          cerca.disconnect();
        }
      },
      { rootMargin: "600px 0px" }
    );
    const vista = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    cerca.observe(el);
    // En pantalla = el celular visible (no toda la sección, que en móvil es más alta que la pantalla)
    vista.observe(phone.current ?? el);
    return () => {
      cerca.disconnect();
      vista.disconnect();
    };
  }, []);

  // Solo el activo suena y se mueve; los demás quedan quietos en su primer cuadro.
  useEffect(() => {
    vids.current.forEach((v, k) => {
      if (!v) return;
      v.muted = muted;
      if (k === i && near && inView && !paused) {
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [i, near, inView, paused, muted]);

  // Barra de progreso tipo historia (transform, sin re-render).
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const v = vids.current[i];
      if (v && bar.current && v.duration) bar.current.style.transform = `scaleX(${v.currentTime / v.duration})`;
      raf = requestAnimationFrame(tick);
    };
    if (near && inView && !paused) raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [i, near, inView, paused]);

  const actual = useRef(0);
  const ir = useCallback(
    (paso: 1 | -1, origen: "flecha" | "fin" | "teclado") => {
      const n = (actual.current + paso + items.length) % items.length;
      actual.current = n;
      const v = vids.current[n];
      if (v) v.currentTime = 0;
      if (bar.current) bar.current.style.transform = "scaleX(0)";
      setI(n);
      if (origen !== "fin") medir("caso_exito_cambio", { caso: items[n].slug, origen });
    },
    [items]
  );

  const alternarSonido = () => {
    const ahora = !muted;
    setMuted(ahora);
    if (!ahora) setPaused(false);
    medir("caso_exito_sonido", { caso: activo.slug, sonido: ahora ? "no" : "si" });
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!varios) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      ir(1, "teclado");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      ir(-1, "teclado");
    }
  };

  return (
    <div
      ref={root}
      className="cx grid items-center gap-12 lg:grid-cols-[auto_1fr] lg:gap-20"
      role="region"
      aria-roledescription="carrusel"
      aria-label="Casos de éxito"
      onKeyDown={onKey}
    >
      {/* Celular + flechas */}
      <div className="flex items-center justify-center gap-3 sm:gap-5">
        <div className="relative">
          {/* Atmósfera: anillos y luz morada detrás del celular */}
          <div aria-hidden className="cx-anillos" />

          <div ref={phone} className="cx-phone">
            <div className="cx-screen">
              {items.map((c, k) => (
                <div
                  key={c.slug}
                  className={`cx-slide ${k === i ? "is-on" : k < i ? "is-arriba" : "is-abajo"}`}
                  aria-hidden={k !== i}
                >
                  <video
                    ref={(el) => {
                      vids.current[k] = el;
                    }}
                    className={`h-full w-full ${c.video.ajuste === "contain" ? "object-contain" : "object-cover"}`}
                    src={near ? c.video.mp4 : undefined}
                    poster={near ? c.video.poster : undefined}
                    muted
                    playsInline
                    loop={!varios}
                    preload={near && k === i ? "auto" : "none"}
                    onEnded={() => varios && k === i && ir(1, "fin")}
                    aria-label={`Video del ${c.servicios.toLowerCase()} de ${c.nombre}`}
                  />
                </div>
              ))}

              {/* Tocar el video = pausar / reproducir */}
              <button
                type="button"
                className="cx-tap"
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? textos.reproducir : textos.pausar}
              >
                <span className={`cx-play ${paused ? "is-on" : ""}`} aria-hidden>
                  {paused ? <Play className="h-6 w-6 translate-x-px fill-white" /> : <Pause className="h-6 w-6 fill-white" />}
                </span>
              </button>

              {/* Progreso del video, como la barra de inicio del iPhone (no tapa lo grabado) */}
              <div className="cx-progreso" aria-hidden>
                <span ref={bar} />
              </div>

              {/* Sonido (solo si el video tiene audio) */}
              {activo.video.audio && (
                <button type="button" onClick={alternarSonido} className="cx-sonido" aria-pressed={!muted}>
                  {muted ? <VolumeX className="h-4 w-4" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}
                  <span className={`cx-ondas ${muted ? "" : "is-on"}`} aria-hidden>
                    <i />
                    <i />
                    <i />
                    <i />
                  </span>
                  {muted ? textos.sonidoActivar : textos.sonidoQuitar}
                </button>
              )}

              <div aria-hidden className="cx-isla" />
            </div>
          </div>

          {/* Datos reales del proyecto, debajo del celular (cambian con el caso) */}
          <div className="cx-datos" aria-hidden>
            {items.map((c, k) => (
              <div key={c.slug} className={`cx-grupo ${k === i ? "is-on" : ""}`}>
                {c.datos.map((d, j) => (
                  <div key={j} className="cx-dato-in" style={{ animationDelay: `${j * -3}s` } as CSSProperties}>
                      <span className="font-display text-lg font-bold leading-none text-lime">{d.valor}</span>
                      <span className="text-[0.7rem] leading-tight text-fog">{d.texto}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {activo.muestra && (
            <span className="absolute -top-4 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-ink">
              Muestra · solo preview
            </span>
          )}
        </div>

        {varios && (
          <div className="flex flex-col items-center gap-3">
            <button type="button" onClick={() => ir(-1, "flecha")} className="cx-flecha" aria-label={textos.anterior}>
              <ChevronUp className="h-5 w-5" aria-hidden />
            </button>
            <p className="font-display text-sm font-bold tabular-nums text-white" aria-live="polite">
              <span className="sr-only">Caso </span>
              {i + 1}
              <span className="text-fog-dim"> / {items.length}</span>
              <span className="sr-only">: {activo.nombre}</span>
            </p>
            <button type="button" onClick={() => ir(1, "flecha")} className="cx-flecha" aria-label={textos.siguiente}>
              <ChevronDown className="h-5 w-5" aria-hidden />
            </button>
          </div>
        )}
      </div>

      {/* Texto del caso: todos apilados en la misma celda (la altura no salta al cambiar) */}
      <div className="grid">
        {items.map((c, k) => (
          <article
            key={c.slug}
            className={`cx-txt [grid-area:1/1] ${k === i ? "is-on" : k < i ? "is-arriba" : "is-abajo"}`}
            aria-hidden={k !== i}
            // React 18 no tipa `inert`: el caso oculto no recibe foco
            {...((k !== i ? { inert: "true" } : {}) as Record<string, string>)}
          >
            {c.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={c.logo}
                alt={c.nombre}
                loading="lazy"
                decoding="async"
                className="cx-i mb-5 h-8 w-auto max-w-[9rem] object-contain object-left"
                style={{ "--d": 0 } as CSSProperties}
              />
            )}
            <p className="cx-i text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-fog" style={{ "--d": 0 } as CSSProperties}>
              {c.logo ? c.lugar : `${c.nombre} · ${c.lugar}`}
            </p>
            <h3
              className="cx-i mt-3 max-w-xl font-display text-v2-h3 font-bold tracking-heading text-white"
              style={{ "--d": 1 } as CSSProperties}
            >
              {c.titulo}
            </h3>
            <p className="cx-i mt-4 max-w-lg text-v2-lead text-fog" style={{ "--d": 2 } as CSSProperties}>
              {c.descripcion}
            </p>

            {c.testimonio && (
              <figure
                className="cx-i mt-8 max-w-lg rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md sm:p-6"
                style={{ "--d": 3 } as CSSProperties}
              >
                <Estrellas n={c.testimonio.estrellas} />
                <blockquote className="mt-4 text-[0.98rem] leading-relaxed text-white">“{c.testimonio.texto}”</blockquote>
                <figcaption className="mt-4 text-sm">
                  <span className="font-semibold text-white">{c.testimonio.nombre}</span>
                  <span className="text-fog"> · {c.testimonio.cargo}</span>
                </figcaption>
              </figure>
            )}

            <Link
              href={`/portafolio/${c.slug}`}
              className="cx-i group mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-lime"
              style={{ "--d": 4 } as CSSProperties}
              tabIndex={k === i ? undefined : -1}
            >
              {textos.verCaso}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
