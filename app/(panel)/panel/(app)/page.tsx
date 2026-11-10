import type { Metadata } from "next";
import Resumen from "@/components/panel/Resumen";
import ResumenAgencia from "@/components/panel/ResumenAgencia";
import { obtenerPanel } from "@/lib/panel/datos";
import { panelActivo } from "@/lib/panel/config";
import { cargarFinanzas } from "@/lib/panel/finanzas/datos";
import { cargarClientesAgencia } from "@/lib/panel/clientes/datos";
import { hoyColombia } from "@/lib/panel/fecha";

export const metadata: Metadata = { title: "Resumen" };

// Arata San con sesión: resumen con datos reales (D-113). Si no, el ejemplo.
export default async function PanelResumenPage() {
  if (panelActivo) {
    const [fin, cli] = await Promise.all([cargarFinanzas(), cargarClientesAgencia()]);
    if (fin && cli) {
      const nombre = fin.personas.find((p) => p.id === fin.miPersonaId)?.nombre ?? "equipo";
      return <ResumenAgencia datos={fin} clientes={cli.clientes} hoy={hoyColombia()} nombre={nombre} />;
    }
  }
  return <Resumen datos={obtenerPanel()} />;
}
