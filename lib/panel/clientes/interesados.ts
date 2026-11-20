// Interesados que agendan reunión por Cal.com (D-133). Tipos y funciones puras que usa la pantalla
// (sin node:crypto ni base de datos: este archivo también viaja al navegador).

export type EstadoInteresado = "agendada" | "espera" | "confirmada" | "cancelada" | "descartada" | "rechazada";

export type NotaInteresado = { texto: string; quien: string; creado: string };
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
  /** En espera (D-144): hasta qué día esperamos (YYYY-MM-DD, Bogotá). */
  esperaHasta: string | null;
  /** Notas del seguimiento, la más reciente primero. */
  notas: NotaInteresado[];
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
  const seguimiento = [...i.notas].reverse().map((n) => `· ${fechaNota(n.creado)}, ${n.quien}: ${n.texto}`);
  const notas = [
    i.necesita ? `Necesita: ${i.necesita}` : null,
    i.cuando ? `Cuándo empezar: ${i.cuando}` : null,
    i.inversion ? `Inversión: ${i.inversion}` : null,
    seguimiento.length ? `Seguimiento:\n${seguimiento.join("\n")}` : null,
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 2000);
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

/* ── En espera (D-144) ─────────────────────────────────────────────────── */

/** Cuánto tiempo pidió que esperáramos. Máximo una semana (decisión de Sergio). */
export const PLAZOS = [
  { dias: 1, texto: "1 día" },
  { dias: 2, texto: "2 días" },
  { dias: 3, texto: "3 días" },
  { dias: 4, texto: "4 días" },
  { dias: 5, texto: "5 días" },
  { dias: 7, texto: "1 semana" },
] as const;
export const plazoValido = (d: unknown) => PLAZOS.some((p) => p.dias === d);

/** Fecha de hoy en Bogotá (YYYY-MM-DD) para un instante dado. */
export const diaBogota = (ms: number) => new Date(ms).toLocaleDateString("en-CA", { timeZone: ZONA });

/** Fecha corta para notas y plazos: "jue 26 nov". */
export const fechaNota = (iso: string) => new Date(iso.length === 10 ? `${iso}T12:00:00-05:00` : iso).toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short", timeZone: ZONA });

/** Días que faltan para el plazo (0 = hoy, negativo = ya pasó). */
export function diasParaPlazo(esperaHasta: string, ahoraMs: number) {
  return Math.round((Date.parse(`${esperaHasta}T12:00:00Z`) - Date.parse(`${diaBogota(ahoraMs)}T12:00:00Z`)) / 86_400_000);
}

/** Fecha del plazo si hoy se ponen `dias` de espera. */
export function plazoDesde(dias: number, ahoraMs: number) {
  const hoy = Date.parse(`${diaBogota(ahoraMs)}T12:00:00Z`);
  return new Date(hoy + dias * 86_400_000).toISOString().slice(0, 10);
}

/** Recordatorio de las 8 a. m.: un día antes y el día del plazo. null si hoy no toca. */
export function recordatorioEspera(nombre: string, dias: number, nota: string | null): { tipo: "manana" | "hoy"; titulo: string; cuerpo: string } | null {
  if (dias !== 0 && dias !== 1) return null;
  const pila = nota ? `Quedó así: «${nota.length > 90 ? nota.slice(0, 89) + "…" : nota}». ` : "";
  return dias === 1
    ? { tipo: "manana", titulo: `⏰ Mañana se cumple el plazo de ${nombre}`, cuerpo: `${pila}Mañana toca escribirle.` }
    : { tipo: "hoy", titulo: `📲 Hoy toca escribirle a ${nombre}`, cuerpo: `${pila}Se cumplió el tiempo que pidió. Escríbele por WhatsApp desde el panel.` };
}

const QUE: Record<TipoInteres, string> = {
  pagina: "tu página web",
  catalogo: "tu catálogo",
  sistema: "tu sistema a la medida",
  auditoria: "la auditoría de tu página",
};

/** Mensaje de seguimiento para WhatsApp (o correo). `yo` = nombre de quien escribe. */
export function mensajeSeguimiento(i: Pick<Interesado, "nombre" | "tipo">, yo: string) {
  const nombre = i.nombre === "Sin nombre" ? "" : ` ${i.nombre.trim().split(/\s+/)[0]}`;
  const de = yo ? `Te saluda ${yo.trim().split(/\s+/)[0]} de Arata San. ` : "Te saludamos de Arata San. ";
  const que = i.tipo ? QUE[i.tipo] : "lo que hablamos en la reunión";
  return `Hola${nombre}, ¿cómo estás? ${de}Te escribo para saber qué decidiste sobre ${que}. Si te quedó alguna duda, con gusto te la resolvemos por aquí. ¡Quedamos atentos!`;
}

/** Donde se aceptan o rechazan las solicitudes en Cal.com. */
export const CAL_POR_ACEPTAR = "https://app.cal.com/bookings/unconfirmed";

export const etiquetaTipo: Record<TipoInteres, string> = {
  pagina: "Página",
  catalogo: "Catálogo",
  sistema: "Sistema",
  auditoria: "Auditoría",
};
