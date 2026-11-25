"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { Check } from "../iconos";
import { cn } from "@/lib/utils";

// Bonos como tarjetas tipo cupón que se recogen en un mazo al bajar (D-202).
// - Cada tarjeta queda fija (sticky) un poco más abajo que la anterior; la siguiente sube y la tapa.
// - Las de atrás se encogen, giran un poco (unas a la izquierda, otras a la derecha: «se barajan»)
//   y se oscurecen. Se mueve solo con transform y opacity, desde la variable CSS `--d`.
// - Una sola escucha de scroll (pasiva + requestAnimationFrame) y SOLO mientras la pila se ve
//   (IntersectionObserver), como ScrollPaint (D-067). Con movimiento reducido no se anima (siguen fijas).
// CSS en app/globals.css (.bono-*).

export type Bono = { variante: "lima" | "tinta" | "talon"; grande: string; titulo: string; texto: string };

/* Ilustraciones del talón (usan currentColor: tinta sobre lima, lima sobre negro) */
function Productos() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden>
      {[0, 1, 2].map((k) => (
        <g key={k} transform={`translate(${14 + k * 10} ${34 - k * 10})`} opacity={0.35 + k * 0.3}>
          <rect width="60" height="70" rx="10" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <rect x="9" y="9" width="42" height="30" rx="6" fill="currentColor" opacity="0.35" />
          <rect x="9" y="47" width="30" height="5" rx="2.5" fill="currentColor" />
          <rect x="9" y="57" width="20" height="4" rx="2" fill="currentColor" opacity="0.6" />
        </g>
      ))}
      <circle cx="94" cy="88" r="20" fill="currentColor" />
      <text x="94" y="94.5" textAnchor="middle" fontSize="17" fontWeight="800" fill="var(--bono-fondo-texto)" fontFamily="var(--font-display)">
        30
      </text>
    </svg>
  );
}

function CodigoQR() {
  // Patrón fijo (decorativo, no se puede escanear): grilla de 15 × 15 con los tres cuadros de las esquinas
  const N = 15;
  const t = 78 / N;
  const esquina = (x: number, y: number) => (x < 6 && y < 6) || (x > 8 && y < 6) || (x < 6 && y > 8);
  const lleno = (x: number, y: number) => (x * 7 + y * 13 + x * y * 3) % 5 < 2;
  const celdas: { x: number; y: number }[] = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!esquina(x, y) && lleno(x, y)) celdas.push({ x, y });
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden>
      <rect x="6" y="6" width="108" height="108" rx="14" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.5" />
      <g transform="translate(21 21)">
        {[
          [0, 0],
          [10, 0],
          [0, 10],
        ].map(([fx, fy]) => (
          <g key={`${fx}-${fy}`} transform={`translate(${fx * t} ${fy * t})`}>
            <rect x={t / 2} y={t / 2} width={t * 4} height={t * 4} rx="3" fill="none" stroke="currentColor" strokeWidth={t} />
            <rect x={t * 1.5} y={t * 1.5} width={t * 2} height={t * 2} rx="1.5" fill="currentColor" />
          </g>
        ))}
        {celdas.map(({ x, y }) => (
          <rect key={`${x}-${y}`} x={x * t + 0.4} y={y * t + 0.4} width={t - 0.8} height={t - 0.8} rx="1" fill="currentColor" />
        ))}
      </g>
    </svg>
  );
}

function Compartir() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden>
      <path d="M14 22 h62 a10 10 0 0 1 10 10 v30 a10 10 0 0 1 -10 10 h-40 l-14 12 v-12 h-8 a10 10 0 0 1 -10 -10 v-30 a10 10 0 0 1 10 -10 z" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.55" />
      <rect x="18" y="34" width="46" height="6" rx="3" fill="currentColor" />
      <rect x="18" y="46" width="34" height="5" rx="2.5" fill="currentColor" opacity="0.6" />
      <g stroke="currentColor" strokeWidth="2.5">
        <line x1="78" y1="88" x2="102" y2="76" />
        <line x1="78" y1="88" x2="102" y2="102" />
      </g>
      <circle cx="78" cy="88" r="9" fill="currentColor" />
      <circle cx="102" cy="76" r="8" fill="currentColor" />
      <circle cx="102" cy="102" r="8" fill="currentColor" />
    </svg>
  );
}

const ILUSTRACION: Record<number, () => ReactNode> = { 0: Productos, 1: CodigoQR, 2: Compartir };
// Giro de cada tarjeta cuando queda atrás: alterna para que el mazo se vea «barajado»
const GIRO = ["-2.5deg", "2deg", "-1.5deg", "1.5deg"];

export default function PilaBonos({ bonos, tope = 120, etiquetaPildora = "Incluido gratis" }: { bonos: readonly Bono[]; tope?: number; etiquetaPildora?: string }) {
  const ref = useRef<HTMLOListElement | null>(null);

  useEffect(() => {
    const lista = ref.current;
    if (!lista) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cartas = Array.from(lista.querySelectorAll<HTMLElement>("[data-bono]"));
    const cuerpos = cartas.map((c) => c.querySelector<HTMLElement>("[data-cuerpo]"));
    const PASO = 16; // lo que se ve de cada tarjeta de atrás (debe coincidir con --paso en el CSS)
    let raf = 0;
    const update = () => {
      raf = 0;
      // q[j]: cuánto ha subido la tarjeta j hasta quedar fija encima de la anterior (0 → 1)
      const q = cartas.map((c, j) => {
        if (j === 0) return 0;
        const prev = cartas[j - 1];
        const fijaPrev = tope + (j - 1) * PASO;
        const inicio = fijaPrev + prev.offsetHeight + 16; // justo debajo de la anterior ya fija
        const fin = tope + j * PASO; // donde queda fija
        const top = c.getBoundingClientRect().top;
        return Math.min(1, Math.max(0, (inicio - top) / (inicio - fin)));
      });
      cuerpos.forEach((el, i) => {
        if (!el) return;
        // Profundidad: cuántas tarjetas ya tiene encima
        const d = q.slice(i + 1).reduce((a, b) => a + b, 0);
        el.style.setProperty("--d", d.toFixed(3));
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    let escuchando = false;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !escuchando) {
        escuchando = true;
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll, { passive: true });
        update();
      } else if (!entry.isIntersecting && escuchando) {
        escuchando = false;
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
    });
    io.observe(lista);
    update();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [tope]);

  return (
    <ol ref={ref} className="bonos-pila" style={{ ["--tope" as string]: `${tope}px` } as CSSProperties}>
      {bonos.map((b, i) => {
        const Ilus = ILUSTRACION[i] ?? Productos;
        return (
          <li key={b.titulo} data-bono className="bono-carta" style={{ ["--i" as string]: i } as CSSProperties}>
            <article
              data-cuerpo
              aria-label={`Bono ${i + 1}: ${b.titulo}`}
              className={cn("bono-cuerpo", `bono-v-${b.variante}`)}
              style={{ ["--giro" as string]: GIRO[i % GIRO.length] } as CSSProperties}
            >
              <div className="bono-info">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] opacity-75">Bono {i + 1}</p>
                <h3 className="bono-grande mt-1 font-display font-extrabold leading-[1.02] tracking-display">{b.grande}</h3>
                <p className="bono-texto mt-2 text-sm leading-relaxed">{b.texto}</p>
                <span className="bono-pildora mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold">
                  <Check aria-hidden className="h-3.5 w-3.5" />
                  {etiquetaPildora}
                </span>
              </div>
              <div className="bono-talon" aria-hidden>
                <div className="bono-ilus">
                  <Ilus />
                </div>
              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}
