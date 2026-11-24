import { cn } from "@/lib/utils";

// Íconos de marca en SVG propio (nacieron en D-150, archivada): volumen en grises metálicos, sin color, para dar
// personalidad a ALGUNAS tarjetas (paquetes de precio). No reemplazan a los íconos de función
// (Phosphor, components/v2/iconos.tsx) y no se ponen en todas las tarjetas: solo donde ayudan a
// distinguir una opción de otra. 0 KB de imagen y sin JavaScript.

export type IconoMarca = "capas" | "tienda" | "sistema" | "edificio";

function Degradados({ id }: { id: string }) {
  return (
    <defs>
      {/* cara de arriba: luz */}
      <linearGradient id={`${id}-a`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FAFAFA" />
        <stop offset="1" stopColor="#9A9AA2" />
      </linearGradient>
      {/* cara izquierda: medio tono */}
      <linearGradient id={`${id}-b`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8E8E96" />
        <stop offset="1" stopColor="#3F3F46" />
      </linearGradient>
      {/* cara derecha: sombra */}
      <linearGradient id={`${id}-c`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#5C5C64" />
        <stop offset="1" stopColor="#1F1F23" />
      </linearGradient>
    </defs>
  );
}

const filo = { stroke: "rgba(255,255,255,0.35)", strokeWidth: 0.6, strokeLinejoin: "round" as const };

/** Capas apiladas: la página (secciones una sobre otra). */
function Capas({ id }: { id: string }) {
  const capa = (y: number, top: string, opacidad: number) => (
    <g transform={`translate(0 ${y})`} opacity={opacidad}>
      <path d="M16 6 L27 11.5 L16 17 L5 11.5 Z" fill={top} {...filo} />
      <path d="M5 11.5 L16 17 L16 19.5 L5 14 Z" fill={`url(#${id}-b)`} />
      <path d="M27 11.5 L16 17 L16 19.5 L27 14 Z" fill={`url(#${id}-c)`} />
    </g>
  );
  return (
    <>
      {capa(10, `url(#${id}-c)`, 0.55)}
      {capa(5, `url(#${id}-b)`, 0.8)}
      {capa(0, `url(#${id}-a)`, 1)}
    </>
  );
}

/** Bolsa: la tienda por WhatsApp. */
function Tienda({ id }: { id: string }) {
  return (
    <>
      <path d="M11.5 11 C11.5 7 13.5 5 16 5 C18.5 5 20.5 7 20.5 11" fill="none" stroke="#B4B4BC" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7 12 L16 15.5 L16 28 L8 24.5 Z" fill={`url(#${id}-b)`} {...filo} />
      <path d="M25 12 L16 15.5 L16 28 L24 24.5 Z" fill={`url(#${id}-c)`} {...filo} />
      <path d="M7 12 L16 8.5 L25 12 L16 15.5 Z" fill={`url(#${id}-a)`} {...filo} />
    </>
  );
}

/** Cubo con un hueco: el sistema a la medida (piezas que encajan). */
function Sistema({ id }: { id: string }) {
  return (
    <>
      <path d="M16 4 L27 9.5 L16 15 L5 9.5 Z" fill={`url(#${id}-a)`} {...filo} />
      <path d="M5 9.5 L16 15 L16 28 L5 22.5 Z" fill={`url(#${id}-b)`} {...filo} />
      <path d="M27 9.5 L16 15 L16 28 L27 22.5 Z" fill={`url(#${id}-c)`} {...filo} />
      <path d="M16 7.5 L20 9.5 L16 11.5 L12 9.5 Z" fill="#2A2A2F" opacity="0.8" />
    </>
  );
}

/** Edificio con ventanas: el sitio de una empresa (varias páginas, blog y panel). */
function Edificio({ id }: { id: string }) {
  const ventanas = [10.5, 15, 19.5].flatMap((y) => [
    <path key={`i${y}`} d={`M8 ${y} L10.5 ${y + 1.25} L10.5 ${y + 3.25} L8 ${y + 2} Z`} fill="#2A2A2F" opacity="0.75" />,
    <path key={`d${y}`} d={`M21.5 ${y + 1.25} L24 ${y} L24 ${y + 2} L21.5 ${y + 3.25} Z`} fill="#16161A" opacity="0.8" />,
  ]);
  return (
    <>
      <path d="M16 3 L26 8 L16 13 L6 8 Z" fill={`url(#${id}-a)`} {...filo} />
      <path d="M6 8 L16 13 L16 29 L6 24 Z" fill={`url(#${id}-b)`} {...filo} />
      <path d="M26 8 L16 13 L16 29 L26 24 Z" fill={`url(#${id}-c)`} {...filo} />
      {ventanas}
    </>
  );
}

const DIBUJOS = { capas: Capas, tienda: Tienda, sistema: Sistema, edificio: Edificio };

export function IconoMarca({ icono, className }: { icono: IconoMarca; className?: string }) {
  const Dibujo = DIBUJOS[icono];
  const id = `im-${icono}`;
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("h-8 w-8", className)}>
      <Degradados id={id} />
      <Dibujo id={id} />
    </svg>
  );
}
