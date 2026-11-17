import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Equipo from "@/components/panel/finanzas/Equipo";
import { cargarFinanzas } from "@/lib/panel/finanzas/datos";
import { hoyColombia } from "@/lib/panel/fecha";

export const metadata: Metadata = { title: "Equipo" };

export default async function EquipoPage() {
  const datos = await cargarFinanzas();
  if (!datos) notFound();
  return <Equipo datos={datos} hoy={hoyColombia()} />;
}
