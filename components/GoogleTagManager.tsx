import Script from "next/script";
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

// Loader del contenedor: se carga después de que la página es interactiva. Se probó
// lazyOnload (D-096) y fue peor: Lighthouse igual mide el script, solo que más tarde.
export function GtmScript() {
  const id = site.gtmId;
  if (!id) return null;
  return (
    <Script id="gtm-loader" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${id}');`}
    </Script>
  );
}

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
