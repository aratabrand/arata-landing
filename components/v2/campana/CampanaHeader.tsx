"use client";

import { useEffect, useState, type ReactNode } from "react";
import Logo from "@/components/Logo";
import { Button } from "../Button";
import type { Boton } from "@/lib/sitio-textos";
import { cn } from "@/lib/utils";

// Header de las landings de campaña (D-189): solo logo y botón de agendar.
// Sin menú ni enlaces a otras páginas: quien llega por un anuncio tiene una sola salida.
// Mismo estilo del header del sitio: transparente arriba y vidrio oscuro al bajar.
// D-192: si hay `cinta` (oferta), va encima del menú y las dos quedan fijas arriba.
export default function CampanaHeader({ cta, cinta }: { cta: Boton; cinta?: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      {cinta}
      <header
        className={cn(
          "transition-colors duration-300",
          scrolled ? "border-b border-white/6 bg-noche/80 backdrop-blur-xl" : "border-b border-transparent bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-v2 items-center justify-between px-4 sm:px-6 lg:px-8">
          <span className="flex h-11 shrink-0 items-center" aria-label="Arata San">
            <Logo surface="dark" className="h-6 w-auto" />
          </span>
          <Button href={cta.enlace} size="md" className="h-10">
            {cta.texto}
          </Button>
        </div>
      </header>
    </div>
  );
}
