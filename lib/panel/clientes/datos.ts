import { db } from "../db";
import { fechaBogota } from "../fecha";
import { panelActivo } from "../config";
import { contextoAgencia } from "../finanzas/datos";

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

export type DatosClientes = { puedeEditar: boolean; puedeBorrar: boolean; clientes: ClienteAgencia[]; paises: Pais[]; ciudades: Ciudad[] };

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
  const [cl, pr, lugares] = await Promise.all([
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
  ]);
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
