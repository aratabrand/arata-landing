"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/panel/db";
import { panelActivo } from "@/lib/panel/config";
import { contextoAgencia } from "@/lib/panel/finanzas/datos";
import { validarReglas } from "@/lib/panel/finanzas/calculo";
import { categoriasGasto, categoriasServicio, type CategoriaServicio, type ReglasReparto } from "@/lib/panel/finanzas/tipos";
import { etapas, plantillas } from "@/lib/panel/finanzas/procesos";

// Acciones de Finanzas (D-108). Cada una, en el servidor:
//   1. sesión completa con doble factor, 2. negocio de tipo 'agencia',
//   3. rol 'dueno' (Andrés y Santiago solo ven), 4. valida los datos,
//   5. escribe filtrando SIEMPRE por negocio_id (nunca confía en el id que manda el navegador).

export type Resultado = { ok: true; id?: string } | { ok: false; error: string };

const NO = (error: string): Resultado => ({ ok: false, error });
const SI: Resultado = { ok: true };

async function dueno() {
  if (!panelActivo) throw new Error("El panel está en modo ejemplo: los cambios no se guardan.");
  const ctx = await contextoAgencia();
  if (!ctx) throw new Error("Tu sesión terminó. Vuelve a entrar.");
  if (!ctx.puedeEditar) throw new Error("Solo Sergio puede cambiar las finanzas.");
  return ctx;
}

async function ejecutar(fn: () => Promise<Resultado>): Promise<Resultado> {
  try {
    const r = await fn();
    if (r.ok) {
      revalidatePath("/panel/finanzas", "layout");
      revalidatePath("/panel/equipo");
      revalidatePath("/panel/proyectos", "layout");
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

async function reglasActuales(negocioId: string): Promise<ReglasReparto> {
  const r = (await db().query(`select bolsa_trabajo_pct, reparto from fin_config where negocio_id = $1`, [negocioId])).rows[0];
  if (!r) throw new Error("Falta configurar el reparto.");
  return { bolsaTrabajoPct: Number(r.bolsa_trabajo_pct), reparto: r.reparto };
}

// ── Reglas de reparto ───────────────────────────────────────────────
export async function guardarReglas(entrada: { bolsaTrabajoPct: number; reparto: { beneficiario: string; pct: number }[]; reservaMeses: number }) {
  return ejecutar(async () => {
    const ctx = await dueno();
    const personas = (await db().query(`select id, nombre, area, es_socio, usuario_id, activo from equipo_personas where negocio_id = $1`, [ctx.negocioId])).rows.map(
      (r) => ({ id: r.id as string, nombre: r.nombre, area: r.area, esSocio: r.es_socio, usuarioId: r.usuario_id, activo: r.activo })
    );
    const reglas: ReglasReparto = {
      bolsaTrabajoPct: Math.round(Number(entrada.bolsaTrabajoPct) * 100) / 100,
      reparto: (entrada.reparto ?? []).map((p) => ({ beneficiario: String(p.beneficiario), pct: Math.round(Number(p.pct) * 100) / 100 })),
    };
    const errores = validarReglas(reglas, personas);
    if (errores.length) return NO(errores[0]);
    const reserva = Math.round(Number(entrada.reservaMeses));
    if (!(reserva >= 0 && reserva <= 24)) return NO("La reserva va de 0 a 24 meses.");
    await db().query(
      `insert into fin_config (negocio_id, bolsa_trabajo_pct, reparto, reserva_meses, actualizado_por)
       values ($1, $2, $3, $4, $5)
       on conflict (negocio_id) do update set bolsa_trabajo_pct = excluded.bolsa_trabajo_pct, reparto = excluded.reparto,
         reserva_meses = excluded.reserva_meses, actualizado_por = excluded.actualizado_por`,
      [ctx.negocioId, reglas.bolsaTrabajoPct, JSON.stringify(reglas.reparto), reserva, ctx.usuarioId]
    );
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
  notas?: string;
}) {
  return ejecutar(async () => {
    const ctx = await dueno();
    const nombre = texto(entrada.nombre, 2, 90, "Nombre del proyecto");
    // Cliente y servicio: solo de sus tablas y del mismo negocio (D-109)
    const cliente = entrada.clienteId ? uuid(entrada.clienteId) : null;
    const servicio = entrada.servicioId ? uuid(entrada.servicioId) : null;
    if (!cliente) return NO("Elige el cliente de la lista.");
    if (!servicio) return NO("Elige el servicio de la lista.");
    const refs = await db().query(
      `select (select count(*) from clientes where id = $1 and negocio_id = $3)::int c,
              (select count(*) from servicios where id = $2 and negocio_id = $3)::int s`,
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

    if (entrada.id) {
      const id = uuid(entrada.id);
      const prev = (await db().query(`select estado, reparto_congelado from fin_proyectos where id = $1 and negocio_id = $2`, [id, ctx.negocioId])).rows[0];
      if (!prev) return NO("Ese proyecto no existe.");
      // Al cerrar se congelan los % actuales; si se reabre, se sueltan
      const congelado = estado === "cerrado" ? (prev.reparto_congelado ?? (await reglasActuales(ctx.negocioId))) : null;
      await db().query(
        `update fin_proyectos set nombre = $3, cliente_id = $4, servicio_id = $5, estado = $6, valor = $7, fecha_cierre = $8,
           reparto_congelado = $9, notas = $10, fecha_limite = $11 where id = $1 and negocio_id = $2`,
        [id, ctx.negocioId, nombre, cliente, servicio, estado, valor, cierre, congelado ? JSON.stringify(congelado) : null, notas, limite]
      );
    } else {
      const congelado = estado === "cerrado" ? await reglasActuales(ctx.negocioId) : null;
      const nuevo = await db().query(
        `insert into fin_proyectos (negocio_id, nombre, cliente_id, servicio_id, estado, valor, fecha_cierre, reparto_congelado, notas, fecha_limite)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning id`,
        [ctx.negocioId, nombre, cliente, servicio, estado, valor, cierre, congelado ? JSON.stringify(congelado) : null, notas, limite]
      );
      // El proceso de entrega arranca con los pasos del servicio (D-111)
      await cargarPasos(nuevo.rows[0].id, servicio);
      return { ok: true, id: nuevo.rows[0].id };
    }
    return SI;
  });
}

/** Vuelve a calcular un proyecto cerrado con los % de hoy (decisión explícita de Sergio). */
export async function aplicarReglasActuales(proyectoId: string) {
  return ejecutar(async () => {
    const ctx = await dueno();
    const reglas = await reglasActuales(ctx.negocioId);
    const r = await db().query(
      `update fin_proyectos set reparto_congelado = $3 where id = $1 and negocio_id = $2 and estado = 'cerrado'`,
      [uuid(proyectoId), ctx.negocioId, JSON.stringify(reglas)]
    );
    return r.rowCount ? SI : NO("Ese proyecto no está cerrado.");
  });
}

export async function borrarProyecto(proyectoId: string) {
  return ejecutar(async () => {
    const ctx = await dueno();
    const r = await db().query(`delete from fin_proyectos where id = $1 and negocio_id = $2`, [uuid(proyectoId), ctx.negocioId]);
    return r.rowCount ? SI : NO("Ese proyecto no existe.");
  });
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
    const ctx = await dueno();
    const p = (await db().query(`select servicio_id from fin_proyectos where id = $1 and negocio_id = $2`, [uuid(proyectoId), ctx.negocioId])).rows[0];
    if (!p) return NO("Ese proyecto no existe.");
    if (!p.servicio_id) return NO("Primero elige el servicio del proyecto.");
    const ya = await db().query(`select count(*)::int n from fin_tareas where proyecto_id = $1`, [proyectoId]);
    if (ya.rows[0].n) return NO("Este proyecto ya tiene pasos.");
    await cargarPasos(proyectoId, p.servicio_id);
    return SI;
  });
}

/** Marca o desmarca un paso. */
export async function marcarPaso(tareaId: string, hecha: boolean) {
  return ejecutar(async () => {
    const ctx = await dueno();
    const r = await db().query(
      `update fin_tareas t set hecha = $3, hecha_en = case when $3 then now() else null end
         from fin_proyectos p where t.id = $1 and t.proyecto_id = p.id and p.negocio_id = $2`,
      [uuid(tareaId), ctx.negocioId, Boolean(hecha)]
    );
    return r.rowCount ? SI : NO("Ese paso no existe.");
  });
}

export async function agregarPaso(entrada: { proyectoId: string; etapa: string; texto: string }) {
  return ejecutar(async () => {
    const ctx = await dueno();
    const proyectoId = uuid(entrada.proyectoId);
    if (!etapas.some((e) => e.valor === entrada.etapa)) return NO("Etapa no válida.");
    const ok = await db().query(`select 1 from fin_proyectos where id = $1 and negocio_id = $2`, [proyectoId, ctx.negocioId]);
    if (!ok.rowCount) return NO("Ese proyecto no existe.");
    await db().query(
      `insert into fin_tareas (proyecto_id, etapa, texto, orden)
       values ($1, $2, $3, coalesce((select max(orden) + 1 from fin_tareas where proyecto_id = $1), 0))`,
      [proyectoId, entrada.etapa, texto(entrada.texto, 2, 120, "Paso")]
    );
    return SI;
  });
}

export async function borrarPaso(tareaId: string) {
  return ejecutar(async () => {
    const ctx = await dueno();
    const r = await db().query(
      `delete from fin_tareas t using fin_proyectos p where t.id = $1 and t.proyecto_id = p.id and p.negocio_id = $2`,
      [uuid(tareaId), ctx.negocioId]
    );
    return r.rowCount ? SI : NO("Ese paso no existe.");
  });
}

// ── Gastos ──────────────────────────────────────────────────────────
export async function agregarGasto(entrada: { proyectoId: string | null; concepto: string; categoria: string; valor: string | number; fecha: string }) {
  return ejecutar(async () => {
    const ctx = await dueno();
    const proyectoId = entrada.proyectoId ? uuid(entrada.proyectoId) : null;
    if (proyectoId) {
      const existe = await db().query(`select 1 from fin_proyectos where id = $1 and negocio_id = $2`, [proyectoId, ctx.negocioId]);
      if (!existe.rowCount) return NO("Ese proyecto no existe.");
    }
    if (!categoriasGasto.some((c) => c.valor === entrada.categoria)) return NO("Elige una categoría.");
    await db().query(
      `insert into fin_gastos (negocio_id, proyecto_id, concepto, categoria, valor, fecha) values ($1, $2, $3, $4, $5, $6)`,
      [ctx.negocioId, proyectoId, texto(entrada.concepto, 2, 90, "Concepto"), entrada.categoria, pesos(entrada.valor, "Valor", 1), fecha(entrada.fecha, "Fecha")]
    );
    return SI;
  });
}

export async function borrarGasto(gastoId: string) {
  return ejecutar(async () => {
    const ctx = await dueno();
    const r = await db().query(`delete from fin_gastos where id = $1 and negocio_id = $2`, [uuid(gastoId), ctx.negocioId]);
    return r.rowCount ? SI : NO("Ese gasto no existe.");
  });
}

// ── Horas ───────────────────────────────────────────────────────────
export async function agregarHoras(entrada: { proyectoId: string; personaId: string; horas: string | number; fecha: string; nota?: string }) {
  return ejecutar(async () => {
    const ctx = await dueno();
    const proyectoId = uuid(entrada.proyectoId);
    const personaId = uuid(entrada.personaId);
    const ok = await db().query(
      `select pe.area from fin_proyectos p, equipo_personas pe
        where p.id = $1 and p.negocio_id = $3 and pe.id = $2 and pe.negocio_id = $3`,
      [proyectoId, personaId, ctx.negocioId]
    );
    if (!ok.rowCount) return NO("Proyecto o persona no válidos.");
    const horas = Math.round(Number(String(entrada.horas).replace(",", ".")) * 100) / 100;
    if (!(horas > 0 && horas <= 1000)) return NO("Las horas van de 0,25 a 1.000.");
    await db().query(
      `insert into fin_horas (proyecto_id, persona_id, area, horas, fecha, nota) values ($1, $2, $3, $4, $5, $6)`,
      [proyectoId, personaId, ok.rows[0].area, horas, fecha(entrada.fecha, "Fecha"), opcional(entrada.nota, 200)]
    );
    return SI;
  });
}

export async function borrarHoras(horasId: string) {
  return ejecutar(async () => {
    const ctx = await dueno();
    const r = await db().query(
      `delete from fin_horas h using fin_proyectos p where h.id = $1 and h.proyecto_id = p.id and p.negocio_id = $2`,
      [uuid(horasId), ctx.negocioId]
    );
    return r.rowCount ? SI : NO("Ese registro no existe.");
  });
}

// ── Servicios (lista para elegir en los proyectos) ──────────────────
export async function guardarServicio(entrada: { id?: string; nombre: string; categoria: string; activo?: boolean }): Promise<Resultado> {
  return ejecutar(async () => {
    const ctx = await dueno();
    const nombre = texto(entrada.nombre, 2, 80, "Nombre del servicio").replace(/\s+/g, " ");
    if (!categoriasServicio.some((c) => c.valor === entrada.categoria)) return NO("Elige la categoría.");
    const repetido = await db().query(
      `select id from servicios where negocio_id = $1 and lower(btrim(nombre)) = lower($2) and ($3::uuid is null or id <> $3::uuid)`,
      [ctx.negocioId, nombre, entrada.id ?? null]
    );
    if (repetido.rowCount) return NO(`Ya existe el servicio "${nombre}".`);
    if (entrada.id) {
      const r = await db().query(
        `update servicios set nombre = $3, categoria = $4, activo = $5 where id = $1 and negocio_id = $2`,
        [uuid(entrada.id), ctx.negocioId, nombre, entrada.categoria, entrada.activo ?? true]
      );
      return r.rowCount ? SI : NO("Ese servicio no existe.");
    }
    const r = await db().query(
      `insert into servicios (negocio_id, nombre, categoria, orden)
       values ($1, $2, $3, coalesce((select max(orden) + 1 from servicios where negocio_id = $1), 1)) returning id`,
      [ctx.negocioId, nombre, entrada.categoria]
    );
    return { ok: true, id: r.rows[0].id };
  });
}

// ── Equipo ──────────────────────────────────────────────────────────
export async function guardarPersona(entrada: { id?: string; nombre: string; area: string; esSocio: boolean; activo: boolean }) {
  return ejecutar(async () => {
    const ctx = await dueno();
    const nombre = texto(entrada.nombre, 2, 60, "Nombre");
    const area = texto(entrada.area, 2, 60, "Área");
    if (entrada.id) {
      const r = await db().query(
        `update equipo_personas set nombre = $3, area = $4, es_socio = $5, activo = $6 where id = $1 and negocio_id = $2`,
        [uuid(entrada.id), ctx.negocioId, nombre, area, Boolean(entrada.esSocio), Boolean(entrada.activo)]
      );
      return r.rowCount ? SI : NO("Esa persona no existe.");
    }
    await db().query(
      `insert into equipo_personas (negocio_id, nombre, area, es_socio, orden)
       values ($1, $2, $3, $4, coalesce((select max(orden) + 1 from equipo_personas where negocio_id = $1), 1))`,
      [ctx.negocioId, nombre, area, Boolean(entrada.esSocio)]
    );
    return SI;
  });
}

// ── Gastos fijos ────────────────────────────────────────────────────
export async function guardarGastoFijo(entrada: { id?: string; concepto: string; valorMensual: string | number; activo: boolean }) {
  return ejecutar(async () => {
    const ctx = await dueno();
    const concepto = texto(entrada.concepto, 2, 90, "Concepto");
    const valor = pesos(entrada.valorMensual, "Valor mensual", 1);
    if (entrada.id) {
      const r = await db().query(
        `update fin_gastos_fijos set concepto = $3, valor_mensual = $4, activo = $5 where id = $1 and negocio_id = $2`,
        [uuid(entrada.id), ctx.negocioId, concepto, valor, Boolean(entrada.activo)]
      );
      return r.rowCount ? SI : NO("Ese gasto no existe.");
    }
    await db().query(`insert into fin_gastos_fijos (negocio_id, concepto, valor_mensual) values ($1, $2, $3)`, [ctx.negocioId, concepto, valor]);
    return SI;
  });
}

export async function borrarGastoFijo(id: string) {
  return ejecutar(async () => {
    const ctx = await dueno();
    const r = await db().query(`delete from fin_gastos_fijos where id = $1 and negocio_id = $2`, [uuid(id), ctx.negocioId]);
    return r.rowCount ? SI : NO("Ese gasto no existe.");
  });
}

