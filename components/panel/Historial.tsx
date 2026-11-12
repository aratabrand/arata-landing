import { ArrowRight, CircleCheck, Pencil, Plus, Send, Trash2, Lock } from "lucide-react";
import type { EventoHistorial } from "@/lib/panel/historial";
import { cn } from "@/lib/utils";

// Lista del historial (D-119): quién hizo qué y cuándo, con lo que cambió (antes → después).
const icono = { crear: Plus, editar: Pencil, borrar: Trash2, marcar: CircleCheck, cerrar: Lock, publicar: Send } as const;
const tono = { crear: "text-lime", editar: "text-brand-soft", borrar: "text-[#FF9BB0]", marcar: "text-lime", cerrar: "text-lime", publicar: "text-lime" } as const;

export function cuando(iso: string) {
  return new Date(iso).toLocaleString("es-CO", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "America/Bogota" });
}

export default function Historial({ eventos, vacio = "Todavía no hay cambios registrados.", compacto = false, nuevos }: { eventos: EventoHistorial[]; vacio?: string; compacto?: boolean; nuevos?: Set<number> }) {
  if (!eventos.length) return <p className="text-sm text-fog-dim">{vacio}</p>;
  return (
    <ol className="space-y-3">
      {eventos.map((e) => {
        const I = icono[e.accion] ?? Pencil;
        return (
          <li key={e.id} className="flex gap-3">
            <span className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2", tono[e.accion])}>
              <I aria-hidden className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white">
                {nuevos?.has(e.id) && <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-lime align-middle" aria-label="Nuevo" />}
                <strong className="font-semibold">{e.quien}</strong> · {e.titulo}
              </p>
              <p className="text-[0.72rem] text-fog-dim">
                <time dateTime={e.creado}>{cuando(e.creado)}</time>
              </p>
              {!compacto && e.cambios.length > 0 && (
                <ul className="mt-1.5 space-y-0.5 rounded-frame border border-white/6 bg-surface-2/50 px-2.5 py-1.5 text-[0.75rem]">
                  {e.cambios.map((c, i) => (
                    <li key={i} className="flex flex-wrap items-center gap-x-1.5 text-fog">
                      <span className="text-fog-dim">{c.campo}:</span>
                      {c.antes && <span className={cn(c.despues ? "line-through decoration-white/30" : "")}>{c.antes}</span>}
                      {c.antes && c.despues && <ArrowRight aria-label="cambió a" className="h-3 w-3 text-fog-dim" />}
                      {c.despues && <span className="text-white">{c.despues}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
