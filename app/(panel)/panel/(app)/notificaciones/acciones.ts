"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/panel/db";
import { panelActivo } from "@/lib/panel/config";
import { cargarFinanzas, contextoAgencia } from "@/lib/panel/finanzas/datos";
import { marcarVisto, vistoHasta } from "@/lib/panel/notificaciones";
import { historialDe, type EventoHistorial } from "@/lib/panel/historial";
import { alertasVencimiento, type TipoAlerta } from "@/lib/panel/alertas";
import { hoyColombia } from "@/lib/panel/fecha";
import { avisarA, pushActivo } from "@/lib/panel/push";
import type { Resultado } from "../finanzas/acciones";

// Notificaciones (D-119): marcar como vistas y registrar este dispositivo para recibir avisos.
// Todo miembro de la agencia puede (cada uno maneja sus propios dispositivos).

async function ctxAgencia() {
  if (!panelActivo) throw new Error("El panel está en modo ejemplo.");
  const ctx = await contextoAgencia();
  if (!ctx) throw new Error("Tu sesión terminó. Vuelve a entrar.");
  return ctx;
}

export async function marcarNotificacionesVistas(): Promise<Resultado> {
  try {
    const ctx = await ctxAgencia();
    await marcarVisto(ctx.negocioId, ctx.usuarioId);
    revalidatePath("/panel", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No se pudo." };
  }
}

/** Guarda (o renueva) la suscripción de avisos de ESTE dispositivo. */
export async function guardarSuscripcion(s: { endpoint: string; p256dh: string; auth: string; dispositivo?: string }): Promise<Resultado> {
  try {
    const ctx = await ctxAgencia();
    if (!pushActivo) return { ok: false, error: "Los avisos todavía no están activados en el servidor." };
    const endpoint = String(s.endpoint ?? "");
    // Solo servicios de avisos de los navegadores (Chrome, Firefox, Safari, Edge)
    if (!/^https:\/\/[a-z0-9.-]+\.(googleapis\.com|mozilla\.com|mozaws\.net|push\.apple\.com|notify\.windows\.com)\//i.test(endpoint) || endpoint.length > 1000)
      return { ok: false, error: "Este navegador no es compatible con los avisos." };
    const p256dh = String(s.p256dh ?? "");
    const auth = String(s.auth ?? "");
    if (!/^[A-Za-z0-9_-]{20,200}$/.test(p256dh) || !/^[A-Za-z0-9_-]{8,100}$/.test(auth)) return { ok: false, error: "Suscripción no válida." };
    const dispositivo = String(s.dispositivo ?? "").slice(0, 120) || null;
    await db().query(
      `insert into push_suscripciones (usuario_id, negocio_id, endpoint, p256dh, auth, dispositivo)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (endpoint) do update set usuario_id = excluded.usuario_id, negocio_id = excluded.negocio_id,
         p256dh = excluded.p256dh, auth = excluded.auth, dispositivo = excluded.dispositivo`,
      [ctx.usuarioId, ctx.negocioId, endpoint, p256dh, auth, dispositivo]
    );
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No se pudo activar." };
  }
}

export async function quitarSuscripcion(endpoint: string): Promise<Resultado> {
  try {
    const ctx = await ctxAgencia();
    await db().query(`delete from push_suscripciones where endpoint = $1 and usuario_id = $2`, [String(endpoint ?? ""), ctx.usuarioId]);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No se pudo." };
  }
}

/** Manda un aviso de prueba a los dispositivos de quien lo pide. */
export async function probarAviso(): Promise<Resultado> {
  try {
    const ctx = await ctxAgencia();
    const r = await avisarA(ctx.negocioId, ctx.usuarioId, { titulo: "Avisos activados ✓", cuerpo: "Así te llegarán los vencimientos y los cambios importantes del panel.", url: "/panel/notificaciones", etiqueta: "prueba" });
    return r.enviados ? { ok: true } : { ok: false, error: "No hay dispositivos activos para enviar el aviso." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No se pudo enviar." };
  }
}

/** Lo último para la ventana de la campana (D-120): alertas de entrega + cambios recientes. Marca como vistas. */
export async function verNotificacionesRecientes(): Promise<
  | { ok: true; alertas: { id: string; nombre: string; tipo: TipoAlerta; texto: string }[]; eventos: EventoHistorial[]; visto: string | null; miUsuario: string }
  | { ok: false; error: string }
> {
  try {
    const ctx = await ctxAgencia();
    const datos = await cargarFinanzas();
    const alertas = datos ? alertasVencimiento(datos, hoyColombia()).map((a) => ({ id: a.proyecto.id, nombre: a.proyecto.nombre, tipo: a.tipo, texto: a.texto })) : [];
    const [eventos, visto] = await Promise.all([historialDe(ctx.negocioId, { limite: 12 }), vistoHasta(ctx.negocioId, ctx.usuarioId)]);
    await marcarVisto(ctx.negocioId, ctx.usuarioId);
    return { ok: true, alertas, eventos, visto, miUsuario: ctx.usuarioId };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No se pudieron leer las notificaciones." };
  }
}
