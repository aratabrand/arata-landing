"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AlarmClock, Bell, BellRing, X } from "lucide-react";
import { verNotificacionesRecientes } from "@/app/(panel)/panel/(app)/notificaciones/acciones";
import type { EventoHistorial } from "@/lib/panel/historial";
import type { TipoAlerta } from "@/lib/panel/alertas";
import Historial from "./Historial";
import { cn } from "@/lib/utils";

// Campana del panel (D-120): abre una ventana con las alertas de entrega y los últimos
// cambios. En escritorio cae debajo de la campana; en celular es una ventana flotante
// (no ocupa toda la pantalla). Lo completo (y activar avisos) está en /panel/notificaciones.

type Datos = { alertas: { id: string; nombre: string; tipo: TipoAlerta; texto: string }[]; eventos: EventoHistorial[]; visto: string | null; miUsuario: string };

export default function NotificacionesVentana({ sinLeer, demo }: { sinLeer: number; demo: boolean }) {
  const [abierta, setAbierta] = useState(false);
  const [datos, setDatos] = useState<Datos | null>(null);
  const [error, setError] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const path = usePathname();
  const contador = sinLeer > 99 ? "99+" : String(sinLeer);

  // Se cierra al cambiar de página
  useEffect(() => setAbierta(false), [path]);

  useEffect(() => {
    if (!abierta) return;
    let vivo = true;
    if (demo) {
      setDatos({ alertas: [], eventos: [], visto: null, miUsuario: "" });
    } else {
      verNotificacionesRecientes().then((r) => {
        if (!vivo) return;
        if (r.ok) {
          setDatos(r);
          router.refresh(); // el contador del menú baja (ya se marcaron como vistas)
        } else setError(r.error);
      });
    }
    const fuera = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setAbierta(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAbierta(false);
    document.addEventListener("mousedown", fuera);
    window.addEventListener("keydown", esc);
    return () => {
      vivo = false;
      document.removeEventListener("mousedown", fuera);
      window.removeEventListener("keydown", esc);
    };
  }, [abierta, demo, router]);

  const nuevos = datos ? new Set(datos.eventos.filter((e) => e.usuarioId !== datos.miUsuario && (!datos.visto || e.creado > datos.visto)).map((e) => e.id)) : undefined;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          setError("");
          setAbierta((v) => !v);
        }}
        aria-expanded={abierta}
        aria-haspopup="dialog"
        aria-label={sinLeer > 0 ? `Notificaciones: ${sinLeer} sin ver` : "Notificaciones"}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-xl transition-colors lg:h-11 lg:w-11",
          abierta ? "border-white/20 bg-white/[0.09] text-white" : "border-white/[0.09] bg-white/[0.035] text-fog hover:border-white/20 hover:text-white"
        )}
      >
        <Bell aria-hidden className="h-[18px] w-[18px]" />
        {sinLeer > 0 && (
          <span aria-hidden className="absolute -right-0.5 -top-0.5 min-w-[1.15rem] rounded-full bg-lime px-1 text-center text-[0.62rem] font-bold leading-[1.15rem] text-ink ring-2 ring-ink">
            {contador}
          </span>
        )}
      </button>

      {abierta && (
        <>
          {/* Celular: fondo atenuado (la ventana no ocupa toda la pantalla) */}
          <div aria-hidden className="fixed inset-0 top-14 z-40 bg-ink/50 backdrop-blur-[2px] lg:hidden" />
          <div
            role="dialog"
            aria-label="Notificaciones"
            className={cn(
              "pn-fade is-visible z-50 flex flex-col overflow-hidden rounded-card border border-white/10 bg-surface-3/95 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl",
              // celular: ventana flotante bajo la barra, con márgenes
              "fixed inset-x-3 top-[4.25rem] max-h-[min(70vh,560px)]",
              // escritorio: cae debajo de la campana
              "lg:absolute lg:inset-x-auto lg:right-0 lg:top-[calc(100%+0.75rem)] lg:w-[400px] lg:max-h-[min(72vh,620px)]"
            )}
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
              <p className="font-display text-base font-bold text-white">Notificaciones</p>
              <div className="flex items-center gap-1">
                <Link href="/panel/notificaciones" className="rounded-btn px-2.5 py-1.5 text-xs font-semibold text-brand-soft hover:text-white">
                  Ver todas
                </Link>
                <button type="button" onClick={() => setAbierta(false)} aria-label="Cerrar" className="flex h-8 w-8 items-center justify-center rounded-full text-fog-dim hover:text-white">
                  <X aria-hidden className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
              {error ? (
                <p className="text-sm text-[#FF9BB0]">{error}</p>
              ) : !datos ? (
                <p className="py-6 text-center text-sm text-fog-dim">Cargando…</p>
              ) : demo ? (
                <p className="py-6 text-center text-sm text-fog">En el panel de ejemplo no hay notificaciones.</p>
              ) : (
                <div className="space-y-4">
                  {datos.alertas.length > 0 && (
                    <section>
                      <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-fog-dim">Entregas</p>
                      <ul className="space-y-1.5">
                        {datos.alertas.map((a) => (
                          <li key={a.id}>
                            <Link
                              href={`/panel/proyectos/${a.id}`}
                              className={cn(
                                "flex items-start gap-2.5 rounded-frame border px-3 py-2.5 text-sm text-white hover:border-white/20",
                                a.tipo === "tarde" ? "border-[#FF9BB0]/35 bg-[#FF9BB0]/[0.06]" : a.tipo === "hoy" ? "border-lime/35 bg-lime/[0.05]" : "border-white/[0.08] bg-white/[0.03]"
                              )}
                            >
                              <AlarmClock aria-hidden className={cn("mt-0.5 h-4 w-4 shrink-0", a.tipo === "tarde" ? "text-[#FF9BB0]" : a.tipo === "hoy" ? "text-lime" : "text-brand-soft")} />
                              {a.texto}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                  <section>
                    <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-fog-dim">Últimos cambios</p>
                    <Historial eventos={datos.eventos} nuevos={nuevos} compacto vacio="Todavía no hay cambios." />
                  </section>
                </div>
              )}
            </div>

            <Link href="/panel/notificaciones" className="flex items-center justify-center gap-2 border-t border-white/[0.06] px-4 py-3 text-xs font-semibold text-fog hover:text-white">
              <BellRing aria-hidden className="h-3.5 w-3.5 text-lime" /> Avisos en este dispositivo e historial completo
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
