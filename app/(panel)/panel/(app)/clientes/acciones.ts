"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/panel/db";
import { panelActivo } from "@/lib/panel/config";
import { contextoAgencia } from "@/lib/panel/finanzas/datos";
import { estadosCliente, origenesCliente } from "@/lib/panel/clientes/datos";
import type { Resultado } from "../finanzas/acciones";

// Acciones de Clientes de Arata San (D-109). Mismas reglas que Finanzas:
// sesión con doble factor, negocio agencia, rol dueno y filtro por negocio_id.

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
  correo?: string;
  ciudad?: string;
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
    if (!ctx.puedeEditar) return NO("Solo Sergio puede cambiar los clientes.");

    const nombre = limpio(entrada.nombre, 80);
    if (!nombre || nombre.length < 2) return NO("Escribe el nombre del contacto.");
    const empresa = limpio(entrada.empresa, 90);
    const telefono = String(entrada.telefono ?? "").replace(/\D/g, "").replace(/^57(?=\d{10}$)/, "");
    if (telefono.length < 7 || telefono.length > 15) return NO("Revisa el celular: entre 7 y 15 números.");
    const correo = limpio(entrada.correo, 120);
    if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return NO("Revisa el correo.");
    const sitioWeb = limpio(entrada.sitioWeb, 200);
    if (sitioWeb && !/^https:\/\/[^\s]+$/i.test(sitioWeb)) return NO("La página del cliente debe empezar por https://");
    const estado = entrada.estado ?? "nuevo";
    if (!(estadosCliente as readonly string[]).includes(estado)) return NO("Estado no válido.");
    const origen = entrada.origen || null;
    if (origen && !(origenesCliente as readonly string[]).includes(origen)) return NO("Elige de dónde llegó.");
    const id = entrada.id && /^[0-9a-f-]{36}$/i.test(entrada.id) ? entrada.id : null;

    // Sin duplicados: mismo celular, o misma empresa + contacto escritos distinto
    const otros = await db().query(`select id, nombre, empresa, telefono from clientes where negocio_id = $1 and ($2::uuid is null or id <> $2::uuid)`, [ctx.negocioId, id]);
    const dup = otros.rows.find((o) => o.telefono === telefono || (clave(o.nombre) === clave(nombre) && clave(o.empresa ?? "") === clave(empresa ?? "")));
    if (dup) return NO(`Ya existe: ${dup.empresa ? `${dup.empresa} · ` : ""}${dup.nombre}. Búscalo en la lista.`);

    const vals = [nombre, empresa, telefono, correo, limpio(entrada.ciudad, 60), sitioWeb, limpio(entrada.instagram, 60), estado, origen, limpio(entrada.origenDetalle, 200), limpio(entrada.notas, 2000)];
    let nuevoId: string | undefined;
    if (id) {
      const r = await db().query(
        `update clientes set nombre = $3, empresa = $4, telefono = $5, correo = $6, ciudad = $7, sitio_web = $8, instagram = $9,
           estado = $10, origen = $11, origen_detalle = $12, notas = $13 where id = $1 and negocio_id = $2`,
        [id, ctx.negocioId, ...vals]
      );
      if (!r.rowCount) return NO("Ese cliente no existe.");
    } else {
      const r = await db().query(
        `insert into clientes (negocio_id, nombre, empresa, telefono, correo, ciudad, sitio_web, instagram, estado, origen, origen_detalle, notas)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) returning id`,
        [ctx.negocioId, ...vals]
      );
      nuevoId = r.rows[0].id;
    }
    revalidatePath("/panel/clientes");
    revalidatePath("/panel/finanzas", "layout");
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
    if (!ctx?.puedeEditar) return NO("Solo Sergio puede borrar clientes.");
    const usados = await db().query(`select count(*)::int n from fin_proyectos where cliente_id = $1 and negocio_id = $2`, [id, ctx.negocioId]);
    if (usados.rows[0].n) return NO("Este cliente tiene proyectos: no se puede borrar. Márcalo como inactivo.");
    const r = await db().query(`delete from clientes where id = $1 and negocio_id = $2`, [id, ctx.negocioId]);
    if (!r.rowCount) return NO("Ese cliente no existe.");
    revalidatePath("/panel/clientes");
    revalidatePath("/panel/finanzas", "layout");
    return { ok: true };
  } catch {
    return NO("No se pudo borrar.");
  }
}
