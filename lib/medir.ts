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

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function medir(evento: string, datos: Datos = {}) {
  if (typeof window === "undefined") return;
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
}
