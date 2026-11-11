import { NextResponse } from "next/server";
import { db } from "@/lib/panel/db";
import { panelActivo } from "@/lib/panel/config";

// Lo PUBLICADO de "Mi sitio" de Arata San (D-117). Lo lee aratasan.com al construirse
// (lib/sitio-textos.ts). Solo devuelve textos que ya son públicos en la página;
// nunca el borrador, ni quién publicó, ni nada de otra tabla.
export const dynamic = "force-dynamic";

export async function GET() {
  if (!panelActivo) return new NextResponse(null, { status: 404 });
  try {
    const r = (
      await db().query(
        `select c.publicado, c.publicado_en from config_sitio c join negocios n on n.id = c.negocio_id
          where n.slug = 'arata-san' and n.tipo = 'agencia'`
      )
    ).rows[0];
    const p = r?.publicado ?? null;
    const publicado = p
      ? {
          seo: { titulo: String(p.seo?.titulo ?? ""), descripcion: String(p.seo?.descripcion ?? "") },
          portada: { titulo: String(p.portada?.titulo ?? ""), subtitulo: String(p.portada?.subtitulo ?? "") },
          botones: (Array.isArray(p.botones) ? p.botones : []).map((b: { id?: unknown; texto?: unknown; enlace?: unknown }) => ({
            id: String(b.id ?? ""),
            texto: String(b.texto ?? ""),
            enlace: String(b.enlace ?? ""),
          })),
        }
      : null;
    return NextResponse.json(
      { publicado, publicadoEn: r?.publicado_en?.toISOString?.() ?? null },
      { headers: { "cache-control": "no-store", "x-robots-tag": "noindex" } }
    );
  } catch {
    return NextResponse.json({ error: "No se pudo leer." }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
