"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Calendar, Plus } from "lucide-react";
import { nombreCliente, type DatosFinanzas, type FinProyecto } from "@/lib/panel/finanzas/tipos";
import { avance, estaEntregado, etapas, etiquetaEtapa } from "@/lib/panel/finanzas/procesos";
import { fechaCorta } from "@/lib/panel/formato";
import { Hoja } from "../Clientes";
import { PanelHeader, PanelPage, Pill } from "../ui";
import { AvisoAcceso, BotonPrincipal } from "../finanzas/comun";
import { FormProyecto } from "../finanzas/ProyectosFin";
import { cn } from "@/lib/utils";

// Proyectos de Arata San en grid (D-111): cada tarjeta muestra en qué etapa va,
// el siguiente paso, la fecha de entrega y abajo el avance. Clic → detalle.

type Filtro = "proceso" | "entregados" | "todos";
const comercial = { propuesta: { l: "Propuesta", t: "neutro" }, "en-curso": { l: "En curso", t: "morado" }, cerrado: { l: "Cerrado", t: "lima" } } as const;

export function diasHasta(hoy: string, fecha: string) {
  return Math.round((Date.parse(`${fecha}T12:00:00Z`) - Date.parse(`${hoy}T12:00:00Z`)) / 86_400_000);
}

export default function ProyectosAgencia({ datos, hoy }: { datos: DatosFinanzas; hoy: string }) {
  const [filtro, setFiltro] = useState<Filtro>("proceso");
  const [creando, setCreando] = useState(false);

  const filas = useMemo(
    () =>
      datos.proyectos.map((p) => {
        const base = avance(datos.tareas.filter((t) => t.proyectoId === p.id));
        // Cerrado sin pasos = proyecto viejo ya entregado
        const a = { ...base, entregado: estaEntregado(p.estado, base) };
        const vence = p.fechaLimite && !a.entregado ? diasHasta(hoy, p.fechaLimite) : null;
        return { p, a, vence };
      }),
    [datos, hoy]
  );
  const visibles = filas
    .filter(({ a }) => (filtro === "todos" ? true : filtro === "entregados" ? a.entregado : !a.entregado))
    // Primero lo que vence antes
    .sort((x, y) => (x.vence ?? 9999) - (y.vence ?? 9999));

  const enProceso = filas.filter((f) => !f.a.entregado).length;
  const entregados = filas.filter((f) => f.a.entregado).length;
  const tarde = filas.filter((f) => f.vence !== null && f.vence < 0).length;

  return (
    <PanelPage>
      <PanelHeader
        titulo="Proyectos"
        bajada="En qué etapa va cada trabajo, qué sigue y cuánto falta. Toca un proyecto para ver todo su proceso."
        accion={
          datos.puedeEditar ? (
            <BotonPrincipal type="button" onClick={() => setCreando(true)} className="inline-flex items-center gap-2">
              <Plus aria-hidden className="h-4 w-4" /> Nuevo proyecto
            </BotonPrincipal>
          ) : undefined
        }
      />
      <AvisoAcceso demo={datos.demo} puedeEditar={datos.puedeEditar} texto="Puedes ver todo y marcar los pasos de los proyectos. Crear, editar o quitar pasos es solo de Sergio." />

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { k: "En proceso", v: enProceso },
          { k: "Entregados", v: entregados },
          { k: "Van tarde", v: tarde, alerta: tarde > 0 },
        ].map((x) => (
          <div key={x.k} className="v2-card p-4 sm:p-5">
            <p className="text-xs text-fog">{x.k}</p>
            <p className={cn("mt-2 font-display text-[clamp(1.4rem,2.6vw,1.9rem)] font-bold leading-none", x.alerta ? "text-[#FF9BB0]" : "text-white")}>{x.v}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar proyectos">
        {[
          { v: "proceso" as const, l: `En proceso (${enProceso})` },
          { v: "entregados" as const, l: `Entregados (${entregados})` },
          { v: "todos" as const, l: `Todos (${filas.length})` },
        ].map((f) => (
          <button
            key={f.v}
            type="button"
            aria-pressed={filtro === f.v}
            onClick={() => setFiltro(f.v)}
            className={cn("h-9 rounded-full border px-3.5 text-xs font-semibold", filtro === f.v ? "border-brand bg-brand/20 text-white" : "border-white/10 text-fog hover:text-white")}
          >
            {f.l}
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <div className="v2-card py-14 text-center">
          <p className="text-sm text-fog">{datos.proyectos.length ? "No hay proyectos en este filtro." : "Todavía no hay proyectos."}</p>
          {datos.puedeEditar && !datos.proyectos.length && <p className="mt-1 text-xs text-fog-dim">Crea el primero: el proceso se arma solo según el servicio.</p>}
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {visibles.map(({ p, a, vence }) => (
            <li key={p.id}>
              <TarjetaProyecto p={p} a={a} vence={vence} datos={datos} />
            </li>
          ))}
        </ul>
      )}

      {creando && (
        <Hoja titulo="Nuevo proyecto" onClose={() => setCreando(false)}>
          <FormProyecto datos={datos} hoy={hoy} onListo={() => setCreando(false)} />
        </Hoja>
      )}
    </PanelPage>
  );
}

function TarjetaProyecto({ p, a, vence, datos }: { p: FinProyecto; a: ReturnType<typeof avance>; vence: number | null; datos: DatosFinanzas }) {
  const cliente = datos.clientes.find((c) => c.id === p.clienteId);
  const servicio = datos.servicios.find((s) => s.id === p.servicioId);
  const actual = etapas.findIndex((e) => e.valor === a.etapaActual);
  return (
    <Link
      href={`/panel/proyectos/${p.id}`}
      className={cn("v2-card group flex h-full flex-col p-4 transition-colors hover:border-white/16 sm:p-5", a.entregado && "opacity-80")}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-brand-soft">{servicio?.nombre ?? "Sin servicio"}</p>
        <Pill tono={comercial[p.estado].t}>{comercial[p.estado].l}</Pill>
      </div>
      <h2 className="mt-2 font-display text-lg font-bold leading-tight tracking-heading text-white group-hover:text-lime">{p.nombre}</h2>
      <p className="mt-0.5 truncate text-sm text-fog">{nombreCliente(cliente)}</p>

      {/* Etapa actual */}
      <div className="mt-4 flex items-center gap-2">
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", a.entregado ? "bg-lime text-ink" : a.etapaActual ? "bg-brand/20 text-white" : "bg-white/5 text-fog")}>
          {etiquetaEtapa(a.etapaActual, a.entregado)}
        </span>
        {!a.entregado && a.siguiente && <span className="truncate text-xs text-fog-dim">Sigue: {a.siguiente}</span>}
      </div>

      {/* Etapas */}
      <ol className="mt-3 grid grid-cols-5 gap-1" aria-label="Etapas">
        {a.porEtapa.map((e, i) => (
          <li key={e.valor} title={`${e.label}: ${e.hechas}/${e.total}`}>
            <span
              className={cn(
                "block h-1.5 rounded-full",
                e.total === 0 ? "bg-white/5" : e.completa ? "bg-lime" : i === actual ? "bg-brand" : "bg-white/12"
              )}
            />
            <span className={cn("mt-1 block truncate text-[0.62rem]", i === actual && !a.entregado ? "text-white" : "text-fog-dim")}>{e.label}</span>
          </li>
        ))}
      </ol>

      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between text-xs">
          {p.fechaLimite ? (
            <span className={cn("inline-flex items-center gap-1", vence !== null && vence < 0 ? "text-[#FF9BB0]" : "text-fog-dim")}>
              <Calendar aria-hidden className="h-3.5 w-3.5" />
              {a.entregado ? `Entrega ${fechaCorta(p.fechaLimite)}` : vence === null ? fechaCorta(p.fechaLimite) : vence < 0 ? `Venció hace ${-vence} ${vence === -1 ? "día" : "días"}` : vence === 0 ? "Se entrega hoy" : `Faltan ${vence} ${vence === 1 ? "día" : "días"}`}
            </span>
          ) : (
            <span className="text-fog-dim">Sin fecha de entrega</span>
          )}
          <span className="font-display font-bold text-white">{a.pct} %</span>
        </div>
        {/* Avance */}
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/6" role="progressbar" aria-valuenow={a.pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Avance de ${p.nombre}`}>
          <div className="h-full origin-left rounded-full transition-transform duration-700" style={{ transform: `scaleX(${a.pct / 100})`, background: a.entregado ? "#B6FF00" : "#7D53FF" }} />
        </div>
        <p className="mt-1.5 text-[0.7rem] text-fog-dim">{a.total ? `${a.hechas} de ${a.total} pasos` : "Sin pasos todavía"}</p>
      </div>
    </Link>
  );
}
