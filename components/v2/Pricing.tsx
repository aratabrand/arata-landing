import Link from "next/link";
import { Check } from "./iconos";
import Reveal from "@/components/Reveal";
import { GridBackground } from "@/components/ui/grid-background";
import { Button } from "./Button";
import { IconoMarca } from "./IconosMarca";
import { Container, SectionHeader } from "./primitives";
import { AGENDAR, precios, type Paquete } from "@/content/inicio";
import { cn } from "@/lib/utils";

// Precios (ref. 21st.dev captura 03, D-044):
// la tarjeta recomendada lleva el filo morado (.v2-destacada, D-141), badge y el único botón principal (morado, D-142).
// La garantía va junto al precio (Hormozi: donde aparece la duda), en tarjetas con filo morado (D-068, D-141).

export function PricingCard({ paquete }: { paquete: Paquete }) {
  const rec = paquete.recomendado;
  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-card p-6 sm:p-7",
        rec ? "v2-destacada" : "v2-card"
      )}
    >
      {rec && (
        <span className="v2-pildora absolute -top-3 left-6 px-3 py-1 text-xs font-semibold">
          Recomendado
        </span>
      )}
      {paquete.icono && <IconoMarca icono={paquete.icono} className="mb-4 h-9 w-9" />}
      <h3 className="font-display text-xl font-bold tracking-heading text-white">{paquete.nombre}</h3>
      {/* D-162: el precio en lima solo si es un número ("Desde 400 USD"); "Lo cotizamos contigo" va en blanco */}
      <p className={`mt-5 font-display text-[2.4rem] font-extrabold leading-none tracking-display ${/\d/.test(paquete.precio) ? "text-lime" : "text-white"}`}>
        {paquete.precio}
      </p>
      {paquete.nota && <p className="mt-2 text-sm text-fog-dim">{paquete.nota}</p>}

      {/* D-175: todas las tarjetas del mismo color, con el botón principal lima */}
      <Button href={AGENDAR} variant="primary" className="mt-6 w-full">
        {paquete.boton}
      </Button>

      <ul className="mt-6 space-y-3 border-t border-white/8 pt-6">
        {paquete.incluye.map((item) => (
          <li key={item} className="flex gap-3 text-sm text-fog">
            {/* D-176: el chulo va dentro de un círculo lima para que se vea más */}
            <span aria-hidden className="mt-px grid h-[1.125rem] w-[1.125rem] shrink-0 place-items-center rounded-full bg-lime">
              <Check weight="bold" className="h-2.5 w-2.5 text-[#03010b]" />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {paquete.adicional && <p className="mt-6 text-xs leading-relaxed text-fog-dim">{paquete.adicional}</p>}
    </article>
  );
}

/** Paquete cotizado como banner horizontal (D-175): nombre y precio, lo que incluye y el botón. */
export function PricingBanner({ paquete }: { paquete: Paquete }) {
  return (
    <article className="v2-destacada flex flex-col gap-6 rounded-card p-6 sm:p-7 lg:flex-row lg:items-center lg:gap-10">
      <div className="flex items-center gap-4 lg:w-[28%] lg:shrink-0">
        {paquete.icono && <IconoMarca icono={paquete.icono} className="h-10 w-10 shrink-0" />}
        <div>
          <h3 className="font-display text-xl font-bold tracking-heading text-white">{paquete.nombre}</h3>
          <p className="mt-1 font-display text-2xl font-extrabold leading-tight tracking-display text-white">{paquete.precio}</p>
        </div>
      </div>
      {/* Lo primero que incluye va como frase; el resto, en una fila de checks */}
      <div className="flex-1 border-t border-[#03010b]/15 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
        <p className="text-fog">{paquete.incluye[0]}.</p>
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          {paquete.incluye.slice(1).map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-fog">
              {/* Dentro del banner lima, el círculo va negro con el chulo lima */}
              <span aria-hidden className="grid h-[1.125rem] w-[1.125rem] shrink-0 place-items-center rounded-full bg-[#03010b]">
                <Check weight="bold" className="h-2.5 w-2.5" style={{ color: "#B6FF00" }} />
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      {/* Banner lima (D-175): el botón principal va negro dentro de la tarjeta lima */}
      <Button href={AGENDAR} variant="primary" className="w-full shrink-0 lg:w-auto">
        {paquete.boton}
      </Button>
    </article>
  );
}

/* Íconos SVG animados de las tarjetas de garantía (se dibujan con .is-visible de <Reveal>) */

function GaugeIcon() {
  // Velocímetro de 180°: arco que llena el 90 % y aguja que sube hasta 90 (−90° → 72°).
  const ticks = Array.from({ length: 9 }, (_, k) => (Math.PI * k) / 8);
  return (
    <svg viewBox="0 0 100 62" className="h-20 w-auto" aria-hidden>
      <path d="M12 52 A38 38 0 0 1 88 52" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="7" strokeLinecap="round" />
      {ticks.map((a, k) => (
        <line
          key={k}
          x1={50 - Math.cos(a) * 44}
          y1={52 - Math.sin(a) * 44}
          x2={50 - Math.cos(a) * 47.5}
          y2={52 - Math.sin(a) * 47.5}
          stroke={k >= 7 ? "#B6FF00" : "rgba(255,255,255,0.3)"}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      ))}
      <path
        className="v2-draw"
        d="M12 52 A38 38 0 0 1 88 52"
        fill="none"
        stroke="#B6FF00"
        strokeWidth="7"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="100"
        strokeDashoffset="100"
        style={{ ["--to" as string]: 10 }}
      />
      <g className="v2-needle" style={{ ["--deg" as string]: "72deg" }}>
        <line x1="50" y1="52" x2="50" y2="22" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="50" cy="22" r="2.4" fill="#B6FF00" className="v2-beat" />
      </g>
      <circle cx="50" cy="52" r="4.5" fill="#141417" stroke="#FFFFFF" strokeWidth="1.6" />
    </svg>
  );
}

function SplitRingIcon() {
  // Anillo en dos mitades: 50 % lima (primero) y 50 % morado (después).
  return (
    <svg viewBox="0 0 100 100" className="h-20 w-20" aria-hidden>
      <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
      <circle
        className="v2-draw"
        cx="50"
        cy="50"
        r="36"
        fill="none"
        stroke="#B6FF00"
        strokeWidth="8"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="48 100"
        strokeDashoffset="48"
        transform="rotate(-90 50 50)"
        style={{ ["--to" as string]: 0 }}
      />
      <circle
        className="v2-draw"
        cx="50"
        cy="50"
        r="36"
        fill="none"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="8"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="48 100"
        strokeDashoffset="48"
        transform="rotate(90 50 50)"
        style={{ ["--to" as string]: 0, transitionDelay: "0.9s" }}
      />
      <text x="50" y="55" textAnchor="middle" fontSize="15" fontWeight="800" fill="#FFFFFF" fontFamily="var(--font-display)">
        50/50
      </text>
    </svg>
  );
}

function MaintenanceIcon() {
  // Anillo que marca 15 % + borde punteado que gira despacio (mantenimiento continuo).
  return (
    <svg viewBox="0 0 100 100" className="h-20 w-20" aria-hidden>
      <circle className="v2-spin" cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.203)" strokeWidth="1.4" strokeDasharray="2 6" strokeLinecap="round" />
      <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
      <circle
        className="v2-draw"
        cx="50"
        cy="50"
        r="34"
        fill="none"
        stroke="#B6FF00"
        strokeWidth="8"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="100"
        strokeDashoffset="100"
        transform="rotate(-90 50 50)"
        style={{ ["--to" as string]: 85 }}
      />
      <text x="50" y="56" textAnchor="middle" fontSize="17" fontWeight="800" fill="#FFFFFF" fontFamily="var(--font-display)">
        15%
      </text>
    </svg>
  );
}

const ICONOS_GLASS = {
  velocidad: { Icon: GaugeIcon, glow: "rgba(182,255,0,0.13)" },
  pago: { Icon: SplitRingIcon, glow: "rgba(255,255,255,0.18)" },
  mantenimiento: { Icon: MaintenanceIcon, glow: "rgba(255,255,255,0.135)" },
} as const;

/** Tarjetas de garantía, pago y mantenimiento (D-068; estilo del panel desde D-141). */
export function Assurances({
  className,
  items = precios.aseguramientos,
}: {
  className?: string;
  /** Textos propios de las tarjetas (landing de campaña, D-192); si no, los del sitio. */
  items?: typeof precios.aseguramientos;
}) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-3", className)}>
      {items.map((a, i) => {
        const { Icon, glow } = ICONOS_GLASS[a.tipo as keyof typeof ICONOS_GLASS];
        return (
          <Reveal key={a.tipo} delay={i * 90} className="h-full">
            <article className="v2-glass flex h-full flex-col p-6" style={{ ["--glow" as string]: glow }}>
              <div className="flex h-24 items-center justify-start">
                <Icon />
              </div>
              <h3 className="mt-4 font-display text-xl font-bold tracking-heading text-white">{a.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fog">{a.texto}</p>
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}

export default function PricingSection() {
  return (
    <section id="precios" aria-labelledby="precios-titulo" className="relative isolate scroll-mt-20 py-20 sm:py-28">
      {/* Luz detrás de la tarjeta recomendada (D-071) */}
      <GridBackground orb="50% 38%" />
      <Container>
        <SectionHeader id="precios-titulo" title={precios.titulo} />
        <div className="mt-12 grid gap-5 lg:grid-cols-3 lg:items-stretch">
          {precios.paquetes
            .filter((p) => !p.banner)
            .map((p, i) => (
              <Reveal key={p.nombre} delay={i * 80} className="h-full">
                <PricingCard paquete={p} />
              </Reveal>
            ))}
        </div>

        {/* D-175: el paquete cotizado va como banner del ancho de las 3 columnas */}
        {precios.paquetes
          .filter((p) => p.banner)
          .map((p) => (
            <Reveal key={p.nombre} className="mt-5">
              <PricingBanner paquete={p} />
            </Reveal>
          ))}

        <Assurances className="mt-8" />

        <p className="mt-8 text-center text-fog">
          {precios.ayuda}{" "}
          <Link href={AGENDAR} className="font-semibold text-white underline decoration-white/30 underline-offset-4 hover:text-lime">
            {precios.ayudaCta}
          </Link>
        </p>
      </Container>
    </section>
  );
}
