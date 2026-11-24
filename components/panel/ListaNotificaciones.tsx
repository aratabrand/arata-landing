"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, Pencil, Plus, Send, Trash2, Lock, X } from "./iconos";
import type { EventoHistorial } from "@/lib/panel/historial";
import { HORAS_NOTIFICACION, haceCuanto } from "@/lib/panel/tiempo";
import { borrarTodasNotificaciones, borrarUnaNotificacion } from "@/app/(panel)/panel/(app)/notificaciones/acciones";
import { cn } from "@/lib/utils";

// Notificaciones de cada persona (D-185), como en Android o iPhone: «Nuevas» y «Antes», tiempo
// relativo («hace 5 min»), X o deslizar para borrar una, «Borrar todas», y cada una se va sola
// a las 24 horas. Solo se borran de la campana de quien las borra; el historial del panel queda igual.

const icono = { crear: Plus, editar: Pencil, borrar: Trash2, marcar: CircleCheck, cerrar: Lock, publicar: Send } as const;
const tono = { crear: "text-dato", editar: "text-fog", borrar: "text-alerta", marcar: "text-dato", cerrar: "text-dato", publicar: "text-dato" } as const;

/** A dónde lleva tocar la notificación (igual que los avisos al celular). */
export function enlaceDe(e: EventoHistorial) {
  if (e.entidad === "interesado") return "/panel/clientes?ver=interesados";
  if (e.entidad === "prospecto") return "/panel/clientes?ver=prospectos";
  if (e.entidad === "tarea") return e.accion === "borrar" || !e.entidadId ? "/panel/tareas" : `/panel/tareas?t=${e.entidadId}`;
  if (e.proyectoId && e.accion !== "borrar") return `/panel/proyectos/${e.proyectoId}`;
  if (e.entidad === "cliente") return "/panel/clientes";
  return null;
}

const VIDA_MS = HORAS_NOTIFICACION * 3_600_000;

export default function ListaNotificaciones({
  eventos,
  nuevos,
  ahora: ahoraInicial,
  onCambio,
  grande = false,
}: {
  eventos: EventoHistorial[];
  /** Las que llegaron desde la última vez que abrió la campana. */
  nuevos: Set<number>;
  /** Hora del servidor (ms) para que el tiempo relativo salga igual al hidratar. */
  ahora: number;
  /** Se borró una o todas (para que la campana actualice su número). */
  onCambio?: () => void;
  grande?: boolean;
}) {
  const router = useRouter();
  const [lista, setLista] = useState(eventos);
  const [ahora, setAhora] = useState(ahoraInicial);
  const [error, setError] = useState("");
  useEffect(() => setLista(eventos), [eventos]);
  // Cada minuto: se actualiza el «hace N min» y se van las que cumplieron 24 horas
  useEffect(() => {
    const t = window.setInterval(() => setAhora(Date.now()), 60_000);
    setAhora(Date.now());
    return () => window.clearInterval(t);
  }, []);

  const vivas = lista.filter((e) => ahora - Date.parse(e.creado) < VIDA_MS);
  const nuevas = vivas.filter((e) => nuevos.has(e.id));
  const antes = vivas.filter((e) => !nuevos.has(e.id));

  async function borrar(id: number) {
    setError("");
    const antesDeBorrar = lista;
    setLista((l) => l.filter((e) => e.id !== id));
    const r = await borrarUnaNotificacion(id).catch(() => ({ ok: false as const, error: "Sin conexión." }));
    if (!r.ok) {
      setLista(antesDeBorrar);
      setError(r.error);
    } else {
      onCambio?.();
      router.refresh();
    }
  }

  async function borrarTodo() {
    setError("");
    const antesDeBorrar = lista;
    setLista([]);
    const r = await borrarTodasNotificaciones().catch(() => ({ ok: false as const, error: "Sin conexión." }));
    if (!r.ok) {
      setLista(antesDeBorrar);
      setError(r.error);
    } else {
      onCambio?.();
      router.refresh();
    }
  }

  if (vivas.length === 0)
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-fog">No tienes notificaciones.</p>
        <p className="mt-1 text-xs text-fog-dim">Aquí llega lo que hacen los demás. Cada una se borra sola a las {HORAS_NOTIFICACION} horas.</p>
        {error && <p className="mt-2 text-sm text-alerta">{error}</p>}
      </div>
    );

  const grupo = (titulo: string, items: EventoHistorial[]) =>
    items.length > 0 && (
      <section>
        <p className="mb-2 px-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-fog-dim">{titulo}</p>
        <ul className="space-y-1.5">
          {items.map((e) => (
            <Item key={e.id} e={e} nueva={nuevos.has(e.id)} ahora={ahora} grande={grande} onBorrar={() => borrar(e.id)} />
          ))}
        </ul>
      </section>
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="text-xs text-fog-dim">Se borran solas a las {HORAS_NOTIFICACION} horas. Desliza o toca la X para quitar una.</p>
        <button type="button" onClick={borrarTodo} className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-fog hover:border-white/25 hover:text-white">
          Borrar todas
        </button>
      </div>
      {error && <p className="px-1 text-sm text-alerta">{error}</p>}
      {grupo("Nuevas", nuevas)}
      {grupo(nuevas.length ? "Antes" : "Recientes", antes)}
    </div>
  );
}

/** Una notificación. Se borra con la X o deslizándola a un lado (como en el celular). */
function Item({ e, nueva, ahora, grande, onBorrar }: { e: EventoHistorial; nueva: boolean; ahora: number; grande: boolean; onBorrar: () => void }) {
  const I = icono[e.accion] ?? Pencil;
  const href = enlaceDe(e);
  const inicio = useRef<{ x: number; y: number; id: number } | null>(null);
  const [dx, setDx] = useState(0);
  const [saliendo, setSaliendo] = useState(false);
  const movio = useRef(false);

  const abajo = (ev: PointerEvent<HTMLLIElement>) => {
    if (ev.pointerType === "mouse" && ev.button !== 0) return;
    inicio.current = { x: ev.clientX, y: ev.clientY, id: ev.pointerId };
    movio.current = false;
  };
  const mueve = (ev: PointerEvent<HTMLLIElement>) => {
    const i = inicio.current;
    if (!i || i.id !== ev.pointerId) return;
    const x = ev.clientX - i.x;
    // Solo cuenta si el gesto es horizontal (así no estorba el scroll de la lista)
    if (!movio.current && (Math.abs(x) < 10 || Math.abs(x) < Math.abs(ev.clientY - i.y))) return;
    movio.current = true;
    setDx(x);
  };
  const suelta = () => {
    if (!inicio.current) return;
    inicio.current = null;
    if (Math.abs(dx) > 90) {
      setSaliendo(true);
      setDx(dx > 0 ? 480 : -480);
      window.setTimeout(onBorrar, 180);
    } else setDx(0);
  };

  const cuerpo = (
    <>
      <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2", tono[e.accion])}>
        <I aria-hidden className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <strong className="truncate text-sm font-semibold text-white">{e.quien.split(" ")[0]}</strong>
          <time dateTime={e.creado} className="shrink-0 text-[0.7rem] text-fog-dim">
            {haceCuanto(e.creado, ahora)}
          </time>
        </span>
        <span className={cn("mt-0.5 block text-sm text-fog", !grande && "line-clamp-2")}>{e.titulo}</span>
        {grande && e.cambios.length > 0 && (
          <span className="mt-1 block text-[0.72rem] text-fog-dim">
            {e.cambios
              .slice(0, 3)
              .map((c) => `${c.campo}: ${c.despues || "—"}`)
              .join(" · ")}
          </span>
        )}
      </span>
    </>
  );

  return (
    <li
      onPointerDown={abajo}
      onPointerMove={mueve}
      onPointerUp={suelta}
      onPointerCancel={suelta}
      style={{ transform: dx ? `translateX(${dx}px)` : undefined, opacity: dx ? Math.max(0.2, 1 - Math.abs(dx) / 300) : undefined, touchAction: "pan-y" }}
      className={cn(
        "group relative flex items-start gap-1 rounded-frame border p-2.5 pr-1",
        nueva ? "border-white/15 bg-white/[0.05]" : "border-white/[0.06] bg-surface-1/60",
        (saliendo || dx === 0) && "transition-[transform,opacity] duration-200"
      )}
    >
      {nueva && <span aria-label="Nueva" className="absolute left-1 top-1 h-2 w-2 rounded-full bg-[#B6FF00]" />}
      {href ? (
        <Link
          href={href}
          onClick={(ev) => movio.current && ev.preventDefault()}
          draggable={false}
          className="flex min-w-0 flex-1 items-start gap-3 rounded-frame"
        >
          {cuerpo}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 items-start gap-3">{cuerpo}</div>
      )}
      <button type="button" onClick={onBorrar} aria-label={`Borrar: ${e.titulo}`} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-fog-dim hover:bg-white/[0.06] hover:text-white">
        <X aria-hidden className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}
