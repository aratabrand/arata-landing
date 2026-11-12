"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Check, Clock, Plus, Trash2, Wallet } from "lucide-react";
import { nombreCliente, type DatosFinanzas, type FinProyecto } from "@/lib/panel/finanzas/tipos";
import { avance, etapas, etiquetaEtapa, type Etapa } from "@/lib/panel/finanzas/procesos";
import { fechaCorta, pesos } from "@/lib/panel/formato";
import { agregarPaso, borrarPaso, cargarProceso, marcarPaso } from "@/app/(panel)/panel/(app)/finanzas/acciones";
import { Hoja } from "../Clientes";
import { PanelPage, Pill, Tarjeta } from "../ui";
import { AvisoAcceso, BotonPrincipal, BotonSecundario, MensajeError, nombreDe, useAccion } from "../finanzas/comun";
import { FormProyecto } from "../finanzas/ProyectosFin";
import { diasHasta } from "./ProyectosAgencia";
import { cn } from "@/lib/utils";

// Detalle de un proyecto de Arata (D-112): proceso por etapas con sus pasos,
// avance, fechas, cliente, servicio y días trabajados. Sergio y Andrés editan; todos marcan pasos.

const comercial = { propuesta: { l: "Propuesta", t: "neutro" }, "en-curso": { l: "En curso", t: "morado" }, cerrado: { l: "Cerrado", t: "lima" } } as const;
const diasTxt = (d: number) => `${String(Math.round(d * 10) / 10).replace(".", ",")} ${d === 1 ? "día" : "días"}`;

export default function DetalleProyectoAgencia({ datos, p, hoy }: { datos: DatosFinanzas; p: FinProyecto; hoy: string }) {
  const [editando, setEditando] = useState(false);
  const acc = useAccion();
  const tareas = datos.tareas.filter((t) => t.proyectoId === p.id);
  const a = avance(tareas);
  const actual = etapas.findIndex((e) => e.valor === a.etapaActual);
  const cliente = datos.clientes.find((c) => c.id === p.clienteId);
  const servicio = datos.servicios.find((s) => s.id === p.servicioId);
  const vence = p.fechaLimite && !a.entregado ? diasHasta(hoy, p.fechaLimite) : null;
  const edita = datos.puedeEditar;

  const horasPor = new Map<string, number>();
  datos.trabajo.filter((h) => h.proyectoId === p.id).forEach((h) => horasPor.set(h.personaId, (horasPor.get(h.personaId) ?? 0) + h.dias));

  return (
    <PanelPage>
      <Link href="/panel/proyectos" className="inline-flex h-10 items-center gap-2 text-sm text-fog hover:text-white">
        <ArrowLeft aria-hidden className="h-4 w-4" /> Proyectos
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-brand-soft">{servicio?.nombre ?? "Sin servicio"}</p>
          <h1 className="mt-1 font-display text-[clamp(1.6rem,3.2vw,2.4rem)] font-bold leading-[1.05] tracking-heading text-white">{p.nombre}</h1>
          <p className="mt-1 text-fog">{nombreCliente(cliente)}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill tono={comercial[p.estado].t}>{comercial[p.estado].l}</Pill>
            <Pill tono={a.entregado ? "lima" : "morado"}>{etiquetaEtapa(a.etapaActual, a.entregado)}</Pill>
            {vence !== null && vence < 0 && <Pill tono="alerta">Va tarde</Pill>}
          </div>
        </div>
        {edita && (
          <BotonSecundario type="button" onClick={() => setEditando(true)} className="h-11 shrink-0">
            Editar proyecto
          </BotonSecundario>
        )}
      </div>
      <AvisoAcceso demo={datos.demo} puedeEditar={datos.puedeEditar} texto="Puedes ver todo y marcar los pasos de los proyectos. Crear, editar o quitar pasos es de Sergio y Andrés." />

      {/* Proceso */}
      <Tarjeta titulo="Proceso" bajada={a.entregado ? "Todos los pasos están hechos." : a.siguiente ? `Sigue: ${a.siguiente}` : undefined}>
        <ol className="grid grid-cols-5 gap-1.5 sm:gap-3">
          {a.porEtapa.map((e, i) => {
            const on = i === actual && !a.entregado;
            return (
              <li key={e.valor} className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                      e.completa ? "border-lime bg-lime text-ink" : on ? "border-brand bg-brand text-white" : "border-white/12 text-fog-dim",
                      e.total === 0 && "opacity-40"
                    )}
                  >
                    {e.completa ? <Check aria-hidden className="h-4 w-4" strokeWidth={3} /> : i + 1}
                  </span>
                  <span className={cn("hidden h-px flex-1 sm:block", e.completa ? "bg-lime/60" : "bg-white/10")} aria-hidden />
                </div>
                <p className={cn("mt-2 truncate text-xs font-semibold sm:text-sm", on ? "text-white" : e.completa ? "text-lime" : "text-fog")}>{e.label}</p>
                <p className="text-[0.68rem] text-fog-dim">{e.total ? `${e.hechas}/${e.total}` : "—"}</p>
              </li>
            );
          })}
        </ol>
        <div className="mt-5">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-fog">{a.total ? `${a.hechas} de ${a.total} pasos` : "Sin pasos"}</span>
            <span className="font-display text-xl font-bold text-white">{a.pct} %</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/6" role="progressbar" aria-valuenow={a.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Avance del proyecto">
            <div className="h-full origin-left rounded-full transition-transform duration-700" style={{ transform: `scaleX(${a.pct / 100})`, background: a.entregado ? "#B6FF00" : "#7D53FF" }} />
          </div>
        </div>
        {a.total === 0 && edita && (
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-frame border border-white/8 bg-surface-2/60 p-4">
            <p className="flex-1 text-sm text-fog">Este proyecto no tiene pasos.</p>
            <BotonPrincipal type="button" pendiente={acc.pendiente} onClick={() => acc.correr(() => cargarProceso(p.id))}>
              Cargar el proceso de {servicio?.nombre ?? "su servicio"}
            </BotonPrincipal>
          </div>
        )}
        <MensajeError error={acc.error} />
      </Tarjeta>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Tarjeta titulo="Pasos por etapa">
          <div className="space-y-5">
            {etapas.map((e, i) => (
              <EtapaPasos
                key={e.valor}
                etapa={e.valor}
                label={e.label}
                numero={i + 1}
                proyectoId={p.id}
                tareas={tareas.filter((t) => t.etapa === e.valor).sort((x, y) => x.orden - y.orden)}
                edita={edita}
                marca={datos.puedeMarcarPasos}
                personas={datos.personas}
                actual={i === actual && !a.entregado}
              />
            ))}
          </div>
        </Tarjeta>

        <div className="space-y-4">
          <Tarjeta titulo="Datos del proyecto">
            <dl className="space-y-2.5 text-sm">
              {[
                { k: "Cliente", v: nombreCliente(cliente) },
                { k: "Servicio", v: servicio?.nombre ?? "—" },
                { k: "Valor", v: pesos(p.valor) },
                { k: "Inicio", v: p.fechaInicio ? fechaCorta(p.fechaInicio) : "—" },
                {
                  k: "Entrega prometida",
                  v: p.fechaLimite ? `${fechaCorta(p.fechaLimite)}${vence === null ? "" : vence < 0 ? ` · venció hace ${-vence} d` : vence === 0 ? " · hoy" : ` · faltan ${vence} d`}` : "Sin fecha",
                  alerta: vence !== null && vence < 0,
                },
                { k: "Cierre (venta)", v: p.fechaCierre ? fechaCorta(p.fechaCierre) : "Aún no" },
              ].map((x) => (
                <div key={x.k} className="flex justify-between gap-3">
                  <dt className="text-fog-dim">{x.k}</dt>
                  <dd className={cn("text-right", x.alerta ? "text-[#FF9BB0]" : "text-white")}>{x.v}</dd>
                </div>
              ))}
            </dl>
            {p.notas && <p className="mt-4 whitespace-pre-line border-t border-white/8 pt-3 text-sm text-fog">{p.notas}</p>}
          </Tarjeta>

          <Tarjeta titulo="Días trabajados">
            {horasPor.size === 0 ? (
              <p className="text-sm text-fog-dim">Sin días registrados.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {[...horasPor.entries()].map(([id, h]) => (
                  <li key={id} className="flex justify-between">
                    <span className="flex items-center gap-2 text-white"><Clock aria-hidden className="h-4 w-4 text-brand-soft" />{nombreDe(id, datos.personas)}</span>
                    <span className="font-display font-bold text-white">{diasTxt(h)}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/panel/finanzas" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-soft hover:text-white">
              <Wallet aria-hidden className="h-4 w-4" /> Días, gastos y reparto en Finanzas →
            </Link>
          </Tarjeta>
        </div>
      </div>

      {editando && (
        <Hoja titulo={`Editar: ${p.nombre}`} onClose={() => setEditando(false)}>
          <FormProyecto p={p} datos={datos} hoy={hoy} onListo={() => setEditando(false)} />
        </Hoja>
      )}
    </PanelPage>
  );
}

function EtapaPasos({
  etapa,
  label,
  numero,
  proyectoId,
  tareas,
  edita,
  marca,
  personas,
  actual,
}: {
  etapa: Etapa;
  label: string;
  numero: number;
  proyectoId: string;
  tareas: ReturnType<typeof avance>["lista"];
  edita: boolean;
  /** Puede marcar y desmarcar (todo el equipo); agregar y quitar es solo de Sergio. */
  marca: boolean;
  personas: DatosFinanzas["personas"];
  actual: boolean;
}) {
  const acc = useAccion();
  const [nuevo, setNuevo] = useState("");
  const [abierto, setAbierto] = useState(false);
  const agregar = (e: FormEvent) => {
    e.preventDefault();
    if (nuevo.trim().length < 2) return;
    acc.correr(() => agregarPaso({ proyectoId, etapa, texto: nuevo }), () => (setNuevo(""), setAbierto(false)));
  };
  if (!tareas.length && !edita) return null;
  const quien = (id?: string | null) => (id ? personas.find((x) => x.id === id)?.nombre : null);
  return (
    <section>
      <h3 className={cn("mb-2 flex items-center gap-2 text-sm font-semibold", actual ? "text-white" : "text-fog")}>
        <span className="text-xs text-fog-dim">{numero}.</span> {label}
        {actual && <Pill tono="morado">Aquí vas</Pill>}
      </h3>
      {tareas.length > 0 && (
        <ul className="space-y-1.5">
          {tareas.map((t) => (
            <li key={t.id} className="flex items-center gap-2">
              <button
                type="button"
                role="checkbox"
                aria-checked={t.hecha}
                disabled={!marca || acc.pendiente}
                onClick={() => acc.correr(() => marcarPaso(t.id, !t.hecha))}
                className="flex min-h-11 flex-1 items-center gap-3 rounded-btn border border-white/8 bg-surface-1 px-3 text-left text-sm disabled:cursor-default"
              >
                <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-md border", t.hecha ? "border-lime bg-lime text-ink" : "border-white/20")}>
                  {t.hecha && <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block", t.hecha ? "text-fog-dim line-through" : "text-white")}>{t.texto}</span>
                  {t.hecha && (quien(t.hechaPor) || t.hechaEn) && (
                    <span className="block text-[0.68rem] text-fog-dim">
                      {quien(t.hechaPor) ? `Lo marcó ${quien(t.hechaPor)}` : "Hecho"}
                      {t.hechaEn ? ` · ${fechaCorta(t.hechaEn)}` : ""}
                    </span>
                  )}
                </span>
              </button>
              {edita && (
                <button
                  type="button"
                  aria-label={`Quitar paso: ${t.texto}`}
                  disabled={acc.pendiente}
                  onClick={() => window.confirm(`¿Quitar "${t.texto}"?`) && acc.correr(() => borrarPaso(t.id))}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-btn text-fog-dim hover:text-white"
                >
                  <Trash2 aria-hidden className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {edita &&
        (abierto ? (
          <form onSubmit={agregar} className="mt-2 flex gap-2">
            <input autoFocus value={nuevo} onChange={(e) => setNuevo(e.target.value)} maxLength={120} placeholder={`Paso nuevo en ${label}`} aria-label={`Paso nuevo en ${label}`} className="pn-input" />
            <BotonSecundario type="submit" disabled={acc.pendiente} className="h-11 shrink-0">Agregar</BotonSecundario>
          </form>
        ) : (
          <button type="button" onClick={() => setAbierto(true)} className="mt-1.5 inline-flex h-9 items-center gap-1.5 text-xs font-semibold text-fog-dim hover:text-white">
            <Plus aria-hidden className="h-3.5 w-3.5" /> Agregar paso
          </button>
        ))}
      <MensajeError error={acc.error} />
    </section>
  );
}

