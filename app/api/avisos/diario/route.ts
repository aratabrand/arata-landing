import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { db } from "@/lib/panel/db";
import { panelActivo } from "@/lib/panel/config";
import { hoyColombia, fechaBogota } from "@/lib/panel/fecha";
import { alertasVencimiento } from "@/lib/panel/alertas";
import { avisarEquipo, pushActivo } from "@/lib/panel/push";
import type { FinProyecto } from "@/lib/panel/finanzas/tipos";
import type { FinTarea } from "@/lib/panel/finanzas/procesos";

// Aviso diario de vencimientos (D-119). Lo llama Vercel Cron a las 8 a. m. de Bogotá
// (13:00 UTC, vercel.json) con "Authorization: Bearer CRON_SECRET". Para cada proyecto:
// 2 días antes, el día de entrega y cada mañana que vaya tarde. Nunca repite el mismo
// aviso el mismo día (tabla avisos_enviados).
export const dynamic = "force-dynamic";

function autorizado(req: NextRequest) {
  const secreto = process.env.CRON_SECRET ?? "";
  const dado = req.headers.get("authorization") ?? "";
  const esperado = `Bearer ${secreto}`;
  return secreto.length >= 16 && dado.length === esperado.length && timingSafeEqual(Buffer.from(dado), Buffer.from(esperado));
}

export async function GET(req: NextRequest) {
  if (!panelActivo) return new NextResponse(null, { status: 404 });
  if (!autorizado(req)) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  if (!pushActivo) return NextResponse.json({ ok: true, enviados: 0, nota: "Faltan las claves VAPID." });

  const hoy = hoyColombia();
  const negocios = (await db().query(`select id from negocios where tipo = 'agencia'`)).rows;
  let enviados = 0;
  let avisos = 0;
  for (const n of negocios) {
    const [pr, ta] = await Promise.all([
      db().query(`select id, nombre, estado, fecha_limite, fecha_cierre from fin_proyectos where negocio_id = $1 and fecha_limite is not null and estado <> 'propuesta'`, [n.id]),
      db().query(`select t.id, t.proyecto_id, t.etapa, t.texto, t.hecha, t.orden from fin_tareas t join fin_proyectos p on p.id = t.proyecto_id where p.negocio_id = $1`, [n.id]),
    ]);
    const proyectos = pr.rows.map(
      (r) =>
        ({ id: r.id, nombre: r.nombre, estado: r.estado, fechaLimite: fechaBogota(r.fecha_limite), fechaCierre: fechaBogota(r.fecha_cierre), clienteId: null, servicioId: null, valor: 0, fechaInicio: null, tarifaDia: null, repartoCongelado: null, notas: null }) as FinProyecto
    );
    const tareas = ta.rows.map((r) => ({ id: r.id, proyectoId: r.proyecto_id, etapa: r.etapa, texto: r.texto, hecha: r.hecha, orden: r.orden }) as FinTarea);
    // "Por vencer" solo exactamente 2 días antes (lo que eligió Sergio); hoy y tarde, cada día
    const lista = alertasVencimiento({ proyectos, tareas }, hoy).filter((a) => a.tipo !== "faltan-2" || a.dias === 2);
    for (const a of lista) {
      const nuevo = await db().query(`insert into avisos_enviados (proyecto_id, tipo, fecha) values ($1, $2, $3) on conflict do nothing`, [a.proyecto.id, a.tipo, hoy]);
      if (!nuevo.rowCount) continue;
      avisos++;
      const titulo = a.tipo === "tarde" ? `⚠️ ${a.proyecto.nombre} va tarde` : a.tipo === "hoy" ? `📦 ${a.proyecto.nombre} se entrega hoy` : `⏰ ${a.proyecto.nombre} se entrega en 2 días`;
      const r = await avisarEquipo(n.id, { titulo, cuerpo: a.texto, url: `/panel/proyectos/${a.proyecto.id}`, etiqueta: `vence-${a.proyecto.id}` });
      enviados += r.enviados;
    }
  }
  return NextResponse.json({ ok: true, hoy, avisos, enviados }, { headers: { "cache-control": "no-store" } });
}
