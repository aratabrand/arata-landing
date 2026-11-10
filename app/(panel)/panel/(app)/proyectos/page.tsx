import type { Metadata } from "next";
import Proyectos from "@/components/panel/Proyectos";
import { obtenerPanel } from "@/lib/panel/datos";

export const metadata: Metadata = { title: "Proyectos" };

export default function PanelProyectosPage() {
  const { proyectos, hoy } = obtenerPanel();
  return <Proyectos iniciales={proyectos} hoy={hoy} />;
}
