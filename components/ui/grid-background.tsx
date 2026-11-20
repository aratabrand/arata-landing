import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

// Fondo de líneas verticales (ref. 21st.dev "grid-background"), adaptado a Arata San (D-071, D-145):
// - D-145: SOLO líneas verticales (Sergio no quiere cuadrícula). La variante "rejilla" ya no pinta
//   cuadros: se dibuja igual que "lineas" (se acepta para no tocar cada sección).
// - Líneas blancas muy tenues cada 80 px, centradas en la sección, una franja y una luz BLANCAS muy
//   suaves (D-146; antes moradas). Los bordes se desvanecen con una máscara.
// - `haces`: luces finas que bajan por algunas líneas (detalle premium). Solo transform; con
//   movimiento reducido no se muestran. Cada número es cuántas líneas a la izquierda (−) o a la
//   derecha (+) del centro va el haz.
// - Sin `useState` ni "use client": es CSS puro y se pinta desde el servidor (0 JS).
// Uso: la sección lleva `relative isolate` y el fondo va como primer hijo.

type Variant = "rejilla" | "lineas";

export type GridBackgroundProps = {
  variant?: Variant;
  /** Tamaño de la celda en px. @default 40 */
  cell?: number;
  /** Opacidad de las líneas (0–1). @default 0.05 */
  line?: number;
  /** Centro de la luz blanca suave, en CSS (`x y`). @default "50% 55%" */
  orb?: string;
  /** Intensidad de la luz (0–1). @default 0.08 */
  glow?: number;
  /** Haces de luz que bajan por las líneas (posición relativa al centro, en líneas). */
  haces?: number[];
  /** Máscara propia (por defecto, elipse centrada). */
  mascara?: string;
  className?: string;
};

export function GridBackground({
  cell = 40,
  line = 0.05,
  orb = "50% 55%",
  glow = 0.08,
  haces = [],
  mascara,
  className,
}: GridBackgroundProps) {
  const l = `rgba(255,255,255,${line})`;
  const paso = cell * 2; // una línea cada 80 px
  // D-146: luz y franja BLANCAS muy suaves (antes moradas)
  const luz = `radial-gradient(circle at ${orb}, rgba(255,255,255,${+(glow * 0.5).toFixed(3)}) 0%, rgba(255,255,255,${+(glow / 6).toFixed(3)}) 40%, transparent 70%)`;

  // Una línea de 1 px en el centro de cada franja de 80 px; las franjas se centran en la sección,
  // así siempre hay una línea justo en el medio y los haces caen exactamente sobre una línea.
  const style: CSSProperties = {
    backgroundImage: [
      `linear-gradient(90deg, transparent 30%, rgba(255,255,255,${+(glow * 0.25).toFixed(3)}) 50%, transparent 70%)`,
      `linear-gradient(90deg, transparent calc(50% - 0.5px), ${l} calc(50% - 0.5px), ${l} calc(50% + 0.5px), transparent calc(50% + 0.5px))`,
      luz,
    ].join(","),
    backgroundSize: `100% 100%, ${paso}px 100%, 100% 100%`,
    backgroundRepeat: "no-repeat, repeat-x, no-repeat",
    backgroundPosition: "0 0, center top, 0 0",
  };

  // Radios = 50 % del alto y ~55 % del ancho: llega a transparente justo en los bordes (sin cortes).
  const mask = mascara ?? "radial-gradient(ellipse 56% 50% at 50% 50%, #000 35%, transparent 100%)";

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
      style={{ ...style, maskImage: mask, WebkitMaskImage: mask }}
    >
      {haces.map((n, i) => (
        <span
          key={n}
          className="v2-haz"
          style={{ left: `calc(50% + ${n * paso}px - 0.5px)`, ["--d" as string]: `${i * 2.3}s` } as CSSProperties}
        />
      ))}
    </div>
  );
}

export default GridBackground;
