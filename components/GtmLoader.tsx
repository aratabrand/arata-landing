"use client";

import { useEffect } from "react";
import { site } from "@/lib/site";
import { EVENTO_CAMBIO, leerConsentimiento, type Consentimiento } from "@/lib/consentimiento";

// Carga del contenedor de GTM (GA4) sin frenar la apertura de la página (D-098).
//
// El contenedor con GA4 pesa ~178 KB y ocupaba el procesador mientras abría la página:
// en el sitio publicado el Inicio bajó de 95–96 a 77–82 en celular. Ahora se pide:
//   - en cuanto la persona interactúa (toca, hace scroll, mueve el mouse o escribe), o
//   - de inmediato si la página manda un evento (lib/medir.ts dispara "as:medir"; p. ej.
//     la conversión de /agendar/gracias), o
//   - a los 7 s de terminar de abrir, si la persona no hace nada.
// Los eventos anteriores esperan en dataLayer (GtmInit) y GA4 los procesa al cargar.
// Costo aceptado: quien se va en menos de 7 s sin tocar nada no queda registrado.
//
// D-130: nada de esto pasa sin permiso. Si la persona no ha aceptado "Medición" en el aviso
// de cookies, el contenedor no se pide. Si acepta durante la visita, carga en ese momento.

const INTERACCIONES = ["pointerdown", "touchstart", "keydown", "scroll", "mousemove"] as const;
const ESPERA_MS = 7000;

export default function GtmLoader() {
  useEffect(() => {
    const id = site.gtmId;
    if (!id) return;
    const w = window as Window & { dataLayer?: unknown[]; __gtmCargado?: boolean; __medirPendiente?: boolean };
    if (w.__gtmCargado) return;

    // Sin permiso: esperar a que lo dé (el aviso de cookies dispara EVENTO_CAMBIO).
    if (!leerConsentimiento()?.medicion) {
      const alCambiar = (e: Event) => {
        if ((e as CustomEvent<Consentimiento>).detail?.medicion) {
          window.removeEventListener(EVENTO_CAMBIO, alCambiar);
          iniciar(true);
        }
      };
      window.addEventListener(EVENTO_CAMBIO, alCambiar);
      return () => window.removeEventListener(EVENTO_CAMBIO, alCambiar);
    }
    return iniciar(false);

    function iniciar(yaInteractuo: boolean): () => void {
    let temporizador = 0;
    const quitar = () => {
      INTERACCIONES.forEach((e) => window.removeEventListener(e, cargar));
      window.removeEventListener("as:medir", cargar);
      window.removeEventListener("load", programar);
      window.clearTimeout(temporizador);
    };
    function cargar() {
      if (w.__gtmCargado) return;
      w.__gtmCargado = true;
      quitar();
      w.dataLayer = w.dataLayer ?? [];
      w.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`;
      document.head.appendChild(s);
    }
    function programar() {
      temporizador = window.setTimeout(cargar, ESPERA_MS);
    }

    // Un evento ya salió antes de montar este cargador (p. ej. la conversión), o la persona
    // acaba de aceptar en el aviso (ya interactuó): cargar ya.
    if (yaInteractuo || w.__medirPendiente) {
      cargar();
      return quitar;
    }
    INTERACCIONES.forEach((e) => window.addEventListener(e, cargar, { once: true, passive: true }));
    window.addEventListener("as:medir", cargar, { once: true });
    if (document.readyState === "complete") programar();
    else window.addEventListener("load", programar, { once: true });
    return quitar;
    }
  }, []);
  return null;
}
