"use client";

import { useEffect, useRef, useState } from "react";
import { TriangleAlert, Trash2 } from "lucide-react";
import { borrarProyecto, verContenidoProyecto, type ContenidoProyecto } from "@/app/(panel)/panel/(app)/finanzas/acciones";
import { pesos } from "@/lib/panel/formato";
import { BotonSecundario, MensajeError, useAccion } from "./comun";

// Borrar un proyecto (solo Sergio, D-119). Alerta que muestra TODO lo que se va a borrar
// (gastos, días trabajados, pasos) y pide escribir el nombre del proyecto para confirmar.
// El servidor vuelve a revisar el rol y el nombre, y deja el borrado en el historial.
export default function BorrarProyecto({ proyectoId, nombre, onBorrado }: { proyectoId: string; nombre: string; onBorrado: () => void }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <>
      <BotonSecundario type="button" className="text-[#FF9BB0]" onClick={() => setAbierto(true)}>
        <Trash2 aria-hidden className="h-4 w-4" /> Borrar proyecto
      </BotonSecundario>
      {abierto && <Alerta proyectoId={proyectoId} nombre={nombre} onCerrar={() => setAbierto(false)} onBorrado={onBorrado} />}
    </>
  );
}

function Alerta({ proyectoId, nombre, onCerrar, onBorrado }: { proyectoId: string; nombre: string; onCerrar: () => void; onBorrado: () => void }) {
  const [c, setC] = useState<ContenidoProyecto | null>(null);
  const [errorCarga, setErrorCarga] = useState("");
  const [escrito, setEscrito] = useState("");
  const acc = useAccion();
  const campo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    verContenidoProyecto(proyectoId).then((r) => (r.ok ? setC(r.datos) : setErrorCarga(r.error)));
  }, [proyectoId]);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onCerrar]);
  useEffect(() => {
    if (c) campo.current?.focus();
  }, [c]);

  const norm = (t: string) => t.trim().toLowerCase().replace(/\s+/g, " ");
  const coincide = norm(escrito) === norm(nombre);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/80 p-4 backdrop-blur-sm sm:items-center" onClick={onCerrar}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="borrar-titulo"
        aria-describedby="borrar-detalle"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-card border border-[#FF9BB0]/30 bg-surface-1 p-5 shadow-2xl"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FF9BB0]/15">
            <TriangleAlert aria-hidden className="h-5 w-5 text-[#FF9BB0]" />
          </span>
          <div>
            <h2 id="borrar-titulo" className="font-display text-lg font-bold text-white">¿Borrar “{nombre}”?</h2>
            <p className="mt-1 text-sm text-fog">Se borra para siempre, con todo lo que tiene. No se puede deshacer.</p>
          </div>
        </div>

        <div id="borrar-detalle" className="mt-4 rounded-frame border border-white/8 bg-surface-2/60 p-3 text-sm">
          {errorCarga ? (
            <MensajeError error={errorCarga} />
          ) : !c ? (
            <p className="text-fog-dim">Revisando lo que tiene el proyecto…</p>
          ) : (
            <ul className="space-y-1.5">
              <li className="flex justify-between gap-3"><span className="text-fog">Valor{c.cerrado ? " (proyecto cerrado)" : ""}</span><span className="tabular-nums text-white">{pesos(c.valor)}</span></li>
              <li className="flex justify-between gap-3"><span className="text-fog">Gastos</span><span className="tabular-nums text-white">{c.gastos} · {pesos(c.totalGastos)}</span></li>
              <li className="flex justify-between gap-3"><span className="text-fog">Días trabajados</span><span className="tabular-nums text-white">{String(c.dias).replace(".", ",")} en {c.registrosDias} registros</span></li>
              <li className="flex justify-between gap-3"><span className="text-fog">Pasos del proceso</span><span className="tabular-nums text-white">{c.pasos}</span></li>
            </ul>
          )}
          {c?.cerrado && <p className="mt-2 text-xs text-[#FFC76B]">Es una venta cerrada: también sale de Finanzas, del reparto y del Equipo.</p>}
        </div>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs font-medium text-fog">
            Para confirmar, escribe el nombre del proyecto: <strong className="text-white">{nombre}</strong>
          </span>
          <input ref={campo} value={escrito} onChange={(e) => setEscrito(e.target.value)} autoComplete="off" spellCheck={false} className="pn-input" aria-label="Nombre del proyecto para confirmar" />
        </label>
        <p className="mt-2 text-xs text-fog-dim">Queda en el historial quién lo borró y cuándo.</p>
        <div className="mt-3"><MensajeError error={acc.error} /></div>

        <div className="mt-4 flex gap-2">
          <BotonSecundario type="button" onClick={onCerrar} className="h-11 flex-1">
            Cancelar
          </BotonSecundario>
          <button
            type="button"
            disabled={!coincide || !c || acc.pendiente}
            onClick={() => acc.correr(() => borrarProyecto(proyectoId, escrito), onBorrado)}
            className="h-11 flex-1 rounded-btn bg-[#FF9BB0] px-4 text-sm font-semibold text-ink hover:bg-[#ffb3c3] disabled:opacity-40"
          >
            {acc.pendiente ? "Borrando…" : "Borrar para siempre"}
          </button>
        </div>
      </div>
    </div>
  );
}
