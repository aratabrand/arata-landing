"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/panel/db";
import { panelActivo } from "@/lib/panel/config";
import { contextoAgencia } from "@/lib/panel/finanzas/datos";
import { estadosCliente, origenesCliente } from "@/lib/panel/clientes/datos";
import { celularValido } from "@/lib/panel/mascaras";
import { fechaNota, plazoValido } from "@/lib/panel/clientes/interesados";
import { ESTADOS_PROSPECTO, PRIORIDADES, TITULARES, puntuar, type EstadoProspecto, type Titular } from "@/lib/panel/clientes/prospectos";
import type { Resultado } from "../finanzas/acciones";
import { diferencias, historialDe, registrar, type EventoHistorial } from "@/lib/panel/historial";

// Acciones de Clientes de Arata San (D-110). Mismas reglas que Finanzas:
// sesión con doble factor, negocio agencia, rol (Sergio y Andrés guardan; solo Sergio borra)
// y filtro por negocio_id. Cada cambio queda en el historial (D-119).

const NO = (error: string): Resultado => ({ ok: false, error });
const SI: Resultado = { ok: true };

const limpio = (v: unknown, max: number) => {
  const t = String(v ?? "").trim().replace(/\s+/g, " ");
  if (t.length > max) throw new Error(`Máximo ${max} caracteres.`);
  return t || null;
};
// Para comparar nombres sin importar mayúsculas, tildes ni espacios
const clave = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

export type EntradaCliente = {
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
};

export async function guardarCliente(entrada: EntradaCliente): Promise<Resultado> {
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


// ── Interesados que agendaron por Cal.com (D-133) ───────────────────
// Sergio y Andrés confirman, descartan o reabren; solo Sergio borra. Todos los miembros los ven.

async function ctxInteresados(borrar = false) {
  if (!panelActivo) throw new Error("El panel está en modo ejemplo.");
  const ctx = await contextoAgencia();
  if (!ctx) throw new Error("Tu sesión terminó. Vuelve a entrar.");
  if (borrar ? !ctx.esDueno : !ctx.editaFinanzas) throw new Error(borrar ? "Solo Sergio puede borrar interesados." : "Solo Sergio y Andrés pueden confirmar, poner en espera o descartar interesados.");
  return ctx;
}

async function interesadoDe(negocioId: string, id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Interesado no válido.");
  const r = (await db().query(`select id, nombre, estado, cliente_id, reunion_inicio from interesados where id = $1 and negocio_id = $2`, [id, negocioId])).rows[0];
  if (!r) throw new Error("Ese interesado no existe.");
  return r as { id: string; nombre: string; estado: string; cliente_id: string | null; reunion_inicio: Date };
}

/**
 * La reunión salió bien: se crea el cliente con los datos revisados y el interesado queda como cliente.
 * Si ya había un cliente con ese celular (alguien que vuelve), no se duplica: se vincula al que ya existe.
 */
export async function confirmarInteresado(entrada: { interesadoId: string; cliente: EntradaCliente }): Promise<Resultado> {
  try {
    const ctx = await ctxInteresados();
    const i = await interesadoDe(ctx.negocioId, entrada.interesadoId);
    if (i.estado === "confirmada") return NO("Este interesado ya está confirmado.");
    if (i.estado === "cancelada") return NO("Canceló su reunión en Cal.com. Si agenda otra vez, aparece como un interesado nuevo.");
    if (i.estado === "rechazada") return NO("Esta reunión se rechazó en Cal.com.");

    // ¿Ya es cliente? Mismo celular, escrito como lo guarda guardarCliente
    const pais = String(entrada.cliente.pais || "CO").toUpperCase();
    const tel = String(entrada.cliente.telefono ?? "").replace(/\D/g, "").replace(pais === "CO" ? /^57(?=\d{10}$)/ : /^$/, "");
    const existente = tel
      ? (await db().query(`select id, nombre, empresa from clientes where negocio_id = $1 and telefono = $2`, [ctx.negocioId, tel])).rows[0]
      : null;

    let clienteId: string;
    if (existente) {
      clienteId = existente.id;
    } else {
      const r = await guardarCliente({ ...entrada.cliente, id: undefined });
      if (!r.ok) return r;
      clienteId = r.id!;
    }
    await db().query(`update interesados set estado = 'confirmada', espera_hasta = null, cliente_id = $2, cerrado_por = $3, cerrado_en = now(), actualizado = now() where id = $1`, [i.id, clienteId, ctx.usuarioId]);
    await registrar(ctx, {
      accion: "crear",
      entidad: "interesado",
      entidadId: i.id,
      clienteId,
      titulo: existente
        ? `Confirmó la reunión con ${i.nombre} y lo vinculó al cliente ${existente.empresa ? `${existente.empresa} · ` : ""}${existente.nombre}`
        : `Confirmó la reunión con ${i.nombre} y lo pasó a clientes`,
      importante: true,
    });
    revalidatePath("/panel/clientes");
    revalidatePath("/panel/finanzas", "layout");
    revalidatePath("/panel/notificaciones");
    return { ok: true, id: clienteId };
  } catch (e) {
    return NO(e instanceof Error ? e.message : "No se pudo confirmar.");
  }
}

/* ── En espera (D-144) ─────────────────────────────────────────────────── */

async function nuevaNota(ctx: { negocioId: string; usuarioId: string }, interesadoId: string, texto: string) {
  const quien = String((await db().query(`select name from "user" where id = $1`, [ctx.usuarioId])).rows[0]?.name ?? "Alguien").slice(0, 80);
  await db().query(`insert into interesado_notas (interesado_id, negocio_id, texto, usuario_id, quien) values ($1, $2, $3, $4, $5)`, [interesadoId, ctx.negocioId, texto, ctx.usuarioId, quien]);
}

const notaLimpia = (v: unknown) => {
  const t = limpio(String(v ?? "").replace(/[\u0000-\u001F\u007F<>]/g, " "), 500);
  if (!t) throw new Error("Escribe la nota: qué quedó con la persona.");
  return t;
};

/**
 * La reunión salió pero la persona quedó en confirmar: se pone en espera con una nota y el tiempo que
 * pidió (1 día a 1 semana). El aviso de las 8 a. m. recuerda escribirle un día antes y el día del plazo.
 * También sirve para cambiar el plazo de uno que ya está en espera.
 */
export async function ponerEnEspera(entrada: { interesadoId: string; nota: string; dias: number }): Promise<Resultado> {
  try {
    const ctx = await ctxInteresados();
    const i = await interesadoDe(ctx.negocioId, entrada.interesadoId);
    if (i.estado !== "agendada" && i.estado !== "espera") return NO("Solo se puede poner en espera una reunión pendiente.");
    const dias = Number(entrada.dias);
    if (!plazoValido(dias)) return NO("Elige cuánto tiempo pidió que esperáramos (máximo una semana).");
    const nota = notaLimpia(entrada.nota);
    const r = await db().query(
      `update interesados set estado = 'espera', por_aceptar = false, espera_hasta = current_date + $2::int, actualizado = now()
        where id = $1 returning to_char(espera_hasta, 'YYYY-MM-DD') hasta`,
      [i.id, dias]
    );
    await nuevaNota(ctx, i.id, nota);
    const hasta = String(r.rows[0].hasta);
    await registrar(ctx, {
      accion: "editar",
      entidad: "interesado",
      entidadId: i.id,
      titulo: `Puso en espera a ${i.nombre} hasta el ${fechaNota(hasta)}`,
      cambios: [{ campo: "Nota", antes: "", despues: nota }],
    });
    revalidatePath("/panel/clientes");
    revalidatePath("/panel/notificaciones");
    return SI;
  } catch (e) {
    return NO(e instanceof Error ? e.message : "No se pudo poner en espera.");
  }
}

/** Agrega una nota al seguimiento (en espera o pendiente). Las notas no se editan: se agregan. */
export async function agregarNotaInteresado(entrada: { interesadoId: string; nota: string }): Promise<Resultado> {
  try {
    const ctx = await ctxInteresados();
    const i = await interesadoDe(ctx.negocioId, entrada.interesadoId);
    if (i.estado !== "agendada" && i.estado !== "espera") return NO("Solo se agregan notas a reuniones pendientes o en espera.");
    const nota = notaLimpia(entrada.nota);
    await nuevaNota(ctx, i.id, nota);
    await db().query(`update interesados set actualizado = now() where id = $1`, [i.id]);
    await registrar(ctx, { accion: "editar", entidad: "interesado", entidadId: i.id, titulo: `Agregó una nota a ${i.nombre}`, cambios: [{ campo: "Nota", antes: "", despues: nota }] });
    revalidatePath("/panel/clientes");
    return SI;
  } catch (e) {
    return NO(e instanceof Error ? e.message : "No se pudo guardar la nota.");
  }
}

/** La reunión no avanzó (o era spam): queda en "Cerradas", sin crear cliente. */
export async function descartarInteresado(id: string): Promise<Resultado> {
  try {
    const ctx = await ctxInteresados();
    const i = await interesadoDe(ctx.negocioId, id);
    if (i.estado !== "agendada" && i.estado !== "espera") return NO("Solo se puede descartar una reunión pendiente o en espera.");
    await db().query(`update interesados set estado = 'descartada', espera_hasta = null, cerrado_por = $2, cerrado_en = now(), actualizado = now() where id = $1`, [i.id, ctx.usuarioId]);
    await registrar(ctx, { accion: "editar", entidad: "interesado", entidadId: i.id, titulo: `Marcó que la reunión con ${i.nombre} no avanzó` });
    revalidatePath("/panel/clientes");
    revalidatePath("/panel/notificaciones");
    return SI;
  } catch (e) {
    return NO(e instanceof Error ? e.message : "No se pudo descartar.");
  }
}

/** Deshace un "No avanzó" por error. */
export async function reabrirInteresado(id: string): Promise<Resultado> {
  try {
    const ctx = await ctxInteresados();
    const i = await interesadoDe(ctx.negocioId, id);
    if (i.estado !== "descartada") return NO("Solo se puede reabrir uno que no avanzó.");
    await db().query(`update interesados set estado = 'agendada', cerrado_por = null, cerrado_en = null, actualizado = now() where id = $1`, [i.id]);
    await registrar(ctx, { accion: "editar", entidad: "interesado", entidadId: i.id, titulo: `Volvió a dejar pendiente a ${i.nombre}` });
    revalidatePath("/panel/clientes");
    revalidatePath("/panel/notificaciones");
    return SI;
  } catch (e) {
    return NO(e instanceof Error ? e.message : "No se pudo reabrir.");
  }
}

/** Quita un interesado (una prueba o spam). Solo Sergio. El cliente que se haya creado desde él no se toca. */
export async function borrarInteresado(id: string): Promise<Resultado> {
  try {
    const ctx = await ctxInteresados(true);
    const i = await interesadoDe(ctx.negocioId, id);
    await db().query(`delete from interesados where id = $1`, [i.id]);
    await registrar(ctx, { accion: "borrar", entidad: "interesado", entidadId: i.id, titulo: `Borró al interesado ${i.nombre}`, importante: true });
    revalidatePath("/panel/clientes");
    revalidatePath("/panel/notificaciones");
    return SI;
  } catch (e) {
    return NO(e instanceof Error ? e.message : "No se pudo borrar.");
  }
}


// ── Prospectos que encontró Sellbird (D-173) ────────────────────────
// Todos los miembros los ven; Sergio y Andrés cambian estado, titular y notas; solo Sergio borra.

/** Cambia el estado, el titular (tras revisarlo en el RUES) o las notas. Si cambia el titular, se recalcula la prioridad. */
export async function guardarProspecto(entrada: { id: string; estado: string; titular: string; notas: string }): Promise<Resultado> {
  try {
    if (!panelActivo) return NO("El panel está en modo ejemplo: los cambios no se guardan.");
    const ctx = await contextoAgencia();
    if (!ctx) return NO("Tu sesión terminó. Vuelve a entrar.");
    if (!ctx.editaFinanzas) return NO("Solo Sergio y Andrés pueden cambiar los prospectos.");
    if (!/^[0-9a-f-]{36}$/i.test(entrada.id)) return NO("Prospecto no válido.");
    if (!(entrada.estado in ESTADOS_PROSPECTO)) return NO("Elige un estado de la lista.");
    if (!(entrada.titular in TITULARES)) return NO("Elige si es empresa o persona natural.");
    const notas = limpio(entrada.notas, 2000);
    const p = (
      await db().query(`select id, nombre, estado, titular, notas, pagina, resenas, calificacion, prioridad, enfoque, tipo_telefono from prospectos where id = $1 and negocio_id = $2`, [entrada.id, ctx.negocioId])
    ).rows[0];
    if (!p) return NO("Ese prospecto no existe.");
    // «No contactar» es para siempre (Ley 1581): solo Sergio lo puede quitar
    if (p.estado === "no_contactar" && entrada.estado !== "no_contactar" && !ctx.esDueno) return NO("Pidió que no le escribamos: solo Sergio puede cambiar ese estado.");
    const estado = entrada.estado as EstadoProspecto;
    const titular = entrada.titular as Titular;
    const { puntos, prioridad } = puntuar({
      pagina: p.pagina,
      resenas: Number(p.resenas),
      calificacion: p.calificacion === null ? null : Number(p.calificacion),
      titular,
      enfoque: p.enfoque,
      tipoTelefono: p.tipo_telefono,
    });
    await db().query(
      `update prospectos set estado = $3, titular = $4, notas = $5, puntos = $6, prioridad = $7, actualizado = now(),
              contactado_en = case when $3 <> 'nuevo' and contactado_en is null then now() else contactado_en end
        where id = $1 and negocio_id = $2`,
      [p.id, ctx.negocioId, estado, titular, notas, puntos, prioridad]
    );
    const cambios = diferencias(
      { estado: ESTADOS_PROSPECTO[p.estado as EstadoProspecto], titular: TITULARES[p.titular as Titular], prioridad: PRIORIDADES[p.prioridad as keyof typeof PRIORIDADES], notas: p.notas },
      { estado: ESTADOS_PROSPECTO[estado], titular: TITULARES[titular], prioridad: PRIORIDADES[prioridad], notas },
      { estado: "Estado", titular: "Titular", prioridad: "Prioridad", notas: "Notas" }
    );
    if (cambios.length) await registrar(ctx, { accion: "editar", entidad: "prospecto", entidadId: p.id, titulo: `Actualizó el prospecto ${p.nombre}`, cambios });
    revalidatePath("/panel/clientes");
    return SI;
  } catch (e) {
    return NO(e instanceof Error ? e.message : "No se pudo guardar el prospecto.");
  }
}

/** Quita un prospecto que no aplica (cerró, está repetido, no es del rubro). Solo Sergio. */
export async function borrarProspecto(id: string): Promise<Resultado> {
  try {
    if (!panelActivo) return NO("El panel está en modo ejemplo.");
    const ctx = await contextoAgencia();
    if (!ctx) return NO("Tu sesión terminó. Vuelve a entrar.");
    if (!ctx.esDueno) return NO("Solo Sergio puede borrar prospectos.");
    if (!/^[0-9a-f-]{36}$/i.test(id)) return NO("Prospecto no válido.");
    const r = await db().query(`delete from prospectos where id = $1 and negocio_id = $2 returning nombre`, [id, ctx.negocioId]);
    if (!r.rowCount) return NO("Ese prospecto no existe.");
    await registrar(ctx, { accion: "borrar", entidad: "prospecto", entidadId: id, titulo: `Borró el prospecto ${r.rows[0].nombre}` });
    revalidatePath("/panel/clientes");
    return SI;
  } catch (e) {
    return NO(e instanceof Error ? e.message : "No se pudo borrar.");
  }
}

/** Tocó «Escribirle por WhatsApp» (D-174): un prospecto nuevo pasa a «Contactado». Si ya iba más adelante, no cambia. */
export async function marcarContactado(id: string): Promise<Resultado> {
  try {
    if (!panelActivo) return NO("El panel está en modo ejemplo.");
    const ctx = await contextoAgencia();
    if (!ctx) return NO("Tu sesión terminó. Vuelve a entrar.");
    if (!ctx.editaFinanzas) return NO("Solo Sergio y Andrés pueden cambiar los prospectos.");
    if (!/^[0-9a-f-]{36}$/i.test(id)) return NO("Prospecto no válido.");
    const r = await db().query(
      `update prospectos set estado = 'contactado', contactado_en = coalesce(contactado_en, now()), actualizado = now()
        where id = $1 and negocio_id = $2 and estado = 'nuevo' returning nombre`,
      [id, ctx.negocioId]
    );
    if (r.rowCount) {
      await registrar(ctx, { accion: "editar", entidad: "prospecto", entidadId: id, titulo: `Le escribió por WhatsApp a ${r.rows[0].nombre}`, cambios: [{ campo: "Estado", antes: "Nuevo", despues: "Contactado" }] });
      revalidatePath("/panel/clientes");
    }
    return SI;
  } catch (e) {
    return NO(e instanceof Error ? e.message : "No se pudo marcar.");
  }
}
