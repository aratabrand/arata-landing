import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { site } from "@/lib/site";
import { GtmInit, GtmScript, GtmNoScript } from "@/components/GoogleTagManager";
import { V2_PUBLICADO } from "@/lib/lanzamiento";
import { agenciaV2 } from "@/lib/schema";
import "./globals.css";

// Fuentes de marca auto-hospedadas (sin dependencias de red en runtime)
const display = localFont({
  src: [
    { path: "./fonts/funnel-display-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/funnel-display-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "./fonts/funnel-display-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});

const body = localFont({
  src: [
    { path: "./fonts/plus-jakarta-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/plus-jakarta-sans-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/plus-jakarta-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/plus-jakarta-sans-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
  // Solo se precarga la fuente de títulos (el h1 es el LCP). El cuerpo entra con
  // swap sin competir por ancho de banda en el primer pintado.
  preload: false,
});

// Metadatos por defecto del sitio (v2, lanzado — D-091). Cada página v2 arma los
// suyos con lib/seo.ts; estos aplican a la 404 y a cualquier ruta sin metadatos.
const descripcionV2 =
  "Diseñamos páginas, catálogos y sistemas para negocios que quieren clientes por internet. Listos en 5 días hábiles, desde 400 USD, con garantía de velocidad de 90 o más en Google.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: "Arata San · Tu página lista en 5 días, hecha para vender desde el celular",
  description: descripcionV2,
  alternates: { canonical: "/" },
  keywords: [
    "diseño de páginas web Bogotá",
    "landing page en 5 días",
    "catálogo con pedidos por WhatsApp",
    "tienda por WhatsApp Colombia",
    "sistemas a medida para negocios",
    "agencia de páginas web Colombia",
  ],
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: site.url,
    siteName: site.name,
    title: "Arata San · Tu página lista en 5 días",
    description: descripcionV2,
    images: [{ url: "/og/og-v2.png", width: 1200, height: 630, alt: "Arata San · Páginas, catálogos y sistemas listos en 5 días" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arata San · Tu página lista en 5 días",
    description: descripcionV2,
    images: ["/og/og-v2.png"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#7D53FF",
  width: "device-width",
  initialScale: 1,
};

// JSON-LD de la agencia: el de la v1 hasta lanzar; después, el de la v2 (lib/schema.ts).
const jsonLdV1 = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${site.url}/#agencia`,
  name: site.name,
  alternateName: ["Arata San Web", "Arata San Agencia Digital"],
  description: site.description,
  slogan: "Automatiza tu negocio. Ahorra tiempo y dinero.",
  url: site.url,
  logo: `${site.url}/icon.svg`,
  image: `${site.url}/og.png`,
  areaServed: { "@type": "Country", name: "Colombia" },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bogotá",
    addressRegion: "Bogotá D.C.",
    addressCountry: "CO",
  },
  telephone: "+573134011189",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+573134011189",
    contactType: "sales",
    availableLanguage: ["Spanish"],
  },
  knowsAbout: [
    "Diseño de páginas web",
    "Landing pages de alta conversión",
    "Chatbots con inteligencia artificial",
    "Automatización de procesos de negocio",
    "WhatsApp Business",
    "Marketing digital",
  ],
  sameAs: [site.instagram],
};
const jsonLd = V2_PUBLICADO ? agenciaV2 : jsonLdV1;
// En panel.aratasan.com (D-116) no se carga Google Analytics: las visitas del equipo
// al panel no deben contarse como visitas de aratasan.com.
const conMedicion = process.env.PANEL_SOLO !== "1";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-CO" className={`${display.variable} ${body.variable}`}>
      {/* suppressHydrationWarning: extensiones del navegador (Grammarly, traductores…)
          agregan atributos al <body> antes de que cargue React. Solo ignora atributos
          del <body>, no su contenido. */}
      <body className="font-body antialiased" suppressHydrationWarning>
        {conMedicion && <GtmInit />}
        {conMedicion && <GtmNoScript />}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        {conMedicion && <GtmScript />}
      </body>
    </html>
  );
}
