import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";
import Reveal from "@/components/Reveal";
import { Button } from "./Button";
import { Container, SectionHeader } from "./primitives";
import { AGENDAR, precios, type Paquete } from "@/content/inicio";
import { cn } from "@/lib/utils";

// Precios (ref. 21st.dev captura 03, D-044):
// la tarjeta recomendada lleva borde morado + brillo + badge y el ÚNICO botón lima.
// La garantía va junto al precio (Hormozi: donde aparece la duda).

export function PricingCard({ paquete }: { paquete: Paquete }) {
  const rec = paquete.recomendado;
  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-card border bg-surface-1 p-6 sm:p-7",
        rec ? "border-brand shadow-glow-purple" : "border-white/8"
      )}
    >
      {rec && (
        <span className="absolute -top-3 left-6 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
          Recomendado
        </span>
      )}
      <h3 className="font-display text-xl font-bold tracking-heading text-white">{paquete.nombre}</h3>
      <p className="mt-5 font-display text-[2.4rem] font-extrabold leading-none tracking-display text-white">
        {paquete.precio}
      </p>
      {paquete.nota && <p className="mt-2 text-sm text-fog-dim">{paquete.nota}</p>}

      <Button href={AGENDAR} variant={rec ? "primary" : "secondary"} className="mt-6 w-full">
        {paquete.boton}
      </Button>

      <ul className="mt-6 space-y-3 border-t border-white/8 pt-6">
        {paquete.incluye.map((item) => (
          <li key={item} className="flex gap-3 text-sm text-fog">
            <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-brand-soft" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {paquete.adicional && <p className="mt-6 text-xs leading-relaxed text-fog-dim">{paquete.adicional}</p>}
    </article>
  );
}

export function GuaranteeSeal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start gap-3 rounded-frame border border-lime/30 bg-lime/[0.06] p-4", className)}>
      <ShieldCheck aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-lime" />
      <p className="text-sm text-white">
        <span className="font-semibold">Garantía de velocidad.</span> {children}
      </p>
    </div>
  );
}

export default function PricingSection() {
  return (
    <section id="precios" aria-labelledby="precios-titulo" className="scroll-mt-20 py-20 sm:py-28">
      <Container>
        <SectionHeader id="precios-titulo" title={precios.titulo} />
        <div className="mt-12 grid gap-5 lg:grid-cols-3 lg:items-stretch">
          {precios.paquetes.map((p, i) => (
            <Reveal key={p.nombre} delay={i * 80} className="h-full">
              <PricingCard paquete={p} />
            </Reveal>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <GuaranteeSeal>{precios.garantia}</GuaranteeSeal>
          <div className="space-y-1.5 rounded-frame border border-white/8 bg-surface-1 p-4 text-sm text-fog">
            <p>{precios.pago}</p>
            <p>{precios.mantenimiento}</p>
          </div>
        </div>

        <p className="mt-8 text-center text-fog">
          {precios.ayuda}{" "}
          <Link href={AGENDAR} className="font-semibold text-white underline decoration-white/30 underline-offset-4 hover:text-lime">
            {precios.ayudaCta}
          </Link>
        </p>
      </Container>
    </section>
  );
}
