"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Target, MessageSquare, Zap, BarChart3, Layers, Globe } from "lucide-react";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ---------- Mini-visuales de marca ---------- */

function ConversionFlow() {
  const reduced = useReducedMotion();
  const steps = ["Llega", "Escribe", "Compra"];
  const [active, setActive] = useState(reduced ? 2 : 0);
  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setActive((a) => (a + 1) % 3), 1100);
    return () => clearInterval(t);
  }, [reduced]);
  return (
    <div className="flex flex-col items-center gap-2.5">
      {steps.map((s, i) => (
        <motion.div
          key={s}
          animate={{
            scale: i === active ? 1.04 : 1,
            opacity: i <= active ? 1 : 0.4,
          }}
          transition={{ duration: 0.5, ease: EASE }}
          className={`w-32 rounded-full px-4 py-2 text-center text-sm font-semibold transition-colors ${
            i === active
              ? "bg-lime text-ink"
              : "border border-white/15 text-white/70"
          }`}
        >
          {s}
        </motion.div>
      ))}
    </div>
  );
}

function ChatDots() {
  const reduced = useReducedMotion();
  return (
    <div className="flex items-end gap-1.5 rounded-2xl rounded-bl-sm bg-white/10 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2.5 w-2.5 rounded-full bg-lime"
          animate={reduced ? {} : { y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

function AutomationFlow() {
  const reduced = useReducedMotion();
  return (
    <div className="relative flex w-full max-w-[200px] items-center justify-between">
      <div className="absolute left-4 right-4 top-1/2 h-0.5 -translate-y-1/2 bg-white/12" />
      {!reduced && (
        <motion.span
          className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-lime shadow-[0_0_12px_2px_rgba(182,255,0,0.6)]"
          animate={{ left: ["12%", "50%", "88%"] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: EASE }}
        />
      )}
      {[Target, Zap, BarChart3].map((Icon, i) => (
        <div
          key={i}
          className="relative z-10 flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-ink text-white/80"
        >
          <Icon className="h-5 w-5" />
        </div>
      ))}
    </div>
  );
}

function MiniBars() {
  const reduced = useReducedMotion();
  const bars = [0.5, 0.8, 0.65, 1];
  return (
    <div className="flex h-20 items-end gap-2.5">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="w-5 rounded-t-md bg-gradient-to-t from-brand to-lime"
          initial={{ height: 6 }}
          animate={reduced ? { height: h * 80 } : { height: [6, h * 80, h * 60, h * 80] }}
          transition={{
            duration: 2,
            repeat: reduced ? 0 : Infinity,
            delay: i * 0.12,
            ease: EASE,
          }}
        />
      ))}
    </div>
  );
}

function LayersStack() {
  const reduced = useReducedMotion();
  return (
    <div className="relative h-24 w-40">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute left-0 right-0 mx-auto h-10 rounded-lg border border-white/15 bg-white/10"
          style={{ top: i * 18, width: `${88 - i * 8}%` }}
          animate={reduced ? {} : { y: [0, -3, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.25, ease: EASE }}
        />
      ))}
    </div>
  );
}

function GlobePulse() {
  const reduced = useReducedMotion();
  return (
    <div className="relative flex h-24 items-center justify-center">
      <Globe className="relative z-10 h-14 w-14 text-lime" />
      {!reduced &&
        [0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute h-14 w-14 rounded-full border border-lime/40"
            initial={{ scale: 0.6, opacity: 0.9 }}
            animate={{ scale: 2.6, opacity: 0 }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 1, ease: "easeOut" }}
          />
        ))}
    </div>
  );
}

/* ---------- Tarjeta ---------- */

type Tile = {
  visual: React.ReactNode;
  icon: typeof Target;
  title: string;
  body: string;
  span: string;
  hover?: object;
};

const tiles: Tile[] = [
  {
    visual: <ConversionFlow />,
    icon: Target,
    title: "Páginas que venden",
    body: "Hechas para que la gente que llega compre o te escriba, no para adornar.",
    span: "md:col-span-2 md:row-span-2",
    hover: { scale: 1.02 },
  },
  {
    visual: <ChatDots />,
    icon: MessageSquare,
    title: "Un chatbot que atiende",
    body: "Contesta, cotiza y agenda por ti en WhatsApp. Todo el día.",
    span: "md:col-span-2",
    hover: { scale: 0.98 },
  },
  {
    visual: <AutomationFlow />,
    icon: Zap,
    title: "Automatización",
    body: "Conectamos tus herramientas para que lo repetitivo pase solo y no te robe horas.",
    span: "md:col-span-2 md:row-span-2",
    hover: { scale: 1.02 },
  },
  {
    visual: <MiniBars />,
    icon: BarChart3,
    title: "Apps a tu medida",
    body: "Ves tus números claros y decides sin adivinar.",
    span: "md:col-span-2",
    hover: { scale: 0.98 },
  },
  {
    visual: <LayersStack />,
    icon: Layers,
    title: "Estructura que dura",
    body: "Bases digitales ordenadas que crecen contigo, no parches sueltos.",
    span: "md:col-span-3",
    hover: { scale: 0.98 },
  },
  {
    visual: <GlobePulse />,
    icon: Globe,
    title: "Atiende 24/7",
    body: "Tu negocio disponible siempre, aunque tú estés descansando.",
    span: "md:col-span-3",
    hover: { scale: 0.98 },
  },
];

export default function ServicesBento() {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (reduced) {
      setInView(true);
      return;
    }
    let done = false;
    const check = () => {
      if (done || !gridRef.current) return;
      const rect = gridRef.current.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
        done = true;
        setInView(true);
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
  }, [reduced]);

  return (
    <div ref={gridRef} className="grid grid-cols-1 gap-4 md:grid-cols-6 md:auto-rows-[200px]">
      {tiles.map((tile, i) => {
        const Icon = tile.icon;
        return (
          <motion.article
            key={tile.title}
            className={`group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors duration-300 hover:border-lime/40 sm:p-8 ${tile.span}`}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
            whileHover={{
              ...tile.hover,
              boxShadow: "0 30px 60px -35px rgba(182,255,0,0.35)",
            }}
          >
            {/* Texto arriba: alinea los títulos entre tarjetas de una misma fila */}
            <div>
              <h3 className="flex items-center gap-2 font-display text-xl font-bold text-paper sm:text-2xl">
                <Icon className="h-5 w-5 shrink-0 text-lime" />
                <span>{tile.title}</span>
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-white/70">
                {tile.body}
              </p>
            </div>
            {/* Visual abajo, llenando el espacio restante */}
            <div className="flex flex-1 items-center justify-center pt-8">
              {tile.visual}
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
