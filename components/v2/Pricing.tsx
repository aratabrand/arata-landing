import Link from "next/link";
import { Check } from "lucide-react";
import Reveal from "@/components/Reveal";
import { GridBackground } from "@/components/ui/grid-background";
import { Button } from "./Button";
import { Container, SectionHeader } from "./primitives";
import { AGENDAR, precios, type Paquete } from "@/content/inicio";
import { cn } from "@/lib/utils";

// Precios (ref. 21st.dev captura 03, D-044):
// la tarjeta recomendada lleva borde morado + brillo + badge y el ÚNICO botón lima.
// La garantía va junto al precio (Hormozi: donde aparece la duda), en tarjetas glass (D-068).

export function PricingCard({ paquete }: { paquete: Paquete }) {
  const rec = paquete.recomendado;
  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-card border bg-surface-1 p-6 sm:p-7",
        rec ? "border-brand shadow-glow-purple" : "border-white/8"
      )}
    >
      {rec && (
        <span className="absolute -top-3 left-6 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
          Recomendado
        </span>
      )}
      <h3 className="font-display text-xl font-bold tracking-heading text-white">{paquete.nombre}</h3>
      <p className="mt-5 font-display text-[2.4rem] font-extrabold leading-none tracking-display text-white">
        {paquete.precio}
      </p>
      {paquete.nota && <p className="mt-2 text-sm text-fog-dim">{paquete.nota}</p>}

      <Button href={AGENDAR} variant={rec ? "primary" : "secondary"} className="mt-6 w-full">
        {paquete.boton}
      </Button>

      <ul className="mt-6 space-y-3 border-t border-white/8 pt-6">
        {paquete.incluye.map((item) => (
          <li key={item} className="flex gap-3 text-sm text-fog">
            <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-brand-soft" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {paquete.adicional && <p className="mt-6 text-xs leading-relaxed text-fog-dim">{paquete.adicional}</p>}
    </article>
  );
}

/* Íconos SVG animados de las tarjetas glass (se dibujan con .is-visible de <Reveal>) */

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
      <circle cx="50" cy="52" r="4.5" fill="#18112D" stroke="#FFFFFF" strokeWidth="1.6" />
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
        stroke="#7D53FF"
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
      <circle className="v2-spin" cx="50" cy="50" r="46" fill="none" stroke="rgba(185,164,255,0.45)" strokeWidth="1.4" strokeDasharray="2 6" strokeLinecap="round" />
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
  pago: { Icon: SplitRingIcon, glow: "rgba(125,83,255,0.4)" },
  mantenimiento: { Icon: MaintenanceIcon, glow: "rgba(185,164,255,0.3)" },
} as const;

/** Tarjetas glass de garantía, pago y mantenimiento (D-068). */
export function Assurances({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-3", className)}>
      {precios.aseguramientos.map((a, i) => {
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
          {precios.paquetes.map((p, i) => (
            <Reveal key={p.nombre} delay={i * 80} className="h-full">
              <PricingCard paquete={p} />
            </Reveal>
          ))}
        </div>

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
