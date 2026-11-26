// Envío de eventos de medición (D-096).
//
// El contenedor GTM-MVW5FKSQ trae la etiqueta de Google de GA4 (G-PWBJXQML6S) con
// medición mejorada: páginas vistas, scroll, clics salientes, formularios. Esa
// etiqueta NO convierte por sí sola los `dataLayer.push({ event })` en eventos de GA4,
// así que cada evento se manda de dos formas:
//   1. gtag("event", …)           → llega directo a GA4 (sin configurar nada en GTM).
//   2. dataLayer.push({ event … }) → queda disponible para activadores de GTM (p. ej. píxel de Meta).
// ⚠ No crear en GTM una etiqueta "Evento de GA4" para estos mismos eventos: se contarían doble.

type Datos = Record<string, string | number | boolean | null | undefined>;

// D-203: eventos del sitio que también van al pixel de Meta, con su nombre estándar de Meta.
// Solo la cita agendada: es la conversión que optimiza la campaña. El pixel solo existe si la persona
// aceptó «Publicidad» (components/PixelLoader.tsx); si todavía no abrió, el evento espera en la cola.
const A_META: Record<string, string> = { reunion_confirmada: "Lead" };

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** D-204: «origen» de la dirección (p. ej. lp-catalogos, la landing de la campaña), solo letras, números y guiones. */
function origenDeLaPagina(): string | null {
  try {
    const o = new URLSearchParams(window.location.search).get("origen");
    return o && /^[a-z0-9-]{1,40}$/.test(o) ? o : null;
  } catch {
    return null;
  }
}

export function medir(evento: string, datosEntrada: Datos = {}) {
  if (typeof window === "undefined") return;
  // D-204: si la página trae ?origen= (la cita se agendó desde una landing de campaña), va en el evento
  const origen = origenDeLaPagina();
  const datos: Datos = origen && datosEntrada.origen == null ? { ...datosEntrada, origen } : datosEntrada;
  window.dataLayer = window.dataLayer ?? [];
  // Si el contenedor aún no abrió, se crea el mismo gtag() del código de GA4: la llamada
  // queda en la cola (dataLayer) y GA4 la procesa al cargar. Así no se pierde ningún evento.
  if (!window.gtag) {
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
  }
  window.dataLayer.push({ event: evento, ...datos });
  window.gtag("event", evento, datos);
  // Si el contenedor aún no se pidió (se carga al interactuar, D-098), se pide ya:
  // un evento de la agenda o una conversión no esperan.
  // La marca cubre el caso en que el evento sale antes de que GtmLoader escuche
  // (React monta la página antes que el layout: pasa en /agendar/gracias).
  (window as Window & { __medirPendiente?: boolean }).__medirPendiente = true;
  window.dispatchEvent(new Event("as:medir"));

  const meta = A_META[evento];
  if (meta) {
    // D-204: el origen va como content_name: en Meta se separan los Lead de la campaña de los del sitio
    const parametros = origen ? { content_name: origen } : undefined;
    const w = window as Window & { fbq?: (...a: unknown[]) => void; __pixelCargado?: boolean; __pixelPendiente?: { evento: string; parametros?: Record<string, string> }[] };
    if (w.__pixelCargado && w.fbq) w.fbq("track", meta, parametros);
    else {
      w.__pixelPendiente = [...(w.__pixelPendiente ?? []), { evento: meta, parametros }];
      window.dispatchEvent(new Event("as:pixel"));
    }
  }
}
