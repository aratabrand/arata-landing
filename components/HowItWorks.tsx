"use client";

import { useEffect, useRef, useState } from "react";
import WhatsAppCTA from "./WhatsAppCTA";

const steps = [
  {
    n: "01",
    title: "Hablamos",
    body: "Agendas por WhatsApp y miramos tu negocio juntos. Entendemos qué vendes y qué te está frenando. Sin costo.",
  },
  {
    n: "02",
    title: "Montamos",
    body: "Te armamos la página, el chatbot y la automatización. Nosotros hacemos el trabajo técnico; tú no tocas nada.",
  },
  {
    n: "03",
    title: "Vendes",
    body: "Tu negocio empieza a atender y agendar solo. Tú ves qué pasa y nosotros le hacemos seguimiento para que mejore.",
  },
];

export default function HowItWorks() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(1);
      return;
    }
    const onScroll = () => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = (vh * 0.78 - rect.top) / (rect.height * 0.85);
      setProgress(Math.max(0, Math.min(1, p)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section id="como" className="relative overflow-hidden bg-ink text-paper">
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-50" />
      <div className="relative mx-auto max-w-content px-5 py-20 sm:px-8 sm:py-28">
        <div className="max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-wider text-lime">
            Cómo funciona
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-[2.75rem]">
            Tres pasos. Tú solo das el primero.
          </h2>
        </div>

        <div ref={trackRef} className="relative mt-14 pl-14">
          {/* Riel base (centro del riel = 18px, centro del nodo w-9) */}
          <div className="absolute left-[17px] top-3 bottom-3 w-0.5 rounded bg-white/12" />
          {/* Riel de progreso (crece con el scroll) */}
          <div
            className="timeline-line absolute left-[17px] top-3 bottom-3 w-0.5 rounded bg-lime"
            style={{ ["--progress" as string]: progress }}
          />

          <ol className="space-y-12 sm:space-y-16">
            {steps.map((step, i) => {
              const active = progress >= (i + 0.35) / steps.length;
              return (
                <li key={step.n} className="relative">
                  {/* Nodo: -left-14 lo lleva al borde del contenedor; w-9 centra en el riel */}
                  <span
                    className={`absolute -left-14 top-1.5 flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                      active
                        ? "border-lime bg-lime text-ink"
                        : "border-white/25 bg-ink text-white/40"
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-current" />
                  </span>
                  <div
                    className={`transition-all duration-500 ${
                      active ? "opacity-100" : "opacity-55"
                    }`}
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="font-display text-4xl font-extrabold text-lime sm:text-5xl">
                        {step.n}
                      </span>
                      <h3 className="font-display text-2xl font-bold sm:text-3xl">
                        {step.title}
                      </h3>
                    </div>
                    <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/75">
                      {step.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-14 pl-14">
          <WhatsAppCTA variant="lime" label="Empezar por el paso 1" />
        </div>
      </div>
    </section>
  );
}
