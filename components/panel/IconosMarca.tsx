import { cn } from "@/lib/utils";

// Íconos de marca del sistema (D-150, D-153): SVG propio en grises metálicos con volumen, sin color.
// Copia de components/v2/IconosMarca.tsx a propósito: el panel no importa piezas del sitio (D-135).
// Si cambias un dibujo aquí, cámbialo también allá. Solo en algunas tarjetas: en el panel, las de
// proyectos, según el servicio (página, catálogo/tienda, sistema).

export type IconoMarca = "capas" | "tienda" | "sistema";

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

const DIBUJOS = { capas: Capas, tienda: Tienda, sistema: Sistema };

export function IconoMarca({ icono, className }: { icono: IconoMarca; className?: string }) {
  const Dibujo = DIBUJOS[icono];
  const id = `pn-im-${icono}`;
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("h-8 w-8", className)}>
      <Degradados id={id} />
      <Dibujo id={id} />
    </svg>
  );
}

/** Ícono según el nombre del servicio del proyecto (o nada si no se reconoce). */
export function iconoDeServicio(nombre: string | undefined): IconoMarca | null {
  const n = (nombre ?? "").toLowerCase();
  if (/cat[aá]logo|tienda/.test(n)) return "tienda";
  if (/sistema|app|aplicaci|crm|reserva/.test(n)) return "sistema";
  if (/p[aá]gina|landing|web|sitio/.test(n)) return "capas";
  return null;
}
