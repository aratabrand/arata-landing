import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, TrendingDown, TrendingUp } from "lucide-react";
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

/** Tarjeta del panel: superficie 1 + borde fino + radio 24 px. */
export function Tarjeta({
  titulo,
  bajada,
  accion,
  children,
  className,
}: {
  titulo?: ReactNode;
  bajada?: ReactNode;
  accion?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("v2-card min-w-0 p-4 sm:p-6", className)}>
      {(titulo || accion) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {titulo && <h2 className="font-display text-base font-bold tracking-heading text-white sm:text-lg">{titulo}</h2>}
            {bajada && <p className="mt-0.5 text-xs text-fog-dim">{bajada}</p>}
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
        sube ? "bg-lime/10 text-lime" : "bg-[#FF6B8B]/10 text-[#FF9BB0]",
        className
      )}
    >
      <Icon aria-hidden className="h-3.5 w-3.5" />
      {sube ? "+" : ""}
      {valor.toFixed(1).replace(".", ",")} %
    </span>
  );
}

/** Píldora de estado (clientes, prioridad, fase). */
export function Pill({ children, tono = "neutro", className }: { children: ReactNode; tono?: "lima" | "morado" | "neutro" | "alerta"; className?: string }) {
  const tonos = {
    lima: "border-lime/30 bg-lime/10 text-lime",
    morado: "border-brand/40 bg-brand/15 text-brand-soft",
    neutro: "border-white/10 bg-white/5 text-fog",
    alerta: "border-[#FF6B8B]/30 bg-[#FF6B8B]/10 text-[#FF9BB0]",
  } as const;
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[0.72rem] font-semibold", tonos[tono], className)}>
      {children}
    </span>
  );
}
