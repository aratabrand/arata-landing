"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

// Cuenta de 0 al valor objetivo cuando entra en vista. Respeta reduced-motion.
// Usa detección por scroll (más confiable que IntersectionObserver en móvil).
export default function CountUp({
  value,
  prefix = "",
  suffix = "",
  duration = 1400,
  className = "",
  style,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const started = useRef(false);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }

    const animate = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(value * eased);
        if (t < 1) requestAnimationFrame(tick);
        else setDisplay(value);
      };
      requestAnimationFrame(tick);
    };

    const check = () => {
      if (started.current || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
        started.current = true;
        animate();
        window.removeEventListener("scroll", check);
        window.removeEventListener("resize", check);
      }
    };

    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}
      {Math.round(display)}
      {suffix}
    </span>
  );
}
