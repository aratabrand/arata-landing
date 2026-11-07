"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

// Publica el avance del scroll sobre el elemento como variable CSS `--p` (0 → 1).
// Una sola escucha de scroll (pasiva + requestAnimationFrame) y SOLO mientras el
// elemento está en pantalla (IntersectionObserver). Los hijos se pintan con
// transform/opacity calculados desde `--p`, así que React no re-renderiza.
// Con reduced-motion queda en 1 (todo pintado).
export default function ScrollPaint({
  children,
  className,
  style,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "ol" | "ul";
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--p", "1");
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Empieza cuando el bloque entra al 80 % de la pantalla y termina un poco después de pasarlo.
      const p = Math.min(1, Math.max(0, (vh * 0.8 - r.top) / (r.height + vh * 0.25)));
      el.style.setProperty("--p", p.toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    let listening = false;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !listening) {
        listening = true;
        window.addEventListener("scroll", onScroll, { passive: true });
        update();
      } else if (!entry.isIntersecting && listening) {
        listening = false;
        window.removeEventListener("scroll", onScroll);
        update();
      }
    });
    io.observe(el);
    update();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <Tag ref={ref as never} className={className} style={{ ["--p" as string]: 0, ...style }}>
      {children}
    </Tag>
  );
}
