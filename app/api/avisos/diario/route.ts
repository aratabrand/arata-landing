import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { db } from "@/lib/panel/db";
import { panelActivo } from "@/lib/panel/config";
import { hoyColombia, fechaBogota } from "@/lib/panel/fecha";
import { alertasVencimiento } from "@/lib/panel/alertas";
import { recordatorioEspera } from "@/lib/panel/clientes/interesados";
import { avisarA, avisarEquipo, pushActivo } from "@/lib/panel/push";
import { limpiarBorradas } from "@/lib/panel/notificaciones";
import { resumenDiario, textoRecordatorio, tocaRecordar } from "@/lib/panel/tareas/tareas";
import type { FinProyecto } from "@/lib/panel/finanzas/tipos";
import type { FinTarea } from "@/lib/panel/finanzas/procesos";

// Aviso diario de vencimientos (D-119), de interesados en espera (D-144) y de las tareas de cada persona (D-181). Lo llama Vercel Cron a las 8 a. m. de Bogotá
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

    // Interesados en espera (D-144): un día antes del plazo y el día del plazo
    const espera = await db().query(
      `select i.id, i.nombre, (i.espera_hasta - $2::date) as dias,
              (select n.texto from interesado_notas n where n.interesado_id = i.id order by n.creado desc limit 1) as nota
         from interesados i
        where i.negocio_id = $1 and i.estado = 'espera' and i.espera_hasta between $2::date and $2::date + 1`,
      [n.id, hoy]
    );
    for (const x of espera.rows) {
      const rec = recordatorioEspera(x.nombre, Number(x.dias), x.nota);
      if (!rec) continue;
      const nuevo = await db().query(`insert into avisos_interesados (interesado_id, tipo, fecha) values ($1, $2, $3) on conflict do nothing`, [x.id, rec.tipo, hoy]);
      if (!nuevo.rowCount) continue;
      avisos++;
      const r = await avisarEquipo(n.id, { titulo: rec.titulo, cuerpo: rec.cuerpo, url: "/panel/clientes?ver=interesados", etiqueta: `espera-${x.id}` });
      enviados += r.enviados;
    }

    // Tareas (D-181): a cada persona, sus tareas de hoy y las vencidas (una vez al día)
    const delEquipo = await db().query(
      `select p.usuario_id, p.nombre, t.titulo, t.fecha::text fecha, t.estado, t.prioridad
         from agencia_tareas t join equipo_personas p on p.id = t.responsable_id
        where t.negocio_id = $1 and p.usuario_id is not null and p.activo and t.estado <> 'hecha' and t.fecha <= $2::date`,
      [n.id, hoy]
    );
    type Pendiente = Parameters<typeof resumenDiario>[1][number];
    const porPersona = new Map<string, { nombre: string; lista: Pendiente[] }>();
    delEquipo.rows.forEach((r) => {
      const x: { nombre: string; lista: Pendiente[] } = porPersona.get(r.usuario_id) ?? { nombre: r.nombre, lista: [] };
      x.lista.push({ titulo: r.titulo, fecha: r.fecha, estado: r.estado, prioridad: r.prioridad });
      porPersona.set(r.usuario_id, x);
    });
    // Recordatorios de tareas (D-183): a quien la tiene y a quien lo puso, una vez por día de la tarea
    const recordar = await db().query(
      `select t.id, t.titulo, t.fecha::text fecha, t.estado, t.prioridad, t.recordatorio, t.recordatorio_por, p.usuario_id responsable
         from agencia_tareas t left join equipo_personas p on p.id = t.responsable_id
        where t.negocio_id = $1 and t.recordatorio is not null and t.estado <> 'hecha' and t.fecha >= $2::date`,
      [n.id, hoy]
    );
    for (const t of recordar.rows) {
      if (!tocaRecordar({ recordatorio: t.recordatorio, fecha: t.fecha, estado: t.estado }, hoy)) continue;
      const nuevo = await db().query(`insert into avisos_recordatorios (tarea_id, fecha) values ($1, $2) on conflict do nothing`, [t.id, t.fecha]);
      if (!nuevo.rowCount) continue;
      avisos++;
      const txt = textoRecordatorio({ titulo: t.titulo, fecha: t.fecha, prioridad: t.prioridad }, hoy);
      for (const usuarioId of new Set([t.responsable, t.recordatorio_por].filter(Boolean) as string[])) {
        const r = await avisarA(n.id, usuarioId, { titulo: txt.titulo, cuerpo: txt.cuerpo, url: `/panel/tareas?t=${t.id}`, etiqueta: `recordatorio-${t.id}` });
        enviados += r.enviados;
      }
    }

    for (const [usuarioId, x] of porPersona) {
      const res = resumenDiario(x.nombre, x.lista, hoy);
      if (!res) continue;
      const nuevo = await db().query(`insert into avisos_tareas (usuario_id, fecha) values ($1, $2) on conflict do nothing`, [usuarioId, hoy]);
      if (!nuevo.rowCount) continue;
      avisos++;
      const r = await avisarA(n.id, usuarioId, { titulo: res.titulo, cuerpo: res.cuerpo, url: "/panel/tareas", etiqueta: "tareas-del-dia" });
      enviados += r.enviados;
    }
  }
  // Lo borrado a mano que ya caducó solo (24 h) no necesita guardarse (D-185)
  await limpiarBorradas().catch(() => {});
  return NextResponse.json({ ok: true, hoy, avisos, enviados }, { headers: { "cache-control": "no-store" } });
}
