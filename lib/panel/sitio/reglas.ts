import type { ConfigSitio as Config } from "@/content/panel/tipos";

// Reglas de "Mi sitio": límites y validación. Las usa la pantalla (aviso en vivo)
// y el servidor (antes de guardar), así nunca se guarda algo que la pantalla rechazaría.

export const LIM = { seoTitulo: 60, seoDesc: 155, titulo: 70, subtitulo: 170, anuncio: 60, boton: 28 };

/** Enlaces permitidos: https, rutas internas, wa.me, tel: y mailto:. Nada de javascript:. */
export function enlaceValido(url: string) {
  const u = url.trim();
  if (u.startsWith("/")) return !u.startsWith("//");
  return /^(https:\/\/[^\s]+|tel:\+?[\d\s-]{7,}|mailto:[^\s@]+@[^\s@]+)$/i.test(u);
}

export function errores(c: Config) {
  const e: Record<string, string> = {};
  if (!c.seo.titulo.trim()) e.seoTitulo = "El título no puede quedar vacío.";
  if (c.seo.titulo.length > LIM.seoTitulo) e.seoTitulo = `Google corta el título después de ${LIM.seoTitulo} caracteres.`;
  if (c.seo.descripcion.length > LIM.seoDesc) e.seoDesc = `Google corta la descripción después de ${LIM.seoDesc} caracteres.`;
  if (!c.portada.titulo.trim()) e.titulo = "La portada necesita un título.";
  c.botones.forEach((b) => {
    if (!b.texto.trim()) e[`bt-${b.id}`] = "Escribe el texto del botón.";
    else if (!enlaceValido(b.enlace)) e[`bl-${b.id}`] = "Usa un enlace que empiece por https://, / o wa.me.";
  });
  return e;
}
