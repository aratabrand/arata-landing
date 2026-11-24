import type { Metadata } from "next";
import { Container, Glow } from "@/components/v2/primitives";
import MarcoCampana from "@/components/v2/campana/MarcoCampana";
import CintaOferta from "@/components/v2/campana/CintaOferta";
import AgendaDirecta from "@/components/v2/campana/AgendaDirecta";
import { ofertaVigente, textosAgenda } from "@/content/campanas/catalogos";
import { paginaV2 } from "@/lib/seo";

// Agenda directa de la landing de Meta (D-197): quien toca «Agendar» en /lp/catalogos llega
// aquí y elige la hora de una, sin las preguntas de /agendar (esas son del sitio).
// noindex (layout de (campana)). Se vuelve a armar cada hora por la oferta (D-192).
export const revalidate = 3600;

export function generateMetadata(): Metadata {
  const t = textosAgenda(ofertaVigente());
  return paginaV2({ path: "/lp/catalogos/agendar", title: t.meta.title, description: t.meta.description, image: "/og/og-catalogos-y-sistemas.png" });
}

export default function AgendaLandingCatalogos() {
  const conOferta = ofertaVigente();
  const t = textosAgenda(conOferta);
  return (
    <MarcoCampana cinta={conOferta ? <CintaOferta enlace="#calendario" /> : undefined}>
      <section className="relative overflow-hidden pb-24 pt-20 sm:pt-28">
        <Glow className="left-1/2 top-[-18rem] h-[40rem] w-[60rem] -translate-x-1/2" />
        <Container className="relative">
          <h1 className="font-display text-[clamp(1.75rem,6vw,3.25rem)] font-extrabold leading-[1.02] tracking-display text-white">
            {t.titulo}
          </h1>
          <p className="mt-2 max-w-xl text-fog sm:mt-4 sm:text-v2-lead">{t.texto}</p>
          {t.oferta && (
            <p className="mt-4 inline-flex rounded-full bg-lime px-4 py-2 text-xs font-semibold text-ink sm:text-sm">{t.oferta}</p>
          )}

          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_340px] lg:gap-8">
            <div id="calendario" className="scroll-mt-32 rounded-[28px] border border-white/8 bg-surface-1 p-4 sm:p-6">
              <AgendaDirecta
                notas={t.notas}
                notaAutorizacion={t.notaAutorizacion}
                aviso={t.aviso}
                avisoLink={t.avisoLink}
                origen="lp-catalogos"
              />
            </div>

            {/* Debajo en celular: qué pasa en la reunión (mismo texto de /agendar) */}
            <aside className="rounded-card border border-white/8 bg-surface-1 p-6 lg:sticky lg:top-32">
              <h2 className="font-display text-lg font-bold tracking-heading text-white">{t.lateral.titulo}</h2>
              <ol className="mt-4 space-y-3">
                {t.lateral.pasos.map((p, i) => (
                  <li key={p} className="flex gap-3 text-sm leading-relaxed text-fog">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.06] font-display text-xs font-bold text-fog">
                      {i + 1}
                    </span>
                    {p}
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </Container>
      </section>
    </MarcoCampana>
  );
}
