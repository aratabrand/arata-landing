"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/panel/db";
import { panelActivo } from "@/lib/panel/config";
import { contextoAgencia } from "@/lib/panel/finanzas/datos";
import { EMPRESA, actividades, categoriasGasto, categoriasServicio, type CategoriaServicio, type ReglasReparto } from "@/lib/panel/finanzas/tipos";
import { actividadDeEtapa, etapas, plantillas, type Etapa } from "@/lib/panel/finanzas/procesos";
import { diferencias, fechaTxt, pesosTxt, registrar } from "@/lib/panel/historial";

// Acciones de Finanzas (D-109). Cada una, en el servidor:
//   1. sesión completa con doble factor, 2. negocio de tipo 'agencia',
//   3. rol: 'dueno' (Sergio) o 'finanzas' (Andrés) editan; el valor del día y el equipo
//      son solo de Sergio, igual que borrar proyectos; 'equipo' (Santiago) solo ve y marca pasos (D-118, D-119).
//   4. valida los datos,
//   5. escribe filtrando SIEMPRE por negocio_id (nunca confía en el id que manda el navegador).
//   6. deja el registro en el historial (quién, qué y cuándo; D-119).

export type Resultado = { ok: true; id?: string } | { ok: false; error: string };

const NO = (error: string): Resultado => ({ ok: false, error });
const SI: Resultado = { ok: true };

async function editor() {
  if (!panelActivo) throw new Error("El panel está en modo ejemplo: los cambios no se guardan.");
  const ctx = await contextoAgencia();
  if (!ctx) throw new Error("Tu sesión terminó. Vuelve a entrar.");
  if (!ctx.editaFinanzas) throw new Error("Solo Sergio y Andrés pueden cambiar las finanzas.");
  return ctx;
}

async function soloDueno() {
  const ctx = await editor();
  if (!ctx.esDueno) throw new Error("Solo Sergio puede cambiar esto.");
  return ctx;
}

async function ejecutar(fn: () => Promise<Resultado>): Promise<Resultado> {
  try {
    const r = await fn();
    if (r.ok) {
      revalidatePath("/panel/finanzas", "layout");
      revalidatePath("/panel/equipo");
      revalidatePath("/panel/proyectos", "layout");
      revalidatePath("/panel/notificaciones");
    }
    return r;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    // Mensajes de la base: no se muestran crudos
    if (/violates|constraint|syntax|relation|column/i.test(msg)) return NO("No se pudo guardar. Revisa los datos e intenta otra vez.");
    return NO(msg || "No se pudo guardar.");
  }
}

// ── Validadores ─────────────────────────────────────────────────────
const texto = (v: unknown, min: number, max: number, campo: string) => {
  const t = String(v ?? "").trim();
  if (t.length < min || t.length > max) throw new Error(`${campo}: entre ${min} y ${max} caracteres.`);
  return t;
};
const opcional = (v: unknown, max: number) => {
  const t = String(v ?? "").trim();
  if (t.length > max) throw new Error(`Máximo ${max} caracteres.`);
  return t || null;
};
const pesos = (v: unknown, campo: string, min = 0) => {
  const n = Number(String(v ?? "").replace(/[^\d]/g, ""));
  if (!Number.isFinite(n) || n < min || n > 10_000_000_000) throw new Error(`${campo}: escribe un valor en pesos válido.`);
  return Math.round(n);
};
const fecha = (v: unknown, campo: string) => {
  const t = String(v ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t) || Number.isNaN(Date.parse(t))) throw new Error(`${campo}: fecha no válida.`);
  return t;
};
const uuid = (v: unknown) => {
  const t = String(v ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(t)) throw new Error("Registro no válido.");
  return t;
};

const valorDia = (v: unknown) => {
  const n = pesos(v, "Valor del día", 1000);
  if (n > 10_000_000) throw new Error("Valor del día: máximo 10.000.000.");
  return n;
};

/** Reglas de hoy: valor del día + partes iguales (socios activos + empresa). Se congelan al cerrar. */
async function reglasActuales(negocioId: string, tarifaProyecto: number | null): Promise<ReglasReparto> {
  const r = (await db().query(`select tarifa_dia from fin_config where negocio_id = $1`, [negocioId])).rows[0];
  if (!r) throw new Error("Falta configurar el reparto.");
  const socios = await db().query(`select id from equipo_personas where negocio_id = $1 and es_socio and activo order by orden, creado`, [negocioId]);
  return { tarifaDia: tarifaProyecto ?? Number(r.tarifa_dia), partes: [...socios.rows.map((x) => x.id as string), EMPRESA] };
}

// ── Reglas de reparto ───────────────────────────────────────────────
/** Valor del día (solo Sergio) y meses de reserva (Sergio y Andrés). */
export async function guardarReglas(entrada: { tarifaDia: number | string; reservaMeses: number }) {
  return ejecutar(async () => {
    const ctx = await editor();
    const reserva = Math.round(Number(entrada.reservaMeses));
    if (!(reserva >= 0 && reserva <= 24)) return NO("La reserva va de 0 a 24 meses.");
    const actual = (await db().query(`select tarifa_dia, reserva_meses from fin_config where negocio_id = $1`, [ctx.negocioId])).rows[0];
    const tarifa = valorDia(entrada.tarifaDia);
    if (actual && Number(actual.tarifa_dia) !== tarifa && !ctx.esDueno) return NO("Solo Sergio puede cambiar el valor del día.");
    await db().query(
      `insert into fin_config (negocio_id, bolsa_trabajo_pct, reparto, tarifa_dia, reserva_meses, actualizado_por)
       values ($1, 0, '[]', $2, $3, $4)
       on conflict (negocio_id) do update set tarifa_dia = excluded.tarifa_dia, reserva_meses = excluded.reserva_meses,
         actualizado_por = excluded.actualizado_por`,
      [ctx.negocioId, tarifa, reserva, ctx.usuarioId]
    );
    const cambios = diferencias(
      { tarifa: actual?.tarifa_dia, reserva: actual?.reserva_meses },
      { tarifa, reserva },
      { tarifa: "Valor del día", reserva: "Meses de reserva" },
      { tarifa: pesosTxt, reserva: (v) => `${v} meses` }
    );
    if (cambios.length) await registrar(ctx, { accion: "editar", entidad: "reparto", titulo: "Cambió el reparto", cambios, importante: cambios.some((c) => c.campo === "Valor del día") });
    return SI;
  });
}

// ── Proyectos ───────────────────────────────────────────────────────
export async function guardarProyecto(entrada: {
  id?: string;
  nombre: string;
  clienteId?: string;
  servicioId?: string;
  estado: string;
  valor: string | number;
  fechaCierre?: string;
  fechaLimite?: string;
  /** Valor del día solo de este proyecto ("" = el de Reparto). Solo Sergio. */
  tarifaDia?: string | number | null;
  notas?: string;
}) {
  return ejecutar(async () => {
    const ctx = await editor();
    const nombre = texto(entrada.nombre, 2, 90, "Nombre del proyecto");
    // Cliente y servicio: solo de sus tablas y del mismo negocio (D-110)
    const cliente = entrada.clienteId ? uuid(entrada.clienteId) : null;
    const servicio = entrada.servicioId ? uuid(entrada.servicioId) : null;
    if (!cliente) return NO("Elige el cliente de la lista.");
    if (!servicio) return NO("Elige el servicio de la lista.");
    const refs = await db().query(
      `select (select coalesce(empresa || ' · ' || nombre, nombre) from clientes where id = $1 and negocio_id = $3) c,
              (select nombre from servicios where id = $2 and negocio_id = $3) s`,
      [cliente, servicio, ctx.negocioId]
    );
    if (!refs.rows[0].c) return NO("Ese cliente no existe.");
    if (!refs.rows[0].s) return NO("Ese servicio no existe.");
    const notas = opcional(entrada.notas, 1000);
    const estado = String(entrada.estado);
    if (!["propuesta", "en-curso", "cerrado"].includes(estado)) return NO("Estado no válido.");
    const valor = pesos(entrada.valor, "Valor del proyecto");
    const cierre = estado === "cerrado" ? fecha(entrada.fechaCierre, "Fecha de cierre") : null;
    const limite = entrada.fechaLimite ? fecha(entrada.fechaLimite, "Fecha de entrega") : null;
    const tarifaPedida = entrada.tarifaDia === undefined || entrada.tarifaDia === null || entrada.tarifaDia === "" ? null : valorDia(entrada.tarifaDia);

    if (entrada.id) {
      const id = uuid(entrada.id);
      const prev = (
        await db().query(
          `select p.nombre, p.estado, p.valor, p.fecha_cierre, p.fecha_limite, p.tarifa_dia, p.reparto_congelado, p.notas,
                  (select coalesce(c.empresa || ' · ' || c.nombre, c.nombre) from clientes c where c.id = p.cliente_id) cliente,
                  (select s.nombre from servicios s where s.id = p.servicio_id) servicio
             from fin_proyectos p where p.id = $1 and p.negocio_id = $2`,
          [id, ctx.negocioId]
        )
      ).rows[0];
      if (!prev) return NO("Ese proyecto no existe.");
      // El valor del día del proyecto solo lo cambia Sergio; si Andrés guarda, se conserva el que había
      const anterior = prev.tarifa_dia === null ? null : Number(prev.tarifa_dia);
      if (tarifaPedida !== anterior && !ctx.esDueno && entrada.tarifaDia !== undefined) return NO("Solo Sergio puede cambiar el valor del día.");
      const tarifa = ctx.esDueno && entrada.tarifaDia !== undefined ? tarifaPedida : anterior;
      // Al cerrar se congelan las reglas (valor del día y partes); si se reabre, se sueltan
      const congelado =
        estado === "cerrado"
          ? prev.reparto_congelado?.partes && tarifa === anterior
            ? prev.reparto_congelado
            : await reglasActuales(ctx.negocioId, tarifa)
          : null;
      await db().query(
        `update fin_proyectos set nombre = $3, cliente_id = $4, servicio_id = $5, estado = $6, valor = $7, fecha_cierre = $8,
           reparto_congelado = $9, notas = $10, fecha_limite = $11, tarifa_dia = $12 where id = $1 and negocio_id = $2`,
        [id, ctx.negocioId, nombre, cliente, servicio, estado, valor, cierre, congelado ? JSON.stringify(congelado) : null, notas, limite, tarifa]
      );
      const cambios = diferencias(
        { ...prev, valor: Number(prev.valor), tarifa_dia: anterior },
        { nombre, cliente: refs.rows[0].c, servicio: refs.rows[0].s, estado, valor, fecha_cierre: cierre, fecha_limite: limite, tarifa_dia: tarifa, notas },
        { nombre: "Nombre", cliente: "Cliente", servicio: "Servicio", estado: "Estado", valor: "Valor", fecha_cierre: "Fecha de cierre", fecha_limite: "Fecha de entrega", tarifa_dia: "Valor del día", notas: "Notas" },
        { valor: pesosTxt, tarifa_dia: pesosTxt, fecha_cierre: fechaTxt, fecha_limite: fechaTxt, estado: nombreEstado }
      );
      if (cambios.length) {
        const cerro = estado === "cerrado" && prev.estado !== "cerrado";
        await registrar(ctx, {
          accion: cerro ? "cerrar" : "editar",
          entidad: "proyecto",
          entidadId: id,
          proyectoId: id,
          titulo: cerro ? `Cerró el proyecto ${nombre} (${pesosTxt(valor)})` : `Editó el proyecto ${nombre}`,
          cambios,
          // Cambios clave: cerrar, cambiar el valor, la entrega o el valor del día
          importante: cerro || cambios.some((c) => ["Valor", "Fecha de entrega", "Valor del día", "Estado"].includes(c.campo)),
        });
      }
    } else {
      if (tarifaPedida !== null && !ctx.esDueno) return NO("Solo Sergio puede poner un valor del día propio.");
      const congelado = estado === "cerrado" ? await reglasActuales(ctx.negocioId, tarifaPedida) : null;
      const nuevo = await db().query(
        `insert into fin_proyectos (negocio_id, nombre, cliente_id, servicio_id, estado, valor, fecha_cierre, reparto_congelado, notas, fecha_limite, tarifa_dia)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) returning id`,
        [ctx.negocioId, nombre, cliente, servicio, estado, valor, cierre, congelado ? JSON.stringify(congelado) : null, notas, limite, tarifaPedida]
      );
      // El proceso de entrega arranca con los pasos del servicio (D-112)
      await cargarPasos(nuevo.rows[0].id, servicio);
      await registrar(ctx, {
        accion: "crear",
        entidad: "proyecto",
        entidadId: nuevo.rows[0].id,
        proyectoId: nuevo.rows[0].id,
        titulo: `Creó el proyecto ${nombre} (${pesosTxt(valor)})`,
        cambios: [
          { campo: "Cliente", antes: "", despues: refs.rows[0].c },
          { campo: "Servicio", antes: "", despues: refs.rows[0].s },
          ...(limite ? [{ campo: "Fecha de entrega", antes: "", despues: fechaTxt(limite) }] : []),
        ],
        importante: true,
      });
      return { ok: true, id: nuevo.rows[0].id };
    }
    return SI;
  });
}

/** Vuelve a calcular un proyecto cerrado con las reglas de hoy (decisión explícita de Sergio). */
export async function aplicarReglasActuales(proyectoId: string) {
  return ejecutar(async () => {
    const ctx = await soloDueno();
    const id = uuid(proyectoId);
    const p = (await db().query(`select tarifa_dia from fin_proyectos where id = $1 and negocio_id = $2`, [id, ctx.negocioId])).rows[0];
    if (!p) return NO("Ese proyecto no existe.");
    const reglas = await reglasActuales(ctx.negocioId, p.tarifa_dia === null ? null : Number(p.tarifa_dia));
    const r = await db().query(
      `update fin_proyectos set reparto_congelado = $3 where id = $1 and negocio_id = $2 and estado = 'cerrado'`,
      [id, ctx.negocioId, JSON.stringify(reglas)]
    );
    if (!r.rowCount) return NO("Ese proyecto no está cerrado.");
    await registrar(ctx, { accion: "editar", entidad: "proyecto", entidadId: id, proyectoId: id, titulo: "Recalculó un proyecto cerrado con el reparto de hoy", importante: true });
    return SI;
  });
}

/** Lo que se borra junto con un proyecto (para la confirmación). */
async function contenidoProyecto(id: string, negocioId: string) {
  const r = await db().query(
    `select p.nombre, p.valor, p.estado,
            (select count(*) from fin_gastos g where g.proyecto_id = p.id)::int gastos,
            (select coalesce(sum(valor), 0) from fin_gastos g where g.proyecto_id = p.id)::bigint total_gastos,
            (select count(*) from fin_horas h where h.proyecto_id = p.id)::int registros_dias,
            (select coalesce(sum(dias), 0) from fin_horas h where h.proyecto_id = p.id)::float dias,
            (select count(*) from fin_tareas t where t.proyecto_id = p.id)::int pasos
       from fin_proyectos p where p.id = $1 and p.negocio_id = $2`,
    [id, negocioId]
  );
  return r.rows[0] as { nombre: string; valor: string; estado: string; gastos: number; total_gastos: string; registros_dias: number; dias: number; pasos: number } | undefined;
}

export type ContenidoProyecto = { nombre: string; valor: number; cerrado: boolean; gastos: number; totalGastos: number; registrosDias: number; dias: number; pasos: number };

export async function verContenidoProyecto(proyectoId: string): Promise<{ ok: true; datos: ContenidoProyecto } | { ok: false; error: string }> {
  try {
    const ctx = await soloDueno();
    const c = await contenidoProyecto(uuid(proyectoId), ctx.negocioId);
    if (!c) return { ok: false, error: "Ese proyecto no existe." };
    return {
      ok: true,
      datos: { nombre: c.nombre, valor: Number(c.valor), cerrado: c.estado === "cerrado", gastos: c.gastos, totalGastos: Number(c.total_gastos), registrosDias: c.registros_dias, dias: c.dias, pasos: c.pasos },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No se pudo leer." };
  }
}

/** Borra el proyecto y TODO lo suyo (gastos, días trabajados, pasos y avisos). Solo Sergio. Queda en el historial. */
export async function borrarProyecto(proyectoId: string, confirmacion: string) {
  return ejecutar(async () => {
    const ctx = await soloDueno();
    const id = uuid(proyectoId);
    const c = await contenidoProyecto(id, ctx.negocioId);
    if (!c) return NO("Ese proyecto no existe.");
    // Segunda barrera: hay que escribir el nombre del proyecto
    const norm = (t: string) => t.trim().toLowerCase().replace(/\s+/g, " ");
    if (norm(String(confirmacion ?? "")) !== norm(c.nombre)) return NO("Escribe el nombre del proyecto tal como aparece para confirmar.");
    // fin_gastos, fin_horas, fin_tareas y avisos_enviados se borran en cascada
    const r = await db().query(`delete from fin_proyectos where id = $1 and negocio_id = $2`, [id, ctx.negocioId]);
    if (!r.rowCount) return NO("Ese proyecto no existe.");
    await registrar(ctx, {
      accion: "borrar",
      entidad: "proyecto",
      entidadId: id,
      proyectoId: id,
      titulo: `Borró el proyecto ${c.nombre}`,
      cambios: [
        { campo: "Valor", antes: pesosTxt(c.valor), despues: "" },
        { campo: "Estado", antes: nombreEstado(c.estado), despues: "" },
        { campo: "Gastos", antes: `${c.gastos} (${pesosTxt(c.total_gastos)})`, despues: "" },
        { campo: "Días trabajados", antes: `${String(c.dias).replace(".", ",")} en ${c.registros_dias} registros`, despues: "" },
        { campo: "Pasos", antes: String(c.pasos), despues: "" },
      ],
      importante: true,
    });
    return SI;
  });
}

function nombreEstado(v: unknown) {
  return ({ propuesta: "Propuesta", "en-curso": "En curso", cerrado: "Cerrado" } as Record<string, string>)[String(v)] ?? String(v ?? "");
}

async function nombreProyecto(id: string, negocioId: string) {
  return String((await db().query(`select nombre from fin_proyectos where id = $1 and negocio_id = $2`, [id, negocioId])).rows[0]?.nombre ?? "");
}

// ── Proceso de entrega (pasos) ──────────────────────────────────────
async function cargarPasos(proyectoId: string, servicioId: string) {
  const cat = (await db().query(`select categoria from servicios where id = $1`, [servicioId])).rows[0]?.categoria as CategoriaServicio | undefined;
  const pasos = plantillas[cat ?? "otro"];
  for (const [i, t] of pasos.entries()) {
    await db().query(`insert into fin_tareas (proyecto_id, etapa, texto, orden) values ($1, $2, $3, $4)`, [proyectoId, t.etapa, t.texto, i]);
  }
}

/** Carga los pasos de la plantilla del servicio en un proyecto que no tiene. */
export async function cargarProceso(proyectoId: string) {
  return ejecutar(async () => {
    const ctx = await editor();
    const p = (await db().query(`select servicio_id from fin_proyectos where id = $1 and negocio_id = $2`, [uuid(proyectoId), ctx.negocioId])).rows[0];
    if (!p) return NO("Ese proyecto no existe.");
    if (!p.servicio_id) return NO("Primero elige el servicio del proyecto.");
    const ya = await db().query(`select count(*)::int n from fin_tareas where proyecto_id = $1`, [proyectoId]);
    if (ya.rows[0].n) return NO("Este proyecto ya tiene pasos.");
    await cargarPasos(proyectoId, p.servicio_id);
    await registrar(ctx, { accion: "crear", entidad: "paso", proyectoId, titulo: `Cargó los pasos de ${await nombreProyecto(proyectoId, ctx.negocioId)}` });
    return SI;
  });
}

/** Marca o desmarca un paso. Cualquier miembro de la agencia puede (D-113); queda quién fue. */
export async function marcarPaso(tareaId: string, hecha: boolean) {
  return ejecutar(async () => {
    if (!panelActivo) throw new Error("El panel está en modo ejemplo: los cambios no se guardan.");
    const ctx = await contextoAgencia();
    if (!ctx) throw new Error("Tu sesión terminó. Vuelve a entrar.");
    const r = await db().query(
      `update fin_tareas t set hecha = $3, hecha_en = case when $3 then now() else null end,
              hecha_por = case when $3 then $4 else null end
         from fin_proyectos p where t.id = $1 and t.proyecto_id = p.id and p.negocio_id = $2
       returning t.texto, p.id proyecto_id, p.nombre proyecto`,
      [uuid(tareaId), ctx.negocioId, Boolean(hecha), ctx.usuarioId]
    );
    if (!r.rowCount) return NO("Ese paso no existe.");
    const x = r.rows[0];
    await registrar(ctx, { accion: "marcar", entidad: "paso", entidadId: tareaId, proyectoId: x.proyecto_id, titulo: `${hecha ? "Marcó" : "Desmarcó"} "${x.texto}" en ${x.proyecto}` });
    return SI;
  });
}

// ── Responsable y días de cada paso (D-123) ─────────────────────────
// Sergio y Andrés asignan y registran para cualquiera; el resto del equipo, solo para sí mismo.
async function miembro() {
  if (!panelActivo) throw new Error("El panel está en modo ejemplo: los cambios no se guardan.");
  const ctx = await contextoAgencia();
  if (!ctx) throw new Error("Tu sesión terminó. Vuelve a entrar.");
  return ctx;
}

async function personaValida(ctx: Awaited<ReturnType<typeof miembro>>, personaId: string) {
  const r = (
    await db().query(`select id, nombre, usuario_id, activo from equipo_personas where id = $1 and negocio_id = $2`, [uuid(personaId), ctx.negocioId])
  ).rows[0];
  if (!r) throw new Error("Esa persona no está en el equipo.");
  if (!ctx.editaFinanzas && r.usuario_id !== ctx.usuarioId) throw new Error("Solo puedes ponerte a ti como responsable y registrar tus propios días.");
  return { id: r.id as string, nombre: r.nombre as string };
}

async function pasoDe(ctx: Awaited<ReturnType<typeof miembro>>, tareaId: string) {
  const r = (
    await db().query(
      `select t.id, t.texto, t.etapa, t.hecha, t.responsable_id, p.id proyecto_id, p.nombre proyecto
         from fin_tareas t join fin_proyectos p on p.id = t.proyecto_id where t.id = $1 and p.negocio_id = $2`,
      [uuid(tareaId), ctx.negocioId]
    )
  ).rows[0];
  if (!r) throw new Error("Ese paso no existe.");
  return r as { id: string; texto: string; etapa: Etapa; hecha: boolean; responsable_id: string | null; proyecto_id: string; proyecto: string };
}

function diasValidos(v: unknown) {
  const d = Number(String(v ?? "").replace(",", "."));
  if (!(d > 0 && d <= 365) || Math.round(d * 2) !== d * 2) throw new Error("Escribe los días en enteros o medios días (ej. 2 o 2,5).");
  return d;
}
const diasTxt = (d: number) => `${String(d).replace(".", ",")} ${d === 1 ? "día" : "días"}`;

/**
 * Marca un paso como hecho diciendo quién lo hizo y, si se quiere, cuántos días le tomó.
 * Los días quedan en fin_horas con el paso (cuentan en el reparto).
 */
export async function completarPaso(entrada: { tareaId: string; responsableId: string; dias?: string | number | null; actividad?: string; fecha?: string }) {
  return ejecutar(async () => {
    const ctx = await miembro();
    const t = await pasoDe(ctx, entrada.tareaId);
    const persona = await personaValida(ctx, entrada.responsableId);
    const conDias = entrada.dias !== undefined && entrada.dias !== null && String(entrada.dias).trim() !== "";
    const dias = conDias ? diasValidos(entrada.dias) : 0;
    const actividad = String(entrada.actividad || actividadDeEtapa[t.etapa]);
    if (!(actividades as readonly string[]).includes(actividad)) return NO("Elige la actividad.");
    const dia = entrada.fecha ? fecha(entrada.fecha, "Fecha") : null;
    await db().query(
      `update fin_tareas set hecha = true, hecha_en = coalesce(case when hecha then hecha_en end, now()),
              hecha_por = coalesce(case when hecha then hecha_por end, $2), responsable_id = $3 where id = $1`,
      [t.id, ctx.usuarioId, persona.id]
    );
    if (conDias) {
      await db().query(
        `insert into fin_horas (proyecto_id, persona_id, area, dias, fecha, tarea_id) values ($1, $2, $3, $4, coalesce($5::date, current_date), $6)`,
        [t.proyecto_id, persona.id, actividad, dias, dia, t.id]
      );
    }
    await registrar(ctx, {
      accion: "marcar",
      entidad: "paso",
      entidadId: t.id,
      proyectoId: t.proyecto_id,
      titulo: `Marcó "${t.texto}" en ${t.proyecto}: lo hizo ${persona.nombre}${conDias ? ` en ${diasTxt(dias)}` : ""}`,
      cambios: conDias ? [{ campo: "Días trabajados", antes: "", despues: `${diasTxt(dias)} de ${actividad} (${persona.nombre})` }] : [],
      // Los días cambian el reparto: aviso al celular
      importante: conDias,
    });
    return SI;
  });
}

/** Suma días trabajados a un paso (y lo deja con responsable si no tenía). */
export async function agregarDiasPaso(entrada: { tareaId: string; personaId: string; dias: string | number; actividad?: string; fecha?: string; nota?: string }) {
  return ejecutar(async () => {
    const ctx = await miembro();
    const t = await pasoDe(ctx, entrada.tareaId);
    const persona = await personaValida(ctx, entrada.personaId);
    const dias = diasValidos(entrada.dias);
    const actividad = String(entrada.actividad || actividadDeEtapa[t.etapa]);
    if (!(actividades as readonly string[]).includes(actividad)) return NO("Elige la actividad.");
    await db().query(
      `insert into fin_horas (proyecto_id, persona_id, area, dias, fecha, nota, tarea_id) values ($1, $2, $3, $4, $5, $6, $7)`,
      [t.proyecto_id, persona.id, actividad, dias, fecha(entrada.fecha, "Fecha"), opcional(entrada.nota, 200), t.id]
    );
    if (!t.responsable_id) await db().query(`update fin_tareas set responsable_id = $2 where id = $1`, [t.id, persona.id]);
    await registrar(ctx, {
      accion: "crear",
      entidad: "dias",
      entidadId: t.id,
      proyectoId: t.proyecto_id,
      titulo: `Registró ${diasTxt(dias)} de ${actividad} de ${persona.nombre} en "${t.texto}" (${t.proyecto})`,
      importante: true,
    });
    return SI;
  });
}

/** Cambia (o quita) el responsable de un paso. */
export async function cambiarResponsable(tareaId: string, personaId: string | null) {
  return ejecutar(async () => {
    const ctx = await miembro();
    const t = await pasoDe(ctx, tareaId);
    // Quitar al responsable: Sergio y Andrés, o la misma persona si era ella
    if (!personaId) {
      if (t.responsable_id && !ctx.editaFinanzas) await personaValida(ctx, t.responsable_id);
      await db().query(`update fin_tareas set responsable_id = null where id = $1`, [t.id]);
      await registrar(ctx, { accion: "editar", entidad: "paso", entidadId: t.id, proyectoId: t.proyecto_id, titulo: `Quitó el responsable de "${t.texto}" (${t.proyecto})` });
      return SI;
    }
    const persona = await personaValida(ctx, personaId);
    await db().query(`update fin_tareas set responsable_id = $2 where id = $1`, [t.id, persona.id]);
    await registrar(ctx, { accion: "editar", entidad: "paso", entidadId: t.id, proyectoId: t.proyecto_id, titulo: `Puso a ${persona.nombre} como responsable de "${t.texto}" (${t.proyecto})` });
    return SI;
  });
}

export async function agregarPaso(entrada: { proyectoId: string; etapa: string; texto: string }) {
  return ejecutar(async () => {
    const ctx = await editor();
    const proyectoId = uuid(entrada.proyectoId);
    if (!etapas.some((e) => e.valor === entrada.etapa)) return NO("Etapa no válida.");
    const ok = await db().query(`select 1 from fin_proyectos where id = $1 and negocio_id = $2`, [proyectoId, ctx.negocioId]);
    if (!ok.rowCount) return NO("Ese proyecto no existe.");
    await db().query(
      `insert into fin_tareas (proyecto_id, etapa, texto, orden)
       values ($1, $2, $3, coalesce((select max(orden) + 1 from fin_tareas where proyecto_id = $1), 0))`,
      [proyectoId, entrada.etapa, texto(entrada.texto, 2, 120, "Paso")]
    );
    await registrar(ctx, { accion: "crear", entidad: "paso", proyectoId, titulo: `Agregó el paso "${String(entrada.texto).trim()}" en ${await nombreProyecto(proyectoId, ctx.negocioId)}` });
    return SI;
  });
}

export async function borrarPaso(tareaId: string) {
  return ejecutar(async () => {
    const ctx = await editor();
    const r = await db().query(
      `delete from fin_tareas t using fin_proyectos p where t.id = $1 and t.proyecto_id = p.id and p.negocio_id = $2
       returning t.texto, p.id proyecto_id, p.nombre proyecto`,
      [uuid(tareaId), ctx.negocioId]
    );
    if (!r.rowCount) return NO("Ese paso no existe.");
    await registrar(ctx, { accion: "borrar", entidad: "paso", proyectoId: r.rows[0].proyecto_id, titulo: `Quitó el paso "${r.rows[0].texto}" de ${r.rows[0].proyecto}` });
    return SI;
  });
}

// ── Gastos ──────────────────────────────────────────────────────────
export async function agregarGasto(entrada: { proyectoId: string | null; concepto: string; categoria: string; valor: string | number; fecha: string }) {
  return ejecutar(async () => {
    const ctx = await editor();
    const proyectoId = entrada.proyectoId ? uuid(entrada.proyectoId) : null;
    if (proyectoId) {
      const existe = await db().query(`select 1 from fin_proyectos where id = $1 and negocio_id = $2`, [proyectoId, ctx.negocioId]);
      if (!existe.rowCount) return NO("Ese proyecto no existe.");
    }
    if (!categoriasGasto.some((c) => c.valor === entrada.categoria)) return NO("Elige una categoría.");
    const concepto = texto(entrada.concepto, 2, 90, "Concepto");
    const valor = pesos(entrada.valor, "Valor", 1);
    const dia = fecha(entrada.fecha, "Fecha");
    await db().query(
      `insert into fin_gastos (negocio_id, proyecto_id, concepto, categoria, valor, fecha) values ($1, $2, $3, $4, $5, $6)`,
      [ctx.negocioId, proyectoId, concepto, entrada.categoria, valor, dia]
    );
    const donde = proyectoId ? ` en ${await nombreProyecto(proyectoId, ctx.negocioId)}` : " de la empresa";
    await registrar(ctx, { accion: "crear", entidad: "gasto", proyectoId, titulo: `Registró un gasto${donde}: ${concepto} ${pesosTxt(valor)}`, cambios: [{ campo: "Fecha", antes: "", despues: fechaTxt(dia) }], importante: true });
    return SI;
  });
}

export async function borrarGasto(gastoId: string) {
  return ejecutar(async () => {
    const ctx = await editor();
    const r = await db().query(`delete from fin_gastos where id = $1 and negocio_id = $2 returning concepto, valor, proyecto_id`, [uuid(gastoId), ctx.negocioId]);
    if (!r.rowCount) return NO("Ese gasto no existe.");
    const g = r.rows[0];
    await registrar(ctx, { accion: "borrar", entidad: "gasto", proyectoId: g.proyecto_id, titulo: `Quitó el gasto ${g.concepto} (${pesosTxt(g.valor)})`, importante: true });
    return SI;
  });
}

// ── Días trabajados (quién hizo qué) ────────────────────────────────
/** Días que una persona trabajó en una actividad del proyecto. 1 día = 8 horas; se permiten medios días. */
export async function agregarTrabajo(entrada: { proyectoId: string; personaId: string; actividad: string; dias: string | number; fecha: string; nota?: string }) {
  return ejecutar(async () => {
    const ctx = await editor();
    const proyectoId = uuid(entrada.proyectoId);
    const personaId = uuid(entrada.personaId);
    const ok = await db().query(
      `select p.nombre proyecto, pe.nombre persona from fin_proyectos p, equipo_personas pe
        where p.id = $1 and p.negocio_id = $3 and pe.id = $2 and pe.negocio_id = $3`,
      [proyectoId, personaId, ctx.negocioId]
    );
    if (!ok.rowCount) return NO("Proyecto o persona no válidos.");
    const actividad = String(entrada.actividad ?? "");
    if (!(actividades as readonly string[]).includes(actividad)) return NO("Elige la actividad.");
    const dias = Number(String(entrada.dias).replace(",", "."));
    if (!(dias > 0 && dias <= 365) || Math.round(dias * 2) !== dias * 2) return NO("Escribe los días en enteros o medios días (ej. 2 o 2,5).");
    await db().query(
      `insert into fin_horas (proyecto_id, persona_id, area, dias, fecha, nota) values ($1, $2, $3, $4, $5, $6)`,
      [proyectoId, personaId, actividad, dias, fecha(entrada.fecha, "Fecha"), opcional(entrada.nota, 200)]
    );
    const d = String(dias).replace(".", ",");
    await registrar(ctx, { accion: "crear", entidad: "dias", proyectoId, titulo: `Registró ${d} ${dias === 1 ? "día" : "días"} de ${actividad} de ${ok.rows[0].persona} en ${ok.rows[0].proyecto}`, importante: true });
    return SI;
  });
}

export async function borrarTrabajo(id: string) {
  return ejecutar(async () => {
    // Sergio y Andrés quitan cualquier registro; los demás, solo los suyos (D-123)
    const ctx = await miembro();
    if (!ctx.editaFinanzas) {
      const dueno = await db().query(
        `select 1 from fin_horas h join equipo_personas e on e.id = h.persona_id where h.id = $1 and e.usuario_id = $2`,
        [uuid(id), ctx.usuarioId]
      );
      if (!dueno.rowCount) return NO("Solo puedes quitar tus propios días.");
    }
    const r = await db().query(
      `delete from fin_horas h using fin_proyectos p where h.id = $1 and h.proyecto_id = p.id and p.negocio_id = $2
       returning h.dias, h.area, p.id proyecto_id, p.nombre proyecto,
                 (select nombre from equipo_personas e where e.id = h.persona_id) persona`,
      [uuid(id), ctx.negocioId]
    );
    if (!r.rowCount) return NO("Ese registro no existe.");
    const x = r.rows[0];
    await registrar(ctx, { accion: "borrar", entidad: "dias", proyectoId: x.proyecto_id, titulo: `Quitó ${String(Number(x.dias)).replace(".", ",")} días de ${x.area} de ${x.persona} en ${x.proyecto}`, importante: true });
    return SI;
  });
}

// ── Servicios (lista para elegir en los proyectos) ──────────────────
export async function guardarServicio(entrada: { id?: string; nombre: string; categoria: string; activo?: boolean }): Promise<Resultado> {
  return ejecutar(async () => {
    const ctx = await editor();
    const nombre = texto(entrada.nombre, 2, 80, "Nombre del servicio").replace(/\s+/g, " ");
    if (!categoriasServicio.some((c) => c.valor === entrada.categoria)) return NO("Elige la categoría.");
    const repetido = await db().query(
      `select id from servicios where negocio_id = $1 and lower(btrim(nombre)) = lower($2) and ($3::uuid is null or id <> $3::uuid)`,
      [ctx.negocioId, nombre, entrada.id ?? null]
    );
    if (repetido.rowCount) return NO(`Ya existe el servicio "${nombre}".`);
    if (entrada.id) {
      const prev = (await db().query(`select nombre, activo from servicios where id = $1 and negocio_id = $2`, [uuid(entrada.id), ctx.negocioId])).rows[0];
      const r = await db().query(
        `update servicios set nombre = $3, categoria = $4, activo = $5 where id = $1 and negocio_id = $2`,
        [uuid(entrada.id), ctx.negocioId, nombre, entrada.categoria, entrada.activo ?? true]
      );
      if (!r.rowCount) return NO("Ese servicio no existe.");
      const cambios = diferencias(prev ?? {}, { nombre, activo: entrada.activo ?? true }, { nombre: "Nombre", activo: "Activo" }, { activo: (v) => (v ? "Sí" : "No") });
      if (cambios.length) await registrar(ctx, { accion: "editar", entidad: "servicio", entidadId: entrada.id, titulo: `Editó el servicio ${nombre}`, cambios });
      return SI;
    }
    const r = await db().query(
      `insert into servicios (negocio_id, nombre, categoria, orden)
       values ($1, $2, $3, coalesce((select max(orden) + 1 from servicios where negocio_id = $1), 1)) returning id`,
      [ctx.negocioId, nombre, entrada.categoria]
    );
    await registrar(ctx, { accion: "crear", entidad: "servicio", entidadId: r.rows[0].id, titulo: `Agregó el servicio ${nombre}` });
    return { ok: true, id: r.rows[0].id };
  });
}

// ── Equipo ──────────────────────────────────────────────────────────
export async function guardarPersona(entrada: { id?: string; nombre: string; area: string; esSocio: boolean; activo: boolean }) {
  return ejecutar(async () => {
    const ctx = await soloDueno();
    const nombre = texto(entrada.nombre, 2, 60, "Nombre");
    const area = texto(entrada.area, 2, 60, "Área");
    if (entrada.id) {
      const prev = (await db().query(`select nombre, area, es_socio, activo from equipo_personas where id = $1 and negocio_id = $2`, [uuid(entrada.id), ctx.negocioId])).rows[0];
      const r = await db().query(
        `update equipo_personas set nombre = $3, area = $4, es_socio = $5, activo = $6 where id = $1 and negocio_id = $2`,
        [uuid(entrada.id), ctx.negocioId, nombre, area, Boolean(entrada.esSocio), Boolean(entrada.activo)]
      );
      if (!r.rowCount) return NO("Esa persona no existe.");
      const siNo = (v: unknown) => (v ? "Sí" : "No");
      const cambios = diferencias(prev ?? {}, { nombre, area, es_socio: Boolean(entrada.esSocio), activo: Boolean(entrada.activo) }, { nombre: "Nombre", area: "Área", es_socio: "Socio", activo: "Activo" }, { es_socio: siNo, activo: siNo });
      if (cambios.length) await registrar(ctx, { accion: "editar", entidad: "persona", entidadId: entrada.id, titulo: `Editó a ${nombre} en el equipo`, cambios, importante: cambios.some((c) => c.campo === "Socio" || c.campo === "Activo") });
      return SI;
    }
    await db().query(
      `insert into equipo_personas (negocio_id, nombre, area, es_socio, orden)
       values ($1, $2, $3, $4, coalesce((select max(orden) + 1 from equipo_personas where negocio_id = $1), 1))`,
      [ctx.negocioId, nombre, area, Boolean(entrada.esSocio)]
    );
    await registrar(ctx, { accion: "crear", entidad: "persona", titulo: `Agregó a ${nombre} al equipo`, importante: true });
    return SI;
  });
}

// ── Gastos fijos ────────────────────────────────────────────────────
export async function guardarGastoFijo(entrada: { id?: string; concepto: string; valorMensual: string | number; activo: boolean }) {
  return ejecutar(async () => {
    const ctx = await editor();
    const concepto = texto(entrada.concepto, 2, 90, "Concepto");
    const valor = pesos(entrada.valorMensual, "Valor mensual", 1);
    if (entrada.id) {
      const prev = (await db().query(`select concepto, valor_mensual, activo from fin_gastos_fijos where id = $1 and negocio_id = $2`, [uuid(entrada.id), ctx.negocioId])).rows[0];
      const r = await db().query(
        `update fin_gastos_fijos set concepto = $3, valor_mensual = $4, activo = $5 where id = $1 and negocio_id = $2`,
        [uuid(entrada.id), ctx.negocioId, concepto, valor, Boolean(entrada.activo)]
      );
      if (!r.rowCount) return NO("Ese gasto no existe.");
      const cambios = diferencias(
        { ...prev, valor_mensual: Number(prev?.valor_mensual) },
        { concepto, valor_mensual: valor, activo: Boolean(entrada.activo) },
        { concepto: "Concepto", valor_mensual: "Valor mensual", activo: "Se cuenta" },
        { valor_mensual: pesosTxt, activo: (v) => (v ? "Sí" : "No") }
      );
      if (cambios.length) await registrar(ctx, { accion: "editar", entidad: "gasto-fijo", entidadId: entrada.id, titulo: `Editó el gasto fijo ${concepto}`, cambios, importante: true });
      return SI;
    }
    await db().query(`insert into fin_gastos_fijos (negocio_id, concepto, valor_mensual) values ($1, $2, $3)`, [ctx.negocioId, concepto, valor]);
    await registrar(ctx, { accion: "crear", entidad: "gasto-fijo", titulo: `Agregó el gasto fijo ${concepto} (${pesosTxt(valor)} al mes)`, importante: true });
    return SI;
  });
}

export async function borrarGastoFijo(id: string) {
  return ejecutar(async () => {
    const ctx = await editor();
    const r = await db().query(`delete from fin_gastos_fijos where id = $1 and negocio_id = $2 returning concepto, valor_mensual`, [uuid(id), ctx.negocioId]);
    if (!r.rowCount) return NO("Ese gasto no existe.");
    await registrar(ctx, { accion: "borrar", entidad: "gasto-fijo", titulo: `Quitó el gasto fijo ${r.rows[0].concepto} (${pesosTxt(r.rows[0].valor_mensual)} al mes)`, importante: true });
    return SI;
  });
}

