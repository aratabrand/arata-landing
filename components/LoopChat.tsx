"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { from: "them" | "sara"; text: string };

function Bubble({ from, text }: Msg) {
  const them = from === "them";
  return (
    <div className={`flex ${them ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-[13px] leading-snug ${
          them
            ? "rounded-tl-sm bg-white/12 text-white/95"
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
      <div className="flex items-center gap-1 rounded-2xl rounded-tr-sm bg-lime/80 px-3 py-2">
        <span className="h-1.5 w-1.5 rounded-full bg-ink/70 animate-blink" />
        <span className="h-1.5 w-1.5 rounded-full bg-ink/70 animate-blink [animation-delay:200ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-ink/70 animate-blink [animation-delay:400ms]" />
      </div>
    </div>
  );
}

// Reproduce la conversación en bucle infinito (con indicador de "escribiendo").
export default function LoopChat({
  script,
  className = "",
}: {
  script: Msg[];
  className?: string;
}) {
  const [count, setCount] = useState(0);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(script.length);
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const push = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };

    const run = (i: number) => {
      if (cancelled) return;
      if (i >= script.length) {
        // Pausa al final y reinicia el bucle
        push(() => {
          if (cancelled) return;
          setCount(0);
          setTyping(false);
          push(() => run(0), 500);
        }, 2400);
        return;
      }
      const isSara = script[i].from === "sara";
      if (isSara) setTyping(true);
      push(
        () => {
          if (cancelled) return;
          setTyping(false);
          setCount(i + 1);
          push(() => run(i + 1), 600);
        },
        isSara ? 950 : 750
      );
    };

    run(0);
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [script]);

  useEffect(() => {
    const box = scrollRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [count, typing]);

  return (
    <div
      ref={scrollRef}
      className={`space-y-2 overflow-hidden ${className}`}
    >
      {script.slice(0, count).map((m, i) => (
        <Bubble key={i} {...m} />
      ))}
      {typing && <Typing />}
    </div>
  );
}
