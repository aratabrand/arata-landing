"use client";

import { useMemo, useState, type DragEvent, type FormEvent } from "react";
import { Calendar, Check, ChevronLeft, ChevronRight, Plus, RotateCcw, Trash2 } from "lucide-react";
import type { FaseProyecto, Prioridad, Proyecto } from "@/content/panel/tipos";
import { fechaCorta } from "@/lib/panel/formato";
import { nuevoId, useGuardado } from "@/lib/panel/guardado";
import { Hoja } from "./Clientes";
import { PanelHeader, PanelPage, Pill } from "./ui";
import { cn } from "@/lib/utils";

// Módulo 3 · Proyectos (docs/panel-cliente/01-arquitectura.md §2.3)
// Tablero tipo to-do por fases. Escritorio: 5 columnas con arrastrar y soltar.
// Celular: una fase a la vez (pestañas) y botones para mover. Las flechas
// también funcionan con teclado, así que arrastrar nunca es la única forma.

export const fases: { valor: FaseProyecto; label: string; color: string }[] = [
  { valor: "por-hacer", label: "Por hacer", color: "#8A84A8" },
  { valor: "diseno", label: "En diseño", color: "#B9A4FF" },
  { valor: "construccion", label: "En construcción", color: "#7D53FF" },
  { valor: "revision", label: "En revisión", color: "#FFC76B" },
  { valor: "entregado", label: "Entregado", color: "#B6FF00" },
];
const prioridades: { valor: Prioridad; label: string; tono: "alerta" | "morado" | "neutro" }[] = [
  { valor: "alta", label: "Alta", tono: "alerta" },
  { valor: "media", label: "Media", tono: "morado" },
  { valor: "baja", label: "Baja", tono: "neutro" },
];
const idx = (f: FaseProyecto) => fases.findIndex((x) => x.valor === f);
const avance = (p: Proyecto) => (p.tareas.length ? p.tareas.filter((t) => t.hecha).length / p.tareas.length : p.fase === "entregado" ? 1 : 0);

export default function Proyectos({ iniciales, hoy }: { iniciales: Proyecto[]; hoy: string }) {
  const [lista, setLista, , restablecer] = useGuardado<Proyecto[]>("proyectos", iniciales);
  const [faseMovil, setFaseMovil] = useState<FaseProyecto>("construccion");
  const [abierto, setAbierto] = useState<string | null>(null);
  const [creando, setCreando] = useState<FaseProyecto | null>(null);
  const [arrastrando, setArrastrando] = useState<string | null>(null);
  const [sobre, setSobre] = useState<FaseProyecto | null>(null);

  const mover = (id: string, fase: FaseProyecto) => setLista((l) => l.map((p) => (p.id === id ? { ...p, fase } : p)));
  const actualizar = (id: string, cambios: Partial<Proyecto>) => setLista((l) => l.map((p) => (p.id === id ? { ...p, ...cambios } : p)));

  const resumen = useMemo(() => {
    const tareas = lista.flatMap((p) => p.tareas);
    const hechas = tareas.filter((t) => t.hecha).length;
    return {
      pct: tareas.length ? Math.round((hechas / tareas.length) * 100) : 0,
      activos: lista.filter((p) => p.fase !== "entregado").length,
      teToca: lista.filter((p) => p.responsable === "Tu equipo" && p.fase !== "entregado"),
    };
  }, [lista]);

  const actual = lista.find((p) => p.id === abierto) ?? null;

  const soltar = (e: DragEvent, fase: FaseProyecto) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || arrastrando;
    if (id) mover(id, fase);
    setArrastrando(null);
    setSobre(null);
  };

  return (
    <PanelPage>
      <PanelHeader
        titulo="Proyectos"
        bajada="En qué va cada trabajo, quién lo tiene y qué falta. Arrastra una tarjeta o usa las flechas para cambiarla de fase."
        accion={
          <button
            type="button"
            onClick={() => setCreando("por-hacer")}
            className="v2-shine inline-flex h-11 items-center gap-2 rounded-btn bg-lime px-5 text-sm font-semibold text-ink hover:bg-[#C6FF33]"
          >
            <Plus aria-hidden className="h-4 w-4" /> Nuevo proyecto
          </button>
        }
      />

      {/* Avance general + pendientes del cliente */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-[1fr_1fr_1.4fr]">
        <div className="v2-card p-4 sm:p-5">
          <p className="text-xs text-fog">Avance de todas las tareas</p>
          <p className="mt-2 font-display text-[1.75rem] font-bold leading-none text-white">{resumen.pct} %</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/6">
            <div className="h-full origin-left rounded-full bg-lime transition-transform duration-700" style={{ transform: `scaleX(${resumen.pct / 100})` }} />
          </div>
        </div>
        <div className="v2-card p-4 sm:p-5">
          <p className="text-xs text-fog">Proyectos en curso</p>
          <p className="mt-2 font-display text-[1.75rem] font-bold leading-none text-white">{resumen.activos}</p>
          <div className="mt-3 flex gap-1" aria-hidden>
            {fases.map((f) => (
              <span key={f.valor} className="h-2 flex-1 rounded-full" style={{ background: f.color, opacity: lista.some((p) => p.fase === f.valor) ? 1 : 0.15 }} />
            ))}
          </div>
        </div>
        <div className="v2-card border-brand/40 p-4 sm:p-5">
          <p className="text-xs font-semibold text-brand-soft">Te toca a ti</p>
          {resumen.teToca.length ? (
            <ul className="mt-2 space-y-1.5">
              {resumen.teToca.map((p) => (
                <li key={p.id}>
                  <button type="button" onClick={() => setAbierto(p.id)} className="flex w-full items-center justify-between gap-2 text-left text-sm text-white hover:text-lime">
                    <span className="truncate">{p.titulo}</span>
                    <span className="shrink-0 text-xs text-fog-dim">{fechaCorta(p.fechaLimite)}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-fog">Nada pendiente de tu lado. 🎉</p>
          )}
        </div>
      </div>

      {/* Celular: selector de fase */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden" role="tablist" aria-label="Fases">
        {fases.map((f) => {
          const n = lista.filter((p) => p.fase === f.valor).length;
          return (
            <button
              key={f.valor}
              type="button"
              role="tab"
              aria-selected={faseMovil === f.valor}
              onClick={() => setFaseMovil(f.valor)}
              className={cn(
                "flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-xs font-semibold",
                faseMovil === f.valor ? "border-white/20 bg-surface-3 text-white" : "border-white/8 text-fog"
              )}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: f.color }} />
              {f.label}
              <span className="text-fog-dim">{n}</span>
            </button>
          );
        })}
      </div>

      {/* Tablero */}
      <div className="lg:-mx-2 lg:overflow-x-auto lg:px-2 lg:pb-2">
        <div className="grid gap-4 lg:min-w-[1100px] lg:grid-cols-5">
          {fases.map((f) => {
            const items = lista.filter((p) => p.fase === f.valor);
            return (
              <section
                key={f.valor}
                aria-label={f.label}
                className={cn(
                  "rounded-card border border-white/6 bg-[#06040F] p-3 transition-colors",
                  faseMovil === f.valor ? "block" : "hidden lg:block",
                  sobre === f.valor && "border-brand/60 bg-brand/5"
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  setSobre(f.valor);
                }}
                onDragLeave={() => setSobre((s) => (s === f.valor ? null : s))}
                onDrop={(e) => soltar(e, f.valor)}
              >
                <header className="mb-3 flex items-center justify-between px-1">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                    <span className="h-2 w-2 rounded-full" style={{ background: f.color }} />
                    {f.label}
                    <span className="text-xs font-normal text-fog-dim">{items.length}</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => setCreando(f.valor)}
                    aria-label={`Agregar proyecto en ${f.label}`}
                    className="flex h-8 w-8 items-center justify-center rounded-btn text-fog-dim hover:bg-surface-2 hover:text-white"
                  >
                    <Plus aria-hidden className="h-4 w-4" />
                  </button>
                </header>

                <ul className="space-y-3">
                  {items.map((p) => (
                    <TarjetaProyecto
                      key={p.id}
                      p={p}
                      hoy={hoy}
                      arrastrando={arrastrando === p.id}
                      onOpen={() => setAbierto(p.id)}
                      onMove={(dir) => {
                        const n = fases[idx(p.fase) + dir];
                        if (n) {
                          mover(p.id, n.valor);
                          setFaseMovil(n.valor);
                        }
                      }}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", p.id);
                        e.dataTransfer.effectAllowed = "move";
                        setArrastrando(p.id);
                      }}
                      onDragEnd={() => {
                        setArrastrando(null);
                        setSobre(null);
                      }}
                    />
                  ))}
                  {items.length === 0 && (
                    <li className="rounded-frame border border-dashed border-white/10 px-3 py-6 text-center text-xs text-fog-dim">Suelta aquí un proyecto</li>
                  )}
                </ul>
              </section>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end text-xs text-fog-dim">
        <button type="button" onClick={restablecer} className="inline-flex items-center gap-1.5 hover:text-white">
          <RotateCcw aria-hidden className="h-3.5 w-3.5" /> Volver a los datos de ejemplo
        </button>
      </div>

      {actual && (
        <Hoja titulo={actual.titulo} onClose={() => setAbierto(null)}>
          <DetalleProyecto
            p={actual}
            onChange={(c) => actualizar(actual.id, c)}
            onDelete={() => {
              setLista((l) => l.filter((x) => x.id !== actual.id));
              setAbierto(null);
            }}
          />
        </Hoja>
      )}

      {creando && (
        <Hoja titulo="Nuevo proyecto" onClose={() => setCreando(null)}>
          <NuevoProyecto
            fase={creando}
            hoy={hoy}
            onSave={(p) => {
              setLista((l) => [...l, p]);
              setFaseMovil(p.fase);
              setCreando(null);
            }}
          />
        </Hoja>
      )}
    </PanelPage>
  );
}

function TarjetaProyecto({
  p,
  hoy,
  arrastrando,
  onOpen,
  onMove,
  onDragStart,
  onDragEnd,
}: {
  p: Proyecto;
  hoy: string;
  arrastrando: boolean;
  onOpen: () => void;
  onMove: (dir: -1 | 1) => void;
  onDragStart: (e: DragEvent) => void;
  onDragEnd: () => void;
}) {
  const a = avance(p);
  const hechas = p.tareas.filter((t) => t.hecha).length;
  const vencido = p.fase !== "entregado" && p.fechaLimite < hoy;
  const pr = prioridades.find((x) => x.valor === p.prioridad)!;
  const i = idx(p.fase);
  return (
    <li
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "group rounded-frame border border-white/8 bg-surface-1 p-3.5 transition-[opacity,border-color] hover:border-white/16 lg:cursor-grab",
        arrastrando && "opacity-40"
      )}
    >
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="mb-2 flex flex-wrap gap-1.5">
          <Pill tono={pr.tono}>{pr.label}</Pill>
          <Pill tono={p.responsable === "Tu equipo" ? "morado" : "neutro"}>{p.responsable}</Pill>
        </div>
        <h3 className="text-sm font-semibold leading-snug text-white">{p.titulo}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-fog-dim">{p.descripcion}</p>
      </button>

      <div className="mt-3">
        <div className="mb-1 flex justify-between text-[0.7rem] text-fog-dim">
          <span>{hechas}/{p.tareas.length} tareas</span>
          <span className={cn("inline-flex items-center gap-1", vencido && "text-[#FF9BB0]")}>
            <Calendar aria-hidden className="h-3 w-3" />
            {vencido ? "Venció " : ""}{fechaCorta(p.fechaLimite)}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/6">
          <div className="h-full origin-left rounded-full transition-transform duration-500" style={{ transform: `scaleX(${a})`, background: a === 1 ? "#B6FF00" : "#7D53FF" }} />
        </div>
      </div>

      <div className="mt-3 flex justify-between gap-2">
        <button
          type="button"
          disabled={i === 0}
          onClick={() => onMove(-1)}
          aria-label={`Mover "${p.titulo}" a ${fases[i - 1]?.label ?? ""}`}
          className="flex h-8 w-8 items-center justify-center rounded-btn border border-white/8 text-fog transition-colors hover:text-white disabled:opacity-25"
        >
          <ChevronLeft aria-hidden className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={i === fases.length - 1}
          onClick={() => onMove(1)}
          aria-label={`Mover "${p.titulo}" a ${fases[i + 1]?.label ?? ""}`}
          className="flex h-8 min-w-0 items-center gap-1 rounded-btn border border-white/8 px-2.5 text-xs text-fog transition-colors hover:border-lime/40 hover:text-lime disabled:opacity-25"
        >
          <span className="truncate whitespace-nowrap">{fases[i + 1]?.label.replace(/^En /, "A ") ?? "Listo"}</span>
          <ChevronRight aria-hidden className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}

function DetalleProyecto({ p, onChange, onDelete }: { p: Proyecto; onChange: (c: Partial<Proyecto>) => void; onDelete: () => void }) {
  const [nueva, setNueva] = useState("");
  const agregar = (e: FormEvent) => {
    e.preventDefault();
    const t = nueva.trim();
    if (!t) return;
    onChange({ tareas: [...p.tareas, { id: nuevoId("t"), texto: t, hecha: false }] });
    setNueva("");
  };
  return (
    <div className="space-y-5">
      <p className="text-sm text-fog">{p.descripcion}</p>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-fog">Fase</span>
          <select value={p.fase} onChange={(e) => onChange({ fase: e.target.value as FaseProyecto })} className="pn-input">
            {fases.map((f) => <option key={f.valor} value={f.valor}>{f.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-fog">Fecha límite</span>
          <input type="date" value={p.fechaLimite} onChange={(e) => e.target.value && onChange({ fechaLimite: e.target.value })} className="pn-input" />
        </label>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-fog">Tareas</p>
        <ul className="space-y-1.5">
          {p.tareas.map((t) => (
            <li key={t.id} className="flex items-center gap-2">
              <button
                type="button"
                role="checkbox"
                aria-checked={t.hecha}
                onClick={() => onChange({ tareas: p.tareas.map((x) => (x.id === t.id ? { ...x, hecha: !x.hecha } : x)) })}
                className="flex min-h-11 flex-1 items-center gap-3 rounded-btn border border-white/8 bg-surface-1 px-3 text-left text-sm"
              >
                <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-md border", t.hecha ? "border-lime bg-lime text-ink" : "border-white/20")}>
                  {t.hecha && <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />}
                </span>
                <span className={cn(t.hecha ? "text-fog-dim line-through" : "text-white")}>{t.texto}</span>
              </button>
              <button
                type="button"
                aria-label={`Quitar tarea: ${t.texto}`}
                onClick={() => onChange({ tareas: p.tareas.filter((x) => x.id !== t.id) })}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-btn text-fog-dim hover:text-white"
              >
                <Trash2 aria-hidden className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={agregar} className="mt-2 flex gap-2">
          <label className="sr-only" htmlFor="nueva-tarea">Nueva tarea</label>
          <input id="nueva-tarea" value={nueva} onChange={(e) => setNueva(e.target.value)} placeholder="Agregar una tarea" maxLength={120} className="pn-input" />
          <button type="submit" className="h-11 shrink-0 rounded-btn border border-white/10 bg-surface-2 px-4 text-sm font-semibold text-white hover:border-white/20">
            Agregar
          </button>
        </form>
      </div>

      <button
        type="button"
        onClick={() => window.confirm(`¿Borrar "${p.titulo}"?`) && onDelete()}
        className="inline-flex items-center gap-2 text-sm text-[#FF9BB0] hover:text-white"
      >
        <Trash2 aria-hidden className="h-4 w-4" /> Borrar proyecto
      </button>
    </div>
  );
}

function NuevoProyecto({ fase, hoy, onSave }: { fase: FaseProyecto; hoy: string; onSave: (p: Proyecto) => void }) {
  const [error, setError] = useState("");
  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const titulo = String(f.get("titulo") ?? "").trim();
    if (titulo.length < 3) return setError("Ponle un nombre al proyecto.");
    onSave({
      id: nuevoId("p"),
      titulo,
      descripcion: String(f.get("descripcion") ?? "").trim(),
      fase: f.get("fase") as FaseProyecto,
      responsable: f.get("responsable") as Proyecto["responsable"],
      prioridad: f.get("prioridad") as Prioridad,
      fechaLimite: String(f.get("fecha") || hoy),
      tareas: [],
    });
  };
  const sel = "pn-input";
  return (
    <form onSubmit={enviar} className="space-y-4" noValidate>
      <label className="block"><span className="mb-1.5 block text-xs font-medium text-fog">Nombre *</span><input name="titulo" className={sel} maxLength={90} /></label>
      <label className="block"><span className="mb-1.5 block text-xs font-medium text-fog">Qué hay que hacer</span><textarea name="descripcion" rows={3} className={cn(sel, "h-auto py-2.5")} maxLength={400} /></label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block"><span className="mb-1.5 block text-xs font-medium text-fog">Fase</span>
          <select name="fase" defaultValue={fase} className={sel}>{fases.map((x) => <option key={x.valor} value={x.valor}>{x.label}</option>)}</select>
        </label>
        <label className="block"><span className="mb-1.5 block text-xs font-medium text-fog">Prioridad</span>
          <select name="prioridad" defaultValue="media" className={sel}>{prioridades.map((x) => <option key={x.valor} value={x.valor}>{x.label}</option>)}</select>
        </label>
        <label className="block"><span className="mb-1.5 block text-xs font-medium text-fog">Lo tiene</span>
          <select name="responsable" defaultValue="Arata San" className={sel}><option>Arata San</option><option>Tu equipo</option></select>
        </label>
        <label className="block"><span className="mb-1.5 block text-xs font-medium text-fog">Fecha límite</span>
          <input name="fecha" type="date" defaultValue={hoy} className={sel} />
        </label>
      </div>
      {error && <p role="alert" className="text-sm text-[#FF9BB0]">{error}</p>}
      <button type="submit" className="v2-shine h-11 w-full rounded-btn bg-lime text-sm font-semibold text-ink hover:bg-[#C6FF33]">Crear proyecto</button>
    </form>
  );
}
