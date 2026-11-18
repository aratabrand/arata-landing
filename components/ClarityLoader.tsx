"use client";

import { useEffect } from "react";
import { site } from "@/lib/site";
import { CLARITY_ACTIVO, EVENTO_CAMBIO, leerConsentimiento, type Consentimiento } from "@/lib/consentimiento";

// Microsoft Clarity (mapas de clics y grabaciones, D-132).
//
// Reglas (Ley 1581 de 2012):
// - NO se pide nada a clarity.ms hasta que la persona acepta "Cómo navegas" en el aviso de cookies.
//   Sin respuesta o rechazando, ni siquiera se descarga el script.
// - Quien ya había aceptado antes: se abre en un momento tranquilo (después de abrir la página),
//   para no competir con lo que pinta el título.
// - Quien acepta ahora: se abre enseguida.
// - Retirar el permiso (lib/consentimiento.ts) borra las cookies y recarga la página.
// Los formularios llevan data-clarity-mask="True" (components/v2/BookingFlow.tsx): lo que se escribe
// no se graba. El panel interno no lo carga nunca (app/layout.tsx: PANEL_SOLO).

type Ventana = Window & { clarity?: (...a: unknown[]) => void; __clarityCargado?: boolean };

export default function ClarityLoader() {
  useEffect(() => {
    if (!CLARITY_ACTIVO) return;
    const w = window as Ventana;
    const id = site.clarityId;

    function cargar() {
      if (w.__clarityCargado) return;
      w.__clarityCargado = true;
      // Misma instalación que da Microsoft, sin la etiqueta en el HTML: se crea cuando hay permiso.
      w.clarity =
        w.clarity ||
        function (...args: unknown[]) {
          const f = w.clarity as unknown as { q?: unknown[] };
          (f.q = f.q || []).push(args);
        };
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://www.clarity.ms/tag/${encodeURIComponent(id)}`;
      document.head.appendChild(s);
      // Le decimos a Clarity que hay permiso para medir y que no hay para publicidad.
      w.clarity("consentv2", { ad_Storage: "denied", analytics_Storage: "granted" });
    }

    const alCambiar = (e: Event) => {
      if ((e as CustomEvent<Consentimiento>).detail?.navegacion) cargar();
    };
    window.addEventListener(EVENTO_CAMBIO, alCambiar);

    let idle = 0;
    let temporizador = 0;
    if (leerConsentimiento()?.navegacion) {
      const programar = () => {
        // Safari no tiene requestIdleCallback: ahí se espera 3 s
        const cuandoPueda = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
        if (cuandoPueda) idle = cuandoPueda.call(window, cargar, { timeout: 5000 });
        else temporizador = window.setTimeout(cargar, 3000);
      };
      if (document.readyState === "complete") programar();
      else window.addEventListener("load", programar, { once: true });
    }

    return () => {
      window.removeEventListener(EVENTO_CAMBIO, alCambiar);
      if (idle && "cancelIdleCallback" in window) window.cancelIdleCallback(idle);
      window.clearTimeout(temporizador);
    };
  }, []);
  return null;
}
