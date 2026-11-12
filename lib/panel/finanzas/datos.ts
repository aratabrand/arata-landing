import { db } from "../db";
import { fechaBogota } from "../fecha";
import { panelActivo } from "../config";
import { estadoSesion, negociosDe } from "../sesion";
import { TARIFA_DIA_INICIAL, type ClienteRef, type DatosFinanzas, type FinConfig, type FinProyecto, type Gasto, type GastoFijo, type Persona, type RegistroTrabajo, type ReglasReparto, type Servicio } from "./tipos";
import { finanzasDemo } from "./demo";
import type { FinTarea } from "./procesos";

// Lectura de Finanzas y Equipo (solo servidor). Solo el negocio de tipo 'agencia'
// donde la persona en sesión es miembro. Roles (D-118):
//   'dueno' (Sergio)      → todo, incluido el valor del día, el equipo y Mi sitio
//   'finanzas' (Andrés)   → edita Finanzas, proyectos y clientes; no el valor del día ni el equipo
//   'equipo' (Santiago)   → ve todo y marca pasos

export type ContextoAgencia = {
  negocioId: string;
  usuarioId: string;
  rol: string;
  /** Sergio: valor del día, personas del equipo y Mi sitio. */
  esDueno: boolean;
  /** Sergio y Andrés: proyectos, gastos, días trabajados y clientes. */
  editaFinanzas: boolean;
};

/** Agencia a la que tiene acceso la persona en sesión (con doble factor). null = no tiene. */
export async function contextoAgencia(): Promise<ContextoAgencia | null> {
  const s = await estadoSesion();
  if (s.estado !== "completa") return null;
  const agencia = (await negociosDe(s.usuarioId)).find((n) => n.tipo === "agencia");
  if (!agencia) return null;
  return { negocioId: agencia.id, usuarioId: s.usuarioId, rol: agencia.rol, esDueno: agencia.rol === "dueno", editaFinanzas: agencia.rol === "dueno" || agencia.rol === "finanzas" };
}

// Fechas siempre en Bogotá, sin depender de la zona del servidor
const iso = fechaBogota;

/** Negocio de la agencia para el marco del panel (nombre, plan, sitio). */
export async function negocioAgencia(negocioId: string) {
  const r = (await db().query(`select id, nombre, contacto, rubro, ciudad, sitio, instagram, whatsapp, plan from negocios where id = $1`, [negocioId])).rows[0];
  if (!r) return null;
  return {
    id: r.id as string,
    tipo: "agencia" as const,
    nombre: r.nombre as string,
    contacto: r.contacto as string,
    rubro: (r.rubro ?? "") as string,
    ciudad: (r.ciudad ?? "") as string,
    sitio: (r.sitio ?? "") as string,
    instagram: (r.instagram ?? "") as string,
    whatsapp: (r.whatsapp ?? "") as string,
    plan: (r.plan ?? "") as string,
    demo: false,
  };
}

/** Datos de finanzas para mostrar. Modo ejemplo si el panel no está conectado. */
export async function cargarFinanzas(): Promise<DatosFinanzas | null> {
  if (!panelActivo) return finanzasDemo();
  const ctx = await contextoAgencia();
  if (!ctx) return null;
  const q = db();
  const n = ctx.negocioId;

  const [personas, config, proyectos, gastos, horas, fijos, servicios, clientes, tareas] = await Promise.all([
    q.query(`select id, nombre, area, es_socio, usuario_id, activo from equipo_personas where negocio_id = $1 order by orden, creado`, [n]),
    q.query(`select tarifa_dia, reserva_meses, actualizado from fin_config where negocio_id = $1`, [n]),
    q.query(
      `select id, nombre, cliente_id, servicio_id, estado, valor, fecha_cierre, fecha_inicio, fecha_limite, tarifa_dia, reparto_congelado, notas
         from fin_proyectos where negocio_id = $1
        order by (estado = 'cerrado'), fecha_cierre desc nulls last, creado desc`,
      [n]
    ),
    q.query(`select id, proyecto_id, concepto, categoria, valor, fecha from fin_gastos where negocio_id = $1 order by fecha desc, creado desc`, [n]),
    q.query(
      `select h.id, h.proyecto_id, h.persona_id, h.area, h.dias, h.fecha, h.nota
         from fin_horas h join fin_proyectos p on p.id = h.proyecto_id
        where p.negocio_id = $1 order by h.fecha desc, h.creado desc`,
      [n]
    ),
    q.query(`select id, concepto, valor_mensual, activo from fin_gastos_fijos where negocio_id = $1 order by creado`, [n]),
    q.query(`select id, nombre, categoria, activo from servicios where negocio_id = $1 order by orden, nombre`, [n]),
    q.query(`select id, nombre, empresa from clientes where negocio_id = $1 order by lower(coalesce(empresa, nombre)), lower(nombre)`, [n]),
    q.query(
      `select t.id, t.proyecto_id, t.etapa, t.texto, t.hecha, t.orden, t.hecha_en,
              (select e.id from equipo_personas e where e.usuario_id = t.hecha_por and e.negocio_id = p.negocio_id) hecha_por
         from fin_tareas t join fin_proyectos p on p.id = t.proyecto_id
        where p.negocio_id = $1 order by t.orden, t.creado`,
      [n]
    ),
  ]);

  const lista: Persona[] = personas.rows.map((r) => ({
    id: r.id,
    nombre: r.nombre,
    area: r.area,
    esSocio: r.es_socio,
    usuarioId: r.usuario_id,
    activo: r.activo,
  }));
  const c = config.rows[0];
  const cfg: FinConfig = c
    ? { tarifaDia: Number(c.tarifa_dia), reservaMeses: c.reserva_meses, actualizado: c.actualizado?.toISOString?.() ?? null }
    : { tarifaDia: TARIFA_DIA_INICIAL, reservaMeses: 3, actualizado: null };

  return {
    negocioId: n,
    puedeEditar: ctx.editaFinanzas,
    esDueno: ctx.esDueno,
    puedeMarcarPasos: true,
    miPersonaId: lista.find((p) => p.usuarioId === ctx.usuarioId)?.id ?? null,
    demo: false,
    personas: lista,
    config: cfg,
    proyectos: proyectos.rows.map(
      (r): FinProyecto => ({
        id: r.id,
        nombre: r.nombre,
        clienteId: r.cliente_id,
        servicioId: r.servicio_id,
        estado: r.estado,
        valor: Number(r.valor),
        fechaCierre: iso(r.fecha_cierre),
        fechaInicio: iso(r.fecha_inicio),
        fechaLimite: iso(r.fecha_limite),
        tarifaDia: r.tarifa_dia === null ? null : Number(r.tarifa_dia),
        repartoCongelado: (r.reparto_congelado as ReglasReparto | null) ?? null,
        notas: r.notas,
      })
    ),
    gastos: gastos.rows.map(
      (r): Gasto => ({ id: r.id, proyectoId: r.proyecto_id, concepto: r.concepto, categoria: r.categoria, valor: Number(r.valor), fecha: iso(r.fecha)! })
    ),
    trabajo: horas.rows.map(
      (r): RegistroTrabajo => ({
        id: r.id,
        proyectoId: r.proyecto_id,
        personaId: r.persona_id,
        actividad: r.area,
        dias: Number(r.dias),
        fecha: iso(r.fecha)!,
        nota: r.nota,
      })
    ),
    gastosFijos: fijos.rows.map((r): GastoFijo => ({ id: r.id, concepto: r.concepto, valorMensual: Number(r.valor_mensual), activo: r.activo })),
    servicios: servicios.rows.map((r): Servicio => ({ id: r.id, nombre: r.nombre, categoria: r.categoria, activo: r.activo })),
    clientes: clientes.rows.map((r): ClienteRef => ({ id: r.id, nombre: r.nombre, empresa: r.empresa })),
    tareas: tareas.rows.map(
      (r): FinTarea => ({
        id: r.id,
        proyectoId: r.proyecto_id,
        etapa: r.etapa,
        texto: r.texto,
        hecha: r.hecha,
        orden: r.orden,
        hechaPor: r.hecha_por,
        hechaEn: r.hecha_en ? iso(r.hecha_en) : null,
      })
    ),
  };
}
