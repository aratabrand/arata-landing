// Prueba de los avisos de Cal.com (D-133). Correr:  npx -y tsx scripts/prueba-cal.ts
import { createHmac } from "node:crypto";
import { firmaValida, leerAviso, leerNotas, enlaceSeguro, whatsappLimpio, tipoDe } from "../lib/panel/cal";
import { agendar } from "../content/agendar";
const ok = (c: boolean, m: string) => { console.log((c ? "✓ " : "✗ ") + m); if (!c) process.exitCode = 1; };
const secreto = "secreto-de-prueba-0123456789";

// ── Firma
const cuerpo = JSON.stringify({ triggerEvent: "BOOKING_CREATED", payload: { uid: "abc" } });
const hex = createHmac("sha256", secreto).update(cuerpo).digest("hex");
const b64 = createHmac("sha256", secreto).update(cuerpo).digest("base64");
ok(firmaValida(cuerpo, hex, secreto), "firma en hexadecimal: válida");
ok(firmaValida(cuerpo, hex.toUpperCase(), secreto), "firma en hexadecimal en mayúsculas: válida");
ok(firmaValida(cuerpo, b64, secreto), "firma en base64: válida");
ok(firmaValida(cuerpo, "sha256=" + hex, secreto), "firma con prefijo sha256=: válida");
ok(!firmaValida(cuerpo + " ", hex, secreto), "cuerpo cambiado: rechaza");
ok(!firmaValida(cuerpo, hex, "otro-secreto-0123456789"), "otro secreto: rechaza");
ok(!firmaValida(cuerpo, null, secreto) && !firmaValida(cuerpo, "", secreto) && !firmaValida(cuerpo, "basura", secreto), "sin firma o basura: rechaza");
ok(!firmaValida(cuerpo, hex, ""), "sin secreto configurado: rechaza siempre");
ok(!firmaValida(cuerpo, hex.slice(0, 62) + "00", secreto), "firma con dos caracteres cambiados: rechaza");

// ── Notas del formulario (las que arma BookingFlow)
const notas = "Necesito: Una página nueva\nCuándo empezar: En las próximas semanas\nInversión: 400 a 800 USD\nWhatsApp: +57 300 123 4567\nAutorización de datos: sí, 18/11/2026, 3:00:00 p. m. (hora de Bogotá)";
const n = leerNotas(notas);
ok(n.necesita === "Una página nueva" && n.tipo === "pagina", "notas: necesita y tipo página");
ok(n.cuando === "En las próximas semanas" && n.inversion === "400 a 800 USD", "notas: cuándo e inversión");
ok(n.whatsapp === "573001234567", "notas: WhatsApp solo con números e indicativo");
ok(!!n.autorizacion?.startsWith("sí"), "notas: constancia de autorización");
const aud = leerNotas("Necesito: Una auditoría gratis de mi página\nMi página: https://tunegocio.com\nCuándo empezar: Todavía lo estoy pensando\nWhatsApp: +57 300 000 0000");
ok(aud.tipo === "auditoria" && aud.paginaWeb === "https://tunegocio.com" && aud.inversion === null, "notas de auditoría: tipo, página y sin inversión");
ok(tipoDe("Un catálogo o tienda") === "catalogo" && tipoDe("Un sistema a medida") === "sistema", "tipos catálogo y sistema");
const vacio = leerNotas("");
ok(vacio.necesita === null && vacio.whatsapp === null && vacio.tipo === null, "sin notas (reserva directa en Cal): todo null, no falla");
ok(leerNotas("Necesito: <script>alert(1)</script> página").necesita === "script alert(1) /script página", "notas: quita < y > (nada de HTML)");
ok(whatsappLimpio("+57 300 123 4567") === "573001234567" && whatsappLimpio("12") === null && whatsappLimpio("1".repeat(16)) === null, "WhatsApp: 7 a 15 números");

// ── Las opciones REALES del formulario (si alguien cambia un texto en content/agendar.ts, esto avisa)
const esperado: Record<string, string> = { pagina: "pagina", catalogo: "catalogo", sistema: "sistema", auditoria: "auditoria" };
for (const o of agendar.pasos.tipo.opciones) ok(tipoDe(o.label) === esperado[o.valor], `opción "${o.label}" → ${o.valor}`);

// ── Enlaces
ok(enlaceSeguro("https://app.cal.com/video/abc123") !== null && enlaceSeguro("https://meet.google.com/abc-defg-hij") !== null && enlaceSeguro("https://us02web.zoom.us/j/123") !== null, "enlaces de Cal, Meet y Zoom: aceptados");
ok(enlaceSeguro("http://cal.com/x") === null && enlaceSeguro("javascript:alert(1)") === null && enlaceSeguro("https://cal.com.malo.com/x") === null && enlaceSeguro("https://evil.com/x") === null && enlaceSeguro("https://u:p@cal.com/x") === null, "enlaces http, javascript:, falsos o con usuario: rechazados");

// ── El aviso de Cal.com
const base = (extra: object = {}, payload: object = {}) => ({
  triggerEvent: "BOOKING_CREATED",
  createdAt: "2026-11-18T14:00:00.000Z",
  payload: {
    type: "asesoria-30min", eventTitle: "Asesoría 30 min", title: "Asesoría 30 min entre Arata San y Ana Pérez",
    uid: "bFJeNb2uX8ANpT3JL5EfXw", bookingId: 91,
    startTime: "2026-11-19T20:00:00Z", endTime: "2026-11-19T20:30:00Z",
    additionalNotes: notas,
    organizer: { name: "Arata San", email: "info@aratasan.com", timeZone: "America/Bogota" },
    attendees: [{ name: "Ana  Pérez", email: "ana@ejemplo.com", timeZone: "America/Bogota" }],
    location: "integrations:daily", metadata: { videoCallUrl: "https://app.cal.com/video/bFJeNb2uX8ANpT3JL5EfXw" }, status: "ACCEPTED",
    ...payload,
  },
  ...extra,
});
const a = leerAviso(base());
ok(a.accion === "creada" && a.uid === "bFJeNb2uX8ANpT3JL5EfXw" && a.bookingId === 91, "aviso: reserva creada con uid y número");
if (a.accion !== "ignorar") {
  ok(a.nombre === "Ana Pérez" && a.correo === "ana@ejemplo.com", "aviso: quien agenda es el invitado (no el anfitrión), nombre sin espacios dobles");
  ok(a.tipo === "pagina" && a.whatsapp === "573001234567" && a.inversion === "400 a 800 USD", "aviso: trae lo que respondió en /agendar");
  ok(a.inicio === "2026-11-19T20:00:00.000Z" && a.fin === "2026-11-19T20:30:00.000Z", "aviso: hora de la reunión");
  ok(a.enlaceLlamada === "https://app.cal.com/video/bFJeNb2uX8ANpT3JL5EfXw", "aviso: enlace de la llamada");
  ok(a.enlaceReserva === "https://app.cal.com/booking/bFJeNb2uX8ANpT3JL5EfXw", "aviso: página de la reserva en Cal");
}
const meet = leerAviso(base({}, { metadata: {}, location: "https://meet.google.com/abc-defg-hij" }));
ok(meet.accion === "creada" && meet.enlaceLlamada === "https://meet.google.com/abc-defg-hij", "sin metadata: usa el enlace de Meet de location");
const raro = leerAviso(base({}, { metadata: { videoCallUrl: "https://evil.com/x" }, location: "Oficina" }));
ok(raro.accion === "creada" && raro.enlaceLlamada === null, "enlace de un sitio desconocido: se descarta (queda la página de la reserva)");
const rep = leerAviso(base({ triggerEvent: "BOOKING_RESCHEDULED" }, { uid: "NUEVOuid123456", rescheduleUid: "bFJeNb2uX8ANpT3JL5EfXw", startTime: "2026-11-20T15:00:00Z" }));
ok(rep.accion === "reprogramada" && rep.uid === "NUEVOuid123456" && rep.uidAnterior === "bFJeNb2uX8ANpT3JL5EfXw", "reprogramada: trae el uid nuevo y el anterior");
ok(leerAviso(base({ triggerEvent: "BOOKING_CANCELLED" })).accion === "cancelada", "cancelada");
ok(leerAviso(base({ triggerEvent: "BOOKING_REQUESTED" })).accion === "creada", "solicitud pendiente de aprobar: se trata como creada");
ok(leerAviso({ triggerEvent: "PING", payload: {} }).accion === "ignorar" && leerAviso(base({ triggerEvent: "MEETING_ENDED" })).accion === "ignorar", "PING y otros eventos: se ignoran sin fallar");
ok(leerAviso(base({}, { uid: "x" })).accion === "ignorar" && leerAviso(base({}, { startTime: "no es fecha" })).accion === "ignorar", "uid o fecha inválidos: se ignora");
ok(leerAviso(null).accion === "ignorar" && leerAviso("texto").accion === "ignorar" && leerAviso([]).accion === "ignorar", "cuerpo que no es un objeto: se ignora");
const sinInvitado = leerAviso(base({}, { attendees: [] }));
ok(sinInvitado.accion === "creada" && sinInvitado.nombre === "Sin nombre" && sinInvitado.correo === null, "sin invitado: no falla (nombre 'Sin nombre')");
const mala = leerAviso(base({}, { attendees: [{ name: "A".repeat(500), email: "no-es-correo", timeZone: "x".repeat(200) }] }));
ok(mala.accion === "creada" && mala.nombre.length === 120 && mala.correo === null && (mala.zona?.length ?? 0) <= 60, "textos largos o correo malo: se acotan");
if (process.exitCode) console.log("HAY FALLAS");
