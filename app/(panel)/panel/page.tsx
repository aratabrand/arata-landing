import type { Metadata } from "next";
import Resumen from "@/components/panel/Resumen";
import { obtenerPanel } from "@/lib/panel/datos";

export const metadata: Metadata = { title: "Resumen" };

export default function PanelResumenPage() {
  return <Resumen datos={obtenerPanel()} />;
}
