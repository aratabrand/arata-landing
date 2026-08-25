import Script from "next/script";
import { site } from "@/lib/site";

// Google Analytics 4 (gtag.js). Solo se inyecta si hay un ID configurado
// en lib/site.ts. Si el ID está vacío, el componente no renderiza nada,
// así que en local/preview sin ID no envía datos ni carga scripts.
export default function Analytics() {
  const id = site.analyticsId;
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  );
}
