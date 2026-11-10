import { redirect } from "next/navigation";
import PanelShell from "@/components/panel/PanelShell";
import { obtenerPanel } from "@/lib/panel/datos";
import { RUTA_DOBLE_FACTOR, RUTA_ENTRAR, panelActivo } from "@/lib/panel/config";
import { estadoSesion } from "@/lib/panel/sesion";

// Barrera real del panel: sesión válida en la base + doble factor activo.
export default async function PanelAppLayout({ children }: { children: React.ReactNode }) {
  if (panelActivo) {
    const s = await estadoSesion();
    if (s.estado === "sin-sesion") redirect(RUTA_ENTRAR);
    if (s.estado === "falta-doble-factor") redirect(RUTA_DOBLE_FACTOR);
  }
  const { negocio } = obtenerPanel();
  return (
    <PanelShell negocio={negocio} conSesion={panelActivo}>
      {children}
    </PanelShell>
  );
}
