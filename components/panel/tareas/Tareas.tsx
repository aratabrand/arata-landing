"use client";

import { Fragment, useEffect, useMemo, useState, type DragEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, CalendarioSemana, ChatBubble, Check, SquareKanban as Kanban, ChevronLeft, ChevronRight, Circle, CircleCheck, CircleMedio, ListChecks, Plus, Search, Tabla } from "../iconos";
import {
  AREAS,
  ESTADOS_TAREA,
  PRIORIDADES_TAREA,
  avanceItems,
  diasDeSemana,
  diasLaborales,
  fechaCorta,
  lunesDe,
  ordenarDia,
  ordenarTabla,
  partesDia,
  rangoSemana,
  semanaDeTrabajo,
  sumarDias,
  vencida,
  type Area,
  type Columna,
  type EstadoTarea,
  type PrioridadTarea,
  type Tarea,
} from "@/lib/panel/tareas/tareas";
import type { DatosTareas } from "@/lib/panel/tareas/datos";
import { cambiarEstadoTarea, moverTarea } from "@/app/(panel)/panel/(app)/tareas/acciones";
import { Hoja } from "../Clientes";
import { PanelHeader, PanelPage, Pill, type TonoPill } from "../ui";
import { BotonPrincipal, BotonSecundario, MensajeError } from "../finanzas/comun";
import FichaTarea, { type NuevaTarea } from "./FichaTarea";
import { cn } from "@/lib/utils";

// Tareas del equipo (D-181): tablero de la semana (lunes a domingo, arrastrar entre días)
// y tabla tipo Notion (ordenar por columna, filtros). Clic en una tarea → su ficha.

// Semáforo (D-183): rojo = atender ya, ámbar = en camino o pronto, verde = bien; baja en gris (sin apuro)
const TONO_PRIORIDAD: Record<PrioridadTarea, TonoPill> = { urgente: "alerta", alta: "ambar", media: "verde", baja: "neutro" };
const TONO_ESTADO: Record<EstadoTarea, TonoPill> = { por_hacer: "alerta", en_curso: "ambar", hecha: "verde" };
const SIGUIENTE: Record<EstadoTarea, EstadoTarea> = { por_hacer: "en_curso", en_curso: "hecha", hecha: "por_hacer" };
const opciones = <T extends string>(o: Record<T, string>) => Object.entries(o) as [T, string][];

// D-184: la vista general es el tablero por estado (como Notion); la semana y la tabla son otras opciones
type Vista = "estados" | "semana" | "tabla";
type Abierta = { tipo: "tarea"; id: string } | { tipo: "nueva"; datos: NuevaTarea } | null;

export default function Tareas({ datos, abrir, nueva }: { datos: DatosTareas; abrir?: string; nueva?: NuevaTarea }) {
  const router = useRouter();
  const path = usePathname();
  const { hoy, personas, proyectos } = datos;
  // Copia local para mover al instante al arrastrar (el servidor confirma después)
  const [tareas, setTareas] = useState(datos.tareas);
  useEffect(() => setTareas(datos.tareas), [datos.tareas]);
  const [vista, setVista] = useState<Vista>("estados");
  const [lunes, setLunes] = useState(semanaDeTrabajo(hoy));
  const [quien, setQuien] = useState<string>(""); // "" todas · "yo" · id de persona · "nadie"
  const [area, setArea] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [abierta, setAbierta] = useState<Abierta>(abrir ? { tipo: "tarea", id: abrir } : nueva ? { tipo: "nueva", datos: nueva } : null);
  const [error, setError] = useState("");

  const nombreDe = (id: string | null) => personas.find((p) => p.id === id)?.nombre ?? "Sin asignar";
  const proyectoDe = (id: string | null) => proyectos.find((p) => p.id === id)?.nombre ?? null;

  const filtradas = useMemo(
    () =>
      tareas
        .filter((t) => (quien === "" ? true : quien === "yo" ? t.responsableId === datos.yo : quien === "nadie" ? !t.responsableId : t.responsableId === quien))
        .filter((t) => !area || t.area === area)
        .filter((t) => !prioridad || t.prioridad === prioridad),
    [tareas, quien, area, prioridad, datos.yo]
  );

  const resumen = useMemo(() => {
    const pend = filtradas.filter((t) => t.estado !== "hecha");
    const dias = new Set(diasDeSemana(lunesDe(hoy)));
    return {
      hoy: pend.filter((t) => t.fecha === hoy).length,
      vencidas: pend.filter((t) => vencida(t, hoy)).length,
      enCurso: pend.filter((t) => t.estado === "en_curso").length,
      hechasSemana: filtradas.filter((t) => t.estado === "hecha" && t.fecha && dias.has(t.fecha)).length,
    };
  }, [filtradas, hoy]);

  const cerrar = () => {
    setAbierta(null);
    // Quita ?t= o ?nueva= de la dirección sin recargar
    if (abrir || nueva) router.replace(path, { scroll: false });
  };

  async function cambiarEstado(t: Tarea, a?: EstadoTarea) {
    const nuevo = a ?? SIGUIENTE[t.estado];
    if (nuevo === t.estado) return;
    setTareas((l) => l.map((x) => (x.id === t.id ? { ...x, estado: nuevo } : x)));
    const r = await cambiarEstadoTarea(t.id, nuevo).catch(() => ({ ok: false as const, error: "Sin conexión." }));
    if (!r.ok) setError(r.error);
    router.refresh();
  }

  async function mover(id: string, fecha: string | null, antesDe: string | null) {
    setTareas((l) => {
      const t = l.find((x) => x.id === id);
      if (!t) return l;
      const resto = l.filter((x) => x.id !== id);
      const delDia = ordenarDia(resto.filter((x) => x.fecha === fecha));
      const i = antesDe ? delDia.findIndex((x) => x.id === antesDe) : -1;
      delDia.splice(i < 0 ? delDia.length : i, 0, { ...t, fecha });
      const orden = new Map(delDia.map((x, n) => [x.id, n + 1]));
      return [...resto.filter((x) => x.fecha !== fecha), ...delDia].map((x) => (orden.has(x.id) ? { ...x, orden: orden.get(x.id)! } : x));
    });
    const r = await moverTarea({ id, fecha, antesDe }).catch(() => ({ ok: false as const, error: "Sin conexión." }));
    if (!r.ok) setError(r.error);
    router.refresh();
  }

  const actual = abierta?.tipo === "tarea" ? (tareas.find((t) => t.id === abierta.id) ?? null) : null;
  const tarjeta = (t: Tarea) => ({ t, responsable: t.responsableId ? nombreDe(t.responsableId) : null, proyecto: proyectoDe(t.proyectoId), hoy, onAbrir: () => setAbierta({ tipo: "tarea", id: t.id }), onEstado: () => cambiarEstado(t) });

  return (
    <PanelPage>
      <PanelHeader
        titulo="Tareas"
        bajada="Lo que hay que hacer, quién lo hace y para cuándo. Arrastra una tarea para cambiarla de estado o de día."
        accion={
          <BotonPrincipal type="button" onClick={() => setAbierta({ tipo: "nueva", datos: { fecha: hoy, responsableId: quien === "yo" ? datos.yo : null } })} className="inline-flex items-center gap-2">
            <Plus aria-hidden className="h-4 w-4" /> Nueva tarea
          </BotonPrincipal>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          { k: "Para hoy", v: resumen.hoy },
          { k: "Vencidas", v: resumen.vencidas, alerta: resumen.vencidas > 0 },
          { k: "En curso", v: resumen.enCurso },
          { k: "Hechas esta semana", v: resumen.hechasSemana },
        ].map((x) => (
          <div key={x.k} className="v2-card p-4 sm:p-5">
            <p className="text-xs text-fog">{x.k}</p>
            <p className={cn("mt-2 font-display text-[clamp(1.4rem,2.6vw,1.9rem)] font-bold leading-none", x.alerta ? "text-alerta" : "pn-cifra")}>{x.v}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1 rounded-full border border-white/8 p-1" role="group" aria-label="Vista">
            {[
              { v: "estados" as const, l: "Por estado", I: Kanban },
              { v: "semana" as const, l: "Semana", I: CalendarioSemana },
              { v: "tabla" as const, l: "Tabla", I: Tabla },
            ].map(({ v, l, I }) => (
              <button key={v} type="button" aria-pressed={vista === v} onClick={() => setVista(v)} className={cn("inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold", vista === v ? "pn-pildora-activa" : "text-fog hover:text-white")}>
                <I aria-hidden className="h-4 w-4" /> {l}
              </button>
            ))}
          </div>
          {datos.yo && (
            <button type="button" aria-pressed={quien === "yo"} onClick={() => setQuien(quien === "yo" ? "" : "yo")} className={cn("h-10 rounded-full border px-3.5 text-xs font-semibold", quien === "yo" ? "pn-pildora-activa" : "pn-pildora hover:text-white")}>
              Mis tareas
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex">
          <select aria-label="Filtrar por responsable" value={quien} onChange={(e) => setQuien(e.target.value)} className="pn-input h-9 w-full py-0 text-xs sm:w-auto">
            <option value="">Equipo</option>
            {datos.yo && <option value="yo">Mis tareas</option>}
            {personas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
            <option value="nadie">Sin asignar</option>
          </select>
          <select aria-label="Filtrar por área" value={area} onChange={(e) => setArea(e.target.value)} className="pn-input h-9 w-full py-0 text-xs sm:w-auto">
            <option value="">Área</option>
            {opciones(AREAS).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
          <select aria-label="Filtrar por prioridad" value={prioridad} onChange={(e) => setPrioridad(e.target.value)} className="pn-input h-9 w-full py-0 text-xs sm:w-auto">
            <option value="">Prioridad</option>
            {opciones(PRIORIDADES_TAREA).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>
      <MensajeError error={error} />

      {vista === "estados" ? (
        <Estados
          tareas={filtradas}
          hoy={hoy}
          nombreDe={nombreDe}
          proyectoDe={proyectoDe}
          onAbrir={(id) => setAbierta({ tipo: "tarea", id })}
          onEstado={cambiarEstado}
          onNueva={(estado) => setAbierta({ tipo: "nueva", datos: { fecha: hoy, estado, responsableId: quien === "yo" ? datos.yo : quien && quien !== "nadie" ? quien : null } })}
        />
      ) : vista === "semana" ? (
        <Semana
          tareas={filtradas}
          lunes={lunes}
          hoy={hoy}
          onSemana={setLunes}
          tarjeta={tarjeta}
          onMover={mover}
          onNueva={(fecha) => setAbierta({ tipo: "nueva", datos: { fecha, responsableId: quien === "yo" ? datos.yo : quien && quien !== "nadie" ? quien : null } })}
        />
      ) : (
        <TablaTareas tareas={filtradas} hoy={hoy} nombreDe={nombreDe} proyectoDe={proyectoDe} onAbrir={(id) => setAbierta({ tipo: "tarea", id })} onEstado={(t) => cambiarEstado(t)} />
      )}

      {abierta && (abierta.tipo === "nueva" || actual) && (
        <Hoja titulo={actual ? "Tarea" : "Nueva tarea"} onClose={cerrar}>
          <FichaTarea
            key={actual?.id ?? "nueva"}
            tarea={actual}
            nueva={abierta.tipo === "nueva" ? abierta.datos : undefined}
            personas={personas}
            proyectos={proyectos}
            hoy={hoy}
            puedeBorrar={datos.puedeBorrar}
            onListo={cerrar}
          />
        </Hoja>
      )}
    </PanelPage>
  );
}

/* ── Tarjeta ───────────────────────────────────────────────────────── */

type DatosTarjeta = { t: Tarea; responsable: string | null; proyecto: string | null; hoy: string; onAbrir: () => void; onEstado: () => void };

function IconoEstado({ estado }: { estado: EstadoTarea }) {
  if (estado === "hecha") return <CircleCheck aria-hidden className="h-5 w-5 text-verde" />;
  if (estado === "en_curso") return <CircleMedio aria-hidden className="h-5 w-5 text-ambar" />;
  return <Circle aria-hidden className="h-5 w-5 text-fog-dim" />;
}

/** Responsable con su nombre (D-183): primer nombre, en píldora. */
function Responsable({ nombre }: { nombre: string }) {
  return <span className="inline-flex max-w-[8rem] truncate rounded-full bg-white/[0.08] px-2 py-0.5 text-[0.7rem] font-semibold text-white">{nombre.split(" ")[0]}</span>;
}

function TarjetaTarea({ t, responsable, proyecto, hoy, onAbrir, onEstado, arrastrable, onArrastre }: DatosTarjeta & { arrastrable?: boolean; onArrastre?: (e: DragEvent<HTMLLIElement>) => void }) {
  const { hechos, total } = avanceItems(t.items);
  const tarde = vencida(t, hoy);
  return (
    <li
      draggable={arrastrable}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", t.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={onArrastre}
      data-tarea={t.id}
      className={cn("group rounded-frame border border-white/8 bg-surface-1 p-2 transition-colors hover:border-white/20", arrastrable && "cursor-grab active:cursor-grabbing", t.estado === "hecha" && "opacity-60")}
    >
      <div className="flex items-start gap-1.5">
        <button type="button" onClick={onEstado} aria-label={`Estado: ${ESTADOS_TAREA[t.estado]}. Pasar a ${ESTADOS_TAREA[SIGUIENTE[t.estado]].toLowerCase()}`} className="-m-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full hover:bg-white/[0.06]">
          <IconoEstado estado={t.estado} />
        </button>
        <button type="button" onClick={onAbrir} className="min-w-0 flex-1 text-left">
          <span className={cn("block break-words text-[0.82rem] font-medium leading-snug text-white", t.estado === "hecha" && "line-through")}>{t.titulo}</span>
          {proyecto && <span className="mt-0.5 block truncate text-[0.7rem] text-fog-dim">{proyecto}</span>}
        </button>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <Pill tono={TONO_PRIORIDAD[t.prioridad]}>{PRIORIDADES_TAREA[t.prioridad]}</Pill>
        {tarde && <Pill tono="alerta">Vencida</Pill>}
        {total > 0 && (
          <span className="inline-flex items-center gap-1 text-[0.7rem] text-fog-dim">
            <ListChecks aria-hidden className="h-3.5 w-3.5" /> {hechos}/{total}
          </span>
        )}
        {t.comentarios.length > 0 && (
          <span className="inline-flex items-center gap-1 text-[0.7rem] text-fog-dim">
            <ChatBubble aria-hidden className="h-3.5 w-3.5" /> {t.comentarios.length}
          </span>
        )}
        {t.recordatorio && t.estado !== "hecha" && (
          <span title="Tiene recordatorio" className="inline-flex items-center text-fog-dim">
            <Bell aria-label="Tiene recordatorio" className="h-3.5 w-3.5" />
          </span>
        )}
        <span className="ml-auto">{responsable ? <Responsable nombre={responsable} /> : <span className="text-[0.7rem] text-fog-dim">Sin asignar</span>}</span>
      </div>
    </li>
  );
}

/* ── Por estado (vista general, D-184) ────────────────────────────── */

const COLUMNAS: { estado: EstadoTarea; punto: string; fondo: string; texto: string }[] = [
  { estado: "por_hacer", punto: "bg-alerta-fuerte", fondo: "bg-alerta-fuerte/5", texto: "text-alerta" },
  { estado: "en_curso", punto: "bg-ambar", fondo: "bg-ambar/5", texto: "text-ambar" },
  { estado: "hecha", punto: "bg-verde", fondo: "bg-verde/5", texto: "text-verde" },
];
const HECHAS_VISIBLES = 10;

function Estados({
  tareas,
  hoy,
  nombreDe,
  proyectoDe,
  onAbrir,
  onEstado,
  onNueva,
}: {
  tareas: Tarea[];
  hoy: string;
  nombreDe: (id: string | null) => string;
  proyectoDe: (id: string | null) => string | null;
  onAbrir: (id: string) => void;
  onEstado: (t: Tarea, a: EstadoTarea) => void;
  onNueva: (estado: EstadoTarea) => void;
}) {
  const [sobre, setSobre] = useState<EstadoTarea | null>(null);
  const [verHechas, setVerHechas] = useState(HECHAS_VISIBLES);
  // Pendientes: primero lo que vence antes (sin fecha al final) y lo más urgente. Hechas: las más recientes arriba
  const PESO: Record<PrioridadTarea, number> = { urgente: 0, alta: 1, media: 2, baja: 3 };
  const ordenar = (l: Tarea[], estado: EstadoTarea) =>
    [...l].sort((a, b) =>
      estado === "hecha"
        ? (b.fecha ?? "").localeCompare(a.fecha ?? "") || b.creado.localeCompare(a.creado)
        : (a.fecha ?? "9999").localeCompare(b.fecha ?? "9999") || PESO[a.prioridad] - PESO[b.prioridad]
    );

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {COLUMNAS.map((c) => {
        const todas = ordenar(
          tareas.filter((t) => t.estado === c.estado),
          c.estado
        );
        const lista = c.estado === "hecha" ? todas.slice(0, verHechas) : todas;
        return (
          <section
            key={c.estado}
            aria-label={ESTADOS_TAREA[c.estado]}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              setSobre(c.estado);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setSobre(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setSobre(null);
              const t = tareas.find((x) => x.id === e.dataTransfer.getData("text/plain"));
              if (t) onEstado(t, c.estado);
            }}
            className={cn("flex min-h-[10rem] min-w-0 flex-col rounded-card border p-2.5 transition-colors", c.fondo, sobre === c.estado ? "border-white/25" : "border-white/[0.06]")}
          >
            <header className="mb-2.5 flex min-h-8 items-center justify-between gap-2 px-1">
              <h3 className="flex items-center gap-2">
                <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.04] px-2.5 py-1 text-xs font-semibold", c.texto)}>
                  <span aria-hidden className={cn("h-2 w-2 rounded-full", c.punto)} />
                  {ESTADOS_TAREA[c.estado]}
                </span>
                <span className={cn("text-sm font-semibold", c.texto)}>{todas.length}</span>
              </h3>
              {c.estado !== "hecha" && (
                <button type="button" onClick={() => onNueva(c.estado)} aria-label={`Nueva tarea en ${ESTADOS_TAREA[c.estado]}`} className="flex h-8 w-8 items-center justify-center rounded-full text-fog-dim hover:bg-white/[0.06] hover:text-white">
                  <Plus aria-hidden className="h-4 w-4" />
                </button>
              )}
            </header>
            <ul className="flex-1 space-y-2">
              {lista.map((t) => (
                <TarjetaEstado key={t.id} t={t} hoy={hoy} responsable={t.responsableId ? nombreDe(t.responsableId) : null} proyecto={proyectoDe(t.proyectoId)} onAbrir={() => onAbrir(t.id)} onHecha={() => onEstado(t, "hecha")} />
              ))}
              {todas.length === 0 && <li className="px-1 py-6 text-center text-xs text-fog-dim">{c.estado === "hecha" ? "Lo que se termine aparece aquí." : "Nada por aquí. Arrastra una tarea o crea una."}</li>}
            </ul>
            {c.estado === "hecha" && todas.length > lista.length && (
              <button type="button" onClick={() => setVerHechas((n) => n + HECHAS_VISIBLES)} className="mt-2 h-9 rounded-full text-xs font-semibold text-fog hover:bg-white/[0.04] hover:text-white">
                Ver {Math.min(HECHAS_VISIBLES, todas.length - lista.length)} más
              </button>
            )}
          </section>
        );
      })}
    </div>
  );
}

/** Tarjeta del tablero por estado: título, día, prioridad, responsable y el botón «¡Hecha!» (como Notion). */
function TarjetaEstado({ t, hoy, responsable, proyecto, onAbrir, onHecha }: { t: Tarea; hoy: string; responsable: string | null; proyecto: string | null; onAbrir: () => void; onHecha: () => void }) {
  const { hechos, total } = avanceItems(t.items);
  const tarde = vencida(t, hoy);
  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", t.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      data-tarea={t.id}
      className="cursor-grab rounded-frame border border-white/8 bg-surface-1 p-3 transition-colors hover:border-white/20 active:cursor-grabbing"
    >
      <button type="button" onClick={onAbrir} className="block w-full text-left">
        <span className={cn("block break-words text-sm font-medium leading-snug text-white", t.estado === "hecha" && "text-fog line-through")}>{t.titulo}</span>
        {proyecto && <span className="mt-0.5 block truncate text-[0.7rem] text-fog-dim">{proyecto}</span>}
        <span className={cn("mt-2 block text-xs", tarde ? "font-semibold text-alerta" : "text-fog")}>
          {fechaCorta(t.fecha, hoy)}
          {tarde && " · vencida"}
        </span>
      </button>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <Pill tono={TONO_PRIORIDAD[t.prioridad]}>{PRIORIDADES_TAREA[t.prioridad]}</Pill>
        {responsable ? <Responsable nombre={responsable} /> : <span className="text-[0.7rem] text-fog-dim">Sin asignar</span>}
        {total > 0 && (
          <span className="inline-flex items-center gap-1 text-[0.7rem] text-fog-dim">
            <ListChecks aria-hidden className="h-3.5 w-3.5" /> {hechos}/{total}
          </span>
        )}
        {t.comentarios.length > 0 && (
          <span className="inline-flex items-center gap-1 text-[0.7rem] text-fog-dim">
            <ChatBubble aria-hidden className="h-3.5 w-3.5" /> {t.comentarios.length}
          </span>
        )}
        {t.recordatorio && t.estado !== "hecha" && <Bell aria-label="Tiene recordatorio" className="h-3.5 w-3.5 text-fog-dim" />}
        {t.estado !== "hecha" && (
          <button type="button" onClick={onHecha} className="ml-auto inline-flex h-7 items-center gap-1 rounded-full border border-white/10 px-2.5 text-[0.72rem] font-semibold text-fog hover:border-verde/40 hover:text-verde">
            <Check aria-hidden className="h-3.5 w-3.5" /> ¡Hecha!
          </button>
        )}
      </div>
    </li>
  );
}

/* ── Semana ────────────────────────────────────────────────────────── */

function Semana({
  tareas,
  lunes,
  hoy,
  onSemana,
  tarjeta,
  onMover,
  onNueva,
}: {
  tareas: Tarea[];
  lunes: string;
  hoy: string;
  onSemana: (lunes: string) => void;
  tarjeta: (t: Tarea) => DatosTarjeta;
  onMover: (id: string, fecha: string | null, antesDe: string | null) => void;
  onNueva: (fecha: string | null) => void;
}) {
  const dias = diasLaborales(lunes);
  const [sobre, setSobre] = useState<{ fecha: string | null; antesDe: string | null } | null>(null);
  const esEstaSemana = lunes === semanaDeTrabajo(hoy);
  // Las vencidas de semanas pasadas se ven en «Atrasadas» para no perderlas
  const atrasadas = ordenarDia(tareas.filter((t) => vencida(t, hoy) && t.fecha! < lunes));
  const sinFecha = ordenarDia(tareas.filter((t) => t.fecha === null && t.estado !== "hecha"));

  const zona = (fecha: string | null) => ({
    onDragOver: (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      // Sobre la columna (no sobre una tarjeta): al final
      if ((e.target as HTMLElement).closest("[data-tarea]") === null) setSobre({ fecha, antesDe: null });
    },
    onDragLeave: (e: DragEvent<HTMLElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node)) setSobre(null);
    },
    onDrop: (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      const id = e.dataTransfer.getData("text/plain");
      const antes = sobre?.fecha === fecha ? sobre.antesDe : null;
      setSobre(null);
      if (id && antes !== id) onMover(id, fecha, antes);
    },
  });
  const sobreTarjeta = (fecha: string | null, id: string) => (e: DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    // Mitad de arriba: antes de esta tarjeta; mitad de abajo: antes de la siguiente
    if (e.clientY < r.top + r.height / 2) setSobre({ fecha, antesDe: id });
    else {
      const siguiente = (e.currentTarget.nextElementSibling as HTMLElement | null)?.dataset.tarea ?? null;
      setSobre({ fecha, antesDe: siguiente });
    }
  };
  const lista = (fecha: string | null, items: Tarea[]) => (
    <ul className="space-y-2">
      {items.map((t) => (
        <Fragment key={t.id}>
          {sobre?.fecha === fecha && sobre.antesDe === t.id && <li aria-hidden className="h-1 rounded-full bg-[#B6FF00]" />}
          <TarjetaTarea {...tarjeta(t)} arrastrable onArrastre={sobreTarjeta(fecha, t.id)} />
        </Fragment>
      ))}
      {sobre?.fecha === fecha && sobre.antesDe === null && <li aria-hidden className="h-1 rounded-full bg-[#B6FF00]" />}
    </ul>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BotonSecundario type="button" onClick={() => onSemana(sumarDias(lunes, -7))} aria-label="Semana anterior">
            <ChevronLeft aria-hidden className="h-4 w-4" />
          </BotonSecundario>
          <p className="min-w-[8.5rem] text-center font-display text-base font-bold text-white" aria-live="polite">
            {rangoSemana(lunes)}
          </p>
          <BotonSecundario type="button" onClick={() => onSemana(sumarDias(lunes, 7))} aria-label="Semana siguiente">
            <ChevronRight aria-hidden className="h-4 w-4" />
          </BotonSecundario>
        </div>
        {!esEstaSemana && (
          <BotonSecundario type="button" onClick={() => onSemana(semanaDeTrabajo(hoy))}>
            Volver a esta semana
          </BotonSecundario>
        )}
      </div>

      {atrasadas.length > 0 && (
        <section {...zona(hoy)} className="rounded-card border border-alerta-fuerte/30 p-3">
          <h3 className="mb-2 text-xs font-semibold text-alerta">Atrasadas de semanas anteriores · {atrasadas.length}</h3>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {atrasadas.map((t) => (
              <TarjetaTarea key={t.id} {...tarjeta(t)} arrastrable />
            ))}
          </ul>
          <p className="mt-2 text-[0.7rem] text-fog-dim">Arrástralas a un día de esta semana o ábrelas para cambiarles la fecha.</p>
        </section>
      )}

      <div className="grid gap-3 lg:grid-cols-5">
        {dias.map((d) => {
          const items = ordenarDia(tareas.filter((t) => t.fecha === d));
          const { dia, corto } = partesDia(d);
          const esHoy = d === hoy;
          return (
            <section
              key={d}
              {...zona(d)}
              aria-label={`${dia} ${corto}`}
              className={cn("flex min-h-[7rem] min-w-0 flex-col rounded-card border p-2 transition-colors", esHoy ? "border-[#B6FF00]/40" : "border-white/8", sobre?.fecha === d && "bg-white/[0.03]")}
            >
              <header className="mb-2 flex items-baseline justify-between gap-2 px-0.5">
                <h3 className={cn("text-sm font-semibold", esHoy ? "text-white" : "text-fog")}>
                  {esHoy ? "Hoy" : dia}
                  <span className="ml-1.5 text-xs font-normal text-fog-dim">{corto}</span>
                </h3>
                {items.length > 0 && <span className="text-[0.7rem] text-fog-dim">{items.filter((t) => t.estado !== "hecha").length}</span>}
              </header>
              <div className="flex-1">{lista(d, items)}</div>
              <button type="button" onClick={() => onNueva(d)} className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-full px-2 text-xs text-fog-dim hover:bg-white/[0.04] hover:text-white">
                <Plus aria-hidden className="h-3.5 w-3.5" /> Agregar
              </button>
            </section>
          );
        })}
      </div>

      <section {...zona(null)} className={cn("rounded-card border border-white/8 p-3 transition-colors", sobre?.fecha === null && "bg-white/[0.03]")} aria-label="Sin fecha">
        <header className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-fog">
            Sin fecha <span className="ml-1 text-xs font-normal text-fog-dim">{sinFecha.length}</span>
          </h3>
          <button type="button" onClick={() => onNueva(null)} className="inline-flex h-8 items-center gap-1.5 rounded-full px-2 text-xs text-fog-dim hover:bg-white/[0.04] hover:text-white">
            <Plus aria-hidden className="h-3.5 w-3.5" /> Agregar
          </button>
        </header>
        {sinFecha.length === 0 ? (
          <p className="text-xs text-fog-dim">Arrastra aquí lo que todavía no tiene día.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {sinFecha.map((t) => (
              <TarjetaTarea key={t.id} {...tarjeta(t)} arrastrable />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ── Tabla tipo Notion ─────────────────────────────────────────────── */

function TablaTareas({
  tareas,
  hoy,
  nombreDe,
  proyectoDe,
  onAbrir,
  onEstado,
}: {
  tareas: Tarea[];
  hoy: string;
  nombreDe: (id: string | null) => string;
  proyectoDe: (id: string | null) => string | null;
  onAbrir: (id: string) => void;
  onEstado: (t: Tarea) => void;
}) {
  const [col, setCol] = useState<Columna>("fecha");
  const [asc, setAsc] = useState(true);
  const [estado, setEstado] = useState<"pendientes" | EstadoTarea | "">("pendientes");
  const [q, setQ] = useState("");
  const [pagina, setPagina] = useState(0);
  const POR_PAGINA = 25;

  const filas = useMemo(() => {
    const t = q.trim().toLowerCase();
    const lista = tareas
      .filter((x) => (estado === "pendientes" ? x.estado !== "hecha" : !estado || x.estado === estado))
      .filter((x) => !t || [x.titulo, x.descripcion, proyectoDe(x.proyectoId)].some((v) => v?.toLowerCase().includes(t)));
    return ordenarTabla(lista, col, asc, nombreDe);
  }, [tareas, estado, q, col, asc, nombreDe, proyectoDe]);
  const total = Math.max(1, Math.ceil(filas.length / POR_PAGINA));
  const pag = Math.min(pagina, total - 1);

  const encabezado = (c: Columna, l: string, className?: string) => (
    <th scope="col" aria-sort={col === c ? (asc ? "ascending" : "descending") : "none"} className={cn("px-3 py-2.5 text-left font-medium", className)}>
      <button
        type="button"
        onClick={() => {
          if (col === c) setAsc(!asc);
          else {
            setCol(c);
            setAsc(true);
          }
          setPagina(0);
        }}
        className="inline-flex items-center gap-1 hover:text-white"
      >
        {l}
        {col === c && <span aria-hidden>{asc ? "↑" : "↓"}</span>}
      </button>
    </th>
  );

  return (
    <div className="v2-card space-y-3 p-3 sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-xs">
          <span className="sr-only">Buscar tarea</span>
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fog-dim" />
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPagina(0);
            }}
            placeholder="Buscar tarea o proyecto"
            className="pn-input pl-9"
          />
        </label>
        <select
          aria-label="Filtrar por estado"
          value={estado}
          onChange={(e) => {
            setEstado(e.target.value as typeof estado);
            setPagina(0);
          }}
          className="pn-input h-9 w-full py-0 text-xs sm:w-auto"
        >
          <option value="pendientes">Pendientes</option>
          {opciones(ESTADOS_TAREA).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
          <option value="">Todas</option>
        </select>
      </div>

      {filas.length === 0 ? (
        <p className="py-10 text-center text-sm text-fog">No hay tareas con esos filtros.</p>
      ) : (
        <div className="-mx-3 overflow-x-auto sm:-mx-4">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-white/8 text-xs text-fog-dim">
              <tr>
                {encabezado("titulo", "Tarea", "pl-4 sm:pl-5")}
                {encabezado("estado", "Estado")}
                {encabezado("prioridad", "Prioridad")}
                {encabezado("responsable", "Responsable")}
                {encabezado("fecha", "Fecha")}
                {encabezado("area", "Área", "pr-4 sm:pr-5")}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {filas.slice(pag * POR_PAGINA, (pag + 1) * POR_PAGINA).map((t) => {
                const { hechos, total: n } = avanceItems(t.items);
                const proyecto = proyectoDe(t.proyectoId);
                return (
                  <tr key={t.id} className="hover:bg-white/[0.02]">
                    <td className="py-2 pl-4 pr-3 sm:pl-5">
                      <div className="flex items-start gap-2">
                        <button type="button" onClick={() => onEstado(t)} aria-label={`Estado: ${ESTADOS_TAREA[t.estado]}. Pasar a ${ESTADOS_TAREA[SIGUIENTE[t.estado]].toLowerCase()}`} className="-m-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-white/[0.06]">
                          <IconoEstado estado={t.estado} />
                        </button>
                        <button type="button" onClick={() => onAbrir(t.id)} className="min-w-0 pt-1 text-left">
                          <span className={cn("font-medium text-white hover:underline", t.estado === "hecha" && "line-through opacity-60")}>{t.titulo}</span>
                          <span className="mt-0.5 flex flex-wrap gap-x-2 text-[0.7rem] text-fog-dim">
                            {proyecto && <span>{proyecto}</span>}
                            {n > 0 && (
                              <span>
                                {hechos}/{n} pasos
                              </span>
                            )}
                            {t.comentarios.length > 0 && <span>{t.comentarios.length} coment.</span>}
                          </span>
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <Pill tono={TONO_ESTADO[t.estado]}>{ESTADOS_TAREA[t.estado]}</Pill>
                    </td>
                    <td className="px-3 py-2">
                      <Pill tono={TONO_PRIORIDAD[t.prioridad]}>{PRIORIDADES_TAREA[t.prioridad]}</Pill>
                    </td>
                    <td className="px-3 py-2 text-fog">
                      <span className="inline-flex items-center gap-2">
                        {nombreDe(t.responsableId)}
                      </span>
                    </td>
                    <td className={cn("whitespace-nowrap px-3 py-2", vencida(t, hoy) ? "text-alerta" : "text-fog")}>{fechaCorta(t.fecha, hoy)}</td>
                    <td className="px-3 py-2 pr-4 text-fog sm:pr-5">{AREAS[t.area as Area]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {total > 1 && (
        <nav aria-label="Páginas de tareas" className="flex items-center justify-between gap-3 border-t border-white/6 pt-3">
          <BotonSecundario type="button" onClick={() => setPagina(pag - 1)} disabled={pag === 0} aria-label="Página anterior">
            <ChevronLeft aria-hidden className="h-4 w-4" />
          </BotonSecundario>
          <p className="text-sm text-fog">
            Página <span className="font-display font-bold text-white">{pag + 1}</span> de {total}
          </p>
          <BotonSecundario type="button" onClick={() => setPagina(pag + 1)} disabled={pag >= total - 1} aria-label="Página siguiente">
            <ChevronRight aria-hidden className="h-4 w-4" />
          </BotonSecundario>
        </nav>
      )}
    </div>
  );
}
