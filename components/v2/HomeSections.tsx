import Reveal from "@/components/Reveal";
import { Button } from "./Button";
import { Container, SectionHeader } from "./primitives";
import Spotlight from "./Spotlight";
import ProjectPreview from "./ProjectPreview";
import { pasos, problema, prueba, servicios } from "@/content/inicio";

// Secciones del Inicio v2 sin estado (se renderizan en el servidor).

/** Franja de prueba: "Han confiado en nosotros" + nombres (ref. captura 02). */
export function ProofStrip() {
  return (
    <section aria-label={prueba.titulo} className="border-y border-white/6 py-10">
      <Container className="flex flex-col items-center gap-5 text-center lg:flex-row lg:justify-between lg:text-left">
        <p className="text-sm text-fog-dim">{prueba.titulo}</p>
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:gap-x-12">
          {prueba.nombres.map((n) => (
            <li key={n} className="font-display text-xl font-bold tracking-heading text-white/60 sm:text-2xl">
              {n}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/** Problema: el cliente se reconoce. Lista con hairlines (no es una secuencia → sin números). */
export function ProblemSection() {
  return (
    <section aria-labelledby="problema" className="py-20 sm:py-28">
      <Container className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <Reveal>
          <h2 id="problema" className="font-display text-v2-h2 font-bold tracking-heading text-white">
            {problema.titulo}
          </h2>
          <p className="mt-4 max-w-md text-v2-lead text-fog">{problema.cierre}</p>
        </Reveal>
        <ul className="border-t border-white/8">
          {problema.items.map((item, i) => (
            <Reveal as="li" key={item} delay={i * 60} className="flex gap-4 border-b border-white/8 py-5">
              <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              <span className="text-base text-white sm:text-lg">{item}</span>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/** Servicios: 2 tarjetas con vista previa enmarcada (ref. captura 01). */
export function ServicesSection() {
  const previews = [
    { nombre: servicios.items[0].titulo, tipos: ["Página" as const], acento: "#B6FF00" },
    { nombre: servicios.items[1].titulo, tipos: ["Catálogo" as const], acento: "#7D53FF" },
  ];
  return (
    <section aria-labelledby="servicios" className="py-20 sm:py-28">
      <Container>
        <SectionHeader id="servicios" title={servicios.titulo} />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {servicios.items.map((s, i) => (
            <Reveal key={s.titulo} delay={i * 80}>
              <Spotlight as="article" className="flex h-full flex-col p-2">
                <div className="v2-frame aspect-[16/10]">
                  <ProjectPreview proyecto={previews[i]} />
                </div>
                <div className="flex flex-1 flex-col px-4 pb-4 pt-5 sm:px-5">
                  <p className="text-xs font-semibold text-lime">{s.etiqueta}</p>
                  <h3 className="mt-2 font-display text-v2-h3 font-bold tracking-heading text-white">{s.titulo}</h3>
                  <p className="mt-2 text-fog">{s.texto}</p>
                  <div className="mt-auto pt-4">
                    <Button href={s.href} variant="ghost" arrow>
                      {s.boton}
                    </Button>
                  </div>
                </div>
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

/** Cómo trabajamos: 5 pasos (SÍ es una secuencia → números). */
export function StepsSection() {
  return (
    <section aria-labelledby="como" className="py-20 sm:py-28">
      <Container>
        <SectionHeader id="como" title={pasos.titulo} />
        <ol className="relative mt-12 grid gap-4 lg:grid-cols-5 lg:gap-3">
          <span aria-hidden className="absolute left-[1.15rem] top-4 hidden h-px w-[calc(100%-2.3rem)] bg-white/10 lg:block" />
          {pasos.items.map((p, i) => (
            <Reveal as="li" key={p.titulo} delay={i * 70} className="relative flex gap-4 lg:flex-col lg:gap-5">
              <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-surface-2 font-display text-sm font-bold text-lime">
                {i + 1}
              </span>
              <div className="pb-2">
                <h3 className="font-display text-lg font-bold tracking-heading text-white">{p.titulo}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-fog">{p.texto}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
