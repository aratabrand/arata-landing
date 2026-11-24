// Tareas del equipo de Arata San (D-181). Tipos y funciones puras: las usan la pantalla,
// las acciones del servidor y el aviso diario. Sin base de datos: este archivo viaja al navegador.

export const AREAS = {
  proyectos: "Proyectos",
  marketing: "Marketing",
  ventas: "Ventas",
  finanzas: "Finanzas",
  diseno: "Diseño",
  administracion: "Administración",
} as const;
export type Area = keyof typeof AREAS;

export const PRIORIDADES_TAREA = { urgente: "Urgente", alta: "Alta", media: "Media", baja: "Baja" } as const;
export type PrioridadTarea = keyof typeof PRIORIDADES_TAREA;
const PESO: Record<PrioridadTarea, number> = { urgente: 0, alta: 1, media: 2, baja: 3 };

export const ESTADOS_TAREA = { por_hacer: "Por hacer", en_curso: "En curso", hecha: "Hecha" } as const;
export type EstadoTarea = keyof typeof ESTADOS_TAREA;

export type ItemTarea = { id: string; texto: string; hecho: boolean; orden: number };
export type ComentarioTarea = { id: string; texto: string; quien: string; creado: string };

export type Tarea = {
  id: string;
  titulo: string;
  descripcion: string | null;
  area: Area;
  proyectoId: string | null;
  responsableId: string | null;
  /** AAAA-MM-DD (día del tablero). null = sin fecha. */
  fecha: string | null;
  prioridad: PrioridadTarea;
  estado: EstadoTarea;
  orden: number;
  creadoPor: string | null;
  creado: string;
  items: ItemTarea[];
  comentarios: ComentarioTarea[];
};

/** Persona a la que se le puede asignar (equipo_personas activas). */
export type PersonaTarea = { id: string; nombre: string; usuarioId: string | null };
export type ProyectoTarea = { id: string; nombre: string };

/* ── Fechas (siempre AAAA-MM-DD, sin zona horaria) ─────────────────── */

const aUTC = (f: string) => new Date(`${f}T12:00:00Z`);
const deUTC = (d: Date) => d.toISOString().slice(0, 10);
export const FECHA = /^\d{4}-\d{2}-\d{2}$/;

export function sumarDias(fecha: string, dias: number) {
  const d = aUTC(fecha);
  d.setUTCDate(d.getUTCDate() + dias);
  return deUTC(d);
}

/** Lunes de la semana de esa fecha (la semana va de lunes a domingo). */
export function lunesDe(fecha: string) {
  const dia = aUTC(fecha).getUTCDay(); // 0 domingo … 6 sábado
  return sumarDias(fecha, dia === 0 ? -6 : 1 - dia);
}

/** Los 7 días de la semana que empieza ese lunes. */
export const diasDeSemana = (lunes: string) => Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** "Lunes", "24 nov". */
export function partesDia(fecha: string) {
  const d = aUTC(fecha);
  return { dia: DIAS[d.getUTCDay()], corto: `${d.getUTCDate()} ${MESES[d.getUTCMonth()]}` };
}

/** "Hoy", "Mañana", "Ayer" o "Mié 26 nov". */
export function fechaCorta(fecha: string | null, hoy: string) {
  if (!fecha) return "Sin fecha";
  if (fecha === hoy) return "Hoy";
  if (fecha === sumarDias(hoy, 1)) return "Mañana";
  if (fecha === sumarDias(hoy, -1)) return "Ayer";
  const { dia, corto } = partesDia(fecha);
  return `${dia.slice(0, 3)} ${corto}`;
}

/** "24 – 30 nov" o "29 dic – 4 ene". */
export function rangoSemana(lunes: string) {
  const fin = sumarDias(lunes, 6);
  const a = aUTC(lunes);
  const b = aUTC(fin);
  return a.getUTCMonth() === b.getUTCMonth() ? `${a.getUTCDate()} – ${partesDia(fin).corto}` : `${partesDia(lunes).corto} – ${partesDia(fin).corto}`;
}

/* ── Orden y estado ─────────────────────────────────────────────────── */

export const vencida = (t: Pick<Tarea, "fecha" | "estado">, hoy: string) => t.estado !== "hecha" && t.fecha !== null && t.fecha < hoy;

/** Dentro de un día: primero las pendientes, por el orden que les dieron arrastrando y luego por prioridad. */
export function ordenarDia<T extends Pick<Tarea, "estado" | "orden" | "prioridad" | "creado">>(lista: T[]) {
  return [...lista].sort(
    (a, b) => Number(a.estado === "hecha") - Number(b.estado === "hecha") || a.orden - b.orden || PESO[a.prioridad] - PESO[b.prioridad] || a.creado.localeCompare(b.creado)
  );
}

export type Columna = "titulo" | "estado" | "prioridad" | "responsable" | "fecha" | "area";

/** Orden de la tabla por columna (las fechas vacías y los sin asignar van al final). */
export function ordenarTabla(lista: Tarea[], col: Columna, asc: boolean, nombreDe: (id: string | null) => string) {
  const ORDEN_ESTADO: Record<EstadoTarea, number> = { por_hacer: 0, en_curso: 1, hecha: 2 };
  const valor = (t: Tarea): string | number => {
    switch (col) {
      case "titulo":
        return t.titulo.toLowerCase();
      case "estado":
        return ORDEN_ESTADO[t.estado];
      case "prioridad":
        return PESO[t.prioridad];
      case "responsable":
        return t.responsableId ? nombreDe(t.responsableId).toLowerCase() : "￿";
      case "fecha":
        return t.fecha ?? "9999-99-99";
      case "area":
        return AREAS[t.area];
    }
  };
  return [...lista].sort((a, b) => {
    const x = valor(a);
    const y = valor(b);
    const r = x < y ? -1 : x > y ? 1 : 0;
    return (asc ? r : -r) || PESO[a.prioridad] - PESO[b.prioridad] || a.creado.localeCompare(b.creado);
  });
}

export function avanceItems(items: ItemTarea[]) {
  return { hechos: items.filter((i) => i.hecho).length, total: items.length };
}

/** Aviso de las 8 a. m. para una persona: null si no tiene nada pendiente hoy ni vencido. */
export function resumenDiario(nombre: string, tareas: Pick<Tarea, "titulo" | "fecha" | "estado" | "prioridad">[], hoy: string) {
  const pendientes = tareas.filter((t) => t.estado !== "hecha" && t.fecha !== null && t.fecha <= hoy);
  if (!pendientes.length) return null;
  const deHoy = pendientes.filter((t) => t.fecha === hoy);
  const tarde = pendientes.filter((t) => t.fecha! < hoy);
  const partes = [deHoy.length ? `${deHoy.length} para hoy` : "", tarde.length ? `${tarde.length} ${tarde.length === 1 ? "vencida" : "vencidas"}` : ""].filter(Boolean);
  const primero = [...pendientes].sort((a, b) => PESO[a.prioridad] - PESO[b.prioridad])[0];
  return {
    titulo: `${tarde.length ? "⚠️" : "✅"} ${nombre.split(" ")[0]}, tienes ${partes.join(" y ")}`,
    cuerpo: `Empieza por: ${primero.titulo}${pendientes.length > 1 ? ` (y ${pendientes.length - 1} más)` : ""}`,
  };
}
