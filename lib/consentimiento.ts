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
// - Dos permisos separados (D-132): "medicion" (Google Analytics: cuántas visitas) y "navegacion"
//   (Microsoft Clarity: mapas de clics y grabaciones, más invasivo). "Aceptar" da los dos; se pueden
//   elegir uno por uno en Preferencias. Clarity solo existe si hay `site.clarityId`.
// - Tercer permiso (D-203): "publicidad" (pixel de Meta: medir los anuncios de Facebook e Instagram y
//   mostrarle anuncios de Arata San). Solo existe si hay `site.pixelId`. Con el pixel, Meta no recibe
//   nombre, correo ni WhatsApp (sin "coincidencia avanzada") y no se rastrean botones solos (autoConfig apagado).

import { site } from "@/lib/site";

export const CLAVE = "as-cookies";
/** Microsoft Clarity está encendido (hay ID de proyecto). Si no, no hay segundo permiso ni se menciona. */
export const CLARITY_ACTIVO = site.clarityId !== "";
/** Pixel de Meta encendido (hay ID). Si no, no hay permiso de publicidad ni se menciona a Meta. */
export const PIXEL_ACTIVO = site.pixelId !== "";
export const VERSION = 1;
const VIGENCIA_MS = 365 * 24 * 60 * 60 * 1000;

export type Consentimiento = { v: number; medicion: boolean; navegacion?: boolean; publicidad?: boolean; fecha: string };

/** Proveedores que reciben datos al agendar o al medir, para las casillas de autorización (Ley 1581, art. 26). */
export function proveedoresDatos(): string {
  const lista = ["Cal.com", "Google", ...(CLARITY_ACTIVO ? ["Microsoft"] : []), ...(PIXEL_ACTIVO ? ["Meta"] : [])];
  return `${lista.slice(0, -1).join(", ")} y ${lista[lista.length - 1]}`;
}

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

/**
 * ¿Hay que mostrar el aviso? Sí si nunca eligió, o si eligió antes de que existiera Clarity
 * (permiso nuevo = autorización nueva: Ley 1581, finalidad distinta).
 */
export function necesitaPreguntar(c: Consentimiento | null) {
  return !c || (CLARITY_ACTIVO && c.navegacion === undefined) || (PIXEL_ACTIVO && c.publicidad === undefined);
}

type Ventana = Window & {
  gtag?: (...a: unknown[]) => void;
  clarity?: (...a: unknown[]) => void;
  __clarityCargado?: boolean;
  fbq?: (...a: unknown[]) => void;
  __pixelCargado?: boolean;
};

export function guardarConsentimiento(medicion: boolean, navegacion = false, publicidad = false) {
  const c: Consentimiento = {
    v: VERSION,
    medicion,
    ...(CLARITY_ACTIVO ? { navegacion } : {}),
    ...(PIXEL_ACTIVO ? { publicidad } : {}),
    fecha: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(c));
  } catch {
    // Navegador sin almacenamiento (modo privado estricto): la elección vale solo para esta visita.
  }
  const w = window as Ventana;
  w.gtag?.("consent", "update", { analytics_storage: medicion ? "granted" : "denied" });
  if (!medicion) borrarCookiesDeMedicion();
  window.dispatchEvent(new CustomEvent(EVENTO_CAMBIO, { detail: c }));
  // Retirar un permiso de una herramienta ya abierta: avisarle, borrar sus cookies y recargar para que su
  // script deje de correr (no hay una forma limpia de "pararlo" sin recargar).
  let recargar = false;
  if (CLARITY_ACTIVO && !navegacion && w.__clarityCargado) {
    try {
      w.clarity?.("consentv2", { ad_Storage: "denied", analytics_Storage: "denied" });
      w.clarity?.("consent", false);
    } catch {}
    borrarCookies(NOMBRES_CLARITY);
    recargar = true;
  }
  if (PIXEL_ACTIVO && !publicidad && w.__pixelCargado) {
    try {
      w.fbq?.("consent", "revoke");
    } catch {}
    borrarCookies(NOMBRES_META);
    recargar = true;
  }
  if (recargar) window.location.reload();
  return c;
}

const esGoogle = (n: string) => n === "_ga" || n.startsWith("_ga_") || n === "_gid" || n === "_gat";
/** Cookies de Clarity. _clck y _clsk son de este sitio; CLID, MUID y ANONID las pone Microsoft en su dominio
 *  (no se pueden borrar desde aquí; la persona las borra desde su navegador). */
const NOMBRES_CLARITY = ["_clck", "_clsk", "CLID", "ANONID", "MUID", "SM"];
/** Cookies del pixel de Meta en este sitio (D-203). Las de facebook.com las borra la persona desde su navegador. */
const NOMBRES_META = ["_fbp", "_fbc"];

function borrarCookiesDeMedicion() {
  borrarCookies((n) => esGoogle(n));
}

/** Borra cookies del dominio actual y del dominio padre (.aratasan.com). */
function borrarCookies(filtro: string[] | ((n: string) => boolean)) {
  const coincide = Array.isArray(filtro) ? (n: string) => filtro.includes(n) : filtro;
  const nombres = document.cookie
    .split(";")
    .map((p) => p.split("=")[0].trim())
    .filter(coincide);
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
