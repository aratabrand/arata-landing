import { V2_PUBLICADO } from "@/lib/lanzamiento";
import { llmsV1, llmsV2 } from "@/content/llms";

// /llms.txt generado (antes era un archivo en public/): cambia solo con el interruptor de lanzamiento.
export const dynamic = "force-static";

export function GET() {
  return new Response(V2_PUBLICADO ? llmsV2 : llmsV1, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
