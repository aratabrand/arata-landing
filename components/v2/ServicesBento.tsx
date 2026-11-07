"use client";

// Servicios como bento de diagramas vivos (D-065).
// Adaptado de "ink-orbit-features" (21st.dev) al sistema v2 de Arata:
// solo fondo oscuro, marca geométrica de Arata, lima para el movimiento y morado para los brillos.
//  1. Catálogos y sistemas (ancha): clientes → tu catálogo → pedidos que llegan ordenados al WhatsApp.
//  2. Páginas que venden: tu página conectada a Google, Google Business, la IA y WhatsApp.
//  3. Tus datos: ventas en el panel (gráfica que se recorre con el mouse; marcada como ejemplo).
// Sin dependencias ni imágenes. Respeta prefers-reduced-motion.

import Link from "next/link";
import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import { ArrowRight } from "lucide-react";
import { onInView } from "@/lib/inview";
import { servicios } from "@/content/inicio";

/* ───────────────────────────── utilidades ───────────────────────────── */

function clamp(v: number, a: number, b: number) {
  return Math.min(b, Math.max(a, v));
}

// Curva suave + área cerrada a través de los valores, dentro de una caja w×h.
function chartPaths(values: number[], w: number, h: number, pad: number) {
  const n = values.length;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo || 1;
  const pts = values.map(
    (v, i) =>
      [pad + (n < 2 ? 0 : (i / (n - 1)) * (w - pad * 2)), h - pad - ((v - lo) / span) * (h - pad * 2)] as [number, number]
  );
  let line = "";
  pts.forEach(([x, y], i) => {
    if (i === 0) {
      line = `M${x.toFixed(1)},${y.toFixed(1)}`;
      return;
    }
    const [px, py] = pts[i - 1];
    const cx = (px + x) / 2;
    line += ` C${cx.toFixed(1)},${py.toFixed(1)} ${cx.toFixed(1)},${y.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const area = `${line} L${pts[n - 1][0].toFixed(1)},${h - pad} L${pts[0][0].toFixed(1)},${h - pad} Z`;
  return { line, area, points: pts };
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(m.matches);
    sync();
    m.addEventListener?.("change", sync);
    return () => m.removeEventListener?.("change", sync);
  }, []);
  return reduced;
}

function useInView<T extends Element>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return onInView(el, () => setInView(true), threshold);
  }, [threshold]);
  return [ref, inView] as const;
}

/* ───────────────────────────── piezas ───────────────────────────── */

/** Marca geométrica de Arata (del logo), en lima y blanco. */
function Mark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size * (119 / 104)} viewBox="0 0 104 119" aria-hidden>
      <path d="M23.939 16.0972L51.8208 0L79.7024 16.0854L51.8265 32.182L23.939 16.0972Z" fill="#FFFFFF" />
      <path
        d="M62.1786 93.2159L52.0035 87.333L41.81 93.2191L41.8161 77.1332L10.187 95.3861L0.0103615 89.5164L0.0309348 77.731L31.6286 59.4701L0 41.2345L0.00503938 29.4642L10.1806 23.5827L51.9942 47.722L93.7933 23.5823L103.987 29.4582L103.99 41.2301L72.3766 59.4792L103.995 77.7414L104 89.5066L93.8036 95.3882L62.1509 77.11L62.1786 93.2159Z"
        fill="#B6FF00"
      />
      <path d="M38.1519 110.216L52.0885 102.17L66.0348 110.222L52.0885 118.263L38.1519 110.216Z" fill="#FFFFFF" />
    </svg>
  );
}

function Brackets() {
  return (
    <>
      <span className="ab-c ab-c-tl" aria-hidden />
      <span className="ab-c ab-c-tr" aria-hidden />
      <span className="ab-c ab-c-bl" aria-hidden />
      <span className="ab-c ab-c-br" aria-hidden />
    </>
  );
}

/* Retratos dibujados (escala de grises: no compiten con el morado y el lima) */
const PORTRAITS = [
  { hair: "short", beard: true, glasses: false, skin: "#b9b4ae", hairC: "#2b2a29", shirt: "#3a3a3a", bg: "#d9d6d2" },
  { hair: "long", beard: false, glasses: false, skin: "#d6d0c9", hairC: "#8d7f6c", shirt: "#7b7b7b", bg: "#e6e3df" },
  { hair: "buzz", beard: false, glasses: true, skin: "#a7a19a", hairC: "#3d3c3a", shirt: "#1f1f1f", bg: "#cfcfcf" },
  { hair: "bun", beard: false, glasses: true, skin: "#9a8f84", hairC: "#1e1d1c", shirt: "#5a5a5a", bg: "#dedbd6" },
  { hair: "curly", beard: false, glasses: false, skin: "#7f746a", hairC: "#1a1918", shirt: "#8a8a8a", bg: "#d3d0cb" },
];

function Portrait({ index, size = 22, uid }: { index: number; size?: number; uid: string }) {
  const p = PORTRAITS[index % PORTRAITS.length];
  const id = `${uid}pt${index}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={p.bg} />
          <stop offset="1" stopColor="#9d9a96" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" fill={`url(#${id})`} />
      {p.hair === "long" && <path d="M18 30c0-12 6-19 14-19s14 7 14 19v20H18z" fill={p.hairC} />}
      {p.hair === "curly" &&
        [[22, 20], [28, 15], [36, 15], [42, 20], [45, 28], [19, 28]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="7" fill={p.hairC} />
        ))}
      <path d="M8 64c2-12 12-18 24-18s22 6 24 18z" fill={p.shirt} />
      <rect x="27.5" y="36" width="9" height="11" rx="3" fill={p.skin} />
      <ellipse cx="32" cy="28" rx="11" ry="13" fill={p.skin} />
      {p.hair === "short" && <path d="M21 25c0-9 5-13 11-13s11 4 11 13c-2-4-6-6-11-6s-9 2-11 6z" fill={p.hairC} />}
      {p.hair === "buzz" && (
        <path d="M21.5 24c.5-8 5-11.5 10.5-11.5S42 16 42.5 24c-3-3-6.5-4-10.5-4s-7.5 1-10.5 4z" fill={p.hairC} opacity=".85" />
      )}
      {p.hair === "bun" && (
        <>
          <circle cx="32" cy="11" r="6" fill={p.hairC} />
          <path d="M21 26c0-10 5-14 11-14s11 4 11 14c-2-5-6-7.5-11-7.5S23 21 21 26z" fill={p.hairC} />
        </>
      )}
      {p.hair === "long" && <path d="M21 27c0-10 5-15 11-15s11 5 11 15c-3-6-8-8-14-7-3 .5-6 3-8 7z" fill={p.hairC} />}
      {p.beard && <path d="M21.5 30c1 9 5 12 10.5 12s9.5-3 10.5-12c-2 4-5 5-10.5 5s-8.5-1-10.5-5z" fill={p.hairC} opacity=".9" />}
      <circle cx="27.5" cy="28" r="1.2" fill="#1a1a1a" />
      <circle cx="36.5" cy="28" r="1.2" fill="#1a1a1a" />
      {p.glasses && (
        <g fill="none" stroke="#1a1a1a" strokeWidth="1.1">
          <circle cx="27.5" cy="28" r="3.6" />
          <circle cx="36.5" cy="28" r="3.6" />
          <path d="M31.1 28h1.8" />
        </g>
      )}
      <path d="M29 34.5c1.8 1.2 4.2 1.2 6 0" fill="none" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

/** Íconos de las conexiones de la página: Google, Google Business, IA, WhatsApp. */
function ToolGlyph({ index }: { index: number }) {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      {index === 0 && (
        <text x="0" y="4.5" textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor" stroke="none" fontFamily="var(--font-display)">
          G
        </text>
      )}
      {index === 1 && (
        <>
          <path d="M0 6.5s-5-4.6-5-8.4a5 5 0 0 1 10 0C5 1.9 0 6.5 0 6.5z" />
          <circle cx="0" cy="-2" r="1.7" />
        </>
      )}
      {index === 2 && <path d="M0 -6.5 1.6 -1.6 6.5 0 1.6 1.6 0 6.5 -1.6 1.6 -6.5 0 -1.6 -1.6z" />}
      {index === 3 && (
        <>
          <path d="M-5.5 5.5 -4.4 2.4A6 6 0 1 1 -1.6 4.9z" />
          <path d="M-1.8 -1.8c.4 1.6 1.4 2.6 3.2 3.4" />
        </>
      )}
    </g>
  );
}

/* ───────────────── 1. Catálogos y sistemas (tarjeta ancha) ───────────────── */

function FlowCard({ uid, reduced, inView }: { uid: string; reduced: boolean; inView: boolean }) {
  const [pedido, setPedido] = useState(128);
  const [side, setSide] = useState<"" | "left" | "right">("");
  useEffect(() => {
    if (reduced || !inView) return;
    const t = window.setInterval(() => setPedido((n) => n + 1), 2800);
    return () => window.clearInterval(t);
  }, [reduced, inView]);

  const clientes = [
    { x: 58, y: 38, name: "Laura · armando su pedido" },
    { x: 104, y: 22, name: "Juan · viendo audífonos" },
    { x: 150, y: 40, name: "Sofía · pidió 3 productos" },
    { x: 46, y: 92, name: "Mateo · preguntó el envío" },
    { x: 146, y: 114, name: "Ana · mirando el catálogo" },
  ];
  const L1 = "M117,67 C196,67 210,100 262,100";
  const L2 = "M117,73 C186,73 206,120 262,120";
  const R1 = "M378,100 C412,100 418,86 450,86";
  const R2 = "M378,120 C412,120 418,134 450,134";
  const glow = `${uid}glow`;
  const rays = `${uid}rays`;
  const c = servicios.bento;

  return (
    <div className="ab-frame ab-frame-hover md:col-span-2">
      <Brackets />
      <div className="ab-card !p-0">
        <svg
          className="ab-diagram"
          viewBox="0 0 640 178"
          role="img"
          aria-label="Tus clientes arman su pedido en tu catálogo y te llega ordenado al WhatsApp"
        >
          <defs>
            <radialGradient id={glow} cx="320" cy="110" r="200" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#7D53FF" stopOpacity=".22" />
              <stop offset="1" stopColor="#7D53FF" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={rays} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#B9A4FF" stopOpacity=".28" />
              <stop offset="1" stopColor="#B9A4FF" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="640" height="178" fill={`url(#${glow})`} />
          {[-62, -38, -14, 14, 38, 62].map((a, i) => (
            <path
              key={i}
              d={`M320,110 L${320 + Math.sin((a * Math.PI) / 180) * 260},${110 - Math.cos((a * Math.PI) / 180) * 260} L${
                320 + Math.sin(((a + 7) * Math.PI) / 180) * 260
              },${110 - Math.cos(((a + 7) * Math.PI) / 180) * 260}Z`}
              fill={`url(#${rays})`}
              opacity=".5"
            />
          ))}

          {/* Clientes */}
          <g onMouseEnter={() => setSide("left")} onMouseLeave={() => setSide("")}>
            <rect x="20" y="8" width="170" height="130" fill="transparent" />
            {clientes.map((m, i) => (
              <line key={`l${i}`} x1={m.x} y1={m.y} x2="104" y2="70" stroke="var(--ab-line-strong)" strokeDasharray="2 3" />
            ))}
            {/* nodo: carrito */}
            <g transform="translate(91,57)">
              <rect width="26" height="26" rx="6" className="ab-node" />
              <g transform="translate(6,7)" fill="none" stroke="#B6FF00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M0 0h2.5l1.8 8.5h8.2L14 3H3.2" />
                <circle cx="5.5" cy="12" r="1" />
                <circle cx="11" cy="12" r="1" />
              </g>
            </g>
            {clientes.map((m, i) => (
              <g key={i} className="ab-av" tabIndex={0} role="img" aria-label={m.name}>
                <svg x={m.x - 11} y={m.y - 11} width="22" height="22" viewBox="0 0 22 22" overflow="visible">
                  <clipPath id={`${uid}avc${i}`}>
                    <circle cx="11" cy="11" r="11" />
                  </clipPath>
                  <g clipPath={`url(#${uid}avc${i})`}>
                    <Portrait index={i} size={22} uid={`${uid}f`} />
                  </g>
                  <circle cx="11" cy="11" r="10.5" fill="none" stroke="#0A0714" strokeWidth="1.5" />
                </svg>
                <circle cx={m.x + 8} cy={m.y + 8} r="2.6" fill={i === 4 ? "#5E587A" : "#B6FF00"} stroke="#0A0714" className={i === 4 ? undefined : "ab-presence"} />
                <g className="ab-av-tip" transform={`translate(${m.x},${m.y - 18})`}>
                  <rect x={-m.name.length * 2.45 - 6} y="-9" width={m.name.length * 4.9 + 12} height="14" rx="3" fill="#B6FF00" />
                  <text x="0" y="1" textAnchor="middle" fontSize="7.5" fill="#03010B" fontFamily="var(--font-body)">
                    {m.name}
                  </text>
                </g>
              </g>
            ))}
          </g>

          {/* Conexiones */}
          {[L1, L2].map((d, i) => (
            <path key={d} d={d} className={`ab-flow${side === "left" ? " ab-flow-on" : ""}${i ? " ab-dash" : ""}`} />
          ))}
          {[R1, R2].map((d, i) => (
            <path key={d} d={d} className={`ab-flow${side === "right" ? " ab-flow-on" : ""}${i ? " ab-dash" : ""}`} />
          ))}
          {!reduced &&
            [L1, L2, R1, R2].map((d, i) => (
              <circle key={`p${i}`} r="2.2" className="ab-pkt">
                <animateMotion dur={`${2.2 + (i % 2) * 0.6}s`} begin={`${i * 0.35}s`} repeatCount="indefinite" path={d} />
              </circle>
            ))}

          {/* Centro: tu catálogo */}
          <g transform="translate(262,88)">
            <rect x="-4" y="-4" width="124" height="52" rx="9" fill="none" stroke="rgba(125,83,255,.55)" className={reduced ? undefined : "ab-glow"} />
            <rect width="116" height="44" rx="7" className="ab-node" />
            <g transform="translate(12,12)">
              <Mark size={18} />
            </g>
            <text x="37" y="25.5" fontSize="8" letterSpacing="1" fontWeight="700" fill="#FFFFFF" fontFamily="var(--font-body)">
              TU CATÁLOGO
            </text>
          </g>

          {/* Pedidos que llegan ordenados */}
          <g onMouseEnter={() => setSide("right")} onMouseLeave={() => setSide("")}>
            {[2, 1, 0].map((k) => (
              <g key={pedido - k} transform={`translate(${450 + k * 12},${40 - k * 10})`} opacity={1 - k * 0.25}>
                <g className={`ab-sheet${k === 0 ? " ab-sheet-new" : ""}`}>
                  <rect width="138" height="102" rx="5" fill="#110C20" stroke="var(--ab-line-strong)" />
                  {k === 0 && (
                    <>
                      <text x="10" y="16" fontSize="7" fill="#B9A4FF" fontFamily="ui-monospace,monospace">
                        {`PEDIDO #${pedido}`}
                      </text>
                      <g transform="translate(112,8)" fill="none" stroke="#B6FF00" strokeWidth="1.2" strokeLinecap="round">
                        <path d="M1.5 9.5 2.4 7A5 5 0 1 1 4.6 9z" />
                      </g>
                      {[0, 1, 2].map((r) => (
                        <g key={r} transform={`translate(10,${28 + r * 15})`}>
                          <rect width="8" height="8" rx="2" fill="rgba(255,255,255,.14)" />
                          <rect x="13" y="1" width={[58, 44, 52][r]} height="3" rx="1" fill="rgba(255,255,255,.55)" />
                          <rect x="13" y="6" width={[30, 22, 26][r]} height="2" rx="1" fill="rgba(255,255,255,.2)" />
                          <rect x="96" y="1.5" width="22" height="3" rx="1" fill="rgba(255,255,255,.4)" />
                        </g>
                      ))}
                      <line x1="10" x2="128" y1="76" y2="76" stroke="var(--ab-line-strong)" />
                      <rect x="10" y="83" width="30" height="4" rx="1" fill="rgba(255,255,255,.4)" />
                      <rect x="92" y="81" width="36" height="8" rx="2" fill="#B6FF00" />
                    </>
                  )}
                </g>
              </g>
            ))}
          </g>
        </svg>

        <div className="grid gap-5 px-5 pb-5 sm:grid-cols-2 sm:gap-8 sm:px-6 sm:pb-6">
          <div>
            <p className="text-xs font-semibold text-lime">{c.catalogo.etiqueta}</p>
            <h3 className="mt-1.5 font-display text-v2-h3 font-bold tracking-heading text-white">{c.catalogo.titulo}</h3>
            <p className="mt-2 text-sm leading-relaxed text-fog">{c.catalogo.texto}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-brand-soft">{c.sistema.etiqueta}</p>
            <h3 className="mt-1.5 font-display text-v2-h3 font-bold tracking-heading text-white">{c.sistema.titulo}</h3>
            <p className="mt-2 text-sm leading-relaxed text-fog">{c.sistema.texto}</p>
          </div>
        </div>
        <div className="border-t border-white/6 px-5 py-3 sm:px-6">
          <Link href={c.catalogo.href} className="inline-flex h-11 items-center gap-1.5 text-sm font-semibold text-white hover:text-lime">
            {c.catalogo.boton} <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ───────────────── 2. Páginas que venden: conexiones ───────────────── */

function ConnectionsCard({ reduced }: { reduced: boolean }) {
  const [hover, setHover] = useState(-1);
  const [auto, setAuto] = useState(0);
  const c = servicios.bento.paginas;
  useEffect(() => {
    if (reduced || hover >= 0) return;
    const t = window.setInterval(() => setAuto((a) => (a + 1) % 4), 1700);
    return () => window.clearInterval(t);
  }, [reduced, hover]);
  const on = hover >= 0 ? hover : reduced ? -1 : auto;
  const tiles = [
    { x: 66, y: 34 },
    { x: 66, y: 116 },
    { x: 234, y: 34 },
    { x: 234, y: 116 },
  ];
  const path = (i: number) => {
    const t = tiles[i];
    const dir = t.x < 150 ? -1 : 1;
    return `M${150 + dir * 17},75 H${150 + dir * 42} V${t.y} H${t.x - dir * 15}`;
  };
  return (
    <div className="ab-frame ab-frame-hover">
      <Brackets />
      <div className="ab-card">
        <svg className="ab-diagram" viewBox="0 0 300 150" role="group" aria-label="Tu página conectada a Google, Google Business, la IA y WhatsApp">
          {tiles.map((_, i) => (
            <path key={i} d={path(i)} className={`ab-flow${on === i ? " ab-flow-on" : ""}`} />
          ))}
          {!reduced && on >= 0 && (
            <circle key={on} r="2.2" className="ab-pkt">
              <animateMotion dur="1.1s" repeatCount="indefinite" path={path(on)} />
            </circle>
          )}
          <g transform="translate(133,58)">
            <rect width="34" height="34" rx="8" className="ab-node" />
            <g transform="translate(8.5,6.5)">
              <Mark size={17} />
            </g>
          </g>
          {tiles.map((t, i) => (
            <g
              key={i}
              className={`ab-tool${on === i ? " ab-tool-on" : ""}`}
              tabIndex={0}
              role="img"
              aria-label={c.conexiones[i]}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(-1)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(-1)}
            >
              <rect x={t.x - 15} y={t.y - 15} width="30" height="30" rx="7" className="ab-node" />
              <g transform={`translate(${t.x},${t.y})`} style={{ color: on === i ? "#B6FF00" : "#FFFFFF" }}>
                <ToolGlyph index={i} />
              </g>
              <text
                x={t.x}
                y={t.y + (t.y < 75 ? -21 : 28)}
                textAnchor="middle"
                fontSize="8"
                fill="#B4AECB"
                fontFamily="var(--font-body)"
                opacity={on === i ? 1 : 0}
                style={{ transition: "opacity .25s" }}
              >
                {c.conexiones[i]}
              </text>
            </g>
          ))}
          <text x="150" y="112" textAnchor="middle" fontSize="7" fill="#8A84A8" fontFamily="ui-monospace,monospace">
            {on >= 0 ? `conectando · ${c.conexiones[on].toLowerCase()}` : "4 conectados"}
          </text>
        </svg>
        <div className="mt-auto">
          <p className="text-xs font-semibold text-lime">{c.etiqueta}</p>
          <h3 className="mt-1.5 font-display text-v2-h3 font-bold tracking-heading text-white">{c.titulo}</h3>
          <p className="mt-2 text-sm leading-relaxed text-fog">{c.texto}</p>
          <Link href={c.href} className="mt-2 inline-flex h-11 items-center gap-1.5 text-sm font-semibold text-white hover:text-lime">
            {c.boton} <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ───────────────── 3. Tus datos: ventas en el panel ───────────────── */

function DataCard({ uid, reduced }: { uid: string; reduced: boolean }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const [hover, setHover] = useState(-1);
  const c = servicios.bento.datos;
  const W = 300;
  const H = 130;
  const vals = c.valores;
  const { line, area, points } = chartPaths(vals, W, H, 14);
  const fill = `${uid}area`;
  const last = points[points.length - 1];
  const i = hover >= 0 ? hover : points.length - 1;
  const p = points[i];
  const pct = Math.round(((vals[i] - vals[0]) / (vals[0] || 1)) * 100);
  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    let best = 0;
    points.forEach((q, k) => {
      if (Math.abs(q[0] - x) < Math.abs(points[best][0] - x)) best = k;
    });
    setHover(best);
  };
  return (
    <div className="ab-frame ab-frame-hover" ref={ref} data-in={inView}>
      <Brackets />
      <div className="ab-card">
        <svg
          className="ab-diagram ab-chart"
          viewBox={`0 0 ${W} ${H + 6}`}
          onPointerMove={onMove}
          onPointerLeave={() => setHover(-1)}
          role="img"
          aria-label="Ejemplo de gráfica de ventas por semana en tu panel"
        >
          <defs>
            <linearGradient id={fill} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7D53FF" stopOpacity=".35" />
              <stop offset="1" stopColor="#7D53FF" stopOpacity="0" />
            </linearGradient>
          </defs>
          <text x="14" y="10" fontSize="7" fill="#8A84A8" fontFamily="ui-monospace,monospace">
            EJEMPLO · VENTAS POR SEMANA
          </text>
          {[0.3, 0.55, 0.8].map((g) => (
            <line key={g} x1="14" x2={W - 14} y1={H * g} y2={H * g} stroke="var(--ab-line)" />
          ))}
          <path d={area} fill={`url(#${fill})`} />
          <path d={line} fill="none" stroke="#B9A4FF" strokeWidth="1.6" pathLength={1} className="ab-line-draw" />
          {hover >= 0 && <line x1={p[0]} x2={p[0]} y1="14" y2={H - 14} stroke="#FFFFFF" strokeOpacity=".3" />}
          {!reduced && hover < 0 && <circle cx={last[0]} cy={last[1]} r="7" fill="#B6FF00" opacity=".25" className="ab-glow" />}
          <circle cx={p[0]} cy={p[1]} r="3.4" fill="#B6FF00" stroke="#0A0714" strokeWidth="1.5" />
          <g transform={`translate(${clamp(p[0], 40, W - 40)},${p[1] < 34 ? p[1] + 22 : p[1] - 12})`}>
            <rect x="-30" y="-11" width="60" height="15" rx="3" fill="#B6FF00" />
            <text x="0" y="-1" textAnchor="middle" fontSize="7.5" fill="#03010B" fontFamily="ui-monospace,monospace">
              {`sem ${i + 1} ${pct >= 0 ? "+" : ""}${pct}%`}
            </text>
          </g>
        </svg>
        <div className="mt-auto">
          <p className="text-xs font-semibold text-brand-soft">{c.etiqueta}</p>
          <h3 className="mt-1.5 font-display text-v2-h3 font-bold tracking-heading text-white">{c.titulo}</h3>
          <p className="mt-2 text-sm leading-relaxed text-fog">{c.texto}</p>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────── bento ───────────────────────────── */

export default function ServicesBento() {
  const uid = `ab${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const reduced = useReducedMotion();
  const [ref, inView] = useInView<HTMLDivElement>(0.12);
  return (
    <div ref={ref} className="ab-root grid gap-6 md:grid-cols-2 md:gap-8" data-in={inView}>
      <style>{AB_CSS}</style>
      <FlowCard uid={uid} reduced={reduced} inView={inView} />
      <ConnectionsCard reduced={reduced} />
      <DataCard uid={uid} reduced={reduced} />
    </div>
  );
}

const AB_CSS = `
.ab-root{--ab-line:rgba(255,255,255,.07);--ab-line-strong:rgba(255,255,255,.16);--ab-bracket:rgba(255,255,255,.22)}
.ab-root :where(svg){display:block;max-width:none;flex:none}
.ab-frame{position:relative;display:flex;flex-direction:column}
.ab-c{position:absolute;width:12px;height:12px;border-color:var(--ab-bracket);border-style:solid;border-width:0;pointer-events:none;transition:border-color .3s,transform .35s cubic-bezier(.2,.8,.2,1)}
.ab-c-tl{top:-6px;left:-6px;border-top-width:1.5px;border-left-width:1.5px}
.ab-c-tr{top:-6px;right:-6px;border-top-width:1.5px;border-right-width:1.5px}
.ab-c-bl{bottom:-6px;left:-6px;border-bottom-width:1.5px;border-left-width:1.5px}
.ab-c-br{bottom:-6px;right:-6px;border-bottom-width:1.5px;border-right-width:1.5px}
.ab-frame-hover:hover>.ab-c{border-color:#B6FF00}
.ab-frame-hover:hover>.ab-c-tl{transform:translate(-3px,-3px)}
.ab-frame-hover:hover>.ab-c-tr{transform:translate(3px,-3px)}
.ab-frame-hover:hover>.ab-c-bl{transform:translate(-3px,3px)}
.ab-frame-hover:hover>.ab-c-br{transform:translate(3px,3px)}
.ab-card{flex:1;display:flex;flex-direction:column;gap:14px;padding:clamp(14px,2vw,22px);background:linear-gradient(180deg,#110C20,#0A0714);border:1px solid var(--ab-line);border-radius:18px;overflow:hidden;transition:border-color .3s,box-shadow .35s}
.ab-card:hover{border-color:var(--ab-line-strong);box-shadow:0 0 0 1px rgba(125,83,255,.25),0 24px 60px -30px rgba(125,83,255,.55)}
.ab-diagram{width:100%;height:auto;overflow:visible}
.ab-flow{stroke:var(--ab-line-strong);fill:none;stroke-width:1.2;transition:stroke .3s}
.ab-flow-on{stroke:#B6FF00}
.ab-dash{stroke-dasharray:3 4;animation:ab-dash 1.2s linear infinite}
.ab-pkt{fill:#B6FF00}
.ab-node{fill:#18112D;stroke:var(--ab-line-strong);transition:stroke .3s}
.ab-av{cursor:pointer;transition:transform .35s cubic-bezier(.2,.8,.2,1);transform-box:fill-box;transform-origin:center}
.ab-av:hover,.ab-av:focus-visible{transform:scale(1.18)}
.ab-av-tip{opacity:0;transition:opacity .2s;pointer-events:none}
.ab-av:hover .ab-av-tip,.ab-av:focus .ab-av-tip{opacity:1}
.ab-presence{animation:ab-pulse 2.2s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.ab-sheet-new{animation:ab-sheet-in .7s cubic-bezier(.2,.8,.2,1) both}
.ab-tool{cursor:pointer;transition:transform .3s cubic-bezier(.2,.8,.2,1);transform-box:fill-box;transform-origin:center}
.ab-tool:hover,.ab-tool-on{transform:translateY(-2px)}
.ab-tool-on rect.ab-node{stroke:#B6FF00}
.ab-chart{cursor:crosshair}
.ab-line-draw{stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset 1.8s cubic-bezier(.4,.1,.2,1)}
[data-in="true"] .ab-line-draw{stroke-dashoffset:0}
.ab-glow{animation:ab-pulse 2s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes ab-dash{to{stroke-dashoffset:-14}}
@keyframes ab-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(1.35)}}
@keyframes ab-sheet-in{from{opacity:0;transform:translate(14px,-10px) rotate(4deg)}to{opacity:1;transform:none}}
.ab-root :focus-visible{outline:2px solid #B6FF00;outline-offset:2px}
@media (prefers-reduced-motion:reduce){.ab-dash,.ab-presence,.ab-glow,.ab-sheet-new{animation:none}.ab-line-draw{transition:none;stroke-dashoffset:0}}
`;
