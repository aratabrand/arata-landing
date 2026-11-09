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

// Inicio v2. Estructura: docs/blueprint/02-arquitectura.md §3.1.
// Copy: content/inicio.ts (aprobado en 03-copy.md). En el lanzamiento (Fase 6) pasa a "/".
export const metadata: Metadata = paginaV2({
  path: INICIO,
  title: "Arata San · Tu página lista en 5 días, hecha para vender desde el celular",
  description:
    "Diseñamos páginas, catálogos y sistemas para negocios que quieren clientes por internet. Listos en 5 días hábiles, desde 400 USD, con garantía de velocidad de 90 o más en Google.",
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
