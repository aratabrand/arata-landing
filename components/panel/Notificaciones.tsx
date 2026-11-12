"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlarmClock, Bell, BellOff, BellRing, CalendarClock, Smartphone } from "lucide-react";
import type { EventoHistorial } from "@/lib/panel/historial";
import type { TipoAlerta } from "@/lib/panel/alertas";
import { guardarSuscripcion, marcarNotificacionesVistas, probarAviso, quitarSuscripcion } from "@/app/(panel)/panel/(app)/notificaciones/acciones";
import { PanelHeader, PanelPage, Pill, Tarjeta } from "./ui";
import { BotonSecundario, MensajeError, useAccion } from "./finanzas/comun";
import { Segmentado } from "./Resumen";
import Historial from "./Historial";
import { cn } from "@/lib/utils";

// Notificaciones (D-119): alertas de vencimiento, todos los cambios del panel y
// avisos al celular/computador (Web Push) en este dispositivo.

type AlertaVista = { id: string; nombre: string; tipo: TipoAlerta; dias: number; texto: string };
type Filtro = "todos" | "importantes" | "otros";

export default function Notificaciones({
  alertas,
  eventos,
  visto,
  miUsuario,
  push,
  demo = false,
}: {
  alertas: AlertaVista[];
  eventos: EventoHistorial[];
  visto: string | null;
  miUsuario: string | null;
  push: { activo: boolean; clave: string };
  demo?: boolean;
}) {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  // Lo que llegó desde la última visita (de otras personas) se marca como nuevo
  const [nuevos] = useState(() => new Set(eventos.filter((e) => e.usuarioId !== miUsuario && (!visto || e.creado > visto)).map((e) => e.id)));
  useEffect(() => {
    if (!demo) marcarNotificacionesVistas();
  }, [demo]);

  const lista = useMemo(
    () => eventos.filter((e) => filtro === "todos" || (filtro === "importantes" ? e.importante : e.usuarioId !== miUsuario)),
    [eventos, filtro, miUsuario]
  );

  return (
    <PanelPage>
      <PanelHeader titulo="Notificaciones" bajada="Proyectos por vencer y todo lo que cambia en el panel: quién lo hizo y cuándo." />

      <AvisosDispositivo push={push} demo={demo} />

      <Tarjeta titulo="Alertas de entrega" bajada="2 días antes, el día de entrega y si va tarde" accion={<CalendarClock aria-hidden className="h-4 w-4 text-brand-soft" />}>
        {alertas.length === 0 ? (
          <p className="text-sm text-fog">Ningún proyecto está por vencer ni va tarde.</p>
        ) : (
          <ul className="space-y-2">
            {alertas.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/panel/proyectos/${a.id}`}
                  className={cn(
                    "flex items-center gap-3 rounded-frame border p-3 hover:border-white/20",
                    a.tipo === "tarde" ? "border-[#FF9BB0]/40 bg-[#FF9BB0]/5" : a.tipo === "hoy" ? "border-lime/40 bg-lime/5" : "border-white/8 bg-surface-2/50"
                  )}
                >
                  <AlarmClock aria-hidden className={cn("h-4 w-4 shrink-0", a.tipo === "tarde" ? "text-[#FF9BB0]" : a.tipo === "hoy" ? "text-lime" : "text-brand-soft")} />
                  <span className="min-w-0 flex-1 text-sm text-white">{a.texto}</span>
                  <Pill tono={a.tipo === "tarde" ? "alerta" : a.tipo === "hoy" ? "lima" : "morado"}>{a.tipo === "tarde" ? "Va tarde" : a.tipo === "hoy" ? "Hoy" : "Por vencer"}</Pill>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>

      <Tarjeta
        titulo="Cambios"
        bajada={nuevos.size ? `${nuevos.size} ${nuevos.size === 1 ? "nuevo" : "nuevos"} desde tu última visita` : "Todo lo que se hace en el panel"}
        accion={
          <Segmentado
            etiqueta="Filtrar cambios"
            opciones={[
              { valor: "todos" as const, label: "Todos" },
              { valor: "importantes" as const, label: "Importantes" },
              { valor: "otros" as const, label: "De otros" },
            ]}
            valor={filtro}
            onChange={setFiltro}
          />
        }
      >
        {demo ? (
          <p className="text-sm text-fog">En el panel de ejemplo no hay historial. Con el panel conectado verás cada cambio con quién lo hizo y cuándo.</p>
        ) : (
          <Historial eventos={lista} nuevos={nuevos} vacio={filtro === "todos" ? "Todavía no hay cambios registrados." : "No hay cambios con este filtro."} />
        )}
      </Tarjeta>
    </PanelPage>
  );
}

// ── Avisos en este dispositivo ──────────────────────────────────────
type Estado = "cargando" | "no-soportado" | "iphone-instalar" | "bloqueado" | "apagado" | "encendido";

function aBytes(base64: string) {
  const b = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

function nombreDispositivo() {
  const ua = navigator.userAgent;
  const so = /iPhone|iPad/.test(ua) ? "iPhone" : /Android/.test(ua) ? "Android" : /Mac/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : "Computador";
  const nav = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Navegador";
  return `${so} · ${nav}`;
}

function AvisosDispositivo({ push, demo }: { push: { activo: boolean; clave: string }; demo: boolean }) {
  const [estado, setEstado] = useState<Estado>("cargando");
  const [suscripcion, setSuscripcion] = useState<PushSubscription | null>(null);
  const acc = useAccion();
  const [probado, setProbado] = useState(false);

  useEffect(() => {
    (async () => {
      const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
      const instalada = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        setEstado(ios && !instalada ? "iphone-instalar" : "no-soportado");
        return;
      }
      if (Notification.permission === "denied") return setEstado("bloqueado");
      const reg = await navigator.serviceWorker.register("/panel/sw.js", { scope: "/panel/" });
      const s = await reg.pushManager.getSubscription();
      setSuscripcion(s);
      setEstado(s ? "encendido" : "apagado");
    })().catch(() => setEstado("no-soportado"));
  }, []);

  const activar = () =>
    acc.correr(async () => {
      const permiso = await Notification.requestPermission();
      if (permiso !== "granted") {
        setEstado(permiso === "denied" ? "bloqueado" : "apagado");
        return { ok: false, error: "No diste permiso para los avisos." };
      }
      const reg = await navigator.serviceWorker.ready;
      const s = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: aBytes(push.clave) }));
      const j = s.toJSON();
      const r = await guardarSuscripcion({ endpoint: s.endpoint, p256dh: j.keys?.p256dh ?? "", auth: j.keys?.auth ?? "", dispositivo: nombreDispositivo() });
      if (r.ok) {
        setSuscripcion(s);
        setEstado("encendido");
      } else await s.unsubscribe();
      return r;
    });

  const apagar = () =>
    acc.correr(async () => {
      if (suscripcion) {
        await quitarSuscripcion(suscripcion.endpoint);
        await suscripcion.unsubscribe();
      }
      setSuscripcion(null);
      setEstado("apagado");
      return { ok: true };
    });

  const titulo = estado === "encendido" ? "Avisos activados en este dispositivo" : "Avisos al celular y al computador";
  return (
    <Tarjeta titulo={titulo} bajada="Vencimientos (8 a. m.) y cambios clave: cierres, valores, gastos, días y borrados" accion={estado === "encendido" ? <BellRing aria-hidden className="h-4 w-4 text-lime" /> : <Bell aria-hidden className="h-4 w-4 text-brand-soft" />}>
      {demo ? (
        <p className="text-sm text-fog">Disponible con el panel conectado.</p>
      ) : !push.activo ? (
        <p className="text-sm text-fog">Falta activar los avisos en el servidor (claves VAPID en Vercel). Mientras tanto, todo se ve aquí.</p>
      ) : estado === "cargando" ? (
        <p className="text-sm text-fog-dim">Revisando este dispositivo…</p>
      ) : estado === "iphone-instalar" ? (
        <div className="flex items-start gap-3 text-sm text-fog">
          <Smartphone aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-brand-soft" />
          <p>
            En iPhone los avisos solo llegan si el panel está instalado: toca <strong className="text-white">Compartir</strong> → <strong className="text-white">Agregar a inicio</strong>, abre el panel desde ese ícono y vuelve aquí a activarlos.
          </p>
        </div>
      ) : estado === "no-soportado" ? (
        <p className="text-sm text-fog">Este navegador no recibe avisos. Usa Chrome, Edge, Firefox o Safari actualizados.</p>
      ) : estado === "bloqueado" ? (
        <div className="flex items-start gap-3 text-sm text-fog">
          <BellOff aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#FF9BB0]" />
          <p>Los avisos están bloqueados para este sitio. Actívalos en la configuración del navegador (ícono del candado junto a la dirección → Notificaciones → Permitir) y recarga.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {estado === "apagado" ? (
              <button type="button" onClick={activar} disabled={acc.pendiente} className="v2-shine inline-flex h-11 items-center gap-2 rounded-btn bg-lime px-5 text-sm font-semibold text-ink hover:bg-[#C6FF33] disabled:opacity-50">
                <BellRing aria-hidden className="h-4 w-4" /> {acc.pendiente ? "Activando…" : "Activar avisos aquí"}
              </button>
            ) : (
              <>
                <BotonSecundario type="button" disabled={acc.pendiente} onClick={() => acc.correr(async () => { const r = await probarAviso(); if (r.ok) setProbado(true); return r; })} className="h-11">
                  <Bell aria-hidden className="h-4 w-4" /> Mandar aviso de prueba
                </BotonSecundario>
                <BotonSecundario type="button" disabled={acc.pendiente} onClick={apagar} className="h-11">
                  <BellOff aria-hidden className="h-4 w-4" /> Apagar en este dispositivo
                </BotonSecundario>
              </>
            )}
          </div>
          {probado && <p className="text-sm text-lime">Listo: debe llegarte en unos segundos.</p>}
          <p className="text-xs text-fog-dim">Se activa por dispositivo: hazlo en tu celular y en tu computador. No te llegan avisos de lo que haces tú.</p>
          <MensajeError error={acc.error} />
        </div>
      )}
    </Tarjeta>
  );
}
