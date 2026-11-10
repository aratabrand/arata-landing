"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Clock, Lock, Plus, Receipt, Trash2 } from "lucide-react";
import { EMPRESA, categoriasGasto, type DatosFinanzas, type EstadoProyecto, type FinProyecto } from "@/lib/panel/finanzas/tipos";
import { calcularProyecto } from "@/lib/panel/finanzas/calculo";
import { fechaCorta, pesos, porcentaje } from "@/lib/panel/formato";
import {
  agregarGasto,
  agregarHoras,
  aplicarReglasActuales,
  borrarGasto,
  borrarHoras,
  borrarProyecto,
  guardarProyecto,
} from "@/app/(panel)/panel/(app)/finanzas/acciones";
import { Hoja } from "../Clientes";
import { Pill, Tarjeta } from "../ui";
import { BotonPrincipal, BotonSecundario, Campo, CampoPesos, MensajeError, colorPersona, nombreDe, useAccion } from "./comun";
import { cn } from "@/lib/utils";

const estados: { valor: EstadoProyecto; label: string; tono: "neutro" | "morado" | "lima" }[] = [
  { valor: "propuesta", label: "Propuesta", tono: "neutro" },
  { valor: "en-curso", label: "En curso", tono: "morado" },
  { valor: "cerrado", label: "Cerrado", tono: "lima" },
];
const horasTxt = (h: number) => `${String(Math.round(h * 100) / 100).replace(".", ",")} h`;

export default function ProyectosFin({ datos, hoy }: { datos: DatosFinanzas; hoy: string }) {
  const [abierto, setAbierto] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);
  const [filtro, setFiltro] = useState<EstadoProyecto | "todos">("todos");

  const filas = useMemo(
    () =>
      datos.proyectos
        .filter((p) => filtro === "todos" || p.estado === filtro)
        .map((p) => ({ p, r: calcularProyecto(p, datos.gastos, datos.horas, datos.config, datos.personas) })),
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
        {datos.puedeEditar && (
          <BotonPrincipal type="button" onClick={() => setCreando(true)} className="inline-flex items-center justify-center gap-2">
            <Plus aria-hidden className="h-4 w-4" /> Nuevo proyecto
          </BotonPrincipal>
        )}
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
                        {[p.cliente, p.servicio, p.fechaCierre ? `cerró ${fechaCorta(p.fechaCierre)}` : null].filter(Boolean).join(" · ")}
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
      {creando && (
        <Hoja titulo="Nuevo proyecto" onClose={() => setCreando(false)}>
          <FormProyecto hoy={hoy} onListo={() => setCreando(false)} />
        </Hoja>
      )}
    </div>
  );
}

function FormProyecto({ p, hoy, onListo }: { p?: FinProyecto; hoy: string; onListo: () => void }) {
  const { pendiente, error, correr } = useAccion();
  const [estado, setEstado] = useState<EstadoProyecto>(p?.estado ?? "en-curso");
  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    correr(
      () =>
        guardarProyecto({
          id: p?.id,
          nombre: String(f.get("nombre") ?? ""),
          cliente: String(f.get("cliente") ?? ""),
          servicio: String(f.get("servicio") ?? ""),
          estado,
          valor: String(f.get("valor") ?? ""),
          fechaCierre: String(f.get("fechaCierre") ?? ""),
          notas: String(f.get("notas") ?? ""),
        }),
      onListo
    );
  };
  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <Campo etiqueta="Nombre del proyecto *">
        <input name="nombre" defaultValue={p?.nombre} maxLength={90} className="pn-input" />
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="Cliente">
          <input name="cliente" defaultValue={p?.cliente ?? ""} maxLength={90} className="pn-input" />
        </Campo>
        <Campo etiqueta="Servicio">
          <input name="servicio" defaultValue={p?.servicio ?? "Página web"} maxLength={60} className="pn-input" />
        </Campo>
      </div>
      <CampoPesos name="valor" etiqueta="Valor que paga el cliente (COP)" valorInicial={p?.valor} requerido />
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="Estado">
          <select value={estado} onChange={(e) => setEstado(e.target.value as EstadoProyecto)} className="pn-input">
            {estados.map((x) => (
              <option key={x.valor} value={x.valor}>{x.label}</option>
            ))}
          </select>
        </Campo>
        {estado === "cerrado" && (
          <Campo etiqueta="Fecha de cierre">
            <input name="fechaCierre" type="date" defaultValue={p?.fechaCierre ?? hoy} className="pn-input" />
          </Campo>
        )}
      </div>
      {estado === "cerrado" && !p?.repartoCongelado && (
        <p className="flex items-start gap-2 rounded-frame border border-white/8 bg-surface-1 p-3 text-xs text-fog">
          <Lock aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-soft" />
          Al cerrar, el proyecto guarda los porcentajes de hoy. Si después cambias el reparto, este proyecto no cambia.
        </p>
      )}
      <Campo etiqueta="Notas">
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
  const r = calcularProyecto(p, datos.gastos, datos.horas, datos.config, datos.personas);
  const gastos = datos.gastos.filter((g) => g.proyectoId === p.id);
  const horas = datos.horas.filter((h) => h.proyectoId === p.id);
  const acc = useAccion();
  const edita = datos.puedeEditar;
  const congeladoDistinto = p.repartoCongelado && JSON.stringify(p.repartoCongelado) !== JSON.stringify({ bolsaTrabajoPct: datos.config.bolsaTrabajoPct, reparto: datos.config.reparto });

  if (editando) return <FormProyecto p={p} hoy={hoy} onListo={() => setEditando(false)} />;

  return (
    <div className="space-y-6">
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
            <p className="mb-3 text-xs text-fog-dim">
              {r.sinHoras
                ? "Sin horas registradas: toda la ganancia se reparte con los porcentajes de socios."
                : `Bolsa de trabajo ${porcentaje(r.reglas.bolsaTrabajoPct, 0)} = ${pesos(r.bolsa)} por ${horasTxt(r.horasTotales)} · Resto ${pesos(r.resto)} por porcentajes.`}
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[0.7rem] text-fog-dim">
                  <th className="pb-2 text-left font-medium">Quién</th>
                  <th className="pb-2 text-right font-medium">Trabajo</th>
                  <th className="pb-2 text-right font-medium">Socio</th>
                  <th className="pb-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6">
                {r.personas
                  .filter((x) => x.total !== 0 || x.horas > 0)
                  .map((x) => {
                    const i = datos.personas.findIndex((pe) => pe.id === x.personaId);
                    return (
                      <tr key={x.personaId}>
                        <td className="py-2">
                          <span className="flex items-center gap-2 text-white">
                            <span className="h-2 w-2 rounded-full" style={{ background: colorPersona(Math.max(0, i)) }} />
                            {nombreDe(x.personaId, datos.personas)}
                          </span>
                          {x.horas > 0 && <span className="pl-4 text-[0.7rem] text-fog-dim">{horasTxt(x.horas)}</span>}
                        </td>
                        <td className="py-2 text-right tabular-nums text-fog">{pesos(x.trabajo)}</td>
                        <td className="py-2 text-right tabular-nums text-fog">{pesos(x.socio)}</td>
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
            <Lock aria-hidden className="h-3.5 w-3.5 text-brand-soft" /> Calculado con los porcentajes del cierre.
            {edita && congeladoDistinto && (
              <button
                type="button"
                disabled={acc.pendiente}
                onClick={() => window.confirm("¿Recalcular este proyecto con los porcentajes de hoy?") && acc.correr(() => aplicarReglasActuales(p.id))}
                className="font-semibold text-brand-soft hover:text-white"
              >
                Usar los porcentajes de hoy
              </button>
            )}
          </div>
        )}
        <MensajeError error={acc.error} />
      </section>

      {/* Horas */}
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
          <Clock aria-hidden className="h-4 w-4 text-brand-soft" /> Horas trabajadas
        </h3>
        <Lista
          vacio="Sin horas registradas."
          filas={horas.map((h) => ({
            id: h.id,
            izq: `${nombreDe(h.personaId, datos.personas)} · ${h.area}`,
            sub: [fechaCorta(h.fecha), h.nota].filter(Boolean).join(" · "),
            der: horasTxt(h.horas),
          }))}
          onBorrar={edita ? (id) => borrarHoras(id) : undefined}
        />
        {edita && <FormHoras proyectoId={p.id} datos={datos} hoy={hoy} />}
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
          <BotonSecundario
            type="button"
            className="text-[#FF9BB0]"
            onClick={() =>
              window.confirm(`¿Borrar "${p.nombre}" con sus gastos y horas? No se puede deshacer.`) && acc.correr(() => borrarProyecto(p.id), onBorrado)
            }
          >
            <Trash2 aria-hidden className="h-4 w-4" /> Borrar
          </BotonSecundario>
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

function FormHoras({ proyectoId, datos, hoy }: { proyectoId: string; datos: DatosFinanzas; hoy: string }) {
  const acc = useAccion();
  const [clave, setClave] = useState(0);
  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    acc.correr(
      () =>
        agregarHoras({
          proyectoId,
          personaId: String(f.get("persona") ?? ""),
          horas: String(f.get("horas") ?? ""),
          fecha: String(f.get("fecha") ?? ""),
          nota: String(f.get("nota") ?? ""),
        }),
      () => setClave((k) => k + 1)
    );
  };
  return (
    <form key={clave} onSubmit={enviar} noValidate className="mt-3 space-y-2">
      <select name="persona" aria-label="Persona" className="pn-input" defaultValue={datos.miPersonaId ?? datos.personas[0]?.id}>
        {datos.personas
          .filter((pe) => pe.activo)
          .map((pe) => (
            <option key={pe.id} value={pe.id}>{pe.nombre} · {pe.area}</option>
          ))}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <input name="horas" inputMode="decimal" placeholder="Horas (ej. 2,5)" aria-label="Horas" className="pn-input" />
        <input name="fecha" type="date" defaultValue={hoy} aria-label="Fecha" className="pn-input" />
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input name="nota" placeholder="Qué se hizo (opcional)" maxLength={200} aria-label="Nota" className="pn-input" />
        <BotonSecundario type="submit" disabled={acc.pendiente} className="h-11">
          <Plus aria-hidden className="h-4 w-4" /> Horas
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
        <input name="concepto" placeholder="Concepto" aria-label="Concepto" maxLength={90} className="pn-input col-span-2" />
        <select name="categoria" aria-label="Categoría" defaultValue={empresa ? "herramientas" : "freelance"} className="pn-input">
          {categoriasGasto.map((c) => (
            <option key={c.valor} value={c.valor}>{c.label}</option>
          ))}
        </select>
        <input name="fecha" type="date" defaultValue={hoy} aria-label="Fecha" className="pn-input" />
      </div>
      <div className="grid grid-cols-[1fr_auto] items-end gap-2">
        <CampoPesos name="valor" etiqueta="Valor (COP)" />
        <BotonSecundario type="submit" disabled={acc.pendiente} className="h-11">
          <Plus aria-hidden className="h-4 w-4" /> Gasto
        </BotonSecundario>
      </div>
      <MensajeError error={acc.error} />
    </form>
  );
}
