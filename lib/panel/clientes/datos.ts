import { db } from "../db";
import { panelActivo } from "../config";
import { contextoAgencia } from "../finanzas/datos";

// Clientes de Arata San (solo servidor, D-109): datos de cada cliente, de dónde
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
  nombre: string; // contacto
  empresa: string | null;
  telefono: string;
  correo: string | null;
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

export type DatosClientes = { puedeEditar: boolean; clientes: ClienteAgencia[] };

const iso = (d: Date | string | null) => (d ? (typeof d === "string" ? d.slice(0, 10) : d.toISOString().slice(0, 10)) : null);

/** null = no hay acceso real (modo ejemplo o no es la agencia): el módulo usa el ejemplo. */
export async function cargarClientesAgencia(): Promise<DatosClientes | null> {
  if (!panelActivo) return null;
  const ctx = await contextoAgencia();
  if (!ctx) return null;
  const [cl, pr] = await Promise.all([
    db().query(
      `select id, nombre, empresa, telefono, correo, ciudad, sitio_web, instagram, estado, origen, origen_detalle, notas, creado
         from clientes where negocio_id = $1 order by lower(coalesce(empresa, nombre)), lower(nombre)`,
      [ctx.negocioId]
    ),
    db().query(
      `select p.id, p.cliente_id, p.nombre, s.nombre servicio, p.estado, p.valor, p.fecha_cierre, p.creado
         from fin_proyectos p left join servicios s on s.id = p.servicio_id
        where p.negocio_id = $1 and p.cliente_id is not null
        order by p.creado desc`,
      [ctx.negocioId]
    ),
  ]);
  const porCliente = new Map<string, ProyectoDeCliente[]>();
  pr.rows.forEach((r) => {
    const l = porCliente.get(r.cliente_id) ?? [];
    l.push({ id: r.id, nombre: r.nombre, servicio: r.servicio, estado: r.estado, valor: Number(r.valor), fechaCierre: iso(r.fecha_cierre), creado: iso(r.creado)! });
    porCliente.set(r.cliente_id, l);
  });
  return {
    puedeEditar: ctx.puedeEditar,
    clientes: cl.rows.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      empresa: r.empresa,
      telefono: r.telefono,
      correo: r.correo,
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
