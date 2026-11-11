"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "./Button";
import { AGENDAR, menu } from "@/content/inicio";
import type { Boton } from "@/lib/sitio-textos";
import { cn } from "@/lib/utils";

// Barra fija en celular (02-arquitectura.md §1): aparece al bajar del hero.
// Se anima solo con transform/opacity. Oculta en escritorio y en /agendar (allí ya está la acción).
export default function StickyBookBar({ cta = { texto: menu.cta, enlace: AGENDAR } }: { cta?: Boton }) {
  const [show, setShow] = useState(false);
  const enAgendar = usePathname()?.startsWith("/agendar");

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (enAgendar) return null;
  return (
    <div
      aria-hidden={!show}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-white/8 bg-ink/85 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl transition-[transform,opacity,visibility] duration-300 lg:hidden",
        show ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none translate-y-full opacity-0"
      )}
    >
      <Button href={cta.enlace} external={/^https:\/\//i.test(cta.enlace)} size="lg" className="w-full">
        {cta.texto}
      </Button>
    </div>
  );
}
