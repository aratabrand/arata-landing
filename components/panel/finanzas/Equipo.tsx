"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Clock, Pencil, Plus, Wallet } from "lucide-react";
import type { DatosFinanzas, Persona } from "@/lib/panel/finanzas/tipos";
import { calcularProyecto, resumenFinanzas } from "@/lib/panel/finanzas/calculo";
import { fechaCorta, pesos } from "@/lib/panel/formato";
import { guardarPersona } from "@/app/(panel)/panel/(app)/finanzas/acciones";
import { Hoja } from "../Clientes";
import { PanelHeader, PanelPage, Pill, Tarjeta } from "../ui";
import { AvisoAcceso, BotonPrincipal, BotonSecundario, Campo, MensajeError, colorPersona, useAccion } from "./comun";
import { cn } from "@/lib/utils";

// Módulo Equipo (solo Arata San, D-108): cuánto gana cada uno, por proyecto y en total.
// Andrés y Santiago lo ven todo sin poder editar. Sergio administra las personas.
const horasTxt = (h: number) => `${String(Math.round(h * 10) / 10).replace(".", ",")} h`;

export default function Equipo({ datos, hoy }: { datos: DatosFinanzas; hoy: string }) {
  const [editando, setEditando] = useState<Persona | "nueva" | null>(null);
  const total = useMemo(() => resumenFinanzas(datos), [datos]);
  const mes = useMemo(() => resumenFinanzas(datos, `${hoy.slice(0, 7)}-01`), [datos, hoy]);
  const anio = useMemo(() => resumenFinanzas(datos, `${hoy.slice(0, 4)}-01-01`), [datos, hoy]);
  const cerrados = useMemo(
    () =>
      datos.proyectos
        .filter((p) => p.estado === "cerrado")
        .map((p) => ({ p, r: calcularProyecto(p, datos.gastos, datos.horas, datos.config, datos.personas) })),
    [datos]
  );
  const abiertos = datos.proyectos.filter((p) => p.estado !== "cerrado");
  const horasAbiertas = (id: string) => datos.horas.filter((h) => h.personaId === id && abiertos.some((p) => p.id === h.proyectoId)).reduce((a, h) => a + h.horas, 0);

  // "Tú" primero
  const personas = [...datos.personas].sort((a, b) => Number(b.id === datos.miPersonaId) - Number(a.id === datos.miPersonaId));

  return (
    <PanelPage>
      <PanelHeader
        titulo="Equipo"
        bajada="Lo que gana cada uno por proyecto: su parte como socio más lo que le toca por las horas trabajadas."
        accion={
          datos.puedeEditar ? (
            <BotonPrincipal type="button" onClick={() => setEditando("nueva")} className="inline-flex items-center gap-2">
              <Plus aria-hidden className="h-4 w-4" /> Agregar persona
            </BotonPrincipal>
          ) : undefined
        }
      />
      <AvisoAcceso demo={datos.demo} puedeEditar={datos.puedeEditar} />

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
        {personas.map((pe) => {
          const i = datos.personas.findIndex((x) => x.id === pe.id);
          const t = total.porPersona.find((x) => x.persona.id === pe.id)!;
          const m = mes.porPersona.find((x) => x.persona.id === pe.id)!;
          const a = anio.porPersona.find((x) => x.persona.id === pe.id)!;
          const yo = pe.id === datos.miPersonaId;
          return (
            <article key={pe.id} className={cn("v2-card p-4 sm:p-5", yo && "v2-glass", !pe.activo && "opacity-60")}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full font-display text-sm font-bold text-ink" style={{ background: colorPersona(i) }}>
                    {pe.nombre.slice(0, 1)}
                  </span>
                  <div>
                    <p className="flex items-center gap-2 font-display text-base font-bold text-white">
                      {pe.nombre}
                      {yo && <Pill tono="lima">Tú</Pill>}
                      {!pe.activo && <Pill>Inactivo</Pill>}
                    </p>
                    <p className="text-xs text-fog-dim">
                      {pe.area}
                      {pe.esSocio ? " · socio" : ""}
                    </p>
                  </div>
                </div>
                {datos.puedeEditar && (
                  <button type="button" aria-label={`Editar ${pe.nombre}`} onClick={() => setEditando(pe)} className="flex h-9 w-9 items-center justify-center rounded-btn text-fog-dim hover:text-white">
                    <Pencil aria-hidden className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="mt-4 text-xs text-fog">Ganado en total</p>
              <p className="font-display text-[1.75rem] font-bold leading-tight tracking-heading text-white">{pesos(t.total)}</p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-frame border border-white/6 bg-surface-2/60 p-2.5">
                  <dt className="text-[0.7rem] text-fog-dim">Este mes</dt>
                  <dd className="font-display font-bold text-white">{pesos(m.total)}</dd>
                </div>
                <div className="rounded-frame border border-white/6 bg-surface-2/60 p-2.5">
                  <dt className="text-[0.7rem] text-fog-dim">Este año</dt>
                  <dd className="font-display font-bold text-white">{pesos(a.total)}</dd>
                </div>
              </dl>
              <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[0.72rem] text-fog-dim">
                <span className="inline-flex items-center gap-1"><Wallet aria-hidden className="h-3 w-3" /> socio {pesos(t.socio)} · trabajo {pesos(t.trabajo)}</span>
                <span className="inline-flex items-center gap-1"><Clock aria-hidden className="h-3 w-3" /> {horasTxt(t.horas)} en cerrados{horasAbiertas(pe.id) > 0 ? ` · ${horasTxt(horasAbiertas(pe.id))} en abiertos` : ""}</span>
              </p>
            </article>
          );
        })}
      </div>

      <Tarjeta titulo="Por proyecto" bajada="Proyectos cerrados: lo que le tocó a cada uno">
        {cerrados.length === 0 ? (
          <p className="py-8 text-center text-sm text-fog">Todavía no hay proyectos cerrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/8 text-xs text-fog-dim">
                  <th className="py-2.5 pr-3 font-medium">Proyecto</th>
                  <th className="py-2.5 pr-3 text-right font-medium">Ganancia</th>
                  {datos.personas.map((pe) => (
                    <th key={pe.id} className={cn("py-2.5 pr-3 text-right font-medium", pe.id === datos.miPersonaId && "text-lime")}>{pe.nombre}</th>
                  ))}
                  <th className="py-2.5 text-right font-medium">Arata</th>
                </tr>
              </thead>
              <tbody>
                {cerrados.map(({ p, r }) => (
                  <tr key={p.id} className="border-b border-white/6 last:border-0">
                    <td className="py-2.5 pr-3">
                      <span className="block text-white">{p.nombre}</span>
                      <span className="block text-[0.7rem] text-fog-dim">{p.fechaCierre && fechaCorta(p.fechaCierre)}</span>
                    </td>
                    <td className="py-2.5 pr-3 text-right tabular-nums text-fog">{pesos(r.ganancia)}</td>
                    {datos.personas.map((pe) => {
                      const x = r.personas.find((y) => y.personaId === pe.id);
                      return (
                        <td key={pe.id} className={cn("py-2.5 pr-3 text-right tabular-nums", pe.id === datos.miPersonaId ? "font-semibold text-white" : "text-fog")}>
                          {pesos(x?.total ?? 0)}
                          {x && x.horas > 0 && <span className="block text-[0.68rem] font-normal text-fog-dim">{horasTxt(x.horas)}</span>}
                        </td>
                      );
                    })}
                    <td className="py-2.5 text-right tabular-nums text-lime">{pesos(r.empresa)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Tarjeta>

      <p className="pb-2 text-center text-xs text-fog-dim">
        Cómo se calcula: de la ganancia de cada proyecto, {datos.config.bolsaTrabajoPct} % se reparte por horas y el resto con los porcentajes de socio (pestaña Reparto en Finanzas).
      </p>

      {editando && (
        <Hoja titulo={editando === "nueva" ? "Agregar persona" : `Editar a ${editando.nombre}`} onClose={() => setEditando(null)}>
          <FormPersona p={editando === "nueva" ? undefined : editando} onListo={() => setEditando(null)} />
        </Hoja>
      )}
    </PanelPage>
  );
}

function FormPersona({ p, onListo }: { p?: Persona; onListo: () => void }) {
  const acc = useAccion();
  const [esSocio, setEsSocio] = useState(p?.esSocio ?? true);
  const [activo, setActivo] = useState(p?.activo ?? true);
  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    acc.correr(() => guardarPersona({ id: p?.id, nombre: String(f.get("nombre") ?? ""), area: String(f.get("area") ?? ""), esSocio, activo }), onListo);
  };
  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <Campo etiqueta="Nombre *">
        <input name="nombre" defaultValue={p?.nombre} maxLength={60} className="pn-input" />
      </Campo>
      <Campo etiqueta="Área *" ayuda="Se usa al registrar sus horas.">
        <input name="area" defaultValue={p?.area} maxLength={60} placeholder="Diseño, Comercial, Tecnología…" className="pn-input" />
      </Campo>
      <div className="flex flex-wrap gap-2">
        <BotonSecundario type="button" aria-pressed={esSocio} onClick={() => setEsSocio((v) => !v)} className={cn(esSocio && "border-brand bg-brand/20")}>
          {esSocio ? "✓ Es socio" : "No es socio"}
        </BotonSecundario>
        {p && (
          <BotonSecundario type="button" aria-pressed={activo} onClick={() => setActivo((v) => !v)} className={cn(activo && "border-brand bg-brand/20")}>
            {activo ? "✓ Activo" : "Inactivo"}
          </BotonSecundario>
        )}
      </div>
      <p className="text-xs text-fog-dim">
        {p ? "Si deja el equipo, márcalo inactivo: sus proyectos pasados se conservan." : "Entra con 0 %: asígnale su porcentaje en Finanzas → Reparto."}
      </p>
      <MensajeError error={acc.error} />
      <BotonPrincipal type="submit" pendiente={acc.pendiente} className="w-full">
        {p ? "Guardar" : "Agregar"}
      </BotonPrincipal>
    </form>
  );
}
