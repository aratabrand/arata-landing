"use client";

import { useState, type FormEvent } from "react";
import { Bell, CircleCheck, Send, Trash2, X } from "../iconos";
import {
  AREAS,
  ESTADOS_TAREA,
  PRIORIDADES_TAREA,
  RECORDATORIOS,
  avanceItems,
  cuandoLlega,
  duracion,
  rangoTexto,
  diasLaborales,
  fechaCorta,
  lunesDe,
  semanaDeTrabajo,
  partesDia,
  sumarDias,
  type Area,
  type EstadoTarea,
  type PersonaTarea,
  type PrioridadTarea,
  type Recordatorio,
  type ProyectoTarea,
  type Tarea,
} from "@/lib/panel/tareas/tareas";
import { agregarItem, borrarItem, borrarTarea, comentarTarea, guardarTarea, marcarItem } from "@/app/(panel)/panel/(app)/tareas/acciones";
import { BotonPrincipal, BotonSecundario, Campo, MensajeError, useAccion } from "../finanzas/comun";
import { cn } from "@/lib/utils";

// Ficha de una tarea (D-181): crear o editar todo, lista de chequeo y comentarios.

const opciones = <T extends string>(o: Record<T, string>) => Object.entries(o) as [T, string][];

function Pildora({ activa, onClick, children }: { activa: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={activa} onClick={onClick} className={cn("min-h-9 rounded-full border px-3 py-1.5 text-xs font-semibold", activa ? "pn-pildora-activa" : "pn-pildora hover:text-white")}>
      {children}
    </button>
  );
}

export type NuevaTarea = { fecha?: string | null; proyectoId?: string | null; responsableIds?: string[]; area?: Area; estado?: EstadoTarea };

export default function FichaTarea({
  tarea,
  nueva,
  personas,
  proyectos,
  hoy,
  puedeBorrar,
  onListo,
}: {
  tarea: Tarea | null;
  nueva?: NuevaTarea;
  personas: PersonaTarea[];
  proyectos: ProyectoTarea[];
  hoy: string;
  puedeBorrar: boolean;
  /** Se guardó (nueva) o se borró: cerrar la ficha. */
  onListo: () => void;
}) {
  const acc = useAccion();
  const [guardado, setGuardado] = useState(false);
  const [estado, setEstado] = useState<EstadoTarea>(tarea?.estado ?? nueva?.estado ?? "por_hacer");
  const [prioridad, setPrioridad] = useState<PrioridadTarea>(tarea?.prioridad ?? "media");
  const [fecha, setFechaInicio] = useState<string>(tarea ? (tarea.fecha ?? "") : nueva?.fecha === undefined ? hoy : (nueva.fecha ?? ""));
  // Rango (D-187): «Hasta» es opcional; vacío = la tarea es de un solo día
  const [fechaFin, setFechaFin] = useState<string>(tarea?.fechaFin ?? "");
  const setFecha = (f: string) => {
    setFechaInicio(f);
    // Si el inicio queda después del final (o se quita), el final se ajusta
    if (!f || (fechaFin && fechaFin < f)) setFechaFin("");
  };
  // Responsables (D-186): una o varias personas
  const [responsables, setResponsables] = useState<string[]>(tarea?.responsables ?? nueva?.responsableIds ?? []);
  const alternar = (id: string) => setResponsables((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));
  const [recordatorio, setRecordatorio] = useState<Recordatorio | "">(tarea?.recordatorio ?? "");
  const [proyectoId, setProyectoId] = useState(tarea?.proyectoId ?? nueva?.proyectoId ?? "");
  const [area, setArea] = useState<Area>(tarea?.area ?? nueva?.area ?? (nueva?.proyectoId ? "proyectos" : "proyectos"));
  // Días rápidos: lunes a viernes de la semana que se trabaja; «Próx. lunes» si no está ya en la lista
  const semana = diasLaborales(semanaDeTrabajo(hoy));
  const proximoLunes = sumarDias(lunesDe(hoy), 7);

  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setGuardado(false);
    acc.correr(
      () =>
        guardarTarea({
          id: tarea?.id,
          titulo: String(f.get("titulo") ?? ""),
          descripcion: String(f.get("descripcion") ?? ""),
          area,
          proyectoId: proyectoId || null,
          responsableIds: responsables,
          fecha: fecha || null,
          fechaFin: fecha && fechaFin && fechaFin > fecha ? fechaFin : null,
          prioridad,
          estado,
          recordatorio: recordatorio || null,
        }),
      () => (tarea ? setGuardado(true) : onListo())
    );
  };

  return (
    <div className="space-y-6">
      <form onSubmit={enviar} noValidate className="space-y-5">
        <Campo etiqueta="Qué hay que hacer *">
          <input name="titulo" defaultValue={tarea?.titulo ?? ""} required minLength={2} maxLength={160} autoComplete="off" placeholder="Ej. Publicar el carrusel de la semana" className="pn-input" autoFocus={!tarea} />
        </Campo>

        <fieldset className="space-y-2">
          <legend className="text-xs font-medium text-fog">Estado</legend>
          <div className="flex flex-wrap gap-2">
            {opciones(ESTADOS_TAREA).map(([k, l]) => (
              <Pildora key={k} activa={estado === k} onClick={() => setEstado(k)}>
                {l}
              </Pildora>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-xs font-medium text-fog">Prioridad</legend>
          <div className="flex flex-wrap gap-2">
            {opciones(PRIORIDADES_TAREA).map(([k, l]) => (
              <Pildora key={k} activa={prioridad === k} onClick={() => setPrioridad(k)}>
                {l}
              </Pildora>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-xs font-medium text-fog">
            Responsables <span className="text-fog-dim">· {responsables.length === 0 ? "sin asignar" : responsables.length === 1 ? "1 persona" : `${responsables.length} personas`}</span>
          </legend>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Responsables">
            {personas.map((p) => (
              <Pildora key={p.id} activa={responsables.includes(p.id)} onClick={() => alternar(p.id)}>
                {p.nombre}
              </Pildora>
            ))}
          </div>
          <p className="text-[0.7rem] text-fog-dim">Toca para sumar o quitar. A cada persona le llega el aviso.</p>
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-2">
          <Campo etiqueta="Área">
            <select value={area} onChange={(e) => setArea(e.target.value as Area)} className="pn-input">
              {opciones(AREAS).map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
          </Campo>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-xs font-medium text-fog">Desde · {fechaCorta(fecha || null, hoy)}</legend>
          <div className="flex flex-wrap gap-1.5">
            {semana.map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={fecha === d}
                onClick={() => setFecha(d)}
                className={cn("h-9 min-w-[2.75rem] rounded-full border px-2.5 text-xs font-semibold", fecha === d ? "pn-pildora-activa" : "pn-pildora hover:text-white")}
                title={`${partesDia(d).dia} ${partesDia(d).corto}`}
              >
                {d === hoy ? "Hoy" : partesDia(d).dia.slice(0, 3)}
              </button>
            ))}
            {!semana.includes(proximoLunes) && (
              <button type="button" aria-pressed={fecha === proximoLunes} onClick={() => setFecha(proximoLunes)} className={cn("h-9 rounded-full border px-2.5 text-xs font-semibold", fecha === proximoLunes ? "pn-pildora-activa" : "pn-pildora hover:text-white")}>
                Próx. lunes
              </button>
            )}
            <button type="button" aria-pressed={!fecha} onClick={() => setFecha("")} className={cn("h-9 rounded-full border px-2.5 text-xs font-semibold", !fecha ? "pn-pildora-activa" : "pn-pildora hover:text-white")}>
              Sin fecha
            </button>
          </div>
          <input type="date" aria-label="Desde (otra fecha)" value={fecha} onChange={(e) => setFecha(e.target.value)} className="pn-input" />
        </fieldset>

        <fieldset className="space-y-2" disabled={!fecha}>
          <legend className="text-xs font-medium text-fog">
            Hasta <span className="text-fog-dim">· {!fecha ? "elige primero desde cuándo" : fechaFin && fechaFin > fecha ? `${rangoTexto({ fecha, fechaFin }, hoy)} (${duracion({ fecha, fechaFin })} días)` : "el mismo día"}</span>
          </legend>
          <div className="flex items-center gap-2">
            <input
              type="date"
              aria-label="Hasta"
              value={fechaFin}
              min={fecha || undefined}
              onChange={(e) => setFechaFin(e.target.value)}
              className="pn-input min-w-0 flex-1 disabled:opacity-50"
            />
            {fechaFin && (
              <button type="button" onClick={() => setFechaFin("")} className="h-11 shrink-0 rounded-full border px-3 text-xs font-semibold pn-pildora hover:text-white">
                Mismo día
              </button>
            )}
          </div>
        </fieldset>

        <Campo
          etiqueta="Recordatorio"
          obligatorio={false}
          ayuda={
            recordatorio
              ? `${cuandoLlega(recordatorio, (fecha && fechaFin > fecha ? fechaFin : fecha) || null, hoy) ?? "Ponle un día a la tarea para que llegue."} Le llega a quien tiene la tarea y a ti.`
              : "Te avisa al celular antes de que se venza."
          }
        >
          <span className="relative block">
            <Bell aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fog-dim" />
            <select value={recordatorio} onChange={(e) => setRecordatorio(e.target.value as Recordatorio | "")} className="pn-input pl-9">
              <option value="">Sin recordatorio</option>
              {opciones(RECORDATORIOS).map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
          </span>
        </Campo>

        <Campo etiqueta="Proyecto" obligatorio={false}>
          <select
            value={proyectoId}
            onChange={(e) => {
              setProyectoId(e.target.value);
              if (e.target.value) setArea("proyectos");
            }}
            className="pn-input"
          >
            <option value="">Ninguno (tarea del área)</option>
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </Campo>

        <Campo etiqueta="Detalles" obligatorio={false}>
          <textarea name="descripcion" defaultValue={tarea?.descripcion ?? ""} rows={3} maxLength={4000} placeholder="Enlaces, qué se espera, cómo se entrega…" className="pn-input h-auto py-2.5" />
        </Campo>

        <MensajeError error={acc.error} />
        {guardado && !acc.pendiente && (
          <p role="status" className="text-sm text-fog">
            Guardado.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <BotonPrincipal type="submit" pendiente={acc.pendiente} className="flex-1">
            {tarea ? "Guardar cambios" : "Crear tarea"}
          </BotonPrincipal>
          {tarea && puedeBorrar && (
            <BotonSecundario type="button" className="text-alerta" onClick={() => window.confirm(`¿Borrar la tarea «${tarea.titulo}»? No se puede deshacer.`) && acc.correr(() => borrarTarea(tarea.id), onListo)}>
              <Trash2 aria-hidden className="h-4 w-4" /> Borrar
            </BotonSecundario>
          )}
        </div>
      </form>

      {tarea && <ListaChequeo tarea={tarea} />}
      {tarea && <Comentarios tarea={tarea} />}
    </div>
  );
}

function ListaChequeo({ tarea }: { tarea: Tarea }) {
  const acc = useAccion();
  const [texto, setTexto] = useState("");
  // Se marca al instante; el servidor confirma después (si falla, vuelve a lo guardado)
  const [marcados, setMarcados] = useState<Record<string, boolean>>({});
  const items = tarea.items.map((i) => ({ ...i, hecho: marcados[i.id] ?? i.hecho }));
  const { hechos, total } = avanceItems(items);
  const marcar = (id: string, hecho: boolean) => {
    setMarcados((m) => ({ ...m, [id]: hecho }));
    acc.correr(() => marcarItem(id, hecho)).then((bien) => {
      if (!bien)
        setMarcados((m) => {
          const resto = { ...m };
          delete resto[id];
          return resto;
        });
    });
  };
  return (
    <section className="space-y-3 border-t border-white/8 pt-5">
      <h3 className="flex items-center justify-between text-sm font-semibold text-white">
        Lista de chequeo
        {total > 0 && (
          <span className="text-xs font-normal text-fog-dim">
            {hechos} de {total}
          </span>
        )}
      </h3>
      {total > 0 && (
        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]" aria-hidden>
          <div className="h-full origin-left rounded-full bg-[#B6FF00] transition-transform" style={{ transform: `scaleX(${hechos / total})` }} />
        </div>
      )}
      <ul className="space-y-1">
        {items.map((i) => (
          <li key={i.id} className="group flex items-center gap-3 rounded-frame px-1 py-1.5">
            <input type="checkbox" checked={i.hecho} onChange={(e) => marcar(i.id, e.target.checked)} aria-label={i.texto} className="h-4 w-4 shrink-0 accent-lime" />
            <span className={cn("min-w-0 flex-1 text-sm", i.hecho ? "text-fog-dim line-through" : "text-fog")}>{i.texto}</span>
            <button type="button" onClick={() => acc.correr(() => borrarItem(i.id))} aria-label={`Quitar «${i.texto}»`} className="flex h-8 w-8 items-center justify-center rounded-full text-fog-dim hover:text-white">
              <X aria-hidden className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!texto.trim()) return;
          acc.correr(() => agregarItem(tarea.id, texto), () => setTexto(""));
        }}
        className="flex gap-2"
      >
        <input value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={200} placeholder="Agregar un paso" aria-label="Nuevo paso" className="pn-input flex-1" />
        <BotonSecundario type="submit" disabled={acc.pendiente || !texto.trim()}>
          Agregar
        </BotonSecundario>
      </form>
      <MensajeError error={acc.error} />
    </section>
  );
}

function Comentarios({ tarea }: { tarea: Tarea }) {
  const acc = useAccion();
  const [texto, setTexto] = useState("");
  return (
    <section className="space-y-3 border-t border-white/8 pt-5">
      <h3 className="text-sm font-semibold text-white">Comentarios</h3>
      {tarea.comentarios.length === 0 ? (
        <p className="text-sm text-fog-dim">Todavía no hay comentarios.</p>
      ) : (
        <ul className="space-y-2">
          {tarea.comentarios.map((c) => (
            <li key={c.id} className="pn-cita rounded-frame p-3 text-sm">
              <p className="whitespace-pre-line text-fog">{c.texto}</p>
              <p className="mt-1.5 text-[0.7rem] text-fog-dim">
                {c.quien.split(" ")[0]} · {new Date(c.creado).toLocaleString("es-CO", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "America/Bogota" })}
              </p>
            </li>
          ))}
        </ul>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!texto.trim()) return;
          acc.correr(() => comentarTarea(tarea.id, texto), () => setTexto(""));
        }}
        className="space-y-2"
      >
        <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={2} maxLength={1000} placeholder="Escribe un comentario" aria-label="Nuevo comentario" className="pn-input h-auto py-2.5" />
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-fog-dim">{tarea.responsables.length ? (tarea.responsables.length === 1 ? "Le llega aviso a quien tiene la tarea." : "Les llega aviso a quienes tienen la tarea.") : ""}</p>
          <BotonSecundario type="submit" disabled={acc.pendiente || !texto.trim()}>
            <Send aria-hidden className="h-4 w-4" /> Comentar
          </BotonSecundario>
        </div>
      </form>
      <MensajeError error={acc.error} />
      {tarea.estado === "hecha" && (
        <p className="flex items-center gap-2 text-xs text-fog-dim">
          <CircleCheck aria-hidden className="h-4 w-4" /> Tarea terminada.
        </p>
      )}
    </section>
  );
}
