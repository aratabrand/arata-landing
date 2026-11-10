import type { Metadata } from "next";
import ConfigSitio from "@/components/panel/ConfigSitio";
import { obtenerPanel } from "@/lib/panel/datos";

export const metadata: Metadata = { title: "Mi sitio" };

export default function PanelSitioPage() {
  const { configSitio, negocio } = obtenerPanel();
  return <ConfigSitio inicial={configSitio} negocio={negocio} />;
}
