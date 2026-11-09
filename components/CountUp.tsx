"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { onInView } from "@/lib/inview";

// Cuenta de 0 al valor objetivo cuando entra en vista. Respeta reduced-motion.
// El HTML del servidor trae el VALOR REAL (lo que leen Google, la IA y quien no tiene JS);
// el conteo desde 0 solo ocurre en el navegador.
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
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }

    started.current = false;
    setDisplay(0);

    const animate = () => {
      if (started.current) return;
      started.current = true;
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

    return onInView(el, animate, 0.4);
  }, [value, duration]);

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}
      {Math.round(display)}
      {suffix}
    </span>
  );
}
