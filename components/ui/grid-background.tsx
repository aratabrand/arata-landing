import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

// Fondo de rejilla (ref. 21st.dev "grid-background"), adaptado a Arata San (D-071):
// - La referencia es para fondo blanco; aquí va sobre ink #03010B con líneas blancas
//   muy tenues y una luz MORADA de marca (no magenta), sin saturar.
// - Sin `useState` ni "use client": es CSS puro y se pinta desde el servidor (0 JS).
// - Los bordes se desvanecen con una máscara radial: no se nota dónde empieza ni
//   termina la sección.
// - Variante "lineas" = la del demo (solo líneas verticales + un haz de luz).
// Uso: la sección lleva `relative isolate` y el fondo va como primer hijo.

type Variant = "rejilla" | "lineas";

export type GridBackgroundProps = {
  variant?: Variant;
  /** Tamaño de la celda en px. @default 40 */
  cell?: number;
  /** Opacidad de las líneas (0–1). @default 0.05 */
  line?: number;
  /** Centro de la luz morada, en CSS (`x y`). @default "50% 55%" */
  orb?: string;
  /** Intensidad de la luz morada (0–1). @default 0.12 */
  glow?: number;
  className?: string;
};

export function GridBackground({
  variant = "rejilla",
  cell = 40,
  line = 0.05,
  orb = "50% 55%",
  glow = 0.12,
  className,
}: GridBackgroundProps) {
  const l = `rgba(255,255,255,${line})`;
  const luz = `radial-gradient(circle at ${orb}, rgba(125,83,255,${glow}) 0%, rgba(59,29,153,${+(glow / 3).toFixed(3)}) 40%, transparent 70%)`;

  const style: CSSProperties =
    variant === "lineas"
      ? {
          backgroundImage: [
            `linear-gradient(90deg, transparent 30%, rgba(125,83,255,${+(glow * 0.6).toFixed(3)}) 50%, transparent 70%)`,
            `repeating-linear-gradient(90deg, transparent 0, transparent ${cell * 2 - 1}px, ${l} ${cell * 2 - 1}px, ${l} ${cell * 2}px)`,
            luz,
          ].join(","),
          backgroundSize: "100% 100%",
        }
      : {
          backgroundImage: [
            `linear-gradient(to right, ${l} 1px, transparent 1px)`,
            `linear-gradient(to bottom, ${l} 1px, transparent 1px)`,
            luz,
          ].join(","),
          backgroundSize: `${cell}px ${cell}px, ${cell}px ${cell}px, 100% 100%`,
          backgroundPosition: "center top, center top, 0 0",
        };

  // Radios = 50 % del alto y ~55 % del ancho: llega a transparente justo en los bordes (sin cortes).
  const mask = "radial-gradient(ellipse 56% 50% at 50% 50%, #000 35%, transparent 100%)";

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10", className)}
      style={{ ...style, maskImage: mask, WebkitMaskImage: mask }}
    />
  );
}

export default GridBackground;
