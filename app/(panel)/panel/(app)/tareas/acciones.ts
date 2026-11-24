"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { db } from "@/lib/panel/db";
import { panelActivo } from "@/lib/panel/config";
import { contextoAgencia, type ContextoAgencia } from "@/lib/panel/finanzas/datos";
import { diferencias, registrar } from "@/lib/panel/historial";
import { avisarA } from "@/lib/panel/push";
import { hoyColombia } from "@/lib/panel/fecha";
import { AREAS, ESTADOS_TAREA, FECHA, PRIORIDADES_TAREA, RECORDATORIOS, fechaCorta, moverRango, rangoTexto, type Area, type EstadoTarea, type PrioridadTarea } from "@/lib/panel/tareas/tareas";
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
      `select t.id, t.titulo, t.descripcion, t.area, t.proyecto_id, t.fecha::text fecha, t.fecha_fin::text fecha_fin, t.prioridad, t.estado, t.recordatorio, f.nombre proyecto,
              coalesce((select json_agg(json_build_object('id', p.id, 'nombre', p.nombre, 'usuario', p.usuario_id) order by p.orden, p.creado)
                          from tarea_responsables r join equipo_personas p on p.id = r.persona_id where r.tarea_id = t.id), '[]') responsables
         from agencia_tareas t left join fin_proyectos f on f.id = t.proyecto_id
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
        fecha: string | null;
        fecha_fin: string | null;
        prioridad: PrioridadTarea;
        estado: EstadoTarea;
        recordatorio: keyof typeof RECORDATORIOS | null;
        /** Responsables (D-186): persona, nombre y su usuario del panel (para avisos). */
        responsables: { id: string; nombre: string; usuario: string | null }[];
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

/** Deja en la lista exactamente esas personas (D-186). */
async function guardarResponsables(tareaId: string, ids: string[]) {
  await db().query(`delete from tarea_responsables where tarea_id = $1 and not (persona_id = any($2::uuid[]))`, [tareaId, ids]);
  if (ids.length)
    await db().query(`insert into tarea_responsables (tarea_id, persona_id) select $1, x from unnest($2::uuid[]) x on conflict do nothing`, [tareaId, ids]);
}

export type EntradaTarea = {
  id?: string;
  titulo: string;
  descripcion?: string;
  area: string;
  proyectoId?: string | null;
  /** Personas del equipo que la hacen (D-186: una o varias; vacío = sin asignar). */
  responsableIds?: string[];
  fecha?: string | null;
  /** Día en que debe quedar lista (D-187). Vacío = la tarea es de un solo día. */
  fechaFin?: string | null;
  prioridad: string;
  estado?: string;
  /** Clave de RECORDATORIOS o vacío (sin recordatorio, D-183). */
  recordatorio?: string | null;
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
    let fechaFin = e.fechaFin ? String(e.fechaFin) : null;
    if (fechaFin && !FECHA.test(fechaFin)) return NO("Revisa la fecha final.");
    if (fechaFin && !fecha) return NO("Para poner fecha final, elige también el día en que empieza.");
    if (fechaFin && fecha && fechaFin < fecha) return NO("La fecha final no puede ser antes del día en que empieza.");
    if (fechaFin === fecha) fechaFin = null;
    const proyectoId = e.proyectoId || null;
    if (proyectoId && !(UUID.test(proyectoId) && (await db().query(`select 1 from fin_proyectos where id = $1 and negocio_id = $2`, [proyectoId, ctx.negocioId])).rowCount))
      return NO("Ese proyecto no existe.");
    // Responsables (D-186): solo personas activas del equipo de la agencia, sin repetir
    const pedidos = [...new Set((Array.isArray(e.responsableIds) ? e.responsableIds : []).map(String))];
    if (pedidos.length > 10) return NO("Máximo 10 personas por tarea.");
    if (pedidos.some((x) => !UUID.test(x))) return NO("Elige personas del equipo.");
    const personas = pedidos.length
      ? ((
          await db().query(`select id, nombre, usuario_id from equipo_personas where negocio_id = $1 and activo and id = any($2::uuid[]) order by orden, creado`, [ctx.negocioId, pedidos])
        ).rows as { id: string; nombre: string; usuario_id: string | null }[])
      : [];
    if (personas.length !== pedidos.length) return NO("Elige personas del equipo.");
    const responsableIds = personas.map((x) => x.id);
    const nombres = (l: { nombre: string }[]) => (l.length ? l.map((x) => x.nombre).join(", ") : "Sin asignar");
    const recordatorio = e.recordatorio ? String(e.recordatorio) : null;
    if (recordatorio && !(recordatorio in RECORDATORIOS)) return NO("Elige un recordatorio de la lista.");
    const area = e.area as Area;
    const prioridad = e.prioridad as PrioridadTarea;

    if (!e.id) {
      // Nueva: al final del día elegido
      const orden = fecha
        ? Number((await db().query(`select coalesce(max(orden), 0) + 1 n from agencia_tareas where negocio_id = $1 and fecha = $2`, [ctx.negocioId, fecha])).rows[0].n)
        : 0;
      const id = (
        await db().query(
          `insert into agencia_tareas (negocio_id, titulo, descripcion, area, proyecto_id, responsable_id, fecha, prioridad, estado, orden, creado_por, hecha_en, recordatorio, recordatorio_por, fecha_fin)
           values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, case when $9 = 'hecha' then now() end, $12, case when $12::text is not null then $11 end, $13) returning id`,
          [ctx.negocioId, titulo, descripcion, area, proyectoId, responsableIds[0] ?? null, fecha, prioridad, estado, orden, ctx.usuarioId, recordatorio, fechaFin]
        )
      ).rows[0].id as string;
      await guardarResponsables(id, responsableIds);
      await registrar(ctx, {
        accion: "crear",
        entidad: "tarea",
        entidadId: id,
        proyectoId,
        titulo: `Creó la tarea «${titulo}»${personas.length ? ` para ${nombres(personas)}` : ""}`,
      });
      personas.forEach((x) => avisarAsignada(ctx, { id, titulo, fecha, prioridad }, x.usuario_id));
      listo();
      return { ok: true, id };
    }

    const antes = await tareaDe(ctx, e.id);
    if (!antes) return NO("Esa tarea no existe.");
    await db().query(
      `update agencia_tareas set titulo = $3, descripcion = $4, area = $5, proyecto_id = $6, responsable_id = $7, fecha = $8, prioridad = $9, estado = $10,
              hecha_en = case when $10 = 'hecha' then coalesce(hecha_en, now()) else null end, actualizado = now(),
              recordatorio = $11, fecha_fin = $13,
              -- Quien pone o cambia el recordatorio también lo recibe
              recordatorio_por = case when $11::text is null then null when recordatorio is distinct from $11 then $12 else recordatorio_por end
        where id = $1 and negocio_id = $2`,
      [antes.id, ctx.negocioId, titulo, descripcion, area, proyectoId, responsableIds[0] ?? null, fecha, prioridad, estado, recordatorio, ctx.usuarioId, fechaFin]
    );
    await guardarResponsables(antes.id, responsableIds);
    const proyecto = proyectoId ? ((await db().query(`select nombre from fin_proyectos where id = $1`, [proyectoId])).rows[0]?.nombre as string) : null;
    const hoy = hoyColombia();
    const cambios = diferencias(
      {
        titulo: antes.titulo,
        responsable: nombres(antes.responsables),
        fecha: rangoTexto({ fecha: antes.fecha, fechaFin: antes.fecha_fin }, hoy),
        prioridad: PRIORIDADES_TAREA[antes.prioridad],
        estado: ESTADOS_TAREA[antes.estado],
        area: AREAS[antes.area],
        proyecto: antes.proyecto,
        descripcion: antes.descripcion,
        recordatorio: antes.recordatorio ? RECORDATORIOS[antes.recordatorio] : "Sin recordatorio",
      },
      {
        titulo,
        responsable: nombres(personas),
        fecha: rangoTexto({ fecha, fechaFin }, hoy),
        prioridad: PRIORIDADES_TAREA[prioridad],
        estado: ESTADOS_TAREA[estado],
        area: AREAS[area],
        proyecto,
        descripcion,
        recordatorio: recordatorio ? RECORDATORIOS[recordatorio as keyof typeof RECORDATORIOS] : "Sin recordatorio",
      },
      { titulo: "Título", responsable: "Responsables", fecha: "Fecha", prioridad: "Prioridad", estado: "Estado", area: "Área", proyecto: "Proyecto", descripcion: "Descripción", recordatorio: "Recordatorio" }
    );
    if (cambios.length) await registrar(ctx, { accion: "editar", entidad: "tarea", entidadId: antes.id, proyectoId, titulo: `Editó la tarea «${titulo}»`, cambios });
    // Aviso solo a quien se sumó ahora
    const yaEstaban = new Set(antes.responsables.map((x) => x.id));
    personas.filter((x) => !yaEstaban.has(x.id)).forEach((x) => avisarAsignada(ctx, { id: antes.id, titulo, fecha, prioridad }, x.usuario_id));
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
export async function moverTarea(entrada: { id: string; fecha: string | null; antesDe?: string | null; desde?: string | null }): Promise<Resultado> {
  try {
    const ctx = await contexto();
    if (esFallo(ctx)) return ctx;
    const fecha = entrada.fecha || null;
    if (fecha && !FECHA.test(fecha)) return NO("Día no válido.");
    const t = await tareaDe(ctx, entrada.id);
    if (!t) return NO("Esa tarea no existe.");
    // Rango (D-187): se mueve completo, conservando cuántos días dura. `desde` = columna de donde se arrastró
    const desde = entrada.desde && FECHA.test(entrada.desde) ? entrada.desde : t.fecha;
    const { fecha: inicio, fechaFin: fin } = moverRango({ fecha: t.fecha, fechaFin: t.fecha_fin }, fecha, desde);
    const delDia = (
      await db().query(`select id from agencia_tareas where negocio_id = $1 and fecha is not distinct from $2::date and id <> $3 order by orden, creado`, [ctx.negocioId, inicio, t.id])
    ).rows.map((r) => r.id as string);
    const i = entrada.antesDe ? delDia.indexOf(entrada.antesDe) : -1;
    delDia.splice(i < 0 ? delDia.length : i, 0, t.id);
    await db().query(`update agencia_tareas set fecha = $3, fecha_fin = $4, actualizado = now() where id = $1 and negocio_id = $2`, [t.id, ctx.negocioId, inicio, fin]);
    await db().query(
      `update agencia_tareas a set orden = x.orden from unnest($2::uuid[]) with ordinality as x(id, orden) where a.id = x.id and a.negocio_id = $1`,
      [ctx.negocioId, delDia]
    );
    if (t.fecha !== inicio) {
      const hoy = hoyColombia();
      const nuevo = rangoTexto({ fecha: inicio, fechaFin: fin }, hoy);
      await registrar(ctx, {
        accion: "editar",
        entidad: "tarea",
        entidadId: t.id,
        proyectoId: t.proyecto_id,
        titulo: `Movió «${t.titulo}» a ${nuevo.toLowerCase()}`,
        cambios: [{ campo: "Fecha", antes: rangoTexto({ fecha: t.fecha, fechaFin: t.fecha_fin }, hoy), despues: nuevo }],
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
    // A quienes tienen la tarea les llega el comentario (menos a quien lo escribió)
    const destinos = [...new Set(t.responsables.map((x) => x.usuario).filter((u): u is string => Boolean(u) && u !== ctx.usuarioId))];
    if (destinos.length)
      after(async () => {
        for (const destino of destinos)
          await avisarA(ctx.negocioId, destino, { titulo: `💬 ${quien.split(" ")[0]} comentó en «${t.titulo}»`, cuerpo: limpioTexto.slice(0, 200), url: `/panel/tareas?t=${t.id}`, etiqueta: `tarea-${t.id}` }).catch((e) =>
            console.error("Aviso de comentario:", e)
          );
      });
    listo();
    return { ok: true };
  } catch (err) {
    return NO(err instanceof Error ? err.message : "No se pudo comentar.");
  }
}
