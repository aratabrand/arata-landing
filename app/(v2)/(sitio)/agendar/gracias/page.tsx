import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Container, Glow } from "@/components/v2/primitives";
import TrackOnMount from "@/components/v2/TrackOnMount";
import { gracias as c } from "@/content/agendar";
import { site } from "@/lib/site";

// Confirmación (02-arquitectura.md §3.7). Siempre noindex. Evento de conversión para GTM.
export const metadata: Metadata = {
  title: c.meta.title,
  robots: { index: false, follow: false },
};

export default function Gracias() {
  return (
    <section className="relative overflow-hidden pb-24 pt-32 sm:pt-40">
      <TrackOnMount event="reunion_confirmada" />
      <Glow className="left-1/2 top-[-16rem] h-[40rem] w-[60rem] -translate-x-1/2" />
      <Container className="relative max-w-3xl text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lime text-ink shadow-[0_0_40px_rgba(182,255,0,0.45)]">
          <Check aria-hidden className="h-8 w-8" strokeWidth={3} />
        </span>
        <h1 className="mt-8 font-display text-[clamp(2rem,6.4vw,3.5rem)] font-extrabold leading-[1.04] tracking-display text-white">
          {c.titulo}
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-v2-lead text-fog">{c.texto}</p>

        <div className="mt-12 rounded-card border border-white/8 bg-surface-1 p-6 text-left sm:p-8">
          <h2 className="font-display text-lg font-bold tracking-heading text-white">{c.preparaTitulo}</h2>
          <ul className="mt-5 space-y-3">
            {c.prepara.map((p) => (
              <li key={p} className="flex gap-3 text-fog">
                <Check aria-hidden className="mt-1 h-4 w-4 shrink-0 text-lime" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 text-fog">
          {c.cambiar}{" "}
          <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="font-semibold text-white underline decoration-white/30 underline-offset-4 hover:text-lime">
            {c.cambiarLink}
          </a>
          .
        </p>
        <p className="mt-2 text-fog">
          {c.mientras}{" "}
          <Link href="/portafolio" className="font-semibold text-white underline decoration-white/30 underline-offset-4 hover:text-lime">
            {c.mientrasLink}
          </Link>
          .
        </p>
      </Container>
    </section>
  );
}
