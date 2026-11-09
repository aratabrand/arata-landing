import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CalendarCheck,
  Check,
  Gauge,
  Globe,
  GraduationCap,
  LayoutDashboard,
  LayoutTemplate,
  MessageCircle,
  RefreshCw,
  Search,
  ShoppingCart,
  Smartphone,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import Reveal from "@/components/Reveal";
import { GridBackground } from "@/components/ui/grid-background";
import { Button } from "./Button";
import { Badge, Container, Eyebrow, Glow, SectionHeader } from "./primitives";
import ProjectPreview from "./ProjectPreview";
import Spotlight from "./Spotlight";
import HoverCapsule from "./HoverCapsule";
import { Assurances } from "./Pricing";
import { AGENDAR } from "@/content/inicio";
import { proyectos, type Proyecto } from "@/content/proyectos";
import type { Incluye } from "@/content/servicios";
import { cn } from "@/lib/utils";

// Secciones de las páginas de servicio (/paginas-web y /catalogos-y-sistemas).
// Todas son componentes de servidor: el texto llega en el HTML (SEO/GEO) y solo los
// reveals y el spotlight hidratan. Estructura: 02-arquitectura.md §3.2 y §3.3.

const porSlug = (slug: string) => proyectos.find((p) => p.slug === slug) as Proyecto;

/** Lleva a /agendar con el tipo de proyecto ya elegido en el paso 1. */
export const agendarCon = (tipo?: string) => (tipo ? `${AGENDAR}?tipo=${tipo}` : AGENDAR);

/* ── Hero ─────────────────────────────────────────────────────────────── */

export function ServiceHero({
  etiqueta,
  titulo,
  texto,
  cta,
  ctaSecundario,
  casos,
  tipo,
}: {
  etiqueta: string;
  titulo: string;
  texto: string;
  cta: string;
  ctaSecundario: string;
  casos: string[];
  tipo: string;
}) {
  const [a, b] = casos.map(porSlug);
  return (
    <section className="relative overflow-hidden pb-16 pt-28 sm:pb-24 sm:pt-32">
      <Glow className="left-1/2 top-[-18rem] h-[44rem] w-[64rem] -translate-x-1/2" />
      <Container className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div className="text-center lg:text-left">
          <div className="animate-fade-up">
            <Badge live>{etiqueta}</Badge>
          </div>
          {/* El h1 no se anima: es el LCP (04-sistema-de-diseno.md §12) */}
          <h1 className="mx-auto mt-6 max-w-2xl font-display text-[clamp(2rem,6.4vw,3.6rem)] font-extrabold leading-[1.02] tracking-display text-white lg:mx-0">
            {titulo}
          </h1>
          <p className="mx-auto mt-6 max-w-xl animate-fade-up text-v2-lead text-fog [animation-delay:80ms] lg:mx-0">{texto}</p>
          <div className="mt-8 flex animate-fade-up flex-col items-stretch gap-3 [animation-delay:140ms] sm:flex-row sm:justify-center lg:justify-start">
            <Button href={agendarCon(tipo)} size="lg" arrow>
              {cta}
            </Button>
            <Button href="#casos" size="lg" variant="secondary">
              {ctaSecundario}
            </Button>
          </div>
        </div>

        {/* Dos trabajos reales del servicio, enmarcados y superpuestos */}
        <div className="relative mx-auto w-full max-w-xl animate-fade-up [animation-delay:120ms] lg:max-w-none">
          <Glow className="left-1/2 top-1/2 h-[24rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 opacity-80" />
          <div className="relative pb-[18%] pr-[14%]">
            <div className="v2-card relative p-1.5 shadow-2xl">
              <div className="v2-frame aspect-[16/10]">
                <ProjectPreview proyecto={a} priority sizes="(min-width: 1024px) 480px, 86vw" />
              </div>
            </div>
            {b && (
              <div className="absolute bottom-0 right-0 w-[52%] rotate-[3deg]">
                <div className="v2-card p-1.5 shadow-2xl">
                  <div className="v2-frame aspect-[16/10]">
                    <ProjectPreview proyecto={b} sizes="(min-width: 1024px) 260px, 46vw" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ── Para quién es ────────────────────────────────────────────────────── */

export function ForWhoSection({ titulo, items }: { titulo: string; items: string[] }) {
  return (
    <section aria-labelledby="para-quien" className="py-20 sm:py-24">
      <Container>
        <SectionHeader id="para-quien" title={titulo} />
        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          {items.map((t, i) => (
            <Reveal as="li" key={t} delay={i * 70} className="h-full">
              <div className="flex h-full gap-4 rounded-frame border border-white/8 bg-surface-1 p-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lime/10 text-lime">
                  <Check aria-hidden className="h-4 w-4" strokeWidth={2.5} />
                </span>
                <p className="leading-relaxed text-white">{t}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* ── Qué incluye (grilla de valor apilado) ───────────────────────────── */

const ICONOS: Record<string, LucideIcon> = {
  secciones: LayoutTemplate,
  celular: Smartphone,
  velocidad: Gauge,
  google: Search,
  dominio: Globe,
  ajustes: RefreshCw,
  capacitacion: GraduationCap,
  entrega: CalendarCheck,
  carrito: ShoppingCart,
  whatsapp: MessageCircle,
  panel: LayoutDashboard,
  inventario: Boxes,
};

export function IncludesSection({
  id,
  titulo,
  items,
  pie,
  conRejilla = false,
}: {
  id: string;
  titulo: string;
  items: Incluye[];
  pie?: React.ReactNode;
  conRejilla?: boolean;
}) {
  return (
    <section aria-labelledby={id} className="relative isolate py-20 sm:py-28">
      {conRejilla && <GridBackground orb="50% 45%" />}
      <Container>
        <SectionHeader id={id} title={titulo} />
        {/* 8 ítems → 4 columnas; 10 → 5 (sin filas a medias) */}
        <ul className={cn("mt-10 grid gap-3 sm:grid-cols-2", items.length % 5 === 0 ? "lg:grid-cols-5" : "lg:grid-cols-4")}>
          {items.map((it, i) => {
            const Icono = ICONOS[it.icono] ?? Check;
            const clave = it.icono === "velocidad";
            return (
              <Reveal as="li" key={it.titulo} delay={(i % 4) * 70} className="h-full">
                <Spotlight
                  className={cn("h-full p-5", clave && "border-lime/30")}
                >
                  <span
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-btn border border-white/10 bg-surface-2",
                      clave ? "text-lime" : "text-brand-soft"
                    )}
                  >
                    <Icono aria-hidden className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold tracking-heading text-white">{it.titulo}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-fog">{it.texto}</p>
                </Spotlight>
              </Reveal>
            );
          })}
        </ul>
        {pie}
      </Container>
    </section>
  );
}

/** Franja de precio dentro de una sección (Tienda por WhatsApp). */
export function PriceBar({
  precio,
  nota,
  pago,
  boton,
  tipo,
}: {
  precio: string;
  nota: string;
  pago: string;
  boton: string;
  tipo: string;
}) {
  return (
    <div className="mt-6 flex flex-col gap-5 rounded-card border border-brand bg-surface-1 p-6 shadow-glow-purple sm:flex-row sm:items-center sm:justify-between sm:p-7">
      <div>
        <p className="font-display text-[2rem] font-extrabold leading-none tracking-display text-white">
          {precio} <span className="font-sans text-base font-normal tracking-normal text-fog">· {nota}</span>
        </p>
        <p className="mt-2 text-sm text-fog">{pago}</p>
      </div>
      <Button href={agendarCon(tipo)} size="lg" arrow className="shrink-0">
        {boton}
      </Button>
    </div>
  );
}

/* ── Adicional: panel ─────────────────────────────────────────────────── */

export function AddonCallout({ etiqueta, titulo, texto }: { etiqueta: string; titulo: string; texto: string }) {
  return (
    <section aria-labelledby="adicional" className="py-6 sm:py-10">
      <Container>
        <Reveal>
          <div
            className="v2-glass flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8"
            style={{ ["--glow" as string]: "rgba(125,83,255,0.35)" }}
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-frame border border-white/10 bg-surface-2 text-brand-soft">
              <SlidersHorizontal aria-hidden className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <Eyebrow>{etiqueta}</Eyebrow>
              <h2 id="adicional" className="mt-2 font-display text-v2-h3 font-bold tracking-heading text-white">
                {titulo}
              </h2>
              <p className="mt-2 max-w-2xl text-fog">{texto}</p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* ── Casos ────────────────────────────────────────────────────────────── */

export function CaseCard({
  proyecto,
  frase,
  sizes,
  nivel = "h3",
  priority = false,
}: {
  proyecto: Proyecto;
  frase?: string;
  sizes?: string;
  /** Nivel del título: h2 si la tarjeta va justo debajo del h1 (orden de encabezados). */
  nivel?: "h2" | "h3";
  /** La primera tarjeta visible al abrir la página es el LCP: se precarga. */
  priority?: boolean;
}) {
  const Titulo = nivel;
  return (
    <Spotlight as="article" className="group h-full p-2">
      <Link href={`/portafolio/${proyecto.slug}`} className="flex h-full flex-col">
        <HoverCapsule className="v2-frame aspect-[16/10]">
          <ProjectPreview
            proyecto={proyecto}
            priority={priority}
            sizes={sizes ?? "(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"}
          />
        </HoverCapsule>
        <div className="flex flex-1 flex-col px-3 pb-3 pt-4">
          <p className="text-xs font-semibold text-brand-soft">{proyecto.etiqueta}</p>
          <Titulo className="mt-1.5 font-display text-xl font-bold tracking-heading text-white">{proyecto.nombre}</Titulo>
          <p className="mt-1.5 flex-1 text-sm leading-relaxed text-fog">{frase ?? proyecto.frase}</p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white transition-colors group-hover:text-lime">
            Ver caso
            <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </Spotlight>
  );
}

export function CasesSection({
  titulo,
  boton,
  items,
}: {
  titulo: string;
  boton: string;
  items: { slug: string; frase: string }[];
}) {
  return (
    <section id="casos" aria-labelledby="casos-titulo" className="scroll-mt-20 py-20 sm:py-28">
      <Container>
        <SectionHeader
          id="casos-titulo"
          title={titulo}
          action={
            <Button href="/portafolio" variant="secondary">
              {boton}
            </Button>
          }
        />
        <div className={cn("mt-10 grid gap-4 sm:grid-cols-2", items.length > 2 && "lg:grid-cols-3")}>
          {items.map((c, i) => (
            <Reveal key={c.slug} delay={i * 80} className="h-full">
              <CaseCard proyecto={porSlug(c.slug)} frase={c.frase} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ── Qué necesitamos de ti ────────────────────────────────────────────── */

export function NeedsSection({
  titulo,
  items,
  nota,
}: {
  titulo: string;
  items: { titulo: string; texto: string }[];
  nota: string;
}) {
  // D-079: lista de chequeo. Al entrar en pantalla se marca cada cosa, una por una;
  // con las 3 listas, el cronómetro arranca y los 5 días empiezan a llenarse.
  const fin = 0.5 + items.length * 0.8; // segundo en que arranca el plazo
  return (
    <section aria-labelledby="necesitamos" className="py-20 sm:py-24">
      <Container className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        <SectionHeader id="necesitamos" title={titulo} />
        <Reveal variant="right">
          <div className="nd rounded-[28px] border border-white/8 bg-surface-1 p-3 sm:p-4">
            <ol className="space-y-2">
              {items.map((it, i) => (
                <li
                  key={it.titulo}
                  className="nd-row flex items-center gap-4 rounded-frame border border-white/6 bg-ink/60 p-4"
                  style={{ ["--d" as string]: `${0.5 + i * 0.8}s` }}
                >
                  <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white/20">
                    <span aria-hidden className="nd-fill absolute inset-[-2px] rounded-full bg-lime" />
                    <svg viewBox="0 0 20 20" className="relative h-4 w-4" aria-hidden>
                      <path
                        d="M4.5 10.5 l3.5 3.5 l7.5 -8"
                        fill="none"
                        stroke="#03010B"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        pathLength={100}
                        strokeDasharray="100"
                        className="nd-check"
                      />
                    </svg>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-lg font-bold tracking-heading text-white">{it.titulo}</span>
                    {it.texto && <span className="mt-0.5 block text-sm leading-relaxed text-fog">{it.texto}</span>}
                  </span>
                  <span aria-hidden className="nd-chip shrink-0 rounded-full bg-lime/10 px-2.5 py-1 text-xs font-semibold text-lime">
                    Listo
                  </span>
                </li>
              ))}
            </ol>

            {/* El plazo arranca */}
            <div className="nd-plazo mt-3 rounded-frame border border-white/6 p-4 sm:p-5" style={{ ["--d" as string]: `${fin}s` }}>
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 32 32" className="h-9 w-9 shrink-0" aria-hidden>
                  <circle cx="16" cy="18" r="11" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                  <circle
                    cx="16"
                    cy="18"
                    r="11"
                    fill="none"
                    stroke="#B6FF00"
                    strokeWidth="2"
                    pathLength={100}
                    strokeDasharray="100"
                    transform="rotate(-90 16 18)"
                    className="nd-ring"
                  />
                  <rect x="13" y="3" width="6" height="3" rx="1.5" fill="rgba(255,255,255,0.4)" />
                  <line x1="16" y1="18" x2="16" y2="11" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" className="nd-hand" />
                  <circle cx="16" cy="18" r="1.8" fill="#FFFFFF" />
                </svg>
                <p className="nd-nota font-medium">{nota}</p>
              </div>
              <div className="mt-4 grid grid-cols-5 gap-1.5" aria-hidden>
                {[1, 2, 3, 4, 5].map((d) => (
                  <div key={d}>
                    <span className="block h-1.5 overflow-hidden rounded-full bg-white/10">
                      <span className="nd-day block h-full rounded-full bg-lime" style={{ ["--k" as string]: d - 1 }} />
                    </span>
                    <span className="mt-1.5 block text-center text-[0.7rem] text-fog-dim">Día {d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* ── Precio + garantía ────────────────────────────────────────────────── */

export function PriceSection({
  paquete,
  precio,
  pago,
  boton,
  tipo,
}: {
  paquete: string;
  precio: string;
  pago: string;
  boton: string;
  tipo: string;
}) {
  return (
    <section aria-labelledby="precio" className="relative isolate py-20 sm:py-28">
      <GridBackground orb="50% 30%" />
      <Container>
        <Reveal>
          <div className="relative mx-auto max-w-3xl rounded-card border border-brand bg-surface-1 p-8 text-center shadow-glow-purple sm:p-12">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
              {paquete}
            </span>
            <h2 id="precio" className="font-display text-[clamp(2.4rem,8vw,4rem)] font-extrabold leading-none tracking-display text-white">
              {precio}
            </h2>
            <p className="mx-auto mt-4 max-w-md text-fog">{pago}</p>
            <div className="mt-8 flex justify-center">
              <Button href={agendarCon(tipo)} size="lg" arrow>
                {boton}
              </Button>
            </div>
          </div>
        </Reveal>
        <Assurances className="mt-6" />
      </Container>
    </section>
  );
}

/* ── Tu Negocio en Orden (sistema a medida) ──────────────────────────── */

export function CustomSystemSection({
  etiqueta,
  titulo,
  intro,
  items,
  cierreFuerte,
  cierre,
  boton,
}: {
  etiqueta: string;
  titulo: string;
  intro: string;
  items: { titulo: string; texto: string }[];
  cierreFuerte: string;
  cierre: string;
  boton: string;
}) {
  return (
    <section aria-labelledby="sistema" className="py-20 sm:py-28">
      <Container>
        <div className="grid gap-10 rounded-[28px] border border-white/8 bg-surface-1 p-6 sm:p-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
          <Reveal>
            <Eyebrow>{etiqueta}</Eyebrow>
            <h2 id="sistema" className="mt-3 font-display text-v2-h2 font-bold tracking-heading text-white">
              {titulo}
            </h2>
            <p className="mt-4 text-v2-lead text-fog">{intro}</p>
            <p className="mt-8 text-fog">
              <strong className="font-semibold text-white">{cierreFuerte}</strong> {cierre}
            </p>
            <div className="mt-8">
              <Button href={agendarCon("sistema")} size="lg" variant="secondary" arrow>
                {boton}
              </Button>
            </div>
          </Reveal>
          <Reveal variant="right">
            <ul className="space-y-2">
              {items.map((it) => (
                <li key={it.titulo} className="flex items-start gap-4 rounded-frame border border-white/6 bg-ink/60 p-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand-soft">
                    <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                  <p className="text-fog">
                    <span className="font-semibold text-white">{it.titulo}</span>
                    {it.texto && `: ${it.texto}`}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
