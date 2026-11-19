"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Cápsula lima "Ver proyecto" que sigue al mouse sobre la vista previa de un proyecto (D-085).
// - Solo con mouse (en pantallas táctiles no hay hover y no aparece).
// - Reemplaza el puntero (cursor: none) dentro de la zona; la cápsula es el puntero.
// - Seguir al mouse = escribir 2 variables CSS en un requestAnimationFrame (sin re-render).
// - Solo transform/opacity. Decorativa (aria-hidden): el enlace ya tiene su texto.
export default function HoverCapsule({
  children,
  label = "Ver proyecto",
  className,
}: {
  children: ReactNode;
  label?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--cx", `${x}px`);
      el.style.setProperty("--cy", `${y}px`);
      el.dataset.on = "";
    });
  };
  const onLeave = () => {
    cancelAnimationFrame(frame.current);
    delete ref.current?.dataset.on;
  };

  return (
    <div ref={ref} className={cn("v2-capsule-zone relative", className)} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
      <span aria-hidden className="v2-capsule">
        <span className="v2-capsule-in inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-lime px-4 py-2 text-sm font-semibold text-ink shadow-[0_8px_30px_rgba(182,255,0,0.35)]">
          {label}
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </span>
    </div>
  );
}
