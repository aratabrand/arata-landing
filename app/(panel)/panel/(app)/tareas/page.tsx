import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Tareas from "@/components/panel/tareas/Tareas";
import { cargarTareas } from "@/lib/panel/tareas/datos";
import { FECHA } from "@/lib/panel/tareas/tareas";

export const metadata: Metadata = { title: "Tareas" };

// Tareas del equipo de Arata San (D-181). Solo la agencia: sin sesión real, al Resumen.
//   ?t=<id>                    abre esa tarea (los avisos al celular llegan aquí)
//   ?nueva=1&proyecto=<id>     abre «Nueva tarea» ligada a un proyecto (desde su ficha)
export default async function PanelTareasPage({ searchParams }: { searchParams: Promise<{ t?: string; nueva?: string; proyecto?: string; fecha?: string }> }) {
  const datos = await cargarTareas();
  if (!datos) redirect("/panel");
  const p = await searchParams;
  const uuid = /^[0-9a-f-]{36}$/i;
  const abrir = p.t && uuid.test(p.t) ? p.t : undefined;
  const nueva = p.nueva
    ? {
        proyectoId: p.proyecto && uuid.test(p.proyecto) && datos.proyectos.some((x) => x.id === p.proyecto) ? p.proyecto : null,
        fecha: p.fecha && FECHA.test(p.fecha) ? p.fecha : datos.hoy,
        area: "proyectos" as const,
      }
    : undefined;
  return <Tareas datos={datos} abrir={abrir} nueva={nueva} />;
}
