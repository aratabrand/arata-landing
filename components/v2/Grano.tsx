"use client";

import { useEffect, useRef } from "react";

// Grano muy fino sobre toda la página (D-145, D-147).
// Antes era un SVG con filtro de ruido como imagen de fondo: el navegador lo rasterizaba antes del
// primer pintado y el título de la portada (LCP) salía ~0,5 s más tarde en celular. Ahora se dibuja
// en un <canvas> cuando el navegador está libre, después de abrir la página: no compite con el
// título, no cuenta para el LCP y no se vuelve a pintar al bajar.
export default function Grano() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let cancelado = false;

    // Un cuadro de 128 px de ruido gris, repetido como patrón
    const tile = document.createElement("canvas");
    tile.width = tile.height = 128;
    const tctx = tile.getContext("2d");
    if (!tctx) return;
    const img = tctx.createImageData(128, 128);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    tctx.putImageData(img, 0, 0);

    const pintar = () => {
      if (cancelado) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.ceil(window.innerWidth * dpr);
      canvas.height = Math.ceil(window.innerHeight * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const patron = ctx.createPattern(tile, "repeat");
      if (!patron) return;
      ctx.fillStyle = patron;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    // Se pinta cuando el navegador está libre (Safari no tiene requestIdleCallback: 1,5 s)
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    let idle = 0;
    let t = 0;
    if (w.requestIdleCallback) idle = w.requestIdleCallback.call(window, pintar, { timeout: 3000 });
    else t = window.setTimeout(pintar, 1500);

    // Al cambiar el tamaño de la ventana se vuelve a pintar (con una pausa corta)
    let r = 0;
    const alCambiar = () => {
      window.clearTimeout(r);
      r = window.setTimeout(pintar, 200);
    };
    window.addEventListener("resize", alCambiar, { passive: true });

    return () => {
      cancelado = true;
      if (idle && "cancelIdleCallback" in window) window.cancelIdleCallback(idle);
      window.clearTimeout(t);
      window.clearTimeout(r);
      window.removeEventListener("resize", alCambiar);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="v2-grano" />;
}
