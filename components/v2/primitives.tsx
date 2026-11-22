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
        "v2-pildora px-3 py-1.5 text-xs font-medium", // D-150: píldora negra con borde gris claro
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

/** Etiqueta de sección (eyebrow). D-150: píldora negra con borde, como en la referencia ("Pricing"). */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("w-fit", className)}>
      <span className="v2-pildora px-3 py-1 text-xs font-medium">{children}</span>
    </p>
  );
}

/** Luz de fondo morada (atmósfera). Decorativa: aria-hidden, sin eventos. */
export function Glow({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div aria-hidden className={cn("v2-glow", className)} style={style} />;
}

/**
 * D-164 (referencia Kept): la ÚLTIMA palabra del título en cursiva con serifa (Instrument Serif).
 * Automático y sin cambiar el texto: "Lo que te cuesta, sin *sorpresas*". Si el título no es texto, va igual.
 * El panel tiene su propia copia (components/panel/ui.tsx): el panel no importa piezas del sitio (D-115).
 */
export function Acento({ texto }: { texto: ReactNode }) {
  if (typeof texto !== "string") return <>{texto}</>;
  const t = texto.trim();
  const i = t.lastIndexOf(" ");
  if (i < 0) return <>{t}</>;
  return (
    <>
      {t.slice(0, i + 1)}
      <em className="font-acento font-normal italic tracking-normal">{t.slice(i + 1)}</em>
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
          <Acento texto={title} />
        </h2>
        {subtitle && <p className="mt-3 max-w-xl text-v2-lead text-fog">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
