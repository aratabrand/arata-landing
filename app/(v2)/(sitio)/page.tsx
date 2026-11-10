import type { Metadata } from "next";
import Hero from "@/components/v2/Hero";
import { ProblemSection, ProofStrip, ServicesSection, StepsSection } from "@/components/v2/HomeSections";
import PortfolioShowcase from "@/components/v2/PortfolioShowcase";
import PricingSection from "@/components/v2/Pricing";
import { CtaCard, FaqSection } from "@/components/v2/Closing";
import JsonLd from "@/components/JsonLd";
import { paginaV2 } from "@/lib/seo";
import { preguntas } from "@/lib/schema";
import { faq, INICIO, seoInicio } from "@/content/inicio";

// Inicio v2. Estructura: docs/blueprint/02-arquitectura.md §3.1.
// Copy: content/inicio.ts (aprobado en 03-copy.md). Es el Inicio desde el lanzamiento (D-091).
export const metadata: Metadata = paginaV2({
  path: INICIO,
  title: seoInicio.titulo,
  description: seoInicio.descripcion,
});

export default function InicioV2() {
  return (
    <>
      <JsonLd data={preguntas(faq.items)} />
      <Hero />
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
