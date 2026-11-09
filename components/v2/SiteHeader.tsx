"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, ChevronRight } from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "./Button";
import ProjectPreview from "./ProjectPreview";
import { AGENDAR, INICIO, menu } from "@/content/inicio";
import { proyectos } from "@/content/proyectos";
import { cn } from "@/lib/utils";

// Header v2 (ref. 21st.dev captura 05):
// barra completa, transparente arriba y con vidrio oscuro al bajar;
// "Servicios ▾" abre un mega menú con tarjetas de vista previa;
// en celular, panel a pantalla completa (D-070).
//
// OJO: el panel móvil va FUERA del <header>. El header usa backdrop-filter, y un
// elemento con backdrop-filter se vuelve el contenedor de sus hijos `fixed`:
// el panel quedaba recortado al alto del header y se veía la página por debajo.

// Vista previa de cada opción: una captura real del portafolio
const previews = [
  proyectos.find((p) => p.slug === "boost-your-menu")!,
  proyectos.find((p) => p.slug === "caravana")!,
  proyectos.find((p) => p.slug === "danrodedm")!,
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);
  // Las vistas previas del mega menú se crean recién la primera vez que se abre (menos DOM al cargar)
  const [megaVisto, setMegaVisto] = useState(false);
  const [mobile, setMobile] = useState(false);
  // Las capturas del panel móvil se piden la primera vez que se abre
  const [mobileVisto, setMobileVisto] = useState(false);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
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

  // Panel móvil abierto: bloquea el scroll del fondo (sin salto por la barra de
  // scroll), lleva el foco al panel y lo devuelve al botón al cerrar.
  const abierto = useRef(false);
  useEffect(() => {
    const html = document.documentElement;
    if (mobile) {
      const gap = window.innerWidth - html.clientWidth;
      html.style.overflow = "hidden";
      if (gap > 0) html.style.paddingRight = `${gap}px`;
      abierto.current = true;
      const t = window.setTimeout(() => panelRef.current?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true }), 60);
      return () => window.clearTimeout(t);
    }
    html.style.overflow = "";
    html.style.paddingRight = "";
    if (abierto.current) toggleRef.current?.focus({ preventScroll: true });
    abierto.current = false;
  }, [mobile]);

  // Si la pantalla crece a escritorio con el panel abierto, se cierra
  useEffect(() => {
    if (!mobile) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && setMobile(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mobile]);

  // Abre con una pequeña demora (intención de hover): si el cursor solo pasa por
  // encima rumbo a otra parte, no se dispara.
  const openTimer = useRef<number | null>(null);
  const openMega = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    if (openTimer.current) window.clearTimeout(openTimer.current);
    openTimer.current = window.setTimeout(() => {
      setMegaVisto(true);
      setMega(true);
    }, 120);
  };
  const scheduleClose = () => {
    if (openTimer.current) window.clearTimeout(openTimer.current);
    closeTimer.current = window.setTimeout(() => setMega(false), 160);
  };

  return (
    <>
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        mobile
          ? "border-b border-white/6 bg-ink"
          : scrolled
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
              onClick={() => {
                setMegaVisto(true);
                setMega((v) => !v);
              }}
              className={cn(
                "inline-flex h-9 items-center gap-1 rounded-btn px-3 text-sm font-medium transition-colors",
                mega ? "bg-surface-2 text-white" : "text-fog hover:text-white"
              )}
            >
              Servicios
              <ChevronDown aria-hidden className={cn("h-4 w-4 transition-transform", mega && "rotate-180")} />
            </button>

            {/* Capa 1 centra (translate); capa 2 anima (v2-pop usa transform propio) */}
            <div
              className={cn(
                "absolute left-1/2 top-full w-[760px] -translate-x-1/2 pt-3",
                // Cerrado no recibe el mouse: antes esta zona invisible abría el menú
                // al pasar el cursor por debajo de "Servicios".
                mega ? "pointer-events-auto" : "pointer-events-none"
              )}
            >
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
                      {megaVisto && <ProjectPreview proyecto={previews[i]} sizes="240px" />}
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
            ref={toggleRef}
            type="button"
            className={cn(
              "v2-burger -mr-2 inline-flex h-11 w-11 items-center justify-center rounded-btn text-white transition-colors active:bg-surface-2 lg:hidden",
              mobile && "is-open"
            )}
            aria-label={mobile ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobile}
            aria-controls="menu-movil"
            onClick={() => {
              if (mobileVisto) return setMobile((v) => !v);
              // Primera vez: se monta el panel y se abre al siguiente cuadro para que la animación corra
              setMobileVisto(true);
              requestAnimationFrame(() => requestAnimationFrame(() => setMobile(true)));
            }}
          >
            {/* Dos líneas que se cruzan en X al abrir */}
            <span aria-hidden className="relative block h-3.5 w-5">
              <span className="v2-burger-l absolute left-0 top-1/2 h-[2px] w-5 rounded-full bg-current" />
              <span className="v2-burger-l absolute left-0 top-1/2 h-[2px] w-5 rounded-full bg-current" />
            </span>
          </button>
        </div>
      </div>
    </header>

      {/* Celular: panel a pantalla completa, debajo del header (z-50) y encima de la barra fija (z-40).
          Se crea al primer toque: al cargar no suma DOM ni precarga sus enlaces. */}
      {mobileVisto && (
      <div
        id="menu-movil"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menú"
        // React 18 no tipa `inert`: cerrado, el panel no recibe foco ni toques
        {...((mobile ? {} : { inert: "true" }) as Record<string, string>)}
        className={cn("v2-mnav fixed inset-0 z-[45] flex flex-col bg-ink lg:hidden", mobile && "is-open")}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(125,83,255,0.22),transparent_70%)]"
        />
        <nav aria-label="Menú del celular" className="relative flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-[4.75rem]">
          <p className="v2-mnav-item px-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-fog-dim" style={{ ["--d" as string]: 0 }}>
            Servicios
          </p>
          <ul className="mt-3 space-y-2.5">
            {menu.servicios.slice(0, 2).map((s, i) => (
              <li key={s.href} className="v2-mnav-item" style={{ ["--d" as string]: i + 1 }}>
                <Link
                  href={s.href}
                  onClick={closeAll}
                  className="group flex items-center gap-3 rounded-card border border-white/8 bg-surface-1 p-2.5 pr-4 transition-[background-color,transform] active:scale-[0.98] active:bg-surface-2"
                >
                  <span className="v2-frame relative aspect-[4/3] w-[4.5rem] shrink-0 !rounded-[12px] min-[400px]:w-24">
                    <ProjectPreview proyecto={previews[i]} sizes="96px" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-base font-bold leading-tight tracking-heading text-white min-[400px]:text-lg">{s.titulo}</span>
                    <span className="mt-1 block text-[0.8rem] leading-snug text-fog min-[400px]:text-sm">{s.texto}</span>
                  </span>
                  <ChevronRight aria-hidden className="h-5 w-5 shrink-0 text-fog-dim transition-transform group-active:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>

          <ul className="mt-5">
            {menu.links.map((l, i) => (
              <li key={l.label} className="v2-mnav-item border-b border-white/8 first:border-t" style={{ ["--d" as string]: i + 3 }}>
                <Link
                  href={l.href}
                  onClick={closeAll}
                  className="flex h-14 items-center justify-between px-1 font-display text-xl min-[400px]:h-16 min-[400px]:text-2xl font-bold tracking-heading text-white transition-colors active:text-lime"
                >
                  {l.label}
                  <ArrowUpRight aria-hidden className="h-5 w-5 text-fog-dim" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Acción principal siempre a mano, en la zona del pulgar */}
        <div
          className="v2-mnav-item relative border-t border-white/8 bg-ink px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4"
          style={{ ["--d" as string]: 5 }}
        >
          <Button href={AGENDAR} size="lg" arrow className="w-full" onClick={closeAll}>
            {menu.cta}
          </Button>
          <p className="mt-2.5 text-center text-xs text-fog-dim">30 minutos, sin costo.</p>
        </div>
      </div>
      )}
    </>
  );
}
