import { redirect } from "next/navigation";
import PanelShell from "@/components/panel/PanelShell";
import { obtenerPanel } from "@/lib/panel/datos";
import { RUTA_DOBLE_FACTOR, RUTA_ENTRAR, panelActivo } from "@/lib/panel/config";
import { estadoSesion } from "@/lib/panel/sesion";
import { contextoAgencia, negocioAgencia } from "@/lib/panel/finanzas/datos";

// Barrera real del panel: sesión válida en la base + doble factor activo.
// Finanzas y Equipo solo aparecen para miembros de la agencia (Arata San), nunca
// para clientes de página web (D-108).
export default async function PanelAppLayout({ children }: { children: React.ReactNode }) {
  let conFinanzas = true; // modo ejemplo: se muestran con datos ficticios
  let { negocio } = obtenerPanel();
  if (panelActivo) {
    const s = await estadoSesion();
    if (s.estado === "sin-sesion") redirect(RUTA_ENTRAR);
    if (s.estado === "falta-doble-factor") redirect(RUTA_DOBLE_FACTOR);
    const ctx = await contextoAgencia();
    conFinanzas = ctx !== null;
    // El marco muestra el negocio real; los módulos que aún usan datos de ejemplo llevan su franja
    const real = ctx ? await negocioAgencia(ctx.negocioId) : null;
    if (real) negocio = real;
  }
  return (
    <PanelShell negocio={negocio} conSesion={panelActivo} conFinanzas={conFinanzas}>
      {children}
    </PanelShell>
  );
}
