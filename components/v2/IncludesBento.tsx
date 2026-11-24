import type { CSSProperties, ReactNode } from "react";
import Reveal from "@/components/Reveal";
import { GridBackground } from "@/components/ui/grid-background";
import { Container, SectionHeader } from "./primitives";
import type { Incluye } from "@/content/servicios";
import { cn } from "@/lib/utils";

// "Todo lo que trae tu página" (D-078): bento con una ilustración SVG animada
// que cuenta CADA punto (no un ícono genérico). Las animaciones arrancan cuando la
// tarjeta entra en pantalla (.is-visible de <Reveal>), son solo transform/opacity
// y con movimiento reducido se ve el estado final. CSS en globals.css (.ib-*).

const L = "#B6FF00";
const P = "#D4D4D8"; // D-146: antes morado; el morado queda solo para botones
const S = "#A1A1AA";
const LINE = "rgba(255,255,255,0.12)";
const FILL = "rgba(255,255,255,0.06)";
const v = (i: number) => ({ ["--i" as string]: i }) as CSSProperties;

/* 1 · 5 secciones: la página se arma sección por sección */
function Secciones() {
  const filas = [
    { y: 28, h: 28 },
    { y: 60, h: 12 },
    { y: 76, h: 12 },
    { y: 92, h: 12 },
    { y: 108, h: 12 },
  ];
  return (
    <svg viewBox="0 0 320 130" className="h-full w-full" aria-hidden>
      <rect x="8" y="6" width="244" height="120" rx="10" fill="rgba(255,255,255,0.02)" stroke={LINE} />
      <circle cx="20" cy="16" r="2.5" fill={LINE} />
      <circle cx="29" cy="16" r="2.5" fill={LINE} />
      <circle cx="38" cy="16" r="2.5" fill={LINE} />
      {filas.map((f, i) => (
        <g key={i} className="ib-rise" style={v(i)}>
          <rect x="18" y={f.y} width="224" height={f.h} rx="4" fill={i === 0 ? "rgba(255,255,255,0.126)" : FILL} />
          {i === 0 ? (
            <>
              <rect x="26" y={f.y + 7} width="90" height="5" rx="2.5" fill="rgba(255,255,255,0.7)" />
              <rect x="26" y={f.y + 16} width="56" height="5" rx="2.5" fill={L} />
            </>
          ) : (
            <rect x="26" y={f.y + 4} width={60 + i * 18} height="4" rx="2" fill="rgba(255,255,255,0.22)" />
          )}
          <circle cx="282" cy={f.y + f.h / 2} r="9" fill={i === 0 ? L : "rgba(255,255,255,0.113)"} />
          <text
            x="282"
            y={f.y + f.h / 2 + 3.5}
            textAnchor="middle"
            fontSize="10"
            fontWeight="800"
            fill={i === 0 ? "#03010B" : "#FFFFFF"}
            fontFamily="var(--font-display)"
          >
            {i + 1}
          </text>
          <line x1="252" y1={f.y + f.h / 2} x2="271" y2={f.y + f.h / 2} stroke={LINE} strokeDasharray="2 3" />
        </g>
      ))}
    </svg>
  );
}

/* 2 · Hecha primero para el celular: el contenido se desplaza dentro del teléfono */
function Celular() {
  return (
    <svg viewBox="0 0 160 250" className="h-full w-full" aria-hidden>
      <defs>
        <clipPath id="ib-pantalla">
          <rect x="38" y="30" width="84" height="192" rx="6" />
        </clipPath>
      </defs>
      <rect x="30" y="12" width="100" height="228" rx="20" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <rect x="66" y="19" width="28" height="5" rx="2.5" fill={LINE} />
      <g clipPath="url(#ib-pantalla)">
        <g className="ib-scroll">
          <rect x="44" y="36" width="72" height="44" rx="6" fill="rgba(255,255,255,0.135)" />
          <rect x="50" y="46" width="44" height="5" rx="2.5" fill="rgba(255,255,255,0.75)" />
          <rect x="50" y="56" width="30" height="5" rx="2.5" fill={L} />
          {[90, 126, 162, 198, 234, 270].map((y, k) => (
            <g key={y}>
              <rect x="44" y={y} width="72" height="28" rx="6" fill={FILL} />
              <rect x="50" y={y + 7} width="18" height="14" rx="3" fill={k % 2 ? "rgba(255,255,255,0.158)" : "rgba(182,255,0,0.3)"} />
              <rect x="74" y={y + 9} width="34" height="4" rx="2" fill="rgba(255,255,255,0.35)" />
              <rect x="74" y={y + 16} width="22" height="4" rx="2" fill="rgba(255,255,255,0.18)" />
            </g>
          ))}
        </g>
        {/* botón fijo abajo, como en las páginas que hacemos */}
        <rect x="44" y="200" width="72" height="16" rx="5" fill={L} className="ib-pulse" />
      </g>
      <circle cx="110" cy="150" r="9" fill="rgba(255,255,255,0.18)" className="ib-tap" />
    </svg>
  );
}

/* 3 · Velocidad garantizada: velocímetro que sube a 90+ */
function Velocidad() {
  const ticks = Array.from({ length: 11 }, (_, k) => (Math.PI * k) / 10);
  return (
    <svg viewBox="0 0 200 150" className="h-full w-full" aria-hidden>
      <path d="M30 110 A70 70 0 0 1 170 110" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" strokeLinecap="round" />
      {ticks.map((a, k) => (
        <line
          key={k}
          x1={100 - Math.cos(a) * 82}
          y1={110 - Math.sin(a) * 82}
          x2={100 - Math.cos(a) * 88}
          y2={110 - Math.sin(a) * 88}
          stroke={k >= 9 ? L : "rgba(255,255,255,0.3)"}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ))}
      <path
        className="v2-draw"
        d="M30 110 A70 70 0 0 1 170 110"
        fill="none"
        stroke={L}
        strokeWidth="12"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="100"
        strokeDashoffset="100"
        style={{ ["--to" as string]: 7 }}
      />
      <g className="ib-needle">
        <line x1="100" y1="110" x2="100" y2="54" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        <circle cx="100" cy="54" r="3.5" fill={L} className="v2-beat" />
      </g>
      <circle cx="100" cy="110" r="7" fill="#141417" stroke="#FFFFFF" strokeWidth="2" />
      <text x="100" y="144" textAnchor="middle" fontSize="26" fontWeight="800" fill={L} fontFamily="var(--font-display)" className="ib-fade" style={v(4)}>
        90+
      </text>
    </svg>
  );
}

/* 4 · Lista para Google y la IA: tu página sube al primer resultado */
function Google() {
  return (
    <svg viewBox="0 0 220 120" className="h-full w-full" aria-hidden>
      <rect x="8" y="6" width="190" height="22" rx="11" fill={FILL} stroke={LINE} />
      <circle cx="22" cy="17" r="4.5" fill="none" stroke={S} strokeWidth="1.6" />
      <line x1="25.5" y1="20.5" x2="29" y2="24" stroke={S} strokeWidth="1.6" strokeLinecap="round" />
      <rect x="36" y="14" width="78" height="6" rx="3" fill="rgba(255,255,255,0.5)" className="ib-type" />
      <rect x="117" y="12" width="1.6" height="10" fill="#FFFFFF" className="ib-caret" />
      {/* resultados: el tuyo sube del 3.º al 1.º */}
      <g className="ib-down" style={v(0)}>
        <rect x="8" y="36" width="190" height="22" rx="6" fill={FILL} />
        <rect x="16" y="43" width="90" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
        <rect x="16" y="50" width="60" height="3" rx="1.5" fill="rgba(255,255,255,0.15)" />
      </g>
      <g className="ib-down" style={v(1)}>
        <rect x="8" y="62" width="190" height="22" rx="6" fill={FILL} />
        <rect x="16" y="69" width="76" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
        <rect x="16" y="76" width="52" height="3" rx="1.5" fill="rgba(255,255,255,0.15)" />
      </g>
      <g className="ib-climb">
        <rect x="8" y="36" width="190" height="22" rx="6" fill="rgba(182,255,0,0.1)" stroke={L} strokeOpacity="0.6" />
        <rect x="16" y="43" width="70" height="4" rx="2" fill={L} />
        <rect x="16" y="50" width="96" height="3" rx="1.5" fill="rgba(255,255,255,0.35)" />
        <text x="186" y="51" textAnchor="end" fontSize="9" fontWeight="800" fill={L} fontFamily="var(--font-display)">
          #1
        </text>
      </g>
      {/* IA */}
      <path d="M206 6 l2.4 6 6 2.4 -6 2.4 -2.4 6 -2.4 -6 -6 -2.4 6 -2.4z" fill={S} className="ib-twinkle" />
    </svg>
  );
}

/* 5 · Dominio y hosting: tu dirección propia, con candado */
function Dominio() {
  return (
    <svg viewBox="0 0 220 120" className="h-full w-full" aria-hidden>
      <g transform="translate(150 66)">
        <circle r="30" fill="none" stroke={LINE} />
        <ellipse rx="13" ry="30" fill="none" stroke={LINE} />
        <line x1="-30" y1="0" x2="30" y2="0" stroke={LINE} />
        <path d="M-26 -14 H26 M-26 14 H26" stroke={LINE} />
        <ellipse rx="44" ry="14" fill="none" stroke="rgba(255,255,255,0.158)" strokeDasharray="2 4" />
        {/* punto que da la vuelta: tu página siempre en línea */}
        <circle r="3.5" fill={L} className="ib-orbit" />
      </g>
      <rect x="8" y="12" width="150" height="26" rx="13" fill="#0B0B0D" stroke="rgba(255,255,255,0.16)" />
      <rect x="20" y="22" width="9" height="8" rx="2" fill={L} />
      <path d="M22 22 v-2.5 a2.5 2.5 0 0 1 5 0 V22" fill="none" stroke={L} strokeWidth="1.4" />
      <text x="36" y="29" fontSize="11" fill="#FFFFFF" fontFamily="var(--font-sans)" className="ib-fade" style={v(1)}>
        tunegocio.com
      </text>
    </svg>
  );
}

/* 6 · 2 rondas de ajustes: dos vueltas que se completan */
function Ajustes() {
  return (
    <svg viewBox="0 0 220 120" className="h-full w-full" aria-hidden>
      <line x1="62" y1="60" x2="158" y2="60" stroke={LINE} strokeWidth="2" strokeDasharray="3 4" />
      {[62, 158].map((cx, k) => (
        <g key={cx}>
          <circle cx={cx} cy="60" r="30" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
          <circle
            cx={cx}
            cy="60"
            r="30"
            fill="none"
            stroke={k === 0 ? L : P}
            strokeWidth="4"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="100"
            strokeDashoffset="100"
            transform={`rotate(-90 ${cx} 60)`}
            className="v2-draw"
            style={{ ["--to" as string]: 0, transitionDelay: `${0.3 + k * 1.1}s` }}
          />
          <path
            d={`M${cx - 9} 60 l6 6 l12 -13`}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={100}
            strokeDasharray="100"
            strokeDashoffset="100"
            className="v2-draw"
            style={{ ["--to" as string]: 0, transitionDelay: `${1.1 + k * 1.1}s` }}
          />
          <text x={cx} y="108" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.55)" fontFamily="var(--font-sans)">
            Ronda {k + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* 7 · Capacitación: el cursor aprende a usar el panel */
function Capacitacion() {
  return (
    <svg viewBox="0 0 220 120" className="h-full w-full" aria-hidden>
      <rect x="8" y="8" width="204" height="104" rx="10" fill="rgba(255,255,255,0.02)" stroke={LINE} />
      <rect x="8" y="8" width="44" height="104" rx="10" fill={FILL} />
      {[24, 38, 52, 66].map((y, k) => (
        <rect key={y} x="18" y={y} width="24" height="5" rx="2.5" fill={k === 1 ? S : "rgba(255,255,255,0.2)"} />
      ))}
      <rect x="64" y="22" width="80" height="6" rx="3" fill="rgba(255,255,255,0.5)" />
      <rect x="64" y="34" width="120" height="4" rx="2" fill="rgba(255,255,255,0.18)" />
      <rect x="64" y="42" width="100" height="4" rx="2" fill="rgba(255,255,255,0.18)" />
      <rect x="64" y="64" width="70" height="20" rx="6" fill="rgba(255,255,255,0.1)" />
      <rect x="64" y="64" width="70" height="20" rx="6" fill={L} className="ib-btn" />
      <text x="99" y="77.5" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#03010B" fontFamily="var(--font-sans)" className="ib-btn">
        Guardar
      </text>
      <circle cx="112" cy="74" r="12" fill="none" stroke={L} strokeWidth="1.5" className="ib-ripple" />
      <path
        className="ib-cursor"
        d="M0 0 L0 16 L4.5 12 L8 19 L11 17.5 L7.5 10.8 L13 10.8 Z"
        fill="#FFFFFF"
        stroke="#03010B"
        strokeWidth="1"
      />
    </svg>
  );
}

/* 8 · Entrega en 5 días hábiles: los días se llenan y la página queda lista */
function Entrega() {
  return (
    <svg viewBox="0 0 340 96" className="h-full w-full" aria-hidden>
      <line x1="26" y1="40" x2="234" y2="40" stroke="rgba(255,255,255,0.1)" strokeWidth="3" strokeLinecap="round" />
      <line x1="26" y1="40" x2="234" y2="40" stroke={L} strokeWidth="3" strokeLinecap="round" className="ib-bar" />
      {[0, 1, 2, 3, 4].map((k) => {
        const x = 26 + k * 52;
        return (
          <g key={k}>
            <circle cx={x} cy="40" r="14" fill="#111113" stroke="rgba(255,255,255,0.16)" />
            <circle cx={x} cy="40" r="14" fill={L} className="ib-day" style={v(k)} />
            <text x={x} y="44" textAnchor="middle" fontSize="11" fontWeight="800" fill="#FFFFFF" fontFamily="var(--font-display)">
              {k + 1}
            </text>
            <text x={x} y="44" textAnchor="middle" fontSize="11" fontWeight="800" fill="#03010B" fontFamily="var(--font-display)" className="ib-day" style={v(k)}>
              {k + 1}
            </text>
            <text x={x} y="74" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.45)" fontFamily="var(--font-sans)">
              Día {k + 1}
            </text>
          </g>
        );
      })}
      <g className="ib-pop">
        <rect x="262" y="26" width="66" height="28" rx="14" fill={L} />
        <path d="M275 40 l4 4 l8 -9" fill="none" stroke="#03010B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <text x="306" y="44" textAnchor="middle" fontSize="10" fontWeight="800" fill="#03010B" fontFamily="var(--font-display)">
          Lista
        </text>
      </g>
    </svg>
  );
}

/* Sitio corporativo (D-176) · Mapa del sitio: inicio arriba y una página por cada servicio */
function Paginas() {
  const hijos = [
    { x: 4, t: "Nosotros" },
    { x: 67, t: "Servicio 1" },
    { x: 130, t: "Servicio 2" },
    { x: 193, t: "Blog" },
    { x: 256, t: "Contacto" },
  ];
  return (
    <svg viewBox="0 0 320 130" className="h-full w-full" aria-hidden>
      <g className="ib-rise" style={v(0)}>
        <rect x="112" y="8" width="96" height="30" rx="8" fill="rgba(182,255,0,0.12)" stroke={L} strokeOpacity="0.7" />
        <text x="160" y="27" textAnchor="middle" fontSize="11" fontWeight="800" fill={L} fontFamily="var(--font-display)">
          Inicio
        </text>
      </g>
      <path d="M160 38 V56 M34 56 H286 M34 56 V70 M97 56 V70 M160 56 V70 M223 56 V70 M286 56 V70" fill="none" stroke={LINE} strokeDasharray="2 3" />
      {hijos.map((h, i) => (
        <g key={h.t} className="ib-rise" style={v(i + 1)}>
          <rect x={h.x} y="70" width="60" height="50" rx="8" fill={FILL} stroke={LINE} />
          <rect x={h.x + 8} y="80" width="28" height="5" rx="2.5" fill="rgba(255,255,255,0.6)" />
          <rect x={h.x + 8} y="90" width="44" height="4" rx="2" fill="rgba(255,255,255,0.18)" />
          <rect x={h.x + 8} y="98" width="34" height="4" rx="2" fill="rgba(255,255,255,0.18)" />
          <text x={h.x + 30} y="116" textAnchor="middle" fontSize="7.5" fill={S} fontFamily="var(--font-sans)">
            {h.t}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* Sitio corporativo (D-176) · Blog básico: entradas que se van publicando */
function Blog() {
  return (
    <svg viewBox="0 0 220 120" className="h-full w-full" aria-hidden>
      {[0, 1, 2].map((i) => (
        <g key={i} className="ib-rise" style={v(i)}>
          <rect x={10 + i * 70} y="14" width="62" height="92" rx="8" fill={FILL} stroke={i === 0 ? L : LINE} strokeOpacity={i === 0 ? 0.6 : 1} />
          <rect x={16 + i * 70} y="20" width="50" height="30" rx="5" fill={i === 0 ? "rgba(182,255,0,0.14)" : "rgba(255,255,255,0.08)"} />
          <rect x={16 + i * 70} y="58" width="40" height="5" rx="2.5" fill="rgba(255,255,255,0.6)" />
          <rect x={16 + i * 70} y="68" width="48" height="3.5" rx="1.75" fill="rgba(255,255,255,0.2)" />
          <rect x={16 + i * 70} y="76" width="36" height="3.5" rx="1.75" fill="rgba(255,255,255,0.2)" />
          <rect x={16 + i * 70} y="90" width="22" height="8" rx="4" fill={i === 0 ? L : "rgba(255,255,255,0.12)"} />
        </g>
      ))}
    </svg>
  );
}

/* Sitio corporativo (D-176) · Panel básico: cambias un texto y publicas */
function Panel() {
  return (
    <svg viewBox="0 0 220 120" className="h-full w-full" aria-hidden>
      <rect x="10" y="8" width="200" height="104" rx="10" fill="rgba(255,255,255,0.02)" stroke={LINE} />
      <rect x="10" y="8" width="44" height="104" rx="10" fill="rgba(255,255,255,0.04)" />
      {[24, 38, 52].map((y, i) => (
        <rect key={y} x="20" y={y} width="24" height="5" rx="2.5" fill={i === 0 ? L : "rgba(255,255,255,0.2)"} />
      ))}
      <text x="66" y="28" fontSize="8" fill={S} fontFamily="var(--font-sans)">Título de la portada</text>
      <rect x="64" y="34" width="134" height="20" rx="6" fill="#0B0B0D" stroke="rgba(255,255,255,0.16)" />
      <rect x="72" y="41" width="70" height="6" rx="3" fill="rgba(255,255,255,0.55)" className="ib-type" />
      <rect x="144" y="39" width="1.6" height="10" fill="#FFFFFF" className="ib-caret" />
      <text x="66" y="70" fontSize="8" fill={S} fontFamily="var(--font-sans)">Nueva entrada del blog</text>
      <rect x="64" y="76" width="134" height="6" rx="3" fill="rgba(255,255,255,0.12)" />
      <g className="ib-pop" style={v(3)}>
        <rect x="140" y="90" width="58" height="16" rx="8" fill={L} />
        <text x="169" y="101" textAnchor="middle" fontSize="8" fontWeight="800" fill="#03010B" fontFamily="var(--font-display)">
          Publicar
        </text>
      </g>
    </svg>
  );
}

/* Sitio corporativo (D-177) · Burbuja de WhatsApp o formulario de contacto */
function Contacto() {
  return (
    <svg viewBox="0 0 520 96" className="h-full w-full" aria-hidden>
      {/* formulario */}
      <rect x="20" y="10" width="240" height="76" rx="10" fill="rgba(255,255,255,0.02)" stroke={LINE} />
      {[18, 38].map((y, i) => (
        <g key={y} className="ib-rise" style={v(i)}>
          <rect x="32" y={y} width="150" height="14" rx="5" fill="#0B0B0D" stroke="rgba(255,255,255,0.16)" />
          <rect x="40" y={y + 5} width={i === 0 ? 54 : 80} height="4" rx="2" fill="rgba(255,255,255,0.45)" />
        </g>
      ))}
      <g className="ib-pop" style={v(2)}>
        <rect x="32" y="60" width="70" height="16" rx="8" fill={L} />
        <text x="67" y="71" textAnchor="middle" fontSize="8" fontWeight="800" fill="#03010B" fontFamily="var(--font-display)">
          Enviar
        </text>
      </g>
      <line x1="290" y1="18" x2="290" y2="78" stroke={LINE} strokeDasharray="2 4" />
      {/* burbuja de WhatsApp */}
      <g className="ib-rise" style={v(3)}>
        <rect x="320" y="22" width="132" height="34" rx="12" fill={FILL} stroke={LINE} />
        <rect x="332" y="32" width="90" height="5" rx="2.5" fill="rgba(255,255,255,0.55)" />
        <rect x="332" y="42" width="60" height="4" rx="2" fill="rgba(255,255,255,0.2)" />
      </g>
      <g className="ib-pulse">
        <circle cx="478" cy="62" r="20" fill={L} />
        <path d="M468 72 l2.6-7.2 a10 10 0 1 1 4.2 4.1 z" fill="none" stroke="#03010B" strokeWidth="2" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/* Catálogo (D-195) · Catálogo con carrito: productos por categoría y el pedido se arma solo */
function Carrito() {
  const prods = [0, 1, 2, 3];
  return (
    <svg viewBox="0 0 320 130" className="h-full w-full" aria-hidden>
      {["Todo", "Camisetas", "Gorras"].map((t, i) => (
        <g key={t}>
          <rect x={8 + [0, 40, 102][i]} y="6" width={[34, 56, 46][i]} height="16" rx="8" fill={i === 0 ? L : FILL} stroke={i === 0 ? "none" : LINE} />
          <text x={8 + [0, 40, 102][i] + [34, 56, 46][i] / 2} y="17" textAnchor="middle" fontSize="7.5" fontWeight={i === 0 ? 800 : 400} fill={i === 0 ? "#03010B" : S} fontFamily="var(--font-sans)">
            {t}
          </text>
        </g>
      ))}
      {/* carrito con el número de productos */}
      <g>
        <path d="M278 8 h5 l4 14 h15 l3 -10 h-20" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="290" cy="26" r="1.8" fill="rgba(255,255,255,0.7)" />
        <circle cx="300" cy="26" r="1.8" fill="rgba(255,255,255,0.7)" />
        <g className="ib-pop" style={v(4)}>
          <circle cx="307" cy="8" r="6.5" fill={L} />
          <text x="307" y="10.8" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#03010B" fontFamily="var(--font-display)">3</text>
        </g>
      </g>
      {prods.map((i) => (
        <g key={i} className="ib-rise" style={v(i)}>
          <rect x={8 + i * 78} y="32" width="70" height="92" rx="8" fill={FILL} stroke={i === 1 ? L : LINE} strokeOpacity={i === 1 ? 0.6 : 1} />
          <rect x={14 + i * 78} y="38" width="58" height="40" rx="5" fill={i === 1 ? "rgba(182,255,0,0.14)" : "rgba(255,255,255,0.08)"} />
          <rect x={14 + i * 78} y="85" width="40" height="5" rx="2.5" fill="rgba(255,255,255,0.6)" />
          <rect x={14 + i * 78} y="95" width="26" height="4" rx="2" fill={i === 1 ? L : "rgba(255,255,255,0.25)"} />
          <circle cx={63 + i * 78} cy="110" r="7" fill={i === 1 ? L : "rgba(255,255,255,0.12)"} />
          <path d={`M${60 + i * 78} 110 h6 M${63 + i * 78} 107 v6`} stroke={i === 1 ? "#03010B" : "#FFFFFF"} strokeWidth="1.5" strokeLinecap="round" />
        </g>
      ))}
      <circle cx="141" cy="110" r="10" fill="none" stroke={L} strokeWidth="1.5" className="ib-tap" />
    </svg>
  );
}

/* Catálogo (D-195) · Pedido directo a tu WhatsApp: llega ordenado, con productos y cantidades */
function Whatsapp() {
  const lineas = [
    { t: "2 × Camiseta negra", y: 112 },
    { t: "1 × Gorra", y: 126 },
    { t: "3 × Stickers", y: 140 },
  ];
  return (
    <svg viewBox="0 0 160 250" className="h-full w-full" aria-hidden>
      <rect x="30" y="12" width="100" height="228" rx="20" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <rect x="66" y="19" width="28" height="5" rx="2.5" fill={LINE} />
      {/* encabezado del chat */}
      <rect x="38" y="30" width="84" height="26" rx="6" fill="rgba(255,255,255,0.06)" />
      <circle cx="51" cy="43" r="7" fill={L} />
      <path d="M47.5 46.5 l1-2.6 a3.6 3.6 0 1 1 1.5 1.5 z" fill="none" stroke="#03010B" strokeWidth="1.1" strokeLinejoin="round" />
      <rect x="62" y="38" width="40" height="4.5" rx="2.25" fill="rgba(255,255,255,0.7)" />
      <rect x="62" y="46" width="26" height="3.5" rx="1.75" fill="rgba(255,255,255,0.25)" />
      {/* el pedido */}
      <g className="ib-rise" style={v(0)}>
        <rect x="42" y="72" width="76" height="98" rx="8" fill="rgba(182,255,0,0.1)" stroke={L} strokeOpacity="0.5" />
        <text x="49" y="88" fontSize="8" fontWeight="800" fill={L} fontFamily="var(--font-display)">Nuevo pedido</text>
        <rect x="49" y="94" width="62" height="1" fill="rgba(255,255,255,0.15)" />
      </g>
      {lineas.map((l, i) => (
        <text key={l.t} x="49" y={l.y - 4} fontSize="6.6" fill="rgba(255,255,255,0.85)" fontFamily="var(--font-sans)" className="ib-rise" style={v(i + 1)}>
          {l.t}
        </text>
      ))}
      <g className="ib-rise" style={v(4)}>
        <rect x="49" y="144" width="62" height="1" fill="rgba(255,255,255,0.15)" />
        <text x="49" y="158" fontSize="7" fontWeight="800" fill="#FFFFFF" fontFamily="var(--font-display)">Total</text>
        <text x="111" y="158" textAnchor="end" fontSize="7" fontWeight="800" fill={L} fontFamily="var(--font-display)">$ 148.000</text>
        <path d="M100 165 l2 2 l4 -4 M104 165 l2 2 l4 -4" fill="none" stroke={L} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* respuesta */}
      <g className="ib-pop" style={v(5)}>
        <rect x="42" y="180" width="56" height="20" rx="7" fill="rgba(255,255,255,0.08)" />
        <rect x="48" y="188" width="40" height="4" rx="2" fill="rgba(255,255,255,0.4)" />
      </g>
    </svg>
  );
}

/* Catálogo (D-195) · Panel para tu tienda: los pedidos del día con su estado */
function PanelTienda() {
  const pedidos = [
    { n: "#128", e: "Nuevo", on: true },
    { n: "#127", e: "Preparando", on: false },
    { n: "#126", e: "Entregado", on: false },
  ];
  return (
    <svg viewBox="0 0 320 130" className="h-full w-full" aria-hidden>
      <rect x="8" y="6" width="304" height="118" rx="10" fill="rgba(255,255,255,0.02)" stroke={LINE} />
      <rect x="8" y="6" width="56" height="118" rx="10" fill="rgba(255,255,255,0.04)" />
      {[22, 36, 50, 64].map((y, i) => (
        <rect key={y} x="18" y={y} width="34" height="5" rx="2.5" fill={i === 1 ? L : "rgba(255,255,255,0.2)"} />
      ))}
      <text x="76" y="24" fontSize="8" fill={S} fontFamily="var(--font-sans)">Pedidos de hoy</text>
      <text x="300" y="26" textAnchor="end" fontSize="16" fontWeight="800" fill={L} fontFamily="var(--font-display)" className="ib-fade" style={v(1)}>
        12
      </text>
      {pedidos.map((p, i) => (
        <g key={p.n} className="ib-rise" style={v(i)}>
          <rect x="74" y={36 + i * 29} width="228" height="24" rx="6" fill={FILL} stroke={p.on ? L : "none"} strokeOpacity="0.5" />
          <text x="84" y={51 + i * 29} fontSize="8" fontWeight="800" fill="#FFFFFF" fontFamily="var(--font-display)">{p.n}</text>
          <rect x="112" y={45 + i * 29} width={70 - i * 10} height="5" rx="2.5" fill="rgba(255,255,255,0.4)" />
          <rect x="238" y={41 + i * 29} width="56" height="14" rx="7" fill={p.on ? L : "rgba(255,255,255,0.1)"} />
          <text x="266" y={50.5 + i * 29} textAnchor="middle" fontSize="7" fontWeight={p.on ? 800 : 400} fill={p.on ? "#03010B" : S} fontFamily="var(--font-sans)">
            {p.e}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* Catálogo (D-195) · Inventario: cuánto queda de cada producto */
function Inventario() {
  const prods = [
    { t: "Camiseta negra", q: 24, w: 150 },
    { t: "Gorra", q: 12, w: 76 },
    { t: "Termo", q: 3, w: 20 },
  ];
  return (
    <svg viewBox="0 0 320 130" className="h-full w-full" aria-hidden>
      {prods.map((p, i) => (
        <g key={p.t}>
          <rect x="8" y={10 + i * 40} width="38" height="30" rx="6" fill={i === 2 ? "rgba(182,255,0,0.14)" : "rgba(255,255,255,0.08)"} />
          <text x="56" y={21 + i * 40} fontSize="8" fill="rgba(255,255,255,0.85)" fontFamily="var(--font-sans)">{p.t}</text>
          <rect x="56" y={28 + i * 40} width="200" height="7" rx="3.5" fill="rgba(255,255,255,0.08)" />
          <rect x="56" y={28 + i * 40} width={p.w} height="7" rx="3.5" fill={i === 2 ? L : "rgba(255,255,255,0.55)"} className="ib-bar" />
          <text x="300" y={36 + i * 40} textAnchor="end" fontSize="16" fontWeight="800" fill={i === 2 ? L : "#FFFFFF"} fontFamily="var(--font-display)" className="ib-fade" style={v(i + 1)}>
            {p.q}
          </text>
          {i === 2 && (
            <g className="ib-pop" style={v(3)}>
              <rect x="186" y={10 + i * 40} width="70" height="14" rx="7" fill="rgba(182,255,0,0.14)" stroke={L} strokeOpacity="0.6" />
              <text x="221" y={19.5 + i * 40} textAnchor="middle" fontSize="7" fontWeight="800" fill={L} fontFamily="var(--font-sans)">Quedan pocos</text>
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}

const ILUSTRACION: Record<string, () => ReactNode> = {
  carrito: Carrito,
  whatsapp: Whatsapp,
  panelTienda: PanelTienda,
  inventario: Inventario,
  contacto: Contacto,
  paginas: Paginas,
  blog: Blog,
  panel: Panel,
  secciones: Secciones,
  celular: Celular,
  velocidad: Velocidad,
  google: Google,
  dominio: Dominio,
  ajustes: Ajustes,
  capacitacion: Capacitacion,
  entrega: Entrega,
};

// Posición en la grilla de 4 columnas × 3 filas (escritorio). En celular, una columna.
// Catálogo (D-195): carrito, panel e inventario a lo ancho y el chat de WhatsApp alto, como el celular.
const CELDA: Record<string, { clase: string; alto: string }> = {
  carrito: { clase: "lg:col-span-2", alto: "h-36" },
  panelTienda: { clase: "lg:col-span-2", alto: "h-36" },
  inventario: { clase: "lg:col-span-2", alto: "h-36" },
  whatsapp: { clase: "lg:row-span-2", alto: "h-56 lg:h-72" },
  secciones: { clase: "lg:col-span-2", alto: "h-36" },
  paginas: { clase: "lg:col-span-2", alto: "h-36" },
  blog: { clase: "", alto: "h-28" },
  panel: { clase: "", alto: "h-28" },
  contacto: { clase: "sm:col-span-2 lg:col-span-4", alto: "h-24" },
  celular: { clase: "lg:row-span-2", alto: "h-56 lg:h-72" },
  velocidad: { clase: "lg:row-span-2", alto: "h-44 lg:h-60" },
  google: { clase: "", alto: "h-28" },
  dominio: { clase: "", alto: "h-28" },
  ajustes: { clase: "", alto: "h-28" },
  capacitacion: { clase: "", alto: "h-28" },
  entrega: { clase: "sm:col-span-2", alto: "h-24" },
};

export default function IncludesBento({ id, titulo, items }: { id: string; titulo: string; items: Incluye[] }) {
  return (
    <section aria-labelledby={id} className="relative isolate py-20 sm:py-28">
      <GridBackground orb="50% 45%" />
      <Container>
        <SectionHeader id={id} title={titulo} />
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-flow-dense lg:grid-cols-4">
          {items.map((it, i) => {
            const Ilus = ILUSTRACION[it.icono];
            const celda = CELDA[it.icono] ?? { clase: "", alto: "h-28" };
            const clave = it.icono === "velocidad";
            return (
              <Reveal as="li" key={it.titulo} delay={(i % 4) * 60} className={cn("ib h-full", celda.clase)}>
                <article
                  className={cn(
                    "flex h-full flex-col overflow-hidden rounded-card border bg-surface-1 p-5",
                    clave ? "border-lime/30 shadow-[0_0_40px_-12px_rgba(182,255,0,0.35)]" : "border-white/8"
                  )}
                >
                  <div className={cn("flex flex-1 items-center justify-center", celda.alto)}>{Ilus ? <Ilus /> : null}</div>
                  <h3 className="mt-4 font-display text-lg font-bold tracking-heading text-white">{it.titulo}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-fog">{it.texto}</p>
                </article>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
