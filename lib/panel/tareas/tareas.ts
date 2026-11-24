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

/** Recordatorio antes del día de la tarea (D-183). Llega con el aviso de las 8 a. m. */
export const RECORDATORIOS = {
  mismo_dia: "El mismo día",
  "1_dia": "Un día antes (24 h)",
  "2_dias": "Dos días antes",
  "1_semana": "Una semana antes",
} as const;
export type Recordatorio = keyof typeof RECORDATORIOS;
const DIAS_ANTES: Record<Recordatorio, number> = { mismo_dia: 0, "1_dia": 1, "2_dias": 2, "1_semana": 7 };

export type ItemTarea = { id: string; texto: string; hecho: boolean; orden: number };
export type ComentarioTarea = { id: string; texto: string; quien: string; creado: string };

export type Tarea = {
  id: string;
  titulo: string;
  descripcion: string | null;
  area: Area;
  proyectoId: string | null;
  /** Personas del equipo que la hacen (D-186: puede ser más de una). Vacío = sin asignar. */
  responsables: string[];
  /** AAAA-MM-DD: día en que empieza (o el único día). null = sin fecha. */
  fecha: string | null;
  /** AAAA-MM-DD: día en que debe quedar lista (D-187). null = es de un solo día. */
  fechaFin: string | null;
  prioridad: PrioridadTarea;
  estado: EstadoTarea;
  orden: number;
  /** null = sin recordatorio. */
  recordatorio: Recordatorio | null;
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

/** El tablero muestra solo los días de trabajo: lunes a viernes (D-182). */
export const diasLaborales = (lunes: string) => diasDeSemana(lunes).slice(0, 5);
export const esFinDeSemana = (fecha: string) => [0, 6].includes(aUTC(fecha).getUTCDay());

/** Semana que se trabaja: la de hoy, o la siguiente si hoy es sábado o domingo. */
export const semanaDeTrabajo = (hoy: string) => (esFinDeSemana(hoy) ? sumarDias(lunesDe(hoy), 7) : lunesDe(hoy));

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

/** "23 – 27 nov" (lunes a viernes) o "29 dic – 2 ene". Con `dias = 6`, hasta el domingo. */
export function rangoSemana(lunes: string, dias = 4) {
  const fin = sumarDias(lunes, dias);
  const a = aUTC(lunes);
  const b = aUTC(fin);
  return a.getUTCMonth() === b.getUTCMonth() ? `${a.getUTCDate()} – ${partesDia(fin).corto}` : `${partesDia(lunes).corto} – ${partesDia(fin).corto}`;
}

/* ── Orden y estado ─────────────────────────────────────────────────── */

/** Día en que debe quedar lista: la final del rango, o el único día (D-187). */
export const vence = (t: Pick<Tarea, "fecha" | "fechaFin">) => t.fechaFin ?? t.fecha;

/** ¿Se trabaja ese día? (dentro del rango). */
export const activaEn = (t: Pick<Tarea, "fecha" | "fechaFin">, dia: string) => t.fecha !== null && t.fecha <= dia && dia <= (vence(t) as string);

export const vencida = (t: Pick<Tarea, "fecha" | "fechaFin" | "estado">, hoy: string) => {
  const v = vence(t);
  return t.estado !== "hecha" && v !== null && v < hoy;
};

/** Días que dura (1 si es de un solo día). */
export const duracion = (t: Pick<Tarea, "fecha" | "fechaFin">) =>
  t.fecha && t.fechaFin ? Math.round((Date.parse(`${t.fechaFin}T12:00:00Z`) - Date.parse(`${t.fecha}T12:00:00Z`)) / 86_400_000) + 1 : 1;

/**
 * Mover en el tablero (D-187): el rango se corre completo, conservando cuántos días dura.
 * `desde` = día (columna) de donde se arrastró; `destino` = día donde se soltó (null = «Sin fecha»).
 */
export function moverRango(t: Pick<Tarea, "fecha" | "fechaFin">, destino: string | null, desde: string | null) {
  if (!destino) return { fecha: null, fechaFin: null };
  const dias = duracion(t);
  const base = desde ?? t.fecha;
  const inicio = t.fecha && base ? sumarDias(t.fecha, Math.round((Date.parse(`${destino}T12:00:00Z`) - Date.parse(`${base}T12:00:00Z`)) / 86_400_000)) : destino;
  return { fecha: inicio, fechaFin: dias > 1 ? sumarDias(inicio, dias - 1) : null };
}

/** "Hoy", "Mar 24 nov" o el rango "Lun 23 – Jue 26 nov" (D-187). */
export function rangoTexto(t: Pick<Tarea, "fecha" | "fechaFin">, hoy: string) {
  if (!t.fecha) return "Sin fecha";
  if (!t.fechaFin || t.fechaFin === t.fecha) return fechaCorta(t.fecha, hoy);
  const a = partesDia(t.fecha);
  const b = partesDia(t.fechaFin);
  const mismoMes = t.fecha.slice(0, 7) === t.fechaFin.slice(0, 7);
  return `${a.dia.slice(0, 3)} ${mismoMes ? a.corto.split(" ")[0] : a.corto} – ${b.dia.slice(0, 3)} ${b.corto}`;
}

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
        return t.responsables.length ? t.responsables.map((id) => nombreDe(id)).sort().join(", ").toLowerCase() : "\uffff";
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
export function resumenDiario(nombre: string, tareas: (Pick<Tarea, "titulo" | "fecha" | "estado" | "prioridad"> & { fechaFin?: string | null })[], hoy: string) {
  // Pendientes: empezaron hoy o antes (un rango en curso cuenta «para hoy»; si ya pasó su final, «vencida»)
  const pendientes = tareas.filter((t) => t.estado !== "hecha" && t.fecha !== null && t.fecha <= hoy);
  if (!pendientes.length) return null;
  const fin = (t: (typeof pendientes)[number]) => t.fechaFin ?? t.fecha!;
  const deHoy = pendientes.filter((t) => fin(t) >= hoy);
  const tarde = pendientes.filter((t) => fin(t) < hoy);
  const partes = [deHoy.length ? `${deHoy.length} para hoy` : "", tarde.length ? `${tarde.length} ${tarde.length === 1 ? "vencida" : "vencidas"}` : ""].filter(Boolean);
  const primero = [...pendientes].sort((a, b) => PESO[a.prioridad] - PESO[b.prioridad])[0];
  return {
    titulo: `${tarde.length ? "⚠️" : "✅"} ${nombre.split(" ")[0]}, tienes ${partes.join(" y ")}`,
    cuerpo: `Empieza por: ${primero.titulo}${pendientes.length > 1 ? ` (y ${pendientes.length - 1} más)` : ""}`,
  };
}

/**
 * ¿Le toca llegar hoy el recordatorio? Desde el día que pide (ej. un día antes) hasta el día de la
 * tarea; el aviso de las 8 a. m. lo manda una sola vez (tabla avisos_recordatorios). Si lo ponen tarde
 * (ej. «una semana antes» para algo de pasado mañana), llega en el siguiente aviso de las 8 a. m.
 */
export function tocaRecordar(t: Pick<Tarea, "recordatorio" | "fecha" | "estado"> & { fechaFin?: string | null }, hoy: string) {
  // Cuenta desde el día en que debe quedar lista (la final del rango, D-187)
  const v = t.fechaFin ?? t.fecha;
  if (!t.recordatorio || !v || t.estado === "hecha") return false;
  return sumarDias(v, -DIAS_ANTES[t.recordatorio]) <= hoy && hoy <= v;
}

/** Texto del aviso del recordatorio. */
export function textoRecordatorio(t: Pick<Tarea, "titulo" | "fecha" | "prioridad"> & { fechaFin?: string | null }, hoy: string) {
  const v = t.fechaFin ?? t.fecha;
  const cuando = v === hoy ? "Es para hoy" : v === sumarDias(hoy, 1) ? "Es para mañana" : `Es para el ${fechaCorta(v, hoy).toLowerCase()}`;
  return { titulo: `⏰ Recordatorio: ${t.titulo}`.slice(0, 120), cuerpo: `${cuando}${t.prioridad === "urgente" ? " · Urgente" : ""}` };
}

/** Cuándo llega, para mostrarlo en la ficha: "Llega el jue 26 nov a las 8 a. m.". */
export function cuandoLlega(recordatorio: Recordatorio | null, fecha: string | null, hoy: string) {
  if (!recordatorio || !fecha) return null;
  if (fecha < hoy) return "El día de la tarea ya pasó: no llega.";
  const dia = sumarDias(fecha, -DIAS_ANTES[recordatorio]);
  if (dia > hoy) return `Llega ${fechaCorta(dia, hoy).toLowerCase()} a las 8 a. m.`;
  if (fecha > hoy) return "Llega con el próximo aviso de las 8 a. m.";
  return "La tarea es hoy: llega solo si todavía no han dado las 8 a. m.";
}
