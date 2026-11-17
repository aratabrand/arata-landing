import { db } from "./db";

// Contador de "sin leer" para el menú (D-119): cambios de OTRAS personas desde la última
// vez que abrió Notificaciones + proyectos por vencer o tarde. Una sola consulta liviana.
export async function contarSinLeer(negocioId: string, usuarioId: string) {
  const r = await db().query(
    `select
       (select count(*) from panel_historial h
         where h.negocio_id = $1 and h.usuario_id is distinct from $2
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
