"use client";

import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import { EMPRESA, type DatosFinanzas } from "@/lib/panel/finanzas/tipos";
import { calcularProyecto, sumaReparto, validarReglas } from "@/lib/panel/finanzas/calculo";
import { pesos } from "@/lib/panel/formato";
import { guardarReglas } from "@/app/(panel)/panel/(app)/finanzas/acciones";
import { Tarjeta } from "../ui";
import { BotonPrincipal, BotonSecundario, MensajeError, nombreDe, useAccion } from "./comun";
import { cn } from "@/lib/utils";

// Reglas del reparto: % de la bolsa de trabajo, % de cada socio y de la empresa, y meses de reserva.
// Los proyectos cerrados conservan los % con que se cerraron (D-109).
export default function RepartoFin({ datos }: { datos: DatosFinanzas }) {
  const edita = datos.puedeEditar;
  // Filas: cada persona activa + la empresa (las que ya tenían % se conservan)
  const inicial = useMemo(() => {
    const ids = [...datos.personas.filter((p) => p.activo).map((p) => p.id), EMPRESA];
    datos.config.reparto.forEach((r) => !ids.includes(r.beneficiario) && ids.splice(ids.length - 1, 0, r.beneficiario));
    return ids.map((id) => ({ beneficiario: id, pct: datos.config.reparto.find((r) => r.beneficiario === id)?.pct ?? 0 }));
  }, [datos]);
  const [bolsa, setBolsa] = useState(datos.config.bolsaTrabajoPct);
  const [reparto, setReparto] = useState(inicial);
  const [reserva, setReserva] = useState(datos.config.reservaMeses);
  const [ejemplo, setEjemplo] = useState(2_000_000);
  const acc = useAccion();
  const [guardado, setGuardado] = useState(false);

  const reglas = { bolsaTrabajoPct: bolsa, reparto };
  const errores = validarReglas(reglas, datos.personas);
  const suma = Math.round(sumaReparto(reglas) * 100) / 100;
  const sucio =
    bolsa !== datos.config.bolsaTrabajoPct || reserva !== datos.config.reservaMeses || JSON.stringify(reparto) !== JSON.stringify(inicial);

  // Ejemplo: proyecto con horas iguales entre los socios activos
  const activos = datos.personas.filter((p) => p.activo);
  const ej = calcularProyecto(
    { id: "ej", nombre: "", clienteId: null, servicioId: null, estado: "cerrado", valor: ejemplo, fechaCierre: null, fechaInicio: null, fechaLimite: null, repartoCongelado: null, notas: null },
    [],
    activos.map((p, i) => ({ id: `h${i}`, proyectoId: "ej", personaId: p.id, area: p.area, horas: 10, fecha: "", nota: null })),
    reglas,
    datos.personas
  );
  const fmt = new Intl.NumberFormat("es-CO");

  const pct = (v: number, set: (n: number) => void, etiqueta: string) => (
    <div className="flex items-center gap-2">
      <input
        type="number"
        inputMode="decimal"
        min={0}
        max={100}
        step={0.5}
        value={Number.isFinite(v) ? v : 0}
        disabled={!edita}
        aria-label={etiqueta}
        onChange={(e) => set(e.target.value === "" ? 0 : Math.max(0, Math.min(100, Number(e.target.value))))}
        className="pn-input w-24 text-right tabular-nums disabled:opacity-70"
      />
      <span className="text-sm text-fog">%</span>
    </div>
  );

  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
      <Tarjeta titulo="Reglas del reparto" bajada={datos.config.actualizado ? `Último cambio: ${new Date(datos.config.actualizado).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}` : undefined}>
        <div className="space-y-6">
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white">1. Bolsa de trabajo</h3>
                <p className="mt-0.5 text-xs text-fog-dim">Porcentaje de la ganancia de cada proyecto que se reparte según las horas trabajadas.</p>
              </div>
              {pct(bolsa, setBolsa, "Porcentaje de la bolsa de trabajo")}
            </div>
            <input type="range" min={0} max={100} value={bolsa} disabled={!edita} onChange={(e) => setBolsa(Number(e.target.value))} aria-hidden tabIndex={-1} className="mt-3 w-full accent-[#B6FF00]" />
          </section>

          <section>
            <h3 className="text-sm font-semibold text-white">2. Reparto del resto ({100 - bolsa} % de la ganancia)</h3>
            <p className="mt-0.5 text-xs text-fog-dim">Porcentajes fijos para cada socio y para Arata. Deben sumar 100 %.</p>
            <ul className="mt-3 divide-y divide-white/6 rounded-frame border border-white/8 bg-surface-1">
              {reparto.map((r, i) => (
                <li key={r.beneficiario} className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <span className={cn("text-sm", r.beneficiario === EMPRESA ? "font-semibold text-lime" : "text-white")}>
                    {nombreDe(r.beneficiario, datos.personas)}
                    {r.beneficiario === datos.miPersonaId && <span className="ml-2 text-xs text-fog-dim">(tú)</span>}
                  </span>
                  {pct(r.pct, (n) => setReparto((l) => l.map((x, j) => (j === i ? { ...x, pct: n } : x))), `Porcentaje de ${nombreDe(r.beneficiario, datos.personas)}`)}
                </li>
              ))}
            </ul>
            <p className={cn("mt-2 text-right text-sm font-semibold", suma === 100 ? "text-lime" : "text-[#FF9BB0]")}>Suma: {String(suma).replace(".", ",")} %</p>
          </section>

          <section className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white">3. Reserva de la empresa</h3>
              <p className="mt-0.5 text-xs text-fog-dim">Meses de gastos fijos que Arata guarda antes de considerar plata disponible para invertir.</p>
            </div>
            <div className="flex items-center gap-2">
              <input type="number" min={0} max={24} value={reserva} disabled={!edita} aria-label="Meses de reserva" onChange={(e) => setReserva(Math.max(0, Math.min(24, Number(e.target.value) || 0)))} className="pn-input w-20 text-right tabular-nums disabled:opacity-70" />
              <span className="text-sm text-fog">meses</span>
            </div>
          </section>

          <p className="flex items-start gap-2 rounded-frame border border-white/8 bg-surface-2/60 p-3 text-xs text-fog">
            <Info aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-soft" />
            Los cambios aplican a proyectos abiertos y a los que se cierren después. Los proyectos ya cerrados conservan los porcentajes de su cierre (se pueden recalcular uno por uno desde su ficha).
          </p>

          {edita && (
            <div className="space-y-2">
              {errores.length > 0 && sucio && <MensajeError error={errores[0]} />}
              <MensajeError error={acc.error} />
              {guardado && !sucio && <p className="text-sm text-lime">Reparto guardado.</p>}
              <div className="flex gap-2">
                <BotonSecundario type="button" disabled={!sucio || acc.pendiente} onClick={() => { setBolsa(datos.config.bolsaTrabajoPct); setReparto(inicial); setReserva(datos.config.reservaMeses); }}>
                  Descartar
                </BotonSecundario>
                <BotonPrincipal
                  type="button"
                  pendiente={acc.pendiente}
                  disabled={!sucio || errores.length > 0}
                  onClick={() => acc.correr(() => guardarReglas({ bolsaTrabajoPct: bolsa, reparto, reservaMeses: reserva }), () => setGuardado(true))}
                  className="flex-1"
                >
                  Guardar reparto
                </BotonPrincipal>
              </div>
            </div>
          )}
        </div>
      </Tarjeta>

      <Tarjeta titulo="Así quedaría un proyecto" bajada="Ejemplo con horas iguales entre los socios activos">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-fog">Ganancia del proyecto de ejemplo</span>
          <input value={fmt.format(ejemplo)} inputMode="numeric" onChange={(e) => setEjemplo(Number(e.target.value.replace(/\D/g, "").slice(0, 11)) || 0)} className="pn-input tabular-nums" />
        </label>
        <dl className="mt-4 space-y-1.5 text-sm">
          <div className="flex justify-between"><dt className="text-fog">Bolsa de trabajo ({bolsa} %)</dt><dd className="tabular-nums text-white">{pesos(ej.bolsa)}</dd></div>
          <div className="flex justify-between"><dt className="text-fog">Resto por porcentajes</dt><dd className="tabular-nums text-white">{pesos(ej.resto)}</dd></div>
        </dl>
        <ul className="mt-4 divide-y divide-white/6 border-t border-white/8">
          {ej.personas
            .filter((x) => activos.some((a) => a.id === x.personaId))
            .map((x) => (
              <li key={x.personaId} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-white">{nombreDe(x.personaId, datos.personas)}</span>
                <span className="text-right">
                  <span className="block font-display font-bold text-white">{pesos(x.total)}</span>
                  <span className="block text-[0.7rem] text-fog-dim">trabajo {pesos(x.trabajo)} · socio {pesos(x.socio)}</span>
                </span>
              </li>
            ))}
          <li className="flex items-center justify-between py-2.5 text-sm">
            <span className="font-semibold text-lime">Arata San (empresa)</span>
            <span className="font-display font-bold text-lime">{pesos(ej.empresa)}</span>
          </li>
        </ul>
      </Tarjeta>
    </div>
  );
}
