import type { Metadata } from "next";
import SiteHeader from "@/components/v2/SiteHeader";
import Hero from "@/components/v2/Hero";
import { ProblemSection, ProofStrip, ServicesSection, StepsSection } from "@/components/v2/HomeSections";
import PortfolioShowcase from "@/components/v2/PortfolioShowcase";
import PricingSection from "@/components/v2/Pricing";
import { CtaCard, FaqSection, SiteFooter } from "@/components/v2/Closing";
import StickyBookBar from "@/components/v2/StickyBookBar";

// Muestra del Inicio v2 (Fase 3). Estructura: docs/blueprint/02-arquitectura.md §3.1.
// Copy: content/inicio.ts (aprobado en 03-copy.md). En la Fase 4 pasa a "/".
export const metadata: Metadata = {
  title: "Muestra del sitio v2 · Arata San",
  robots: { index: false, follow: false },
};

export default function InicioV2() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <ProofStrip />
        <ProblemSection />
        <ServicesSection />
        <PortfolioShowcase />
        <StepsSection />
        <PricingSection />
        <FaqSection />
        <CtaCard />
      </main>
      <SiteFooter />
      <StickyBookBar />
    </>
  );
}
