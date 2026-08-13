"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { from: "them" | "sara"; text: string };

const script: Msg[] = [
  { from: "them", text: "Hola, ¿hacen domicilios?" },
  { from: "sara", text: "¡Hola! Sí 🛵 Llevamos a toda la ciudad. ¿A qué barrio sería?" },
  { from: "them", text: "A Chapinero" },
  { from: "sara", text: "Perfecto, a Chapinero llega en ~40 min. ¿Qué te provoca pedir?" },
  { from: "them", text: "Dos combos personales" },
  { from: "sara", text: "Listo 🙌 Dos combos a Chapinero. ¿Pagas con efectivo o transferencia?" },
  { from: "them", text: "Transferencia" },
  { from: "sara", text: "De una. Te paso los datos y te confirmo el pedido por aquí 👍" },
];

function Bubble({ from, text }: Msg) {
  const them = from === "them";
  return (
    <div className={`flex ${them ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-snug ${
          them
            ? "rounded-tl-sm bg-white/10 text-white/95"
            : "rounded-tr-sm bg-lime text-ink font-medium"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

function Typing() {
  return (
    <div className="flex justify-end">
      <div className="flex items-center gap-1 rounded-2xl rounded-tr-sm bg-lime/80 px-3.5 py-2.5">
        <span className="h-1.5 w-1.5 rounded-full bg-ink/70 animate-blink" />
        <span className="h-1.5 w-1.5 rounded-full bg-ink/70 animate-blink [animation-delay:200ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-ink/70 animate-blink [animation-delay:400ms]" />
      </div>
    </div>
  );
}

export default function ChatDemo() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [count, setCount] = useState(0);
  const [typing, setTyping] = useState(false);
  const [started, setStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setCount(script.length);
      return;
    }

    const check = () => {
      if (started || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
        setStarted(true);
        window.removeEventListener("scroll", check);
        window.removeEventListener("resize", check);
      }
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const run = (i: number) => {
      if (cancelled || i >= script.length) return;
      const isSara = script[i].from === "sara";
      const showDelay = isSara ? 950 : 700;

      if (isSara) setTyping(true);

      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          setTyping(false);
          setCount(i + 1);
          timers.push(setTimeout(() => run(i + 1), 550));
        }, showDelay)
      );
    };

    run(0);
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [started]);

  useEffect(() => {
    const box = scrollRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [count, typing]);

  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-content px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl">
            <span className="text-sm font-semibold uppercase tracking-wider text-brand">
              Míralo funcionando
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-[2.75rem]">
              Así atiende tu negocio mientras tú haces otra cosa.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              Este es un ejemplo de cómo conversa el chatbot: responde, resuelve y deja
              el pedido casi cerrado. Tú solo llegas a rematar la venta.
            </p>
            <ul className="mt-6 space-y-2.5">
              {["Responde en segundos, a cualquier hora", "Agenda y cotiza sin que estés tú", "Te pasa el cliente listo para comprar"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-3 text-[15px] text-ink">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                    {item}
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Teléfono */}
          <div ref={ref} className="mx-auto w-full max-w-[360px]">
            <div className="rounded-[2rem] border border-white/10 bg-ink p-3 shadow-[0_40px_80px_-40px_rgba(125,83,255,0.6)]">
              <div className="flex items-center gap-2.5 px-2 pb-3 pt-1">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lime font-display text-sm font-extrabold text-ink">
                  S
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-paper">Sara · tu negocio</p>
                  <p className="flex items-center gap-1.5 text-xs text-white/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-lime" /> en línea
                  </p>
                </div>
              </div>
              <div
                ref={scrollRef}
                className="h-[360px] space-y-2 overflow-hidden rounded-2xl bg-white/5 p-3"
              >
                {script.slice(0, count).map((m, i) => (
                  <Bubble key={i} {...m} />
                ))}
                {typing && <Typing />}
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-muted">
              Ejemplo de conversación. Adaptamos el chatbot a tu negocio.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
