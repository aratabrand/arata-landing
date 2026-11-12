import { redirect } from "next/navigation";
import PanelShell from "@/components/panel/PanelShell";
import { obtenerPanel } from "@/lib/panel/datos";
import { RUTA_DOBLE_FACTOR, RUTA_ENTRAR, panelActivo } from "@/lib/panel/config";
import { estadoSesion } from "@/lib/panel/sesion";
import { contextoAgencia, negocioAgencia } from "@/lib/panel/finanzas/datos";
import { contarSinLeer } from "@/lib/panel/notificaciones";

// Barrera real del panel: sesión válida en la base + doble factor activo.
// Finanzas y Equipo solo aparecen para miembros de la agencia (Arata San), nunca
// para clientes de página web (D-109).
export default async function PanelAppLayout({ children }: { children: React.ReactNode }) {
  let conFinanzas = true; // modo ejemplo: se muestran con datos ficticios
  // Rutas que no llevan la franja de "panel de ejemplo" (tienen datos reales o su propio aviso)
  let sinFranja = ["/panel/finanzas", "/panel/equipo"];
  let { negocio } = obtenerPanel();
  let sinLeer = 0;
  if (panelActivo) {
    const s = await estadoSesion();
    if (s.estado === "sin-sesion") redirect(RUTA_ENTRAR);
    if (s.estado === "falta-doble-factor") redirect(RUTA_DOBLE_FACTOR);
    const ctx = await contextoAgencia();
    conFinanzas = ctx !== null;
    // El marco muestra el negocio real; los módulos que aún usan datos de ejemplo llevan su franja
    const real = ctx ? await negocioAgencia(ctx.negocioId) : null;
    if (real) {
      negocio = real;
      // Todo el panel de Arata ya usa datos reales (D-110 a D-114): sin franja de ejemplo
      sinFranja = ["/panel"];
      // Contador de Notificaciones (D-119). Si falla, el panel sigue sin contador.
      const n = await contarSinLeer(ctx!.negocioId, ctx!.usuarioId).catch(() => null);
      sinLeer = n ? n.cambios + n.alertas : 0;
    }
  }
  return (
    <PanelShell negocio={negocio} conSesion={panelActivo} conFinanzas={conFinanzas} sinFranja={sinFranja} sinLeer={sinLeer}>
      {children}
    </PanelShell>
  );
}
