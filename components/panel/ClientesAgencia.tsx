"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ExternalLink, History, MapPin, MessageCircle, Phone, Plus, Search, Trash2 } from "lucide-react";
import type { ClienteAgencia, DatosClientes } from "@/lib/panel/clientes/datos";
import type { EventoHistorial } from "@/lib/panel/historial";
import { fechaCorta, numero, pesos } from "@/lib/panel/formato";
import { borrarCliente, guardarCliente, verHistorialCliente } from "@/app/(panel)/panel/(app)/clientes/acciones";
import { mascaraCelular, mascaraNombre } from "@/lib/panel/mascaras";
import { InputCelular, InputInstagram, InputUrl, SelectorLugar } from "./campos";
import Historial from "./Historial";
import { Hoja } from "./Clientes";
import { PanelHeader, PanelPage, Pill, Tarjeta } from "./ui";
import { AvisoAcceso, BotonPrincipal, BotonSecundario, Campo, LeyendaObligatorios, MensajeError, useAccion } from "./finanzas/comun";
import { cn } from "@/lib/utils";

// Clientes de Arata San con datos reales (D-110): quién es, de dónde llegó,
// qué servicios ha pedido y si hay un proyecto en curso. Los proyectos vienen de Finanzas.

const ORIGENES = ["Instagram", "Google", "WhatsApp", "Referido", "Página", "Publicidad", "Evento", "Otro"] as const;
const ESTADOS = [
  { valor: "nuevo", label: "Nuevo", tono: "morado" },
  { valor: "activo", label: "Activo", tono: "neutro" },
  { valor: "recurrente", label: "Recurrente", tono: "lima" },
  { valor: "inactivo", label: "Inactivo", tono: "alerta" },
] as const;
const estadoP = { propuesta: { l: "Propuesta", t: "neutro" }, "en-curso": { l: "En curso", t: "morado" }, cerrado: { l: "Cerrado", t: "lima" } } as const;

const enCurso = (c: ClienteAgencia) => c.proyectos.filter((p) => p.estado !== "cerrado");
const comprado = (c: ClienteAgencia) => c.proyectos.filter((p) => p.estado === "cerrado").reduce((a, p) => a + p.valor, 0);
const titulo = (c: ClienteAgencia) => c.empresa ?? c.nombre;
// Colombia: se antepone 57; otros países ya traen su indicativo
const wa = (c: ClienteAgencia) => `https://wa.me/${c.pais === "CO" ? "57" + c.telefono.replace(/^57(?=\d{10}$)/, "") : c.telefono}?text=${encodeURIComponent(`Hola ${c.nombre.split(" ")[0]}, `)}`;

type Filtro = "todos" | "en-curso" | "origen";

export default function ClientesAgencia({ datos }: { datos: DatosClientes }) {
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [origen, setOrigen] = useState<string>("");
  const [abierto, setAbierto] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);

  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    return datos.clientes
      .filter((c) => filtro !== "en-curso" || enCurso(c).length > 0)
      .filter((c) => !origen || c.origen === origen)
      .filter((c) => !t || [c.nombre, c.empresa, c.telefono, c.ciudad, c.paisNombre].some((v) => v?.toLowerCase().includes(t)));
  }, [datos.clientes, q, filtro, origen]);

  const resumen = useMemo(() => {
    const cs = datos.clientes;
    const conCurso = cs.filter((c) => enCurso(c).length).length;
    const total = cs.reduce((a, c) => a + comprado(c), 0);
    const porOrigen = ORIGENES.map((o) => ({ o, n: cs.filter((c) => c.origen === o).length })).filter((x) => x.n).sort((a, b) => b.n - a.n);
    return { total: cs.length, conCurso, comprado: total, origenTop: porOrigen[0] };
  }, [datos.clientes]);

  const actual = datos.clientes.find((c) => c.id === abierto) ?? null;

  return (
    <PanelPage>
      <PanelHeader
        titulo="Clientes"
        bajada="Quién te ha comprado, de dónde llegó, qué servicios ha pedido y con quién tienes un proyecto en curso."
        accion={
          datos.puedeEditar ? (
            <BotonPrincipal type="button" onClick={() => setCreando(true)} className="inline-flex items-center gap-2">
              <Plus aria-hidden className="h-4 w-4" /> Agregar cliente
            </BotonPrincipal>
          ) : undefined
        }
      />
      <AvisoAcceso demo={false} puedeEditar={datos.puedeEditar} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          { k: "Clientes", v: numero(resumen.total) },
          { k: "Con proyecto en curso", v: numero(resumen.conCurso) },
          { k: "Han comprado (cerrados)", v: pesos(resumen.comprado) },
          { k: "Llegan más por", v: resumen.origenTop ? `${resumen.origenTop.o} (${resumen.origenTop.n})` : "—" },
        ].map((s) => (
          <div key={s.k} className="v2-card p-4 sm:p-5">
            <p className="text-xs text-fog">{s.k}</p>
            <p className="mt-2 truncate font-display text-[clamp(1.2rem,2.2vw,1.6rem)] font-bold leading-none text-white">{s.v}</p>
          </div>
        ))}
      </div>

      <Tarjeta>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-sm">
            <span className="sr-only">Buscar cliente</span>
            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fog-dim" />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por negocio, nombre, celular o ciudad" className="pn-input pl-9" />
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { v: "todos" as const, l: "Todos" },
              { v: "en-curso" as const, l: `En curso (${resumen.conCurso})` },
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
            <select aria-label="Filtrar por origen" value={origen} onChange={(e) => setOrigen(e.target.value)} className="pn-input h-9 w-auto py-0 text-xs">
              <option value="">Todos los orígenes</option>
              {ORIGENES.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>

        {datos.clientes.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-fog">Todavía no hay clientes.</p>
            {datos.puedeEditar && <p className="mt-1 text-xs text-fog-dim">Agrégalos aquí o desde un proyecto nuevo en Finanzas.</p>}
          </div>
        ) : visibles.length === 0 ? (
          <p className="py-10 text-center text-sm text-fog">No hay clientes con esa búsqueda.</p>
        ) : (
          <ul className="mt-4 divide-y divide-white/6">
            {visibles.map((c) => {
              const curso = enCurso(c);
              const ultimo = c.proyectos[0];
              const e = ESTADOS.find((x) => x.valor === c.estado)!;
              return (
                <li key={c.id}>
                  <button type="button" onClick={() => setAbierto(c.id)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 py-3.5 text-left hover:bg-surface-2/40">
                    <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 font-display text-sm font-bold text-brand-soft">
                      {titulo(c).slice(0, 1).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1 basis-48">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-medium text-white">{titulo(c)}</span>
                        <Pill tono={e.tono}>{e.label}</Pill>
                        {curso.length > 0 && <Pill tono="lima">Proyecto en curso</Pill>}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-fog-dim">
                        {[c.empresa ? c.nombre : null, c.origen ? `llegó por ${c.origen}` : null, c.ciudad].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    <span className="grid grid-cols-2 gap-4 text-right text-sm sm:w-72">
                      <span className="min-w-0">
                        <span className="block text-[0.68rem] text-fog-dim">Último servicio</span>
                        <span className="block truncate text-fog">{ultimo?.servicio ?? "—"}</span>
                      </span>
                      <span>
                        <span className="block text-[0.68rem] text-fog-dim">Ha comprado</span>
                        <span className="font-display font-bold text-white">{pesos(comprado(c))}</span>
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
        <Hoja titulo={titulo(actual)} onClose={() => setAbierto(null)}>
          <Ficha c={actual} datos={datos} puedeEditar={datos.puedeEditar} puedeBorrar={datos.puedeBorrar} onBorrado={() => setAbierto(null)} />
        </Hoja>
      )}
      {creando && (
        <Hoja titulo="Agregar cliente" onClose={() => setCreando(false)}>
          <FormCliente datos={datos} onListo={() => setCreando(false)} />
        </Hoja>
      )}
    </PanelPage>
  );
}

function Ficha({ c, datos, puedeEditar, puedeBorrar, onBorrado }: { c: ClienteAgencia; datos: DatosClientes; puedeEditar: boolean; puedeBorrar: boolean; onBorrado: () => void }) {
  const [editando, setEditando] = useState(false);
  const [historial, setHistorial] = useState<EventoHistorial[] | null>(null);
  const acc = useAccion();
  // El historial del cliente se pide al abrir la ficha (y otra vez al terminar de editar)
  useEffect(() => {
    if (!editando) verHistorialCliente(c.id).then(setHistorial);
  }, [c.id, editando]);
  if (editando) return <FormCliente c={c} datos={datos} onListo={() => setEditando(false)} />;
  const curso = enCurso(c);
  const e = ESTADOS.find((x) => x.valor === c.estado)!;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Pill tono={e.tono}>{e.label}</Pill>
        {curso.length > 0 ? <Pill tono="lima">{curso.length === 1 ? "1 proyecto en curso" : `${curso.length} proyectos en curso`}</Pill> : <Pill>Sin proyecto en curso</Pill>}
      </div>

      <dl className="grid grid-cols-3 gap-2">
        {[
          { k: "Proyectos", v: String(c.proyectos.length) },
          { k: "Ha comprado", v: pesos(comprado(c)) },
          { k: "Cliente desde", v: fechaCorta(c.creado) },
        ].map((x) => (
          <div key={x.k} className="rounded-frame border border-white/8 bg-surface-1 p-3">
            <dt className="text-[0.7rem] text-fog-dim">{x.k}</dt>
            <dd className="mt-1 truncate font-display text-sm font-bold text-white">{x.v}</dd>
          </div>
        ))}
      </dl>

      <a href={wa(c)} target="_blank" rel="noopener noreferrer" className="v2-shine flex h-11 w-full items-center justify-center gap-2 rounded-btn bg-lime text-sm font-semibold text-ink hover:bg-[#C6FF33]">
        <MessageCircle aria-hidden className="h-4 w-4" /> Escribirle por WhatsApp
      </a>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-white">Datos</h3>
        <ul className="space-y-2 text-sm text-fog">
          <li className="text-white">{c.nombre}{c.empresa && <span className="text-fog"> · {c.empresa}</span>}</li>
          <li className="flex items-center gap-2"><Phone aria-hidden className="h-4 w-4 text-brand-soft" />{mascaraCelular(c.telefono, c.pais)}</li>
          <li className="flex items-center gap-2"><MapPin aria-hidden className="h-4 w-4 text-brand-soft" />{[c.ciudad, c.paisNombre].filter(Boolean).join(", ")}</li>
          {c.sitioWeb && (
            <li>
              <a href={c.sitioWeb} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-white">
                <ExternalLink aria-hidden className="h-4 w-4 text-brand-soft" /> {c.sitioWeb.replace(/^https:\/\//, "")}
              </a>
            </li>
          )}
          {c.instagram && <li className="pl-6">{c.instagram}</li>}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-white">De dónde llegó</h3>
        <p className="text-sm text-fog">
          {c.origen ? <strong className="font-semibold text-white">{c.origen}</strong> : "Sin registrar"}
          {c.origenDetalle && <> — {c.origenDetalle}</>}
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-white">Servicios y proyectos</h3>
        {c.proyectos.length === 0 ? (
          <p className="text-sm text-fog-dim">Todavía no tiene proyectos. Se crean en Finanzas → Proyectos.</p>
        ) : (
          <ul className="divide-y divide-white/6 rounded-frame border border-white/8 bg-surface-1">
            {c.proyectos.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-3 py-2.5">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-white">{p.servicio ?? p.nombre}</span>
                  <span className="block truncate text-[0.7rem] text-fog-dim">
                    {p.nombre} · {p.fechaCierre ? `cerró ${fechaCorta(p.fechaCierre)}` : `desde ${fechaCorta(p.creado)}`}
                  </span>
                </span>
                <Pill tono={estadoP[p.estado].t}>{estadoP[p.estado].l}</Pill>
                <span className="shrink-0 font-display text-sm font-bold text-white">{pesos(p.valor)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {c.notas && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-white">Notas</h3>
          <p className="whitespace-pre-line text-sm text-fog">{c.notas}</p>
        </section>
      )}

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
          <History aria-hidden className="h-4 w-4 text-brand-soft" /> Historial
        </h3>
        {historial === null ? <p className="text-sm text-fog-dim">Cargando…</p> : <Historial eventos={historial} vacio="Sin cambios registrados todavía." />}
      </section>

      {puedeEditar && (
        <div className="flex flex-wrap gap-2 border-t border-white/8 pt-4">
          <BotonSecundario type="button" onClick={() => setEditando(true)}>Editar cliente</BotonSecundario>
          {puedeBorrar && c.proyectos.length === 0 && (
            <BotonSecundario
              type="button"
              className="text-[#FF9BB0]"
              onClick={() => window.confirm(`¿Borrar a ${titulo(c)} para siempre? No se puede deshacer y queda en el historial quién lo borró.`) && acc.correr(() => borrarCliente(c.id), onBorrado)}
            >
              <Trash2 aria-hidden className="h-4 w-4" /> Borrar
            </BotonSecundario>
          )}
        </div>
      )}
      <MensajeError error={acc.error} />
    </div>
  );
}

function FormCliente({ c, datos, onListo }: { c?: ClienteAgencia; datos: DatosClientes; onListo: () => void }) {
  const acc = useAccion();
  const [pais, setPais] = useState(c?.pais ?? "CO");
  const [ciudadId, setCiudadId] = useState(c?.ciudadId ?? "");
  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? "");
    acc.correr(
      () =>
        guardarCliente({
          id: c?.id,
          nombre: v("nombre"),
          empresa: v("empresa"),
          telefono: v("telefono"),
          pais,
          ciudadId: pais === "CO" ? ciudadId : "",
          sitioWeb: v("sitioWeb"),
          instagram: v("instagram"),
          estado: v("estado"),
          origen: v("origen"),
          origenDetalle: v("origenDetalle"),
          notas: v("notas"),
        }),
      onListo
    );
  };
  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <LeyendaObligatorios />
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo etiqueta="Nombre de la persona *">
          <NombreInput name="nombre" inicial={c?.nombre ?? ""} autoComplete="name" />
        </Campo>
        <Campo etiqueta="Negocio o empresa" obligatorio={false}>
          <NombreInput name="empresa" inicial={c?.empresa ?? ""} autoComplete="organization" max={90} />
        </Campo>
        <InputCelular key={pais} inicial={c?.telefono ?? ""} pais={pais} />
        <Campo etiqueta="Estado *">
          <select name="estado" defaultValue={c?.estado ?? "nuevo"} className="pn-input">
            {ESTADOS.map((x) => (
              <option key={x.valor} value={x.valor}>{x.label}</option>
            ))}
          </select>
        </Campo>
      </div>
      <SelectorLugar
        paises={datos.paises}
        ciudades={datos.ciudades}
        pais={pais}
        ciudadId={ciudadId}
        puedeAgregar={datos.puedeEditar}
        onCambio={(p, ci) => {
          setPais(p);
          setCiudadId(ci);
        }}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <InputUrl inicial={c?.sitioWeb ?? ""} />
        <InputInstagram inicial={c?.instagram ?? ""} />
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_1.6fr]">
        <Campo etiqueta="De dónde llegó" obligatorio={false}>
          <select name="origen" defaultValue={c?.origen ?? ""} className="pn-input">
            <option value="">Sin registrar</option>
            {ORIGENES.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Detalle" obligatorio={false}>
          <input name="origenDetalle" defaultValue={c?.origenDetalle ?? ""} maxLength={200} placeholder="Ej. lo refirió Andrés, campaña de noviembre…" className="pn-input" />
        </Campo>
      </div>
      <Campo etiqueta="Notas" obligatorio={false}>
        <textarea name="notas" defaultValue={c?.notas ?? ""} rows={3} maxLength={2000} className="pn-input h-auto py-2.5" />
      </Campo>
      <MensajeError error={acc.error} />
      <BotonPrincipal type="submit" pendiente={acc.pendiente} className="w-full">
        {c ? "Guardar cambios" : "Agregar cliente"}
      </BotonPrincipal>
    </form>
  );
}

/** Texto de nombre: sin espacios dobles ni al inicio. */
function NombreInput({ name, inicial, autoComplete, max = 80 }: { name: string; inicial: string; autoComplete?: string; max?: number }) {
  const [v, setV] = useState(inicial);
  return <input name={name} value={v} maxLength={max} autoComplete={autoComplete} autoCapitalize="words" onChange={(e) => setV(mascaraNombre(e.target.value))} className="pn-input" />;
}
