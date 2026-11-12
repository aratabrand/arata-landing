import http from "node:http";
import https from "node:https";
import { AGENDAR, hero, menu, seoInicio } from "@/content/inicio";

// Textos del Inicio que Sergio puede cambiar desde el panel (Mi sitio · D-117).
//
// Cómo llegan: al PUBLICAR en el panel, Vercel reconstruye el sitio y, durante esa
// construcción, este archivo pide lo publicado a ${PANEL_URL}/api/sitio. Las páginas
// siguen siendo estáticas: el visitante no espera a ninguna base ni API (0 KB extra).
//
// - Sin PANEL_URL (local) → los textos de content/inicio.ts.
// - El panel nunca publicó → los textos de content/inicio.ts.
// - El panel no responde (después de esperarlo ~3 min) → la construcción FALLA a propósito y queda en línea la versión
//   anterior (mejor eso que volver en silencio a textos viejos). Para construir igual sin
//   el panel: SITIO_SIN_PANEL=1.

export type Boton = { texto: string; enlace: string };
export type TextosSitio = {
  seo: { titulo: string; descripcion: string };
  portada: { titulo: string; tituloSigue: string; subtitulo: string; principal: Boton; secundario: Boton };
  menu: Boton;
};

export const textosBase: TextosSitio = {
  seo: { titulo: seoInicio.titulo, descripcion: seoInicio.descripcion },
  portada: {
    titulo: hero.titulo,
    tituloSigue: hero.tituloSigue,
    subtitulo: hero.subtitulo,
    principal: { texto: hero.ctaPrincipal, enlace: AGENDAR },
    secundario: { texto: hero.ctaSecundario, enlace: "/#trabajos" },
  },
  menu: { texto: menu.cta, enlace: AGENDAR },
};

/** Primera frase en blanco, lo que sigue en lima (como el título actual). */
export function partirTitulo(t: string): { titulo: string; tituloSigue: string } {
  const m = t.trim().match(/^(.+?[.!?])\s+(.+)$/);
  return m ? { titulo: m[1], tituloSigue: m[2] } : { titulo: t.trim(), tituloSigue: "" };
}

// Mismas reglas de enlace que el panel: nunca se pinta algo como javascript:
const enlaceSeguro = (u: unknown, base: string) => {
  const s = typeof u === "string" ? u.trim() : "";
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  return /^(https:\/\/[^\s]+|tel:\+?[\d\s-]{7,}|mailto:[^\s@]+@[^\s@]+)$/i.test(s) ? s : base;
};
const texto = (v: unknown, base: string, max: number) => {
  const s = typeof v === "string" ? v.trim() : "";
  return s ? s.slice(0, max) : base;
};

type Publicado = {
  seo?: { titulo?: string; descripcion?: string };
  portada?: { titulo?: string; subtitulo?: string };
  botones?: { id?: string; texto?: string; enlace?: string }[];
};

/** Convierte lo publicado en el panel a los textos del sitio (lo que falte queda como está). */
export function aplicarPublicado(p: Publicado | null): TextosSitio {
  if (!p) return textosBase;
  const b = textosBase;
  const boton = (id: string, base: Boton): Boton => {
    const x = p.botones?.find((y) => y.id === id);
    return x ? { texto: texto(x.texto, base.texto, 40), enlace: enlaceSeguro(x.enlace, base.enlace) } : base;
  };
  const tituloPortada = texto(p.portada?.titulo, `${b.portada.titulo} ${b.portada.tituloSigue}`, 90);
  return {
    seo: { titulo: texto(p.seo?.titulo, b.seo.titulo, 90), descripcion: texto(p.seo?.descripcion, b.seo.descripcion, 220) },
    portada: {
      ...partirTitulo(tituloPortada),
      subtitulo: texto(p.portada?.subtitulo, b.portada.subtitulo, 220),
      principal: boton("portada-principal", b.portada.principal),
      secundario: boton("portada-secundario", b.portada.secundario),
    },
    menu: boton("menu", b.menu),
  };
}

/** Un enlace que sale del sitio se abre aparte (con noopener, regla de seguridad §10). */
export const esExterno = (enlace: string) => /^https:\/\//i.test(enlace);

// node:https y no fetch(): el fetch de Next guarda respuestas entre construcciones
// (Data Cache) y podría devolver lo publicado antes. Esto siempre pide lo último.
async function pedir(url: string): Promise<Publicado | null> {
  const get = url.startsWith("http://") ? http.get : https.get;
  return new Promise((resolve, reject) => {
    const req = get(url, { headers: { accept: "application/json" }, timeout: 8000 }, (res) => {
      let cuerpo = "";
      res.setEncoding("utf8");
      res.on("data", (c: string) => (cuerpo += c));
      res.on("end", () => {
        if (res.statusCode !== 200) return reject(new Error(`respondió ${res.statusCode}`));
        try {
          resolve((JSON.parse(cuerpo) as { publicado: Publicado | null }).publicado ?? null);
        } catch {
          reject(new Error("respuesta que no es JSON"));
        }
      });
    });
    req.on("timeout", () => req.destroy(new Error("no respondió en 8 s")));
    req.on("error", reject);
  });
}

let cache: Promise<TextosSitio> | null = null;

/** Textos del Inicio para esta construcción (se piden una sola vez por proceso). */
export function textosSitio(): Promise<TextosSitio> {
  cache ??= (async () => {
    const panel = (process.env.PANEL_URL ?? "").replace(/\/$/, "");
    if (!panel || process.env.SITIO_SIN_PANEL === "1" || process.env.PANEL_SOLO === "1") return textosBase;
    const url = `${panel}/api/sitio`;
    let ultimo: unknown;
    // Al subir a main, Vercel construye el sitio y el panel a la vez: si el panel todavía
    // no termina (responde 307/404/502), se espera hasta ~3 min antes de rendirse.
    const esperas = [2, 5, 10, 15, 20, 30, 30, 30, 30, 30]; // segundos
    for (let intento = 0; intento <= esperas.length; intento++) {
      try {
        return aplicarPublicado(await pedir(url));
      } catch (e) {
        ultimo = e;
        if (intento === esperas.length) break;
        console.warn(`[sitio-textos] el panel no respondió (${(e as Error)?.message}); reintento en ${esperas[intento]} s`);
        await new Promise((r) => setTimeout(r, esperas[intento] * 1000));
      }
    }
    throw new Error(
      `No se pudieron leer los textos publicados en ${url} (${(ultimo as Error)?.message}). ` +
        `La construcción se detiene para no volver a textos viejos. Para construir sin el panel: SITIO_SIN_PANEL=1.`
    );
  })();
  return cache;
}
