"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/panel/db";
import { panelActivo } from "@/lib/panel/config";
import { contextoAgencia } from "@/lib/panel/finanzas/datos";
import { estadosCliente, origenesCliente } from "@/lib/panel/clientes/datos";
import { celularValido } from "@/lib/panel/mascaras";
import type { Resultado } from "../finanzas/acciones";
import { diferencias, historialDe, registrar, type EventoHistorial } from "@/lib/panel/historial";

// Acciones de Clientes de Arata San (D-110). Mismas reglas que Finanzas:
// sesión con doble factor, negocio agencia, rol (Sergio y Andrés guardan; solo Sergio borra)
// y filtro por negocio_id. Cada cambio queda en el historial (D-119).

const NO = (error: string): Resultado => ({ ok: false, error });

const limpio = (v: unknown, max: number) => {
  const t = String(v ?? "").trim().replace(/\s+/g, " ");
  if (t.length > max) throw new Error(`Máximo ${max} caracteres.`);
  return t || null;
};
// Para comparar nombres sin importar mayúsculas, tildes ni espacios
const clave = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

export async function guardarCliente(entrada: {
  id?: string;
  nombre: string;
  empresa?: string;
  telefono: string;
  pais?: string;
  ciudadId?: string;
  sitioWeb?: string;
  instagram?: string;
  estado?: string;
  origen?: string;
  origenDetalle?: string;
  notas?: string;
}): Promise<Resultado> {
  try {
    if (!panelActivo) return NO("El panel está en modo ejemplo: los cambios no se guardan.");
    const ctx = await contextoAgencia();
    if (!ctx) return NO("Tu sesión terminó. Vuelve a entrar.");
    if (!ctx.editaFinanzas) return NO("Solo Sergio y Andrés pueden cambiar los clientes.");

    const nombre = limpio(entrada.nombre, 80);
    if (!nombre || nombre.length < 2) return NO("Escribe el nombre del contacto.");
    const empresa = limpio(entrada.empresa, 90);
    const paisPedido = String(entrada.pais || "CO").toUpperCase();
    const telefono = String(entrada.telefono ?? "").replace(/\D/g, "").replace(paisPedido === "CO" ? /^57(?=\d{10}$)/ : /^$/, "");
    if (!celularValido(telefono, paisPedido))
      return NO(paisPedido === "CO" ? "Revisa el celular: 10 números y empieza por 3 (ej. 300 123 4567)." : "Revisa el celular: entre 7 y 15 números, con el indicativo.");
    // País y ciudad: solo de las listas (D-119). La ciudad solo aplica a Colombia.
    const pais = paisPedido;
    const lugar = await db().query(
      `select (select nombre from paises where codigo = $1) pais,
              (select nombre from ciudades where id = $2::uuid and pais = $1) ciudad`,
      [pais, entrada.ciudadId && /^[0-9a-f-]{36}$/i.test(entrada.ciudadId) ? entrada.ciudadId : null]
    );
    if (!lugar.rows[0].pais) return NO("Elige el país de la lista.");
    if (entrada.ciudadId && !lugar.rows[0].ciudad) return NO("Elige la ciudad de la lista.");
    const ciudadId = pais === "CO" && lugar.rows[0].ciudad ? entrada.ciudadId! : null;
    if (pais === "CO" && !ciudadId) return NO("Elige la ciudad.");
    const sitioWeb = limpio(entrada.sitioWeb, 200);
    if (sitioWeb && !/^https:\/\/[^\s]+$/i.test(sitioWeb)) return NO("La página del cliente debe empezar por https://");
    const estado = entrada.estado ?? "nuevo";
    if (!(estadosCliente as readonly string[]).includes(estado)) return NO("Estado no válido.");
    const origen = entrada.origen || null;
    if (origen && !(origenesCliente as readonly string[]).includes(origen)) return NO("Elige de dónde llegó.");
    const id = entrada.id && /^[0-9a-f-]{36}$/i.test(entrada.id) ? entrada.id : null;

    // Sin duplicados: mismo celular, o misma empresa + contacto escritos distinto
    const otros = await db().query(
      `select c.id, c.nombre, c.empresa, c.telefono, c.estado, c.origen, c.origen_detalle, c.sitio_web, c.instagram, c.notas,
              pa.nombre pais, ci.nombre ciudad
         from clientes c join paises pa on pa.codigo = c.pais left join ciudades ci on ci.id = c.ciudad_id
        where c.negocio_id = $1`,
      [ctx.negocioId]
    );
    const previo = id ? otros.rows.find((o) => o.id === id) : null;
    otros.rows = otros.rows.filter((o) => o.id !== id);
    const dup = otros.rows.find((o) => o.telefono === telefono || (clave(o.nombre) === clave(nombre) && clave(o.empresa ?? "") === clave(empresa ?? "")));
    if (dup) return NO(`Ya existe: ${dup.empresa ? `${dup.empresa} · ` : ""}${dup.nombre}. Búscalo en la lista.`);

    const instagram = limpio(entrada.instagram, 60)?.replace(/^@?/, "@") ?? null;
    if (instagram && !/^@[A-Za-z0-9._]{1,30}$/.test(instagram)) return NO("Revisa el Instagram: letras, números, punto o guion bajo.");
    const vals = [nombre, empresa, telefono, pais, ciudadId, sitioWeb, instagram, estado, origen, limpio(entrada.origenDetalle, 200), limpio(entrada.notas, 2000)];
    let nuevoId: string | undefined;
    const nombreVisible = `${empresa ? `${empresa} · ` : ""}${nombre}`;
    if (id) {
      const r = await db().query(
        `update clientes set nombre = $3, empresa = $4, telefono = $5, pais = $6, ciudad_id = $7, sitio_web = $8, instagram = $9,
           estado = $10, origen = $11, origen_detalle = $12, notas = $13 where id = $1 and negocio_id = $2`,
        [id, ctx.negocioId, ...vals]
      );
      if (!r.rowCount) return NO("Ese cliente no existe.");
      const cambios = diferencias(
        previo ?? {},
        { nombre, empresa, telefono, pais: lugar.rows[0].pais, ciudad: lugar.rows[0].ciudad, sitio_web: sitioWeb, instagram, estado, origen, origen_detalle: limpio(entrada.origenDetalle, 200), notas: limpio(entrada.notas, 2000) },
        { nombre: "Persona de contacto", empresa: "Negocio", telefono: "Celular", pais: "País", ciudad: "Ciudad", sitio_web: "Página web", instagram: "Instagram", estado: "Estado", origen: "De dónde llegó", origen_detalle: "Detalle", notas: "Notas" }
      );
      if (cambios.length) await registrar(ctx, { accion: "editar", entidad: "cliente", entidadId: id, clienteId: id, titulo: `Editó el cliente ${nombreVisible}`, cambios });
    } else {
      const r = await db().query(
        `insert into clientes (negocio_id, nombre, empresa, telefono, pais, ciudad_id, sitio_web, instagram, estado, origen, origen_detalle, notas)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) returning id`,
        [ctx.negocioId, ...vals]
      );
      nuevoId = r.rows[0].id;
      await registrar(ctx, { accion: "crear", entidad: "cliente", entidadId: nuevoId, clienteId: nuevoId, titulo: `Agregó el cliente ${nombreVisible}`, cambios: origen ? [{ campo: "De dónde llegó", antes: "", despues: origen }] : [] });
    }
    revalidatePath("/panel/clientes");
    revalidatePath("/panel/finanzas", "layout");
    revalidatePath("/panel/notificaciones");
    return { ok: true, id: nuevoId };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    return NO(/violates|constraint/i.test(msg) ? "No se pudo guardar. Revisa los datos." : msg || "No se pudo guardar.");
  }
}

export async function borrarCliente(id: string): Promise<Resultado> {
  try {
    if (!panelActivo) return NO("El panel está en modo ejemplo.");
    const ctx = await contextoAgencia();
    if (!ctx?.esDueno) return NO("Solo Sergio puede borrar clientes.");
    const usados = await db().query(`select count(*)::int n from fin_proyectos where cliente_id = $1 and negocio_id = $2`, [id, ctx.negocioId]);
    if (usados.rows[0].n) return NO("Este cliente tiene proyectos: no se puede borrar. Márcalo como inactivo.");
    const r = await db().query(`delete from clientes where id = $1 and negocio_id = $2 returning nombre, empresa`, [id, ctx.negocioId]);
    if (!r.rowCount) return NO("Ese cliente no existe.");
    const c = r.rows[0];
    await registrar(ctx, { accion: "borrar", entidad: "cliente", entidadId: id, clienteId: id, titulo: `Borró el cliente ${c.empresa ? `${c.empresa} · ` : ""}${c.nombre}`, importante: true });
    revalidatePath("/panel/notificaciones");
    revalidatePath("/panel/clientes");
    revalidatePath("/panel/finanzas", "layout");
    return { ok: true };
  } catch {
    return NO("No se pudo borrar.");
  }
}

/** Agrega una ciudad de Colombia que falte en la lista (Sergio y Andrés). Sin repetidos. */
export async function agregarCiudad(entrada: { nombre: string; departamento: string }): Promise<Resultado> {
  try {
    if (!panelActivo) return NO("El panel está en modo ejemplo.");
    const ctx = await contextoAgencia();
    if (!ctx?.editaFinanzas) return NO("Solo Sergio y Andrés pueden agregar ciudades.");
    const nombre = limpio(entrada.nombre, 60);
    const departamento = limpio(entrada.departamento, 60);
    if (!nombre || nombre.length < 2) return NO("Escribe el nombre de la ciudad.");
    if (!departamento || departamento.length < 2) return NO("Escribe el departamento.");
    if (!/^[\p{L} .'-]+$/u.test(nombre) || !/^[\p{L} .,'-]+$/u.test(departamento)) return NO("Usa solo letras en la ciudad y el departamento.");
    const ya = await db().query(`select id, nombre, departamento from ciudades where pais = 'CO'`);
    const igual = ya.rows.find((c) => clave(c.nombre) === clave(nombre) && clave(c.departamento ?? "") === clave(departamento));
    if (igual) return { ok: true, id: igual.id };
    const r = await db().query(`insert into ciudades (pais, nombre, departamento) values ('CO', $1, $2) returning id`, [nombre, departamento]);
    await registrar(ctx, { accion: "crear", entidad: "ciudad", entidadId: r.rows[0].id, titulo: `Agregó la ciudad ${nombre} (${departamento})` });
    revalidatePath("/panel/clientes");
    return { ok: true, id: r.rows[0].id };
  } catch {
    return NO("No se pudo agregar la ciudad.");
  }
}

/** Historial de un cliente (para su ficha). */
export async function verHistorialCliente(id: string): Promise<EventoHistorial[]> {
  if (!panelActivo || !/^[0-9a-f-]{36}$/i.test(id)) return [];
  const ctx = await contextoAgencia();
  if (!ctx) return [];
  return historialDe(ctx.negocioId, { clienteId: id, limite: 50 });
}
