import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, TrendingDown, TrendingUp } from "./iconos";
import { cn } from "@/lib/utils";

// Piezas base del panel (docs/panel-cliente/03-sistema-de-diseno.md §4).
// Sin "use client": se pueden usar en páginas del servidor y en componentes cliente.

/** Contenedor de cada módulo: márgenes mobile-first, máx. 1280 px. */
export function PanelPage({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[1280px] space-y-6 px-4 pt-6 sm:px-6 lg:px-10 lg:pt-10">{children}</div>;
}

/** Encabezado de módulo: el único <h1> de la vista. */
export function PanelHeader({ titulo, bajada, accion, volver }: { titulo: ReactNode; bajada?: ReactNode; accion?: ReactNode; volver?: { href: string; texto: string } }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {volver && (
          <Link href={volver.href} className="mb-2 inline-flex h-9 items-center gap-1.5 text-sm text-fog hover:text-white">
            <ArrowLeft aria-hidden className="h-4 w-4" /> {volver.texto}
          </Link>
        )}
        <h1 className="font-display text-[clamp(1.6rem,3.2vw,2.4rem)] font-bold leading-[1.05] tracking-heading text-white">{titulo}</h1>
        {bajada && <p className="mt-2 max-w-xl text-sm text-fog sm:text-[0.95rem]">{bajada}</p>}
      </div>
      {accion && <div className="shrink-0">{accion}</div>}
    </div>
  );
}

/** Tarjeta del panel: superficie en capas + borde fino + radio 20 px (D-136). */
export function Tarjeta({
  titulo,
  bajada,
  accion,
  icono,
  children,
  className,
}: {
  titulo?: ReactNode;
  bajada?: ReactNode;
  accion?: ReactNode;
  /** Cuadrito con ícono antes del título (D-136). */
  /** Sin uso desde D-149 (sin íconos decorativos); se acepta para no tocar cada tarjeta. */
  icono?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("v2-card min-w-0 p-4 sm:p-6", className)}>
      {(titulo || accion) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="min-w-0">
              {titulo && <h2 className="font-display text-base font-bold tracking-heading text-white sm:text-lg">{titulo}</h2>}
              {bajada && <p className="mt-0.5 text-xs text-fog-dim">{bajada}</p>}
            </div>
          </div>
          {accion}
        </div>
      )}
      {children}
    </section>
  );
}

/** Variación frente al periodo anterior. Lima si sube (sobre oscuro), rosa suave si baja. */
export function Delta({ valor, className }: { valor: number | null; className?: string }) {
  if (valor === null) return <span className={cn("text-xs text-fog-dim", className)}>sin dato anterior</span>;
  const sube = valor >= 0;
  const Icon = sube ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        sube ? "bg-lime/10 text-dato" : "bg-alerta-fuerte/10 text-alerta",
        className
      )}
    >
      <Icon aria-hidden className="h-3.5 w-3.5" />
      {sube ? "+" : ""}
      {valor.toFixed(1).replace(".", ",")} %
    </span>
  );
}

export type TonoPill = "verde" | "verdeFuerte" | "ambar" | "alerta" | "neutro" | "lima" | "morado";

/** Píldora de estado (clientes, prioridad, fase). Semáforo (D-155): verde bien, ámbar atención,
 *  alerta (rojo) mal; verdeFuerte = lo mejor (cliente que repite); neutro = píldora del sistema. El lima de Arata NO va en estados: solo en la
 *  píldora o pestaña activa (`.pn-pildora-activa`). `lima` y `morado` se conservan como nombres viejos. */
export function Pill({ children, tono = "neutro", className }: { children: ReactNode; tono?: TonoPill; className?: string }) {
  const verde = "border-verde/35 bg-verde/10 text-verde";
  const tonos = {
    verde,
    verdeFuerte: "border-verde/60 bg-verde/20 text-verde",
    lima: verde, // D-155: antes lima; ahora verde de semáforo
    ambar: "border-ambar/35 bg-ambar/10 text-ambar",
    alerta: "border-alerta-fuerte/35 bg-alerta-fuerte/10 text-alerta",
    morado: "pn-pildora", // D-149: sin morado (el nombre se conserva)
    neutro: "pn-pildora", // D-153: píldora del sistema
  } as const;
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[0.72rem] font-semibold", tonos[tono], className)}>
      {children}
    </span>
  );
}
