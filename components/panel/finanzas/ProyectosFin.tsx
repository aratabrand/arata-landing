"use client";

import { useMemo, useState, type FormEvent } from "react";
import { CalendarDays, Lock, Plus, Receipt, Trash2 } from "lucide-react";
import { EMPRESA, HORAS_POR_DIA, actividades, categoriasGasto, categoriasServicio, nombreCliente, type DatosFinanzas, type EstadoProyecto, type FinProyecto } from "@/lib/panel/finanzas/tipos";
import { calcularProyecto, reglasActuales, textoDias } from "@/lib/panel/finanzas/calculo";
import { fechaCorta, pesos } from "@/lib/panel/formato";
import {
  agregarGasto,
  agregarTrabajo,
  aplicarReglasActuales,
  borrarGasto,
  borrarTrabajo,
  guardarProyecto,
  guardarServicio,
} from "@/app/(panel)/panel/(app)/finanzas/acciones";
import { guardarCliente } from "@/app/(panel)/panel/(app)/clientes/acciones";
import { Hoja } from "../Clientes";
import BorrarProyecto from "./BorrarProyecto";
import { Pill, Tarjeta } from "../ui";
import { BotonPrincipal, BotonSecundario, Campo, CampoPesos, LeyendaObligatorios, MensajeError, colorPersona, nombreDe, useAccion } from "./comun";
import { diasValidos, mascaraDias, mascaraNombre, mascaraPesos } from "@/lib/panel/mascaras";
import { InputCelular, SelectorLugar } from "../campos";
import { cn } from "@/lib/utils";

const estados: { valor: EstadoProyecto; label: string; tono: "neutro" | "morado" | "lima" }[] = [
  { valor: "propuesta", label: "Propuesta", tono: "neutro" },
  { valor: "en-curso", label: "En curso", tono: "morado" },
  { valor: "cerrado", label: "Cerrado", tono: "lima" },
];

export default function ProyectosFin({ datos, hoy }: { datos: DatosFinanzas; hoy: string }) {
  const [abierto, setAbierto] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);
  const [viendoServicios, setViendoServicios] = useState(false);
  const [filtro, setFiltro] = useState<EstadoProyecto | "todos">("todos");

  const filas = useMemo(
    () =>
      datos.proyectos
        .filter((p) => filtro === "todos" || p.estado === filtro)
        .map((p) => ({ p, r: calcularProyecto(p, datos.gastos, datos.trabajo, datos.config, datos.personas) })),
    [datos, filtro]
  );
  const actual = datos.proyectos.find((p) => p.id === abierto) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1" role="group" aria-label="Filtrar por estado">
          {[{ valor: "todos" as const, label: "Todos" }, ...estados].map((e) => (
            <button
              key={e.valor}
              type="button"
              aria-pressed={filtro === e.valor}
              onClick={() => setFiltro(e.valor)}
              className={cn(
                "h-9 shrink-0 rounded-full border px-3.5 text-xs font-semibold",
                filtro === e.valor ? "border-brand bg-brand/20 text-white" : "border-white/10 text-fog hover:text-white"
              )}
            >
              {e.label} <span className="ml-1 text-fog-dim">{e.valor === "todos" ? datos.proyectos.length : datos.proyectos.filter((p) => p.estado === e.valor).length}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <BotonSecundario type="button" onClick={() => setViendoServicios(true)} className="h-11">
            Servicios
          </BotonSecundario>
          {datos.puedeEditar && (
            <BotonPrincipal type="button" onClick={() => setCreando(true)} className="inline-flex items-center justify-center gap-2">
              <Plus aria-hidden className="h-4 w-4" /> Nuevo proyecto
            </BotonPrincipal>
          )}
        </div>
      </div>

      <Tarjeta>
        {filas.length === 0 ? (
          <p className="py-10 text-center text-sm text-fog">{datos.proyectos.length ? "No hay proyectos con ese estado." : "Todavía no hay proyectos. Agrega el primero."}</p>
        ) : (
          <ul className="divide-y divide-white/6">
            {filas.map(({ p, r }) => {
              const e = estados.find((x) => x.valor === p.estado)!;
              return (
                <li key={p.id}>
                  <button type="button" onClick={() => setAbierto(p.id)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 py-3.5 text-left first:pt-0">
                    <span className="min-w-0 flex-1 basis-56">
                      <span className="flex items-center gap-2">
                        <span className="truncate font-medium text-white">{p.nombre}</span>
                        <Pill tono={e.tono}>{e.label}</Pill>
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-fog-dim">
                        {[
                          nombreCliente(datos.clientes.find((c) => c.id === p.clienteId)),
                          datos.servicios.find((x) => x.id === p.servicioId)?.nombre,
                          p.fechaCierre ? `cerró ${fechaCorta(p.fechaCierre)}` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                    <span className="grid grid-cols-3 gap-4 text-right text-sm sm:w-[360px]">
                      <span>
                        <span className="block text-[0.68rem] text-fog-dim">Valor</span>
                        <span className="font-display font-bold text-white">{pesos(r.ingreso)}</span>
                      </span>
                      <span>
                        <span className="block text-[0.68rem] text-fog-dim">Gastos</span>
                        <span className="tabular-nums text-fog">{pesos(r.gastos)}</span>
                      </span>
                      <span>
                        <span className="block text-[0.68rem] text-fog-dim">Ganancia</span>
                        <span className={cn("font-display font-bold", r.ganancia < 0 ? "text-[#FF9BB0]" : "text-lime")}>{pesos(r.ganancia)}</span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Tarjeta>

      {actual && (
        <Hoja titulo={actual.nombre} onClose={() => setAbierto(null)}>
          <DetalleProyecto p={actual} datos={datos} hoy={hoy} onBorrado={() => setAbierto(null)} />
        </Hoja>
      )}
      {viendoServicios && (
        <Hoja titulo="Servicios" onClose={() => setViendoServicios(false)}>
          <ListaServicios datos={datos} />
        </Hoja>
      )}
      {creando && (
        <Hoja titulo="Nuevo proyecto" onClose={() => setCreando(false)}>
          <FormProyecto datos={datos} hoy={hoy} onListo={() => setCreando(false)} />
        </Hoja>
      )}
    </div>
  );
}

export function FormProyecto({ p, datos, hoy, onListo }: { p?: FinProyecto; datos: DatosFinanzas; hoy: string; onListo: () => void }) {
  const { pendiente, error, correr } = useAccion();
  const [estado, setEstado] = useState<EstadoProyecto>(p?.estado ?? "en-curso");
  const [clienteId, setClienteId] = useState(p?.clienteId ?? "");
  const [servicioId, setServicioId] = useState(p?.servicioId ?? "");
  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    correr(
      () =>
        guardarProyecto({
          id: p?.id,
          nombre: String(f.get("nombre") ?? ""),
          clienteId,
          servicioId,
          estado,
          valor: String(f.get("valor") ?? ""),
          fechaCierre: String(f.get("fechaCierre") ?? ""),
          fechaLimite: String(f.get("fechaLimite") ?? ""),
          // El valor del día del proyecto solo lo manda Sergio (Andrés no lo puede cambiar)
          ...(datos.esDueno ? { tarifaDia: String(f.get("tarifaDia") ?? "").replace(/\D/g, "") } : {}),
          notas: String(f.get("notas") ?? ""),
        }),
      onListo
    );
  };
  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <LeyendaObligatorios />
      <Campo etiqueta="Nombre del proyecto *">
        <input name="nombre" defaultValue={p?.nombre} maxLength={90} autoComplete="off" onChange={(e) => (e.target.value = mascaraNombre(e.target.value))} className="pn-input" />
      </Campo>
      <SelectorCliente datos={datos} valor={clienteId} onCambio={setClienteId} />
      <SelectorServicio datos={datos} valor={servicioId} onCambio={setServicioId} />
      <CampoPesos name="valor" etiqueta="Valor que paga el cliente (COP)" valorInicial={p?.valor} requerido />
      {datos.esDueno ? (
        <Campo etiqueta="Valor del día de este proyecto" obligatorio={false} ayuda={`Vacío = el de Reparto (${pesos(datos.config.tarifaDia)}). Solo tú lo cambias.`}>
          <input
            name="tarifaDia"
            inputMode="numeric"
            autoComplete="off"
            defaultValue={p?.tarifaDia ? mascaraPesos(String(p.tarifaDia)) : ""}
            placeholder={mascaraPesos(String(datos.config.tarifaDia))}
            onChange={(e) => (e.target.value = mascaraPesos(e.target.value, 8))}
            className="pn-input tabular-nums"
          />
        </Campo>
      ) : (
        <p className="flex items-center gap-2 text-xs text-fog-dim">
          <Lock aria-hidden className="h-3.5 w-3.5 text-brand-soft" /> Valor del día: {pesos(p?.tarifaDia ?? datos.config.tarifaDia)} (solo Sergio lo cambia).
        </p>
      )}
      <Campo etiqueta="Fecha de entrega prometida" obligatorio={false} ayuda="Para avisar si el proyecto va tarde (2 días antes, el día y si se pasa).">
        <input name="fechaLimite" type="date" defaultValue={p?.fechaLimite ?? ""} className="pn-input" />
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="Estado *">
          <select value={estado} onChange={(e) => setEstado(e.target.value as EstadoProyecto)} className="pn-input">
            {estados.map((x) => (
              <option key={x.valor} value={x.valor}>{x.label}</option>
            ))}
          </select>
        </Campo>
        {estado === "cerrado" && (
          <Campo etiqueta="Fecha de cierre *">
            <input name="fechaCierre" type="date" defaultValue={p?.fechaCierre ?? hoy} className="pn-input" />
          </Campo>
        )}
      </div>
      {estado === "cerrado" && !p?.repartoCongelado && (
        <p className="flex items-start gap-2 rounded-frame border border-white/8 bg-surface-1 p-3 text-xs text-fog">
          <Lock aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-soft" />
          Al cerrar, el proyecto guarda su valor del día y quiénes reciben parte igual. Si después cambia el reparto o el equipo, este proyecto no cambia.
        </p>
      )}
      <Campo etiqueta="Notas" obligatorio={false}>
        <textarea name="notas" defaultValue={p?.notas ?? ""} rows={2} maxLength={1000} className="pn-input h-auto py-2.5" />
      </Campo>
      <MensajeError error={error} />
      <BotonPrincipal type="submit" pendiente={pendiente} className="w-full">
        {p ? "Guardar cambios" : "Crear proyecto"}
      </BotonPrincipal>
    </form>
  );
}

function DetalleProyecto({ p, datos, hoy, onBorrado }: { p: FinProyecto; datos: DatosFinanzas; hoy: string; onBorrado: () => void }) {
  const [editando, setEditando] = useState(false);
  const r = calcularProyecto(p, datos.gastos, datos.trabajo, datos.config, datos.personas);
  const gastos = datos.gastos.filter((g) => g.proyectoId === p.id);
  const trabajo = datos.trabajo.filter((h) => h.proyectoId === p.id);
  const acc = useAccion();
  const edita = datos.puedeEditar;
  const hoyReglas = reglasActuales(datos.config, datos.personas);
  const congeladoDistinto =
    !!p.repartoCongelado &&
    (r.reglas.partes.join() !== hoyReglas.partes.join() || (p.tarifaDia === null && r.tarifaDia !== hoyReglas.tarifaDia));

  if (editando) return <FormProyecto p={p} datos={datos} hoy={hoy} onListo={() => setEditando(false)} />;

  const cliente = datos.clientes.find((c) => c.id === p.clienteId);
  const servicio = datos.servicios.find((x) => x.id === p.servicioId);
  return (
    <div className="space-y-6">
      <p className="text-sm text-fog">
        {nombreCliente(cliente)}
        {servicio && <> · {servicio.nombre}</>}
      </p>
      <dl className="grid grid-cols-3 gap-2">
        {[
          { k: "Valor", v: pesos(r.ingreso) },
          { k: "Gastos", v: pesos(r.gastos) },
          { k: "Ganancia", v: pesos(r.ganancia), c: r.ganancia < 0 ? "text-[#FF9BB0]" : "text-lime" },
        ].map((x) => (
          <div key={x.k} className="rounded-frame border border-white/8 bg-surface-1 p-3">
            <dt className="text-[0.7rem] text-fog-dim">{x.k}</dt>
            <dd className={cn("mt-1 truncate font-display text-sm font-bold text-white", x.c)}>{x.v}</dd>
          </div>
        ))}
      </dl>

      {/* Reparto */}
      <section>
        <h3 className="mb-2 text-sm font-semibold text-white">Reparto de la ganancia</h3>
        {r.perdida ? (
          <p className="text-sm text-[#FF9BB0]">Este proyecto da pérdida ({pesos(r.ganancia)}): no se reparte y la absorbe la empresa.</p>
        ) : r.ganancia === 0 ? (
          <p className="text-sm text-fog">Sin ganancia todavía: agrega el valor del proyecto.</p>
        ) : (
          <>
            <dl className="mb-3 space-y-1 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-fog-dim">Días trabajados {r.diasTotales > 0 ? `${textoDias(r.diasTotales)} × ${pesos(r.tarifaDia)}` : "(sin registrar)"}</dt>
                <dd className="tabular-nums text-fog">{pesos(-r.pagoDias)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-fog-dim">Para repartir en {r.numPartes} partes iguales</dt>
                <dd className="tabular-nums text-fog">{pesos(r.paraRepartir)} · {pesos(r.parteIgual)} c/u</dd>
              </div>
            </dl>
            {r.recortado && (
              <p className="mb-3 text-xs text-[#FFC76B]">
                Los días ({pesos(r.pagoDiasCompleto)}) cuestan más que la ganancia: se pagan en proporción hasta {pesos(r.ganancia)} y no hay parte igual.
              </p>
            )}
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[0.7rem] text-fog-dim">
                  <th className="pb-2 text-left font-medium">Quién</th>
                  <th className="pb-2 text-right font-medium">Parte igual</th>
                  <th className="pb-2 text-right font-medium">Días</th>
                  <th className="pb-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6">
                {r.personas
                  .filter((x) => x.total !== 0 || x.dias > 0)
                  .map((x) => {
                    const i = datos.personas.findIndex((pe) => pe.id === x.personaId);
                    return (
                      <tr key={x.personaId}>
                        <td className="py-2">
                          <span className="flex items-center gap-2 text-white">
                            <span className="h-2 w-2 rounded-full" style={{ background: colorPersona(Math.max(0, i)) }} />
                            {nombreDe(x.personaId, datos.personas)}
                          </span>
                          {x.dias > 0 && <span className="pl-4 text-[0.7rem] text-fog-dim">{textoDias(x.dias)}</span>}
                        </td>
                        <td className="py-2 text-right tabular-nums text-fog">{pesos(x.parteIgual)}</td>
                        <td className="py-2 text-right tabular-nums text-fog">{pesos(x.porDias)}</td>
                        <td className="py-2 text-right font-display font-bold text-white">{pesos(x.total)}</td>
                      </tr>
                    );
                  })}
                <tr>
                  <td className="py-2 text-white">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-lime" /> {nombreDe(EMPRESA, datos.personas)}
                    </span>
                  </td>
                  <td />
                  <td />
                  <td className="py-2 text-right font-display font-bold text-lime">{pesos(r.empresa)}</td>
                </tr>
              </tbody>
            </table>
          </>
        )}
        {p.repartoCongelado && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-fog-dim">
            <Lock aria-hidden className="h-3.5 w-3.5 text-brand-soft" /> Calculado con el valor del día ({pesos(r.tarifaDia)}) y las {r.numPartes} partes del cierre.
            {datos.esDueno && congeladoDistinto && (
              <button
                type="button"
                disabled={acc.pendiente}
                onClick={() => window.confirm("¿Recalcular este proyecto con el reparto de hoy?") && acc.correr(() => aplicarReglasActuales(p.id))}
                className="font-semibold text-brand-soft hover:text-white"
              >
                Usar el reparto de hoy
              </button>
            )}
          </div>
        )}
        <MensajeError error={acc.error} />
      </section>

      {/* Días trabajados: quién hizo qué */}
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
          <CalendarDays aria-hidden className="h-4 w-4 text-brand-soft" /> Quién hizo qué
        </h3>
        <p className="mb-2 text-xs text-fog-dim">Días de {HORAS_POR_DIA} horas a {pesos(r.tarifaDia)}. Se pagan antes de repartir por partes iguales.</p>
        <Lista
          vacio="Sin días registrados: toda la ganancia se reparte por partes iguales."
          filas={trabajo.map((h) => ({
            id: h.id,
            izq: `${nombreDe(h.personaId, datos.personas)} · ${h.actividad}`,
            sub: [textoDias(h.dias), fechaCorta(h.fecha), h.nota].filter(Boolean).join(" · "),
            der: pesos(Math.round(h.dias * r.tarifaDia)),
          }))}
          onBorrar={edita ? (id) => borrarTrabajo(id) : undefined}
        />
        {edita && <FormTrabajo proyectoId={p.id} datos={datos} hoy={hoy} tarifa={r.tarifaDia} />}
      </section>

      {/* Gastos */}
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
          <Receipt aria-hidden className="h-4 w-4 text-brand-soft" /> Gastos del proyecto
        </h3>
        <Lista
          vacio="Sin gastos registrados."
          filas={gastos.map((g) => ({
            id: g.id,
            izq: g.concepto,
            sub: `${categoriasGasto.find((c) => c.valor === g.categoria)?.label} · ${fechaCorta(g.fecha)}`,
            der: pesos(g.valor),
          }))}
          onBorrar={edita ? (id) => borrarGasto(id) : undefined}
        />
        {edita && <FormGasto proyectoId={p.id} hoy={hoy} />}
      </section>

      {edita && (
        <div className="flex flex-wrap gap-2 border-t border-white/8 pt-4">
          <BotonSecundario type="button" onClick={() => setEditando(true)}>
            Editar proyecto
          </BotonSecundario>
          {/* Borrar: solo Sergio, con alerta que muestra todo lo que se borra (D-119) */}
          {datos.esDueno && <BorrarProyecto proyectoId={p.id} nombre={p.nombre} onBorrado={onBorrado} />}
        </div>
      )}
    </div>
  );
}

export function Lista({
  filas,
  vacio,
  onBorrar,
}: {
  filas: { id: string; izq: string; sub?: string; der: string }[];
  vacio: string;
  onBorrar?: (id: string) => Promise<import("@/app/(panel)/panel/(app)/finanzas/acciones").Resultado>;
}) {
  const acc = useAccion();
  if (!filas.length) return <p className="text-sm text-fog-dim">{vacio}</p>;
  return (
    <>
      <ul className="divide-y divide-white/6 rounded-frame border border-white/8 bg-surface-1">
        {filas.map((f) => (
          <li key={f.id} className="flex items-center gap-3 px-3 py-2.5">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-white">{f.izq}</span>
              {f.sub && <span className="block truncate text-[0.7rem] text-fog-dim">{f.sub}</span>}
            </span>
            <span className="shrink-0 font-display text-sm font-bold text-white">{f.der}</span>
            {onBorrar && (
              <button
                type="button"
                aria-label={`Quitar ${f.izq}`}
                disabled={acc.pendiente}
                onClick={() => window.confirm("¿Quitar este registro?") && acc.correr(() => onBorrar(f.id))}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-btn text-fog-dim hover:text-white"
              >
                <Trash2 aria-hidden className="h-4 w-4" />
              </button>
            )}
          </li>
        ))}
      </ul>
      <MensajeError error={acc.error} />
    </>
  );
}

function FormTrabajo({ proyectoId, datos, hoy, tarifa }: { proyectoId: string; datos: DatosFinanzas; hoy: string; tarifa: number }) {
  const acc = useAccion();
  const [clave, setClave] = useState(0);
  const [dias, setDias] = useState("");
  const n = Number(dias.replace(",", "."));
  const valido = diasValidos(dias);
  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    acc.correr(
      () =>
        agregarTrabajo({
          proyectoId,
          personaId: String(f.get("persona") ?? ""),
          actividad: String(f.get("actividad") ?? ""),
          dias,
          fecha: String(f.get("fecha") ?? ""),
          nota: String(f.get("nota") ?? ""),
        }),
      () => {
        setClave((k) => k + 1);
        setDias("");
      }
    );
  };
  return (
    <form key={clave} onSubmit={enviar} noValidate className="mt-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Campo etiqueta="Quién lo hizo *">
          <select name="persona" className="pn-input" defaultValue={datos.miPersonaId ?? datos.personas[0]?.id}>
            {datos.personas
              .filter((pe) => pe.activo)
              .map((pe) => (
                <option key={pe.id} value={pe.id}>{pe.nombre}</option>
              ))}
          </select>
        </Campo>
        <Campo etiqueta="Qué hizo *">
          <select name="actividad" className="pn-input" defaultValue="">
            <option value="" disabled>Elige…</option>
            {actividades.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </Campo>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Campo etiqueta="Días trabajados *" ayuda="1 día = 8 h. Ej. 2 o 2,5">
          <input value={dias} onChange={(e) => setDias(mascaraDias(e.target.value))} inputMode="decimal" autoComplete="off" placeholder="2,5" className="pn-input tabular-nums" />
        </Campo>
        <Campo etiqueta="Fecha *">
          <input name="fecha" type="date" defaultValue={hoy} max={hoy} className="pn-input" />
        </Campo>
      </div>
      {valido && (
        <p className="text-xs text-fog">
          {textoDias(n)} × {pesos(tarifa)} = <strong className="text-white">{pesos(Math.round(n * tarifa))}</strong>
        </p>
      )}
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input name="nota" placeholder="Detalle (opcional)" maxLength={200} aria-label="Detalle (opcional)" className="pn-input" />
        <BotonSecundario type="submit" disabled={acc.pendiente} className="h-11">
          <Plus aria-hidden className="h-4 w-4" /> Días
        </BotonSecundario>
      </div>
      <MensajeError error={acc.error} />
    </form>
  );
}

export function FormGasto({ proyectoId, hoy, empresa = false }: { proyectoId: string | null; hoy: string; empresa?: boolean }) {
  const acc = useAccion();
  const [clave, setClave] = useState(0);
  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    acc.correr(
      () =>
        agregarGasto({
          proyectoId,
          concepto: String(f.get("concepto") ?? ""),
          categoria: String(f.get("categoria") ?? ""),
          valor: String(f.get("valor") ?? ""),
          fecha: String(f.get("fecha") ?? ""),
        }),
      () => setClave((k) => k + 1)
    );
  };
  return (
    <form key={clave} onSubmit={enviar} noValidate className="mt-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <Campo etiqueta="Concepto *">
            <input name="concepto" placeholder="Ej. Plantilla, dominio, fotos" maxLength={90} autoComplete="off" className="pn-input" />
          </Campo>
        </div>
        <Campo etiqueta="Categoría *">
          <select name="categoria" defaultValue={empresa ? "herramientas" : "freelance"} className="pn-input">
            {categoriasGasto.map((c) => (
              <option key={c.valor} value={c.valor}>{c.label}</option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Fecha *">
          <input name="fecha" type="date" defaultValue={hoy} className="pn-input" />
        </Campo>
      </div>
      <div className="grid grid-cols-[1fr_auto] items-end gap-2">
        <CampoPesos name="valor" etiqueta="Valor (COP)" requerido />
        <BotonSecundario type="submit" disabled={acc.pendiente} className="h-11">
          <Plus aria-hidden className="h-4 w-4" /> Gasto
        </BotonSecundario>
      </div>
      <MensajeError error={acc.error} />
    </form>
  );
}

const NUEVO = "__nuevo__";

/** Lista de clientes (tabla `clientes`). "Agregar nuevo" abre un mini formulario. */
function SelectorCliente({ datos, valor, onCambio }: { datos: DatosFinanzas; valor: string; onCambio: (id: string) => void }) {
  const [creando, setCreando] = useState(false);
  const acc = useAccion();
  const [nuevo, setNuevo] = useState({ empresa: "", nombre: "", telefono: "", origen: "WhatsApp", pais: "CO", ciudadId: "" });
  const crear = () =>
    acc.correr(async () => {
      const r = await guardarCliente({ ...nuevo, estado: "nuevo" });
      if (r.ok && r.id) {
        onCambio(r.id);
        setCreando(false);
      }
      return r;
    });
  return (
    <div className="space-y-2">
      <Campo etiqueta="Cliente *">
        <select
          value={creando ? NUEVO : valor}
          onChange={(e) => (e.target.value === NUEVO ? setCreando(true) : (setCreando(false), onCambio(e.target.value)))}
          className="pn-input"
        >
          <option value="" disabled>Elige un cliente</option>
          {datos.clientes.map((c) => (
            <option key={c.id} value={c.id}>{nombreCliente(c)}</option>
          ))}
          {datos.puedeEditar && <option value={NUEVO}>＋ Agregar cliente nuevo…</option>}
        </select>
      </Campo>
      {creando && (
        <div className="space-y-2 rounded-frame border border-brand/40 bg-brand/5 p-3">
          <p className="text-xs font-semibold text-brand-soft">Cliente nuevo (queda guardado en Clientes)</p>
          <div className="grid grid-cols-2 gap-2">
            <Campo etiqueta="Nombre de la persona *">
              <input maxLength={80} autoComplete="off" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: mascaraNombre(e.target.value) })} className="pn-input" />
            </Campo>
            <Campo etiqueta="Negocio o empresa" obligatorio={false}>
              <input maxLength={90} autoComplete="off" value={nuevo.empresa} onChange={(e) => setNuevo({ ...nuevo, empresa: mascaraNombre(e.target.value) })} className="pn-input" />
            </Campo>
            <InputCelular key={nuevo.pais} name="nuevoTelefono" pais={nuevo.pais} onCambio={(v) => setNuevo((x) => ({ ...x, telefono: v }))} />
            <Campo etiqueta="De dónde llegó" obligatorio={false}>
              <select value={nuevo.origen} onChange={(e) => setNuevo({ ...nuevo, origen: e.target.value })} className="pn-input">
                {["Instagram", "Google", "WhatsApp", "Referido", "Página", "Publicidad", "Evento", "Otro"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Campo>
          </div>
          <SelectorLugar
            paises={datos.lugares.paises}
            ciudades={datos.lugares.ciudades}
            pais={nuevo.pais}
            ciudadId={nuevo.ciudadId}
            puedeAgregar={datos.puedeEditar}
            onCambio={(pais, ciudadId) => setNuevo((x) => ({ ...x, pais, ciudadId, telefono: pais === x.pais ? x.telefono : "" }))}
          />
          <MensajeError error={acc.error} />
          <div className="flex gap-2">
            <BotonSecundario type="button" onClick={() => setCreando(false)}>Cancelar</BotonSecundario>
            <BotonSecundario type="button" disabled={acc.pendiente} onClick={crear} className="border-brand/60">
              {acc.pendiente ? "Guardando…" : "Guardar cliente"}
            </BotonSecundario>
          </div>
        </div>
      )}
    </div>
  );
}

/** Lista de servicios (tabla `servicios`). Solo activos; "Agregar nuevo" para crear uno. */
function SelectorServicio({ datos, valor, onCambio }: { datos: DatosFinanzas; valor: string; onCambio: (id: string) => void }) {
  const [creando, setCreando] = useState(false);
  const acc = useAccion();
  const [nuevo, setNuevo] = useState({ nombre: "", categoria: "pagina-web" });
  const opciones = datos.servicios.filter((x) => x.activo || x.id === valor);
  const crear = () =>
    acc.correr(async () => {
      const r = await guardarServicio(nuevo);
      if (r.ok && r.id) {
        onCambio(r.id);
        setCreando(false);
      }
      return r;
    });
  return (
    <div className="space-y-2">
      <Campo etiqueta="Servicio *">
        <select
          value={creando ? NUEVO : valor}
          onChange={(e) => (e.target.value === NUEVO ? setCreando(true) : (setCreando(false), onCambio(e.target.value)))}
          className="pn-input"
        >
          <option value="" disabled>Elige un servicio</option>
          {opciones.map((x) => (
            <option key={x.id} value={x.id}>{x.nombre}</option>
          ))}
          {datos.puedeEditar && <option value={NUEVO}>＋ Agregar servicio nuevo…</option>}
        </select>
      </Campo>
      {creando && (
        <div className="space-y-2 rounded-frame border border-brand/40 bg-brand/5 p-3">
          <p className="text-xs font-semibold text-brand-soft">Servicio nuevo (queda en la lista para todos los proyectos)</p>
          <div className="grid grid-cols-[1.4fr_1fr] gap-2">
            <Campo etiqueta="Nombre del servicio *">
              <input maxLength={80} value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: mascaraNombre(e.target.value) })} className="pn-input" />
            </Campo>
            <Campo etiqueta="Categoría *">
              <select value={nuevo.categoria} onChange={(e) => setNuevo({ ...nuevo, categoria: e.target.value })} className="pn-input">
                {categoriasServicio.map((c) => (
                  <option key={c.valor} value={c.valor}>{c.label}</option>
                ))}
              </select>
            </Campo>
          </div>
          <MensajeError error={acc.error} />
          <div className="flex gap-2">
            <BotonSecundario type="button" onClick={() => setCreando(false)}>Cancelar</BotonSecundario>
            <BotonSecundario type="button" disabled={acc.pendiente} onClick={crear} className="border-brand/60">
              {acc.pendiente ? "Guardando…" : "Guardar servicio"}
            </BotonSecundario>
          </div>
        </div>
      )}
    </div>
  );
}

/** Lista de servicios: renombrar, desactivar (deja de salir en proyectos nuevos) o agregar. */
function ListaServicios({ datos }: { datos: DatosFinanzas }) {
  const acc = useAccion();
  const [editando, setEditando] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [nuevo, setNuevo] = useState({ nombre: "", categoria: "pagina-web" });
  const usos = (id: string) => datos.proyectos.filter((p) => p.servicioId === id).length;
  return (
    <div className="space-y-4">
      <p className="text-sm text-fog">Los proyectos eligen el servicio de esta lista. Desactivar uno no cambia los proyectos que ya lo usan.</p>
      <ul className="divide-y divide-white/6 rounded-frame border border-white/8 bg-surface-1">
        {datos.servicios.map((x) => (
          <li key={x.id} className={cn("flex items-center gap-3 px-3 py-2.5", !x.activo && "opacity-50")}>
            {editando === x.id ? (
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={80} aria-label="Nombre del servicio" className="pn-input h-9 flex-1" />
            ) : (
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-white">{x.nombre}</span>
                <span className="block text-[0.7rem] text-fog-dim">
                  {categoriasServicio.find((c) => c.valor === x.categoria)?.label} · {usos(x.id)} {usos(x.id) === 1 ? "proyecto" : "proyectos"}
                </span>
              </span>
            )}
            {datos.puedeEditar &&
              (editando === x.id ? (
                <>
                  <BotonSecundario type="button" className="h-9" onClick={() => setEditando(null)}>Cancelar</BotonSecundario>
                  <BotonSecundario
                    type="button"
                    className="h-9 border-brand/60"
                    disabled={acc.pendiente}
                    onClick={() => acc.correr(() => guardarServicio({ id: x.id, nombre, categoria: x.categoria, activo: x.activo }), () => setEditando(null))}
                  >
                    Guardar
                  </BotonSecundario>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => (setEditando(x.id), setNombre(x.nombre))} className="text-xs font-semibold text-brand-soft hover:text-white">
                    Renombrar
                  </button>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={x.activo}
                    aria-label={`${x.nombre} activo`}
                    disabled={acc.pendiente}
                    onClick={() => acc.correr(() => guardarServicio({ id: x.id, nombre: x.nombre, categoria: x.categoria, activo: !x.activo }))}
                    className={cn("relative h-6 w-10 shrink-0 rounded-full border transition-colors", x.activo ? "border-lime bg-lime" : "border-white/15 bg-surface-2")}
                  >
                    <span className={cn("absolute left-0 top-0.5 h-4 w-4 rounded-full transition-transform", x.activo ? "translate-x-[18px] bg-ink" : "translate-x-0.5 bg-fog")} />
                  </button>
                </>
              ))}
          </li>
        ))}
      </ul>
      {datos.puedeEditar && (
        <div className="grid grid-cols-[1.4fr_1fr_auto] gap-2">
          <input placeholder="Servicio nuevo" aria-label="Servicio nuevo" maxLength={80} value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} className="pn-input" />
          <select aria-label="Categoría" value={nuevo.categoria} onChange={(e) => setNuevo({ ...nuevo, categoria: e.target.value })} className="pn-input">
            {categoriasServicio.map((c) => (
              <option key={c.valor} value={c.valor}>{c.label}</option>
            ))}
          </select>
          <BotonSecundario type="button" className="h-11" disabled={acc.pendiente} onClick={() => acc.correr(() => guardarServicio(nuevo), () => setNuevo({ nombre: "", categoria: "pagina-web" }))}>
            <Plus aria-hidden className="h-4 w-4" />
          </BotonSecundario>
        </div>
      )}
      <MensajeError error={acc.error} />
    </div>
  );
}
