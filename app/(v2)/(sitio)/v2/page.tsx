import type { Metadata } from "next";
import Hero from "@/components/v2/Hero";
import { ProblemSection, ProofStrip, ServicesSection, StepsSection } from "@/components/v2/HomeSections";
import PortfolioShowcase from "@/components/v2/PortfolioShowcase";
import PricingSection from "@/components/v2/Pricing";
import { CtaCard, FaqSection } from "@/components/v2/Closing";

// Inicio v2. Estructura: docs/blueprint/02-arquitectura.md §3.1.
// Copy: content/inicio.ts (aprobado en 03-copy.md). En el lanzamiento (Fase 6) pasa a "/".
export const metadata: Metadata = {
  title: "Arata San · Páginas, catálogos y sistemas en 5 días",
};

export default function InicioV2() {
  return (
    <>
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
