import WhatsAppCTA from "./WhatsAppCTA";
import Ring from "./Ring";
import CountUp from "./CountUp";
import LoopChat from "./LoopChat";
import { BackgroundCells } from "./ui/background-ripple-effect";

const heroScript = [
  { from: "them", text: "Buenas, ¿todavía tienen la promo?" },
  { from: "sara", text: "¡Hola! Sí 🙌 Te la aparto. ¿Para qué día la necesitas?" },
  { from: "them", text: "Para el sábado" },
  { from: "sara", text: "Listo, te dejé agendado el sábado. ¿Te confirmo por aquí?" },
] as const;

// Punto "en vivo" que titila
function LiveDot() {
  return (
    <span className="relative flex h-1.5 w-1.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-75" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-lime" />
    </span>
  );
}

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-ink text-paper">
      <BackgroundCells />

      <div className="pointer-events-none relative z-10 mx-auto max-w-content px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-36">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          {/* Columna de mensaje — entrada escalonada */}
          <div>
            <span className="pointer-events-auto inline-flex animate-fade-up items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/85">
              <LiveDot />
              Agencia digital · Bogotá
            </span>

            <h1 className="mt-6 animate-fade-up font-display text-[1.95rem] font-extrabold leading-[1.05] [animation-delay:50ms] sm:text-5xl lg:text-6xl">
              Automatiza tu negocio.{" "}
              <span className="text-lime">Ahorra tiempo y dinero.</span>
            </h1>

            <p className="mt-5 max-w-xl animate-fade-up text-base leading-relaxed text-white/80 [animation-delay:110ms] sm:mt-6 sm:text-lg">
              Optimizamos tus procesos con IA y marketing: automatizamos lo repetitivo,
              aprovechamos mejor tu presupuesto y te liberamos horas para lo que de
              verdad hace crecer tu negocio.
            </p>

            <div className="pointer-events-auto mt-8 flex animate-fade-up flex-col items-stretch gap-3 [animation-delay:170ms] sm:flex-row sm:items-center">
              <WhatsAppCTA variant="lime" />
              <a
                href="#solucion"
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/30 px-6 py-3.5 text-[15px] font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-lime hover:text-lime"
              >
                Ver cómo funciona
              </a>
            </div>
            <p className="mt-3 animate-fade-up text-sm text-white/60 [animation-delay:210ms]">
              Te respondemos hoy. El diagnóstico es sin costo.
            </p>
          </div>

          {/* Panel de operaciones (firma visual) */}
          <div className="pointer-events-auto animate-fade-up [animation-delay:120ms]">
            <div className="glass-dark rounded-2xl p-4 transition-transform duration-500 hover:-translate-y-1 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lime font-display text-sm font-extrabold text-ink">
                    S
                  </span>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold">Sara</p>
                    <p className="flex items-center gap-1.5 text-xs text-white/70">
                      <LiveDot />
                      En línea · atendiendo
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/80">
                  WhatsApp
                </span>
              </div>

              <LoopChat script={[...heroScript]} className="h-[168px]" />

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-white/6 px-3 py-2.5 text-center">
                  <CountUp
                    value={24}
                    suffix="/7"
                    className="font-display text-lg font-extrabold text-lime"
                  />
                  <p className="text-[11px] text-white/70">Siempre en línea</p>
                </div>
                <div className="rounded-xl bg-white/6 px-3 py-2.5 text-center">
                  <p className="font-display text-lg font-extrabold text-lime">&lt;1 min</p>
                  <p className="text-[11px] text-white/70">En responder</p>
                </div>
                <div className="rounded-xl bg-white/6 px-3 py-2.5 text-center">
                  <p className="font-display text-lg font-extrabold text-lime">Agenda</p>
                  <p className="text-[11px] text-white/70">Sola</p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl glass-dark px-5 py-4">
              <div>
                <p className="text-sm font-semibold">Menos tareas repetitivas</p>
                <p className="text-xs text-white/70">El sistema hace lo operativo por ti</p>
              </div>
              <Ring value={100} size={72} stroke={9} centerValue={100} centerSuffix="%" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
