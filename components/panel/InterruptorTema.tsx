"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "./iconos";
import { aplicarTema, type Tema } from "@/lib/panel/tema";
import { cn } from "@/lib/utils";

// Interruptor de modo claro / oscuro (D-149, D-152): al lado de la campana, en la barra de arriba.
// Píldora del mismo alto que la campana con el sol y la luna; una perilla se desliza detrás del
// modo activo (solo transform). Oscuro por defecto; se guarda en la cookie pn-tema (lib/panel/tema.ts).
export default function InterruptorTema() {
  const [tema, setTema] = useState<Tema>("oscuro");

  // El tema real lo pone el servidor en .pn-root (cookie pn-tema)
  useEffect(() => {
    setTema(document.querySelector<HTMLElement>(".pn-root")?.dataset.tema === "claro" ? "claro" : "oscuro");
  }, []);

  const claro = tema === "claro";
  const cambiar = () => {
    const nuevo: Tema = claro ? "oscuro" : "claro";
    aplicarTema(nuevo);
    setTema(nuevo);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={claro}
      aria-label="Modo claro"
      title={claro ? "Pasar a modo oscuro" : "Pasar a modo claro"}
      onClick={cambiar}
      className="pn-negro relative flex h-10 w-[4.5rem] shrink-0 items-center rounded-full border border-white/[0.09] bg-white/[0.035] p-1 text-fog transition-colors hover:border-white/20 lg:h-11 lg:w-20"
    >
      {/* perilla que se desliza detrás del modo activo */}
      <span
        aria-hidden
        className={cn(
          "pn-perilla absolute left-1 top-1 h-8 w-8 rounded-full border border-white/15 bg-white/10 transition-transform duration-200 motion-reduce:transition-none lg:h-9 lg:w-9",
          claro ? "translate-x-[2rem] lg:translate-x-[2.25rem]" : "translate-x-0"
        )}
      />
      <span className="relative grid h-8 w-8 place-items-center lg:h-9 lg:w-9">
        <Moon aria-hidden className={cn("h-4 w-4 transition-colors", !claro ? "text-white" : "text-fog-dim")} />
      </span>
      <span className="relative grid h-8 w-8 place-items-center lg:h-9 lg:w-9">
        <Sun aria-hidden className={cn("h-4 w-4 transition-colors", claro ? "text-white" : "text-fog-dim")} />
      </span>
    </button>
  );
}
