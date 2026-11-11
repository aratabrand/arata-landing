import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { V2_PUBLICADO } from "@/lib/lanzamiento";
import { INICIO } from "@/content/inicio";
import { proyectos } from "@/content/proyectos";

// Antes de lanzar: solo la v1. Con V2_PUBLICADO: todas las páginas públicas de la v2
// (no van /sistema, /agendar/gracias ni /v2 una vez el Inicio pase a "/").
export default function sitemap(): MetadataRoute.Sitemap {
  if (process.env.PANEL_SOLO === "1") return []; // el panel no va en Google (D-115)
  const ahora = new Date();
  if (!V2_PUBLICADO) {
    return [{ url: site.url, lastModified: ahora, changeFrequency: "monthly", priority: 1 }];
  }
  const url = (p: string) => `${site.url}${p === "/" ? "" : p}`;
  return [
    { url: url(INICIO), lastModified: ahora, changeFrequency: "weekly", priority: 1 },
    { url: url("/paginas-web"), lastModified: ahora, changeFrequency: "monthly", priority: 0.9 },
    { url: url("/catalogos-y-sistemas"), lastModified: ahora, changeFrequency: "monthly", priority: 0.9 },
    { url: url("/agendar"), lastModified: ahora, changeFrequency: "monthly", priority: 0.9 },
    { url: url("/portafolio"), lastModified: ahora, changeFrequency: "monthly", priority: 0.8 },
    ...proyectos.map((p) => ({
      url: url(`/portafolio/${p.slug}`),
      lastModified: ahora,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: url("/privacidad"), lastModified: ahora, changeFrequency: "yearly", priority: 0.3 },
  ];
}
