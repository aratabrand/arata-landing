"use client";

import { useEffect, useId, useRef, useState } from "react";
import { onInView } from "@/lib/panel/inview";
import { cn } from "@/lib/utils";

// Gráficos del panel en SVG propio, sin librerías (CLAUDE.md §9-10).
// Estética dashboard-premium: líneas de rejilla muy sutiles, puntas redondeadas,
// punto brillante en el extremo. Se dibujan al entrar en vista (solo opacity,
// transform y el trazo del SVG) y quedan quietos con movimiento reducido.

const MORADO = "#7D53FF";
const LIMA = "#B6FF00";

/** true cuando el elemento ya entró en vista (o de inmediato con movimiento reducido). */
function useVisto<T extends Element>() {
  const ref = useRef<T | null>(null);
  const [visto, setVisto] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisto(true);
      return;
    }
    return onInView(el, () => setVisto(true), 0.2);
  }, []);
  return [ref, visto] as const;
}

// Curva suave (Catmull-Rom → Bézier) que pasa por todos los puntos.
// `piso` (y en pantalla de la línea de 0): los puntos de control no lo cruzan,
// así la curva nunca dibuja valores negativos que no existen.
function curva(p: [number, number][], piso?: number) {
  if (p.length < 2) return "";
  let d = `M${p[0][0]},${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const t = 0.18;
    const c1 = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
    const c2 = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
    if (piso !== undefined) {
      c1[1] = Math.min(c1[1], piso);
      c2[1] = Math.min(c2[1], piso);
      // Tramo plano (dos puntos en el mismo valor): línea recta, sin ondas
      if (p1[1] === p2[1]) {
        c1[1] = p1[1];
        c2[1] = p2[1];
      }
    }
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

/** Techo "bonito" para el eje Y (1, 2, 2.5, 5 × 10^n). */
function techo(max: number) {
  if (max <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(max)));
  const f = max / exp;
  const paso = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return paso * exp;
}

export type Punto = { etiqueta: string; valor: number };

/** Área con línea, rejilla, eje Y y tooltip al pasar el dedo o el mouse. */
export function GraficoArea({
  puntos,
  formato,
  formatoEje,
  alto = 240,
  className,
  etiqueta,
}: {
  puntos: Punto[];
  formato: (n: number) => string;
  formatoEje: (n: number) => string;
  alto?: number;
  className?: string;
  etiqueta: string;
}) {
  const [ref, visto] = useVisto<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const gid = useId().replace(/:/g, "");
  const W = 640;
  const H = alto;
  const pad = { t: 14, r: 12, b: 28, l: 64 };
  const max = techo(Math.max(...puntos.map((p) => p.valor)) * 1.08);
  const x = (i: number) => pad.l + (i * (W - pad.l - pad.r)) / Math.max(1, puntos.length - 1);
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const coords = puntos.map((p, i) => [x(i), y(p.valor)] as [number, number]);
  const linea = curva(coords, H - pad.b);
  const area = `${linea} L${x(puntos.length - 1)},${H - pad.b} L${x(0)},${H - pad.b} Z`;
  const marcas = [0, 0.25, 0.5, 0.75, 1];
  const cadaEtiqueta = Math.ceil(puntos.length / 6);
  const ultimo = coords[coords.length - 1];

  const mover = (clientX: number, el: SVGSVGElement) => {
    const r = el.getBoundingClientRect();
    const vx = ((clientX - r.left) / r.width) * W;
    const i = Math.round(((vx - pad.l) / (W - pad.l - pad.r)) * (puntos.length - 1));
    setHover(Math.max(0, Math.min(puntos.length - 1, i)));
  };

  const h = hover !== null ? puntos[hover] : null;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full touch-pan-y select-none"
        role="img"
        aria-label={etiqueta}
        onPointerMove={(e) => mover(e.clientX, e.currentTarget)}
        onPointerDown={(e) => mover(e.clientX, e.currentTarget)}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={`a${gid}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={MORADO} stopOpacity="0.38" />
            <stop offset="100%" stopColor={MORADO} stopOpacity="0" />
          </linearGradient>
        </defs>

        {marcas.map((m) => (
          <g key={m}>
            <line x1={pad.l} x2={W - pad.r} y1={y(max * m)} y2={y(max * m)} stroke="rgba(255,255,255,0.06)" strokeDasharray={m === 0 ? undefined : "3 5"} />
            <text x={pad.l - 10} y={y(max * m) + 4} textAnchor="end" fontSize="11" fill="#8A84A8">
              {formatoEje(max * m)}
            </text>
          </g>
        ))}

        {puntos.map((p, i) =>
          // Cada N puntos y el último; se salta la penúltima si quedaría encima del último
          (i % cadaEtiqueta === 0 && puntos.length - 1 - i >= Math.max(1, cadaEtiqueta * 0.75)) || i === puntos.length - 1 ? (
            <text key={i} x={x(i)} y={H - 8} textAnchor={i === 0 ? "start" : i === puntos.length - 1 ? "end" : "middle"} fontSize="11" fill="#8A84A8">
              {p.etiqueta}
            </text>
          ) : null
        )}

        <path d={area} fill={`url(#a${gid})`} className={cn("pn-fade", visto && "is-visible")} />
        <path
          d={linea}
          fill="none"
          stroke={MORADO}
          strokeWidth="2.5"
          strokeLinecap="round"
          pathLength={1}
          className={cn("pn-trazo", visto && "is-visible")}
        />

        {/* Punta brillante en el último dato */}
        <g className={cn("pn-fade", visto && "is-visible")} style={{ transitionDelay: "0.9s" }}>
          <circle cx={ultimo[0]} cy={ultimo[1]} r="9" fill={LIMA} opacity="0.18" />
          <circle cx={ultimo[0]} cy={ultimo[1]} r="4" fill={LIMA} />
        </g>

        {hover !== null && (
          <g pointerEvents="none">
            <line x1={coords[hover][0]} x2={coords[hover][0]} y1={pad.t} y2={H - pad.b} stroke="rgba(255,255,255,0.18)" />
            <circle cx={coords[hover][0]} cy={coords[hover][1]} r="5" fill="#03010B" stroke={LIMA} strokeWidth="2.5" />
          </g>
        )}
      </svg>

      {h && hover !== null && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-btn border border-white/10 bg-surface-3/95 px-3 py-2 text-center shadow-xl backdrop-blur"
          style={{ left: `${Math.min(88, Math.max(12, (coords[hover][0] / W) * 100))}%` }}
        >
          <p className="text-[0.7rem] text-fog-dim">{h.etiqueta}</p>
          <p className="font-display text-sm font-bold text-white">{formato(h.valor)}</p>
        </div>
      )}
    </div>
  );
}

/** Línea mínima para las tarjetas de cifras. */
export function Sparkline({ valores, className, color = MORADO }: { valores: number[]; className?: string; color?: string }) {
  const [ref, visto] = useVisto<SVGSVGElement>();
  const W = 120;
  const H = 36;
  const max = Math.max(...valores);
  const min = Math.min(...valores);
  const pts = valores.map((v, i) => [(i * W) / Math.max(1, valores.length - 1), H - 4 - ((v - min) / (max - min || 1)) * (H - 8)] as [number, number]);
  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className={cn("h-9 w-full", className)} aria-hidden preserveAspectRatio="none">
      <path d={curva(pts)} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" pathLength={1} className={cn("pn-trazo", visto && "is-visible")} />
    </svg>
  );
}

/** Lista de barras horizontales con punta redondeada (fuentes, productos). */
export function BarrasHorizontales({
  items,
  formato,
  destacarPrimero = true,
}: {
  items: { nombre: string; valor: number; detalle?: string }[];
  formato: (n: number) => string;
  destacarPrimero?: boolean;
}) {
  const [ref, visto] = useVisto<HTMLUListElement>();
  const max = Math.max(...items.map((i) => i.valor));
  return (
    <ul ref={ref} className="space-y-4">
      {items.map((it, i) => (
        <li key={it.nombre}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-white">{it.nombre}</span>
            <span className="shrink-0 font-display font-bold text-white">
              {formato(it.valor)}
              {it.detalle && <span className="ml-1.5 font-body text-xs font-normal text-fog-dim">{it.detalle}</span>}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/6">
            <div
              className={cn("pn-barra h-full origin-left rounded-full", visto && "is-visible")}
              style={{
                width: `${(it.valor / max) * 100}%`,
                background: destacarPrimero && i === 0 ? LIMA : MORADO,
                transitionDelay: `${i * 90}ms`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Barras verticales con puntas redondeadas (Instagram por semana). */
export function BarrasVerticales({ puntos, formato, alto = 150 }: { puntos: Punto[]; formato: (n: number) => string; alto?: number }) {
  const [ref, visto] = useVisto<HTMLDivElement>();
  const max = Math.max(...puntos.map((p) => p.valor));
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div ref={ref}>
      <div className="flex items-end gap-1.5 sm:gap-2" style={{ height: alto }}>
        {puntos.map((p, i) => {
          const ultimo = i === puntos.length - 1;
          return (
            <div
              key={i}
              className="group relative flex h-full flex-1 items-end"
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
            >
              <div
                className={cn("pn-columna w-full origin-bottom rounded-full", visto && "is-visible")}
                style={{
                  height: `${Math.max(4, (p.valor / max) * 100)}%`,
                  background: ultimo ? LIMA : hover === i ? "#9B7BFF" : MORADO,
                  opacity: ultimo || hover === i ? 1 : 0.75,
                  transitionDelay: `${i * 45}ms`,
                }}
              />
              {hover === i && (
                <span className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-surface-3 px-2 py-1 text-[0.7rem] font-semibold text-white">
                  {formato(p.valor)}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[0.7rem] text-fog-dim">
        <span>{puntos[0]?.etiqueta}</span>
        <span>{puntos[puntos.length - 1]?.etiqueta}</span>
      </div>
    </div>
  );
}

/** Anillo con número XL centrado y punto brillante en la punta del arco. */
export function Anillo({
  valor,
  max = 100,
  centro,
  bajada,
  tam = 148,
  grosor = 12,
  color = LIMA,
}: {
  valor: number;
  max?: number;
  centro: string;
  bajada?: string;
  tam?: number;
  grosor?: number;
  color?: string;
}) {
  const [ref, visto] = useVisto<SVGSVGElement>();
  const r = (tam - grosor) / 2;
  const c = 2 * Math.PI * r;
  const frac = Math.max(0, Math.min(1, valor / max));
  const ang = frac * 2 * Math.PI - Math.PI / 2;
  const dot = [tam / 2 + r * Math.cos(ang), tam / 2 + r * Math.sin(ang)];
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: tam, height: tam }}>
      <svg ref={ref} viewBox={`0 0 ${tam} ${tam}`} width={tam} height={tam} aria-hidden className="-rotate-90">
        <circle cx={tam / 2} cy={tam / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={grosor} />
        <circle
          cx={tam / 2}
          cy={tam / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={grosor}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={visto ? c * (1 - frac) : c}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <svg viewBox={`0 0 ${tam} ${tam}`} width={tam} height={tam} aria-hidden className={cn("pn-fade absolute inset-0", visto && "is-visible")} style={{ transitionDelay: "1.2s" }}>
        <circle cx={dot[0]} cy={dot[1]} r={grosor * 0.85} fill={color} opacity="0.2" />
        <circle cx={dot[0]} cy={dot[1]} r={grosor * 0.32} fill="#03010B" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-[1.75rem] font-bold leading-none text-white">{centro}</span>
        {bajada && <span className="mt-1 max-w-[80%] text-[0.7rem] leading-tight text-fog-dim">{bajada}</span>}
      </div>
    </div>
  );
}

/** Embudo de visitas → clics → pedidos, con el % que pasa de un paso al otro. */
export function Embudo({ pasos }: { pasos: { nombre: string; valor: number; formato: string }[] }) {
  const [ref, visto] = useVisto<HTMLOListElement>();
  const max = pasos[0]?.valor || 1;
  return (
    <ol ref={ref} className="space-y-3">
      {pasos.map((p, i) => {
        const pasa = i > 0 && pasos[i - 1].valor ? (p.valor / pasos[i - 1].valor) * 100 : null;
        return (
          <li key={p.nombre}>
            <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
              <span className="text-fog">{p.nombre}</span>
              <span className="font-display font-bold text-white">
                {p.formato}
                {pasa !== null && <span className="ml-2 font-body text-xs font-semibold text-brand-soft">{pasa.toFixed(0)} % pasa</span>}
              </span>
            </div>
            <div className="h-9 overflow-hidden rounded-btn bg-white/5">
              <div
                className={cn("pn-barra h-full origin-left rounded-btn", visto && "is-visible")}
                style={{
                  width: `${Math.max(6, (p.valor / max) * 100)}%`,
                  background: i === pasos.length - 1 ? LIMA : `rgba(125,83,255,${0.95 - i * 0.22})`,
                  transitionDelay: `${i * 150}ms`,
                }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
