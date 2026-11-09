import Link from "next/link";
import { Plus } from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "./Button";
import { Container, Glow } from "./primitives";
import ProjectPreview from "./ProjectPreview";
import { AGENDAR, ctaFinal, faq, footer } from "@/content/inicio";
import { proyectos } from "@/content/proyectos";

// Cierre del Inicio: FAQ en dos columnas (captura 02), CTA en tarjeta grande con collage (captura 04) y footer.

type Pregunta = { p: string; r: string };

/** Preguntas frecuentes con <details>: funciona sin JavaScript. Cada página pasa las suyas. */
export function FaqSection({
  titulo = faq.titulo,
  subtitulo = faq.subtitulo,
  items = faq.items,
}: { titulo?: string; subtitulo?: string; items?: Pregunta[] } = {}) {
  return (
    <section aria-labelledby="faq" className="py-20 sm:py-28">
      <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <h2 id="faq" className="font-display text-v2-h2 font-bold tracking-heading text-white">
            {titulo}
          </h2>
          {subtitulo && <p className="mt-4 max-w-sm text-fog">{subtitulo}</p>}
        </div>
        <div className="border-t border-white/8">
          {items.map((item) => (
            <details key={item.p} className="v2-faq group border-b border-white/8">
              <summary className="flex min-h-[3.5rem] cursor-pointer list-none items-center justify-between gap-6 py-4 text-left text-base font-medium text-white">
                {item.p}
                <Plus aria-hidden className="v2-faq-icon h-5 w-5 shrink-0 text-fog transition-transform duration-200" />
              </summary>
              <p className="pb-5 pr-10 text-fog">{item.r}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

type Cta = { titulo: string; texto: string; boton: string; nota?: string; href?: string };

/** CTA final: tarjeta grande con collage de los trabajos tintado de morado (captura 04). */
export function CtaCard({ cta = ctaFinal, antes }: { cta?: Cta; antes?: React.ReactNode } = {}) {
  return (
    <section aria-labelledby="cta-final" className="pb-24 pt-8 sm:pb-32">
      <Container>
        <div className="relative isolate overflow-hidden rounded-[28px] border border-white/8 bg-surface-1 px-6 py-20 text-center sm:py-28">
          {/* Collage de trabajos al fondo */}
          <div aria-hidden className="absolute inset-0 -z-10 grid grid-cols-2 gap-3 p-3 opacity-45 sm:grid-cols-4">
            {proyectos.map((p, i) => (
              <div
                key={p.slug}
                className="v2-frame h-full"
                style={{ transform: `translateY(${i % 2 === 0 ? "-8%" : "10%"}) rotate(${i % 2 === 0 ? -3 : 3}deg)` }}
              >
                <ProjectPreview proyecto={p} captura={i % 2} sizes="(min-width: 640px) 300px, 50vw" />
              </div>
            ))}
          </div>
          {/* Tinte morado plano sobre el collage + luz */}
          <div aria-hidden className="absolute inset-0 -z-10 bg-[#140A3A]/75" />
          <Glow className="left-1/2 top-1/2 -z-10 h-[34rem] w-[60rem] -translate-x-1/2 -translate-y-1/2" />

          {antes}
          <h2 id="cta-final" className="mx-auto max-w-3xl font-display text-v2-h2 font-bold tracking-heading text-white">
            {cta.titulo}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-v2-lead text-fog">{cta.texto}</p>
          <div className="mt-9 flex justify-center">
            <Button href={cta.href ?? AGENDAR} size="lg" arrow>
              {cta.boton}
            </Button>
          </div>
          {cta.nota && <p className="mt-4 text-sm text-fog-dim">{cta.nota}</p>}
        </div>
      </Container>
    </section>
  );
}

export function SiteFooter() {
  const anio = 2026;
  return (
    <footer className="border-t border-white/6 pb-28 pt-16 lg:pb-12">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Logo surface="dark" className="h-6 w-auto" />
            <p className="mt-4 max-w-xs text-sm text-fog">{footer.frase}</p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footer.columnas.map((col) => (
              <div key={col.titulo}>
                <p className="text-sm font-semibold text-white">{col.titulo}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => {
                    const externo = l.href.startsWith("http");
                    return (
                      <li key={l.label}>
                        {externo ? (
                          <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-sm text-fog hover:text-white">
                            {l.label}
                          </a>
                        ) : (
                          <Link href={l.href} className="text-sm text-fog hover:text-white">
                            {l.label}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-2 border-t border-white/6 pt-6 text-xs text-fog-dim sm:flex-row sm:justify-between">
          <p>{footer.cierre}</p>
          <p>© {anio} Arata San</p>
        </div>
      </Container>
    </footer>
  );
}
