// Nichos y zonas para «Buscar más prospectos» (D-179). Sin base de datos: viaja al navegador.
//
// Cada búsqueda en Google Maps (Scavio) cuesta 1 crédito y trae hasta 20 negocios. Los créditos
// se ahorran eligiendo bien QUÉ se busca (nicho) y DÓNDE (zona), y sin repetir una búsqueda ya hecha;
// los filtros de calificación, reseñas o página solo deciden qué se guarda (Google no los aplica antes).

import type { EstadoPagina, ServicioSugerido } from "./prospectos";

/**
 * Enfoque de la prioridad:
 * - `ya_vende`: el negocio ya vende por internet (redes, WhatsApp o página) y le falta orden:
 *   catálogo con pedidos, inventario, reservas. Es el enfoque de las búsquedas nuevas (nov 2026).
 * - `sin_pagina`: el negocio no tiene página propia (el enfoque de la primera carga, D-173).
 */
export const ENFOQUES = {
  ya_vende: "Ya vende por internet",
  sin_pagina: "Necesita página",
} as const;
export type Enfoque = keyof typeof ENFOQUES;

export type Nicho = {
  clave: string;
  nombre: string;
  /** Lo que se escribe en Google Maps. */
  busqueda: string;
  servicio: ServicioSugerido;
  enfoque: Enfoque;
  /** Categoría de Google (en español o inglés) o nombre que confirma que el negocio es del nicho. */
  categorias: RegExp;
  /** Por qué vale la pena: demanda y cómo vende hoy. */
  porque: string;
  /** Primera ronda sugerida para gastar pocos créditos. */
  recomendado?: boolean;
};

// Orden: primero los recomendados (alta demanda y ya venden por redes o WhatsApp)
export const NICHOS: Nicho[] = [
  {
    clave: "mascotas",
    nombre: "Tiendas de mascotas",
    busqueda: "tienda de mascotas",
    servicio: "catalogo",
    enfoque: "ya_vende",
    categorias: /mascota|pet|animal|concentrado/i,
    porque: "Compra que se repite cada mes (comida, arena) y piden por WhatsApp: el catálogo con pedido ordenado les ahorra horas.",
    recomendado: true,
  },
  {
    clave: "cosmeticos",
    nombre: "Cosméticos y maquillaje",
    busqueda: "tienda de cosméticos y maquillaje",
    servicio: "catalogo",
    enfoque: "ya_vende",
    categorias: /cosm[eé]t|maquill|perfum|skin|belleza|beauty|makeup/i,
    porque: "Venden casi todo por Instagram con muchas referencias: necesitan catálogo e inventario para no perder pedidos.",
    recomendado: true,
  },
  {
    clave: "reposteria",
    nombre: "Repostería y tortas por encargo",
    busqueda: "repostería tortas por encargo",
    servicio: "catalogo",
    enfoque: "ya_vende",
    categorias: /reposter|pasteler|postre|torta|cake|dessert|bakery|panader|galleta|cupcake/i,
    porque: "Venden por Instagram y WhatsApp con fecha de entrega: un catálogo con pedidos por día evita cruces.",
    recomendado: true,
  },
  {
    clave: "detalles",
    nombre: "Flores, detalles y regalos",
    busqueda: "floristería detalles y desayunos sorpresa",
    servicio: "catalogo",
    enfoque: "ya_vende",
    categorias: /flor|florist|regalo|detalle|gift|desayuno|ancheta/i,
    porque: "Picos fuertes (amor y amistad, madres, Navidad) y todo entra por WhatsApp: catálogo y pedidos con fecha.",
    recomendado: true,
  },
  {
    clave: "barberias",
    nombre: "Barberías",
    busqueda: "barbería",
    servicio: "sistema",
    enfoque: "ya_vende",
    categorias: /barber/i,
    porque: "Agendan por WhatsApp e Instagram y pierden citas: reservas en línea y registro de clientes.",
    recomendado: true,
  },
  {
    clave: "unas",
    nombre: "Uñas, cejas y pestañas",
    busqueda: "salón de uñas y pestañas",
    servicio: "sistema",
    enfoque: "ya_vende",
    categorias: /u[ñn]as|nail|pesta[ñn]|ceja|lash|brow|manicur|sal[oó]n|belleza|beauty|est[eé]tica/i,
    porque: "Viven de Instagram y de la agenda: reservas solas, recordatorios y clientes que vuelven.",
    recomendado: true,
  },
  {
    clave: "ropa",
    nombre: "Ropa y boutiques",
    busqueda: "tienda de ropa boutique",
    servicio: "catalogo",
    enfoque: "ya_vende",
    categorias: /ropa|cloth|boutique|fashion|moda|vestido|lencer/i,
    porque: "Moda es de lo más vendido por redes en Colombia: tallas y colores piden catálogo e inventario.",
  },
  {
    clave: "joyeria",
    nombre: "Joyería y accesorios",
    busqueda: "joyería y accesorios",
    servicio: "catalogo",
    enfoque: "ya_vende",
    categorias: /joy|bisuter|accesorio|jewel|relojer|plata/i,
    porque: "Producto pequeño y de buen margen que se vende por fotos en Instagram.",
  },
  {
    clave: "suplementos",
    nombre: "Suplementos y nutrición deportiva",
    busqueda: "tienda de suplementos deportivos",
    servicio: "catalogo",
    enfoque: "ya_vende",
    categorias: /suplement|nutri|naturista|vitamin|prote[ií]na|supplement/i,
    porque: "Clientes que recompran cada mes y preguntan precios por WhatsApp.",
  },
  {
    clave: "tecnologia",
    nombre: "Celulares y accesorios",
    busqueda: "tienda de celulares y accesorios",
    servicio: "catalogo",
    enfoque: "ya_vende",
    categorias: /celular|tecnolog|m[oó]vil|phone|cell|electr[oó]nic|computador|accesorio/i,
    porque: "Tecnología es la categoría que más se vende en línea en Colombia (cerca del 20 %).",
  },
  {
    clave: "calzado",
    nombre: "Calzado",
    busqueda: "tienda de zapatos y tenis",
    servicio: "catalogo",
    enfoque: "ya_vende",
    categorias: /zapat|calzado|tenis|shoe|sneaker/i,
    porque: "Muchas tallas y referencias: el inventario es su dolor de cabeza.",
  },
  {
    clave: "licoreras",
    nombre: "Licoreras con domicilio",
    busqueda: "licorera domicilio",
    servicio: "catalogo",
    enfoque: "ya_vende",
    categorias: /licor|vino|cervez|liquor|wine|beer|bebida/i,
    porque: "Pedidos rápidos por WhatsApp los fines de semana: catálogo y pedido ordenado.",
  },
  {
    clave: "spa",
    nombre: "Estética y spa",
    busqueda: "centro de estética y spa",
    servicio: "sistema",
    enfoque: "ya_vende",
    categorias: /spa|est[eé]tic|depil|masaj|facial|aesthetic|massage/i,
    porque: "Venden paquetes de sesiones: necesitan agenda y control de sesiones por cliente.",
  },
  {
    clave: "gimnasios",
    nombre: "Gimnasios y estudios",
    busqueda: "gimnasio estudio de pilates",
    servicio: "sistema",
    enfoque: "ya_vende",
    categorias: /gimnas|gym|pilates|yoga|crossfit|fitness|entrenamiento|box/i,
    porque: "Membresías y clases con cupo: reservas y control de pagos.",
  },
  {
    clave: "veterinarias",
    nombre: "Veterinarias",
    busqueda: "veterinaria",
    servicio: "sistema",
    enfoque: "ya_vende",
    categorias: /veterin|vet|animal/i,
    porque: "Citas, historial de cada mascota y recordatorios de vacunas.",
  },
  {
    clave: "restaurantes",
    nombre: "Restaurantes con domicilio",
    busqueda: "restaurante con domicilio",
    servicio: "sistema",
    enfoque: "ya_vende",
    categorias: /restaur|comida|pizz|hambur|asadero|cafeter|food|almuerzo|parrilla|sushi|wok/i,
    porque: "Menú digital y pedidos propios para no pagar comisión a las apps.",
  },
  // Rubros de la primera carga (D-173): enfoque «necesita página»
  {
    clave: "odontologia",
    nombre: "Odontología",
    busqueda: "consultorio odontológico",
    servicio: "pagina",
    enfoque: "sin_pagina",
    categorias: /dent|odont|ortodonc|orthodont|endodont|periodont/i,
    porque: "Pacientes que buscan en Google: página con reservas de citas.",
  },
  {
    clave: "panaderia",
    nombre: "Panaderías",
    busqueda: "panadería",
    servicio: "pagina",
    enfoque: "sin_pagina",
    categorias: /panader|pasteler|bakery|pastry/i,
    porque: "Negocio de barrio que aparece en Google Maps pero sin página.",
  },
  {
    clave: "ferreteria",
    nombre: "Ferreterías",
    busqueda: "ferretería",
    servicio: "catalogo",
    enfoque: "sin_pagina",
    categorias: /ferreter|hardware|tool|herramient/i,
    porque: "Miles de referencias y pedidos por teléfono.",
  },
  {
    clave: "repuestos",
    nombre: "Repuestos",
    busqueda: "repuestos para carros y motos",
    servicio: "catalogo",
    enfoque: "sin_pagina",
    categorias: /repuesto|autoparte|auto|moto|bater[ií]a|car |motorcycle|lubric/i,
    porque: "Preguntan por referencia y disponibilidad: catálogo con inventario.",
  },
  {
    clave: "electrodomesticos",
    nombre: "Electrodomésticos",
    busqueda: "tienda de electrodomésticos",
    servicio: "catalogo",
    enfoque: "sin_pagina",
    categorias: /electrodom|appliance|electr[oó]nic|hogar|home goods/i,
    porque: "Compras grandes que se cotizan por WhatsApp.",
  },
];

export const NICHO = Object.fromEntries(NICHOS.map((n) => [n.clave, n])) as Record<string, Nicho>;
export const nombreNicho = (clave: string) => NICHO[clave]?.nombre ?? "Otro";

/** Zonas de Bogotá: el centro del mapa (@lat,lng,zoom) que manda en dónde busca Google Maps. */
export type Zona = { clave: string; nombre: string; ll: string };
export const ZONAS: Zona[] = [
  { clave: "chapinero", nombre: "Chapinero", ll: "@4.6486,-74.0628,14z" },
  { clave: "usaquen", nombre: "Usaquén", ll: "@4.6950,-74.0310,14z" },
  { clave: "suba", nombre: "Suba", ll: "@4.7400,-74.0830,14z" },
  { clave: "barrios_unidos", nombre: "Barrios Unidos", ll: "@4.6680,-74.0750,14z" },
  { clave: "teusaquillo", nombre: "Teusaquillo", ll: "@4.6350,-74.0850,14z" },
  { clave: "engativa", nombre: "Engativá", ll: "@4.7050,-74.1150,14z" },
  { clave: "fontibon", nombre: "Fontibón", ll: "@4.6750,-74.1450,14z" },
  { clave: "kennedy", nombre: "Kennedy", ll: "@4.6300,-74.1500,14z" },
  { clave: "puente_aranda", nombre: "Puente Aranda", ll: "@4.6150,-74.1150,14z" },
  { clave: "centro", nombre: "Centro (Santa Fe y La Candelaria)", ll: "@4.6050,-74.0700,14z" },
  { clave: "restrepo", nombre: "Restrepo y el sur", ll: "@4.5850,-74.1000,14z" },
  { clave: "bosa", nombre: "Bosa", ll: "@4.6150,-74.1900,14z" },
  { clave: "bogota", nombre: "Toda Bogotá", ll: "@4.6533,-74.0836,12z" },
];
export const ZONA = Object.fromEntries(ZONAS.map((z) => [z.clave, z])) as Record<string, Zona>;

/** Google Maps entrega 20 por página: una página = 1 crédito. Más de 3 seguidas casi no trae negocios nuevos. */
export const POR_PAGINA_MAPS = 20;
export const MAX_PAGINAS = 3;
/** Una búsqueda igual (nicho + zona + página) hecha en estos días no se vuelve a pagar, salvo que se pida. */
export const DIAS_SIN_REPETIR = 90;

/** Qué se guarda de lo que trae Google (los demás quedan en la búsqueda y se pueden recuperar sin gastar). */
export type Filtros = {
  /** 0 = sin mínimo. */
  calificacionMin: number;
  resenasMin: number;
  paginas: EstadoPagina[];
  soloCelular: boolean;
  prioridadMin: "alta" | "media" | "baja";
};
export const FILTROS_INICIALES: Filtros = { calificacionMin: 0, resenasMin: 0, paginas: ["sin_pagina", "solo_redes", "tiene_pagina"], soloCelular: false, prioridadMin: "baja" };

export type MotivoDescarte = "fuera_del_nicho" | "calificacion" | "resenas" | "pagina" | "sin_celular" | "prioridad";
export const MOTIVOS: Record<MotivoDescarte, string> = {
  fuera_del_nicho: "No es del nicho",
  calificacion: "Calificación baja",
  resenas: "Pocas reseñas",
  pagina: "Página distinta a la pedida",
  sin_celular: "Sin celular",
  prioridad: "Prioridad baja",
};

const ORDEN_PRIORIDAD = { baja: 0, media: 1, alta: 2 } as const;

/** Limpia los filtros que llegan del navegador (nunca se confía en ellos). */
export function filtrosValidos(f: Partial<Filtros> | null | undefined): Filtros {
  const n = (v: unknown, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(Number(v)) ? Number(v) : min));
  const paginas = (Array.isArray(f?.paginas) ? f.paginas : FILTROS_INICIALES.paginas).filter((p): p is EstadoPagina => p === "sin_pagina" || p === "solo_redes" || p === "tiene_pagina");
  return {
    calificacionMin: Math.round(n(f?.calificacionMin, 0, 5) * 10) / 10,
    resenasMin: Math.round(n(f?.resenasMin, 0, 100_000)),
    paginas: paginas.length ? [...new Set(paginas)] : FILTROS_INICIALES.paginas,
    soloCelular: f?.soloCelular === true,
    prioridadMin: f?.prioridadMin === "alta" || f?.prioridadMin === "media" ? f.prioridadMin : "baja",
  };
}

/** Por qué un negocio que trajo Google no se guarda (null = se guarda). */
export function motivoDescarte(
  p: { delNicho: boolean; calificacion: number | null; resenas: number; pagina: EstadoPagina; tipoTelefono: string | null; prioridad: "alta" | "media" | "baja" },
  f: Filtros
): MotivoDescarte | null {
  if (!p.delNicho) return "fuera_del_nicho";
  if (f.calificacionMin > 0 && (p.calificacion ?? 0) < f.calificacionMin) return "calificacion";
  if (f.resenasMin > 0 && p.resenas < f.resenasMin) return "resenas";
  if (!f.paginas.includes(p.pagina)) return "pagina";
  if (f.soloCelular && p.tipoTelefono !== "celular") return "sin_celular";
  if (ORDEN_PRIORIDAD[p.prioridad] < ORDEN_PRIORIDAD[f.prioridadMin]) return "prioridad";
  return null;
}
