import Link from "next/link";
import { Plus } from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "./Button";
import { Container, DosTonos } from "./primitives";
import ProjectPreview from "./ProjectPreview";
import { AbrirPreferenciasCookies } from "@/components/CookieBanner";
import { cookies } from "@/content/cookies";
import { AGENDAR, ctaFinal, faq, footer } from "@/content/inicio";
import { proyectos } from "@/content/proyectos";

// Cierre del Inicio: FAQ en dos columnas (captura 02), CTA en tarjeta blanca con dos trabajos (D-138) y footer.

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
            <DosTonos texto={titulo} />
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

/**
 * CTA final (D-138): tarjeta BLANCA grande con texto ink (20:1), alineada a la izquierda, y dos
 * trabajos reales enmarcados a la derecha (solo en pantallas grandes). Botón negro con círculo lima.
 */
export function CtaCard({ cta = ctaFinal, antes }: { cta?: Cta; antes?: React.ReactNode } = {}) {
  const muestra = proyectos.slice(0, 2);
  return (
    <section aria-labelledby="cta-final" className="pb-24 pt-8 sm:pb-32">
      <Container>
        <div className="relative isolate grid overflow-hidden rounded-[32px] bg-paper text-ink lg:grid-cols-[1.1fr_0.9fr]">
          <div className="px-7 py-14 sm:px-12 sm:py-16 lg:py-20">
            {antes}
            <h2 id="cta-final" className="max-w-xl font-display text-v2-h2 font-bold tracking-heading text-ink">
              <DosTonos texto={cta.titulo} tono="text-ink/45" />
            </h2>
            <p className="mt-5 max-w-lg text-v2-lead text-ink/70">{cta.texto}</p>
            <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Button href={cta.href ?? AGENDAR} variant="ink" size="lg" arrow>
                {cta.boton}
              </Button>
              {cta.nota && <p className="text-sm text-ink/60">{cta.nota}</p>}
            </div>
          </div>
          {/* Dos trabajos reales, enmarcados y algo girados (decorativo) */}
          <div aria-hidden className="relative hidden lg:block">
            {muestra.map((p, i) => (
              <div
                key={p.slug}
                className="absolute w-[78%] overflow-hidden rounded-[18px] border border-ink/10 bg-ink shadow-[0_30px_60px_-30px_rgba(3,1,11,0.45)]"
                style={i === 0 ? { right: "-6%", top: "12%", transform: "rotate(-4deg)" } : { right: "18%", bottom: "-10%", transform: "rotate(3deg)" }}
              >
                <div className="aspect-[16/10]">
                  <ProjectPreview proyecto={p} captura={0} sizes="420px" />
                </div>
              </div>
            ))}
          </div>
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
                <ul className="mt-3 space-y-0.5 lg:mt-4 lg:space-y-2.5">
                  {col.links.map((l) => {
                    const externo = l.href.startsWith("http");
                    return (
                      <li key={l.label}>
                        {externo ? (
                          <a href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center text-sm text-fog hover:text-white lg:min-h-0">
                            {l.label}
                          </a>
                        ) : (
                          <Link href={l.href} className="inline-flex min-h-10 items-center text-sm text-fog hover:text-white lg:min-h-0">
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
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            {/* D-130: volver a elegir las cookies desde cualquier página */}
            <AbrirPreferenciasCookies className="inline-flex min-h-10 items-center underline decoration-white/20 underline-offset-4 transition-colors hover:text-white sm:min-h-0">
              {cookies.footer}
            </AbrirPreferenciasCookies>
            <p>© {anio} Arata San</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
