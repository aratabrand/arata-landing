import type { Metadata } from "next";
import Clientes from "@/components/panel/Clientes";
import { obtenerPanel } from "@/lib/panel/datos";

export const metadata: Metadata = { title: "Clientes" };

export default function PanelClientesPage() {
  const { clientes, hoy } = obtenerPanel();
  return <Clientes iniciales={clientes} hoy={hoy} />;
}
