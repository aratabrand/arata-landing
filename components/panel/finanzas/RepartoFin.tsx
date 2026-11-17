"use client";

import { useState } from "react";
import { Info, Lock } from "lucide-react";
import { EMPRESA, type DatosFinanzas, type RegistroTrabajo } from "@/lib/panel/finanzas/tipos";
import { calcularProyecto, partesActuales } from "@/lib/panel/finanzas/calculo";
import { pesos } from "@/lib/panel/formato";
import { guardarReglas } from "@/app/(panel)/panel/(app)/finanzas/acciones";
import { Tarjeta } from "../ui";
import { BotonPrincipal, BotonSecundario, MensajeError, nombreDe, useAccion } from "./comun";
import { cn } from "@/lib/utils";

// Reglas del reparto (D-118): ganancia = valor − gastos; primero se pagan los días trabajados
// (días × valor del día) y lo que queda se reparte por partes iguales entre los socios activos y Arata.
// El valor del día solo lo cambia Sergio. Los proyectos cerrados conservan las reglas de su cierre.
export default function RepartoFin({ datos }: { datos: DatosFinanzas }) {
  const edita = datos.puedeEditar;
  const [tarifa, setTarifa] = useState(datos.config.tarifaDia);
  const [reserva, setReserva] = useState(datos.config.reservaMeses);
  const [ejValor, setEjValor] = useState(2_000_000);
  const [ejGastos, setEjGastos] = useState(200_000);
  const [ejDias, setEjDias] = useState(5);
  const [ejPersona, setEjPersona] = useState(datos.miPersonaId ?? datos.personas[0]?.id ?? "");
  const acc = useAccion();
  const [guardado, setGuardado] = useState(false);

  const partes = partesActuales(datos.personas);
  const sucio = tarifa !== datos.config.tarifaDia || reserva !== datos.config.reservaMeses;
  const tarifaValida = tarifa >= 1000 && tarifa <= 10_000_000;
  const fmt = new Intl.NumberFormat("es-CO");

  // Ejemplo con los valores que escribe la persona
  const trabajo: RegistroTrabajo[] = ejPersona && ejDias > 0 ? [{ id: "e", proyectoId: "ej", personaId: ejPersona, actividad: "Desarrollo", dias: ejDias, fecha: "", nota: null }] : [];
  const ej = calcularProyecto(
    { id: "ej", nombre: "", clienteId: null, servicioId: null, estado: "cerrado", valor: ejValor, fechaCierre: null, fechaInicio: null, fechaLimite: null, tarifaDia: null, repartoCongelado: null, notas: null },
    ejGastos > 0 ? [{ id: "g", proyectoId: "ej", concepto: "", categoria: "otros", valor: ejGastos, fecha: "" }] : [],
    trabajo,
    { ...datos.config, tarifaDia: tarifaValida ? tarifa : datos.config.tarifaDia },
    datos.personas
  );
  const numero = (v: number, set: (n: number) => void, etiqueta: string) => (
    <input value={fmt.format(v)} inputMode="numeric" aria-label={etiqueta} onChange={(e) => set(Number(e.target.value.replace(/\D/g, "").slice(0, 11)) || 0)} className="pn-input tabular-nums" />
  );

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
      <Tarjeta titulo="Cómo se reparte" bajada={datos.config.actualizado ? `Último cambio: ${new Date(datos.config.actualizado).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Bogota" })}` : undefined}>
        <div className="space-y-6">
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/20 font-display text-xs font-bold text-brand-soft">1</span>
              <span className="text-fog"><strong className="text-white">Ganancia</strong> = valor del proyecto − sus gastos.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/20 font-display text-xs font-bold text-brand-soft">2</span>
              <span className="text-fog">Primero se pagan los <strong className="text-white">días trabajados</strong> de quien hizo cada actividad: días × valor del día (1 día = 8 horas).</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/20 font-display text-xs font-bold text-brand-soft">3</span>
              <span className="text-fog">
                Lo que queda se reparte en <strong className="text-white">{partes.length} partes iguales</strong>: {partes.map((id) => nombreDe(id, datos.personas).replace(" (empresa)", "")).join(", ")}.
              </span>
            </li>
          </ol>

          <section className="flex flex-wrap items-end justify-between gap-3 border-t border-white/8 pt-5">
            <div className="max-w-xs">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-white">
                Valor del día {!datos.esDueno && <Lock aria-label="Solo Sergio" className="h-3.5 w-3.5 text-fog-dim" />}
              </h3>
              <p className="mt-0.5 text-xs text-fog-dim">Para todos los proyectos. Cada proyecto puede tener el suyo (en su ficha). Solo Sergio lo cambia.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-fog">$</span>
              <input
                value={fmt.format(tarifa)}
                inputMode="numeric"
                disabled={!datos.esDueno}
                aria-label="Valor del día"
                onChange={(e) => setTarifa(Number(e.target.value.replace(/\D/g, "").slice(0, 8)) || 0)}
                className="pn-input w-32 text-right tabular-nums disabled:opacity-70"
              />
            </div>
          </section>

          <section className="flex flex-wrap items-center justify-between gap-3">
            <div className="max-w-xs">
              <h3 className="text-sm font-semibold text-white">Reserva de la empresa</h3>
              <p className="mt-0.5 text-xs text-fog-dim">Meses de gastos fijos que Arata guarda antes de considerar plata disponible para invertir.</p>
            </div>
            <div className="flex items-center gap-2">
              <input type="number" min={0} max={24} value={reserva} disabled={!edita} aria-label="Meses de reserva" onChange={(e) => setReserva(Math.max(0, Math.min(24, Number(e.target.value) || 0)))} className="pn-input w-20 text-right tabular-nums disabled:opacity-70" />
              <span className="text-sm text-fog">meses</span>
            </div>
          </section>

          <p className="flex items-start gap-2 rounded-frame border border-white/8 bg-surface-2/60 p-3 text-xs text-fog">
            <Info aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-soft" />
            Quién recibe parte igual sale de Equipo (socios activos). Al cerrar un proyecto se guardan su valor del día y sus partes: cambiar algo después no altera lo ya cerrado. Si los días cuestan más que la ganancia, se pagan en proporción hasta la ganancia y no hay parte igual.
          </p>

          {edita && (
            <div className="space-y-2">
              {!tarifaValida && <MensajeError error="El valor del día va de $1.000 a $10.000.000." />}
              <MensajeError error={acc.error} />
              {guardado && !sucio && <p className="text-sm text-lime">Reparto guardado.</p>}
              <div className="flex gap-2">
                <BotonSecundario type="button" disabled={!sucio || acc.pendiente} onClick={() => { setTarifa(datos.config.tarifaDia); setReserva(datos.config.reservaMeses); }}>
                  Descartar
                </BotonSecundario>
                <BotonPrincipal
                  type="button"
                  pendiente={acc.pendiente}
                  disabled={!sucio || !tarifaValida}
                  onClick={() => acc.correr(() => guardarReglas({ tarifaDia: tarifa, reservaMeses: reserva }), () => setGuardado(true))}
                  className="flex-1"
                >
                  Guardar reparto
                </BotonPrincipal>
              </div>
            </div>
          )}
        </div>
      </Tarjeta>

      <Tarjeta titulo="Así quedaría un proyecto" bajada="Cambia los números para probar">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block"><span className="mb-1.5 block text-xs font-medium text-fog">Valor del proyecto</span>{numero(ejValor, setEjValor, "Valor del proyecto de ejemplo")}</label>
          <label className="block"><span className="mb-1.5 block text-xs font-medium text-fog">Gastos del proyecto</span>{numero(ejGastos, setEjGastos, "Gastos del proyecto de ejemplo")}</label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-fog">Quién trabajó días</span>
            <select value={ejPersona} onChange={(e) => setEjPersona(e.target.value)} className="pn-input">
              {datos.personas.filter((p) => p.activo).map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-fog">Días</span>
            <input type="number" min={0} max={365} step={0.5} value={ejDias} onChange={(e) => setEjDias(Math.max(0, Math.round(Number(e.target.value) * 2) / 2))} className="pn-input tabular-nums" />
          </label>
        </div>
        <dl className="mt-4 space-y-1.5 text-sm">
          <div className="flex justify-between"><dt className="text-fog">Ganancia</dt><dd className="tabular-nums text-white">{pesos(ej.ganancia)}</dd></div>
          <div className="flex justify-between"><dt className="text-fog">− Días ({String(ejDias).replace(".", ",")} × {pesos(ej.tarifaDia)})</dt><dd className="tabular-nums text-white">{pesos(-ej.pagoDias)}</dd></div>
          <div className="flex justify-between border-t border-white/8 pt-1.5"><dt className="text-fog">= Para repartir en {ej.numPartes} partes</dt><dd className="tabular-nums font-semibold text-white">{pesos(ej.paraRepartir)}</dd></div>
        </dl>
        {ej.recortado && <p className="mt-2 text-xs text-[#FFC76B]">Los días cuestan más que la ganancia: se pagan en proporción hasta {pesos(ej.ganancia)}.</p>}
        {ej.perdida && <p className="mt-2 text-xs text-[#FF9BB0]">El proyecto pierde plata: no se reparte y la pérdida la absorbe Arata.</p>}
        <ul className="mt-4 divide-y divide-white/6 border-t border-white/8">
          {ej.personas
            .filter((x) => datos.personas.some((a) => a.id === x.personaId && a.activo))
            .map((x) => (
              <li key={x.personaId} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-white">{nombreDe(x.personaId, datos.personas)}</span>
                <span className="text-right">
                  <span className="block font-display font-bold text-white">{pesos(x.total)}</span>
                  <span className="block text-[0.7rem] text-fog-dim">parte igual {pesos(x.parteIgual)}{x.porDias > 0 && ` · días ${pesos(x.porDias)}`}</span>
                </span>
              </li>
            ))}
          <li className={cn("flex items-center justify-between py-2.5 text-sm")}>
            <span className="font-semibold text-lime">{nombreDe(EMPRESA, datos.personas)}</span>
            <span className="font-display font-bold text-lime">{pesos(ej.empresa)}</span>
          </li>
        </ul>
      </Tarjeta>
    </div>
  );
}
