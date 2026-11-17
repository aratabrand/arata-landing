"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Mail, MapPin, MessageCircle, Phone, Plus, RotateCcw, Search, Trash2, X } from "lucide-react";
import type { Cliente, EstadoCliente, OrigenCliente } from "@/content/panel/tipos";
import { fechaCorta, numero, pesos } from "@/lib/panel/formato";
import { nuevoId, useGuardado } from "@/lib/panel/guardado";
import { PanelHeader, PanelPage, Pill, Tarjeta } from "./ui";
import { cn } from "@/lib/utils";

// Módulo 2 · Clientes (docs/panel-cliente/01-arquitectura.md §2.2)
// Lista con búsqueda y filtro por estado, ficha con notas, alta de cliente y
// acceso directo a WhatsApp. En celular la tabla se vuelve tarjetas.

export const estados: { valor: EstadoCliente; label: string; tono: "lima" | "morado" | "neutro" | "alerta" }[] = [
  { valor: "nuevo", label: "Nuevo", tono: "morado" },
  { valor: "activo", label: "Activo", tono: "neutro" },
  { valor: "recurrente", label: "Recurrente", tono: "lima" },
  { valor: "inactivo", label: "Inactivo", tono: "alerta" },
];
const origenes: OrigenCliente[] = ["Instagram", "Google", "WhatsApp", "Referido", "Página"];
const tonoDe = (e: EstadoCliente) => estados.find((x) => x.valor === e)!;

const wa = (tel: string, nombre: string) =>
  `https://wa.me/57${tel.replace(/\D/g, "").replace(/^57/, "")}?text=${encodeURIComponent(`Hola ${nombre.split(" ")[0]}, `)}`;

export default function Clientes({ iniciales, hoy }: { iniciales: Cliente[]; hoy: string }) {
  const [lista, setLista, , restablecer] = useGuardado<Cliente[]>("clientes", iniciales);
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState<EstadoCliente | "todos">("todos");
  const [abierto, setAbierto] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);

  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    return lista
      .filter((c) => filtro === "todos" || c.estado === filtro)
      .filter((c) => !t || c.nombre.toLowerCase().includes(t) || c.telefono.includes(t) || c.ciudad.toLowerCase().includes(t))
      .sort((a, b) => (b.ultimaCompra ?? "").localeCompare(a.ultimaCompra ?? ""));
  }, [lista, q, filtro]);

  const resumen = useMemo(() => {
    const total = lista.length;
    const recurrentes = lista.filter((c) => c.estado === "recurrente").length;
    const nuevos = lista.filter((c) => c.creado >= restarDias(hoy, 30)).length;
    const valor = lista.reduce((a, c) => a + c.totalComprado, 0);
    return { total, recurrentes, nuevos, promedio: total ? valor / total : 0 };
  }, [lista, hoy]);

  const actual = lista.find((c) => c.id === abierto) ?? null;
  const actualizar = (id: string, cambios: Partial<Cliente>) => setLista((l) => l.map((c) => (c.id === id ? { ...c, ...cambios } : c)));
  const borrar = (id: string) => {
    setLista((l) => l.filter((c) => c.id !== id));
    setAbierto(null);
  };

  return (
    <PanelPage>
      <PanelHeader
        titulo="Clientes"
        bajada="Quién te compra, cuánto y hace cuánto. Toca un cliente para ver su ficha o escribirle."
        accion={
          <button
            type="button"
            onClick={() => setCreando(true)}
            className="v2-shine inline-flex h-11 items-center gap-2 rounded-btn bg-lime px-5 text-sm font-semibold text-ink transition-colors hover:bg-[#C6FF33]"
          >
            <Plus aria-hidden className="h-4 w-4" />
            Agregar cliente
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          { k: "Clientes", v: numero(resumen.total) },
          { k: "Nuevos este mes", v: numero(resumen.nuevos) },
          { k: "Recurrentes", v: numero(resumen.recurrentes) },
          { k: "Compra promedio por cliente", v: pesos(resumen.promedio) },
        ].map((s) => (
          <div key={s.k} className="v2-card p-4 sm:p-5">
            <p className="text-xs text-fog">{s.k}</p>
            <p className="mt-2 font-display text-[clamp(1.3rem,2.4vw,1.75rem)] font-bold leading-none text-white">{s.v}</p>
          </div>
        ))}
      </div>

      <Tarjeta>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-sm">
            <span className="sr-only">Buscar cliente</span>
            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fog-dim" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre, teléfono o ciudad"
              className="pn-input pl-9"
            />
          </label>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Filtrar por estado">
            {[{ valor: "todos" as const, label: "Todos" }, ...estados].map((e) => {
              const n = e.valor === "todos" ? lista.length : lista.filter((c) => c.estado === e.valor).length;
              return (
                <button
                  key={e.valor}
                  type="button"
                  aria-pressed={filtro === e.valor}
                  onClick={() => setFiltro(e.valor)}
                  className={cn(
                    "h-9 shrink-0 rounded-full border px-3.5 text-xs font-semibold transition-colors",
                    filtro === e.valor ? "border-brand bg-brand/20 text-white" : "border-white/10 text-fog hover:text-white"
                  )}
                >
                  {e.label} <span className="ml-1 text-fog-dim">{n}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Escritorio: tabla */}
        <div className="mt-5 hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/8 text-xs text-fog-dim">
                <th className="py-3 pr-4 font-medium">Cliente</th>
                <th className="py-3 pr-4 font-medium">Estado</th>
                <th className="py-3 pr-4 font-medium">Llegó por</th>
                <th className="py-3 pr-4 text-right font-medium">Compras</th>
                <th className="py-3 pr-4 text-right font-medium">Total</th>
                <th className="py-3 pr-4 font-medium">Última compra</th>
                <th className="py-3 font-medium"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((c) => (
                <tr key={c.id} className="cursor-pointer border-b border-white/6 transition-colors last:border-0 hover:bg-surface-2/60" onClick={() => setAbierto(c.id)}>
                  <td className="py-3 pr-4">
                    <button type="button" className="text-left" onClick={() => setAbierto(c.id)}>
                      <span className="block font-medium text-white">{c.nombre}</span>
                      <span className="block text-xs text-fog-dim">{c.telefono} · {c.ciudad}</span>
                    </button>
                  </td>
                  <td className="py-3 pr-4"><Pill tono={tonoDe(c.estado).tono}>{tonoDe(c.estado).label}</Pill></td>
                  <td className="py-3 pr-4 text-fog">{c.origen}</td>
                  <td className="py-3 pr-4 text-right font-display font-bold text-white">{c.compras}</td>
                  <td className="py-3 pr-4 text-right font-display font-bold text-white">{pesos(c.totalComprado)}</td>
                  <td className="py-3 pr-4 text-fog">{c.ultimaCompra ? fechaCorta(c.ultimaCompra) : "—"}</td>
                  <td className="py-3 text-right">
                    <a
                      href={wa(c.telefono, c.nombre)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Escribirle a ${c.nombre} por WhatsApp`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-btn border border-white/10 text-fog transition-colors hover:border-lime/50 hover:text-lime"
                    >
                      <MessageCircle aria-hidden className="h-4 w-4" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Celular: tarjetas */}
        <ul className="mt-4 space-y-2 md:hidden">
          {visibles.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => setAbierto(c.id)} className="flex w-full items-center gap-3 rounded-frame border border-white/6 bg-surface-2/50 p-3 text-left">
                <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 font-display text-sm font-bold text-brand-soft">
                  {iniciales2(c.nombre)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-white">{c.nombre}</span>
                  <span className="block truncate text-xs text-fog-dim">{c.compras} compras · {pesos(c.totalComprado)}</span>
                </span>
                <Pill tono={tonoDe(c.estado).tono}>{tonoDe(c.estado).label}</Pill>
              </button>
            </li>
          ))}
        </ul>

        {visibles.length === 0 && (
          <p className="py-10 text-center text-sm text-fog">No hay clientes con esa búsqueda.</p>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-white/6 pt-4 text-xs text-fog-dim">
          <span>{visibles.length} de {lista.length} clientes</span>
          <button type="button" onClick={restablecer} className="inline-flex items-center gap-1.5 hover:text-white">
            <RotateCcw aria-hidden className="h-3.5 w-3.5" /> Volver a los datos de ejemplo
          </button>
        </div>
      </Tarjeta>

      {actual && (
        <Hoja titulo={actual.nombre} onClose={() => setAbierto(null)}>
          <FichaCliente cliente={actual} onChange={(cambios) => actualizar(actual.id, cambios)} onDelete={() => borrar(actual.id)} />
        </Hoja>
      )}

      {creando && (
        <Hoja titulo="Agregar cliente" onClose={() => setCreando(false)}>
          <NuevoCliente
            hoy={hoy}
            onSave={(c) => {
              setLista((l) => [c, ...l]);
              setCreando(false);
            }}
          />
        </Hoja>
      )}
    </PanelPage>
  );
}

function iniciales2(n: string) {
  return n.split(" ").map((p) => p[0]).slice(0, 2).join("");
}

function restarDias(iso: string, n: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

/** Panel lateral (escritorio) u hoja desde abajo (celular). Escape y clic afuera cierran. */
export function Hoja({ titulo, onClose, children }: { titulo: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-stretch lg:justify-end">
      <button type="button" aria-label="Cerrar" className="pn-fade is-visible absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="pn-hoja relative max-h-[88vh] w-full overflow-y-auto rounded-t-card border border-white/10 bg-surface-3 p-5 outline-none sm:p-6 lg:max-h-none lg:w-[440px] lg:rounded-none lg:rounded-l-card"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <h2 className="font-display text-xl font-bold tracking-heading text-white">{titulo}</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn border border-white/10 text-fog hover:text-white">
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-fog">{label}</span>
      {children}
    </label>
  );
}

function FichaCliente({ cliente: c, onChange, onDelete }: { cliente: Cliente; onChange: (x: Partial<Cliente>) => void; onDelete: () => void }) {
  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-3 gap-2">
        {[
          { k: "Compras", v: String(c.compras) },
          { k: "Total", v: pesos(c.totalComprado) },
          { k: "Última", v: c.ultimaCompra ? fechaCorta(c.ultimaCompra) : "—" },
        ].map((s) => (
          <div key={s.k} className="rounded-frame border border-white/8 bg-surface-1 p-3">
            <dt className="text-[0.7rem] text-fog-dim">{s.k}</dt>
            <dd className="mt-1 truncate font-display text-sm font-bold text-white">{s.v}</dd>
          </div>
        ))}
      </dl>

      <a
        href={wa(c.telefono, c.nombre)}
        target="_blank"
        rel="noopener noreferrer"
        className="v2-shine flex h-11 w-full items-center justify-center gap-2 rounded-btn bg-lime text-sm font-semibold text-ink hover:bg-[#C6FF33]"
      >
        <MessageCircle aria-hidden className="h-4 w-4" />
        Escribirle por WhatsApp
      </a>

      <ul className="space-y-2 text-sm text-fog">
        <li className="flex items-center gap-2"><Phone aria-hidden className="h-4 w-4 text-brand-soft" />{c.telefono}</li>
        {c.correo && <li className="flex items-center gap-2"><Mail aria-hidden className="h-4 w-4 text-brand-soft" />{c.correo}</li>}
        <li className="flex items-center gap-2"><MapPin aria-hidden className="h-4 w-4 text-brand-soft" />{c.ciudad} · llegó por {c.origen} · desde {fechaCorta(c.creado)}</li>
      </ul>

      <Campo label="Estado">
        <select value={c.estado} onChange={(e) => onChange({ estado: e.target.value as EstadoCliente })} className="pn-input">
          {estados.map((e) => (
            <option key={e.valor} value={e.valor}>{e.label}</option>
          ))}
        </select>
      </Campo>

      <Campo label="Notas">
        <textarea
          value={c.notas ?? ""}
          onChange={(e) => onChange({ notas: e.target.value })}
          rows={4}
          placeholder="Gustos, fechas especiales, lo que pidió la última vez…"
          className="pn-input h-auto py-2.5"
        />
      </Campo>

      <button
        type="button"
        onClick={() => {
          if (window.confirm(`¿Borrar a ${c.nombre}? Esto no se puede deshacer.`)) onDelete();
        }}
        className="inline-flex items-center gap-2 text-sm text-[#FF9BB0] hover:text-white"
      >
        <Trash2 aria-hidden className="h-4 w-4" /> Borrar cliente
      </button>
    </div>
  );
}

function NuevoCliente({ hoy, onSave }: { hoy: string; onSave: (c: Cliente) => void }) {
  const [error, setError] = useState("");
  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const nombre = String(f.get("nombre") ?? "").trim();
    const telefono = String(f.get("telefono") ?? "").replace(/\D/g, "");
    if (nombre.length < 2) return setError("Escribe el nombre del cliente.");
    if (telefono.length < 7) return setError("Revisa el teléfono: debe tener al menos 7 números.");
    onSave({
      id: nuevoId("c"),
      nombre,
      telefono,
      correo: String(f.get("correo") ?? "").trim() || undefined,
      ciudad: String(f.get("ciudad") ?? "").trim() || "Bogotá",
      origen: f.get("origen") as OrigenCliente,
      estado: "nuevo",
      compras: 0,
      totalComprado: 0,
      ultimaCompra: null,
      notas: String(f.get("notas") ?? "").trim() || undefined,
      creado: hoy,
    });
  };
  return (
    <form onSubmit={enviar} className="space-y-4" noValidate>
      <Campo label="Nombre *"><input name="nombre" autoComplete="off" className="pn-input" maxLength={80} /></Campo>
      <Campo label="Celular *"><input name="telefono" inputMode="tel" className="pn-input" maxLength={20} placeholder="300 000 0000" /></Campo>
      <Campo label="Correo"><input name="correo" type="email" className="pn-input" maxLength={120} /></Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Ciudad"><input name="ciudad" className="pn-input" maxLength={60} placeholder="Bogotá" /></Campo>
        <Campo label="Llegó por">
          <select name="origen" className="pn-input" defaultValue="WhatsApp">
            {origenes.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Campo>
      </div>
      <Campo label="Notas"><textarea name="notas" rows={3} className="pn-input h-auto py-2.5" maxLength={500} /></Campo>
      {error && <p role="alert" className="text-sm text-[#FF9BB0]">{error}</p>}
      <button type="submit" className="v2-shine h-11 w-full rounded-btn bg-lime text-sm font-semibold text-ink hover:bg-[#C6FF33]">
        Guardar cliente
      </button>
    </form>
  );
}
