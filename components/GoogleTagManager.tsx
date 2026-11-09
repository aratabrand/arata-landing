import { site } from "@/lib/site";

// Google Tag Manager. Dos piezas: el loader (GtmScript) y el respaldo sin
// JavaScript (GtmNoScript, un iframe que va justo al abrir el <body>). Desde
// el panel de GTM se administran GA4, el píxel de Meta, etc., sin tocar código.
// Si no hay ID configurado, ninguna pieza renderiza nada.

// Arranque de la medición, lo primero de la página (D-096): crea dataLayer y el mismo
// `gtag()` del código de instalación de GA4, y registra gtag('js'). Así, cualquier
// evento (p. ej. la conversión de /agendar/gracias) queda en cola en el orden correcto
// aunque se dispare antes de que el contenedor termine de abrir. Son ~150 bytes.
export function GtmInit() {
  if (!site.gtmId) return null;
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: "window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};gtag('js',new Date());",
      }}
    />
  );
}

// Loader del contenedor: components/GtmLoader.tsx (carga al interactuar, D-098).
export { default as GtmScript } from "./GtmLoader";

// Respaldo para navegadores sin JavaScript. Va como primer hijo del <body>.
export function GtmNoScript() {
  const id = site.gtmId;
  if (!id) return null;
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${id}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
