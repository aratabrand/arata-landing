import { db } from "../db";
import { fechaBogota } from "../fecha";
import { panelActivo } from "../config";
import { contextoAgencia } from "../finanzas/datos";
import type { Interesado } from "./interesados";
import type { Prospecto } from "./prospectos";
import { scavioActivo } from "./scavio";

/** Una página buscada en Google Maps desde el panel (D-179). */
export type BusquedaProspectos = {
  id: string;
  quien: string;
  nicho: string;
  zona: string;
  enfoque: "ya_vende" | "sin_pagina";
  pagina: number;
  estado: "corriendo" | "lista" | "fallo";
  creditos: number;
  encontrados: number;
  nuevos: number;
  repetidos: number;
  descartados: number;
  altas: number;
  /** Descartados por los filtros (no por estar fuera del nicho): se pueden guardar sin gastar. */
  recuperables: number;
  error: string | null;
  creado: string;
};

// Clientes de Arata San (solo servidor, D-110): datos de cada cliente, de dónde
// vino y sus proyectos (servicio, estado, valor) desde Finanzas.

export const origenesCliente = ["Instagram", "Google", "WhatsApp", "Referido", "Página", "Publicidad", "Evento", "Otro"] as const;
export type OrigenClienteAgencia = (typeof origenesCliente)[number];
export const estadosCliente = ["nuevo", "activo", "recurrente", "inactivo"] as const;

export type ProyectoDeCliente = {
  id: string;
  nombre: string;
  servicio: string | null;
  estado: "propuesta" | "en-curso" | "cerrado";
  valor: number;
  fechaCierre: string | null;
  creado: string;
};

export type ClienteAgencia = {
  id: string;
  /** Nombre de la persona de contacto. */
  nombre: string;
  empresa: string | null;
  /** Celular (WhatsApp), solo números. Es el único dato de contacto (D-119). */
  telefono: string;
  /** Código ISO del país (CO, US…). */
  pais: string;
  paisNombre: string;
  ciudadId: string | null;
  ciudad: string | null;
  sitioWeb: string | null;
  instagram: string | null;
  estado: (typeof estadosCliente)[number];
  origen: OrigenClienteAgencia | null;
  origenDetalle: string | null;
  notas: string | null;
  creado: string;
  proyectos: ProyectoDeCliente[];
};

export type Pais = { codigo: string; nombre: string };
export type Ciudad = { id: string; pais: string; nombre: string; departamento: string | null };

export type DatosClientes = {
  puedeEditar: boolean;
  puedeBorrar: boolean;
  clientes: ClienteAgencia[];
  paises: Pais[];
  ciudades: Ciudad[];
  /** Personas que agendaron reunión por Cal.com (D-133). */
  interesados: Interesado[];
  /** Negocios que encontró Sellbird y todavía no agendan (D-173). */
  prospectos: Prospecto[];
  /** Búsquedas de «Buscar más prospectos» (D-179), las más recientes primero. */
  busquedas: BusquedaProspectos[];
  /** Hay clave de Scavio en el servidor: se puede buscar. */
  scavio: boolean;
  /** Hora del servidor (ISO): la pantalla parte de aquí para no desfasarse al hidratar. */
  ahora: string;
  /** Nombre de quien está en sesión (firma el mensaje de seguimiento por WhatsApp, D-144). */
  yo: string;
};

/** País con lista de ciudades (D-119): en los demás la ciudad queda bloqueada. */
export const PAIS_CON_CIUDADES = "CO";

/** Países y ciudades para las listas (Colombia primero). */
export async function cargarLugares(): Promise<{ paises: Pais[]; ciudades: Ciudad[] }> {
  const [p, c] = await Promise.all([
    db().query(`select codigo, nombre from paises order by (codigo = 'CO') desc, nombre`),
    db().query(`select id, pais, nombre, departamento from ciudades order by nombre`),
  ]);
  return {
    paises: p.rows.map((x) => ({ codigo: x.codigo, nombre: x.nombre })),
    ciudades: c.rows.map((x) => ({ id: x.id, pais: x.pais, nombre: x.nombre, departamento: x.departamento })),
  };
}

// Fechas siempre en Bogotá, sin depender de la zona del servidor
const iso = fechaBogota;

/** null = no hay acceso real (modo ejemplo o no es la agencia): el módulo usa el ejemplo. */
export async function cargarClientesAgencia(): Promise<DatosClientes | null> {
  if (!panelActivo) return null;
  const ctx = await contextoAgencia();
  if (!ctx) return null;
  const [cl, pr, lugares, it, notas, yo, ps, bs] = await Promise.all([
    db().query(
      `select c.id, c.nombre, c.empresa, c.telefono, c.pais, pa.nombre pais_nombre, c.ciudad_id, ci.nombre ciudad,
              c.sitio_web, c.instagram, c.estado, c.origen, c.origen_detalle, c.notas, c.creado
         from clientes c join paises pa on pa.codigo = c.pais left join ciudades ci on ci.id = c.ciudad_id
        where c.negocio_id = $1 order by lower(coalesce(c.empresa, c.nombre)), lower(c.nombre)`,
      [ctx.negocioId]
    ),
    db().query(
      `select p.id, p.cliente_id, p.nombre, s.nombre servicio, p.estado, p.valor, p.fecha_cierre, p.creado
         from fin_proyectos p left join servicios s on s.id = p.servicio_id
        where p.negocio_id = $1 and p.cliente_id is not null
        order by p.creado desc`,
      [ctx.negocioId]
    ),
    cargarLugares(),
    db().query(
      `select id, nombre, correo, whatsapp, necesita, tipo, pagina_web, cuando, inversion, reunion_inicio, reunion_fin,
              enlace_llamada, enlace_reserva, estado, por_aceptar, to_char(espera_hasta, 'YYYY-MM-DD') espera_hasta, cliente_id, creado, cerrado_en
         from interesados where negocio_id = $1 order by reunion_inicio desc limit 300`,
      [ctx.negocioId]
    ),
    db().query(`select interesado_id, texto, quien, creado from interesado_notas where negocio_id = $1 order by creado desc limit 2000`, [ctx.negocioId]),
    db().query(`select name from "user" where id = $1`, [ctx.usuarioId]),
    db().query(
      `select id, nombre, rubro, categoria, servicio, pagina, sitio_web, telefono, tipo_telefono, ciudad, enlace_maps, resenas,
              calificacion, titular, enfoque, prioridad, puntos, estado, notas, interesado_id, creado
         from prospectos where negocio_id = $1
        order by puntos desc, resenas desc, lower(nombre) limit 3000`,
      [ctx.negocioId]
    ),
    db().query(
      `select id, quien, nicho, zona, enfoque, pagina, estado, creditos, encontrados, nuevos, repetidos, descartados, altas, error, creado,
              (select count(*) from jsonb_array_elements(resultados) x where x->>'motivo' <> 'fuera_del_nicho') recuperables
         from prospecto_busquedas where negocio_id = $1 order by creado desc limit 200`,
      [ctx.negocioId]
    ),
  ]);
  const notasDe = new Map<string, Interesado["notas"]>();
  notas.rows.forEach((r) => {
    const l = notasDe.get(r.interesado_id) ?? [];
    l.push({ texto: r.texto, quien: r.quien, creado: r.creado.toISOString() });
    notasDe.set(r.interesado_id, l);
  });
  const porCliente = new Map<string, ProyectoDeCliente[]>();
  pr.rows.forEach((r) => {
    const l = porCliente.get(r.cliente_id) ?? [];
    l.push({ id: r.id, nombre: r.nombre, servicio: r.servicio, estado: r.estado, valor: Number(r.valor), fechaCierre: iso(r.fecha_cierre), creado: iso(r.creado)! });
    porCliente.set(r.cliente_id, l);
  });
  return {
    puedeEditar: ctx.editaFinanzas,
    puedeBorrar: ctx.esDueno,
    ...lugares,
    ahora: new Date().toISOString(),
    yo: String(yo.rows[0]?.name ?? ""),
    scavio: scavioActivo(),
    busquedas: bs.rows.map(
      (r): BusquedaProspectos => ({
        id: r.id,
        quien: r.quien,
        nicho: r.nicho,
        zona: r.zona,
        enfoque: r.enfoque,
        pagina: Number(r.pagina),
        estado: r.estado,
        creditos: Number(r.creditos),
        encontrados: Number(r.encontrados),
        nuevos: Number(r.nuevos),
        repetidos: Number(r.repetidos),
        descartados: Number(r.descartados),
        altas: Number(r.altas),
        recuperables: Number(r.recuperables),
        error: r.error,
        creado: r.creado.toISOString(),
      })
    ),
    prospectos: ps.rows.map(
      (r): Prospecto => ({
        id: r.id,
        nombre: r.nombre,
        rubro: r.rubro,
        categoria: r.categoria,
        servicio: r.servicio,
        pagina: r.pagina,
        sitioWeb: r.sitio_web,
        telefono: r.telefono,
        tipoTelefono: r.tipo_telefono,
        ciudad: r.ciudad,
        enlaceMaps: r.enlace_maps,
        resenas: Number(r.resenas),
        calificacion: r.calificacion === null ? null : Number(r.calificacion),
        titular: r.titular,
        enfoque: r.enfoque,
        prioridad: r.prioridad,
        puntos: Number(r.puntos),
        estado: r.estado,
        notas: r.notas,
        interesadoId: r.interesado_id,
        creado: r.creado.toISOString(),
      })
    ),
    interesados: it.rows.map(
      (r): Interesado => ({
        id: r.id,
        nombre: r.nombre,
        correo: r.correo,
        whatsapp: r.whatsapp,
        necesita: r.necesita,
        tipo: r.tipo,
        paginaWeb: r.pagina_web,
        cuando: r.cuando,
        inversion: r.inversion,
        inicio: r.reunion_inicio.toISOString(),
        fin: r.reunion_fin ? r.reunion_fin.toISOString() : null,
        enlaceLlamada: r.enlace_llamada,
        enlaceReserva: r.enlace_reserva,
        estado: r.estado,
        porAceptar: Boolean(r.por_aceptar),
        esperaHasta: r.espera_hasta ?? null,
        notas: notasDe.get(r.id) ?? [],
        clienteId: r.cliente_id,
        creado: r.creado.toISOString(),
        cerradoEn: r.cerrado_en ? r.cerrado_en.toISOString() : null,
      })
    ),
    clientes: cl.rows.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      empresa: r.empresa,
      telefono: r.telefono,
      pais: r.pais,
      paisNombre: r.pais_nombre,
      ciudadId: r.ciudad_id,
      ciudad: r.ciudad,
      sitioWeb: r.sitio_web,
      instagram: r.instagram,
      estado: r.estado,
      origen: r.origen,
      origenDetalle: r.origen_detalle,
      notas: r.notas,
      creado: iso(r.creado)!,
      proyectos: porCliente.get(r.id) ?? [],
    })),
  };
}
