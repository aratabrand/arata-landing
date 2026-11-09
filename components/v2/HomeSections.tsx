import type { CSSProperties } from "react";
import { BarChart3, FileText, Hourglass, Images, MessageSquareWarning, PackageSearch, SearchX, type LucideIcon } from "lucide-react";
import Reveal from "@/components/Reveal";
import { GridBackground } from "@/components/ui/grid-background";
import { Container, SectionHeader } from "./primitives";
import ScrollPaint from "./ScrollPaint";
import ServicesBento from "./ServicesBento";
import { pasos, problema, prueba, servicios } from "@/content/inicio";

// Secciones del Inicio v2.

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

const ICONOS: Record<string, LucideIcon> = {
  fotos: Images,
  lenta: Hourglass,
  pdf: FileText,
  google: SearchX,
  datos: PackageSearch,
  pedidos: MessageSquareWarning,
  ventas: BarChart3,
};

type ProblemaItem = { icono: string; titulo?: string; texto: string };

/**
 * Problema (D-066): tarjetas apiladas dentro de un panel (ref. Sergio, lista con caja de ícono).
 * El resaltado recorre las tarjetas una por una con animación CSS (opacidad), sin JS.
 */
export function ProblemSection({
  id = "problema",
  titulo = problema.titulo,
  cierre = problema.cierre,
  items = problema.items,
}: { id?: string; titulo?: string; cierre?: string; items?: ProblemaItem[] } = {}) {
  const n = items.length;
  return (
    <section aria-labelledby={id} className="relative isolate py-20 sm:py-28">
      {/* Rejilla sutil con la luz detrás de las tarjetas (D-071) */}
      <GridBackground orb="70% 50%" />
      <Container className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
        <Reveal>
          <h2 id={id} className="font-display text-v2-h2 font-bold tracking-heading text-white">
            {titulo}
          </h2>
          {cierre && <p className="mt-4 max-w-md text-v2-lead text-fog">{cierre}</p>}
        </Reveal>

        <Reveal variant="right">
          <ul className="space-y-2 rounded-card border border-white/8 bg-surface-1/70 p-2 sm:p-3">
            {items.map((item, i) => {
              const Icono = ICONOS[item.icono] ?? Images;
              return (
                <li
                  key={item.texto}
                  className="v2-problem relative flex items-center gap-4 overflow-hidden rounded-frame border border-white/6 bg-ink/60 p-3 sm:p-4"
                  style={{ ["--i" as string]: i, ["--n" as string]: n } as CSSProperties}
                >
                  {/* resaltado que recorre las tarjetas */}
                  <span aria-hidden className="v2-problem-hl pointer-events-none absolute inset-0 rounded-frame" />
                  <span className="relative flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-btn border border-white/10 bg-surface-2">
                    <Icono aria-hidden className="v2-problem-icon h-5 w-5 text-brand-soft" />
                  </span>
                  <span className="relative">
                    {item.titulo && <span className="block font-semibold text-white">{item.titulo}</span>}
                    <span className={item.titulo ? "mt-0.5 block text-sm leading-relaxed text-fog" : "block leading-relaxed text-white"}>
                      {item.texto}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}

/** Servicios: bento de diagramas vivos (D-065). */
export function ServicesSection() {
  return (
    <section aria-labelledby="servicios" className="py-20 sm:py-28">
      <Container>
        <SectionHeader id="servicios" title={servicios.titulo} />
        <div className="mt-12">
          <ServicesBento />
        </div>
      </Container>
    </section>
  );
}

/**
 * Cómo trabajamos (D-067): la línea y los pasos se pintan de lima con el scroll.
 * Escritorio horizontal, celular vertical (no cambia la orientación).
 * Todo sale de `--p` (ScrollPaint): transform en la línea, opacidad en cada paso.
 */
type Paso = { titulo: string; texto: string; marca?: string };

export function StepsSection({
  id = "como",
  titulo = pasos.titulo,
  items = pasos.items,
}: { id?: string; titulo?: string; items?: Paso[] } = {}) {
  const tramos = items.length - 1;
  // En escritorio la línea va del centro del primer círculo al del último.
  const largo = `calc(${((tramos / items.length) * 100).toFixed(2)}% + 0.6rem)`;
  // Un paso se enciende cuando la línea llega a él: opacidad 0 → 1 en el último cuarto de su tramo.
  const encendido = (i: number) => `clamp(0, calc((var(--p) * ${tramos} - ${i}) * 4 + 1), 1)`;
  return (
    <section aria-labelledby={id} className="relative isolate py-20 sm:py-28">
      <GridBackground variant="lineas" orb="50% 60%" glow={0.1} />
      <Container>
        <SectionHeader id={id} title={titulo} />
        <ScrollPaint
          as="ol"
          className="relative mt-12 grid gap-8 lg:grid-flow-col lg:auto-cols-fr lg:gap-3"
        >
          {/* Línea horizontal (escritorio): del centro del primer círculo al del último */}
          <span aria-hidden className="absolute left-[1.125rem] top-[1.125rem] hidden h-px bg-white/10 lg:block" style={{ width: largo }} />
          <span
            aria-hidden
            className="absolute left-[1.125rem] top-[1.125rem] hidden h-[2px] origin-left bg-lime shadow-[0_0_12px_rgba(182,255,0,0.6)] lg:block"
            style={{ width: largo, transform: "scaleX(var(--p))" }}
          />
          {/* Línea vertical (celular) */}
          <span aria-hidden className="absolute bottom-6 left-[1.125rem] top-4 w-px bg-white/10 lg:hidden" />
          <span
            aria-hidden
            className="absolute bottom-6 left-[1.125rem] top-4 w-[2px] origin-top bg-lime shadow-[0_0_12px_rgba(182,255,0,0.6)] lg:hidden"
            style={{ transform: "scaleY(var(--p))" }}
          />

          {items.map((p, i) => (
            <li key={p.titulo} className="relative flex gap-4 lg:flex-col lg:gap-5">
              <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-surface-2 font-display text-sm font-bold text-fog">
                {p.marca ?? i + 1}
                {/* versión encendida: círculo lima con número ink */}
                <span
                  aria-hidden
                  className="absolute inset-[-1px] flex items-center justify-center rounded-full bg-lime text-ink shadow-[0_0_18px_rgba(182,255,0,0.55)]"
                  style={{ opacity: encendido(i) }}
                >
                  {p.marca ?? i + 1}
                </span>
              </span>
              <div className="pb-1">
                <h3 className="relative font-display text-lg font-bold tracking-heading text-white/50">
                  {p.titulo}
                  <span aria-hidden className="absolute inset-0 text-white" style={{ opacity: encendido(i) }}>
                    {p.titulo}
                  </span>
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-fog">{p.texto}</p>
              </div>
            </li>
          ))}
        </ScrollPaint>
      </Container>
    </section>
  );
}
