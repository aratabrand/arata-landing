"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft, CalendarPlus, Check, Clock, History, Plus, Trash2, Wallet } from "lucide-react";
import { actividades, nombreCliente, type DatosFinanzas, type FinProyecto, type RegistroTrabajo } from "@/lib/panel/finanzas/tipos";
import { actividadDeEtapa, avance, etapas, etiquetaEtapa, type Etapa, type FinTarea } from "@/lib/panel/finanzas/procesos";
import { fechaCorta, pesos } from "@/lib/panel/formato";
import { agregarDiasPaso, agregarPaso, borrarPaso, borrarTrabajo, cargarProceso, completarPaso, marcarPaso } from "@/app/(panel)/panel/(app)/finanzas/acciones";
import { diasValidos, mascaraDias } from "@/lib/panel/mascaras";
import { Hoja } from "../Clientes";
import { PanelPage, Pill, Tarjeta } from "../ui";
import { AvisoAcceso, BotonPrincipal, BotonSecundario, Campo, MensajeError, nombreDe, useAccion } from "../finanzas/comun";
import { FormProyecto } from "../finanzas/ProyectosFin";
import BorrarProyecto from "../finanzas/BorrarProyecto";
import Historial from "../Historial";
import type { EventoHistorial } from "@/lib/panel/historial";
import { diasHasta } from "./ProyectosAgencia";
import { cn } from "@/lib/utils";

// Detalle de un proyecto de Arata (D-112): proceso por etapas con sus pasos,
// avance, fechas, cliente, servicio y días trabajados. Sergio y Andrés editan; todos marcan pasos.

const comercial = { propuesta: { l: "Propuesta", t: "neutro" }, "en-curso": { l: "En curso", t: "morado" }, cerrado: { l: "Cerrado", t: "lima" } } as const;
const diasTxt = (d: number) => `${String(Math.round(d * 10) / 10).replace(".", ",")} ${d === 1 ? "día" : "días"}`;

export default function DetalleProyectoAgencia({ datos, p, hoy, historial }: { datos: DatosFinanzas; p: FinProyecto; hoy: string; historial: EventoHistorial[] }) {
  const [editando, setEditando] = useState(false);
  const router = useRouter();
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
        <div className="flex shrink-0 flex-wrap gap-2">
          {edita && (
            <BotonSecundario type="button" onClick={() => setEditando(true)} className="h-11">
              Editar proyecto
            </BotonSecundario>
          )}
          {datos.esDueno && <BorrarProyecto proyectoId={p.id} nombre={p.nombre} onBorrado={() => router.push("/panel/proyectos")} />}
        </div>
      </div>
      <AvisoAcceso demo={datos.demo} puedeEditar={datos.puedeEditar} texto="Puedes ver todo, marcar los pasos, ponerte como responsable y registrar tus días. Crear, editar o quitar pasos es de Sergio y Andrés." />

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
                trabajo={datos.trabajo.filter((h) => h.proyectoId === p.id)}
                miPersonaId={datos.miPersonaId}
                hoy={hoy}
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

      <Tarjeta titulo="Historial" bajada="Quién hizo cada cambio y cuándo" accion={<History aria-hidden className="h-4 w-4 text-brand-soft" />}>
        <Historial eventos={historial} vacio="Sin cambios registrados todavía." />
      </Tarjeta>

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
  trabajo,
  miPersonaId,
  hoy,
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
  /** Días registrados en el proyecto (para mostrar los de cada paso). */
  trabajo: RegistroTrabajo[];
  miPersonaId: string | null;
  hoy: string;
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
            <PasoFila
              key={t.id}
              t={t}
              etapa={etapa}
              edita={edita}
              marca={marca}
              personas={personas}
              dias={trabajo.filter((h) => h.tareaId === t.id)}
              miPersonaId={miPersonaId}
              hoy={hoy}
              quien={quien}
            />
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


const diasTxt2 = (d: number) => `${String(Math.round(d * 10) / 10).replace(".", ",")} ${d === 1 ? "día" : "días"}`;

// Un paso del proceso (D-123): casilla, quién lo hizo, sus días y el formulario para registrarlos.
// Al marcar un paso pendiente se pregunta quién lo hizo y cuántos días (opcional).
// Sergio y Andrés registran para cualquiera; los demás, solo para sí mismos.
function PasoFila({
  t,
  etapa,
  edita,
  marca,
  personas,
  dias,
  miPersonaId,
  hoy,
  quien,
}: {
  t: FinTarea;
  etapa: Etapa;
  edita: boolean;
  marca: boolean;
  personas: DatosFinanzas["personas"];
  dias: RegistroTrabajo[];
  miPersonaId: string | null;
  hoy: string;
  quien: (id?: string | null) => string | null | undefined;
}) {
  const acc = useAccion();
  const [modo, setModo] = useState<"completar" | "dias" | null>(null);
  const totalDias = dias.reduce((x, h) => x + h.dias, 0);
  // Opciones de persona: todo el equipo activo (Sergio y Andrés) o solo uno mismo
  const opciones = personas.filter((p) => p.activo && (edita || p.id === miPersonaId));
  const puedeRegistrar = marca && opciones.length > 0;

  return (
    <li>
      <div className="flex items-center gap-2">
        <button
          type="button"
          role="checkbox"
          aria-checked={t.hecha}
          disabled={!marca || acc.pendiente}
          onClick={() => (t.hecha ? acc.correr(() => marcarPaso(t.id, false)) : setModo((m) => (m === "completar" ? null : "completar")))}
          className="flex min-h-11 flex-1 items-center gap-3 rounded-btn border border-white/8 bg-surface-1 px-3 py-2 text-left text-sm disabled:cursor-default"
        >
          <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-md border", t.hecha ? "border-lime bg-lime text-ink" : "border-white/20")}>
            {t.hecha && <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />}
          </span>
          <span className="min-w-0 flex-1">
            <span className={cn("block", t.hecha ? "text-fog-dim line-through" : "text-white")}>{t.texto}</span>
            {(t.responsableId || totalDias > 0) && (
              <span className="block text-[0.7rem] text-fog">
                {t.responsableId ? `Lo hizo ${quien(t.responsableId) ?? "—"}` : "Sin responsable"}
                {totalDias > 0 && <span className="text-lime"> · {diasTxt2(totalDias)}</span>}
              </span>
            )}
            {t.hecha && (quien(t.hechaPor) || t.hechaEn) && (
              <span className="block text-[0.68rem] text-fog-dim">
                {quien(t.hechaPor) ? `Lo marcó ${quien(t.hechaPor)}` : "Hecho"}
                {t.hechaEn ? ` · ${fechaCorta(t.hechaEn)}` : ""}
              </span>
            )}
          </span>
        </button>
        {puedeRegistrar && (
          <button
            type="button"
            aria-label={`Registrar días en: ${t.texto}`}
            aria-expanded={modo === "dias"}
            onClick={() => setModo((m) => (m === "dias" ? null : "dias"))}
            className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-btn", modo === "dias" ? "text-lime" : "text-fog-dim hover:text-white")}
          >
            <CalendarPlus aria-hidden className="h-4 w-4" />
          </button>
        )}
        {edita && (
          <button
            type="button"
            aria-label={`Quitar paso: ${t.texto}`}
            disabled={acc.pendiente}
            onClick={() => window.confirm(`¿Quitar "${t.texto}"?${totalDias ? " Sus días trabajados se conservan en Finanzas." : ""}`) && acc.correr(() => borrarPaso(t.id))}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-btn text-fog-dim hover:text-white"
          >
            <Trash2 aria-hidden className="h-4 w-4" />
          </button>
        )}
      </div>

      {modo && (
        <FormDiasPaso
          t={t}
          etapa={etapa}
          modo={modo}
          opciones={opciones}
          predeterminada={t.responsableId && opciones.some((o) => o.id === t.responsableId) ? t.responsableId : (miPersonaId && opciones.some((o) => o.id === miPersonaId) ? miPersonaId : opciones[0]?.id ?? "")}
          hoy={hoy}
          onListo={() => setModo(null)}
          onCancelar={() => setModo(null)}
        />
      )}
      {modo === null && !puedeRegistrar && marca && !t.hecha && (
        <p className="mt-1 pl-1 text-[0.68rem] text-fog-dim">Tu cuenta no está enlazada a una persona del equipo: pídele a Sergio que la enlace.</p>
      )}

      {dias.length > 0 && modo === "dias" && (
        <ul className="ml-3 mt-1.5 space-y-1 border-l border-white/8 pl-3">
          {dias.map((h) => (
            <li key={h.id} className="flex items-center gap-2 text-xs text-fog">
              <span className="flex-1">
                {quien(h.personaId) ?? "—"} · {diasTxt2(h.dias)} de {h.actividad} · {fechaCorta(h.fecha)}
              </span>
              {(edita || h.personaId === miPersonaId) && (
                <button
                  type="button"
                  aria-label="Quitar estos días"
                  disabled={acc.pendiente}
                  onClick={() => window.confirm("¿Quitar estos días trabajados?") && acc.correr(() => borrarTrabajo(h.id))}
                  className="flex h-8 w-8 items-center justify-center rounded-btn text-fog-dim hover:text-white"
                >
                  <Trash2 aria-hidden className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      <MensajeError error={acc.error} />
    </li>
  );
}

function FormDiasPaso({
  t,
  etapa,
  modo,
  opciones,
  predeterminada,
  hoy,
  onListo,
  onCancelar,
}: {
  t: FinTarea;
  etapa: Etapa;
  modo: "completar" | "dias";
  opciones: DatosFinanzas["personas"];
  predeterminada: string;
  hoy: string;
  onListo: () => void;
  onCancelar: () => void;
}) {
  const acc = useAccion();
  const [persona, setPersona] = useState(predeterminada);
  const [dias, setDias] = useState("");
  const [actividad, setActividad] = useState<string>(actividadDeEtapa[etapa]);
  const [fecha, setFecha] = useState(hoy);
  const diasOk = dias === "" ? modo === "completar" : diasValidos(dias);

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (!persona || !diasOk) return;
    acc.correr(
      () =>
        modo === "completar"
          ? completarPaso({ tareaId: t.id, responsableId: persona, dias: dias || null, actividad, fecha })
          : agregarDiasPaso({ tareaId: t.id, personaId: persona, dias, actividad, fecha }),
      onListo
    );
  };

  return (
    <form onSubmit={enviar} noValidate className="mt-2 space-y-3 rounded-frame border border-brand/40 bg-brand/[0.06] p-3">
      <p className="text-xs font-semibold text-brand-soft">{modo === "completar" ? "Marcar como hecho" : "Sumar días trabajados"}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <Campo etiqueta="¿Quién lo hizo? *">
          <select value={persona} onChange={(e) => setPersona(e.target.value)} disabled={opciones.length === 1} className="pn-input disabled:opacity-80">
            {opciones.map((o) => (
              <option key={o.id} value={o.id}>{o.nombre}</option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta={modo === "completar" ? "Días trabajados" : "Días trabajados *"} obligatorio={modo === "completar" ? false : undefined} ayuda="1 día = 8 h. Ej. 2 o 2,5">
          <input value={dias} onChange={(e) => setDias(mascaraDias(e.target.value))} inputMode="decimal" autoComplete="off" placeholder="2,5" className="pn-input tabular-nums" />
        </Campo>
        <Campo etiqueta="Actividad *">
          <select value={actividad} onChange={(e) => setActividad(e.target.value)} className="pn-input">
            {actividades.map((x) => (
              <option key={x} value={x}>{x}</option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Fecha *">
          <input type="date" value={fecha} max={hoy} onChange={(e) => setFecha(e.target.value)} className="pn-input" />
        </Campo>
      </div>
      {dias !== "" && !diasValidos(dias) && <p className="text-xs text-[#FF9BB0]">Escribe los días en enteros o medios días (ej. 2 o 2,5).</p>}
      <MensajeError error={acc.error} />
      <div className="flex gap-2">
        <BotonSecundario type="button" onClick={onCancelar} className="h-11">Cancelar</BotonSecundario>
        <BotonPrincipal type="submit" pendiente={acc.pendiente} disabled={!persona || !diasOk} className="flex-1">
          {modo === "completar" ? (dias ? "Marcar hecho y guardar días" : "Marcar como hecho") : "Guardar días"}
        </BotonPrincipal>
      </div>
    </form>
  );
}
