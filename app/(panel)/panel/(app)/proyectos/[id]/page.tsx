import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DetalleProyectoAgencia from "@/components/panel/proyectos/DetalleProyectoAgencia";
import { cargarFinanzas } from "@/lib/panel/finanzas/datos";
import { hoyColombia } from "@/lib/panel/fecha";
import { historialDe } from "@/lib/panel/historial";

export const metadata: Metadata = { title: "Proyecto" };

// Detalle de un proyecto de Arata San. Solo proyectos del negocio de quien mira
// (cargarFinanzas ya filtra por su agencia); cualquier otro id → 404.
export default async function DetalleProyectoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const datos = await cargarFinanzas();
  const p = datos?.proyectos.find((x) => x.id === id);
  if (!datos || !p) notFound();
  const historial = datos.demo ? [] : await historialDe(datos.negocioId, { proyectoId: p.id, limite: 100 });
  return <DetalleProyectoAgencia datos={datos} p={p} hoy={hoyColombia()} historial={historial} />;
}
