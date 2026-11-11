import type { Metadata } from "next";
import ConfigSitio from "@/components/panel/ConfigSitio";
import { obtenerPanel } from "@/lib/panel/datos";
import { cargarSitioAgencia } from "@/lib/panel/sitio/datos";

export const metadata: Metadata = { title: "Mi sitio" };

// Arata San con sesión: los textos reales de aratasan.com (o lo guardado en el panel), D-111.
export default async function PanelSitioPage() {
  const { configSitio, negocio } = obtenerPanel();
  const real = await cargarSitioAgencia();
  if (real) {
    return (
      <ConfigSitio
        inicial={real.config}
        negocio={{ ...negocio, nombre: "Arata San", sitio: real.url, whatsapp: "573134011189", demo: false }}
        remoto={{ puedeEditar: real.puedeEditar, fuente: real.fuente, publicado: real.publicado, publicadoEn: real.publicadoEn, puedePublicar: real.puedePublicar }}
      />
    );
  }
  return <ConfigSitio inicial={configSitio} negocio={negocio} />;
}
