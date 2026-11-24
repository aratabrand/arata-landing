import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DetalleProyectoAgencia from "@/components/panel/proyectos/DetalleProyectoAgencia";
import { cargarFinanzas } from "@/lib/panel/finanzas/datos";
import { hoyColombia } from "@/lib/panel/fecha";
import { historialDe } from "@/lib/panel/historial";
import { db } from "@/lib/panel/db";
import { fechaBogota } from "@/lib/panel/fecha";

export const metadata: Metadata = { title: "Proyecto" };

// Detalle de un proyecto de Arata San. Solo proyectos del negocio de quien mira
// (cargarFinanzas ya filtra por su agencia); cualquier otro id → 404.
export default async function DetalleProyectoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const datos = await cargarFinanzas();
  const p = datos?.proyectos.find((x) => x.id === id);
  if (!datos || !p) notFound();
  const [historial, tareas] = datos.demo
    ? [[], []]
    : await Promise.all([
        historialDe(datos.negocioId, { proyectoId: p.id, limite: 100 }),
        // Tareas del equipo ligadas al proyecto (D-181): pendientes primero
        db()
          .query(
            `select t.id, t.titulo, t.estado, t.fecha, e.nombre responsable from agencia_tareas t left join equipo_personas e on e.id = t.responsable_id
              where t.negocio_id = $1 and t.proyecto_id = $2 order by (t.estado = 'hecha'), t.fecha nulls last, t.orden limit 100`,
            [datos.negocioId, p.id]
          )
          .then((r) => r.rows.map((x) => ({ id: x.id, titulo: x.titulo, estado: x.estado, responsable: x.responsable, fecha: fechaBogota(x.fecha) }))),
      ]);
  return <DetalleProyectoAgencia datos={datos} p={p} hoy={hoyColombia()} historial={historial} tareasEquipo={tareas} />;
}
