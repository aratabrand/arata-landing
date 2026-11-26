"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle } from "./iconos";
import { agendar as c } from "@/content/agendar";
import { site } from "@/lib/site";
import { medir } from "@/lib/medir";
import { cn } from "@/lib/utils";
import { clasesBoton } from "./Button";

// Calendario de Cal.com en la página (D-074): el embed solo se pide cuando este componente aparece;
// si no abre en 8 s, se ofrece terminar por WhatsApp. Lo usan /agendar (BookingFlow, al final del
// formulario) y la agenda directa de las landings de campaña (D-197).

declare global {
  interface Window {
    Cal?: CalFn;
  }
}
type CalFn = ((...args: unknown[]) => void) & { loaded?: boolean; ns?: Record<string, unknown>; q?: unknown[] };

const track = (event: string, data: Record<string, string | number | null> = {}) => medir(event, data);

/* ── Calendario de Cal.com ───────────────────────────────────────────── */

const CAL_ORIGIN = "https://app.cal.com";

/** Carga el embed oficial de Cal.com (una sola vez) y devuelve la función Cal. */
function cargarCal(): CalFn {
  const w = window;
  if (!w.Cal) {
    // Equivalente al snippet oficial de Cal.com (sin eval): encola llamadas hasta que carga embed.js
    const cal = function (...args: unknown[]) {
      const self = cal as CalFn;
      if (!self.loaded) {
        self.ns = {};
        self.q = self.q ?? [];
        const s = document.createElement("script");
        s.src = `${CAL_ORIGIN}/embed/embed.js`;
        s.async = true;
        document.head.appendChild(s);
        self.loaded = true;
      }
      (self.q as unknown[]).push(args);
    } as CalFn;
    w.Cal = cal;
    w.Cal("init", { origin: "https://cal.com" });
  }
  return w.Cal;
}

export default function Calendario({
  link,
  nombre,
  correo,
  notas,
  onAgendada,
  sinDetalles = false,
}: {
  link: string;
  nombre: string;
  correo: string;
  notas: string;
  onAgendada: () => void;
  /** Oculta la ficha del evento (nombre, duración) para que en celular se vean los días de una (D-197). */
  sinDetalles?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [listo, setListo] = useState(false);
  // Si Cal.com no abre en 8 s (señal lenta, bloqueador), se ofrece terminar por WhatsApp
  const [lento, setLento] = useState(false);
  // D-205: «Volver a intentar» sube este número y el calendario se abre de nuevo (sin recargar la página)
  const [intento, setIntento] = useState(0);
  useEffect(() => {
    if (!link || listo) return;
    const t = window.setTimeout(() => setLento(true), 8000);
    return () => window.clearTimeout(t);
  }, [link, listo, intento]);
  const datosWhatsapp = [nombre && `Nombre: ${nombre}`, correo && `Correo: ${correo}`, notas].filter(Boolean).join("\n");
  const textoWhatsapp = `Hola Arata San, quiero agendar mi reunión.\n\n${datosWhatsapp}`;
  const hrefWhatsapp = `https://wa.me/${site.phone}?text=${encodeURIComponent(textoWhatsapp)}`;

  useEffect(() => {
    if (!link || !ref.current) return;
    // Reintento: si el script de Cal.com nunca abrió (no hay Cal.instance), se pide otra vez desde cero.
    // Si abrió y lo que falló fue el calendario, basta con volver a montarlo.
    if (intento > 0 && window.Cal && !(window.Cal as CalFn & { instance?: unknown }).instance) {
      document.querySelectorAll('script[src$="/embed/embed.js"]').forEach((s) => s.remove());
      delete window.Cal;
    }
    const Cal = cargarCal();
    const el = ref.current;
    el.innerHTML = "";
    Cal("inline", {
      elementOrSelector: el,
      calLink: link,
      layout: "month_view",
      config: { name: nombre, email: correo, notes: notas, theme: "dark", layout: "month_view" },
    });
    Cal("ui", {
      theme: "dark",
      hideEventTypeDetails: sinDetalles,
      layout: "month_view",
      cssVarsPerTheme: { dark: { "cal-brand": "#B6FF00" } },
    });
    Cal("on", { action: "linkReady", callback: () => setListo(true) });
    // Cal.com avisa si el calendario no se pudo abrir: se muestran las opciones de una
    Cal("on", {
      action: "linkFailed",
      callback: () => {
        setListo(false);
        setLento(true);
      },
    });
    Cal("on", { action: "bookingSuccessful", callback: onAgendada });
    Cal("on", { action: "bookingSuccessfulV2", callback: onAgendada });
    track("agendar_calendario", intento ? { reintento: intento } : {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [link, intento]);

  // Sin Cal.com configurado: se termina por WhatsApp con las respuestas ya escritas
  if (!link) {
    return (
      <div className="rounded-frame border border-white/8 bg-noche/50 p-5">
        <p className="text-fog">{c.calendario.sinCalendario}</p>
        <a
          href={hrefWhatsapp}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("agendar_whatsapp", {})}
          className={cn("mt-5 w-full sm:w-auto", clasesBoton({ size: "lg" }))}
        >
          <MessageCircle aria-hidden className="h-4 w-4" />
          {c.calendario.botonWhatsapp}
        </a>
      </div>
    );
  }

  return (
    <div className="relative min-h-[560px] overflow-hidden rounded-frame border border-white/8 bg-noche/50">
      {/* z-10: el espacio del calendario va después en el HTML y quedaba encima: el aviso se veía pero no se podía tocar (D-205) */}
      {!listo && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-start gap-4 p-6 pt-16 text-center sm:justify-center sm:pt-6" aria-live="polite">
          <p className="text-sm text-fog-dim">{lento ? c.calendario.lento : c.calendario.cargando}</p>
          {lento && (
            <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  track("agendar_reintento", { intento: intento + 1 });
                  setLento(false);
                  setListo(false);
                  setIntento((n) => n + 1);
                }}
                className={cn("w-full sm:w-auto", clasesBoton({ size: "lg" }))}
              >
                {c.calendario.reintentar}
              </button>
              <a
                href={hrefWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("agendar_whatsapp", { motivo: "calendario_lento" })}
                className={cn("w-full sm:w-auto", clasesBoton({ variant: "secondary", size: "lg" }))}
              >
                <MessageCircle aria-hidden className="h-4 w-4" />
                {c.calendario.botonWhatsapp}
              </a>
            </div>
          )}
        </div>
      )}
      <div ref={ref} className="relative min-h-[560px] w-full" />
    </div>
  );
}
