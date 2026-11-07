import Ring from "@/components/Ring";
import { Button } from "./Button";
import { Container, SectionHeader } from "./primitives";
import Spotlight from "./Spotlight";
import ProjectPreview from "./ProjectPreview";
import ShowcaseCarousel from "./ShowcaseCarousel";
import { portafolio, velocidad } from "@/content/inicio";
import { proyectos } from "@/content/proyectos";

// Portafolio destacado del Inicio. Componente de servidor: las vistas previas se
// renderizan aquí y se le pasan ya hechas al carrusel (que solo maneja el estado).
export default function PortfolioShowcase() {
  return (
    <section id="trabajos" aria-labelledby="portafolio" className="scroll-mt-20 py-20 sm:py-28">
      <Container>
        <SectionHeader
          id="portafolio"
          title={portafolio.titulo}
          action={
            <Button href="/portafolio" variant="secondary">
              {portafolio.boton}
            </Button>
          }
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          <Spotlight as="article" className="p-2 lg:col-span-2">
            <ShowcaseCarousel
              items={proyectos.map(({ slug, nombre, etiqueta, frase }) => ({ slug, nombre, etiqueta, frase }))}
              slides={proyectos.map((p) => (
                <ProjectPreview key={p.slug} proyecto={p} />
              ))}
            />
          </Spotlight>

          {/* Dato útil en vez de decoración (CLAUDE.md §3): velocidad real */}
          <Spotlight as="article" className="flex flex-col justify-between gap-8 p-6">
            <div>
              <p className="text-xs font-semibold text-brand-soft">{velocidad.fuente}</p>
              <h3 className="mt-2 font-display text-v2-h3 font-bold tracking-heading text-white">{velocidad.titulo}</h3>
            </div>
            <div className="flex items-center justify-around gap-4">
              <Ring value={velocidad.escritorio} centerValue={velocidad.escritorio} size={116} stroke={10} label="Escritorio" />
              <Ring value={velocidad.celular} centerValue={velocidad.celular} size={116} stroke={10} label="Celular" />
            </div>
            <p className="text-sm text-fog">
              {velocidad.nota} <span className="font-semibold text-white">{velocidad.notaFuerte}</span> {velocidad.notaFin}
            </p>
          </Spotlight>
        </div>
      </Container>
    </section>
  );
}
