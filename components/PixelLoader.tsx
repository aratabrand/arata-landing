"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import { EVENTO_CAMBIO, PIXEL_ACTIVO, leerConsentimiento, type Consentimiento } from "@/lib/consentimiento";

// Pixel de Meta (D-203), con las mismas reglas que Clarity (D-132):
// - NO se pide nada a Meta hasta que la persona acepta "Publicidad" en el aviso de cookies.
//   Sin respuesta o rechazando, ni siquiera se descarga el script.
// - Quien ya había aceptado: se abre en un momento tranquilo; quien acepta ahora: enseguida.
// - autoConfig apagado: Meta no lee solo los botones ni los formularios. No se manda nombre, correo ni
//   WhatsApp ("coincidencia avanzada" apagada). Solo PageView y Lead (lib/medir.ts → reunion_confirmada).
// - En cada cambio de página dentro del sitio (sin recargar) manda otro PageView.
// - Los eventos que salen antes de que el pixel abra (Lead en /agendar/gracias) esperan en
//   window.__pixelPendiente y se mandan al abrir.
// - Retirar el permiso (lib/consentimiento.ts) borra _fbp y _fbc y recarga. El panel no lo carga (app/layout.tsx).

type Fbq = ((...a: unknown[]) => void) & { callMethod?: (...a: unknown[]) => void; queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown };
type Ventana = Window & { fbq?: Fbq; _fbq?: Fbq; __pixelCargado?: boolean; __pixelPendiente?: string[] };

export default function PixelLoader() {
  const ruta = usePathname();
  const primera = useRef(true);

  useEffect(() => {
    if (!PIXEL_ACTIVO) return;
    const w = window as Ventana;

    function cargar() {
      if (w.__pixelCargado) return;
      w.__pixelCargado = true;
      // Misma instalación que da Meta, sin la etiqueta en el HTML: se crea cuando hay permiso.
      if (!w.fbq) {
        const f = function (...args: unknown[]) {
          if (f.callMethod) f.callMethod(...args);
          else f.queue!.push(args);
        } as Fbq;
        f.push = f;
        f.loaded = true;
        f.version = "2.0";
        f.queue = [];
        w.fbq = f;
        w._fbq = f;
        const s = document.createElement("script");
        s.async = true;
        s.src = "https://connect.facebook.net/en_US/fbevents.js";
        document.head.appendChild(s);
      }
      w.fbq!("set", "autoConfig", false, site.pixelId);
      w.fbq!("consent", "grant");
      w.fbq!("init", site.pixelId);
      w.fbq!("track", "PageView");
      for (const evento of w.__pixelPendiente ?? []) w.fbq!("track", evento);
      w.__pixelPendiente = [];
    }

    const alCambiar = (e: Event) => {
      if ((e as CustomEvent<Consentimiento>).detail?.publicidad) cargar();
    };
    window.addEventListener(EVENTO_CAMBIO, alCambiar);

    let idle = 0;
    let temporizador = 0;
    if (leerConsentimiento()?.publicidad) {
      // Con un evento esperando (una cita agendada), se abre ya; si no, en un momento tranquilo
      if ((w.__pixelPendiente ?? []).length) cargar();
      else {
        const programar = () => {
          const cuandoPueda = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
          if (cuandoPueda) idle = cuandoPueda.call(window, cargar, { timeout: 4000 });
          else temporizador = window.setTimeout(cargar, 2500);
        };
        if (document.readyState === "complete") programar();
        else window.addEventListener("load", programar, { once: true });
      }
    }

    // Un evento que llega después (p. ej. Lead) con el permiso dado pero el pixel sin abrir: abrirlo ya
    const alMedir = () => {
      if (!w.__pixelCargado && leerConsentimiento()?.publicidad && (w.__pixelPendiente ?? []).length) cargar();
    };
    window.addEventListener("as:pixel", alMedir);

    return () => {
      window.removeEventListener(EVENTO_CAMBIO, alCambiar);
      window.removeEventListener("as:pixel", alMedir);
      if (idle && "cancelIdleCallback" in window) window.cancelIdleCallback(idle);
      window.clearTimeout(temporizador);
    };
  }, []);

  // Cambio de página dentro del sitio (sin recargar): otro PageView
  useEffect(() => {
    if (!PIXEL_ACTIVO) return;
    if (primera.current) {
      primera.current = false;
      return;
    }
    const w = window as Ventana;
    if (w.__pixelCargado) w.fbq?.("track", "PageView");
  }, [ruta]);

  return null;
}
