"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "@/components/v2/iconos";
import { cookies as t } from "@/content/cookies";
import {
  CLARITY_ACTIVO,
  EVENTO_ABRIR,
  guardarConsentimiento,
  leerConsentimiento,
  necesitaPreguntar,
} from "@/lib/consentimiento";
import { cn } from "@/lib/utils";

// Aviso de cookies (D-130). Aparece si la persona no ha elegido (o su elección venció a los 12 meses).
// Con Microsoft Clarity encendido (D-132) hay un segundo permiso, aparte del de Google Analytics, y quien
// eligió antes de que existiera Clarity vuelve a ver el aviso.
// - Aceptar, Rechazar y Preferencias con el mismo peso visual que importa: rechazar es un solo toque.
// - Preferencias: <dialog> nativo (atrapa el foco, cierra con Escape, devuelve el foco).
// - No tapa la página: tarjeta fija abajo; no bloquea el scroll ni el uso del sitio.
// - Se reabre desde el footer ("Preferencias de cookies") con el evento EVENTO_ABRIR.

export default function CookieBanner() {
  // El panel no mide visitas (D-116): en panel.aratasan.com el aviso ni se monta (PANEL_SOLO), y aquí
  // tampoco sale cuando el panel corre junto al sitio (desarrollo), donde tomaba los colores del panel.
  const ruta = usePathname();
  if (ruta?.startsWith("/panel")) return null;
  return <Aviso />;
}

function Aviso() {
  const [visible, setVisible] = useState(false);
  const [medicion, setMedicion] = useState(false);
  const [navegacion, setNavegacion] = useState(false);
  const [retraso, setRetraso] = useState(1.9);
  const dialogo = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const c = leerConsentimiento();
    setMedicion(c?.medicion ?? false);
    setNavegacion(c?.navegacion ?? false);
    // Si ya vio la animación de entrada en esta visita, el aviso sale enseguida
    try {
      if (window.sessionStorage.getItem("as-cargado")) setRetraso(0.4);
    } catch {}
    if (necesitaPreguntar(c)) setVisible(true);

    const abrir = () => {
      const c = leerConsentimiento();
      setMedicion(c?.medicion ?? false);
      setNavegacion(c?.navegacion ?? false);
      dialogo.current?.showModal();
    };
    window.addEventListener(EVENTO_ABRIR, abrir);
    return () => window.removeEventListener(EVENTO_ABRIR, abrir);
  }, []);

  const decidir = useCallback((medicionElegida: boolean, navegacionElegida: boolean) => {
    guardarConsentimiento(medicionElegida, navegacionElegida);
    setMedicion(medicionElegida);
    setNavegacion(navegacionElegida);
    setVisible(false);
    dialogo.current?.close();
  }, []);

  return (
    <>
      {visible && (
        <section
          aria-labelledby="cookies-titulo"
          className="as-cookies fixed inset-x-3 bottom-3 z-[60] sm:inset-x-auto sm:bottom-5 sm:left-5 sm:max-w-[25rem]"
          style={{ animationDelay: `${retraso}s` }}
        >
          {/* Fondo sólido: al 95 % con desenfoque se veían los botones de la portada a través del aviso */}
          <div className="rounded-[22px] border border-white/10 bg-surface-1 p-5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]">
            <div>
              <div>
                <h2 id="cookies-titulo" className="font-display text-base font-bold text-white">
                  {t.titulo}
                </h2>
                <p className="mt-1.5 text-[0.82rem] leading-relaxed text-fog">{CLARITY_ACTIVO ? t.textoConClarity : t.texto}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => decidir(true, true)} className="v2-primario h-11 rounded-full text-sm font-semibold">
                {t.aceptar}
              </button>
              <button type="button" onClick={() => decidir(false, false)} className="h-11 rounded-full border border-white/15 bg-surface-2 text-sm font-semibold text-white transition-colors hover:border-white/30">
                {t.rechazar}
              </button>
              <div className="col-span-2 flex items-center justify-center gap-4 text-sm">
                <button
                  type="button"
                  onClick={() => dialogo.current?.showModal()}
                  className="h-10 font-medium text-white underline decoration-white/30 underline-offset-4 transition-colors hover:text-white"
                >
                  {t.preferencias}
                </button>
                <span aria-hidden className="text-white/20">·</span>
                <Link href="/privacidad#cookies" className="inline-flex h-10 items-center text-fog underline decoration-white/20 underline-offset-4 transition-colors hover:text-white">
                  {t.enlace}
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <dialog
        ref={dialogo}
        aria-labelledby="cookies-pref-titulo"
        className="as-cookies-dialogo m-auto w-[min(32rem,calc(100vw-1.5rem))] rounded-[24px] border border-white/10 bg-surface-1 p-0 text-white backdrop:bg-noche/70"
        onClick={(e) => {
          // Tocar fuera de la tarjeta (el fondo) cierra sin cambiar nada
          if (e.target === e.currentTarget) dialogo.current?.close();
        }}
      >
        <div className="max-h-[85dvh] overflow-y-auto p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <h2 id="cookies-pref-titulo" className="font-display text-xl font-bold">
              {t.prefTitulo}
            </h2>
            <button
              type="button"
              onClick={() => dialogo.current?.close()}
              aria-label={t.cerrar}
              className="-mr-2 -mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full text-fog transition-colors hover:bg-white/5 hover:text-white"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-fog">{t.prefIntro}</p>

          <ul className="mt-6 space-y-3">
            <li className="rounded-frame border border-white/8 bg-noche/50 p-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-semibold">{t.necesarias.titulo}</h3>
                <span className="shrink-0 rounded-full bg-white/8 px-2.5 py-1 text-xs font-semibold text-fog">{t.necesarias.estado}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-fog">{t.necesarias.texto}</p>
            </li>
            <Opcion id="cookies-medicion" titulo={t.medicion.titulo} texto={t.medicion.texto} activo={medicion} onCambiar={() => setMedicion((m) => !m)} />
            {CLARITY_ACTIVO && (
              <Opcion id="cookies-navegacion" titulo={t.navegacion.titulo} texto={t.navegacion.texto} activo={navegacion} onCambiar={() => setNavegacion((n) => !n)} />
            )}
          </ul>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => decidir(medicion, navegacion)} className="h-11 rounded-full border border-white/15 bg-surface-2 text-sm font-semibold transition-colors hover:border-white/30">
              {t.guardar}
            </button>
            <button type="button" onClick={() => decidir(true, true)} className="v2-primario h-11 rounded-full text-sm font-semibold">
              {t.aceptarTodas}
            </button>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-fog-dim">
            {CLARITY_ACTIVO ? t.pieConClarity : t.pie}{" "}
            <Link href="/privacidad#cookies" className="underline underline-offset-4 hover:text-white">
              {t.enlace}
            </Link>
            .
          </p>
        </div>
      </dialog>
    </>
  );
}

/** Botón del footer para volver a abrir las preferencias. */
export function AbrirPreferenciasCookies({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(EVENTO_ABRIR))}>
      {children}
    </button>
  );
}

/** Un permiso con su interruptor (apagado por defecto; la ley exige que no vengan marcados). */
function Opcion({ id, titulo, texto, activo, onCambiar }: { id: string; titulo: string; texto: string; activo: boolean; onCambiar: () => void }) {
  return (
    <li className="rounded-frame border border-white/8 bg-noche/50 p-4">
      <div className="flex items-center justify-between gap-4">
        <h3 id={id} className="font-semibold">
          {titulo}
        </h3>
        <button
          type="button"
          role="switch"
          aria-checked={activo}
          aria-labelledby={id}
          onClick={onCambiar}
          className={cn("relative h-7 w-12 shrink-0 rounded-full border transition-colors", activo ? "border-brand bg-brand" : "border-white/20 bg-surface-3")}
        >
          <span
            aria-hidden
            className={cn("absolute left-0.5 top-0.5 h-5 w-5 rounded-full transition-transform duration-200", activo ? "translate-x-5 bg-white" : "translate-x-0 bg-white")}
          />
        </button>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-fog">{texto}</p>
    </li>
  );
}
