import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Entrar from "@/components/panel/acceso/Entrar";
import { panelActivo } from "@/lib/panel/config";
import { estadoSesion } from "@/lib/panel/sesion";

export const metadata: Metadata = { title: "Entrar" };

export default async function EntrarPage() {
  if (panelActivo && (await estadoSesion()).estado === "completa") redirect("/panel");
  return <Entrar activo={panelActivo} />;
}
