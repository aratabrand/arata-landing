import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Piezas pequeñas del sistema v2 (04-sistema-de-diseno.md §5).

/** Contenedor: máx. 1200 px, márgenes laterales mobile-first (16 px en 360 px). */
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-v2 px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

/** Badge en píldora. `live` agrega el punto lima que titila (estado "en vivo"). */
export function Badge({
  children,
  live = false,
  className,
}: {
  children: ReactNode;
  live?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface-1/80 px-3 py-1.5 text-xs font-medium text-fog",
        className
      )}
    >
      {live && (
        <span className="relative flex h-2 w-2" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-lime" />
        </span>
      )}
      {children}
    </span>
  );
}

/** Etiqueta pequeña (eyebrow): punto lima + texto en mayúsculas (D-138). */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-fog", className)}>
      <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
      {children}
    </p>
  );
}

/**
 * Título en dos tonos (D-138): la primera frase en blanco y lo que sigue a la primera
 * coma o punto en gris (`tono`). No cambia el texto: solo el color. Si no hay coma ni
 * punto en medio, todo queda en blanco.
 */
export function DosTonos({ texto, tono = "text-fog-dim" }: { texto: ReactNode; tono?: string }) {
  if (typeof texto !== "string") return <>{texto}</>;
  const m = texto.match(/^(.+?[,.:?])\s+(.+)$/);
  if (!m) return <>{texto}</>;
  return (
    <>
      {m[1]} <span className={tono}>{m[2]}</span>
    </>
  );
}

/** Encabezado de sección: título grande a la izquierda + subtítulo + acción a la derecha (ref. captura 01). */
export function SectionHeader({
  title,
  subtitle,
  action,
  id,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="max-w-2xl">
        <h2 id={id} className="font-display text-v2-h2 font-bold tracking-heading text-white">
          <DosTonos texto={title} />
        </h2>
        {subtitle && <p className="mt-3 max-w-xl text-v2-lead text-fog">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
