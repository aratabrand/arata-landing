import Reveal from "./Reveal";
import WhatsAppCTA from "./WhatsAppCTA";
import LightRays from "./ui/LightRaysLazy";

export default function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-ink text-paper">
      {/* Rayos de luz WebGL (color de marca) */}
      <div className="pointer-events-none absolute inset-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#B6FF00"
          raysSpeed={1.1}
          lightSpread={0.9}
          rayLength={1.4}
          followMouse={true}
          mouseInfluence={0.12}
          noiseAmount={0.08}
          distortion={0.04}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-content px-5 py-28 text-center sm:px-8 sm:py-36">
        <Reveal variant="scale" className="mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/85">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" />
            El primer paso es una conversación
          </span>
          <h2 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] sm:text-6xl">
            Agenda tu diagnóstico.
            <br />
            <span className="text-lime">Sin costo.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/80">
            Miramos tu negocio y te decimos qué necesita para vender más por internet.
            Si te sirve, seguimos. Si no, te queda la claridad. Sin compromiso.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <WhatsAppCTA variant="lime" label="Escríbenos por WhatsApp" />
            <a
              href="#solucion"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3.5 text-[15px] font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-lime hover:text-lime"
            >
              Ver qué hacemos
            </a>
          </div>
          <p className="mt-4 text-sm text-white/60">Te respondemos hoy.</p>
        </Reveal>
      </div>
    </section>
  );
}
