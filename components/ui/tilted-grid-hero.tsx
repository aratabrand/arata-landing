"use client";

// Vendido de 21st.dev ("tilted-grid-hero"), adaptado a Arata San:
// - `bg-muted` (token shadcn que no existe aquí) → `bg-surface-2` (token v2).
// - Prop `ratio` (alto/ancho): la geometría depende solo de esa proporción, así
//   que con una proporción fija el servidor ya calcula la curva exacta y la banda
//   se pinta bien desde el primer frame, SIN esperar a que JavaScript mida
//   (antes quedaba oculta hasta hidratar y el LCP llegaba a ~5 s en celular).
// - Cada franja dibuja su parte de la captura en un <canvas> (no <img> ni
//   background-image). Un canvas NO es candidato a LCP, así que la banda en
//   movimiento nunca le quita el LCP al <h1>. Con <img>/fondo, cada tarjeta que
//   entraba agrandada por la perspectiva era un candidato nuevo y el LCP del
//   celular subía a ~5 s (Lighthouse 80). Las capturas se piden después de
//   hidratar, en tiempo libre, y una banda oculta por CSS no descarga nada.
// - Prop `optimize`: pide al optimizador de Next la variante del ancho justo
//   según la densidad de pantalla. Se quitó la precarga de originales.
// El resto es el componente original.

import * as React from "react";
import { cn } from "@/lib/utils";

/* ── the curved row ──────────────────────────────────────────────
 * Scroll Tilted Grid turned on its side, with the tilt drawn as a curve.
 * One row of images streams from right to left around the inside of a
 * cylinder. The centre faces you flat, the ends bend toward you so each
 * end image curves along its length, and the ends fade into the page.
 *
 * A CSS box can't bend, so every tile is cut into SLICES vertical strips,
 * each a flat facet of the cylinder showing its share of the image. The
 * strips sit still inside their tile, each turned its own few degrees
 * round the cylinder's axis, and the tile (preserve-3d) is what moves: one
 * rotateY about that same axis carries the whole tile along the arc. A
 * tile is one animation, so its strips can never drift apart or show
 * different images. Only a tile's delay differs, and that sets where on
 * the arc it sits. The band is transform-only on the compositor; the fade
 * is a static mask over it.
 *
 * The only JS is a ResizeObserver that sizes the loop, a handler that
 * hands a tile its next image each time it wraps, out of sight, and the
 * canvas drawing (Arata: canvas so the band is never the LCP).
 * ─────────────────────────────────────────────────────────────── */

// Strips per tile. Each is a few degrees of arc, too little to read as a
// facet; fewer starts to show corners along the top and bottom edges.
const SLICES = 16;

// Camera distance from the screen, as a multiple of the cylinder's radius.
const CAMERA = 1.6;

/** Cylinder radius, as a share of the hero's width, that puts the frame's edge `bend` radians round the arc. */
function arc(bend: number) {
  return (CAMERA - 1 + Math.cos(bend)) / (2 * CAMERA * Math.sin(bend));
}

// A tile is never wider than this share of the hero, so a phone still
// shows its neighbours instead of one tile edge to edge.
const MAX_WIDTH = 55;

/** Lays the loop on the cylinder (see original docs). Angles in degrees. */
function measure(width: number, height: number, tile: number, aspect: number, gap: number, bend: number) {
  const h = Math.min((tile / 100) * height, ((MAX_WIDTH / 100) * width) / aspect);
  const radius = width * arc(bend);
  if (!(h > 0) || !(radius > 0)) return { columns: 2, sweep: 0, unit: 0, limit: 0 };
  const deg = (rad: number) => (rad * 180) / Math.PI;
  const unit = deg(h / radius);
  const pitch = (aspect + gap / 100) * unit;
  const limit = deg(bend) + (aspect * unit) / 2;
  // Capped so a hero squeezed to a sliver can't mount thousands of tiles.
  const columns = Math.min(60, Math.max(2, Math.ceil((2 * limit) / pitch)));
  const round = (n: number) => +n.toFixed(4);
  const sweep = round((columns * pitch) / 2);
  return { columns, sweep, unit: round(unit), limit: round(Math.min(sweep, limit)) };
}

export type TiltedGridImage = {
  src: string;
  /** Only used if you drop the decorative treatment; the band is aria-hidden. */
  alt?: string;
};

export type TiltedGridHeroProps = {
  /** Images run along the row in order; short lists repeat. */
  images: TiltedGridImage[];
  /** Seconds for the row to advance by one tile. @default 4 */
  speed?: number;
  /** Tile height, as a percentage of the hero's height. @default 26 */
  tileHeight?: number;
  /** Tile width divided by tile height. @default 16 / 9 */
  aspectRatio?: number;
  /** Space between tiles, as a percentage of a tile's height. @default 6 */
  gap?: number;
  /** Vertical centre of the row, as a percentage of the hero's height. @default 56 */
  axis?: number;
  /** How far the row has bent round by the frame's edge, in degrees (5–85). @default 80 */
  curve?: number;
  /** Width of the fade at each end, as a percentage of the hero's width. @default 12 */
  fade?: number;
  /**
   * Alto / ancho fijo de la banda (Arata). Con esto la curva se calcula en el
   * servidor y no hay que ocultar la banda hasta medirla.
   */
  ratio?: number;
  /** Usar el optimizador de imágenes de Next (srcset por ancho). @default true */
  optimize?: boolean;
  /** Ancho (px CSS) aprox. de una tarjeta: elige la variante 1x/2x del optimizador. @default 384 */
  tileWidth?: number;
  /** Content rendered above the band. */
  children?: React.ReactNode;
  className?: string;
};

// Anchos que el optimizador de Next acepta por defecto (imageSizes + deviceSizes).
const WIDTHS = [384, 640, 828, 1080];
const pick = (px: number) => WIDTHS.find((w) => w >= px) ?? WIDTHS[WIDTHS.length - 1];

// Una sola descarga por URL, compartida por todas las franjas y bandas.
const cache = new Map<string, Promise<HTMLImageElement>>();
function loadImage(url: string) {
  let p = cache.get(url);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const im = new Image();
      im.decoding = "async";
      im.onload = () => resolve(im);
      im.onerror = reject;
      im.src = url;
    });
    p.catch(() => cache.delete(url));
    cache.set(url, p);
  }
  return p;
}

/** Dibuja en el canvas la franja `k` de la imagen, recortada tipo object-fit: cover. */
function drawSlice(cv: HTMLCanvasElement, im: HTMLImageElement, k: number, aspect: number, share: number, dpr: number) {
  const w = cv.offsetWidth;
  const h = cv.offsetHeight;
  if (!w || !h) return;
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(h * dpr);
  const ctx = cv.getContext("2d");
  if (!ctx) return;
  const iw = im.naturalWidth;
  const ih = im.naturalHeight;
  // Recorte "cover" de la imagen a la proporción de la tarjeta.
  const cw = iw / ih > aspect ? ih * aspect : iw;
  const ch = iw / ih > aspect ? ih : iw / aspect;
  const cx = (iw - cw) / 2;
  const cy = (ih - ch) / 2;
  const tileW = h * aspect; // ancho CSS de la tarjeta (alto = h)
  const sx = cx + ((k * share) / aspect) * cw;
  const sw = cw * (w / tileW);
  ctx.drawImage(im, sx, cy, Math.min(sw, iw - sx), ch, 0, 0, cv.width, cv.height);
}

export function TiltedGridHero({
  images,
  speed = 4,
  tileHeight = 26,
  aspectRatio = 16 / 9,
  gap = 6,
  axis = 56,
  curve = 80,
  fade = 12,
  ratio,
  optimize = true,
  tileWidth = 384,
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & TiltedGridHeroProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const orbit = `tgh-o-${id}`;
  const tile = `tgh-t-${id}`;
  const bend = (Math.min(85, Math.max(5, curve)) * Math.PI) / 180;

  // Null until the observer has measured the hero (band hidden until then).
  const [layout, setLayout] = React.useState<ReturnType<typeof measure> | null>(null);

  // The image each tile shows; only changes when the tile wraps out of sight.
  const [shown, setShown] = React.useState<Record<number, number>>({});
  // Cambia con cada redimensión: los canvas se vuelven a dibujar al tamaño nuevo.
  const [size, setSize] = React.useState("");

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize(`${Math.round(width)}x${Math.round(height)}`);
      const next = measure(width, height, tileHeight, aspectRatio, gap, bend);
      setLayout((prev) =>
        prev?.columns === next.columns && prev.sweep === next.sweep && prev.unit === next.unit ? prev : next
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [tileHeight, aspectRatio, gap, bend]);

  // Con `ratio`, el cálculo del servidor ya es el definitivo (la geometría no depende del tamaño).
  const fallback = ratio ? measure(1000, 1000 * ratio, tileHeight, aspectRatio, gap, bend) : measure(1200, 560, tileHeight, aspectRatio, gap, bend);
  const { columns, sweep, unit, limit } = layout ?? fallback;
  const visible = ratio ? true : !!layout;

  const u = (n: number) =>
    `calc(${+n.toFixed(4)} * min(${tileHeight}cqh, ${+(MAX_WIDTH / aspectRatio).toFixed(4)}cqw))`;

  const r = 100 * arc(bend);
  const radius = `${+r.toFixed(3)}cqw`;
  const turn = (deg: number) => `translateZ(${radius}) rotateY(${+deg.toFixed(4)}deg) translateZ(-${radius})`;

  const hide = +(((sweep - limit) / (2 * sweep || 1)) * 100).toFixed(4);
  const css =
    `@keyframes ${orbit}{` +
    `from{transform:${turn(-sweep)}}to{transform:${turn(sweep)}}` +
    `0%,${hide}%,${100 - hide}%,100%{visibility:hidden}` +
    `${hide + 0.001}%,${100 - hide - 0.001}%{visibility:visible}}` +
    `@media(prefers-reduced-motion:reduce){.${tile}{animation-play-state:paused}}`;

  const share = aspectRatio / SLICES;

  // Dibuja las capturas en los canvas de cada franja, en tiempo libre tras hidratar.
  React.useEffect(() => {
    const el = ref.current;
    if (!el || !el.offsetWidth) return; // banda oculta (display:none): no descarga nada
    let cancelled = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const run = () => {
      const canvases = el.querySelectorAll<HTMLCanvasElement>("canvas[data-src]");
      canvases.forEach((cv) => {
        const src = cv.dataset.src!;
        if (cv.dataset.drawn === `${src}|${size}`) return;
        const url = optimize ? `/_next/image?url=${encodeURIComponent(src)}&w=${pick(tileWidth * dpr)}&q=75` : src;
        loadImage(url)
          .then((im) => {
            if (cancelled || cv.dataset.src !== src) return;
            drawSlice(cv, im, Number(cv.dataset.k), aspectRatio, share, dpr);
            cv.dataset.drawn = `${src}|${size}`;
          })
          .catch(() => {});
      });
    };
    // Espera a que la página termine de cargar y luego a un momento libre: las
    // capturas no compiten con lo que se ve primero (título, fuentes, JS).
    const idle = "requestIdleCallback" in window;
    let handle = 0;
    const schedule = () => {
      if (cancelled) return;
      handle = idle ? window.requestIdleCallback(run, { timeout: 1500 }) : window.setTimeout(run, 300);
    };
    const loaded = document.readyState === "complete";
    if (loaded) schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      if (idle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, [shown, size, columns, optimize, tileWidth, aspectRatio, share]);
  const duration = columns * speed;
  const mask = `linear-gradient(90deg,transparent,#000 ${fade}%,#000 ${100 - fade}%,transparent)`;

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      {...props}
      style={{ containerType: "size", ...(ratio ? { aspectRatio: `${+(1 / ratio).toFixed(4)}` } : null), ...props.style }}
    >
      <style>{css}</style>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: visible ? 1 : 0,
          perspective: `${+(r * CAMERA).toFixed(3)}cqw`,
          perspectiveOrigin: `50% ${axis}%`,
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      >
        {Array.from({ length: columns }, (_, t) => {
          const first = columns - 1 - t;
          const img = images[(shown[t] ?? first) % Math.max(images.length, 1)];
          return (
            <div
              key={t}
              className={cn(tile, "absolute")}
              style={{
                left: `calc(50% - ${u(aspectRatio / 2)})`,
                top: `calc(${axis}% - ${u(0.5)})`,
                width: u(aspectRatio),
                height: u(1),
                transformStyle: "preserve-3d",
                animation: `${orbit} ${duration}s linear ${-t * speed}s infinite`,
              }}
              onAnimationIteration={(e) => {
                const lap = Math.round(e.elapsedTime / duration);
                setShown((prev) => {
                  const next = lap * columns + first;
                  return prev[t] === next ? prev : { ...prev, [t]: next };
                });
              }}
            >
              {Array.from({ length: SLICES }, (_, k) => (
                <canvas
                  key={k}
                  data-src={img?.src}
                  data-k={k}
                  className={cn(
                    "absolute top-0 block bg-surface-2",
                    k === 0 && "rounded-l-lg",
                    k === SLICES - 1 && "rounded-r-lg"
                  )}
                  style={{
                    left: u((aspectRatio - share) / 2),
                    width: k === SLICES - 1 ? u(share) : `calc(${u(share)} + 1px)`,
                    height: u(1),
                    transform: turn((aspectRatio / 2 - (k + 0.5) * share) * unit),
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>

      {children}
    </div>
  );
}

export default TiltedGridHero;
