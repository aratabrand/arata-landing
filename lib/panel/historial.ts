import { after } from "next/server";
import { db } from "./db";
import type { ContextoAgencia } from "./finanzas/datos";
import { avisarEquipo } from "./push";

// Historial del panel (D-119): quién hizo qué y cuándo. Lo escribe SOLO el servidor,
// dentro de cada acción, después de que el cambio salió bien. No tiene llaves foráneas
// a lo que registra: sobrevive aunque se borre el proyecto o el cliente.

export type Accion = "crear" | "editar" | "borrar" | "marcar" | "cerrar" | "publicar";
export type Entidad = "proyecto" | "cliente" | "gasto" | "gasto-fijo" | "dias" | "paso" | "reparto" | "servicio" | "persona" | "sitio" | "ciudad";
export type Cambio = { campo: string; antes: string; despues: string };

export type Registro = {
  accion: Accion;
  entidad: Entidad;
  entidadId?: string | null;
  proyectoId?: string | null;
  clienteId?: string | null;
  /** Frase corta: "Cambió el valor de Landing Panadería". */
  titulo: string;
  cambios?: Cambio[];
  /** Cambio clave: además llega como aviso al celular y computador de los demás (D-119). */
  importante?: boolean;
};

const corto = (t: string, n: number) => (t.length > n ? t.slice(0, n - 1) + "…" : t);

/** Nombre de quien está en sesión (para el historial). */
async function nombreDe(usuarioId: string) {
  const r = await db().query(`select name from "user" where id = $1`, [usuarioId]);
  return String(r.rows[0]?.name ?? "Alguien");
}

/** Deja el registro. Nunca hace fallar la acción: si no se puede escribir, se avisa en el log del servidor. */
export async function registrar(ctx: ContextoAgencia, r: Registro) {
  try {
    const quien = await nombreDe(ctx.usuarioId);
    const titulo = corto(r.titulo, 200);
    await db().query(
      `insert into panel_historial (negocio_id, usuario_id, quien, accion, entidad, entidad_id, proyecto_id, cliente_id, titulo, cambios, importante)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        ctx.negocioId,
        ctx.usuarioId,
        quien,
        r.accion,
        r.entidad,
        r.entidadId ?? null,
        r.proyectoId ?? null,
        r.clienteId ?? null,
        titulo,
        r.cambios?.length ? JSON.stringify(r.cambios.slice(0, 30).map((c) => ({ campo: corto(c.campo, 60), antes: corto(c.antes, 200), despues: corto(c.despues, 200) }))) : null,
        Boolean(r.importante),
      ]
    );
    // El aviso al celular sale después de responder: quien guarda no espera
    if (r.importante) after(() => avisarEquipo(ctx.negocioId, { titulo: `${quien}: ${titulo}`, cuerpo: resumenCambios(r.cambios), url: urlDe(r), excepto: ctx.usuarioId }));
  } catch (e) {
    console.error("[historial] no se pudo registrar:", e instanceof Error ? e.message : e);
  }
}

function urlDe(r: Registro) {
  if (r.proyectoId && r.accion !== "borrar") return `/panel/proyectos/${r.proyectoId}`;
  if (r.entidad === "cliente") return "/panel/clientes";
  return "/panel/notificaciones";
}

export function resumenCambios(c?: Cambio[]) {
  if (!c?.length) return "";
  return c
    .slice(0, 3)
    .map((x) => `${x.campo}: ${x.antes || "—"} → ${x.despues || "—"}`)
    .join(" · ");
}

/** Qué cambió entre dos versiones, con nombres de campo para personas. */
export function diferencias(antes: Record<string, unknown>, despues: Record<string, unknown>, etiquetas: Record<string, string>, formato?: Record<string, (v: unknown) => string>): Cambio[] {
  const txt = (k: string, v: unknown) => (v === null || v === undefined || v === "" ? "" : formato?.[k] ? formato[k](v) : String(v));
  return Object.keys(etiquetas)
    .filter((k) => txt(k, antes[k]) !== txt(k, despues[k]))
    .map((k) => ({ campo: etiquetas[k], antes: txt(k, antes[k]), despues: txt(k, despues[k]) }));
}

export const pesosTxt = (v: unknown) => "$ " + new Intl.NumberFormat("es-CO").format(Number(v) || 0);
export const fechaTxt = (v: unknown) => {
  const t = String(v ?? "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const [a, m, d] = t.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d, 12)).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
};

// ── Lectura ──────────────────────────────────────────────────────────
export type EventoHistorial = {
  id: number;
  quien: string;
  usuarioId: string | null;
  accion: Accion;
  entidad: Entidad;
  proyectoId: string | null;
  clienteId: string | null;
  titulo: string;
  cambios: Cambio[];
  importante: boolean;
  creado: string;
};

const mapa = (r: Record<string, unknown>): EventoHistorial => ({
  id: Number(r.id),
  quien: String(r.quien),
  usuarioId: (r.usuario_id as string) ?? null,
  accion: r.accion as Accion,
  entidad: r.entidad as Entidad,
  proyectoId: (r.proyecto_id as string) ?? null,
  clienteId: (r.cliente_id as string) ?? null,
  titulo: String(r.titulo),
  cambios: (r.cambios as Cambio[]) ?? [],
  importante: Boolean(r.importante),
  creado: (r.creado as Date).toISOString(),
});

export async function historialDe(negocioId: string, filtro: { proyectoId?: string; clienteId?: string; limite?: number } = {}) {
  const where = ["negocio_id = $1"];
  const vals: unknown[] = [negocioId];
  if (filtro.proyectoId) {
    vals.push(filtro.proyectoId);
    where.push(`proyecto_id = $${vals.length}`);
  }
  if (filtro.clienteId) {
    vals.push(filtro.clienteId);
    where.push(`cliente_id = $${vals.length}`);
  }
  vals.push(Math.min(500, filtro.limite ?? 100));
  const r = await db().query(
    `select id, quien, usuario_id, accion, entidad, proyecto_id, cliente_id, titulo, cambios, importante, creado
       from panel_historial where ${where.join(" and ")} order by creado desc, id desc limit $${vals.length}`,
    vals
  );
  return r.rows.map(mapa);
}
