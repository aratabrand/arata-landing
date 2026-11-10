import type { CategoriaServicio } from "./tipos";

// Proceso de entrega por servicio (D-111). Los pasos de "Página Lista en 5 Días"
// son los que promete el sitio (content/servicios.ts: "Cómo son los 5 días" y
// "Para entregarte en 5 días, necesitamos"). Funciones puras.

export const etapas = [
  { valor: "arranque", label: "Arranque" },
  { valor: "diseno", label: "Diseño" },
  { valor: "construccion", label: "Construcción" },
  { valor: "revision", label: "Revisión" },
  { valor: "entrega", label: "Entrega" },
] as const;
export type Etapa = (typeof etapas)[number]["valor"];

export type FinTarea = { id: string; proyectoId: string; etapa: Etapa; texto: string; hecha: boolean; orden: number };

export const plantillas: Record<CategoriaServicio, { etapa: Etapa; texto: string }[]> = {
  "pagina-web": [
    { etapa: "arranque", texto: "Reunión y propuesta aprobada" },
    { etapa: "arranque", texto: "Recibir textos, logo y fotos" },
    { etapa: "diseno", texto: "Estructura de las 5 secciones (día 1)" },
    { etapa: "diseno", texto: "Diseño en celular y computador (días 2 y 3)" },
    { etapa: "construccion", texto: "Construir la página (días 2 y 3)" },
    { etapa: "revision", texto: "Mostrarla al cliente y 2 rondas de ajustes (día 4)" },
    { etapa: "entrega", texto: "Publicar en el dominio (día 5)" },
    { etapa: "entrega", texto: "Medir en Google: velocidad 90 o más" },
    { etapa: "entrega", texto: "Capacitación al cliente" },
  ],
  catalogo: [
    { etapa: "arranque", texto: "Reunión y propuesta aprobada" },
    { etapa: "arranque", texto: "Recibir productos, fotos y precios" },
    { etapa: "diseno", texto: "Categorías y estructura del catálogo" },
    { etapa: "diseno", texto: "Diseño en celular y computador" },
    { etapa: "construccion", texto: "Catálogo con carrito y pedido a WhatsApp" },
    { etapa: "revision", texto: "Pruebas de pedido con el cliente y ajustes" },
    { etapa: "entrega", texto: "Publicar en el dominio" },
    { etapa: "entrega", texto: "Capacitación al cliente" },
  ],
  sistema: [
    { etapa: "arranque", texto: "Reunión y levantamiento de lo que necesita" },
    { etapa: "arranque", texto: "Propuesta y cotización aprobadas" },
    { etapa: "diseno", texto: "Diseño de pantallas" },
    { etapa: "construccion", texto: "Construcción del sistema" },
    { etapa: "construccion", texto: "Carga de datos iniciales" },
    { etapa: "revision", texto: "Pruebas con el cliente y ajustes" },
    { etapa: "entrega", texto: "Puesta en marcha" },
    { etapa: "entrega", texto: "Capacitación al equipo del cliente" },
  ],
  mantenimiento: [
    { etapa: "arranque", texto: "Revisión del mes (velocidad, errores, pedidos de cambio)" },
    { etapa: "construccion", texto: "Cambios y ajustes del mes" },
    { etapa: "entrega", texto: "Informe al cliente" },
  ],
  otro: [
    { etapa: "arranque", texto: "Reunión y propuesta aprobada" },
    { etapa: "construccion", texto: "Hacer el trabajo" },
    { etapa: "entrega", texto: "Entregar al cliente" },
  ],
};

/** Avance de un proyecto calculado de sus pasos. */
export function avance(tareas: FinTarea[]) {
  const orden = (t: FinTarea) => etapas.findIndex((e) => e.valor === t.etapa) * 1000 + t.orden;
  const lista = [...tareas].sort((a, b) => orden(a) - orden(b));
  const total = lista.length;
  const hechas = lista.filter((t) => t.hecha).length;
  const pendiente = lista.find((t) => !t.hecha);
  const entregado = total > 0 && !pendiente;
  const etapaActual: Etapa | null = total === 0 ? null : pendiente ? pendiente.etapa : "entrega";
  const porEtapa = etapas.map((e) => {
    const ts = lista.filter((t) => t.etapa === e.valor);
    const h = ts.filter((t) => t.hecha).length;
    return { ...e, total: ts.length, hechas: h, completa: ts.length > 0 && h === ts.length };
  });
  return { total, hechas, pct: total ? Math.round((hechas / total) * 100) : 0, entregado, etapaActual, siguiente: pendiente?.texto ?? null, porEtapa, lista };
}

export const etiquetaEtapa = (e: Etapa | null, entregado = false) => (entregado ? "Entregado" : e ? etapas.find((x) => x.valor === e)!.label : "Sin proceso");
