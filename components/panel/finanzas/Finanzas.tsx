"use client";

import { useMemo, useState } from "react";
import { HandCoins, Landmark, PiggyBank, Scale, Target, TrendingUp } from "lucide-react";
import type { DatosFinanzas } from "@/lib/panel/finanzas/tipos";
import { EMPRESA } from "@/lib/panel/finanzas/tipos";
import { participacionHistorica, proyectar, resumenFinanzas } from "@/lib/panel/finanzas/calculo";
import { numero, pesos, pesosCorto, porcentaje } from "@/lib/panel/formato";
import { Anillo, BarrasVerticales } from "../graficos";
import { PanelHeader, PanelPage, Pill, Tarjeta } from "../ui";
import { Segmentado } from "../Resumen";
import { AvisoAcceso, COLOR_EMPRESA, colorPersona } from "./comun";
import ProyectosFin from "./ProyectosFin";
import GastosFin from "./GastosFin";
import RepartoFin from "./RepartoFin";
import { cn } from "@/lib/utils";

// Módulo Finanzas (solo Arata San, D-109): resumen, proyectos, gastos, reparto y proyección.
// docs/panel-cliente/06-finanzas.md

type Vista = "resumen" | "proyectos" | "gastos" | "reparto" | "proyeccion";
const vistas: { valor: Vista; label: string }[] = [
  { valor: "resumen", label: "Resumen" },
  { valor: "proyectos", label: "Proyectos" },
  { valor: "gastos", label: "Gastos" },
  { valor: "reparto", label: "Reparto" },
  { valor: "proyeccion", label: "Proyección" },
];

type Periodo = "mes" | "anio" | "todo";
const periodos: { valor: Periodo; label: string }[] = [
  { valor: "mes", label: "Este mes" },
  { valor: "anio", label: "Este año" },
  { valor: "todo", label: "Todo" },
];

const mesesCortos = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const nombreMes = (m: string) => `${mesesCortos[Number(m.slice(5, 7)) - 1]} ${m.slice(2, 4)}`;

export default function Finanzas({ datos, hoy }: { datos: DatosFinanzas; hoy: string }) {
  const [vista, setVista] = useState<Vista>("resumen");

  return (
    <PanelPage>
      <PanelHeader
        titulo="Finanzas"
        bajada="Cuánto entra, cuánto se gasta, cuánto le toca a cada uno y con cuánto cuenta Arata para invertir."
      />
      <AvisoAcceso demo={datos.demo} puedeEditar={datos.puedeEditar} />

      <div className="-mx-4 overflow-x-auto px-4 pb-1">
        <div role="tablist" aria-label="Secciones de finanzas" className="inline-flex gap-1 rounded-btn border border-white/8 bg-surface-1 p-1">
          {vistas.map((v) => (
            <button
              key={v.valor}
              type="button"
              role="tab"
              aria-selected={vista === v.valor}
              onClick={() => setVista(v.valor)}
              className={cn(
                "h-9 whitespace-nowrap rounded-[7px] px-3.5 text-sm font-semibold transition-colors",
                vista === v.valor ? "bg-surface-3 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]" : "text-fog-dim hover:text-white"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {vista === "resumen" && <ResumenFin datos={datos} hoy={hoy} irA={setVista} />}
      {vista === "proyectos" && <ProyectosFin datos={datos} hoy={hoy} />}
      {vista === "gastos" && <GastosFin datos={datos} hoy={hoy} />}
      {vista === "reparto" && <RepartoFin datos={datos} />}
      {vista === "proyeccion" && <ProyeccionFin datos={datos} />}
    </PanelPage>
  );
}

// ── Resumen ─────────────────────────────────────────────────────────
function ResumenFin({ datos, hoy, irA }: { datos: DatosFinanzas; hoy: string; irA: (v: Vista) => void }) {
  const [periodo, setPeriodo] = useState<Periodo>("anio");
  const desde = periodo === "mes" ? `${hoy.slice(0, 7)}-01` : periodo === "anio" ? `${hoy.slice(0, 4)}-01-01` : undefined;
  const r = useMemo(() => resumenFinanzas(datos, desde), [datos, desde]);
  const todo = useMemo(() => resumenFinanzas(datos), [datos]);
  const eq = useMemo(
    () =>
      proyectar({
        proyectosMes: 1,
        valorPromedio: todo.promedio.valor || 2_000_000,
        gastosPct: todo.promedio.gastosPct,
        reglas: datos.config,
        personas: datos.personas,
        fijosMes: todo.fijosMes,
        participacionHoras: participacionHistorica(datos.horas),
      }),
    [datos, todo]
  );
  const enCurso = datos.proyectos.filter((p) => p.estado !== "cerrado");
  const porCobrar = enCurso.reduce((a, p) => a + p.valor, 0);

  const filas = [
    ...r.porPersona.map((x, i) => ({ id: x.persona.id, nombre: x.persona.nombre, total: x.total, trabajo: x.trabajo, socio: x.socio, horas: x.horas, color: colorPersona(i) })),
    { id: EMPRESA, nombre: "Arata San (empresa)", total: r.empresaProyectos, trabajo: 0, socio: r.empresaProyectos, horas: 0, color: COLOR_EMPRESA },
  ];
  const maxFila = Math.max(1, ...filas.map((f) => f.total));

  const meses = todo.porMes.slice(-6).map((m) => ({ etiqueta: nombreMes(m.mes), valor: m.ganancia }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-fog">
          {r.cerrados} {r.cerrados === 1 ? "proyecto cerrado" : "proyectos cerrados"} {periodo === "mes" ? "este mes" : periodo === "anio" ? "este año" : "en total"}
        </p>
        <Segmentado etiqueta="Periodo" opciones={periodos} valor={periodo} onChange={setPeriodo} />
      </div>

      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {[
          { k: "Ventas (proyectos cerrados)", v: pesos(r.ingresos), n: `${pesos(porCobrar)} en proyectos abiertos`, icon: TrendingUp, glass: true },
          { k: "Gastos de proyectos", v: pesos(r.gastosProyectos), n: r.ingresos ? `${porcentaje(r.promedio.gastosPct, 0)} de las ventas` : "—", icon: HandCoins },
          { k: "Ganancia", v: pesos(r.ganancia), n: `margen ${porcentaje(r.margenPct, 0)}`, icon: Scale },
          { k: "Fondos de Arata", v: pesos(todo.fondos), n: `${pesos(todo.disponible)} disponibles para invertir`, icon: PiggyBank },
        ].map((k) => (
          <article key={k.k} className={cn("v2-card p-4 sm:p-5", k.glass && "v2-glass")}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-fog sm:text-sm">{k.k}</p>
              <k.icon aria-hidden className={cn("h-4 w-4", k.glass ? "text-lime" : "text-brand-soft")} />
            </div>
            <p className="mt-3 font-display text-[clamp(1.35rem,2.4vw,1.85rem)] font-bold leading-none tracking-heading text-white">{k.v}</p>
            <p className="mt-2 text-xs text-fog-dim">{k.n}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Tarjeta titulo="Cuánto le toca a cada uno" bajada="Bolsa por horas + porcentaje de socio, de los proyectos cerrados">
          <ul className="space-y-4">
            {filas.map((f) => {
              const esYo = f.id === datos.miPersonaId;
              return (
                <li key={f.id}>
                  <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2 text-white">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: f.color }} />
                      {f.nombre}
                      {esYo && <Pill tono="lima">Tú</Pill>}
                    </span>
                    <span className="font-display font-bold text-white">{pesos(f.total)}</span>
                  </div>
                  <div className="flex h-2.5 overflow-hidden rounded-full bg-white/6" aria-hidden>
                    <div className="h-full" style={{ width: `${(Math.max(0, f.socio) / maxFila) * 100}%`, background: f.color }} />
                    <div className="h-full opacity-50" style={{ width: `${(Math.max(0, f.trabajo) / maxFila) * 100}%`, background: f.color }} />
                  </div>
                  {f.id !== EMPRESA && (
                    <p className="mt-1 text-[0.72rem] text-fog-dim">
                      Socio {pesos(f.socio)} · Trabajo {pesos(f.trabajo)} ({numero(f.horas)} h)
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </Tarjeta>

        <Tarjeta titulo="Fondos de la empresa" bajada="Todo lo que le ha tocado a Arata menos sus gastos">
          <div className="flex items-center gap-5">
            <Anillo
              valor={todo.reserva ? Math.min(todo.fondos, todo.reserva) : todo.fondos > 0 ? 1 : 0}
              max={todo.reserva || 1}
              centro={pesosCorto(Math.max(0, todo.fondos))}
              bajada="en fondos"
              color={todo.fondos >= todo.reserva ? "#B6FF00" : "#7D53FF"}
            />
            <p className="text-sm text-fog">
              {todo.fondos >= todo.reserva ? (
                <>
                  La reserva de <strong className="text-white">{datos.config.reservaMeses} meses</strong> está cubierta. Hay <strong className="text-lime">{pesos(todo.disponible)}</strong> para invertir.
                </>
              ) : (
                <>
                  Faltan <strong className="text-white">{pesos(todo.reserva - todo.fondos)}</strong> para completar la reserva de {datos.config.reservaMeses} meses de gastos fijos.
                </>
              )}
            </p>
          </div>
          <dl className="mt-5 space-y-2 border-t border-white/6 pt-4 text-sm">
            {[
              { k: "Le ha tocado a Arata (proyectos)", v: todo.empresaProyectos, signo: "" },
              { k: "Gastos e inversiones de la empresa", v: -todo.gastosEmpresa, signo: "" },
              { k: "Fondos", v: todo.fondos, fuerte: true },
              { k: `Reserva (${datos.config.reservaMeses} meses de gastos fijos)`, v: -todo.reserva },
              { k: "Disponible para invertir", v: todo.disponible, fuerte: true, lima: true },
            ].map((x) => (
              <div key={x.k} className="flex justify-between gap-3">
                <dt className={cn(x.fuerte ? "font-semibold text-white" : "text-fog")}>{x.k}</dt>
                <dd className={cn("tabular-nums", x.lima ? "font-display font-bold text-lime" : x.fuerte ? "font-display font-bold text-white" : "text-fog")}>{pesos(x.v)}</dd>
              </div>
            ))}
          </dl>
        </Tarjeta>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Tarjeta titulo="Ganancia por mes" bajada="Últimos 6 meses con proyectos cerrados">
          {meses.length ? <BarrasVerticales puntos={meses} formato={pesosCorto} /> : <p className="py-8 text-center text-sm text-fog">Todavía no hay proyectos cerrados.</p>}
        </Tarjeta>

        <Tarjeta titulo="Punto de equilibrio" bajada="Para cubrir los gastos fijos de la empresa">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-frame bg-lime/10">
              <Target aria-hidden className="h-6 w-6 text-lime" />
            </span>
            <div>
              {todo.fijosMes === 0 ? (
                <p className="text-sm text-fog">Registra los gastos fijos mensuales en la pestaña Gastos para calcularlo.</p>
              ) : eq.equilibrio === null ? (
                <p className="text-sm text-fog">Con los porcentajes actuales a la empresa no le queda nada por proyecto. Revisa el reparto.</p>
              ) : (
                <>
                  <p className="font-display text-3xl font-bold leading-none text-white">
                    {eq.equilibrio} {eq.equilibrio === 1 ? "proyecto" : "proyectos"} <span className="text-base font-semibold text-fog">al mes</span>
                  </p>
                  <p className="mt-2 text-sm text-fog">
                    Gastos fijos: <strong className="text-white">{pesos(todo.fijosMes)}</strong> al mes. Cada proyecto promedio ({pesosCorto(todo.promedio.valor || 2_000_000)}) le deja a Arata{" "}
                    <strong className="text-white">{pesos(eq.empresaPorProyecto)}</strong>.
                  </p>
                </>
              )}
              <button type="button" onClick={() => irA("proyeccion")} className="mt-3 text-sm font-semibold text-brand-soft hover:text-white">
                Hacer una proyección →
              </button>
            </div>
          </div>
        </Tarjeta>
      </div>

      <p className="flex items-center justify-center gap-2 pb-2 text-center text-xs text-fog-dim">
        <Landmark aria-hidden className="h-3.5 w-3.5" /> Valores en pesos colombianos. Solo cuentan los proyectos cerrados.
      </p>
    </div>
  );
}

// ── Proyección ──────────────────────────────────────────────────────
function ProyeccionFin({ datos }: { datos: DatosFinanzas }) {
  const todo = useMemo(() => resumenFinanzas(datos), [datos]);
  const [proyectosMes, setProyectosMes] = useState(3);
  const [valor, setValor] = useState(Math.round(todo.promedio.valor) || 2_000_000);
  const [gastosPct, setGastosPct] = useState(Math.round(todo.promedio.gastosPct) || 10);
  const [meta, setMeta] = useState(5_000_000);
  const part = useMemo(() => participacionHistorica(datos.horas), [datos.horas]);
  const base = { valorPromedio: valor, gastosPct, reglas: datos.config, personas: datos.personas, fijosMes: todo.fijosMes, participacionHoras: part };
  const p = proyectar({ ...base, proyectosMes });
  const filas = [1, 2, 3, 4, 5, 6, 8, 10].map((n) => ({ n, ...proyectar({ ...base, proyectosMes: n }) }));
  const falta = Math.max(0, meta - todo.disponible);
  const mesesMeta = falta === 0 ? 0 : p.empresaNeta > 0 ? Math.ceil(falta / p.empresaNeta) : null;
  const fmt = new Intl.NumberFormat("es-CO");

  return (
    <div className="space-y-4">
      <Tarjeta titulo="Supón un mes así" bajada="Cambia los valores y mira el resultado al instante. No se guarda nada.">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <span className="mb-1.5 flex justify-between text-xs font-medium text-fog">
              Proyectos al mes <strong className="font-display text-base text-white">{proyectosMes}</strong>
            </span>
            <input type="range" min={0} max={12} value={proyectosMes} onChange={(e) => setProyectosMes(Number(e.target.value))} className="w-full accent-[#B6FF00]" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-fog">Valor promedio por proyecto</span>
            <input value={fmt.format(valor)} inputMode="numeric" onChange={(e) => setValor(Number(e.target.value.replace(/\D/g, "").slice(0, 11)) || 0)} className="pn-input tabular-nums" />
          </label>
          <label className="block">
            <span className="mb-1.5 flex justify-between text-xs font-medium text-fog">
              Gastos por proyecto <strong className="text-white">{gastosPct} %</strong>
            </span>
            <input type="range" min={0} max={80} value={gastosPct} onChange={(e) => setGastosPct(Number(e.target.value))} className="w-full accent-[#7D53FF]" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-fog">Meta de inversión de Arata</span>
            <input value={fmt.format(meta)} inputMode="numeric" onChange={(e) => setMeta(Number(e.target.value.replace(/\D/g, "").slice(0, 11)) || 0)} className="pn-input tabular-nums" />
          </label>
        </div>
        <p className="mt-3 text-xs text-fog-dim">
          Valores de arranque: promedio de los proyectos cerrados. La bolsa de trabajo se reparte según cómo se han repartido las horas hasta hoy.
        </p>
      </Tarjeta>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Tarjeta titulo={`Con ${proyectosMes} ${proyectosMes === 1 ? "proyecto" : "proyectos"} al mes`}>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { k: "Ventas", v: p.ingresos },
              { k: "Gastos", v: p.gastos },
              { k: "Ganancia", v: p.ganancia },
            ].map((x) => (
              <div key={x.k} className="rounded-frame border border-white/6 bg-surface-2/60 p-3">
                <dt className="text-[0.72rem] text-fog-dim">{x.k}</dt>
                <dd className="mt-1 font-display text-lg font-bold text-white">{pesosCorto(x.v)}</dd>
              </div>
            ))}
          </dl>
          <ul className="mt-5 divide-y divide-white/6">
            {p.porPersona.map((x, i) => (
              <li key={x.persona.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="flex items-center gap-2 text-white">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: colorPersona(i) }} />
                  {x.persona.nombre}
                  {x.persona.id === datos.miPersonaId && <Pill tono="lima">Tú</Pill>}
                </span>
                <span className="text-right">
                  <span className="block font-display font-bold text-white">{pesos(x.total)}</span>
                  <span className="block text-[0.7rem] text-fog-dim">socio {pesosCorto(x.socio)} · trabajo {pesosCorto(x.trabajo)}</span>
                </span>
              </li>
            ))}
            <li className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="flex items-center gap-2 text-white">
                <span className="h-2.5 w-2.5 rounded-full bg-lime" /> Arata San (empresa)
              </span>
              <span className="text-right">
                <span className="block font-display font-bold text-white">{pesos(p.empresa)}</span>
                <span className={cn("block text-[0.7rem]", p.empresaNeta >= 0 ? "text-lime" : "text-[#FF9BB0]")}>
                  {p.empresaNeta >= 0 ? "le quedan" : "le faltan"} {pesos(Math.abs(p.empresaNeta))} después de gastos fijos
                </span>
              </span>
            </li>
          </ul>
        </Tarjeta>

        <div className="space-y-4">
          <Tarjeta titulo="Punto de equilibrio">
            {todo.fijosMes === 0 ? (
              <p className="text-sm text-fog">Registra los gastos fijos mensuales (pestaña Gastos) para calcularlo.</p>
            ) : p.equilibrio === null ? (
              <p className="text-sm text-fog">Con estos valores a la empresa no le queda nada por proyecto.</p>
            ) : (
              <p className="text-sm text-fog">
                Se necesitan <strong className="font-display text-2xl text-lime">{p.equilibrio}</strong> proyectos al mes para cubrir {pesos(todo.fijosMes)} de gastos fijos.
                {proyectosMes >= (p.equilibrio ?? 0) ? " Con este ritmo ya se cubren." : ` Faltan ${(p.equilibrio ?? 0) - proyectosMes} al mes.`}
              </p>
            )}
          </Tarjeta>
          <Tarjeta titulo="Meta de inversión">
            <p className="text-sm text-fog">
              Disponible hoy: <strong className="text-white">{pesos(todo.disponible)}</strong>.{" "}
              {mesesMeta === 0 ? (
                <span className="text-lime">La meta ya está cubierta.</span>
              ) : mesesMeta === null ? (
                "Con este ritmo la empresa no ahorra: no se llega a la meta."
              ) : (
                <>
                  Con este ritmo se llega a {pesos(meta)} en <strong className="font-display text-xl text-lime">{mesesMeta}</strong> {mesesMeta === 1 ? "mes" : "meses"}.
                </>
              )}
            </p>
          </Tarjeta>
        </div>
      </div>

      <Tarjeta titulo="¿Cuántos proyectos necesitamos?" bajada="Resultado por mes según la cantidad de proyectos">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/8 text-xs text-fog-dim">
                <th className="py-2.5 pr-3 font-medium">Proyectos</th>
                <th className="py-2.5 pr-3 text-right font-medium">Ganancia</th>
                {datos.personas.filter((x) => x.activo).map((x) => (
                  <th key={x.id} className="py-2.5 pr-3 text-right font-medium">{x.nombre}</th>
                ))}
                <th className="py-2.5 text-right font-medium">Arata neto</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.n} className={cn("border-b border-white/6 last:border-0", f.n === proyectosMes && "bg-brand/10")}>
                  <td className="py-2.5 pr-3 font-display font-bold text-white">
                    {f.n}
                    {p.equilibrio !== null && f.n === p.equilibrio && <Pill tono="lima" className="ml-2">equilibrio</Pill>}
                  </td>
                  <td className="py-2.5 pr-3 text-right tabular-nums text-fog">{pesosCorto(f.ganancia)}</td>
                  {f.porPersona.map((x) => (
                    <td key={x.persona.id} className="py-2.5 pr-3 text-right tabular-nums text-white">{pesosCorto(x.total)}</td>
                  ))}
                  <td className={cn("py-2.5 text-right tabular-nums font-semibold", f.empresaNeta >= 0 ? "text-lime" : "text-[#FF9BB0]")}>{pesosCorto(f.empresaNeta)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Tarjeta>
    </div>
  );
}
