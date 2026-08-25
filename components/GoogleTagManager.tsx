import Script from "next/script";
import { site } from "@/lib/site";

// Google Tag Manager. Dos piezas: el loader (GtmScript) y el respaldo sin
// JavaScript (GtmNoScript, un iframe que va justo al abrir el <body>). Desde
// el panel de GTM se administran GA4, el píxel de Meta, etc., sin tocar código.
// Si no hay ID configurado, ninguna pieza renderiza nada.

// Loader del contenedor: se carga después de que la página es interactiva.
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
