import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "./iconos";
import { cn } from "@/lib/utils";

// Botón v2 = el del panel (D-142, igual a .pn-primario de D-136). 04-sistema-de-diseno.md §5.
// - primary:   morado de marca con texto blanco (4,6:1), filo de luz arriba (.v2-primario). Uno por vista.
// - secondary: superficie oscura con borde fino.
// - ghost:     texto con flecha ("Ver todo →").
// Píldora (rounded-full), igual que el panel (D-161, D-162). El lima no va en botones: queda para los datos.
// Alto mínimo 44 px (área táctil).

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-colors duration-200";

const variants: Record<Variant, string> = {
  primary: "v2-primario",
  secondary: "border border-white/10 bg-surface-2 text-white hover:border-white/16 hover:bg-surface-3",
  ghost: "text-white hover:text-fog",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[0.95rem]",
};

/** Flecha del botón: se corre un poco al pasar el mouse (solo transform). */
export function FlechaBoton({ className }: { className?: string }) {
  return <ArrowRight aria-hidden className={cn("h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5", className)} />;
}

/** Clases del botón, para enlaces o <button> que no usan este componente (formulario, cookies). */
export function clasesBoton({ variant = "primary", size = "md" }: { variant?: Variant; size?: Size; arrow?: boolean } = {}) {
  return cn(base, variants[variant], variant === "ghost" ? "h-11 px-1 text-sm" : sizes[size]);
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
  const cls = cn(clasesBoton({ variant, size }), className);
  const content = (
    <>
      {children}
      {arrow && <FlechaBoton />}
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
