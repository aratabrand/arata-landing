import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Botón v2 (ref. 21st.dev, adaptado a Arata — 04-sistema-de-diseno.md §5)
// - primary:   lima con texto ink + brillo que recorre al pasar el mouse. Es el ÚNICO lima de la vista.
// - secondary: superficie oscura con borde fino.
// - ghost:     texto con flecha ("Ver todo →").
// Alto mínimo 44 px (área táctil).

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-btn font-semibold whitespace-nowrap transition-colors duration-200";

const variants: Record<Variant, string> = {
  primary: "v2-shine bg-lime text-ink hover:bg-[#C6FF33]",
  secondary:
    "border border-white/10 bg-surface-2 text-white hover:border-white/16 hover:bg-surface-3",
  ghost: "text-white hover:text-lime",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[0.95rem]",
};

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
  const cls = cn(base, variants[variant], variant === "ghost" ? "h-11 px-1 text-sm" : sizes[size], className);
  const content = (
    <>
      {children}
      {arrow && <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />}
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
