import Reveal from "./Reveal";
import Ring from "./Ring";
import { CheckIcon } from "./icons";

const today = [
  "Respondes cuando puedes, no cuando el cliente escribe",
  "Los mensajes se acumulan en la noche y el fin de semana",
  "Repites las mismas tareas a mano, una y otra vez",
];

const withArata = [
  "Contesta cada mensaje al instante, a cualquier hora",
  "Agenda, cotiza y filtra a los que sí van a comprar",
  "Lo repetitivo pasa solo y te ahorra horas",
];

export default function Cost() {
  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-content px-5 py-20 sm:px-8 sm:py-28">
        <Reveal className="max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand">
            Lo que te cuesta seguir así
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-[2.75rem]">
            Cada hora en tareas manuales es tiempo y plata que se va.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            No siempre necesitas más publicidad. Muchas veces basta con atender bien lo
            que ya te llega y dejar de repetir trabajo a mano. Mira la diferencia.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {/* Hoy */}
          <Reveal
            variant="left"
            className="group rounded-2xl border border-line bg-paper p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-40px_rgba(3,1,11,0.3)] sm:p-8"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-wide text-muted">
                Como estás hoy
              </p>
              <Ring
                value={33}
                size={92}
                stroke={10}
                centerValue={8}
                centerPrefix="~"
                centerSuffix="h"
                trackColor="rgba(3,1,11,0.08)"
                arcColor="#A69FC0"
                centerColor="#03010B"
                labelColor="#4A4560"
                label="Atención al día"
              />
            </div>
            <ul className="mt-6 space-y-3">
              {today.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] font-medium text-ink/85">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink/10 text-sm font-bold text-ink/70">
                    ✕
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Con Arata — tarjeta oscura para resaltar nuestra opción */}
          <Reveal
            variant="right"
            delay={110}
            className="group rounded-2xl border border-ink bg-ink p-6 text-paper shadow-[0_34px_70px_-34px_rgba(3,1,11,0.55)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_40px_80px_-32px_rgba(125,83,255,0.5)] sm:p-8"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-2">
                <span className="w-fit rounded-full bg-lime px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-ink">
                  Recomendado
                </span>
                <p className="text-sm font-semibold uppercase tracking-wide text-lime">
                  Con Arata San
                </p>
              </div>
              <Ring
                value={100}
                size={92}
                stroke={10}
                centerValue={24}
                centerSuffix="h"
                trackColor="rgba(255,255,255,0.14)"
                arcColor="#B6FF00"
                centerColor="#FFFFFF"
                labelColor="rgba(255,255,255,0.7)"
                label="Atención al día"
              />
            </div>
            <ul className="mt-6 space-y-3">
              {withArata.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] font-medium text-white/90">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime text-ink">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
