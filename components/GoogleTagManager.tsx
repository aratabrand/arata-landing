import { site } from "@/lib/site";
import { scriptInicioConsentimiento } from "@/lib/consentimiento";

// Google Tag Manager: el arranque (GtmInit) y el cargador (GtmScript), que solo
// pide el contenedor si la persona aceptó la medición (D-130). Desde el panel de
// GTM se administran GA4, el píxel de Meta, etc., sin tocar código.
// Si no hay ID configurado, ninguna pieza renderiza nada.

// Arranque de la medición, lo primero de la página (D-096, D-130): crea dataLayer y `gtag()`,
// fija el consentimiento de Google en "denegado" por defecto y lo pasa a "concedido" solo si
// la persona ya aceptó la medición (lib/consentimiento.ts). Los eventos quedan en cola en orden.
export function GtmInit() {
  if (!site.gtmId) return null;
  return <script dangerouslySetInnerHTML={{ __html: scriptInicioConsentimiento }} />;
}

// Loader del contenedor: components/GtmLoader.tsx (carga al interactuar, D-098).
export { default as GtmScript } from "./GtmLoader";

// D-130: ya no hay respaldo <noscript> de GTM. Sin JavaScript no se puede pedir permiso,
// así que esas visitas no se miden (la ley exige autorización previa).
