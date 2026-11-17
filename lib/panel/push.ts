import webpush from "web-push";
import { db } from "./db";

// Avisos al celular y computador (Web Push, D-119). Solo servidor.
// Claves VAPID en variables del proyecto del panel (nunca en el repo):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY  →  npx web-push generate-vapid-keys
//   VAPID_SUBJECT (opcional)             →  mailto: de contacto de Arata
// Sin claves, el panel funciona igual y la pestaña Notificaciones dice que falta activarlo.

export const pushActivo = Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
export const clavePublica = () => process.env.VAPID_PUBLIC_KEY ?? "";

let listo = false;
function configurar() {
  if (listo || !pushActivo) return pushActivo;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:contacto@aratasan.com", process.env.VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
  listo = true;
  return true;
}

export type Aviso = { titulo: string; cuerpo?: string; url?: string; etiqueta?: string };

/** Manda un aviso a todos los dispositivos de los miembros del negocio (menos a `excepto`). */
export async function avisarEquipo(negocioId: string, a: Aviso & { excepto?: string }) {
  return enviar(negocioId, a, { excepto: a.excepto });
}

/** Solo a los dispositivos de una persona (ej. "Probar aviso"). */
export async function avisarA(negocioId: string, usuarioId: string, a: Aviso) {
  return enviar(negocioId, a, { solo: usuarioId });
}

async function enviar(negocioId: string, a: Aviso, f: { excepto?: string; solo?: string }) {
  if (!configurar()) return { enviados: 0, fallidos: 0 };
  const subs = await db().query(
    `select s.id, s.endpoint, s.p256dh, s.auth from push_suscripciones s
       join miembros m on m.usuario_id = s.usuario_id and m.negocio_id = s.negocio_id
      where s.negocio_id = $1 and ($2::text is null or s.usuario_id <> $2) and ($3::text is null or s.usuario_id = $3)`,
    [negocioId, f.excepto ?? null, f.solo ?? null]
  );
  const carga = JSON.stringify({ titulo: a.titulo.slice(0, 120), cuerpo: (a.cuerpo ?? "").slice(0, 300), url: a.url ?? "/panel/notificaciones", etiqueta: a.etiqueta });
  let enviados = 0;
  let fallidos = 0;
  await Promise.all(
    subs.rows.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, carga, { TTL: 60 * 60 * 24, timeout: 8000 });
        enviados++;
        await db().query(`update push_suscripciones set ultimo_envio = now() where id = $1`, [s.id]);
      } catch (e) {
        fallidos++;
        // 404/410 = el dispositivo ya no acepta avisos (se desinstaló o se quitó el permiso): se borra
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) await db().query(`delete from push_suscripciones where id = $1`, [s.id]);
        else console.error("[push] no se pudo enviar:", code ?? (e instanceof Error ? e.message : e));
      }
    })
  );
  return { enviados, fallidos };
}
