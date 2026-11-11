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
