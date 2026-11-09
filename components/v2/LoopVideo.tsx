"use client";

import { useEffect, useRef, useState } from "react";
import type { VideoProyecto } from "@/content/proyectos";

// Video en loop "tipo GIF" (D-026, 04-sistema-de-diseno.md §6):
// muted + loop + playsInline + preload="none" + póster WebP.
// Arranca al entrar en pantalla y se pausa al salir. Con reduced-motion solo se ve el póster.
export default function LoopVideo({
  video,
  label,
  className,
}: {
  video: VideoProyecto;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
      return;
    }
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (reduced) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={video.poster} alt={label} className={className} loading="lazy" decoding="async" />;
  }

  return (
    <video
      ref={ref}
      className={className}
      muted
      loop
      playsInline
      preload="none"
      poster={video.poster}
      aria-label={label}
    >
      {video.webm && <source src={video.webm} type="video/webm" />}
      <source src={video.mp4} type="video/mp4" />
    </video>
  );
}
