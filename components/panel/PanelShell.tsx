"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUpRight, LayoutDashboard, LogOut, MessageCircle, Settings, SquareKanban, Users, Wallet } from "lucide-react";
import Logo from "@/components/panel/LogoPanel";
import type { Negocio } from "@/content/panel/tipos";
import { cn } from "@/lib/utils";
import { RUTA_ENTRAR } from "@/lib/panel/config";
import { authCliente } from "@/lib/panel/auth-cliente";
import NotificacionesVentana from "./NotificacionesVentana";

async function salir() {
  await authCliente.signOut();
  window.location.assign(RUTA_ENTRAR);
}

// Marco del panel (docs/panel-cliente/03-sistema-de-diseno.md §3, D-120):
// - Escritorio (≥1024 px): barra arriba con el menú en una píldora de vidrio; la opción
//   elegida lleva un selector de vidrio suave que se desliza. Campana (ventana de
//   notificaciones) y menú de la cuenta a la derecha.
// - Celular: barra arriba (logo, campana, cuenta) + pestañas abajo (zona del pulgar).
// - "Configuración" agrupa Mi sitio y Equipo (tarjetas en /panel/configuracion).
// Fondo único ink, igual que el sitio v2.

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

  return (
    <div className="min-h-screen">
      {/* ── Barra superior (escritorio y celular) ── */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06]">
        {/* El vidrio va en una capa aparte: si la barra misma tuviera backdrop-filter, la ventana
            de notificaciones (position: fixed en celular) quedaría atrapada dentro de la barra */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-ink/70 backdrop-blur-xl" />
        <div className="relative mx-auto flex h-14 w-full max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:h-[76px] lg:px-10">
          <Link href="/panel" aria-label="Inicio del panel" className="shrink-0">
            <Logo className="h-4 w-auto lg:h-[18px]" />
          </Link>

          <MenuVidrio nav={nav} path={path} />

          <div className="flex shrink-0 items-center gap-2">
            {conNotif && <NotificacionesVentana sinLeer={sinLeer} demo={!conSesion} />}
            <MenuCuenta negocio={negocio} usuario={usuario} conSesion={conSesion} />
          </div>
        </div>
      </header>

      {conFranja && (
        <div className="border-b border-brand/30 bg-brand/10 px-4 py-2 text-center text-xs text-brand-soft">
          Estás viendo un <strong className="font-semibold text-white">panel de ejemplo</strong> con datos ficticios. Los cambios se guardan solo en este navegador.
        </div>
      )}

      <main className="pb-28 lg:pb-12">{children}</main>

      {/* ── Pestañas abajo (celular) ── */}
      <nav
        aria-label="Panel"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-white/8 bg-[#06040F]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      >
        <ul className="grid" style={{ gridTemplateColumns: `repeat(${nav.length}, minmax(0, 1fr))` }}>
          {nav.map(({ href, label, icon: Icon, rutas }) => {
            const on = activo(path, rutas);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={on ? "page" : undefined}
                  className={cn("flex h-16 flex-col items-center justify-center gap-1 px-0.5 text-[0.65rem] font-medium leading-none", on ? "text-white" : "text-fog-dim")}
                >
                  <Icon aria-hidden className={cn("h-5 w-5", on && "text-lime")} />
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

// ── Menú en píldora de vidrio con selector que se desliza (solo escritorio) ──
function MenuVidrio({ nav, path }: { nav: readonly (typeof navPanel)[number][]; path: string }) {
  const caja = useRef<HTMLUListElement | null>(null);
  const items = useRef<(HTMLAnchorElement | null)[]>([]);
  const [sel, setSel] = useState<{ x: number; w: number } | null>(null);
  const indice = nav.findIndex((n) => activo(path, n.rutas));

  // El selector se mide sobre la opción activa (y otra vez si cambia el tamaño de la ventana)
  useLayoutEffect(() => {
    const medir = () => {
      const el = items.current[indice];
      const base = caja.current;
      if (!el || !base) return setSel(null);
      // Posición relativa a la píldora (no a su casilla: offsetLeft daría 0)
      const r = el.getBoundingClientRect();
      const c = base.getBoundingClientRect();
      setSel({ x: r.left - c.left - base.clientLeft, w: r.width });
    };
    medir();
    window.addEventListener("resize", medir);
    document.fonts?.ready.then(medir).catch(() => {});
    return () => window.removeEventListener("resize", medir);
  }, [indice, nav.length]);

  return (
    <nav aria-label="Panel" className="hidden lg:block">
      <ul ref={caja} className="relative flex items-center gap-0.5 rounded-full border border-white/[0.09] bg-white/[0.035] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
        {/* Selector de vidrio suave */}
        {sel && (
          <span
            aria-hidden
            className="pointer-events-none absolute left-0 top-1 h-[calc(100%-0.5rem)] rounded-full border border-white/[0.12] bg-white/[0.09] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_6px_20px_-10px_rgba(125,83,255,0.55)] backdrop-blur-md transition-[transform,width] duration-300 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(${sel.x}px)`, width: sel.w }}
          />
        )}
        {nav.map(({ href, label, rutas }, i) => {
          const on = activo(path, rutas);
          return (
            <li key={href} className="relative">
              <Link
                ref={(el) => {
                  items.current[i] = el;
                }}
                href={href}
                aria-current={on ? "page" : undefined}
                className={cn("relative z-10 flex h-10 items-center rounded-full px-4 text-sm font-medium transition-colors", on ? "text-white" : "text-fog hover:text-white")}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ── Cuenta: nombre, ver la página, soporte (clientes) y salir ──
function MenuCuenta({ negocio, usuario, conSesion }: { negocio: Negocio; usuario?: { nombre: string; correo?: string } | null; conSesion: boolean }) {
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
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-haspopup="menu"
        aria-label={`Cuenta de ${nombre}`}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.09] bg-white/[0.035] font-display text-sm font-bold text-white backdrop-blur-xl transition-colors hover:border-white/20 lg:h-11 lg:w-11"
      >
        {inicial}
      </button>
      {abierto && (
        <div role="menu" className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 overflow-hidden rounded-frame border border-white/10 bg-surface-3/95 p-1.5 shadow-2xl backdrop-blur-xl">
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
              <MessageCircle aria-hidden className="h-4 w-4 text-lime" /> Escribirle a Arata San
            </a>
          )}
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
