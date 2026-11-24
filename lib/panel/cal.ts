import { createHmac, timingSafeEqual } from "node:crypto";
import { CODIGO } from "./clientes/prospectos";

// Avisos (webhook) de Cal.com → interesados del panel (D-133). Funciones puras: sin base de datos,
// para poder probarlas (scripts/prueba-cal.ts). Cal.com firma el cuerpo con HMAC-SHA256 y un
// secreto que se define al crear el webhook; la firma viaja en la cabecera x-cal-signature-256.

/** ¿La firma corresponde a este cuerpo? Acepta hexadecimal o base64 (la documentación no precisa cuál). */
export function firmaValida(cuerpo: string, cabecera: string | null | undefined, secreto: string): boolean {
  if (!secreto || !cabecera) return false;
  const mac = createHmac("sha256", secreto).update(cuerpo, "utf8").digest(); // 32 bytes
  const dado = cabecera.trim().replace(/^sha256=/i, "");
  let recibido: Buffer | null = null;
  if (/^[0-9a-f]{64}$/i.test(dado)) recibido = Buffer.from(dado, "hex");
  else if (/^[A-Za-z0-9+/]{43}=?$/.test(dado)) recibido = Buffer.from(dado, "base64");
  // timingSafeEqual exige el mismo largo; ya está garantizado, pero se revisa igual
  return recibido !== null && recibido.length === mac.length && timingSafeEqual(recibido, mac);
}

/* ── Limpieza de lo que escribe la persona ───────────────────────────── */

const limpiar = (v: unknown, max: number) =>
  String(v ?? "")
    .replace(/[\u0000-\u001F\u007F<>]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, max);

/** Solo números, con indicativo (7 a 15). null si no sirve. */
export function whatsappLimpio(v: unknown): string | null {
  const d = String(v ?? "").replace(/\D/g, "");
  return d.length >= 7 && d.length <= 15 ? d : null;
}

const CORREO = /^[A-Za-z0-9._%+-]{1,64}@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/;

/** Solo enlaces https de sitios donde se hacen las llamadas (cualquier otro se descarta). */
export function enlaceSeguro(v: unknown): string | null {
  const t = String(v ?? "").trim();
  if (!/^https:\/\//i.test(t) || t.length > 500) return null;
  try {
    const u = new URL(t);
    if (u.username || u.password) return null;
    const h = u.hostname.toLowerCase();
    const ok =
      h === "cal.com" ||
      h.endsWith(".cal.com") ||
      h === "meet.google.com" ||
      h === "zoom.us" ||
      h.endsWith(".zoom.us") ||
      h === "teams.microsoft.com" ||
      h === "teams.live.com" ||
      h === "whereby.com" ||
      h.endsWith(".whereby.com");
    return ok ? u.toString() : null;
  } catch {
    return null;
  }
}

/* ── Notas del formulario de /agendar ────────────────────────────────── */

export type TipoInteres = "pagina" | "catalogo" | "sistema" | "auditoria";

/** De la respuesta "Necesito: …" al tipo. Auditoría primero: su texto también dice "página". */
export function tipoDe(necesita: string | null, evento?: string | null): TipoInteres | null {
  const t = `${necesita ?? ""}`.toLowerCase();
  if (/auditor/.test(t)) return "auditoria";
  if (/cat[aá]logo|tienda/.test(t)) return "catalogo";
  if (/sistema/.test(t)) return "sistema";
  if (/p[aá]gina/.test(t)) return "pagina";
  if (/auditor/i.test(evento ?? "")) return "auditoria";
  return null;
}

export type Notas = {
  necesita: string | null;
  tipo: TipoInteres | null;
  paginaWeb: string | null;
  cuando: string | null;
  inversion: string | null;
  whatsapp: string | null;
  autorizacion: string | null;
  /** Código del prospecto si agendó desde el mensaje de WhatsApp (D-174): línea "Referencia: 8f3a1c…". */
  referencia: string | null;
};

/** Lee las líneas "Etiqueta: valor" que arma BookingFlow (content/agendar.ts). Lo que no esté, queda en null. */
export function leerNotas(notas: unknown, evento?: string | null): Notas {
  const lineas = String(notas ?? "").split(/\r?\n/);
  const campo = (re: RegExp) => {
    for (const l of lineas) {
      const m = l.match(re);
      if (m) {
        const v = limpiar(m[1], 200);
        return v && v !== "-" ? v : null;
      }
    }
    return null;
  };
  const necesita = campo(/^\s*Necesito\s*:\s*(.+)$/i);
  const pagina = campo(/^\s*Mi p[aá]gina\s*:\s*(.+)$/i);
  return {
    necesita,
    tipo: tipoDe(necesita, evento),
    paginaWeb: pagina && /^https?:\/\//i.test(pagina) ? pagina : null,
    cuando: campo(/^\s*Cu[aá]ndo empezar\s*:\s*(.+)$/i),
    inversion: campo(/^\s*Inversi[oó]n\s*:\s*(.+)$/i),
    whatsapp: whatsappLimpio(campo(/^\s*WhatsApp\s*:\s*(.+)$/i)),
    autorizacion: campo(/^\s*Autorizaci[oó]n de datos\s*:\s*(.+)$/i),
    referencia: ((v) => (v && CODIGO.test(v.toLowerCase()) ? v.toLowerCase() : null))(campo(/^\s*Referencia\s*:\s*(.+)$/i)),
  };
}

/**
 * WhatsApp y autorización cuando NO vienen en las notas (agenda directa de las landings, D-197):
 * se leen de las preguntas de la reserva en Cal.com. Identificadores que se buscan, en orden:
 * la pregunta propia «whatsapp» (tipo teléfono), el teléfono del sistema «attendeePhoneNumber»
 * y el teléfono del invitado. La casilla de datos es la pregunta «autorizacion» (tipo casilla).
 */
export function datosDePreguntas(respuestas: Record<string, unknown>, invitado: Record<string, unknown>, cuando = new Date()) {
  const valor = (k: string) => {
    const r = respuestas[k];
    return r && typeof r === "object" && "value" in r ? (r as { value: unknown }).value : r;
  };
  const whatsapp = whatsappLimpio(valor("whatsapp")) ?? whatsappLimpio(valor("attendeePhoneNumber")) ?? whatsappLimpio(invitado.phoneNumber);
  const casilla = valor("autorizacion");
  const autorizacion =
    casilla === true || casilla === "true"
      ? `sí, casilla en Cal.com, ${cuando.toLocaleString("es-CO", { timeZone: "America/Bogota" })} (hora de Bogotá)`
      : null;
  return { whatsapp, autorizacion };
}

/* ── El aviso de Cal.com ─────────────────────────────────────────────── */

export type Aviso =
  | { accion: "ignorar"; motivo: string }
  | {
      /** solicitada = espera que la acepten en Cal.com (confirmación manual) · creada = ya quedó fija */
      accion: "creada" | "solicitada" | "reprogramada" | "cancelada" | "rechazada";
      uid: string;
      /** Solo en reprogramaciones: el uid de la reserva anterior. */
      uidAnterior: string | null;
      bookingId: number | null;
      nombre: string;
      correo: string | null;
      whatsapp: string | null;
      necesita: string | null;
      tipo: TipoInteres | null;
      paginaWeb: string | null;
      cuando: string | null;
      inversion: string | null;
      autorizacion: string | null;
      /** Código del prospecto que agendó desde el mensaje de WhatsApp (D-174). */
      referencia: string | null;
      evento: string | null;
      inicio: string; // ISO UTC
      fin: string | null;
      zona: string | null;
      enlaceLlamada: string | null;
      enlaceReserva: string;
    };

const UID = /^[A-Za-z0-9_-]{6,80}$/;
const iso = (v: unknown) => {
  const d = new Date(String(v ?? ""));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};
type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : {});

/** Convierte el JSON de Cal.com en algo que el panel entiende. Los eventos que no importan se ignoran. */
export function leerAviso(cuerpo: unknown): Aviso {
  const raiz = obj(cuerpo);
  const trigger = String(raiz.triggerEvent ?? "");
  const acciones: Record<string, Exclude<Aviso, { accion: "ignorar" }>["accion"]> = {
    BOOKING_CREATED: "creada", // también llega cuando se acepta una solicitud
    BOOKING_REQUESTED: "solicitada",
    BOOKING_REJECTED: "rechazada",
    BOOKING_RESCHEDULED: "reprogramada",
    BOOKING_CANCELLED: "cancelada",
  };
  const p = obj(raiz.payload);
  let accion = acciones[trigger];
  if (!accion) return { accion: "ignorar", motivo: trigger || "sin evento" };
  // Por si Cal.com manda "creada" con la reserva todavía en espera
  if (accion === "creada" && String(p.status ?? "").toUpperCase() === "PENDING") accion = "solicitada";

  const uid = String(p.uid ?? "");
  if (!UID.test(uid)) return { accion: "ignorar", motivo: "reserva sin uid válido" };
  const inicio = iso(p.startTime);
  if (!inicio) return { accion: "ignorar", motivo: "reserva sin hora" };

  // Quien agenda es el invitado (attendees[0]); el anfitrión es Arata San
  const invitado = obj(Array.isArray(p.attendees) ? p.attendees[0] : null);
  const respuestas = obj(p.responses);
  const nombre = limpiar(invitado.name ?? obj(respuestas.name).value, 120) || "Sin nombre";
  const correoCrudo = limpiar(invitado.email ?? obj(respuestas.email).value, 254);
  const evento = limpiar(p.type ?? p.eventTitle, 120) || null;
  const notas = leerNotas(p.additionalNotes ?? obj(respuestas.notes).value, evento);
  const preguntas = datosDePreguntas(respuestas, invitado);

  const meta = obj(p.metadata);
  const videoData = obj(p.videoCallData);
  const enlaceLlamada = enlaceSeguro(meta.videoCallUrl) ?? enlaceSeguro(videoData.url) ?? enlaceSeguro(p.location);
  const anterior = String(p.rescheduleUid ?? "");
  const id = Number(p.bookingId);

  return {
    accion,
    uid,
    uidAnterior: accion === "reprogramada" && UID.test(anterior) ? anterior : null,
    bookingId: Number.isSafeInteger(id) ? id : null,
    nombre,
    correo: CORREO.test(correoCrudo) ? correoCrudo : null,
    whatsapp: notas.whatsapp ?? preguntas.whatsapp,
    necesita: notas.necesita,
    tipo: notas.tipo,
    paginaWeb: notas.paginaWeb,
    cuando: notas.cuando,
    inversion: notas.inversion,
    // La casilla de Cal.com, si existe, es la constancia más fuerte; si no, la línea de las notas
    autorizacion: preguntas.autorizacion ?? notas.autorizacion,
    referencia: notas.referencia,
    evento,
    inicio,
    fin: iso(p.endTime),
    zona: limpiar(invitado.timeZone, 60) || null,
    enlaceLlamada,
    // Página de la reserva en Cal.com: ahí está el botón de unirse y la opción de cambiar la hora
    enlaceReserva: `https://app.cal.com/booking/${uid}`,
  };
}

/* ── Textos para el historial y el aviso al celular ──────────────────── */

export { cuandoTexto } from "./clientes/interesados";
