// Interesados que agendan reunión por Cal.com (D-133). Tipos y funciones puras que usa la pantalla
// (sin node:crypto ni base de datos: este archivo también viaja al navegador).

export type EstadoInteresado = "agendada" | "confirmada" | "cancelada" | "descartada" | "rechazada";
export type TipoInteres = "pagina" | "catalogo" | "sistema" | "auditoria";

export type Interesado = {
  id: string;
  nombre: string;
  correo: string | null;
  /** Solo números, con indicativo (573001234567). */
  whatsapp: string | null;
  necesita: string | null;
  tipo: TipoInteres | null;
  paginaWeb: string | null;
  cuando: string | null;
  inversion: string | null;
  /** Hora de la reunión (ISO, UTC). */
  inicio: string;
  fin: string | null;
  enlaceLlamada: string | null;
  enlaceReserva: string | null;
  estado: EstadoInteresado;
  /** Pidió la reunión y todavía no se acepta en Cal.com (confirmación manual, D-134). */
  porAceptar: boolean;
  clienteId: string | null;
  creado: string;
  cerradoEn: string | null;
};

const ZONA = "America/Bogota";

/** "mar 19 nov, 3:00 p. m." en hora de Bogotá (igual en servidor y navegador). */
export function cuandoTexto(inicioISO: string) {
  return new Date(inicioISO).toLocaleString("es-CO", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: ZONA });
}

const MIN = 60_000;
/** Cuánto dura la reunión (si Cal.com no mandó la hora de fin, 30 minutos). */
export const duracionMs = (i: Pick<Interesado, "inicio" | "fin">) => (i.fin ? Math.max(5 * MIN, Date.parse(i.fin) - Date.parse(i.inicio)) : 30 * MIN);

export type Momento = "ahora" | "pronto" | "futura" | "pasada";

/** Dónde está la reunión respecto a este momento: ahora (empezó o empieza en 15 min), pronto (hoy), futura o pasada. */
export function momentoDe(i: Pick<Interesado, "inicio" | "fin">, ahoraMs: number): Momento {
  const ini = Date.parse(i.inicio);
  const fin = ini + duracionMs(i);
  if (ahoraMs > fin + 15 * MIN) return "pasada";
  if (ahoraMs >= ini - 15 * MIN) return "ahora";
  return ini - ahoraMs < 24 * 60 * MIN ? "pronto" : "futura";
}

/** "en 25 min", "en 3 h", "mañana", "en 4 días", "hace 2 h", "ayer"… */
export function relativo(inicioISO: string, ahoraMs: number) {
  const dif = Date.parse(inicioISO) - ahoraMs;
  const abs = Math.abs(dif);
  const futuro = dif >= 0;
  const min = Math.round(abs / MIN);
  if (min < 1) return "ahora";
  if (min < 60) return futuro ? `en ${min} min` : `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return futuro ? `en ${h} h` : `hace ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return futuro ? "mañana" : "ayer";
  return futuro ? `en ${d} días` : `hace ${d} días`;
}

/* ── De WhatsApp (con indicativo) a país + celular del formulario de cliente ── */

// Indicativo → país (código ISO de la tabla `paises`). Se prueba el prefijo más largo primero.
const PREFIJOS: [string, string][] = [
  ["1809", "DO"], ["1829", "DO"], ["1849", "DO"], ["1787", "PR"], ["1939", "PR"],
  ["593", "EC"], ["591", "BO"], ["595", "PY"], ["598", "UY"], ["502", "GT"], ["503", "SV"], ["504", "HN"], ["505", "NI"], ["506", "CR"], ["507", "PA"], ["351", "PT"],
  ["57", "CO"], ["52", "MX"], ["34", "ES"], ["54", "AR"], ["56", "CL"], ["51", "PE"], ["58", "VE"], ["55", "BR"], ["53", "CU"], ["44", "GB"], ["33", "FR"], ["49", "DE"], ["39", "IT"],
  ["1", "US"],
];

/** País y número como lo guarda el formulario de cliente: Colombia sin el 57; otros países, completo con indicativo. */
export function paisDeWhatsapp(digitos: string | null): { pais: string; telefono: string } {
  const d = (digitos ?? "").replace(/\D/g, "");
  if (!d) return { pais: "CO", telefono: "" };
  const hit = PREFIJOS.find(([p]) => d.startsWith(p));
  if (!hit) return { pais: "CO", telefono: d }; // indicativo desconocido: se deja para corregir en el formulario
  const [prefijo, pais] = hit;
  return { pais, telefono: pais === "CO" ? d.slice(prefijo.length) : d };
}

/** Lo que se le prellena al formulario "Confirmar y pasar a cliente". */
export function datosDeCliente(i: Interesado) {
  const { pais, telefono } = paisDeWhatsapp(i.whatsapp);
  const notas = [
    i.necesita ? `Necesita: ${i.necesita}` : null,
    i.cuando ? `Cuándo empezar: ${i.cuando}` : null,
    i.inversion ? `Inversión: ${i.inversion}` : null,
  ]
    .filter(Boolean)
    .join("\n");
  return {
    nombre: i.nombre === "Sin nombre" ? "" : i.nombre,
    telefono,
    pais,
    sitioWeb: i.paginaWeb ?? "",
    estado: "nuevo" as const,
    origen: "Página" as const,
    origenDetalle: `Agendó reunión en aratasan.com (${cuandoTexto(i.inicio)})`,
    notas,
  };
}

/** Donde se aceptan o rechazan las solicitudes en Cal.com. */
export const CAL_POR_ACEPTAR = "https://app.cal.com/bookings/unconfirmed";

export const etiquetaTipo: Record<TipoInteres, string> = {
  pagina: "Página",
  catalogo: "Catálogo",
  sistema: "Sistema",
  auditoria: "Auditoría",
};
