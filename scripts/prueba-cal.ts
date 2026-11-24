// Prueba de los avisos de Cal.com (D-133). Correr:  npx -y tsx scripts/prueba-cal.ts
import { createHmac } from "node:crypto";
import { firmaValida, leerAviso, leerNotas, enlaceSeguro, whatsappLimpio, tipoDe } from "../lib/panel/cal";
import { agendar } from "../content/agendar";
import { textosAgenda } from "../content/campanas/catalogos";
import { PLAZOS, datosDeCliente, diasParaPlazo, mensajeSeguimiento, plazoDesde, plazoValido, recordatorioEspera, type Interesado } from "../lib/panel/clientes/interesados";
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
ok(leerNotas("Necesito: Una tienda\nReferencia: 8F3A1C2B9D").referencia === "8f3a1c2b9d", "notas: código del prospecto (D-174)");
ok(leerNotas("Referencia: x' or 1=1").referencia === null && leerNotas("Referencia: 8f3a1c2b9").referencia === null, "notas: referencia rara se ignora");
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

// ── Agenda directa de la landing (D-197): sin formulario, el WhatsApp y la casilla vienen de Cal.com
const lp = textosAgenda(true);
const notasLp = `${lp.notas}\n${lp.notaAutorizacion}, 24/11/2026, 5:00:00 p. m. (hora de Bogotá)`;
const directa = leerAviso(base({}, { additionalNotes: notasLp, responses: { whatsapp: { label: "WhatsApp", value: "+57 310 555 1234" }, autorizacion: { value: true } } }));
if (directa.accion !== "ignorar") {
  ok(directa.tipo === "catalogo" && /oferta de noviembre/.test(directa.necesita ?? ""), "landing: llega como catálogo y con la oferta de noviembre");
  ok(/precio de noviembre/.test(directa.inversion ?? "") && /2\.200\.000/.test(directa.inversion ?? ""), "landing: la inversión trae el precio de noviembre (D-195)");
  ok(directa.whatsapp === "573105551234", "landing: el WhatsApp sale de la pregunta «whatsapp» de Cal.com");
  ok(/^sí, casilla en Cal\.com/.test(directa.autorizacion ?? ""), "landing: con casilla en Cal.com, esa es la constancia");
}
const sinCasilla = leerAviso(base({}, { additionalNotes: notasLp, responses: { attendeePhoneNumber: { value: "+573209998877" } } }));
if (sinCasilla.accion !== "ignorar") {
  ok(sinCasilla.whatsapp === "573209998877", "landing: sin pregunta propia, usa el teléfono del sistema de Cal.com");
  ok(/^acepté el aviso de datos al agendar/.test(sinCasilla.autorizacion ?? ""), "landing: sin casilla, queda la constancia del aviso de la landing");
}
const formGana = leerAviso(base({}, { responses: { whatsapp: { value: "+57 311 000 0000" } } }));
if (formGana.accion !== "ignorar") ok(formGana.whatsapp === "573001234567", "/agendar: el WhatsApp del formulario manda sobre el de Cal.com");
const meet = leerAviso(base({}, { metadata: {}, location: "https://meet.google.com/abc-defg-hij" }));
ok(meet.accion === "creada" && meet.enlaceLlamada === "https://meet.google.com/abc-defg-hij", "sin metadata: usa el enlace de Meet de location");
const raro = leerAviso(base({}, { metadata: { videoCallUrl: "https://evil.com/x" }, location: "Oficina" }));
ok(raro.accion === "creada" && raro.enlaceLlamada === null, "enlace de un sitio desconocido: se descarta (queda la página de la reserva)");
const rep = leerAviso(base({ triggerEvent: "BOOKING_RESCHEDULED" }, { uid: "NUEVOuid123456", rescheduleUid: "bFJeNb2uX8ANpT3JL5EfXw", startTime: "2026-11-20T15:00:00Z" }));
ok(rep.accion === "reprogramada" && rep.uid === "NUEVOuid123456" && rep.uidAnterior === "bFJeNb2uX8ANpT3JL5EfXw", "reprogramada: trae el uid nuevo y el anterior");
ok(leerAviso(base({ triggerEvent: "BOOKING_CANCELLED" })).accion === "cancelada", "cancelada");
ok(leerAviso(base({ triggerEvent: "BOOKING_REQUESTED" })).accion === "solicitada", "solicitud que hay que aceptar en Cal.com → solicitada");
ok(leerAviso(base({ triggerEvent: "BOOKING_REJECTED" })).accion === "rechazada", "rechazada en Cal.com → rechazada");
ok(leerAviso(base({ triggerEvent: "BOOKING_CREATED" }, { status: "PENDING" })).accion === "solicitada", "creada pero todavía en espera (status PENDING) → solicitada");
ok(leerAviso(base({ triggerEvent: "BOOKING_CREATED" }, { status: "ACCEPTED" })).accion === "creada", "creada y aceptada → creada");
ok(leerAviso({ triggerEvent: "PING", payload: {} }).accion === "ignorar" && leerAviso(base({ triggerEvent: "MEETING_ENDED" })).accion === "ignorar", "PING y otros eventos: se ignoran sin fallar");
ok(leerAviso(base({}, { uid: "x" })).accion === "ignorar" && leerAviso(base({}, { startTime: "no es fecha" })).accion === "ignorar", "uid o fecha inválidos: se ignora");
ok(leerAviso(null).accion === "ignorar" && leerAviso("texto").accion === "ignorar" && leerAviso([]).accion === "ignorar", "cuerpo que no es un objeto: se ignora");
const sinInvitado = leerAviso(base({}, { attendees: [] }));
ok(sinInvitado.accion === "creada" && sinInvitado.nombre === "Sin nombre" && sinInvitado.correo === null, "sin invitado: no falla (nombre 'Sin nombre')");
const mala = leerAviso(base({}, { attendees: [{ name: "A".repeat(500), email: "no-es-correo", timeZone: "x".repeat(200) }] }));
ok(mala.accion === "creada" && mala.nombre.length === 120 && mala.correo === null && (mala.zona?.length ?? 0) <= 60, "textos largos o correo malo: se acotan");

// ── En espera (D-144) ──
// 19 nov 2026, 9:00 p. m. en Bogotá = 20 nov 02:00 UTC: el "hoy" debe ser 19 nov (Bogotá), no 20 (UTC)
const noche = Date.parse("2026-11-20T02:00:00Z");
ok(plazoDesde(7, noche) === "2026-11-26" && plazoDesde(1, noche) === "2026-11-20", "plazo: se cuenta desde hoy en Bogotá (de noche no salta un día)");
ok(diasParaPlazo("2026-11-19", noche) === 0 && diasParaPlazo("2026-11-20", noche) === 1 && diasParaPlazo("2026-11-17", noche) === -2, "días para el plazo: hoy 0, mañana 1, ya pasó negativo");
ok(PLAZOS.at(-1)!.dias === 7 && plazoValido(7) && plazoValido(1) && !plazoValido(8) && !plazoValido(14) && !plazoValido(0) && !plazoValido("7"), "plazos: de 1 día a 1 semana, nada más");
const man = recordatorioEspera("Camilo", 1, "Quedó en confirmar con su socio");
const hoyR = recordatorioEspera("Camilo", 0, null);
ok(man?.tipo === "manana" && man.titulo.includes("Mañana se cumple el plazo de Camilo") && man.cuerpo.includes("Quedó en confirmar con su socio"), "recordatorio un día antes, con la última nota");
ok(hoyR?.tipo === "hoy" && hoyR.titulo.includes("Hoy toca escribirle a Camilo"), "recordatorio el día del plazo");
ok(recordatorioEspera("Camilo", 2, null) === null && recordatorioEspera("Camilo", -1, null) === null, "otros días no hay recordatorio");
const msg = mensajeSeguimiento({ nombre: "Camilo Andrés Casallas", tipo: "catalogo" }, "Sergio Cuevas");
ok(msg.startsWith("Hola Camilo, ¿cómo estás? Te saluda Sergio de Arata San.") && msg.includes("tu catálogo"), "mensaje de WhatsApp: primer nombre, quién escribe y qué necesita");
ok(mensajeSeguimiento({ nombre: "Sin nombre", tipo: null }, "").startsWith("Hola, ¿cómo estás? Te saludamos de Arata San.") && mensajeSeguimiento({ nombre: "Ana", tipo: null }, "Andrés").includes("lo que hablamos en la reunión"), "mensaje sin nombre ni tipo: no queda raro");
const base2 = { id: "x", nombre: "Camilo", correo: null, whatsapp: "573108150665", necesita: "Un catálogo o tienda", tipo: "catalogo", paginaWeb: null, cuando: null, inversion: null, inicio: "2026-11-19T21:00:00Z", fin: null, enlaceLlamada: null, enlaceReserva: null, estado: "espera", porAceptar: false, esperaHasta: "2026-11-26", clienteId: null, creado: "2026-11-19T18:00:00Z", cerradoEn: null } as const;
const conNotas: Interesado = { ...base2, notas: [{ texto: "Le escribí, dice que el lunes", quien: "Andrés", creado: "2026-11-24T15:00:00Z" }, { texto: "Quedó en confirmar", quien: "Sergio", creado: "2026-11-19T22:00:00Z" }] };
const pre = datosDeCliente(conNotas).notas;
ok(pre.includes("Seguimiento:") && pre.indexOf("Quedó en confirmar") < pre.indexOf("Le escribí"), "al confirmar, las notas pasan al cliente en orden (la primera arriba)");
ok(datosDeCliente({ ...base2, notas: [] }).notas.includes("Seguimiento") === false, "sin notas, no agrega 'Seguimiento'");

if (process.exitCode) console.log("HAY FALLAS");
