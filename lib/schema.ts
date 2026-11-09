import { site } from "@/lib/site";
import type { Proyecto } from "@/content/proyectos";

// Datos estructurados (schema.org) del sitio v2 (Fase 5, D-087). Objetos estáticos
// a partir de content/: nada que escriba el usuario entra aquí.

export const AGENCIA_ID = `${site.url}/#agencia`;
const abs = (path: string) => (path.startsWith("http") ? path : `${site.url}${path}`);

/** Agencia v2. Reemplaza al JSON-LD de la v1 en app/layout.tsx al lanzar (Fase 6). */
export const agenciaV2 = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": AGENCIA_ID,
  name: site.name,
  alternateName: ["Arata San Web", "Arata San Agencia Digital"],
  description:
    "Agencia en Bogotá que diseña páginas, catálogos y sistemas para negocios que quieren clientes por internet. Páginas listas en 5 días hábiles desde 400 USD y tiendas por WhatsApp desde 800 USD, con garantía de velocidad de 90 o más en Google.",
  slogan: "Tu página lista en 5 días. Hecha para vender desde el celular.",
  url: site.url,
  logo: abs("/icon.svg"),
  image: abs("/og/og-v2.png"),
  email: "contacto@aratasan.com",
  telephone: "+573134011189",
  areaServed: { "@type": "Country", name: "Colombia" },
  address: { "@type": "PostalAddress", addressLocality: "Bogotá", addressRegion: "Bogotá D.C.", addressCountry: "CO" },
  priceRange: "USD 400+",
  knowsAbout: [
    "Diseño de páginas web",
    "Landing pages",
    "Catálogos con pedido por WhatsApp",
    "Sistemas a medida para negocios",
    "Diseño mobile-first",
    "Velocidad web (PageSpeed)",
    "SEO y GEO",
  ],
  sameAs: [site.instagram],
};

export function servicio({
  nombre,
  descripcion,
  path,
  precioDesde,
  tipo,
}: {
  nombre: string;
  descripcion: string;
  path: string;
  precioDesde?: number;
  tipo: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${abs(path)}#servicio`,
    name: nombre,
    serviceType: tipo,
    description: descripcion,
    url: abs(path),
    provider: { "@id": AGENCIA_ID },
    areaServed: { "@type": "Country", name: "Colombia" },
    ...(precioDesde
      ? {
          offers: {
            "@type": "Offer",
            url: abs("/agendar"),
            priceCurrency: "USD",
            price: precioDesde,
            priceSpecification: { "@type": "PriceSpecification", minPrice: precioDesde, priceCurrency: "USD" },
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };
}

export function preguntas(items: { p: string; r: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.p,
      acceptedAnswer: { "@type": "Answer", text: i.r },
    })),
  };
}

export function migas(items: { nombre: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.nombre, item: abs(it.path) })),
  };
}

export function caso(p: Proyecto) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${abs(`/portafolio/${p.slug}`)}#caso`,
    name: `${p.nombre}: ${p.titulo}`,
    headline: p.titulo,
    description: p.problema,
    url: abs(`/portafolio/${p.slug}`),
    image: abs(p.capturas[0]?.src ?? "/og/og-v2.png"),
    creator: { "@id": AGENCIA_ID },
    about: p.ficha.sector,
    ...(p.ficha.ciudad ? { locationCreated: { "@type": "Place", name: p.ficha.ciudad } } : {}),
    mainEntityOfPage: abs(`/portafolio/${p.slug}`),
    workExample: { "@type": "WebSite", name: p.nombre, url: p.url },
  };
}

export function coleccion(items: Proyecto[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Portafolio de Arata San",
    url: abs("/portafolio"),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: abs(`/portafolio/${p.slug}`),
        name: p.nombre,
      })),
    },
  };
}
