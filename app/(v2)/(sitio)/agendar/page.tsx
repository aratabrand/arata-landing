import type { Metadata } from "next";
import { Suspense } from "react";
import { Gauge, Users } from "lucide-react";
import BookingFlow from "@/components/v2/BookingFlow";
import { Badge, Container, Glow } from "@/components/v2/primitives";
import { agendar as c } from "@/content/agendar";
import { paginaV2 } from "@/lib/seo";

// Agendar — LA página que cuenta (02-arquitectura.md §2 y §3.6, copy D-053).
// El formulario es el único JS pesado del sitio y Cal.com carga solo en el último paso.
export const metadata: Metadata = paginaV2({ path: "/agendar", title: c.meta.title, description: c.meta.description });

export default function Agendar() {
  return (
    <section className="relative overflow-hidden pb-24 pt-28 sm:pt-32">
      <Glow className="left-1/2 top-[-18rem] h-[40rem] w-[60rem] -translate-x-1/2" />
      <Container className="relative">
        <h1 className="font-display text-[clamp(2.1rem,7vw,3.75rem)] font-extrabold leading-[1.02] tracking-display text-white">
          {c.titulo}
        </h1>
        <p className="mt-4 max-w-xl text-v2-lead text-fog">{c.texto}</p>

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[1fr_340px] lg:gap-8">
          <Suspense fallback={<div className="min-h-[420px] rounded-[28px] border border-white/8 bg-surface-1" />}>
            <BookingFlow />
          </Suspense>

          {/* Lateral (debajo en celular): qué pasa en la reunión, garantía y cupos */}
          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-card border border-white/8 bg-surface-1 p-6">
              <h2 className="font-display text-lg font-bold tracking-heading text-white">{c.lateral.titulo}</h2>
              <ol className="mt-4 space-y-3">
                {c.lateral.pasos.map((p, i) => (
                  <li key={p} className="flex gap-3 text-sm leading-relaxed text-fog">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/20 font-display text-xs font-bold text-brand-soft">
                      {i + 1}
                    </span>
                    {p}
                  </li>
                ))}
              </ol>
            </div>
            <div className="v2-glass flex gap-3 p-5" style={{ ["--glow" as string]: "rgba(182,255,0,0.12)" }}>
              <Gauge aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-lime" />
              <p className="text-sm leading-relaxed text-fog">
                <strong className="font-semibold text-white">{c.lateral.garantiaFuerte}</strong> · {c.lateral.garantia}
              </p>
            </div>
            <div className="flex items-center gap-3 px-1">
              <Users aria-hidden className="h-4 w-4 text-fog-dim" />
              <Badge live>{c.lateral.cupos}</Badge>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
