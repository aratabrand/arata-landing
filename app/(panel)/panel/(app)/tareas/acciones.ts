"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { db } from "@/lib/panel/db";
import { panelActivo } from "@/lib/panel/config";
import { contextoAgencia, type ContextoAgencia } from "@/lib/panel/finanzas/datos";
import { diferencias, registrar } from "@/lib/panel/historial";
import { avisarA } from "@/lib/panel/push";
import { hoyColombia } from "@/lib/panel/fecha";
import { AREAS, ESTADOS_TAREA, FECHA, PRIORIDADES_TAREA, fechaCorta, type Area, type EstadoTarea, type PrioridadTarea } from "@/lib/panel/tareas/tareas";
import type { Resultado } from "../finanzas/acciones";

// Tareas del equipo (D-181). Los tres (Sergio, Andrés y Santiago) crean, asignan y editan;
// borrar es solo de Sergio. Cada cambio queda en el historial; al asignar, le llega un aviso
// al celular a la persona (si no se la asignó ella misma).

const NO = (error: string): Resultado => ({ ok: false, error });
const UUID = /^[0-9a-f-]{36}$/i;

const limpio = (v: unknown, max: number) => {
  const t = String(v ?? "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f<>]/g, "")
    .trim();
  if (t.length > max) throw new Error(`Máximo ${max} caracteres.`);
  return t || null;
};

async function contexto(): Promise<ContextoAgencia | Resultado> {
  if (!panelActivo) return NO("El panel está en modo ejemplo: los cambios no se guardan.");
  const ctx = await contextoAgencia();
  if (!ctx) return NO("Tu sesión terminó. Vuelve a entrar.");
  return ctx;
}
const esFallo = (x: ContextoAgencia | Resultado): x is Resultado => "ok" in x;

const listo = () => {
  revalidatePath("/panel/tareas");
  revalidatePath("/panel/proyectos", "layout");
};

async function tareaDe(ctx: ContextoAgencia, id: string) {
  if (!UUID.test(id)) return null;
  return (
    await db().query(
      `select t.id, t.titulo, t.descripcion, t.area, t.proyecto_id, t.responsable_id, t.fecha::text fecha, t.prioridad, t.estado,
              p.nombre responsable, p.usuario_id responsable_usuario, f.nombre proyecto
         from agencia_tareas t left join equipo_personas p on p.id = t.responsable_id left join fin_proyectos f on f.id = t.proyecto_id
        where t.id = $1 and t.negocio_id = $2`,
      [id, ctx.negocioId]
    )
  ).rows[0] as
    | {
        id: string;
        titulo: string;
        descripcion: string | null;
        area: Area;
        proyecto_id: string | null;
        responsable_id: string | null;
        fecha: string | null;
        prioridad: PrioridadTarea;
        estado: EstadoTarea;
        responsable: string | null;
        responsable_usuario: string | null;
        proyecto: string | null;
      }
    | undefined;
}

/** Aviso al celular de quien recibe la tarea (nunca a quien se la asignó a sí mismo). */
function avisarAsignada(ctx: ContextoAgencia, tarea: { id: string; titulo: string; fecha: string | null; prioridad: PrioridadTarea }, usuarioId: string | null) {
  if (!usuarioId || usuarioId === ctx.usuarioId) return;
  after(async () => {
    const quien = String((await db().query(`select name from "user" where id = $1`, [ctx.usuarioId])).rows[0]?.name ?? "Alguien").split(" ")[0];
    const cuando = fechaCorta(tarea.fecha, hoyColombia());
    await avisarA(ctx.negocioId, usuarioId, {
      titulo: `📋 ${quien} te asignó una tarea`,
      cuerpo: `${tarea.titulo} · ${cuando}${tarea.prioridad === "urgente" ? " · Urgente" : ""}`,
      url: `/panel/tareas?t=${tarea.id}`,
      etiqueta: `tarea-${tarea.id}`,
    }).catch((e) => console.error("Aviso de tarea:", e));
  });
}

export type EntradaTarea = {
  id?: string;
  titulo: string;
  descripcion?: string;
  area: string;
  proyectoId?: string | null;
  responsableId?: string | null;
  fecha?: string | null;
  prioridad: string;
  estado?: string;
};

/** Crea o edita una tarea. */
export async function guardarTarea(e: EntradaTarea): Promise<Resultado> {
  try {
    const ctx = await contexto();
    if (esFallo(ctx)) return ctx;
    const titulo = limpio(e.titulo, 160);
    if (!titulo || titulo.length < 2) return NO("Escribe qué hay que hacer.");
    const descripcion = limpio(e.descripcion, 4000);
    if (!(e.area in AREAS)) return NO("Elige un área.");
    if (!(e.prioridad in PRIORIDADES_TAREA)) return NO("Elige la prioridad.");
    const estado = (e.estado ?? "por_hacer") as EstadoTarea;
    if (!(estado in ESTADOS_TAREA)) return NO("Elige el estado.");
    const fecha = e.fecha ? String(e.fecha) : null;
    if (fecha && !FECHA.test(fecha)) return NO("Revisa la fecha.");
    const proyectoId = e.proyectoId || null;
    if (proyectoId && !(UUID.test(proyectoId) && (await db().query(`select 1 from fin_proyectos where id = $1 and negocio_id = $2`, [proyectoId, ctx.negocioId])).rowCount))
      return NO("Ese proyecto no existe.");
    const responsableId = e.responsableId || null;
    const persona = responsableId
      ? UUID.test(responsableId)
        ? (await db().query(`select id, nombre, usuario_id from equipo_personas where id = $1 and negocio_id = $2 and activo`, [responsableId, ctx.negocioId])).rows[0]
        : undefined
      : null;
    if (responsableId && !persona) return NO("Elige a alguien del equipo.");
    const area = e.area as Area;
    const prioridad = e.prioridad as PrioridadTarea;

    if (!e.id) {
      // Nueva: al final del día elegido
      const orden = fecha
        ? Number((await db().query(`select coalesce(max(orden), 0) + 1 n from agencia_tareas where negocio_id = $1 and fecha = $2`, [ctx.negocioId, fecha])).rows[0].n)
        : 0;
      const id = (
        await db().query(
          `insert into agencia_tareas (negocio_id, titulo, descripcion, area, proyecto_id, responsable_id, fecha, prioridad, estado, orden, creado_por, hecha_en)
           values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, case when $9 = 'hecha' then now() end) returning id`,
          [ctx.negocioId, titulo, descripcion, area, proyectoId, responsableId, fecha, prioridad, estado, orden, ctx.usuarioId]
        )
      ).rows[0].id as string;
      await registrar(ctx, {
        accion: "crear",
        entidad: "tarea",
        entidadId: id,
        proyectoId,
        titulo: `Creó la tarea «${titulo}»${persona ? ` para ${persona.nombre}` : ""}`,
      });
      avisarAsignada(ctx, { id, titulo, fecha, prioridad }, persona?.usuario_id ?? null);
      listo();
      return { ok: true, id };
    }

    const antes = await tareaDe(ctx, e.id);
    if (!antes) return NO("Esa tarea no existe.");
    await db().query(
      `update agencia_tareas set titulo = $3, descripcion = $4, area = $5, proyecto_id = $6, responsable_id = $7, fecha = $8, prioridad = $9, estado = $10,
              hecha_en = case when $10 = 'hecha' then coalesce(hecha_en, now()) else null end, actualizado = now()
        where id = $1 and negocio_id = $2`,
      [antes.id, ctx.negocioId, titulo, descripcion, area, proyectoId, responsableId, fecha, prioridad, estado]
    );
    const proyecto = proyectoId ? ((await db().query(`select nombre from fin_proyectos where id = $1`, [proyectoId])).rows[0]?.nombre as string) : null;
    const hoy = hoyColombia();
    const cambios = diferencias(
      {
        titulo: antes.titulo,
        responsable: antes.responsable ?? "Sin asignar",
        fecha: fechaCorta(antes.fecha, hoy),
        prioridad: PRIORIDADES_TAREA[antes.prioridad],
        estado: ESTADOS_TAREA[antes.estado],
        area: AREAS[antes.area],
        proyecto: antes.proyecto,
        descripcion: antes.descripcion,
      },
      {
        titulo,
        responsable: persona?.nombre ?? "Sin asignar",
        fecha: fechaCorta(fecha, hoy),
        prioridad: PRIORIDADES_TAREA[prioridad],
        estado: ESTADOS_TAREA[estado],
        area: AREAS[area],
        proyecto,
        descripcion,
      },
      { titulo: "Título", responsable: "Responsable", fecha: "Fecha", prioridad: "Prioridad", estado: "Estado", area: "Área", proyecto: "Proyecto", descripcion: "Descripción" }
    );
    if (cambios.length) await registrar(ctx, { accion: "editar", entidad: "tarea", entidadId: antes.id, proyectoId, titulo: `Editó la tarea «${titulo}»`, cambios });
    if (responsableId && responsableId !== antes.responsable_id) avisarAsignada(ctx, { id: antes.id, titulo, fecha, prioridad }, persona?.usuario_id ?? null);
    listo();
    return { ok: true, id: antes.id };
  } catch (err) {
    return NO(err instanceof Error ? err.message : "No se pudo guardar la tarea.");
  }
}

/** Cambia solo el estado (el círculo de la tarjeta o la tabla). */
export async function cambiarEstadoTarea(id: string, estado: string): Promise<Resultado> {
  try {
    const ctx = await contexto();
    if (esFallo(ctx)) return ctx;
    if (!(estado in ESTADOS_TAREA)) return NO("Estado no válido.");
    const t = await tareaDe(ctx, id);
    if (!t) return NO("Esa tarea no existe.");
    if (t.estado === estado) return { ok: true };
    await db().query(
      `update agencia_tareas set estado = $3, hecha_en = case when $3 = 'hecha' then now() else null end, actualizado = now() where id = $1 and negocio_id = $2`,
      [t.id, ctx.negocioId, estado]
    );
    await registrar(ctx, {
      accion: estado === "hecha" ? "marcar" : "editar",
      entidad: "tarea",
      entidadId: t.id,
      proyectoId: t.proyecto_id,
      titulo: estado === "hecha" ? `Terminó la tarea «${t.titulo}»` : `Pasó «${t.titulo}» a ${ESTADOS_TAREA[estado as EstadoTarea].toLowerCase()}`,
      cambios: [{ campo: "Estado", antes: ESTADOS_TAREA[t.estado], despues: ESTADOS_TAREA[estado as EstadoTarea] }],
    });
    listo();
    return { ok: true };
  } catch (err) {
    return NO(err instanceof Error ? err.message : "No se pudo cambiar el estado.");
  }
}

/**
 * Arrastrar en el tablero: la tarea pasa a otro día (o a «Sin fecha») y queda antes de `antesDe`
 * (o al final). Se renumera el orden de ese día.
 */
export async function moverTarea(entrada: { id: string; fecha: string | null; antesDe?: string | null }): Promise<Resultado> {
  try {
    const ctx = await contexto();
    if (esFallo(ctx)) return ctx;
    const fecha = entrada.fecha || null;
    if (fecha && !FECHA.test(fecha)) return NO("Día no válido.");
    const t = await tareaDe(ctx, entrada.id);
    if (!t) return NO("Esa tarea no existe.");
    const delDia = (
      await db().query(`select id from agencia_tareas where negocio_id = $1 and fecha is not distinct from $2::date and id <> $3 order by orden, creado`, [ctx.negocioId, fecha, t.id])
    ).rows.map((r) => r.id as string);
    const i = entrada.antesDe ? delDia.indexOf(entrada.antesDe) : -1;
    delDia.splice(i < 0 ? delDia.length : i, 0, t.id);
    await db().query(`update agencia_tareas set fecha = $3, actualizado = now() where id = $1 and negocio_id = $2`, [t.id, ctx.negocioId, fecha]);
    await db().query(
      `update agencia_tareas a set orden = x.orden from unnest($2::uuid[]) with ordinality as x(id, orden) where a.id = x.id and a.negocio_id = $1`,
      [ctx.negocioId, delDia]
    );
    if (t.fecha !== fecha) {
      const hoy = hoyColombia();
      await registrar(ctx, {
        accion: "editar",
        entidad: "tarea",
        entidadId: t.id,
        proyectoId: t.proyecto_id,
        titulo: `Movió «${t.titulo}» a ${fechaCorta(fecha, hoy).toLowerCase()}`,
        cambios: [{ campo: "Fecha", antes: fechaCorta(t.fecha, hoy), despues: fechaCorta(fecha, hoy) }],
      });
    }
    listo();
    return { ok: true };
  } catch (err) {
    return NO(err instanceof Error ? err.message : "No se pudo mover la tarea.");
  }
}

/** Borra la tarea con su lista y comentarios. Solo Sergio. */
export async function borrarTarea(id: string): Promise<Resultado> {
  try {
    const ctx = await contexto();
    if (esFallo(ctx)) return ctx;
    if (!ctx.esDueno) return NO("Solo Sergio puede borrar tareas.");
    const t = await tareaDe(ctx, id);
    if (!t) return NO("Esa tarea no existe.");
    await db().query(`delete from agencia_tareas where id = $1 and negocio_id = $2`, [t.id, ctx.negocioId]);
    await registrar(ctx, { accion: "borrar", entidad: "tarea", entidadId: t.id, proyectoId: t.proyecto_id, titulo: `Borró la tarea «${t.titulo}»` });
    listo();
    return { ok: true };
  } catch (err) {
    return NO(err instanceof Error ? err.message : "No se pudo borrar.");
  }
}

/* ── Lista de chequeo ──────────────────────────────────────────────── */

export async function agregarItem(tareaId: string, texto: string): Promise<Resultado> {
  try {
    const ctx = await contexto();
    if (esFallo(ctx)) return ctx;
    const t = await tareaDe(ctx, tareaId);
    if (!t) return NO("Esa tarea no existe.");
    const limpioTexto = limpio(texto, 200);
    if (!limpioTexto) return NO("Escribe el paso.");
    const n = Number((await db().query(`select count(*)::int n from tarea_items where tarea_id = $1`, [t.id])).rows[0].n);
    if (n >= 50) return NO("Máximo 50 pasos por tarea.");
    const id = (await db().query(`insert into tarea_items (tarea_id, texto, orden) values ($1, $2, $3) returning id`, [t.id, limpioTexto, n + 1])).rows[0].id as string;
    listo();
    return { ok: true, id };
  } catch (err) {
    return NO(err instanceof Error ? err.message : "No se pudo agregar.");
  }
}

export async function marcarItem(itemId: string, hecho: boolean): Promise<Resultado> {
  try {
    const ctx = await contexto();
    if (esFallo(ctx)) return ctx;
    if (!UUID.test(itemId)) return NO("Paso no válido.");
    const r = await db().query(
      `update tarea_items i set hecho = $3 from agencia_tareas t where i.id = $1 and t.id = i.tarea_id and t.negocio_id = $2`,
      [itemId, ctx.negocioId, hecho === true]
    );
    if (!r.rowCount) return NO("Ese paso no existe.");
    listo();
    return { ok: true };
  } catch (err) {
    return NO(err instanceof Error ? err.message : "No se pudo marcar.");
  }
}

export async function borrarItem(itemId: string): Promise<Resultado> {
  try {
    const ctx = await contexto();
    if (esFallo(ctx)) return ctx;
    if (!UUID.test(itemId)) return NO("Paso no válido.");
    const r = await db().query(`delete from tarea_items i using agencia_tareas t where i.id = $1 and t.id = i.tarea_id and t.negocio_id = $2`, [itemId, ctx.negocioId]);
    if (!r.rowCount) return NO("Ese paso no existe.");
    listo();
    return { ok: true };
  } catch (err) {
    return NO(err instanceof Error ? err.message : "No se pudo quitar.");
  }
}

/* ── Comentarios ───────────────────────────────────────────────────── */

export async function comentarTarea(tareaId: string, texto: string): Promise<Resultado> {
  try {
    const ctx = await contexto();
    if (esFallo(ctx)) return ctx;
    const t = await tareaDe(ctx, tareaId);
    if (!t) return NO("Esa tarea no existe.");
    const limpioTexto = limpio(texto, 1000);
    if (!limpioTexto) return NO("Escribe el comentario.");
    const quien = String((await db().query(`select name from "user" where id = $1`, [ctx.usuarioId])).rows[0]?.name ?? "Alguien").slice(0, 80);
    await db().query(`insert into tarea_comentarios (tarea_id, usuario_id, quien, texto) values ($1, $2, $3, $4)`, [t.id, ctx.usuarioId, quien, limpioTexto]);
    await registrar(ctx, { accion: "editar", entidad: "tarea", entidadId: t.id, proyectoId: t.proyecto_id, titulo: `Comentó en «${t.titulo}»` });
    // A quien tiene la tarea le llega el comentario (si no es quien lo escribió)
    if (t.responsable_usuario && t.responsable_usuario !== ctx.usuarioId) {
      const destino = t.responsable_usuario;
      after(() =>
        avisarA(ctx.negocioId, destino, { titulo: `💬 ${quien.split(" ")[0]} comentó en «${t.titulo}»`, cuerpo: limpioTexto.slice(0, 200), url: `/panel/tareas?t=${t.id}`, etiqueta: `tarea-${t.id}` })
          .then(() => undefined)
          .catch((e) => console.error("Aviso de comentario:", e))
      );
    }
    listo();
    return { ok: true };
  } catch (err) {
    return NO(err instanceof Error ? err.message : "No se pudo comentar.");
  }
}
