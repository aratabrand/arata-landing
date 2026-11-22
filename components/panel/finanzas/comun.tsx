"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, Lock } from "../iconos";
import type { Resultado } from "@/app/(panel)/panel/(app)/finanzas/acciones";
import { EMPRESA, type Persona } from "@/lib/panel/finanzas/tipos";
import { cn } from "@/lib/utils";

// Piezas comunes de Finanzas y Equipo.

/** Ejecuta una acción del servidor con estado de carga y error en español. */
export function useAccion() {
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();
  const correr = (fn: () => Promise<Resultado>, alTerminar?: () => void) =>
    new Promise<boolean>((resolver) => {
      setError("");
      iniciar(async () => {
        const r = await fn().catch(() => ({ ok: false as const, error: "Sin conexión. Intenta otra vez." }));
        if (r.ok) {
          router.refresh();
          alTerminar?.();
        } else setError(r.error);
        resolver(r.ok);
      });
    });
  return { pendiente, error, setError, correr };
}

export function MensajeError({ error }: { error: string }) {
  if (!error) return null;
  return (
    <p role="alert" className="flex items-start gap-2 text-sm text-alerta">
      <CircleAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
      {error}
    </p>
  );
}

/** Aviso de solo lectura o de modo ejemplo. */
export function AvisoAcceso({ demo, puedeEditar, texto }: { demo: boolean; puedeEditar: boolean; texto?: string }) {
  if (demo)
    return (
      <div className="rounded-frame border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-fog">
        Estás viendo <strong className="text-white">finanzas de ejemplo</strong> con números ficticios. Con el panel conectado verás los datos reales de Arata San.
      </div>
    );
  if (puedeEditar) return null;
  return (
    <div className="flex items-center gap-2 rounded-frame border border-white/8 bg-surface-1 px-4 py-3 text-sm text-fog">
      <Lock aria-hidden className="h-4 w-4 text-fog" />
      {texto ?? "Puedes ver todo. Sergio y Andrés cambian los números; el valor del día, solo Sergio."}
    </div>
  );
}

const fmt = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });

/** Campo de pesos: deja escribir solo números y muestra los puntos de miles. */
export function CampoPesos({
  name,
  valorInicial,
  etiqueta,
  requerido,
  onCambio,
}: {
  name: string;
  valorInicial?: number;
  etiqueta: string;
  /** true = obligatorio (*); false o vacío = "Opcional". */
  requerido?: boolean;
  onCambio?: (n: number) => void;
}) {
  const [v, setV] = useState(valorInicial ? fmt.format(valorInicial) : "");
  return (
    <label className="block min-w-0">
      <Etiqueta texto={etiqueta} obligatorio={requerido ?? false} />
      <div className="relative">
        <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-fog-dim">
          $
        </span>
        <input
          name={name}
          value={v}
          inputMode="numeric"
          autoComplete="off"
          onChange={(e) => {
            const n = Number(e.target.value.replace(/\D/g, "").slice(0, 12));
            setV(n ? fmt.format(n) : "");
            onCambio?.(n);
          }}
          className="pn-input pl-7 tabular-nums"
        />
      </div>
    </label>
  );
}

/** Etiqueta de un campo: "*" en lima si es obligatorio, "Opcional" si no (D-119). */
export function Etiqueta({ texto, obligatorio }: { texto: string; obligatorio?: boolean }) {
  const req = obligatorio ?? /\*\s*$/.test(texto);
  const limpio = texto.replace(/\s*\*\s*$/, "");
  return (
    <span className="mb-1.5 flex items-baseline justify-between gap-2 text-xs font-medium text-fog">
      <span>
        {limpio}
        {req && (
          <>
            <span aria-hidden className="ml-0.5 text-fog">*</span>
            <span className="sr-only"> (obligatorio)</span>
          </>
        )}
      </span>
      {obligatorio === false && <span className="text-[0.68rem] font-normal text-fog-dim">Opcional</span>}
    </span>
  );
}

/** Nota al inicio de cada formulario. */
export function LeyendaObligatorios() {
  return (
    <p className="text-[0.72rem] text-fog-dim">
      Los campos con <span className="text-fog">*</span> son obligatorios.
    </p>
  );
}

export function Campo({ etiqueta, children, ayuda, obligatorio }: { etiqueta: string; children: ReactNode; ayuda?: ReactNode; obligatorio?: boolean }) {
  return (
    <label className="block min-w-0">
      <Etiqueta texto={etiqueta} obligatorio={obligatorio} />
      {children}
      {ayuda && <span className="mt-1 block text-[0.7rem] text-fog-dim">{ayuda}</span>}
    </label>
  );
}

export function BotonPrincipal({ children, pendiente, className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { pendiente?: boolean }) {
  return (
    <button
      {...p}
      disabled={pendiente || p.disabled}
      className={cn("h-11 rounded-full pn-primario px-5 text-sm font-semibold disabled:opacity-50", className)}
    >
      {pendiente ? "Guardando…" : children}
    </button>
  );
}

export function BotonSecundario({ children, className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...p}
      className={cn("inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-white/10 bg-surface-2 px-3.5 text-sm font-semibold text-white hover:border-white/20 disabled:opacity-40", className)}
    >
      {children}
    </button>
  );
}

/** Nombre para mostrar de un beneficiario del reparto. */
export function nombreDe(id: string, personas: Persona[]) {
  if (id === EMPRESA) return "Arata San (empresa)";
  return personas.find((p) => p.id === id)?.nombre ?? "Persona retirada";
}

/** Color fijo por persona (para barras y puntos). */
// D-149: sin morado; colores claros que se leen con texto ink y como puntos en los dos temas
export const colorPersona = (i: number) => ["#A1A1AA", "#5B8CFF", "#FFC76B", "#2DD4BF", "#F9A8D4"][i % 5];
export const COLOR_EMPRESA = "rgb(var(--pn-lima))"; // lima en oscuro, morado claro en el modo claro (D-151)


