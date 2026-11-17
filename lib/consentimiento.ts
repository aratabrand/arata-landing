// Consentimiento de cookies (D-130). Ley 1581 de 2012 y Decreto 1377 de 2013:
// la autorización tiene que ser previa, expresa e informada, y la persona puede revocarla.
//
// Reglas:
// - Google Analytics (vía GTM) NO carga hasta que la persona acepta "Medición".
//   Sin respuesta = sin medición (no hay casillas marcadas por defecto).
// - Rechazar es tan fácil como aceptar (mismo nivel, un toque).
// - La elección se guarda 12 meses en este navegador (localStorage, no es una cookie);
//   después se vuelve a preguntar. Se puede cambiar cuando quiera desde el footer.
// - Si retira el permiso, se avisa a Google (consent mode) y se borran las cookies _ga.

export const CLAVE = "as-cookies";
export const VERSION = 1;
const VIGENCIA_MS = 365 * 24 * 60 * 60 * 1000;

export type Consentimiento = { v: number; medicion: boolean; fecha: string };

export const EVENTO_CAMBIO = "as:consentimiento";
export const EVENTO_ABRIR = "as:abrir-cookies";

export function leerConsentimiento(): Consentimiento | null {
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (!crudo) return null;
    const c = JSON.parse(crudo) as Consentimiento;
    if (c.v !== VERSION || typeof c.medicion !== "boolean") return null;
    if (Date.now() - new Date(c.fecha).getTime() > VIGENCIA_MS) return null; // venció: preguntar otra vez
    return c;
  } catch {
    return null;
  }
}

type Ventana = Window & { gtag?: (...a: unknown[]) => void };

export function guardarConsentimiento(medicion: boolean) {
  const c: Consentimiento = { v: VERSION, medicion, fecha: new Date().toISOString() };
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(c));
  } catch {
    // Navegador sin almacenamiento (modo privado estricto): la elección vale solo para esta visita.
  }
  const w = window as Ventana;
  w.gtag?.("consent", "update", { analytics_storage: medicion ? "granted" : "denied" });
  if (!medicion) borrarCookiesDeMedicion();
  window.dispatchEvent(new CustomEvent(EVENTO_CAMBIO, { detail: c }));
  return c;
}

/** Borra _ga y _ga_* en el dominio actual y en el dominio padre (.aratasan.com). */
function borrarCookiesDeMedicion() {
  const nombres = document.cookie
    .split(";")
    .map((p) => p.split("=")[0].trim())
    .filter((n) => n === "_ga" || n.startsWith("_ga_") || n === "_gid" || n === "_gat");
  const host = window.location.hostname;
  const partes = host.split(".");
  const dominios = ["", host, partes.length > 2 ? `.${partes.slice(-2).join(".")}` : `.${host}`];
  for (const n of nombres) {
    for (const d of dominios) {
      document.cookie = `${n}=; Max-Age=0; path=/${d ? `; domain=${d}` : ""}`;
    }
  }
}

/**
 * Script en línea, lo primero del <body> (reemplaza al GtmInit de D-096):
 * crea la cola de gtag, fija el modo de consentimiento en "denegado" por defecto y,
 * si la persona ya aceptó antes, lo actualiza a "concedido" antes de que cargue nada.
 */
export const scriptInicioConsentimiento =
  "window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};" +
  "gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});" +
  `try{var c=JSON.parse(localStorage.getItem('${CLAVE}')||'null');` +
  `if(c&&c.v===${VERSION}&&c.medicion===true&&Date.now()-new Date(c.fecha).getTime()<${VIGENCIA_MS}){gtag('consent','update',{analytics_storage:'granted'});window.__medicionOk=true}}catch(e){}` +
  "gtag('js',new Date());";
