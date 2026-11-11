"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/panel/db";
import { panelActivo } from "@/lib/panel/config";
import { contextoAgencia } from "@/lib/panel/finanzas/datos";
import { errores, LIM } from "@/lib/panel/sitio/reglas";
import type { ConfigSitio } from "@/content/panel/tipos";
import type { Resultado } from "../finanzas/acciones";

// Guarda "Mi sitio" de Arata San (D-111). Revalida en el servidor con las mismas reglas
// de la pantalla. Cada guardado deja una versión (config_sitio_versiones).
export async function guardarSitio(entrada: ConfigSitio): Promise<Resultado> {
  try {
    if (!panelActivo) return { ok: false, error: "El panel está en modo ejemplo." };
    const ctx = await contextoAgencia();
    if (!ctx) return { ok: false, error: "Tu sesión terminó. Vuelve a entrar." };
    if (!ctx.puedeEditar) return { ok: false, error: "Solo Sergio puede cambiar el sitio." };

    const t = (v: unknown, max: number) => String(v ?? "").slice(0, max);
    const limpio: ConfigSitio = {
      seo: { titulo: t(entrada?.seo?.titulo, 90), descripcion: t(entrada?.seo?.descripcion, 220) },
      portada: { titulo: t(entrada?.portada?.titulo, LIM.titulo), subtitulo: t(entrada?.portada?.subtitulo, LIM.subtitulo) },
      anuncio: { activo: Boolean(entrada?.anuncio?.activo), texto: t(entrada?.anuncio?.texto, LIM.anuncio) },
      botones: (Array.isArray(entrada?.botones) ? entrada.botones : []).slice(0, 10).map((b) => ({
        id: t(b.id, 60),
        ubicacion: t(b.ubicacion, 60),
        texto: t(b.texto, LIM.boton),
        enlace: t(b.enlace, 300),
        estilo: b.estilo === "secundario" ? "secundario" : "principal",
      })),
      actualizado: null,
    };
    const e = errores(limpio);
    const primero = Object.values(e)[0];
    if (primero) return { ok: false, error: primero };

    // update y, si no existía, insert (con "on conflict" el trigger de versiones correría dos veces)
    const datos = JSON.stringify(limpio);
    const u = await db().query(`update config_sitio set datos = $2, actualizado_por = $3 where negocio_id = $1`, [ctx.negocioId, datos, ctx.usuarioId]);
    if (!u.rowCount) {
      await db().query(`insert into config_sitio (negocio_id, datos, actualizado_por) values ($1, $2, $3)`, [ctx.negocioId, datos, ctx.usuarioId]);
    }
    revalidatePath("/panel/sitio");
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo guardar. Intenta otra vez." };
  }
}

// Publica en aratasan.com (D-117): copia lo GUARDADO a `publicado` y pide a Vercel
// reconstruir el sitio (Deploy Hook). El sitio lee lo publicado al construirse, así
// las páginas siguen estáticas. Tarda 1–2 minutos; si algo falla, sigue la versión anterior.
export async function publicarSitio(): Promise<Resultado> {
  try {
    if (!panelActivo) return { ok: false, error: "El panel está en modo ejemplo." };
    const ctx = await contextoAgencia();
    if (!ctx) return { ok: false, error: "Tu sesión terminó. Vuelve a entrar." };
    if (!ctx.puedeEditar) return { ok: false, error: "Solo Sergio puede publicar el sitio." };
    const hook = process.env.SITIO_DEPLOY_HOOK ?? "";
    // En producción solo el Deploy Hook de Vercel; en local se puede probar con un servidor propio
    const local = process.env.NODE_ENV !== "production" && /^http:\/\/localhost:\d+\//.test(hook);
    if (!/^https:\/\/api\.vercel\.com\//.test(hook) && !local) return { ok: false, error: "Falta conectar el panel con Vercel (SITIO_DEPLOY_HOOK)." };

    const r = (await db().query(`select datos, publicado, publicado_en, publicado_por from config_sitio where negocio_id = $1`, [ctx.negocioId])).rows[0];
    if (!r) return { ok: false, error: "Primero guarda los cambios." };
    const primero = Object.values(errores(r.datos as ConfigSitio))[0];
    if (primero) return { ok: false, error: primero };

    // Primero se marca publicado (el sitio lee esta columna al construirse) y luego se
    // avisa a Vercel. Si Vercel no acepta, se deja todo como estaba.
    await db().query(`update config_sitio set publicado = datos, publicado_en = now(), publicado_por = $2 where negocio_id = $1`, [
      ctx.negocioId,
      ctx.usuarioId,
    ]);
    const res = await fetch(hook, { method: "POST", cache: "no-store", signal: AbortSignal.timeout(10_000) }).catch(() => null);
    if (!res?.ok) {
      await db().query(`update config_sitio set publicado = $2, publicado_en = $3, publicado_por = $4 where negocio_id = $1`, [
        ctx.negocioId,
        r.publicado ? JSON.stringify(r.publicado) : null,
        r.publicado_en,
        r.publicado_por,
      ]);
      return { ok: false, error: "Vercel no respondió. No se publicó nada; intenta otra vez." };
    }
    revalidatePath("/panel/sitio");
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo publicar. Intenta otra vez." };
  }
}
