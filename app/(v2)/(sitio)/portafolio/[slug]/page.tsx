import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check } from "lucide-react";
import Ring from "@/components/Ring";
import Reveal from "@/components/Reveal";
import { GridBackground } from "@/components/ui/grid-background";
import { CtaCard } from "@/components/v2/Closing";
import { Container, Eyebrow, Glow } from "@/components/v2/primitives";
import ProjectPreview from "@/components/v2/ProjectPreview";
import { casoTextos as t, proyectos } from "@/content/proyectos";

// Caso de estudio — estructura 02-arquitectura.md §3.5, copy 03-copy.md.
// Regla: el resultado se dice como pasó. Si no hay dato, la sección no aparece.

export const dynamicParams = false;
export function generateStaticParams() {
  return proyectos.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = proyectos.find((x) => x.slug === slug);
  if (!p) return {};
  return {
    title: `${p.nombre} · ${p.etiqueta} · Caso de Arata San`,
    description: `${p.titulo} ${p.problema}`.slice(0, 158),
    alternates: { canonical: `/portafolio/${p.slug}` },
  };
}

export default async function Caso({ params }: Props) {
  const { slug } = await params;
  const i = proyectos.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const p = proyectos[i];
  const sig = proyectos[(i + 1) % proyectos.length];

  return (
    <>
      {/* Hero del caso */}
      <section className="relative overflow-hidden pb-12 pt-28 sm:pb-16 sm:pt-32">
        <Glow className="left-1/2 top-[-18rem] h-[40rem] w-[60rem] -translate-x-1/2" />
        <Container className="relative">
          {/* Volver: flecha visible (no todos usan la miga de pan) */}
          <Link
            href="/portafolio"
            className="group -ml-1 inline-flex h-11 items-center gap-2 rounded-btn pl-1 pr-3 text-sm font-medium text-fog transition-colors hover:text-white"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-surface-1 transition-colors group-hover:border-white/20">
              <ArrowLeft aria-hidden className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            </span>
            {t.volver}
          </Link>
          <Eyebrow className="mt-6">{p.etiqueta}</Eyebrow>
          <h1 className="mt-3 max-w-4xl font-display text-[clamp(2rem,6.4vw,3.75rem)] font-extrabold leading-[1.03] tracking-display text-white">
            {p.titulo}
          </h1>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-btn border border-white/10 bg-surface-2 px-5 text-[0.95rem] font-semibold text-white transition-colors hover:border-white/16 hover:bg-surface-3"
            >
              {t.verSitio}
              <ArrowUpRight aria-hidden className="h-4 w-4" />
            </a>
            <span className="text-sm text-fog-dim">{p.nombre}</span>
          </div>

          <div className="v2-card mt-12 p-2 shadow-2xl">
            <div className="v2-frame aspect-[16/10]">
              <ProjectPreview proyecto={p} priority sizes="(min-width: 1200px) 1150px, 100vw" />
            </div>
          </div>
        </Container>
      </section>

      {/* Problema → solución → resultado */}
      <section aria-label="El caso" className="relative isolate py-16 sm:py-24">
        <GridBackground orb="30% 40%" />
        <Container className="grid gap-12 lg:grid-cols-3 lg:gap-8">
          <Reveal>
            <h2 className="font-display text-v2-h3 font-bold tracking-heading text-white">{t.problema}</h2>
            <p className="mt-3 leading-relaxed text-fog">{p.problema}</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-display text-v2-h3 font-bold tracking-heading text-white">{t.solucion}</h2>
            <p className="mt-3 leading-relaxed text-fog">{p.solucion}</p>
            <ul className="mt-5 space-y-2.5">
              {p.funciones.map((f) => (
                <li key={f} className="flex gap-3 text-sm text-fog">
                  <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-lime" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          {(p.resultado || p.logra) && (
            <Reveal delay={160}>
              <div className="v2-glass h-full p-6" style={{ ["--glow" as string]: "rgba(182,255,0,0.12)" }}>
                <h2 className="font-display text-v2-h3 font-bold tracking-heading text-white">
                  {p.resultado ? t.resultado : t.logra}
                </h2>
                <p className="mt-3 leading-relaxed text-white">{p.resultado ?? p.logra}</p>
              </div>
            </Reveal>
          )}
        </Container>
      </section>

      {/* Puntajes de Google del sitio en vivo (reemplaza la galería: la página ya se ve arriba y en vivo) */}
      {p.puntajes?.mostrar && (
        <section aria-labelledby="puntajes" className="py-16 sm:py-24">
          <Container>
            <div className="grid gap-8 rounded-[28px] border border-white/8 bg-surface-1 p-6 sm:p-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-12">
              <div>
                <h2 id="puntajes" className="font-display text-v2-h2 font-bold tracking-heading text-white">
                  {t.puntajes.titulo}
                </h2>
                <p className="mt-4 text-fog">{t.puntajes.texto}</p>
                <dl className="mt-8 grid grid-cols-2 gap-3">
                  <div className="rounded-frame border border-white/8 bg-ink/50 p-4">
                    <dt className="text-xs text-fog-dim">{t.puntajes.abre}</dt>
                    <dd className="mt-1 font-display text-3xl font-extrabold tracking-heading text-lime">{p.puntajes.abreEnCelular}</dd>
                    <dd className="text-xs text-fog-dim">{t.puntajes.celular.toLowerCase()}</dd>
                  </div>
                  <div className="rounded-frame border border-white/8 bg-ink/50 p-4">
                    <dt className="text-xs text-fog-dim">
                      {t.puntajes.rendimiento} · {t.puntajes.escritorio.toLowerCase()}
                    </dt>
                    <dd className="mt-1 font-display text-3xl font-extrabold tracking-heading text-white">
                      {p.puntajes.escritorio.rendimiento}
                      <span className="text-base font-bold text-fog-dim">/100</span>
                    </dd>
                  </div>
                </dl>
                <p className="mt-4 text-xs text-fog-dim">
                  {t.puntajes.medido} {p.puntajes.fecha} · {new URL(p.url).hostname}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-soft">{t.puntajes.celular}</p>
                <div className="mt-4 flex flex-wrap justify-around gap-6">
                  {(
                    [
                      ["rendimiento", p.puntajes.celular.rendimiento],
                      ["accesibilidad", p.puntajes.celular.accesibilidad],
                      ["buenasPracticas", p.puntajes.celular.buenasPracticas],
                      ["seo", p.puntajes.celular.seo],
                    ] as const
                  )
                    .filter((x): x is [typeof x[0], number] => x[1] !== null)
                    .map(([k, val]) => (
                    <Ring
                      key={k}
                      value={val}
                      centerValue={val}
                      size={112}
                      stroke={9}
                      label={t.puntajes[k]}
                      arcColor={val >= 90 ? "#B6FF00" : "#7D53FF"}
                    />
                  ))}
                </div>
                {p.puntajes.celular.seo === null && <p className="mt-6 text-sm text-fog-dim">{t.puntajes.sinSeo}</p>}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Siguiente proyecto */}
      <section aria-label={t.siguiente} className="pb-8">
        <Container>
          <Link
            href={`/portafolio/${sig.slug}`}
            className="group flex items-center justify-between gap-6 rounded-card border border-white/8 bg-surface-1 p-5 transition-colors hover:border-white/16 sm:p-6"
          >
            <span>
              <span className="block text-sm text-fog-dim">{t.siguiente}</span>
              <span className="mt-1 block font-display text-2xl font-bold tracking-heading text-white">{sig.nombre}</span>
              <span className="mt-1 block text-sm text-fog">{sig.frase}</span>
            </span>
            <span className="hidden w-40 shrink-0 sm:block">
              <span className="v2-frame block aspect-[16/10]">
                <ProjectPreview proyecto={sig} sizes="160px" />
              </span>
            </span>
            <ArrowRight aria-hidden className="h-6 w-6 shrink-0 text-fog transition-transform group-hover:translate-x-1 group-hover:text-lime" />
          </Link>
        </Container>
      </section>

      <CtaCard cta={t.cta} />
    </>
  );
}
