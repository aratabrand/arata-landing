// Prospectos (D-173): negocios que Sellbird encontró y todavía no han agendado.
// Tipos y funciones puras: las usan la pantalla, las acciones del servidor y el importador
// (scripts/panel-importar-prospectos.ts) y «Buscar más prospectos» (D-179). Sin base de datos: viaja al navegador.

import { NICHO, NICHOS, type Enfoque, type Nicho } from "./nichos";

/** Rubro = clave del nicho (lib/panel/clientes/nichos.ts) u «otro». */
export const RUBROS: Record<string, string> = { ...Object.fromEntries(NICHOS.map((n) => [n.clave, n.nombre])), otro: "Otro" };
export type Rubro = string;

export const SERVICIOS = {
  pagina: "Página Lista en 5 Días",
  catalogo: "Tienda por WhatsApp en 5 Días",
  sistema: "Tu Negocio en Orden",
} as const;
export type ServicioSugerido = keyof typeof SERVICIOS;

export const PAGINAS = {
  sin_pagina: "Sin página",
  solo_redes: "Solo redes o Linktree",
  tiene_pagina: "Tiene página",
} as const;
export type EstadoPagina = keyof typeof PAGINAS;

export const TITULARES = {
  empresa: "Empresa",
  persona_natural: "Persona natural",
  por_verificar: "Por verificar",
} as const;
export type Titular = keyof typeof TITULARES;

export const PRIORIDADES = { alta: "Alta", media: "Media", baja: "Baja" } as const;
export type Prioridad = keyof typeof PRIORIDADES;

export const ESTADOS_PROSPECTO = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  respondio: "Respondió",
  agendo: "Agendó",
  no_interesa: "No le interesa",
  no_contactar: "No contactar",
} as const;
export type EstadoProspecto = keyof typeof ESTADOS_PROSPECTO;

export type TipoTelefono = "celular" | "fijo" | "otro";

export type Prospecto = {
  id: string;
  nombre: string;
  rubro: Rubro;
  /** Categoría tal como la trae Google Maps. */
  categoria: string | null;
  servicio: ServicioSugerido | null;
  pagina: EstadoPagina;
  sitioWeb: string | null;
  /** Solo números, con indicativo (573001234567). */
  telefono: string | null;
  tipoTelefono: TipoTelefono | null;
  ciudad: string | null;
  enlaceMaps: string | null;
  resenas: number;
  calificacion: number | null;
  titular: Titular;
  /** Con qué ojos se puntúa: ya vende por internet (D-179) o necesita página (D-173). */
  enfoque: Enfoque;
  prioridad: Prioridad;
  puntos: number;
  estado: EstadoProspecto;
  notas: string | null;
  interesadoId: string | null;
  creado: string;
};

/* ── Clasificación ─────────────────────────────────────────────────────── */

// Categoría de Google Maps (en inglés, como la entrega Scavio) → rubro de Arata
const RUBRO_DE: [RegExp, Rubro][] = [
  [/dent|orthodont|endodont|periodont|odont/i, "odontologia"],
  [/cloth|ropa|boutique|fashion/i, "ropa"],
  [/hardware|tool|ferreter/i, "ferreteria"],
  [/auto|car |motorcycle|battery|repuesto/i, "repuestos"],
  [/appliance|electronic|electrodom|computer|home goods/i, "electrodomesticos"],
];

/** Qué paquete le sirve según el rubro (sale del nicho): las tiendas venden por WhatsApp; consultorios necesitan página. */
const servicioDe = (rubro: Rubro): ServicioSugerido | null => NICHO[rubro]?.servicio ?? null;

// Un perfil de redes no es una página propia
// (también marketplaces como Rappi o Mercado Libre, directorios y enlaces de WhatsApp como wa.link)
const REDES = /(instagram|facebook|linktr\.ee|wa\.me|wa\.link|whatsapp|tiktok|beacons|taplink|business\.site|negocio\.site|mercadolibre|rappi|paginasamarillas)/i;
// S.A.S., Ltda., S.A., S. en C., & Cía.: tiene NIT
const EMPRESA = /\b(s\.?\s?a\.?\s?s|ltda|s\.?\s?a|s\.?\s?en\s?c|cia|cía)\b\.?/i;
// "Dra. Luz Orozco", "Dr. Pérez": consultorio a nombre de una persona
const PERSONA = /^(dr|dra|od|odont[oó]log[oa])\.?\s+[a-záéíóúñ]/i;

// Si el nombre lo dice claro ("Depósito y Ferretería…"), manda sobre la categoría de Google ("Home goods store")
const RUBRO_POR_NOMBRE: [RegExp, Rubro][] = [
  [/ferreter/i, "ferreteria"],
  [/odontol|dental|dentist|ortodonc/i, "odontologia"],
  [/repuesto|autoparte/i, "repuestos"],
];

export const rubroDe = (categoria: string | null | undefined, nombre = ""): Rubro =>
  RUBRO_POR_NOMBRE.find(([re]) => re.test(nombre))?.[1] ?? RUBRO_DE.find(([re]) => re.test(categoria ?? ""))?.[1] ?? "otro";

export function paginaDe(sitio: string | null | undefined): EstadoPagina {
  if (!sitio?.trim()) return "sin_pagina";
  return REDES.test(sitio) ? "solo_redes" : "tiene_pagina";
}

export function titularDe(nombre: string): Titular {
  if (EMPRESA.test(nombre)) return "empresa";
  if (PERSONA.test(nombre.trim())) return "persona_natural";
  return "por_verificar";
}

/** Celular colombiano (57 3xx), fijo (57 60x, o el formato viejo de Bogotá 57 1 xxx xxxx) u otro. */
export function tipoTelefonoDe(digitos: string | null | undefined): TipoTelefono | null {
  const d = (digitos ?? "").replace(/\D/g, "");
  if (!d) return null;
  if (/^573\d{9}$/.test(d)) return "celular";
  if (/^5760\d{8}$/.test(d) || /^571\d{7}$/.test(d)) return "fijo";
  return "otro";
}

export type Razon = { texto: string; puntos: number };
type ParaPuntuar = Pick<Prospecto, "pagina" | "resenas" | "calificacion" | "titular"> & Partial<Pick<Prospecto, "enfoque" | "tipoTelefono">>;

/** Una cadena grande (Puppis, Crepes…) ya tiene su sistema: no es para nosotros. */
const esCadena = (p: ParaPuntuar) => p.pagina === "tiene_pagina" && p.resenas >= 1000;

/**
 * Por qué tiene esa prioridad. Alta desde 5 puntos, media desde 3.
 *
 * Enfoque «necesita página» (D-173): sin página propia (+3), negocio activo por reseñas
 * (50 o más +2, 10 o más +1), buena calificación (4,3 o más +1) y empresa con NIT (+1,
 * el contacto más seguro según la Ley 1581). Máximo 7.
 *
 * Enfoque «ya vende por internet» (D-179): vende por redes o WhatsApp sin sistema propio (+3)
 * o tiene página a la que le falta el sistema (+2), tiene celular para WhatsApp (+1), y las mismas
 * reseñas, calificación y empresa. Una cadena grande (página y 1.000 reseñas o más) resta 2. Máximo 8.
 */
export function razonesDe(p: ParaPuntuar): Razon[] {
  const r: Razon[] = [];
  if (p.enfoque === "ya_vende") {
    if (p.pagina === "solo_redes") r.push({ texto: "Vende por redes o WhatsApp, sin sistema propio", puntos: 3 });
    else if (esCadena(p)) r.push({ texto: "Parece una cadena grande: página propia y más de 1.000 reseñas", puntos: -2 });
    else if (p.pagina === "tiene_pagina") r.push({ texto: "Ya tiene página: le falta el sistema para vender en orden", puntos: 2 });
    if (p.tipoTelefono === "celular") r.push({ texto: "Tiene celular: se le puede escribir por WhatsApp", puntos: 1 });
  } else if (p.pagina === "sin_pagina") r.push({ texto: "No tiene página", puntos: 3 });
  else if (p.pagina === "solo_redes") r.push({ texto: "Solo tiene redes, no página propia", puntos: 3 });
  if (p.resenas >= 50) r.push({ texto: `Negocio activo: ${p.resenas.toLocaleString("es-CO")} reseñas`, puntos: 2 });
  else if (p.resenas >= 10) r.push({ texto: `Tiene clientes: ${p.resenas} reseñas`, puntos: 1 });
  if ((p.calificacion ?? 0) >= 4.3) r.push({ texto: `Buena calificación: ${String(p.calificacion).replace(".", ",")} ★`, puntos: 1 });
  if (p.titular === "empresa") r.push({ texto: "Es empresa con NIT: el contacto más seguro", puntos: 1 });
  return r;
}

export function prioridadDe(puntos: number): Prioridad {
  return puntos >= 5 ? "alta" : puntos >= 3 ? "media" : "baja";
}

export function puntuar(p: ParaPuntuar) {
  const puntos = Math.max(0, razonesDe(p).reduce((a, x) => a + x.puntos, 0));
  return { puntos, prioridad: prioridadDe(puntos) };
}

/** Puntaje máximo de cada enfoque (para mostrar «5 de 8»). */
export const maxPuntos = (enfoque: Enfoque) => (enfoque === "ya_vende" ? 8 : 7);

/** Lo que trae Sellbird de cada negocio (una fila del CSV de importación). */
export type FilaSellbird = {
  fuenteId: string;
  nombre: string;
  categoria?: string | null;
  sitio?: string | null;
  telefono?: string | null;
  ciudad?: string | null;
  enlaceMaps?: string | null;
  resenas?: number | null;
  calificacion?: number | null;
};

/** De una fila de Sellbird a un prospecto listo para guardar (sin id ni estado). */
export function clasificar(f: FilaSellbird) {
  const nombre = f.nombre.trim().replace(/\s+/g, " ").slice(0, 160);
  const rubro = rubroDe(f.categoria, nombre);
  const enlace = f.sitio?.trim() && /^https?:\/\//i.test(f.sitio.trim()) ? f.sitio.trim() : null;
  // Cuenta para saber si tiene página, pero un enlace de más de 300 caracteres no se guarda (cortado quedaría roto)
  const pagina = paginaDe(enlace);
  const sitio = enlace && enlace.length <= 300 ? enlace : null;
  const telefono = (f.telefono ?? "").replace(/\D/g, "") || null;
  const resenas = Math.max(0, Math.round(Number(f.resenas) || 0));
  const cal = f.calificacion === null || f.calificacion === undefined || !Number.isFinite(Number(f.calificacion)) ? null : Math.min(5, Math.max(0, Number(f.calificacion)));
  const titular = titularDe(nombre);
  const { puntos, prioridad } = puntuar({ pagina, resenas, calificacion: cal, titular });
  return {
    fuenteId: f.fuenteId,
    nombre,
    rubro,
    categoria: f.categoria?.trim().slice(0, 120) || null,
    servicio: servicioDe(rubro),
    pagina,
    sitioWeb: sitio,
    telefono: telefono && /^[0-9]{7,15}$/.test(telefono) ? telefono : null,
    tipoTelefono: tipoTelefonoDe(telefono),
    ciudad: f.ciudad?.trim().slice(0, 120) || null,
    enlaceMaps: f.enlaceMaps && /^https:\/\//.test(f.enlaceMaps) ? f.enlaceMaps.slice(0, 400) : null,
    resenas,
    calificacion: cal,
    titular,
    enfoque: "sin_pagina" as Enfoque,
    prioridad,
    puntos,
  };
}

/**
 * Teléfono como lo muestra Google Maps en Colombia → solo números con el 57.
 * "311 4485245" → 573114485245 · "(601) 6408571" → 576016408571 · "16604340" (fijo viejo de Bogotá) → 5716604340.
 */
export function normalizarTelefono(texto: string | null | undefined): string | null {
  const d = (texto ?? "").replace(/\D/g, "");
  if (!d) return null;
  if (/^57\d{8,10}$/.test(d)) return d;
  if (/^3\d{9}$/.test(d) || /^60\d{8}$/.test(d)) return `57${d}`;
  if (/^[1-8]\d{7}$/.test(d)) return `57${d}`;
  return /^[0-9]{7,15}$/.test(d) ? d : null;
}

/** Ciudad desde la dirección de Google ("Cra. 44a #24 - 11, Teusaquillo, Bogotá, Cundinamarca" → "Bogotá"). */
export function ciudadDe(direccion: string | null | undefined): string | null {
  const t = (direccion ?? "").trim();
  if (!t) return null;
  if (/bogot[aá]/i.test(t)) return "Bogotá";
  const partes = t.split(",").map((x) => x.trim()).filter(Boolean);
  return partes.length >= 2 ? partes[partes.length - 2].slice(0, 120) : null;
}

/** Un negocio tal como lo entrega Google Maps por Scavio (solo los campos que usamos). */
export type FilaMaps = {
  place_id?: string;
  title?: string;
  type?: string;
  types?: string[];
  website?: string;
  phone?: string;
  rating?: number;
  reviews?: number;
  address?: string;
};

/**
 * De un resultado de Google Maps a un prospecto del nicho buscado (D-179).
 * `delNicho` = la categoría o el nombre confirman el nicho; si no, se descarta como «No es del nicho».
 */
export function clasificarMaps(f: FilaMaps, nicho: Nicho, enfoque: Enfoque = nicho.enfoque) {
  const placeId = String(f.place_id ?? "").trim();
  const nombre = String(f.title ?? "").trim();
  if (!placeId || !nombre) return null;
  const categoria = (f.type || f.types?.[0] || "").trim() || null;
  const base = clasificar({
    fuenteId: `gmaps:${placeId}`.slice(0, 200),
    nombre,
    categoria,
    sitio: f.website ?? null,
    telefono: normalizarTelefono(f.phone),
    ciudad: ciudadDe(f.address),
    enlaceMaps: `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(placeId)}`,
    resenas: typeof f.reviews === "number" ? f.reviews : null,
    calificacion: typeof f.rating === "number" ? f.rating : null,
  });
  const delNicho = nicho.categorias.test([categoria, ...(f.types ?? []), nombre].filter(Boolean).join(" "));
  const { puntos, prioridad } = puntuar({ ...base, enfoque });
  return { ...base, rubro: nicho.clave, servicio: nicho.servicio, enfoque, puntos, prioridad, delNicho };
}
export type ProspectoMaps = NonNullable<ReturnType<typeof clasificarMaps>>;

/** "+57 313 866 4158" o "+57 601 234 5678" para mostrar. */
export function telefonoTexto(digitos: string | null) {
  if (!digitos) return "";
  const m = digitos.match(/^57(\d{3})(\d{3})(\d{4})$/);
  if (m) return `+57 ${m[1]} ${m[2]} ${m[3]}`;
  const viejo = digitos.match(/^571(\d{3})(\d{4})$/);
  return viejo ? `+57 1 ${viejo[1]} ${viejo[2]}` : `+${digitos}`;
}

/** Consulta de la empresa en el RUES (Cámara de Comercio) para confirmar si es empresa o persona natural. */
export const RUES = "https://www.rues.org.co/";

/* ── Mensaje de WhatsApp (D-174, versión B aprobada por Sergio) ───────── */

/** Código corto del prospecto para el enlace de agenda (10 letras del id): ?p=8f3a1c… */
export const codigoDe = (id: string) => id.replace(/-/g, "").slice(0, 10).toLowerCase();
export const CODIGO = /^[0-9a-f]{10}$/;

/** "Dentica Dental Clinic Bogotá - Dental Anxiety Specialists" → "Dentica Dental Clinic Bogotá". */
export function nombreCorto(nombre: string) {
  const corto = nombre.split(/\s+[-|–]\s+/)[0].trim();
  return corto.length >= 3 ? corto : nombre.trim();
}

/** Número para wa.me: solo celulares colombianos (un fijo no tiene WhatsApp). null si no se puede escribir. */
export function whatsappDe(p: Pick<Prospecto, "telefono">): string | null {
  const d = (p.telefono ?? "").replace(/\D/g, "");
  if (/^573\d{9}$/.test(d)) return d;
  if (/^3\d{9}$/.test(d)) return `57${d}`; // celular guardado sin el 57
  return null;
}

/** Buenos días / Buenas tardes / Buenas noches según la hora de Bogotá. */
export function saludoDe(ahoraMs: number) {
  const h = Number(new Date(ahoraMs).toLocaleString("en-US", { hour: "numeric", hourCycle: "h23", timeZone: "America/Bogota" }));
  return h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
}

/** Enlace de agenda con el tipo ya elegido y el código del prospecto (para saber que agendó desde el mensaje). */
export function enlaceAgenda(p: Pick<Prospecto, "id" | "pagina" | "servicio">, sitio = "https://aratasan.com") {
  const tipo = p.pagina === "tiene_pagina" ? "auditoria" : p.servicio;
  return `${sitio}/agendar?${tipo ? `tipo=${tipo}&` : ""}p=${codigoDe(p.id)}`;
}

/**
 * Primer mensaje (versión B, con usted). Lleva lo que pide la Ley 1581: quién escribe,
 * de dónde salió el número, qué ofrecemos y cómo pedir que no le escribamos más.
 * `yo` = nombre de quien está en sesión (firma el mensaje).
 */
export function mensajeProspecto(p: Pick<Prospecto, "id" | "nombre" | "rubro" | "pagina" | "servicio">, yo: string, ahoraMs: number) {
  const quien = yo.trim() ? `Le escribe ${yo.trim().split(/\s+/)[0]}, de Arata San` : "Le escribimos de Arata San";
  const negocio = nombreCorto(p.nombre);
  const visto =
    p.pagina === "sin_pagina"
      ? "vimos que todavía no tienen página"
      : p.pagina === "solo_redes"
        ? "vimos que tienen redes pero no una página propia"
        : "revisamos su página";
  let oferta: string;
  let pregunta = "¿Le gustaría que le mostremos cómo se vería la suya?";
  if (p.pagina === "tiene_pagina") {
    oferta = "Le revisamos sin costo qué tan rápido abre en el celular y qué la está frenando para que le escriban más.";
    pregunta = "¿Le gustaría recibir esa revisión?";
  } else if (p.servicio === "sistema") {
    // Nichos de reservas y pedidos (D-179, aprobado por Sergio el 23 nov 2026)
    oferta = "Hacemos sistemas para que sus clientes aparten su cita o hagan su pedido solos, y usted lleve el orden en un solo lugar. Queda listo según lo que necesite.";
    pregunta = "¿Le gustaría que le mostremos cómo funcionaría en su negocio?";
  } else if (p.servicio === "catalogo") {
    oferta = "Hacemos catálogos para vender por WhatsApp: sus clientes ven los productos, arman el pedido y le llega ordenado a su WhatsApp. Queda listo en 5 días.";
    pregunta = "¿Le gustaría que le mostremos cómo se vería el suyo?";
  } else if (p.rubro === "odontologia") {
    oferta = "Hacemos páginas para consultorios donde los pacientes apartan su cita solos. Queda lista en 5 días.";
  } else {
    oferta = "Hacemos páginas claras para el celular, para que lo encuentren en Google y le escriban. Queda lista en 5 días.";
  }
  return [
    `${saludoDe(ahoraMs)}. ${quien}, una agencia de Bogotá. Encontramos ${negocio} en Google Maps y ${visto}.`,
    oferta,
    `${pregunta} Puede agendar 30 minutos sin costo: ${enlaceAgenda(p)}`,
    "",
    "Si no desea que le escribamos, responda NO y no volveremos a contactarle.",
  ].join("\n");
}
