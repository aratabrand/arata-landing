import type { Metadata } from "next";
import Hero from "@/components/v2/Hero";
import { ProblemSection, ProofStrip, ServicesSection, StepsSection } from "@/components/v2/HomeSections";
import PortfolioShowcase from "@/components/v2/PortfolioShowcase";
import PricingSection from "@/components/v2/Pricing";
import { CtaCard, FaqSection } from "@/components/v2/Closing";
import JsonLd from "@/components/JsonLd";
import { paginaV2 } from "@/lib/seo";
import { preguntas } from "@/lib/schema";
import { faq, INICIO } from "@/content/inicio";
import { textosSitio } from "@/lib/sitio-textos";

// Inicio v2. Estructura: docs/blueprint/02-arquitectura.md §3.1.
// Copy: content/inicio.ts (aprobado en 03-copy.md). Es el Inicio desde el lanzamiento (D-091).
// Título/descripción de Google y textos de la portada: editables desde el panel (D-117).
export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await textosSitio();
  return paginaV2({ path: INICIO, title: seo.titulo, description: seo.descripcion });
}

export default async function InicioV2() {
  const { portada } = await textosSitio();
  return (
    <>
      <JsonLd data={preguntas(faq.items)} />
      <Hero textos={portada} />
      <ProofStrip />
      <ProblemSection />
      <ServicesSection />
      <PortfolioShowcase />
      <StepsSection />
      <PricingSection />
      <FaqSection />
      <CtaCard />
    </>
  );
}
