"use client";

import { useRef, type ReactNode, type PointerEvent } from "react";
import { cn } from "@/lib/utils";

// Tarjeta con luz que sigue el cursor (04-sistema-de-diseno.md §7).
// Solo actualiza dos variables CSS; el brillo es un ::before que anima opacidad.
// En pantallas táctiles no hay hover, así que no hace nada.
export default function Spotlight({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
}) {
  const ref = useRef<HTMLElement | null>(null);

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <Tag
      ref={ref as never}
      onPointerMove={onMove}
      className={cn("v2-card v2-spotlight", className)}
    >
      {children}
    </Tag>
  );
}
