"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowUpRight, Globe, LayoutDashboard, LogOut, MessageCircle, SquareKanban, Users, UsersRound, Wallet } from "lucide-react";
import Logo from "@/components/panel/LogoPanel";
import type { Negocio } from "@/content/panel/tipos";
import { cn } from "@/lib/utils";
import { RUTA_ENTRAR } from "@/lib/panel/config";
import { authCliente } from "@/lib/panel/auth-cliente";

async function salir() {
  await authCliente.signOut();
  window.location.assign(RUTA_ENTRAR);
}

// Marco del panel (docs/panel-cliente/03-sistema-de-diseno.md §3):
// - Escritorio (≥1024 px): barra lateral fija de 248 px.
// - Celular: barra superior + pestañas abajo (zona del pulgar). 4 opciones, o 6 en la agencia.
// Fondo único ink, igual que el sitio v2.

export const navPanel = [
  { href: "/panel", label: "Resumen", icon: LayoutDashboard, agencia: false },
  { href: "/panel/clientes", label: "Clientes", icon: Users, agencia: false },
  { href: "/panel/proyectos", label: "Proyectos", icon: SquareKanban, agencia: false },
  // Solo Arata San (D-109): nunca se muestran a clientes de página web
  { href: "/panel/finanzas", label: "Finanzas", icon: Wallet, agencia: true },
  { href: "/panel/equipo", label: "Equipo", icon: UsersRound, agencia: true },
  { href: "/panel/sitio", label: "Mi sitio", icon: Globe, agencia: false },
] as const;

const activo = (path: string, href: string) => (href === "/panel" ? path === href : path.startsWith(href));

export default function PanelShell({
  negocio,
  conSesion = false,
  conFinanzas = false,
  sinFranja = ["/panel/finanzas", "/panel/equipo"],
  children,
}: {
  negocio: Negocio;
  conSesion?: boolean;
  conFinanzas?: boolean;
  /** Rutas con datos reales o aviso propio: no llevan la franja de ejemplo. */
  sinFranja?: string[];
  children: ReactNode;
}) {
  const path = usePathname() ?? "/panel";
  const nav = navPanel.filter((n) => conFinanzas || !n.agencia);
  const conFranja = !sinFranja.some((r) => path.startsWith(r));
  // Resumen, Clientes, Proyectos y Mi sitio todavía muestran datos de ejemplo (aunque haya sesión real):
  // llevan la franja. Finanzas y Equipo tienen su propio aviso (ejemplo o solo lectura).
  const soporte = "https://wa.me/573134011189?text=" + encodeURIComponent(`Hola Arata San, soy ${negocio.contacto} de ${negocio.nombre}. Necesito ayuda con mi panel.`);

  return (
    <div className="min-h-screen lg:pl-[248px]">
      {/* ── Barra lateral (escritorio) ── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-white/8 bg-[#06040F] lg:flex">
        <div className="flex h-16 items-center px-6">
          <Link href="/panel" aria-label="Inicio del panel">
            <Logo className="h-[18px] w-auto" />
          </Link>
        </div>

        <div className="mx-4 mb-4 rounded-frame border border-white/8 bg-surface-1 p-3">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-fog-dim">Tu negocio</p>
          <p className="mt-1 truncate font-display text-[0.95rem] font-bold text-white">{negocio.nombre}</p>
          <p className="truncate text-xs text-fog-dim">{negocio.plan}</p>
        </div>

        <nav aria-label="Panel" className="flex flex-1 flex-col gap-1 px-3">
          {nav.map(({ href, label, icon: Icon }) => {
            const on = activo(path, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "group flex h-11 items-center gap-3 rounded-btn px-3 text-sm font-medium transition-colors",
                  on ? "bg-surface-2 text-white" : "text-fog hover:bg-surface-1 hover:text-white"
                )}
              >
                <Icon aria-hidden className={cn("h-[18px] w-[18px]", on ? "text-lime" : "text-fog-dim group-hover:text-white")} />
                {label}
                {on && <span aria-hidden className="ml-auto h-1.5 w-1.5 rounded-full bg-lime" />}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 p-4">
          <a
            href={negocio.sitio}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 items-center justify-between rounded-btn px-3 text-sm text-fog transition-colors hover:bg-surface-1 hover:text-white"
          >
            Ver mi página
            <ArrowUpRight aria-hidden className="h-4 w-4" />
          </a>
          <a
            href={soporte}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 items-center justify-center gap-2 rounded-btn border border-white/10 bg-surface-2 text-sm font-semibold text-white transition-colors hover:border-brand/60"
          >
            <MessageCircle aria-hidden className="h-4 w-4 text-lime" />
            Escribirle a Arata San
          </a>
          {conSesion && (
            <button
              type="button"
              onClick={salir}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-btn text-xs text-fog-dim transition-colors hover:text-white"
            >
              <LogOut aria-hidden className="h-3.5 w-3.5" /> Salir
            </button>
          )}
        </div>
      </aside>

      {/* ── Barra superior (celular) ── */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/8 bg-ink/85 px-4 backdrop-blur-xl lg:hidden">
        <Link href="/panel" aria-label="Inicio del panel">
          <Logo className="h-4 w-auto" />
        </Link>
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-xs font-medium text-fog">{negocio.nombre}</span>
          {conSesion && (
            <button type="button" onClick={salir} aria-label="Salir del panel" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn text-fog-dim hover:text-white">
              <LogOut aria-hidden className="h-4 w-4" />
            </button>
          )}
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
          {nav.map(({ href, label, icon: Icon }) => {
            const on = activo(path, href);
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
