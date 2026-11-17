import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Finanzas from "@/components/panel/finanzas/Finanzas";
import { cargarFinanzas } from "@/lib/panel/finanzas/datos";
import { hoyColombia } from "@/lib/panel/fecha";

export const metadata: Metadata = { title: "Finanzas" };

// Solo Arata San (negocio tipo 'agencia'). Un cliente de página web nunca llega aquí: notFound.
export default async function FinanzasPage() {
  const datos = await cargarFinanzas();
  if (!datos) notFound();
  return <Finanzas datos={datos} hoy={hoyColombia()} />;
}
