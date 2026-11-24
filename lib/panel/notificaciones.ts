import { db } from "./db";
import { historialMapa, type EventoHistorial } from "./historial";
import { HORAS_NOTIFICACION } from "./tiempo";

// Notificaciones de cada persona (D-185): cambios de OTRAS personas de las últimas 24 horas que
// no haya borrado (una por una o con «Borrar todas»). El historial no se toca. $1 negocio, $2 usuario.
const VIVAS = `h.negocio_id = $1 and h.usuario_id is distinct from $2
           and h.creado > now() - interval '${HORAS_NOTIFICACION} hours'
           and h.creado > coalesce((select borradas_hasta from notificaciones_vistas v where v.usuario_id = $2 and v.negocio_id = $1), '-infinity')
           and not exists (select 1 from notificaciones_borradas b where b.usuario_id = $2 and b.historial_id = h.id)`;

/** Las notificaciones vivas de esta persona, de la más nueva a la más vieja. */
export async function misNotificaciones(negocioId: string, usuarioId: string, limite = 60): Promise<EventoHistorial[]> {
  const r = await db().query(
    `select h.id, h.quien, h.usuario_id, h.accion, h.entidad, h.entidad_id, h.proyecto_id, h.cliente_id, h.titulo, h.cambios, h.importante, h.creado
       from panel_historial h where ${VIVAS} order by h.creado desc, h.id desc limit $3`,
    [negocioId, usuarioId, Math.min(200, limite)]
  );
  return r.rows.map(historialMapa);
}

/** Quita una notificación solo para esta persona (el historial queda igual). */
export async function borrarNotificacion(negocioId: string, usuarioId: string, historialId: number) {
  await db().query(
    `insert into notificaciones_borradas (usuario_id, historial_id)
     select $2, h.id from panel_historial h where h.id = $3 and h.negocio_id = $1
     on conflict do nothing`,
    [negocioId, usuarioId, historialId]
  );
}

/** «Borrar todas»: lo que llegó hasta ahora ya no se muestra (y se da por visto). */
export async function borrarTodas(negocioId: string, usuarioId: string) {
  await db().query(
    `insert into notificaciones_vistas (usuario_id, negocio_id, visto_hasta, borradas_hasta) values ($1, $2, now(), now())
     on conflict (usuario_id, negocio_id) do update set visto_hasta = now(), borradas_hasta = now()`,
    [usuarioId, negocioId]
  );
  // Las borradas una por una ya no hacen falta
  await db().query(`delete from notificaciones_borradas where usuario_id = $1`, [usuarioId]);
}

/** Limpieza (aviso diario): lo borrado a mano de hace más de un día ya caducó solo. */
export async function limpiarBorradas() {
  await db().query(`delete from notificaciones_borradas where borrado < now() - interval '2 days'`);
}

// Contador de "sin leer" para el menú (D-119): cambios de OTRAS personas desde la última
// vez que abrió Notificaciones + proyectos por vencer o tarde. Una sola consulta liviana.
export async function contarSinLeer(negocioId: string, usuarioId: string) {
  const r = await db().query(
    `select
       (select count(*) from panel_historial h
         where ${VIVAS}
           and h.creado > coalesce((select visto_hasta from notificaciones_vistas v where v.usuario_id = $2 and v.negocio_id = $1), '-infinity'))::int cambios,
       (select count(*) from fin_proyectos p
         where p.negocio_id = $1 and p.estado <> 'propuesta' and p.fecha_limite is not null and p.fecha_limite <= current_date + 2
           and (exists (select 1 from fin_tareas t where t.proyecto_id = p.id and not t.hecha)
                or (p.estado <> 'cerrado' and not exists (select 1 from fin_tareas t where t.proyecto_id = p.id))))::int alertas`,
    [negocioId, usuarioId]
  );
  return { cambios: r.rows[0].cambios as number, alertas: r.rows[0].alertas as number };
}

export async function vistoHasta(negocioId: string, usuarioId: string): Promise<string | null> {
  const r = await db().query(`select visto_hasta from notificaciones_vistas where usuario_id = $1 and negocio_id = $2`, [usuarioId, negocioId]);
  return r.rows[0]?.visto_hasta?.toISOString?.() ?? null;
}

export async function marcarVisto(negocioId: string, usuarioId: string) {
  await db().query(
    `insert into notificaciones_vistas (usuario_id, negocio_id, visto_hasta) values ($1, $2, now())
     on conflict (usuario_id, negocio_id) do update set visto_hasta = now()`,
    [usuarioId, negocioId]
  );
}
