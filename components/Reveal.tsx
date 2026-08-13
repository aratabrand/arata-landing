"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { onInView } from "@/lib/inview";

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
    return onInView(el, () => setVisible(true), 0.12);
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
