import { db } from "../db";
import { panelActivo } from "../config";
import { fechaBogota, hoyColombia } from "../fecha";
import { contextoAgencia } from "../finanzas/datos";
import type { PersonaTarea, ProyectoTarea, Tarea } from "./tareas";

// Lectura de Tareas (D-181, solo servidor). Solo la agencia; todos los miembros ven todo.
// Se traen las pendientes y las hechas de los últimos 60 días (las viejas ya no sirven en el tablero).

export type DatosTareas = {
  tareas: Tarea[];
  personas: PersonaTarea[];
  proyectos: ProyectoTarea[];
  /** Persona del equipo de quien está en sesión (para «Mis tareas»). */
  yo: string | null;
  puedeBorrar: boolean;
  hoy: string;
};

export async function cargarTareas(): Promise<DatosTareas | null> {
  if (!panelActivo) return null;
  const ctx = await contextoAgencia();
  if (!ctx) return null;
  const [ta, it, co, pe, pr] = await Promise.all([
    db().query(
      `select id, titulo, descripcion, area, proyecto_id, responsable_id, fecha, prioridad, estado, orden, recordatorio, creado_por, creado
         from agencia_tareas
        where negocio_id = $1 and (estado <> 'hecha' or hecha_en > now() - interval '60 days' or fecha >= current_date - 7)
        order by fecha nulls last, orden, creado
        limit 2000`,
      [ctx.negocioId]
    ),
    db().query(
      `select i.id, i.tarea_id, i.texto, i.hecho, i.orden from tarea_items i join agencia_tareas t on t.id = i.tarea_id
        where t.negocio_id = $1 order by i.orden, i.creado`,
      [ctx.negocioId]
    ),
    db().query(
      `select c.id, c.tarea_id, c.texto, c.quien, c.creado from tarea_comentarios c join agencia_tareas t on t.id = c.tarea_id
        where t.negocio_id = $1 order by c.creado`,
      [ctx.negocioId]
    ),
    db().query(`select id, nombre, usuario_id from equipo_personas where negocio_id = $1 and activo order by orden, creado`, [ctx.negocioId]),
    db().query(
      `select id, nombre from fin_proyectos
        where negocio_id = $1 and (estado <> 'cerrado' or id in (select proyecto_id from agencia_tareas where negocio_id = $1 and proyecto_id is not null))
        order by (estado = 'cerrado'), lower(nombre)`,
      [ctx.negocioId]
    ),
  ]);
  const items = new Map<string, Tarea["items"]>();
  it.rows.forEach((r) => items.set(r.tarea_id, [...(items.get(r.tarea_id) ?? []), { id: r.id, texto: r.texto, hecho: r.hecho, orden: Number(r.orden) }]));
  const comentarios = new Map<string, Tarea["comentarios"]>();
  co.rows.forEach((r) => comentarios.set(r.tarea_id, [...(comentarios.get(r.tarea_id) ?? []), { id: r.id, texto: r.texto, quien: r.quien, creado: r.creado.toISOString() }]));
  const personas = pe.rows.map((r): PersonaTarea => ({ id: r.id, nombre: r.nombre, usuarioId: r.usuario_id }));
  return {
    tareas: ta.rows.map(
      (r): Tarea => ({
        id: r.id,
        titulo: r.titulo,
        descripcion: r.descripcion,
        area: r.area,
        proyectoId: r.proyecto_id,
        responsableId: r.responsable_id,
        fecha: fechaBogota(r.fecha),
        prioridad: r.prioridad,
        estado: r.estado,
        orden: Number(r.orden),
        recordatorio: r.recordatorio,
        creadoPor: r.creado_por,
        creado: r.creado.toISOString(),
        items: items.get(r.id) ?? [],
        comentarios: comentarios.get(r.id) ?? [],
      })
    ),
    personas,
    proyectos: pr.rows.map((r): ProyectoTarea => ({ id: r.id, nombre: r.nombre })),
    yo: personas.find((p) => p.usuarioId === ctx.usuarioId)?.id ?? null,
    puedeBorrar: ctx.esDueno,
    hoy: hoyColombia(),
  };
}

/** Para el contador del menú: tus tareas pendientes de hoy y las vencidas. */
export async function pendientesHoy(negocioId: string, usuarioId: string) {
  const r = await db().query(
    `select count(*)::int n from agencia_tareas t join equipo_personas p on p.id = t.responsable_id
      where t.negocio_id = $1 and p.usuario_id = $2 and t.estado <> 'hecha' and t.fecha <= $3::date`,
    [negocioId, usuarioId, hoyColombia()]
  );
  return Number(r.rows[0]?.n ?? 0);
}
