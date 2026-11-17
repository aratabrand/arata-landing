import type { Metadata } from "next";
import Clientes from "@/components/panel/Clientes";
import ClientesAgencia from "@/components/panel/ClientesAgencia";
import { obtenerPanel } from "@/lib/panel/datos";
import { cargarClientesAgencia } from "@/lib/panel/clientes/datos";

export const metadata: Metadata = { title: "Clientes" };

// Arata San con sesión: clientes reales desde Neon (D-110). Si no, el ejemplo.
export default async function PanelClientesPage() {
  const real = await cargarClientesAgencia();
  if (real) return <ClientesAgencia datos={real} />;
  const { clientes, hoy } = obtenerPanel();
  return <Clientes iniciales={clientes} hoy={hoy} />;
}
