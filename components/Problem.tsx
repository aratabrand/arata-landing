import Reveal from "./Reveal";

const pains = [
  {
    title: "Contestas tarde",
    body: "Entre atender el local y responder el celular, los mensajes se acumulan. Cuando respondes, el cliente ya se fue.",
  },
  {
    title: "Se te pierden mensajes",
    body: "Un chat que no viste a tiempo es una venta que ni supiste que tenías. Y le compran al que respondió primero.",
  },
  {
    title: "Todo depende de ti",
    body: "Si tú no estás, el negocio no atiende. No puedes vivir pegado al teléfono ni contestar a la medianoche.",
  },
];

export default function Problem() {
  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-content px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal variant="left" className="lg:sticky lg:top-28 lg:self-start">
            <span className="text-sm font-semibold uppercase tracking-wider text-brand">
              El problema
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-[2.75rem]">
              Los clientes escriben. Muchos se quedan sin respuesta.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              No es que no lleguen clientes: es que nadie los atendió a tiempo. Cuando
              todo lo haces a mano, no alcanzas.
            </p>
          </Reveal>

          {/* Lista escalonada con hairlines (variación frente a las tarjetas) */}
          <ul className="border-t border-line">
            {pains.map((pain, i) => (
              <Reveal
                as="li"
                key={pain.title}
                variant="right"
                delay={i * 110}
                className="group border-b border-line"
              >
                <div className="flex items-start gap-5 py-7 transition-all duration-300 group-hover:translate-x-1.5">
                  <span className="font-display text-4xl font-extrabold leading-none text-brand transition-colors duration-300 group-hover:text-ink sm:text-5xl">
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-bold text-ink sm:text-2xl">
                      {pain.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-muted">
                      {pain.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
