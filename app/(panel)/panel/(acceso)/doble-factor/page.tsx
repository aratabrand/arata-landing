import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DobleFactor from "@/components/panel/acceso/DobleFactor";
import { panelActivo } from "@/lib/panel/config";
import { estadoSesion } from "@/lib/panel/sesion";

export const metadata: Metadata = { title: "Doble factor" };

// Dos casos:
// - "activar": entró con contraseña y todavía no tiene doble factor → lo activa aquí.
// - "verificar": ya lo tiene; Better Auth dejó la entrada pendiente hasta el código.
export default async function DobleFactorPage() {
  if (!panelActivo) return <DobleFactor modo="inactivo" />;
  const s = await estadoSesion();
  if (s.estado === "completa") redirect("/panel");
  return <DobleFactor modo={s.estado === "falta-doble-factor" ? "activar" : "verificar"} />;
}
