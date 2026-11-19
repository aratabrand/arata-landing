import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Botón v2 (D-137, 04-sistema-de-diseno.md §5). Píldora de color plano, sin degradados ni brillos.
// - primary:   lima con texto ink. Con flecha: círculo ink con la flecha lima al final.
// - secondary: blanco con texto ink. Con flecha: círculo morado con la flecha blanca.
// - ink:       negro con texto blanco y círculo lima con flecha ink. Para usar SOBRE BLANCO
//              (tarjeta recomendada, precio, cierre; D-138).
// - ghost:     texto con flecha ("Ver todo →").
// Al pasar el mouse la flecha sale por la derecha y entra otra por la izquierda (solo transform).
// Alto mínimo 44 px (área táctil).

type Variant = "primary" | "secondary" | "ink" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-colors duration-200";

const variants: Record<Variant, string> = {
  primary: "bg-lime text-ink hover:bg-[#C6FF33]",
  secondary: "bg-white text-ink hover:bg-[#EDE7FF]",
  ink: "bg-ink text-white hover:bg-[#1C1830]",
  ghost: "text-white hover:text-lime",
};

// Círculo de la flecha por variante
const circulo: Record<Exclude<Variant, "ghost">, string> = {
  primary: "bg-ink text-lime",
  secondary: "bg-brand text-white",
  ink: "bg-lime text-ink",
};

const sizes: Record<Size, { solo: string; flecha: string; circulo: string }> = {
  md: { solo: "h-11 px-5 text-sm", flecha: "h-11 pl-5 pr-1.5 text-sm", circulo: "h-8 w-8" },
  lg: { solo: "h-12 px-6 text-[0.95rem]", flecha: "h-12 pl-6 pr-1.5 text-[0.95rem]", circulo: "h-9 w-9" },
};

/** Flecha dentro del círculo: una sale y otra entra al pasar el mouse. */
export function FlechaBoton({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("relative grid shrink-0 place-items-center overflow-hidden rounded-full", className)}>
      <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-[180%] motion-reduce:transition-none" />
      <ArrowRight className="absolute h-4 w-4 -translate-x-[180%] transition-transform duration-300 ease-out group-hover:translate-x-0 motion-reduce:hidden" />
    </span>
  );
}

/** Clases del botón, para enlaces o <button> que no usan este componente (formulario, cookies). */
export function clasesBoton({ variant = "primary", size = "md", arrow = false }: { variant?: Variant; size?: Size; arrow?: boolean } = {}) {
  if (variant === "ghost") return cn(base, variants.ghost, "h-11 px-1 text-sm");
  return cn(base, variants[variant], arrow ? sizes[size].flecha : sizes[size].solo);
}

export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  arrow = false,
  external = false,
  className,
  onClick,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  external?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const cls = cn(clasesBoton({ variant, size, arrow }), arrow && variant !== "ghost" && "gap-3", className);
  const content = (
    <>
      {children}
      {arrow &&
        (variant === "ghost" ? (
          <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        ) : (
          <FlechaBoton className={cn(circulo[variant], sizes[size].circulo)} />
        ))}
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cn("group", cls)} onClick={onClick}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={cn("group", cls)} onClick={onClick}>
      {content}
    </Link>
  );
}

export const circuloBoton = circulo;
