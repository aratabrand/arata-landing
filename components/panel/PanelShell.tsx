"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUpRight, ChevronsUpDown, LayoutDashboard, LogOut, MessageCircle, Settings, SquareKanban, Users, Wallet } from "./iconos";
import Logo from "@/components/panel/LogoPanel";
import type { Negocio } from "@/content/panel/tipos";
import { cn } from "@/lib/utils";
import { RUTA_ENTRAR } from "@/lib/panel/config";
import { authCliente } from "@/lib/panel/auth-cliente";
import NotificacionesVentana from "./NotificacionesVentana";
import InterruptorTema from "./InterruptorTema";

async function salir() {
  await authCliente.signOut();
  window.location.assign(RUTA_ENTRAR);
}

// Marco del panel (docs/panel-cliente/03-sistema-de-diseno.md §3, D-136; reemplaza el menú en píldora de D-120):
// - Escritorio (≥1024 px): barra lateral fija a la izquierda (logo, módulos, Configuración y la cuenta abajo)
//   y el contenido en una zona más clara con las esquinas redondeadas. Arriba del contenido: negocio + campana.
//   La opción elegida lleva un selector que se desliza (transform) y una marca morada al borde.
// - Celular: barra arriba (logo, campana, cuenta) + pestañas abajo (zona del pulgar).
// - "Configuración" agrupa Ajustes del sitio, Equipo y Notificaciones (tarjetas en /panel/configuracion).
// Fondo ink en el marco; el contenido va en `canvas`. Morado para elegir, lima solo para destacar un dato.

export const navPanel = [
  { href: "/panel", label: "Resumen", icon: LayoutDashboard, agencia: false, rutas: ["/panel"] },
  { href: "/panel/clientes", label: "Clientes", icon: Users, agencia: false, rutas: ["/panel/clientes"] },
  { href: "/panel/proyectos", label: "Proyectos", icon: SquareKanban, agencia: false, rutas: ["/panel/proyectos"] },
  // Solo Arata San (D-109): nunca se muestra a clientes de página web
  { href: "/panel/finanzas", label: "Finanzas", icon: Wallet, agencia: true, rutas: ["/panel/finanzas"] },
  { href: "/panel/configuracion", label: "Configuración", icon: Settings, agencia: false, rutas: ["/panel/configuracion", "/panel/sitio", "/panel/equipo"] },
] as const;

const activo = (path: string, rutas: readonly string[]) => rutas.some((r) => (r === "/panel" ? path === r : path === r || path.startsWith(r + "/")));

export default function PanelShell({
  negocio,
  usuario,
  conSesion = false,
  conFinanzas = false,
  sinFranja = ["/panel/finanzas", "/panel/equipo"],
  sinLeer = 0,
  children,
}: {
  negocio: Negocio;
  /** Quien está en sesión (para el menú de la cuenta). */
  usuario?: { nombre: string; correo?: string } | null;
  conSesion?: boolean;
  conFinanzas?: boolean;
  /** Rutas con datos reales o aviso propio: no llevan la franja de ejemplo. */
  sinFranja?: string[];
  /** Cambios de otros sin ver + proyectos por vencer o tarde (D-119). */
  sinLeer?: number;
  children: ReactNode;
}) {
  const path = usePathname() ?? "/panel";
  const nav = navPanel.filter((n) => conFinanzas || !n.agencia);
  // Notificaciones existen solo para la agencia (D-119); en el ejemplo también se muestran
  const conNotif = conFinanzas;
  const conFranja = !sinFranja.some((r) => path.startsWith(r));

  const principal = nav.filter((n) => n.href !== "/panel/configuracion");
  const general = nav.filter((n) => n.href === "/panel/configuracion");

  return (
    <div className="min-h-screen">
      {/* ── Barra lateral (escritorio) ── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col px-4 pb-4 pt-7 lg:flex">
        <Link href="/panel" aria-label="Inicio del panel" className="px-3">
          <Logo className="h-[18px] w-auto" />
        </Link>
        <MenuLateral principal={principal} general={general} path={path} />
        <MenuCuenta negocio={negocio} usuario={usuario} conSesion={conSesion} variante="tarjeta" />
      </aside>

      <div className="lg:pl-[248px]">
        <div className="lg:p-3 lg:pl-0">
          <div className="min-h-screen bg-canvas lg:min-h-[calc(100vh-1.5rem)] lg:rounded-[28px] lg:border lg:border-white/[0.06] lg:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            {/* ── Barra superior del contenido ── */}
            <header className="sticky top-0 z-30 lg:rounded-t-[28px]">
              {/* El vidrio va en una capa aparte: si la barra misma tuviera backdrop-filter, la ventana
                  de notificaciones (position: fixed en celular) quedaría atrapada dentro de la barra */}
              <div aria-hidden className="absolute inset-0 -z-10 border-b border-white/[0.05] bg-canvas/80 backdrop-blur-xl lg:rounded-t-[28px]" />
              <div className="relative mx-auto flex h-14 w-full max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:h-16 lg:px-10">
                <Link href="/panel" aria-label="Inicio del panel" className="shrink-0 lg:hidden">
                  <Logo className="h-4 w-auto" />
                </Link>
                <p className="hidden items-center gap-2.5 text-sm text-fog lg:flex">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand" />
                  <span className="font-medium text-white">{negocio.nombre}</span>
                  <span className="text-fog-dim">· Panel</span>
                </p>
                <div className="flex shrink-0 items-center gap-2">
                  {/* D-152: modo claro / oscuro al lado de la campana */}
                  <InterruptorTema />
                  {conNotif && <NotificacionesVentana sinLeer={sinLeer} demo={!conSesion} />}
                  <div className="lg:hidden">
                    <MenuCuenta negocio={negocio} usuario={usuario} conSesion={conSesion} variante="circulo" />
                  </div>
                </div>
              </div>
            </header>

            {conFranja && (
              <div className="border-b border-white/10 bg-white/[0.04] px-4 py-2 text-center text-xs text-fog">
                Estás viendo un <strong className="font-semibold text-white">panel de ejemplo</strong> con datos ficticios. Los cambios se guardan solo en este navegador.
              </div>
            )}

            <main className="pb-28 lg:pb-12">{children}</main>
          </div>
        </div>
      </div>

      {/* ── Pestañas abajo (celular) ── */}
      <nav
        aria-label="Panel"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.07] bg-noche/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      >
        <ul className="grid" style={{ gridTemplateColumns: `repeat(${nav.length}, minmax(0, 1fr))` }}>
          {nav.map(({ href, label, icon: Icon, rutas }) => {
            const on = activo(path, rutas);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={on ? "page" : undefined}
                  className={cn("relative flex h-16 flex-col items-center justify-center gap-1 px-0.5 text-[0.65rem] font-medium leading-none", on ? "text-white" : "text-fog-dim")}
                >
                  {on && <span aria-hidden className="absolute top-0 h-0.5 w-8 rounded-full bg-brand" />}
                  <Icon aria-hidden className={cn("h-5 w-5", on && "text-fog")} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

// ── Menú lateral con selector que se desliza (solo escritorio) ──
type Opcion = (typeof navPanel)[number];

function MenuLateral({ principal, general, path }: { principal: readonly Opcion[]; general: readonly Opcion[]; path: string }) {
  const caja = useRef<HTMLElement | null>(null);
  const items = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [sel, setSel] = useState<{ y: number; h: number } | null>(null);
  const todas = [...principal, ...general];
  const elegida = todas.find((n) => activo(path, n.rutas))?.href;

  // El selector se mide sobre la opción activa (y otra vez si cambia el tamaño de la ventana)
  useLayoutEffect(() => {
    const medir = () => {
      const el = elegida ? items.current[elegida] : null;
      const base = caja.current;
      if (!el || !base) return setSel(null);
      const r = el.getBoundingClientRect();
      const c = base.getBoundingClientRect();
      setSel({ y: r.top - c.top + base.scrollTop, h: r.height });
    };
    medir();
    window.addEventListener("resize", medir);
    document.fonts?.ready.then(medir).catch(() => {});
    return () => window.removeEventListener("resize", medir);
  }, [elegida, todas.length]);

  const grupo = (titulo: string, lista: readonly Opcion[]) =>
    lista.length > 0 && (
      <div>
        <p className="px-3 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-fog-dim">{titulo}</p>
        <ul className="mt-2.5 space-y-1">
          {lista.map(({ href, label, icon: Icon, rutas }) => {
            const on = activo(path, rutas);
            return (
              <li key={href}>
                <Link
                  ref={(el) => {
                    items.current[href] = el;
                  }}
                  href={href}
                  aria-current={on ? "page" : undefined}
                  className={cn("group relative z-10 flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors", on ? "text-white" : "text-fog hover:bg-white/[0.035] hover:text-white")}
                >
                  <Icon aria-hidden className={cn("h-[1.1rem] w-[1.1rem] transition-colors", on ? "text-fog" : "text-fog-dim group-hover:text-fog")} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );

  return (
    <nav ref={caja} aria-label="Panel" className="relative mt-9 min-h-0 flex-1 space-y-7">
      {/* Selector: fondo suave + marca morada al borde. Solo se mueve con transform */}
      {sel && (
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 w-full rounded-xl border border-white/[0.07] bg-white/[0.055] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-transform duration-300 ease-out motion-reduce:transition-none"
          style={{ height: sel.h, transform: `translateY(${sel.y}px)` }}
        >
          <span className="absolute -left-4 bottom-2.5 top-2.5 w-[3px] rounded-r-full bg-brand" />
        </span>
      )}
      {grupo("Menú", principal)}
      {grupo("General", general)}
    </nav>
  );
}

// ── Cuenta: nombre, ver la página, soporte (clientes) y salir ──
function MenuCuenta({ negocio, usuario, conSesion, variante }: { negocio: Negocio; usuario?: { nombre: string; correo?: string } | null; conSesion: boolean; variante: "tarjeta" | "circulo" }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const path = usePathname();
  const nombre = usuario?.nombre || negocio.contacto || negocio.nombre;
  const inicial = nombre.trim().charAt(0).toUpperCase() || "A";
  const soporte = "https://wa.me/573134011189?text=" + encodeURIComponent(`Hola Arata San, soy ${negocio.contacto} de ${negocio.nombre}. Necesito ayuda con mi panel.`);

  useEffect(() => setAbierto(false), [path]);
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setAbierto(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("mousedown", fuera);
    window.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fuera);
      window.removeEventListener("keydown", esc);
    };
  }, [abierto]);

  return (
    <div ref={ref} className="relative">
      {variante === "circulo" ? (
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
          aria-haspopup="menu"
          aria-label={`Cuenta de ${nombre}`}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.09] bg-white/[0.035] font-display text-sm font-bold text-white transition-colors hover:border-white/20"
        >
          {inicial}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
          aria-haspopup="menu"
          aria-label={`Cuenta de ${nombre}`}
          className="flex w-full items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-2.5 text-left transition-colors hover:border-white/[0.12] hover:bg-white/[0.055]"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.08] font-display text-sm font-bold text-fog">{inicial}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-white">{nombre}</span>
            <span className="block truncate text-xs text-fog-dim">{usuario?.correo ?? negocio.nombre}</span>
          </span>
          <ChevronsUpDown aria-hidden className="h-4 w-4 shrink-0 text-fog-dim" />
        </button>
      )}
      {abierto && (
        <div role="menu" className={cn("absolute z-50 w-64 overflow-hidden rounded-2xl border border-white/10 bg-surface-3 p-1.5 shadow-2xl", variante === "tarjeta" ? "bottom-[calc(100%+0.5rem)] left-0" : "right-0 top-[calc(100%+0.5rem)]")}>
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-white">{nombre}</p>
            <p className="truncate text-xs text-fog-dim">{usuario?.correo ?? negocio.nombre}</p>
          </div>
          <div className="my-1 h-px bg-white/[0.06]" />
          <a role="menuitem" href={negocio.sitio} target="_blank" rel="noopener noreferrer" className="flex h-10 items-center justify-between rounded-btn px-3 text-sm text-fog hover:bg-white/[0.05] hover:text-white">
            Ver mi página <ArrowUpRight aria-hidden className="h-4 w-4" />
          </a>
          {/* En el panel de la propia agencia no tiene sentido escribirse a sí mismos */}
          {negocio.tipo !== "agencia" && (
            <a role="menuitem" href={soporte} target="_blank" rel="noopener noreferrer" className="flex h-10 items-center gap-2 rounded-btn px-3 text-sm text-fog hover:bg-white/[0.05] hover:text-white">
              <MessageCircle aria-hidden className="h-4 w-4 text-fog" /> Escribirle a Arata San
            </a>
          )}
          {/* El modo claro / oscuro está en la barra de arriba, al lado de la campana (D-152) */}
          {conSesion && (
            <button role="menuitem" type="button" onClick={salir} className="flex h-10 w-full items-center gap-2 rounded-btn px-3 text-sm text-fog hover:bg-white/[0.05] hover:text-white">
              <LogOut aria-hidden className="h-4 w-4" /> Salir
            </button>
          )}
        </div>
      )}
    </div>
  );
}
