"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "./Button";
import ProjectPreview from "./ProjectPreview";
import { AGENDAR, INICIO, menu } from "@/content/inicio";
import { cn } from "@/lib/utils";

// Header v2 (ref. 21st.dev captura 05):
// barra completa, transparente arriba y con vidrio oscuro al bajar;
// "Servicios ▾" abre un mega menú con tarjetas de vista previa;
// en celular, panel a pantalla completa.

const previews = [
  { nombre: "Páginas que venden", tipos: ["Página" as const], acento: "#B6FF00" },
  { nombre: "Catálogos y sistemas", tipos: ["Catálogo" as const], acento: "#7D53FF" },
  { nombre: "Portafolio", tipos: ["Sistema" as const], acento: "#9B7BFF" },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);
  const [mobile, setMobile] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const megaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeAll = useCallback(() => {
    setMega(false);
    setMobile(false);
  }, []);

  // Escape cierra; clic afuera cierra el mega menú
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeAll();
    const onDown = (e: MouseEvent) => {
      if (mega && megaRef.current && !megaRef.current.contains(e.target as Node)) setMega(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, [mega, closeAll]);

  // Bloquea el scroll del fondo con el panel móvil abierto
  useEffect(() => {
    document.documentElement.style.overflow = mobile ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [mobile]);

  const openMega = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setMega(true);
  };
  const scheduleClose = () => {
    closeTimer.current = window.setTimeout(() => setMega(false), 140);
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || mobile
          ? "border-b border-white/6 bg-ink/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-v2 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={INICIO} aria-label="Arata San — inicio" className="shrink-0" onClick={closeAll}>
          <Logo surface="dark" className="h-6 w-auto" />
        </Link>

        {/* Escritorio */}
        <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
          <div ref={megaRef} className="relative" onPointerEnter={openMega} onPointerLeave={scheduleClose}>
            <button
              type="button"
              aria-expanded={mega}
              aria-controls="mega-servicios"
              onClick={() => setMega((v) => !v)}
              className={cn(
                "inline-flex h-9 items-center gap-1 rounded-btn px-3 text-sm font-medium transition-colors",
                mega ? "bg-surface-2 text-white" : "text-fog hover:text-white"
              )}
            >
              Servicios
              <ChevronDown aria-hidden className={cn("h-4 w-4 transition-transform", mega && "rotate-180")} />
            </button>

            {/* Capa 1 centra (translate); capa 2 anima (v2-pop usa transform propio) */}
            <div className="absolute left-1/2 top-full w-[760px] -translate-x-1/2 pt-3">
              <div
                id="mega-servicios"
                aria-hidden={!mega}
                className={cn(
                  "v2-pop grid grid-cols-3 gap-3 rounded-card border border-white/8 bg-surface-1/95 p-3 shadow-2xl backdrop-blur-xl",
                  mega && "is-open"
                )}
              >
                {menu.servicios.map((s, i) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    onClick={closeAll}
                    tabIndex={mega ? 0 : -1}
                    className="group rounded-frame p-1.5 transition-colors hover:bg-surface-2"
                  >
                    <div className="v2-frame aspect-[4/3]">
                      <ProjectPreview proyecto={previews[i]} />
                    </div>
                    <p className="mt-3 px-1.5 text-sm font-semibold text-white">{s.titulo}</p>
                    <p className="mb-1 mt-1 px-1.5 text-xs leading-relaxed text-fog-dim">{s.texto}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {menu.links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="inline-flex h-9 items-center rounded-btn px-3 text-sm font-medium text-fog transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button href={AGENDAR} size="md" className="hidden h-10 sm:inline-flex">
            {menu.cta}
          </Button>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-btn text-white lg:hidden"
            aria-label={mobile ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobile}
            aria-controls="menu-movil"
            onClick={() => setMobile((v) => !v)}
          >
            {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Celular: panel a pantalla completa */}
      <div
        id="menu-movil"
        hidden={!mobile}
        className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto bg-ink px-4 pb-8 pt-4 lg:hidden"
      >
        <p className="px-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-fog-dim">Servicios</p>
        <ul className="mt-3 space-y-2">
          {menu.servicios.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                onClick={closeAll}
                className="block rounded-frame border border-white/8 bg-surface-1 px-4 py-4"
              >
                <span className="block font-display text-lg font-bold tracking-heading text-white">{s.titulo}</span>
                <span className="mt-1 block text-sm text-fog">{s.texto}</span>
              </Link>
            </li>
          ))}
        </ul>
        <ul className="mt-6 border-t border-white/8 pt-4">
          {menu.links.map((l) => (
            <li key={l.label}>
              <Link href={l.href} onClick={closeAll} className="flex h-12 items-center px-1 text-base text-white">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <Button href={AGENDAR} size="lg" className="mt-6 w-full">
          {menu.cta}
        </Button>
      </div>
    </header>
  );
}
