import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { site } from "@/lib/site";
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
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: "Arata San — Le montamos a tu negocio para vender por internet",
  description: site.description,
  alternates: { canonical: "/" },
  keywords: [
    "vender por internet Colombia",
    "chatbot WhatsApp para negocios",
    "agencia digital Bogotá",
    "landing pages que venden",
    "automatización de negocios",
  ],
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: site.url,
    siteName: site.name,
    title: "Arata San — Vende más por internet, con quien atienda por ti",
    description: site.description,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Arata San — Automatiza tu negocio, ahorra tiempo y dinero",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arata San — Vende más por internet",
    description: site.description,
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#7D53FF",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-CO" className={`${display.variable} ${body.variable}`}>
      <body className="font-body antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
