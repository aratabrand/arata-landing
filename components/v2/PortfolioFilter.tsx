"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Filtro del portafolio (Todos · Páginas · Catálogos · Sistemas).
// Las tarjetas se renderizan en el servidor y llegan como `cards`; aquí solo se
// decide cuáles se muestran (sin volver a pedir nada). Sin JS, se ven todas.
export default function PortfolioFilter({
  filtros,
  cards,
}: {
  filtros: { label: string; tipo: string | null }[];
  cards: { tipos: string[]; node: ReactNode; key: string }[];
}) {
  const [activo, setActivo] = useState<string | null>(null);
  const visibles = cards.filter((c) => !activo || c.tipos.includes(activo));

  return (
    <>
      <div role="group" aria-label="Filtrar por tipo" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {filtros.map((f) => {
          const on = activo === f.tipo;
          const n = f.tipo ? cards.filter((c) => c.tipos.includes(f.tipo!)).length : cards.length;
          return (
            <button
              key={f.label}
              type="button"
              aria-pressed={on}
              onClick={() => setActivo(f.tipo)}
              className={cn(
                "inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
                on ? "border-white bg-white text-ink" : "border-white/10 bg-surface-1 text-fog hover:text-white"
              )}
            >
              {f.label}
              <span className={cn("text-xs", on ? "text-ink/60" : "text-fog-dim")}>{n}</span>
            </button>
          );
        })}
      </div>
      <p className="sr-only" aria-live="polite">
        {visibles.length} proyectos
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {visibles.map((c) => (
          <li key={c.key} className="v2-pop is-open h-full">
            {c.node}
          </li>
        ))}
      </ul>
    </>
  );
}
