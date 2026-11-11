"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Calendar, Camera, Eye, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { nombreCliente, type DatosFinanzas } from "@/lib/panel/finanzas/tipos";
import { etiquetaEtapa } from "@/lib/panel/finanzas/procesos";
import type { ClienteAgencia } from "@/lib/panel/clientes/datos";
import { resumenAgencia, type PeriodoResumen } from "@/lib/panel/resumen/agencia";
import { fechaCorta, numero, pesos, pesosCorto, porcentaje } from "@/lib/panel/formato";
import { Anillo, BarrasHorizontales, Embudo, GraficoArea } from "./graficos";
import { Delta, PanelHeader, PanelPage, Pill, Tarjeta } from "./ui";
import { Segmentado } from "./Resumen";
import { cn } from "@/lib/utils";

// Resumen de Arata San con datos reales (D-114).
// Venta = proyecto cerrado. Visitas e Instagram quedan marcados como pendientes
// hasta conectar Google Analytics y Meta (no se muestran números inventados).

const periodos: { valor: PeriodoResumen; label: string }[] = [
  { valor: 30, label: "30 días" },
  { valor: 90, label: "90 días" },
  { valor: 365, label: "1 año" },
];
const mesesCortos = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export default function ResumenAgencia({ datos, clientes, hoy, nombre }: { datos: DatosFinanzas; clientes: ClienteAgencia[]; hoy: string; nombre: string }) {
  const [periodo, setPeriodo] = useState<PeriodoResumen>(30);
  const r = useMemo(() => resumenAgencia(datos, clientes, hoy, periodo), [datos, clientes, hoy, periodo]);
  const serie = r.meses.map((m) => ({ etiqueta: `${mesesCortos[Number(m.mes.slice(5)) - 1]} ${m.mes.slice(2, 4)}`, valor: m.ventas }));
  const textoPeriodo = periodo === 365 ? "el último año" : `los últimos ${periodo} días`;
  const vacio = datos.proyectos.length === 0 && clientes.length === 0;

  return (
    <PanelPage>
      <PanelHeader
        titulo={<>Hola, {nombre}</>}
        bajada={<>Así le fue a Arata San en {textoPeriodo}, comparado con el periodo anterior.</>}
        accion={<Segmentado etiqueta="Periodo" opciones={periodos} valor={periodo} onChange={setPeriodo} />}
      />

      {vacio && (
        <div className="rounded-frame border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand-soft">
          Todavía no hay datos. Agrega tus <Link href="/panel/clientes" className="font-semibold text-white underline">clientes</Link> y tus{" "}
          <Link href="/panel/proyectos" className="font-semibold text-white underline">proyectos</Link>, y este resumen se llena solo.
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {[
          { k: "Ventas", v: pesos(r.ventas), d: r.deltaVentas, n: `${r.proyectosVendidos} ${r.proyectosVendidos === 1 ? "proyecto cerrado" : "proyectos cerrados"}`, icon: ShoppingBag, glass: true },
          { k: "Ganancia", v: pesos(r.ganancia), d: r.deltaGanancia, n: r.ventas ? `margen ${porcentaje(r.margen, 0)}` : "sin ventas en el periodo", icon: TrendingUp },
          { k: "Clientes nuevos", v: numero(r.clientesNuevos), d: r.deltaClientes, n: `${numero(clientes.length)} en total`, icon: Users },
          { k: "Proyectos en proceso", v: numero(r.enProceso), d: undefined, n: r.tarde ? `${r.tarde} ${r.tarde === 1 ? "va" : "van"} tarde` : "ninguno va tarde", icon: Calendar, alerta: r.tarde > 0 },
        ].map((k) => (
          <article key={k.k} className={cn("v2-card flex flex-col p-4 sm:p-5", k.glass && "v2-glass")}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-fog sm:text-sm">{k.k}</p>
              <k.icon aria-hidden className={cn("h-4 w-4", k.glass ? "text-lime" : "text-brand-soft")} />
            </div>
            <p className="mt-3 font-display text-[clamp(1.4rem,2.6vw,2rem)] font-bold leading-none tracking-heading text-white">{k.v}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {k.d !== undefined && <Delta valor={k.d} />}
              <span className={cn("text-xs", k.alerta ? "text-[#FF9BB0]" : "text-fog-dim")}>{k.n}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <Tarjeta titulo="Cómo van las ventas" bajada="Proyectos cerrados por mes · últimos 12 meses">
          {r.meses.some((m) => m.ventas > 0) ? (
            <GraficoArea puntos={serie} formato={pesos} formatoEje={pesosCorto} etiqueta="Ventas por mes de los últimos 12 meses" />
          ) : (
            <p className="py-16 text-center text-sm text-fog">Cuando cierres proyectos, aquí verás las ventas de cada mes.</p>
          )}
          <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-white/6 pt-4">
            {[
              { k: "En curso por cobrar", v: pesosCorto(r.porCobrar) },
              { k: "Propuestas abiertas", v: `${r.propuestas.length} · ${pesosCorto(r.propuestas.reduce((a, p) => a + p.valor, 0))}` },
              { k: "Ticket promedio", v: r.proyectosVendidos ? pesosCorto(r.ventas / r.proyectosVendidos) : "—" },
            ].map((s) => (
              <div key={s.k} className="min-w-0">
                <dt className="truncate text-[0.7rem] text-fog-dim sm:text-xs">{s.k}</dt>
                <dd className="mt-0.5 truncate font-display text-sm font-bold text-white sm:text-base">{s.v}</dd>
              </div>
            ))}
          </dl>
        </Tarjeta>

        <Tarjeta titulo="Clientes que compran" bajada="De todos tus clientes, cuántos ya te compraron">
          <div className="flex items-center gap-5">
            <Anillo key={periodo} valor={r.tasa} max={100} centro={porcentaje(r.tasa, 0)} bajada="compran" />
            <p className="text-sm text-fog">
              De cada <strong className="text-white">10 clientes</strong>, <strong className="text-lime">{Math.round(r.tasa / 10)}</strong> ya cerraron un proyecto con Arata.
            </p>
          </div>
          <div className="mt-6">
            <Embudo
              pasos={[
                { nombre: "Clientes", valor: r.embudo.clientes, formato: numero(r.embudo.clientes) },
                { nombre: "Con propuesta o proyecto", valor: r.embudo.conProyecto, formato: numero(r.embudo.conProyecto) },
                { nombre: "Compraron", valor: r.embudo.compraron, formato: numero(r.embudo.compraron) },
              ]}
            />
          </div>
        </Tarjeta>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Tarjeta titulo="Proyectos en proceso" bajada="Los que se entregan primero arriba" accion={<Link href="/panel/proyectos" className="text-xs font-semibold text-brand-soft hover:text-white">Ver todos →</Link>}>
          {r.abiertos.length === 0 ? (
            <p className="py-6 text-center text-sm text-fog">No hay proyectos en proceso.</p>
          ) : (
            <ul className="space-y-3">
              {r.abiertos.slice(0, 5).map(({ p, a, vence }) => (
                <li key={p.id}>
                  <Link href={`/panel/proyectos/${p.id}`} className="block rounded-frame border border-white/6 bg-surface-2/50 p-3 hover:border-white/16">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-medium text-white">{p.nombre}</span>
                      <span className="shrink-0 font-display text-sm font-bold text-white">{a.pct} %</span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-2 text-[0.7rem]">
                      <span className="truncate text-fog-dim">{etiquetaEtapa(a.etapaActual, a.entregado)}</span>
                      {vence !== null && <span className={vence < 0 ? "text-[#FF9BB0]" : "text-fog-dim"}>{vence < 0 ? `venció hace ${-vence} d` : vence === 0 ? "se entrega hoy" : `faltan ${vence} d`}</span>}
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/6">
                      <div className="h-full origin-left rounded-full bg-brand" style={{ transform: `scaleX(${a.pct / 100})` }} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>

        <Tarjeta titulo="De dónde llegan tus clientes" bajada="Todos los clientes · cuántos compraron">
          {r.origenes.length ? (
            <BarrasHorizontales items={r.origenes.map((o) => ({ nombre: o.origen, valor: o.clientes, detalle: `${o.compraron} compraron` }))} formato={numero} />
          ) : (
            <p className="py-6 text-center text-sm text-fog">Sin clientes todavía.</p>
          )}
        </Tarjeta>

        <Tarjeta titulo="Lo que más se vende" bajada={`Servicios · ${textoPeriodo}`} className="lg:col-span-2 xl:col-span-1">
          {r.servicios.length ? (
            <BarrasHorizontales items={r.servicios.map((s) => ({ nombre: s.nombre, valor: s.ventas, detalle: `${s.proyectos} ${s.proyectos === 1 ? "proyecto" : "proyectos"}` }))} formato={pesosCorto} />
          ) : (
            <p className="py-6 text-center text-sm text-fog">Sin ventas en {textoPeriodo}.</p>
          )}
        </Tarjeta>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Tarjeta titulo="Últimas ventas">
          {r.ultimas.length === 0 ? (
            <p className="py-6 text-center text-sm text-fog">Todavía no hay proyectos cerrados.</p>
          ) : (
            <ul className="divide-y divide-white/6">
              {r.ultimas.map((p) => {
                const c = datos.clientes.find((x) => x.id === p.clienteId);
                const s = datos.servicios.find((x) => x.id === p.servicioId);
                return (
                  <li key={p.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 font-display text-sm font-bold text-brand-soft">
                      {(c?.empresa ?? c?.nombre ?? "?").slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{nombreCliente(c)}</p>
                      <p className="truncate text-xs text-fog-dim">{s?.nombre ?? p.nombre} · {fechaCorta(p.fechaCierre!)}</p>
                    </div>
                    <p className="font-display text-sm font-bold text-white">{pesos(p.valor)}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </Tarjeta>

        <Tarjeta titulo="Visitas al sitio e Instagram" accion={<Pill>Pendiente</Pill>}>
          <ul className="space-y-3 text-sm text-fog">
            <li className="flex items-start gap-3">
              <Eye aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-brand-soft" />
              <span><strong className="text-white">Visitas de aratasan.com</strong>: se traen de Google Analytics cuando conectemos el flujo de n8n.</span>
            </li>
            <li className="flex items-start gap-3">
              <Camera aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-brand-soft" />
              <span><strong className="text-white">Visualizaciones de @arata.san.web</strong>: se traen de Meta (Instagram) en el mismo flujo.</span>
            </li>
          </ul>
          <p className="mt-4 text-xs text-fog-dim">Mientras tanto no mostramos números inventados.</p>
        </Tarjeta>
      </div>
    </PanelPage>
  );
}
