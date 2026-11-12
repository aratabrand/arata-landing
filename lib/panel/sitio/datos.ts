import { db } from "../db";
import { panelActivo } from "../config";
import { contextoAgencia } from "../finanzas/datos";
import type { ConfigSitio } from "@/content/panel/tipos";
import { AGENDAR, hero, menu, seoInicio } from "@/content/inicio";
import { site } from "@/lib/site";

// "Mi sitio" de Arata San con datos reales (D-111).
// Fuente: lo que hoy publica aratasan.com (content/inicio.ts). Si Sergio ya guardó
// cambios en el panel, se muestra lo guardado (config_sitio) y se avisa qué difiere.

/** Los textos y botones que hoy publica aratasan.com, en la forma del panel. */
export function sitioPublicado(): ConfigSitio {
  return {
    seo: { titulo: seoInicio.titulo, descripcion: seoInicio.descripcion },
    portada: { titulo: `${hero.titulo} ${hero.tituloSigue}`, subtitulo: hero.subtitulo },
    anuncio: { activo: false, texto: "" },
    botones: [
      { id: "portada-principal", ubicacion: "Portada · principal", texto: hero.ctaPrincipal, enlace: AGENDAR, estilo: "principal" },
      { id: "portada-secundario", ubicacion: "Portada · secundario", texto: hero.ctaSecundario, enlace: "/#trabajos", estilo: "secundario" },
      { id: "menu", ubicacion: "Menú", texto: menu.cta, enlace: AGENDAR, estilo: "principal" },
    ],
    actualizado: null,
  };
}

export type DatosSitio = {
  puedeEditar: boolean;
  config: ConfigSitio;
  /** "sitio" = leído de aratasan.com; "panel" = lo último guardado en el panel. */
  fuente: "sitio" | "panel";
  /** Lo que hoy está en aratasan.com: lo último publicado desde el panel o, si nunca, content/inicio.ts. */
  publicado: ConfigSitio;
  publicadoEn: string | null;
  /** ¿Está configurado el enlace de Vercel para reconstruir el sitio? (SITIO_DEPLOY_HOOK) */
  puedePublicar: boolean;
  url: string;
};

export async function cargarSitioAgencia(): Promise<DatosSitio | null> {
  if (!panelActivo) return null;
  const ctx = await contextoAgencia();
  if (!ctx) return null;
  const base = sitioPublicado();
  const r = (await db().query(`select datos, actualizado, publicado, publicado_en from config_sitio where negocio_id = $1`, [ctx.negocioId])).rows[0];
  const publicado: ConfigSitio = r?.publicado ? { ...base, ...(r.publicado as ConfigSitio), anuncio: base.anuncio, actualizado: null } : base;
  const config: ConfigSitio = r ? { ...(r.datos as ConfigSitio), actualizado: r.actualizado?.toISOString?.() ?? null } : publicado;
  return {
    puedeEditar: ctx.esDueno,
    config,
    fuente: r ? "panel" : "sitio",
    publicado,
    publicadoEn: r?.publicado_en?.toISOString?.() ?? null,
    puedePublicar: Boolean(process.env.SITIO_DEPLOY_HOOK),
    url: site.url,
  };
}
