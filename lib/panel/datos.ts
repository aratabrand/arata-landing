import * as demo from "@/content/panel/demo";

// Única puerta de entrada a los datos del panel.
// Hoy devuelve el negocio de ejemplo. Para un cliente real, esta función lee
// Supabase con la sesión del usuario (RLS por negocio_id) y devuelve las MISMAS
// formas de content/panel/tipos.ts. Ver docs/panel-cliente/02-modelo-de-datos.md.

export function obtenerPanel() {
  return {
    negocio: demo.negocio,
    hoy: demo.HOY,
    dias: demo.dias,
    fuentes: demo.fuentes,
    productosTop: demo.productosTop,
    ventasRecientes: demo.ventasRecientes,
    clientes: demo.clientes,
    proyectos: demo.proyectos,
    configSitio: demo.configSitio,
  };
}

export type DatosPanel = ReturnType<typeof obtenerPanel>;
