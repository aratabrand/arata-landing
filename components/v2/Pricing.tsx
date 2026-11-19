import Link from "next/link";
import { Check } from "lucide-react";
import Reveal from "@/components/Reveal";
import { GridBackground } from "@/components/ui/grid-background";
import { Button } from "./Button";
import { Container, SectionHeader } from "./primitives";
import { AGENDAR, precios, type Paquete } from "@/content/inicio";
import { cn } from "@/lib/utils";

// Precios (ref. 21st.dev captura 03, D-044; rediseño D-138):
// tarjetas oscuras finas y la recomendada en BLANCO con texto ink (20:1), etiqueta "Recomendado"
// dentro de la tarjeta y botón negro con círculo lima. El precio separa "Desde" del número.
// La garantía va junto al precio (Hormozi: donde aparece la duda), en tarjetas (D-068).

/** "Desde 400 USD" → "Desde" pequeño + "400 USD" grande. Otros textos, tal cual. */
export function Precio({ texto, claro = false, className }: { texto: string; claro?: boolean; className?: string }) {
  const m = texto.match(/^(Desde)\s+(.+)$/i);
  return (
    <p className={cn("font-display tracking-display", claro ? "text-ink" : "text-white", className)}>
      {m && <span className={cn("mb-2 block font-sans text-sm font-medium tracking-normal", claro ? "text-ink/60" : "text-fog-dim")}>{m[1]}</span>}
      <span className="block text-[2.6rem] font-bold leading-none">{m ? m[2] : texto}</span>
    </p>
  );
}

export function PricingCard({ paquete }: { paquete: Paquete }) {
  const rec = paquete.recomendado;
  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-[28px] border p-7 sm:p-8",
        rec ? "border-white bg-paper text-ink" : "border-white/8 bg-surface-1"
      )}
    >
      <div className="flex min-h-7 items-center justify-between gap-3">
        <h3 className={cn("text-sm font-semibold", rec ? "text-ink" : "text-fog")}>{paquete.nombre}</h3>
        {rec && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-lime" />
            Recomendado
          </span>
        )}
      </div>
      <Precio texto={paquete.precio} claro={rec} className="mt-8" />
      {paquete.nota && <p className={cn("mt-3 text-sm", rec ? "text-ink/70" : "text-fog-dim")}>{paquete.nota}</p>}

      <Button href={AGENDAR} variant={rec ? "ink" : "secondary"} arrow className="mt-8 w-full">
        {paquete.boton}
      </Button>

      <ul className={cn("mt-8 space-y-3.5 border-t pt-7", rec ? "border-ink/10" : "border-white/8")}>
        {paquete.incluye.map((item) => (
          <li key={item} className={cn("flex gap-3 text-sm", rec ? "text-ink/80" : "text-fog")}>
            <span
              aria-hidden
              className={cn(
                "mt-px grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full",
                rec ? "bg-brand/10 text-brand" : "bg-white/[0.06] text-white"
              )}
            >
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {paquete.adicional && <p className={cn("mt-6 text-xs leading-relaxed", rec ? "text-ink/70" : "text-fog-dim")}>{paquete.adicional}</p>}
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
