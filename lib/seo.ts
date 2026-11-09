import type { Metadata } from "next";
import { site } from "@/lib/site";

// Metadatos por página del sitio v2 (Fase 5, D-087).
// Next no fusiona `openGraph`/`twitter` campo por campo: si una página no los
// define, hereda los de la v1 (título e imagen de chatbots). Por eso TODA página
// v2 arma los suyos con este helper: canonical + Open Graph + Twitter coherentes.

export const OG_DEFAULT = "/og/og-v2.png";

export function paginaV2({
  path,
  title,
  description,
  image = OG_DEFAULT,
  imageAlt = "Arata San · Páginas, catálogos y sistemas listos en 5 días",
}: {
  path: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "es_CO",
      url: path,
      siteName: site.name,
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: imageAlt }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
