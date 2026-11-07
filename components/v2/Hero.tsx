import CountUp from "@/components/CountUp";
import { TiltedGridHero } from "@/components/ui/tilted-grid-hero";
import { Button } from "./Button";
import { Badge, Container, Glow } from "./primitives";
import { AGENDAR, hero } from "@/content/inicio";
import { capturasIntercaladas } from "@/content/proyectos";

// Hero v2 (copy D-038). Debajo del texto, una banda curva con las capturas
// reales de los proyectos pasando (TiltedGridHero, D-064).
// Rendimiento: el <h1> NO se anima (es el LCP); las capturas bajan con prioridad baja.
export default function Hero() {
  const imagenes = capturasIntercaladas();
  return (
    <section className="relative overflow-hidden pt-28 sm:pt-32">
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
      </Container>

      {/* Banda curva con capturas reales del portafolio */}
      <div className="relative mt-8 sm:mt-10">
        <Glow className="left-1/2 top-1/2 h-[26rem] w-[60rem] -translate-x-1/2 -translate-y-1/2 opacity-70" />
        {/* Celular y escritorio con proporción fija → la curva se pinta correcta desde el servidor (D-064).
            Las capturas se pintan como fondo de cada franja: el <h1> sigue siendo el LCP. */}
        <TiltedGridHero
          images={imagenes}
          ratio={0.62}
          aspectRatio={16 / 10}
          tileHeight={72}
          axis={50}
          curve={62}
          gap={5}
          fade={8}
          speed={4.5}
          tileWidth={220}
          className="w-full md:hidden"
        />
        <TiltedGridHero
          images={imagenes}
          ratio={0.33}
          aspectRatio={16 / 10}
          tileHeight={66}
          axis={50}
          curve={62}
          gap={5}
          fade={10}
          speed={4.5}
          tileWidth={500}
          className="hidden w-full md:block"
        />
      </div>

      {/* Pruebas rápidas, debajo de las capturas */}
      <Container className="relative pb-16 sm:pb-24">
        <dl className="mx-auto mt-2 grid max-w-3xl grid-cols-3 gap-2 sm:gap-4">
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
    </section>
  );
}
