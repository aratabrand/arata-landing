"use client";

import { useEffect, useRef, useState } from "react";
import CountUp from "./CountUp";

// Anillo dashboard-premium: arco redondeado + dot brillante en la punta,
// número XL centrado (con contador). El arco se dibuja al entrar en vista. SVG puro.

export default function Ring({
  value,
  size = 132,
  stroke = 12,
  label,
  center,
  centerValue,
  centerPrefix = "",
  centerSuffix = "",
  trackColor = "rgba(255,255,255,0.14)",
  arcColor = "#B6FF00",
  centerColor = "#FFFFFF",
  labelColor = "rgba(255,255,255,0.7)",
}: {
  value: number; // 0–100
  size?: number;
  stroke?: number;
  label?: string;
  center?: string;
  centerValue?: number;
  centerPrefix?: string;
  centerSuffix?: string;
  trackColor?: string;
  arcColor?: string;
  centerColor?: string;
  labelColor?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const dash = (clamped / 100) * c;
  const cx = size / 2;
  const cy = size / 2;

  const angle = (clamped / 100) * 2 * Math.PI - Math.PI / 2;
  const dotX = cx + r * Math.cos(angle);
  const dotY = cy + r * Math.sin(angle);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDrawn(true);
      return;
    }
    let done = false;
    const check = () => {
      if (done || !wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
        done = true;
        setDrawn(true);
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
  }, []);

  return (
    <div ref={wrapRef} className="inline-flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
          <circle
            className="ring-arc"
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={arcColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={drawn ? c - dash : c}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
          {clamped > 0 && clamped < 100 && (
            <circle
              cx={dotX}
              cy={dotY}
              r={stroke / 2 + 1.5}
              fill={arcColor}
              style={{ opacity: drawn ? 1 : 0, transition: "opacity 0.3s ease 0.9s" }}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center px-1">
          {centerValue !== undefined ? (
            <CountUp
              value={centerValue}
              prefix={centerPrefix}
              suffix={centerSuffix}
              className="font-display font-extrabold leading-none"
              style={{ color: centerColor, fontSize: Math.round(size * 0.24) }}
            />
          ) : (
            <span
              className="font-display font-extrabold leading-none"
              style={{ color: centerColor, fontSize: Math.round(size * 0.24) }}
            >
              {center}
            </span>
          )}
        </div>
      </div>
      {label && (
        <span className="mt-2 text-xs font-medium" style={{ color: labelColor }}>
          {label}
        </span>
      )}
    </div>
  );
}
