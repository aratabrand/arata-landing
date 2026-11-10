"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { categoriasGasto, type DatosFinanzas } from "@/lib/panel/finanzas/tipos";
import { totalGastosFijos } from "@/lib/panel/finanzas/calculo";
import { fechaCorta, pesos } from "@/lib/panel/formato";
import { borrarGasto, borrarGastoFijo, guardarGastoFijo } from "@/app/(panel)/panel/(app)/finanzas/acciones";
import { Tarjeta } from "../ui";
import { BotonSecundario, CampoPesos, MensajeError, useAccion } from "./comun";
import { FormGasto, Lista } from "./ProyectosFin";
import { cn } from "@/lib/utils";

// Gastos de la empresa (no son de un proyecto, incluye inversiones) y gastos fijos mensuales.
export default function GastosFin({ datos, hoy }: { datos: DatosFinanzas; hoy: string }) {
  const empresa = datos.gastos.filter((g) => g.proyectoId === null);
  const deProyectos = datos.gastos.filter((g) => g.proyectoId !== null);
  const fijos = totalGastosFijos(datos.gastosFijos);
  const totalEmpresa = empresa.reduce((a, g) => a + g.valor, 0);
  const totalProyectos = deProyectos.reduce((a, g) => a + g.valor, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {[
          { k: "Gastos fijos al mes", v: fijos },
          { k: "Gastos e inversiones de la empresa", v: totalEmpresa },
          { k: "Gastos cargados a proyectos", v: totalProyectos },
        ].map((x) => (
          <div key={x.k} className="v2-card p-4 sm:p-5">
            <p className="text-xs text-fog">{x.k}</p>
            <p className="mt-2 font-display text-[clamp(1.3rem,2.4vw,1.7rem)] font-bold leading-none text-white">{pesos(x.v)}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Tarjeta titulo="Gastos fijos mensuales" bajada="Lo que la empresa paga cada mes, haya o no proyectos. Con esto se calcula el punto de equilibrio y la reserva.">
          <GastosFijos datos={datos} />
        </Tarjeta>

        <Tarjeta titulo="Gastos e inversiones de la empresa" bajada="Lo que sale de los fondos de Arata y no es de un proyecto: publicidad propia, equipos, cursos, inversiones…">
          <Lista
            vacio="Sin gastos de la empresa."
            filas={empresa.map((g) => ({
              id: g.id,
              izq: g.concepto,
              sub: `${categoriasGasto.find((c) => c.valor === g.categoria)?.label} · ${fechaCorta(g.fecha)}`,
              der: pesos(g.valor),
            }))}
            onBorrar={datos.puedeEditar ? (id) => borrarGasto(id) : undefined}
          />
          {datos.puedeEditar && <FormGasto proyectoId={null} hoy={hoy} empresa />}
        </Tarjeta>
      </div>

      {deProyectos.length > 0 && (
        <Tarjeta titulo="Gastos cargados a proyectos" bajada="Se agregan y quitan desde la ficha de cada proyecto">
          <ul className="divide-y divide-white/6">
            {deProyectos.map((g) => (
              <li key={g.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="min-w-0">
                  <span className="block truncate text-white">{g.concepto}</span>
                  <span className="block truncate text-[0.7rem] text-fog-dim">
                    {datos.proyectos.find((p) => p.id === g.proyectoId)?.nombre} · {fechaCorta(g.fecha)}
                  </span>
                </span>
                <span className="shrink-0 font-display font-bold text-white">{pesos(g.valor)}</span>
              </li>
            ))}
          </ul>
        </Tarjeta>
      )}
    </div>
  );
}

function GastosFijos({ datos }: { datos: DatosFinanzas }) {
  const acc = useAccion();
  const [clave, setClave] = useState(0);
  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    acc.correr(() => guardarGastoFijo({ concepto: String(f.get("concepto") ?? ""), valorMensual: String(f.get("valor") ?? ""), activo: true }), () => setClave((k) => k + 1));
  };
  return (
    <>
      {datos.gastosFijos.length === 0 ? (
        <p className="text-sm text-fog-dim">Sin gastos fijos registrados.</p>
      ) : (
        <ul className="divide-y divide-white/6 rounded-frame border border-white/8 bg-surface-1">
          {datos.gastosFijos.map((g) => (
            <li key={g.id} className={cn("flex items-center gap-3 px-3 py-2.5", !g.activo && "opacity-50")}>
              <span className="min-w-0 flex-1 truncate text-sm text-white">{g.concepto}</span>
              <span className="shrink-0 font-display text-sm font-bold text-white">{pesos(g.valorMensual)}</span>
              {datos.puedeEditar && (
                <>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={g.activo}
                    aria-label={`Contar ${g.concepto} como gasto fijo`}
                    disabled={acc.pendiente}
                    onClick={() => acc.correr(() => guardarGastoFijo({ id: g.id, concepto: g.concepto, valorMensual: g.valorMensual, activo: !g.activo }))}
                    className={cn("relative h-6 w-10 shrink-0 rounded-full border transition-colors", g.activo ? "border-lime bg-lime" : "border-white/15 bg-surface-2")}
                  >
                    <span className={cn("absolute left-0 top-0.5 h-4 w-4 rounded-full transition-transform", g.activo ? "translate-x-[18px] bg-ink" : "translate-x-0.5 bg-fog")} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Quitar ${g.concepto}`}
                    disabled={acc.pendiente}
                    onClick={() => window.confirm(`¿Quitar "${g.concepto}"?`) && acc.correr(() => borrarGastoFijo(g.id))}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-btn text-fog-dim hover:text-white"
                  >
                    <Trash2 aria-hidden className="h-4 w-4" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      {datos.puedeEditar && (
        <form key={clave} onSubmit={enviar} noValidate className="mt-3 grid grid-cols-[1fr_auto] items-end gap-2">
          <input name="concepto" placeholder="Concepto (ej. herramientas, contador)" aria-label="Concepto" maxLength={90} className="pn-input col-span-2" />
          <CampoPesos name="valor" etiqueta="Valor mensual (COP)" />
          <BotonSecundario type="submit" disabled={acc.pendiente} className="h-11">
            <Plus aria-hidden className="h-4 w-4" /> Agregar
          </BotonSecundario>
        </form>
      )}
      <MensajeError error={acc.error} />
    </>
  );
}
