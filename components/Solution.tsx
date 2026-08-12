import Reveal from "./Reveal";
import ServicesBento from "./ui/bento-grid-01";

export default function Solution() {
  return (
    <section id="solucion" className="relative overflow-hidden bg-ink text-paper">
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-content px-5 py-20 sm:px-8 sm:py-28">
        <Reveal className="max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-wider text-lime">
            Qué hacemos
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-[2.75rem]">
            Todo lo que tu negocio necesita para vender en línea, en un solo lugar.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/70">
            Juntamos las piezas y las hacemos trabajar juntas. Tú te dedicas a tu
            negocio; nosotros a que funcione en internet.
          </p>
        </Reveal>

        <div className="mt-12">
          <ServicesBento />
        </div>
      </div>
    </section>
  );
}
