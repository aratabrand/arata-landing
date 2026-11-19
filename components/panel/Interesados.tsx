"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Check, ExternalLink, Mail, MessageCircle, RotateCcw, Trash2, Video, X } from "lucide-react";
import { borrarInteresado, descartarInteresado, reabrirInteresado } from "@/app/(panel)/panel/(app)/clientes/acciones";
import { CAL_POR_ACEPTAR, cuandoTexto, etiquetaTipo, momentoDe, relativo, type Interesado, type Momento } from "@/lib/panel/clientes/interesados";
import { Pill } from "./ui";
import { BotonSecundario, MensajeError, useAccion } from "./finanzas/comun";
import { cn } from "@/lib/utils";

// Interesados (D-133): personas que agendaron reunión desde aratasan.com/agendar (Cal.com).
// Cada una llega sola (webhook de Cal.com) con lo que respondió. Desde aquí se entra a la llamada y,
// si salió bien, se confirma y pasa a ser cliente (Sergio y Andrés). Todos los miembros los ven.

const verWhatsapp = (d: string) => (d.startsWith("57") && d.length === 12 ? `+57 ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8)}` : `+${d}`);
const inicial = (n: string) => n.trim().slice(0, 1).toUpperCase() || "?";

export default function Interesados({
  interesados,
  ahora,
  nombreCliente,
  puedeEditar,
  puedeBorrar,
  onConfirmar,
  onVerCliente,
}: {
  interesados: Interesado[];
  /** Hora del servidor (ISO): evita que la primera pintura difiera de la del navegador. */
  ahora: string;
  /** Nombre visible de un cliente por su id (para "Ya es cliente: …"). */
  nombreCliente: (id: string) => string | null;
  puedeEditar: boolean;
  puedeBorrar: boolean;
  onConfirmar: (i: Interesado) => void;
  onVerCliente: (id: string) => void;
}) {
  const router = useRouter();
  const [ahoraMs, setAhoraMs] = useState(() => Date.parse(ahora));

  // El reloj avanza cada 30 s (para "en 10 min" y el botón "Entrar ahora") y, mientras esta pestaña
  // está abierta, se vuelve a pedir la lista cada 45 s y al volver a la ventana: así aparece sola
  // una reserva nueva sin recargar.
  useEffect(() => {
    const reloj = window.setInterval(() => setAhoraMs(Date.now()), 30_000);
    const refrescar = window.setInterval(() => document.visibilityState === "visible" && router.refresh(), 45_000);
    const alVolver = () => {
      if (document.visibilityState === "visible") {
        setAhoraMs(Date.now());
        router.refresh();
      }
    };
    setAhoraMs(Date.now());
    document.addEventListener("visibilitychange", alVolver);
    return () => {
      window.clearInterval(reloj);
      window.clearInterval(refrescar);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, [router]);

  const { porAceptar, porConfirmar, proximas, cerradas } = useMemo(() => {
    const dif = (a: Interesado, b: Interesado) => Date.parse(a.inicio) - Date.parse(b.inicio);
    const pend = interesados.filter((i) => i.estado === "agendada" && !i.porAceptar);
    return {
      // Pidieron la reunión y falta aceptarla en Cal.com (confirmación manual, D-134)
      porAceptar: interesados.filter((i) => i.estado === "agendada" && i.porAceptar).sort(dif),
      // Reunión que ya pasó y nadie la cerró: lo que hay que resolver primero (la más reciente arriba)
      porConfirmar: pend.filter((i) => momentoDe(i, ahoraMs) === "pasada").sort((a, b) => dif(b, a)),
      // Las que vienen, la más cercana primero
      proximas: pend.filter((i) => momentoDe(i, ahoraMs) !== "pasada").sort(dif),
      cerradas: interesados.filter((i) => i.estado !== "agendada").sort((a, b) => Date.parse(b.cerradoEn ?? b.inicio) - Date.parse(a.cerradoEn ?? a.inicio)),
    };
  }, [interesados, ahoraMs]);

  const ultima = interesados.reduce<string | null>((m, i) => (!m || i.creado > m ? i.creado : m), null);

  if (interesados.length === 0) {
    return (
      <div className="rounded-card border border-white/[0.08] bg-white/[0.03] px-5 py-12 text-center">
        <CalendarClock aria-hidden className="mx-auto h-8 w-8 text-brand-soft" />
        <p className="mt-3 font-display text-lg font-bold text-white">Todavía nadie ha agendado</p>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-fog">
          Cuando alguien agende una reunión desde aratasan.com/agendar, aparece aquí con lo que respondió, y te llega un aviso al celular.
        </p>
        <p className="mx-auto mt-3 max-w-md text-xs text-fog-dim">Si ya agendaste una prueba y no aparece, revisa que el webhook de Cal.com esté conectado (guía en docs/panel-cliente, sección «Reuniones desde Cal.com»).</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {porAceptar.length > 0 && (
        <Grupo titulo="Por aceptar en Cal.com" detalle="Pidieron reunión. Si es real, acéptala en Cal.com; si es spam, recházala allá y aquí se cierra sola." cantidad={porAceptar.length} alerta>
          {porAceptar.map((i) => (
            <Fila key={i.id} i={i} ahoraMs={ahoraMs} nombreCliente={nombreCliente} puedeEditar={puedeEditar} puedeBorrar={puedeBorrar} onConfirmar={onConfirmar} onVerCliente={onVerCliente} />
          ))}
        </Grupo>
      )}

      {porConfirmar.length > 0 && (
        <Grupo titulo="Por confirmar" detalle="La reunión ya pasó: ¿cómo salió?" cantidad={porConfirmar.length} alerta>
          {porConfirmar.map((i) => (
            <Fila key={i.id} i={i} ahoraMs={ahoraMs} nombreCliente={nombreCliente} puedeEditar={puedeEditar} puedeBorrar={puedeBorrar} onConfirmar={onConfirmar} onVerCliente={onVerCliente} />
          ))}
        </Grupo>
      )}

      <Grupo titulo="Próximas reuniones" cantidad={proximas.length}>
        {proximas.length === 0 ? (
          <li className="rounded-frame border border-white/[0.06] px-4 py-5 text-sm text-fog">No hay reuniones próximas.</li>
        ) : (
          proximas.map((i) => <Fila key={i.id} i={i} ahoraMs={ahoraMs} nombreCliente={nombreCliente} puedeEditar={puedeEditar} puedeBorrar={puedeBorrar} onConfirmar={onConfirmar} onVerCliente={onVerCliente} />)
        )}
      </Grupo>

      {cerradas.length > 0 && (
        <details className="group rounded-card border border-white/[0.06] bg-white/[0.02] px-4 py-3 sm:px-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-fog hover:text-white">
            <span>
              Cerradas <span className="ml-1 font-normal text-fog-dim">({cerradas.length})</span>
            </span>
            <span aria-hidden className="text-xs text-fog-dim group-open:hidden">Mostrar</span>
            <span aria-hidden className="hidden text-xs text-fog-dim group-open:inline">Ocultar</span>
          </summary>
          <ul className="mt-3 space-y-3">
            {cerradas.map((i) => (
              <Fila key={i.id} i={i} ahoraMs={ahoraMs} nombreCliente={nombreCliente} puedeEditar={puedeEditar} puedeBorrar={puedeBorrar} onConfirmar={onConfirmar} onVerCliente={onVerCliente} />
            ))}
          </ul>
        </details>
      )}

      {ultima && <p className="text-center text-xs text-fog-dim">Última reserva recibida de Cal.com: {cuandoTexto(ultima)} (hora de Bogotá).</p>}
    </div>
  );
}

function Grupo({ titulo, detalle, cantidad, alerta, children }: { titulo: string; detalle?: string; cantidad: number; alerta?: boolean; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className={cn("font-display text-lg font-bold tracking-heading", alerta ? "text-[#FF9BB0]" : "text-white")}>
          {titulo} <span className="ml-1 text-sm font-normal text-fog-dim">{cantidad}</span>
        </h2>
        {detalle && <p className="text-sm text-fog">{detalle}</p>}
      </div>
      <ul className="space-y-3">{children}</ul>
    </section>
  );
}

const pastilla = (i: Interesado, m: Momento, ahoraMs: number): { texto: string; tono: "lima" | "morado" | "neutro" | "alerta" } => {
  if (i.estado === "confirmada") return { texto: "Ya es cliente", tono: "lima" };
  if (i.estado === "cancelada") return { texto: "Canceló", tono: "alerta" };
  if (i.estado === "descartada") return { texto: "No avanzó", tono: "neutro" };
  if (i.estado === "rechazada") return { texto: "Rechazada en Cal.com", tono: "neutro" };
  if (i.porAceptar) return { texto: "Por aceptar en Cal.com", tono: "alerta" };
  if (m === "pasada") return { texto: "Por confirmar", tono: "alerta" };
  if (m === "ahora") return { texto: "Es ahora", tono: "lima" };
  if (m === "pronto") return { texto: `Hoy · ${relativo(i.inicio, ahoraMs)}`, tono: "morado" };
  return { texto: relativo(i.inicio, ahoraMs), tono: "neutro" };
};

function Fila({
  i,
  ahoraMs,
  nombreCliente,
  puedeEditar,
  puedeBorrar,
  onConfirmar,
  onVerCliente,
}: {
  i: Interesado;
  ahoraMs: number;
  nombreCliente: (id: string) => string | null;
  puedeEditar: boolean;
  puedeBorrar: boolean;
  onConfirmar: (i: Interesado) => void;
  onVerCliente: (id: string) => void;
}) {
  const acc = useAccion();
  const m = momentoDe(i, ahoraMs);
  const p = pastilla(i, m, ahoraMs);
  const esperando = i.estado === "agendada" && i.porAceptar; // falta aceptarla en Cal.com
  const pendiente = i.estado === "agendada" && !i.porAceptar;
  const llamada = i.enlaceLlamada ?? i.enlaceReserva;
  const ahoraEs = pendiente && m === "ahora";
  const cliente = i.clienteId ? nombreCliente(i.clienteId) : null;
  const wa = i.whatsapp ? `https://wa.me/${i.whatsapp}?text=${encodeURIComponent(`Hola ${i.nombre.split(" ")[0]}, `)}` : null;

  return (
    <li className={cn("rounded-card border p-4 sm:p-5", m === "pasada" && pendiente ? "border-[#FF9BB0]/30 bg-[#FF9BB0]/[0.04]" : ahoraEs ? "border-lime/40 bg-lime/[0.05]" : "border-white/[0.08] bg-white/[0.03]")}>
      <div className="flex flex-wrap items-start gap-3">
        <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 font-display text-sm font-bold text-brand-soft">
          {inicial(i.nombre)}
        </span>
        <div className="min-w-0 flex-1 basis-56">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-display text-base font-bold text-white">{i.nombre}</h3>
            <Pill tono={p.tono}>{p.texto}</Pill>
            {i.tipo && <Pill>{etiquetaTipo[i.tipo]}</Pill>}
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm text-fog">
            <CalendarClock aria-hidden className="h-4 w-4 text-brand-soft" />
            <span className="text-white">{cuandoTexto(i.inicio)}</span>
            <span className="text-fog-dim">· hora de Bogotá · {relativo(i.inicio, ahoraMs)}</span>
          </p>
        </div>
      </div>

      {(i.necesita || i.inversion || i.cuando || i.paginaWeb) && (
        <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
          {i.necesita && (
            <div className="flex gap-2">
              <dt className="shrink-0 text-fog-dim">Necesita</dt>
              <dd className="text-white">{i.necesita}</dd>
            </div>
          )}
          {i.inversion && (
            <div className="flex gap-2">
              <dt className="shrink-0 text-fog-dim">Invertir</dt>
              <dd className="text-white">{i.inversion}</dd>
            </div>
          )}
          {i.cuando && (
            <div className="flex gap-2">
              <dt className="shrink-0 text-fog-dim">Empezar</dt>
              <dd className="text-white">{i.cuando}</dd>
            </div>
          )}
          {i.paginaWeb && (
            <div className="flex gap-2">
              <dt className="shrink-0 text-fog-dim">Su página</dt>
              <dd className="min-w-0 truncate">
                <a href={i.paginaWeb} target="_blank" rel="noopener noreferrer" className="text-brand-soft hover:text-white">
                  {i.paginaWeb.replace(/^https?:\/\//, "")}
                </a>
              </dd>
            </div>
          )}
        </dl>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        {wa && i.whatsapp && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-fog hover:text-white">
            <MessageCircle aria-hidden className="h-4 w-4 text-brand-soft" /> {verWhatsapp(i.whatsapp)}
          </a>
        )}
        {i.correo && (
          <a href={`mailto:${i.correo}`} className="inline-flex min-w-0 items-center gap-1.5 text-fog hover:text-white">
            <Mail aria-hidden className="h-4 w-4 shrink-0 text-brand-soft" /> <span className="truncate">{i.correo}</span>
          </a>
        )}
      </div>

      {i.estado === "confirmada" && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-fog">
          <Check aria-hidden className="h-4 w-4 text-lime" /> {cliente ? <>Cliente: <strong className="font-semibold text-white">{cliente}</strong></> : "Ya es cliente"}
          {i.clienteId && cliente && (
            <button type="button" onClick={() => onVerCliente(i.clienteId!)} className="font-semibold text-brand-soft hover:text-white">
              Ver cliente →
            </button>
          )}
        </div>
      )}

      {/* Acciones */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {esperando && (
          <a
            href={CAL_POR_ACEPTAR}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-btn pn-primario px-5 text-sm font-semibold sm:w-auto"
          >
            <Check aria-hidden className="h-4 w-4" /> Aceptar o rechazar en Cal.com
            <ExternalLink aria-hidden className="h-3.5 w-3.5 opacity-60" />
          </a>
        )}
        {pendiente && llamada && (
          <a
            href={llamada}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex h-11 items-center justify-center gap-2 rounded-btn px-5 text-sm font-semibold sm:w-auto",
              ahoraEs ? "pn-primario" : "border border-white/10 bg-surface-2 text-white hover:border-white/20"
            )}
          >
            <Video aria-hidden className="h-4 w-4" /> {ahoraEs ? "Entrar ahora" : i.enlaceLlamada ? "Entrar a la llamada" : "Abrir la reserva en Cal"}
            <ExternalLink aria-hidden className="h-3.5 w-3.5 opacity-60" />
          </a>
        )}
        {pendiente && puedeEditar && (
          <>
            <button
              type="button"
              onClick={() => onConfirmar(i)}
              disabled={acc.pendiente}
              className={cn(
                "inline-flex h-11 items-center justify-center gap-2 rounded-btn px-5 text-sm font-semibold disabled:opacity-50 sm:w-auto",
                m === "pasada" ? "pn-primario" : "border border-white/10 bg-surface-2 text-white hover:border-white/20"
              )}
            >
              <Check aria-hidden className="h-4 w-4" /> Confirmar y pasar a cliente
            </button>
            <BotonSecundario type="button" disabled={acc.pendiente} onClick={() => acc.correr(() => descartarInteresado(i.id))} className="h-11 sm:w-auto">
              <X aria-hidden className="h-4 w-4" /> No avanzó
            </BotonSecundario>
          </>
        )}
        {i.estado === "descartada" && puedeEditar && (
          <BotonSecundario type="button" disabled={acc.pendiente} onClick={() => acc.correr(() => reabrirInteresado(i.id))} className="h-11 sm:w-auto">
            <RotateCcw aria-hidden className="h-4 w-4" /> Volver a pendiente
          </BotonSecundario>
        )}
        {i.enlaceReserva && (pendiente || i.estado === "cancelada") && (
          <a href={i.enlaceReserva} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 px-1 text-xs font-semibold text-fog-dim hover:text-white">
            Ver o cambiar la reserva en Cal <ExternalLink aria-hidden className="h-3 w-3" />
          </a>
        )}
        {puedeBorrar && (
          <button
            type="button"
            aria-label={`Borrar a ${i.nombre} de interesados`}
            disabled={acc.pendiente}
            onClick={() => window.confirm(`¿Borrar a ${i.nombre} de la lista de interesados?${i.clienteId ? " El cliente que se creó desde aquí no se borra." : ""} Queda en el historial.`) && acc.correr(() => borrarInteresado(i.id))}
            className="flex h-9 w-9 items-center justify-center rounded-btn text-fog-dim hover:text-[#FF9BB0] sm:ml-auto"
          >
            <Trash2 aria-hidden className="h-4 w-4" />
          </button>
        )}
      </div>
      <MensajeError error={acc.error} />
    </li>
  );
}
