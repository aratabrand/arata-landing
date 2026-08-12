"use client";

import { useState } from "react";

const faqs = [
  {
    q: "¿Esto es muy técnico para mí?",
    a: "No tienes que tocar nada. Nosotros montamos y mantenemos todo. Tú solo atiendes a los clientes que llegan listos para comprar.",
  },
  {
    q: "Ya intenté cosas digitales y no me funcionaron.",
    a: "Casi siempre falla porque son piezas sueltas, sin estrategia y sin seguimiento. Nosotros montamos una estructura completa y le hacemos seguimiento para que sí venda.",
  },
  {
    q: "¿Cuánto cuesta?",
    a: "Depende de lo que tu negocio necesita. Por eso primero agendamos una reunión, miramos tu caso y te decimos exactamente qué te sirve y cuánto vale. Sin sorpresas.",
  },
  {
    q: "¿En cuánto tiempo veo resultados?",
    a: "Depende del negocio y de lo que montemos. En la reunión te damos un estimado realista, sin prometerte cosas que no podemos cumplir.",
  },
  {
    q: "¿Trabajan con negocios fuera de Bogotá?",
    a: "Sí. Somos de Bogotá, pero trabajamos con negocios en toda Colombia. Todo se coordina por WhatsApp y llamada.",
  },
];

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const id = q.replace(/\s+/g, "-").toLowerCase();

  return (
    <div className="border-b border-white/12">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={`faq-${id}`}
          className="group flex w-full items-center justify-between gap-4 py-5 text-left"
        >
          <span className="font-display text-lg font-bold text-paper transition-colors group-hover:text-lime sm:text-xl">
            {q}
          </span>
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 text-lime transition-transform duration-300 ${
              open ? "rotate-45" : ""
            }`}
            aria-hidden="true"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
              <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
        </button>
      </h3>
      <div
        id={`faq-${id}`}
        className={`grid overflow-hidden transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0">
          <p className="pb-6 pr-12 text-[15px] leading-relaxed text-white/70">{a}</p>
        </div>
      </div>
    </div>
  );
}

export default function Faq() {
  return (
    <section id="dudas" className="bg-ink text-paper">
      <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-28">
        <span className="text-sm font-semibold uppercase tracking-wider text-lime">
          Dudas frecuentes
        </span>
        <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-[2.75rem]">
          Lo que todo dueño de negocio pregunta.
        </h2>
        <div className="mt-10">
          {faqs.map((faq) => (
            <Item key={faq.q} {...faq} />
          ))}
        </div>
      </div>
    </section>
  );
}
