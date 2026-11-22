// Prospectos (D-171): negocios que Sellbird encontró y todavía no han agendado.
// Tipos y funciones puras: las usan la pantalla, las acciones del servidor y el importador
// (scripts/panel-importar-prospectos.ts). Sin base de datos: este archivo viaja al navegador.

export const RUBROS = {
  odontologia: "Odontología",
  ropa: "Ropa",
  ferreteria: "Ferretería",
  repuestos: "Repuestos",
  electrodomesticos: "Electrodomésticos",
  panaderia: "Panadería",
  otro: "Otro",
} as const;
export type Rubro = keyof typeof RUBROS;

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
  [/bakery|pastry|panader|pasteler/i, "panaderia"],
];

/** Qué paquete le sirve según el rubro: las tiendas venden por WhatsApp; consultorios y panaderías necesitan página. */
const SERVICIO_DE: Record<Rubro, ServicioSugerido | null> = {
  odontologia: "pagina",
  panaderia: "pagina",
  ropa: "catalogo",
  ferreteria: "catalogo",
  repuestos: "catalogo",
  electrodomesticos: "catalogo",
  otro: null,
};

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
  [/panader|pasteler/i, "panaderia"],
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

/**
 * Por qué tiene esa prioridad. Suma: sin página propia (+3), negocio activo por reseñas
 * (50 o más +2, 10 o más +1), buena calificación (4,3 o más +1) y empresa con NIT (+1,
 * el contacto más seguro según la Ley 1581). Alta desde 5 puntos, media desde 3.
 */
export function razonesDe(p: Pick<Prospecto, "pagina" | "resenas" | "calificacion" | "titular">): Razon[] {
  const r: Razon[] = [];
  if (p.pagina === "sin_pagina") r.push({ texto: "No tiene página", puntos: 3 });
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

export function puntuar(p: Pick<Prospecto, "pagina" | "resenas" | "calificacion" | "titular">) {
  const puntos = razonesDe(p).reduce((a, x) => a + x.puntos, 0);
  return { puntos, prioridad: prioridadDe(puntos) };
}

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
    servicio: SERVICIO_DE[rubro],
    pagina,
    sitioWeb: sitio,
    telefono: telefono && /^[0-9]{7,15}$/.test(telefono) ? telefono : null,
    tipoTelefono: tipoTelefonoDe(telefono),
    ciudad: f.ciudad?.trim().slice(0, 120) || null,
    enlaceMaps: f.enlaceMaps && /^https:\/\//.test(f.enlaceMaps) ? f.enlaceMaps.slice(0, 400) : null,
    resenas,
    calificacion: cal,
    titular,
    prioridad,
    puntos,
  };
}

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
