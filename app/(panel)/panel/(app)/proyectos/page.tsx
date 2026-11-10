import type { Metadata } from "next";
import Proyectos from "@/components/panel/Proyectos";
import ProyectosAgencia from "@/components/panel/proyectos/ProyectosAgencia";
import { obtenerPanel } from "@/lib/panel/datos";
import { panelActivo } from "@/lib/panel/config";
import { cargarFinanzas } from "@/lib/panel/finanzas/datos";
import { hoyColombia } from "@/lib/panel/fecha";

export const metadata: Metadata = { title: "Proyectos" };

// Arata San con sesión: grid de proyectos reales con su proceso (D-111).
// Sin conexión o para otros negocios: el tablero de ejemplo.
export default async function PanelProyectosPage() {
  const real = panelActivo ? await cargarFinanzas() : null;
  if (real) return <ProyectosAgencia datos={real} hoy={hoyColombia()} />;
  const { proyectos, hoy } = obtenerPanel();
  return <Proyectos iniciales={proyectos} hoy={hoy} />;
}
