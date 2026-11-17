import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Notificaciones from "@/components/panel/Notificaciones";
import { cargarFinanzas, contextoAgencia } from "@/lib/panel/finanzas/datos";
import { hoyColombia } from "@/lib/panel/fecha";
import { historialDe } from "@/lib/panel/historial";
import { alertasVencimiento } from "@/lib/panel/alertas";
import { vistoHasta } from "@/lib/panel/notificaciones";
import { clavePublica, pushActivo } from "@/lib/panel/push";
import { panelActivo } from "@/lib/panel/config";

export const metadata: Metadata = { title: "Notificaciones" };

// Notificaciones de Arata San (D-119): alertas de vencimiento + todos los cambios del panel
// (quién hizo qué y cuándo) + activar avisos en este dispositivo.
export default async function NotificacionesPage() {
  const datos = await cargarFinanzas();
  if (!datos) notFound();
  const hoy = hoyColombia();
  const alertas = alertasVencimiento(datos, hoy).map((a) => ({ id: a.proyecto.id, nombre: a.proyecto.nombre, tipo: a.tipo, dias: a.dias, texto: a.texto }));
  if (!panelActivo || datos.demo) return <Notificaciones alertas={alertas} eventos={[]} visto={null} miUsuario={null} push={{ activo: false, clave: "" }} demo />;
  const ctx = (await contextoAgencia())!;
  const [eventos, visto] = await Promise.all([historialDe(ctx.negocioId, { limite: 200 }), vistoHasta(ctx.negocioId, ctx.usuarioId)]);
  return <Notificaciones alertas={alertas} eventos={eventos} visto={visto} miUsuario={ctx.usuarioId} push={{ activo: pushActivo, clave: clavePublica() }} />;
}
