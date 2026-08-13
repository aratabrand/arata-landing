"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type Variant = "up" | "left" | "right" | "scale" | "blur";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  variant?: Variant;
};

export default function Reveal({
  children,
  as,
  className = "",
  delay = 0,
  variant = "up",
}: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    let done = false;
    const check = () => {
      if (done || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      // Revela cuando el elemento entra por abajo (o ya está en/por encima
      // de la vista, ej. al recargar a mitad de página).
      if (rect.top < window.innerHeight * 0.88 && rect.bottom > 0) {
        done = true;
        setVisible(true);
        window.removeEventListener("scroll", check);
        window.removeEventListener("resize", check);
      }
    };

    check(); // inmediato: cubre lo que ya está en pantalla al cargar
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal v-${variant} ${visible ? "is-visible" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
