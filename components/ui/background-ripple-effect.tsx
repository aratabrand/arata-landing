"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Adaptación de marca del "background ripple / cells":
// rejilla que se revela siguiendo el cursor (máscara radial) sobre una rejilla
// tenue de base, con una onda al hacer clic. Colores Arata (morado/lima).
// Optimizado con máscara CSS en lugar de miles de nodos animados.

const CELL = 42; // px

type Ripple = { id: number; x: number; y: number };

export function BackgroundCells({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -9999, y: -9999 });
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [reduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  const handleMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleClick = (e: React.MouseEvent) => {
    if (reduced) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const id = Date.now();
    setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 900);
  };

  const grid = (color: string) =>
    `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`;

  const reveal = 260;

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => setPos({ x: -9999, y: -9999 })}
      onClick={handleClick}
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={{
        maskImage: "linear-gradient(to bottom, black 55%, transparent)",
        WebkitMaskImage: "linear-gradient(to bottom, black 55%, transparent)",
      }}
      aria-hidden="true"
    >
      {/* Rejilla base tenue */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: grid("rgba(255,255,255,0.05)"),
          backgroundSize: `${CELL}px ${CELL}px`,
        }}
      />
      {/* Rejilla morada revelada bajo el cursor */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          backgroundImage: grid("rgba(125,83,255,0.55)"),
          backgroundSize: `${CELL}px ${CELL}px`,
          opacity: pos.x < 0 ? 0 : 1,
          WebkitMaskImage: `radial-gradient(${reveal}px circle at ${pos.x}px ${pos.y}px, black 0%, transparent 70%)`,
          maskImage: `radial-gradient(${reveal}px circle at ${pos.x}px ${pos.y}px, black 0%, transparent 70%)`,
        }}
      />
      {/* Halo lima suave que sigue el cursor */}
      <div
        className="pointer-events-none absolute h-64 w-64 rounded-full transition-opacity duration-300"
        style={{
          left: pos.x - 128,
          top: pos.y - 128,
          background:
            "radial-gradient(circle, rgba(182,255,0,0.10), transparent 65%)",
          opacity: pos.x < 0 ? 0 : 1,
        }}
      />
      {/* Ondas al hacer clic */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="ripple-ring pointer-events-none absolute rounded-full border border-lime/60"
          style={{ left: r.x, top: r.y }}
        />
      ))}
    </div>
  );
}
