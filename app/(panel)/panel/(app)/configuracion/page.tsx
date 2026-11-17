import type { Metadata } from "next";
import Configuracion from "@/components/panel/Configuracion";
import { panelActivo } from "@/lib/panel/config";
import { contextoAgencia } from "@/lib/panel/finanzas/datos";

export const metadata: Metadata = { title: "Configuración" };

// Configuración (D-120): tarjetas con Ajustes del sitio, Equipo y Notificaciones.
// En el modo ejemplo se muestran todas, como el resto del panel de ejemplo.
export default async function ConfiguracionPage() {
  const agencia = panelActivo ? (await contextoAgencia()) !== null : true;
  return <Configuracion agencia={agencia} />;
}
