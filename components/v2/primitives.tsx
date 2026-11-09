import type { CSSProperties, ReactNode } from "react";
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

/** Etiqueta pequeña en mayúsculas (eyebrow). */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-brand-soft", className)}>
      {children}
    </p>
  );
}

/** Luz de fondo morada (atmósfera). Decorativa: aria-hidden, sin eventos. */
export function Glow({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div aria-hidden className={cn("v2-glow", className)} style={style} />;
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
          {title}
        </h2>
        {subtitle && <p className="mt-3 max-w-xl text-v2-lead text-fog">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
