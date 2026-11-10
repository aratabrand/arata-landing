import { headers } from "next/headers";
import { auth } from "./auth";
import { db } from "./db";

// Sesión del panel en el servidor. Toda lectura o escritura de datos del panel
// pasa por aquí: sin sesión con doble factor no hay consulta, y cada consulta
// se limita a los negocios donde la persona es miembro.

export type EstadoSesion =
  | { estado: "sin-sesion" }
  | { estado: "falta-doble-factor"; usuarioId: string }
  | { estado: "completa"; usuarioId: string; email: string; nombre: string };

export async function estadoSesion(): Promise<EstadoSesion> {
  const s = await auth().api.getSession({ headers: await headers() });
  if (!s) return { estado: "sin-sesion" };
  // Con doble factor activo, Better Auth no crea sesión hasta verificar el código.
  // Una sesión sin doble factor activo solo existe antes de activarlo: no entra al panel.
  if (!(s.user as { twoFactorEnabled?: boolean | null }).twoFactorEnabled) {
    return { estado: "falta-doble-factor", usuarioId: s.user.id };
  }
  return { estado: "completa", usuarioId: s.user.id, email: s.user.email, nombre: s.user.name };
}

/** Negocios a los que la persona tiene acceso (base de toda consulta del panel). */
export async function negociosDe(usuarioId: string) {
  const { rows } = await db().query<{ id: string; slug: string; tipo: string; nombre: string; rol: string }>(
    `select n.id, n.slug, n.tipo, n.nombre, m.rol
       from miembros m join negocios n on n.id = m.negocio_id
      where m.usuario_id = $1
      order by n.nombre`,
    [usuarioId]
  );
  return rows;
}
