import CountUp from "@/components/CountUp";
import { Button } from "./Button";
import { Badge, Container, Glow } from "./primitives";
import ProjectPreview from "./ProjectPreview";
import { AGENDAR, hero } from "@/content/inicio";
import { proyectos } from "@/content/proyectos";

// Hero v2 (copy D-038; ritmo de la ref. 21st.dev captura 02: centrado + vista previa grande enmarcada).
// Rendimiento: el <h1> NO se anima (aparece en el primer pintado → mejor LCP en celular).
// Solo entran con fade los elementos secundarios.
export default function Hero() {
  const escritorio = proyectos.find((p) => p.slug === "danrodedm")!;
  const celular = proyectos.find((p) => p.slug === "caravana")!;

  return (
    <section className="relative overflow-hidden pb-16 pt-28 sm:pb-24 sm:pt-36">
      <Glow className="left-1/2 top-[-18rem] h-[44rem] w-[64rem] -translate-x-1/2" />
      <div
        aria-hidden
        className="v2-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]"
      />

      <Container className="relative text-center">
        <div className="animate-fade-up">
          <Badge live>{hero.badge}</Badge>
        </div>

        <h1 className="mx-auto mt-6 max-w-6xl font-display text-v2-hero font-extrabold tracking-display text-white">
          {hero.titulo} <span className="text-lime lg:block">{hero.tituloSigue}</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl animate-fade-up text-v2-lead text-fog [animation-delay:80ms]">
          {hero.subtitulo}
        </p>

        <div className="mt-8 flex animate-fade-up flex-col items-stretch justify-center gap-3 [animation-delay:140ms] sm:flex-row sm:items-center">
          <Button href={AGENDAR} size="lg" arrow>
            {hero.ctaPrincipal}
          </Button>
          <Button href="#trabajos" size="lg" variant="secondary">
            {hero.ctaSecundario}
          </Button>
        </div>

        <dl className="mx-auto mt-12 grid max-w-3xl grid-cols-3 gap-2 sm:gap-4">
          {hero.pruebas.map((p) => (
            <div key={p.texto} className="rounded-frame border border-white/6 bg-surface-1/60 px-2 py-4 sm:px-4">
              <dt className="sr-only">{p.texto}</dt>
              <dd>
                <CountUp
                  value={p.valor}
                  suffix={p.sufijo}
                  className="block font-display text-2xl font-extrabold tracking-heading text-white sm:text-4xl"
                />
                <span className="mt-1 block text-[0.72rem] leading-snug text-fog-dim sm:text-sm">{p.texto}</span>
              </dd>
            </div>
          ))}
        </dl>
      </Container>

      {/* Vista previa: computador + celular (la promesa mobile-first, sin decirlo) */}
      <Container className="relative mt-14 sm:mt-20">
        <div className="relative mx-auto max-w-5xl">
          <Glow className="left-1/2 top-1/2 h-[30rem] w-[52rem] -translate-x-1/2 -translate-y-1/2 opacity-80" />
          <div className="v2-card relative p-2 shadow-2xl">
            <div className="v2-frame aspect-[16/10]">
              <ProjectPreview proyecto={escritorio} />
            </div>
          </div>
          <div className="absolute -bottom-6 right-2 w-[34%] max-w-[230px] sm:-bottom-10 sm:right-8 sm:w-[24%]">
            <div className="rounded-[22px] border border-white/10 bg-surface-1 p-1.5 shadow-2xl sm:rounded-[28px] sm:p-2">
              <div className="aspect-[9/19] overflow-hidden rounded-[16px] border border-white/6 sm:rounded-[22px]">
                <ProjectPreview proyecto={celular} device="phone" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
