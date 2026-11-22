import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/panel/db";
import { panelActivo } from "@/lib/panel/config";
import { cuandoTexto, firmaValida, leerAviso, type Aviso } from "@/lib/panel/cal";
import { registrarSistema } from "@/lib/panel/historial";

// Avisos de Cal.com (D-133, D-134). Cal.com llama aquí cada vez que alguien agenda (o pide una reunión
// que hay que aceptar), cancela o cambia la hora, y cuando se acepta o rechaza una solicitud. Se configura en Cal.com → Settings → Developer → Webhooks (guía:
// docs/panel-cliente/05-acceso-y-seguridad.md §3e).
//
// Seguridad: es la única puerta pública del panel para escribir datos. Sin CAL_WEBHOOK_SECRET responde
// 503; sin una firma HMAC-SHA256 válida (x-cal-signature-256) del cuerpo EXACTO, responde 401 y no
// toca la base. Cal.com reintenta si no recibe 200, y el mismo aviso repetido no duplica nada.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_CUERPO = 200_000; // un aviso real pesa ~3 KB
const json = (cuerpo: object, status = 200) => NextResponse.json(cuerpo, { status, headers: { "cache-control": "no-store" } });

export async function POST(req: NextRequest) {
  if (!panelActivo) return new NextResponse(null, { status: 404 });
  const secreto = process.env.CAL_WEBHOOK_SECRET ?? "";
  if (secreto.length < 16) return json({ error: "El webhook no está configurado." }, 503);

  if (Number(req.headers.get("content-length") ?? 0) > MAX_CUERPO) return json({ error: "Demasiado grande." }, 413);
  const cuerpo = await req.text();
  if (cuerpo.length > MAX_CUERPO) return json({ error: "Demasiado grande." }, 413);
  if (!firmaValida(cuerpo, req.headers.get("x-cal-signature-256"), secreto)) return json({ error: "Firma no válida." }, 401);

  let datos: unknown;
  try {
    datos = JSON.parse(cuerpo);
  } catch {
    return json({ error: "No es JSON." }, 400);
  }

  const aviso = leerAviso(datos);
  // PING de prueba y eventos que no usamos: se responde bien para que Cal.com no los reintente
  if (aviso.accion === "ignorar") return json({ ok: true, ignorado: aviso.motivo });

  try {
    const negocio = (await db().query(`select id from negocios where slug = 'arata-san' and tipo = 'agencia'`)).rows[0];
    if (!negocio) return json({ error: "Falta el negocio de Arata San." }, 500);
    await procesar(negocio.id as string, aviso);
    return json({ ok: true });
  } catch (e) {
    // Sin datos de la persona en el log: solo qué falló. Cal.com reintenta.
    console.error("[cal] no se pudo guardar el aviso:", aviso.accion, e instanceof Error ? e.message : e);
    return json({ error: "No se pudo guardar." }, 500);
  }
}

type Reserva = Exclude<Aviso, { accion: "ignorar" }>;

async function insertar(negocioId: string, a: Reserva, porAceptar = false) {
  return db().query(
    `insert into interesados (negocio_id, cal_uid, cal_booking_id, nombre, correo, whatsapp, necesita, tipo, pagina_web, cuando, inversion,
                              autorizacion, evento, reunion_inicio, reunion_fin, zona_horaria, enlace_llamada, enlace_reserva, por_aceptar)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
     on conflict (cal_uid) do nothing returning id`,
    [negocioId, a.uid, a.bookingId, a.nombre, a.correo, a.whatsapp, a.necesita, a.tipo, a.paginaWeb, a.cuando, a.inversion, a.autorizacion, a.evento, a.inicio, a.fin, a.zona, a.enlaceLlamada, a.enlaceReserva, porAceptar]
  );
}

async function procesar(negocioId: string, a: Reserva) {
  // Confirmación manual en Cal.com (D-134): llega la solicitud y queda "por aceptar"
  if (a.accion === "solicitada") {
    const r = await insertar(negocioId, a, true);
    if (r.rowCount) {
      await vincularProspecto(negocioId, r.rows[0].id, a);
      await avisarNueva(negocioId, r.rows[0].id, a, true);
    }
    return;
  }

  if (a.accion === "creada") {
    const r = await insertar(negocioId, a);
    // Si ya estaba (Cal.com reintentó), no se avisa otra vez
    if (r.rowCount) {
      await vincularProspecto(negocioId, r.rows[0].id, a);
      return avisarNueva(negocioId, r.rows[0].id, a, false);
    }
    // Ya estaba como solicitud: se aceptó en Cal.com. Ahora sí trae el enlace de la llamada.
    const acep = await db().query(
      `update interesados set por_aceptar = false, enlace_llamada = coalesce($3, enlace_llamada), reunion_inicio = $4, reunion_fin = coalesce($5, reunion_fin), actualizado = now()
        where negocio_id = $1 and cal_uid = $2 and por_aceptar and estado = 'agendada' returning id, nombre`,
      [negocioId, a.uid, a.enlaceLlamada, a.inicio, a.fin]
    );
    if (acep.rowCount) {
      const x = acep.rows[0];
      // Lo aceptó alguien del equipo en Cal.com: queda en el historial, sin aviso al celular
      await registrarSistema(negocioId, "Cal.com", {
        accion: "editar",
        entidad: "interesado",
        entidadId: x.id,
        titulo: `Se aceptó la reunión de ${x.nombre}`,
        cambios: [{ campo: "Reunión", antes: "Por aceptar", despues: cuandoTexto(a.inicio) }],
      });
    }
    return;
  }

  if (a.accion === "rechazada") {
    const r = await db().query(
      `update interesados set estado = 'rechazada', por_aceptar = false, cerrado_en = now(), actualizado = now()
        where negocio_id = $1 and cal_uid = $2 and estado = 'agendada' returning id, nombre`,
      [negocioId, a.uid]
    );
    if (r.rowCount) {
      const x = r.rows[0];
      await registrarSistema(negocioId, "Cal.com", {
        accion: "editar",
        entidad: "interesado",
        entidadId: x.id,
        titulo: `Se rechazó la reunión de ${x.nombre}`,
        cambios: [{ campo: "Reunión", antes: cuandoTexto(a.inicio), despues: "Rechazada en Cal.com" }],
      });
    }
    return;
  }

  if (a.accion === "cancelada") {
    const r = await db().query(
      `update interesados set estado = 'cancelada', por_aceptar = false, espera_hasta = null, actualizado = now()
        where negocio_id = $1 and cal_uid = $2 and estado in ('agendada', 'espera') returning id, nombre, reunion_inicio`,
      [negocioId, a.uid]
    );
    if (r.rowCount) {
      const x = r.rows[0];
      await registrarSistema(negocioId, "Cal.com", {
        accion: "editar",
        entidad: "interesado",
        entidadId: x.id,
        titulo: `${x.nombre} canceló su reunión`,
        cambios: [{ campo: "Reunión", antes: cuandoTexto(x.reunion_inicio.toISOString()), despues: "Cancelada" }],
        importante: true,
        cuerpoAviso: `Era para ${cuandoTexto(x.reunion_inicio.toISOString())}`,
      });
    }
    return; // cancelación de algo que no teníamos: nada que hacer
  }

  // Reprogramada: Cal.com le da un uid nuevo a la reserva
  if ((await db().query(`select 1 from interesados where negocio_id = $1 and cal_uid = $2`, [negocioId, a.uid])).rowCount) return; // ya procesada
  if (a.uidAnterior) {
    const antes = (
      await db().query(`select id, nombre, reunion_inicio from interesados where negocio_id = $1 and cal_uid = $2 and estado in ('agendada', 'espera', 'cancelada')`, [negocioId, a.uidAnterior])
    ).rows[0];
    if (antes) {
      await db().query(
        `update interesados set cal_uid = $2, cal_booking_id = coalesce($3, cal_booking_id), reunion_inicio = $4, reunion_fin = $5,
                zona_horaria = coalesce($6, zona_horaria), enlace_llamada = $7, enlace_reserva = $8, estado = 'agendada', espera_hasta = null, actualizado = now()
          where id = $1`,
        [antes.id, a.uid, a.bookingId, a.inicio, a.fin, a.zona, a.enlaceLlamada, a.enlaceReserva]
      );
      await registrarSistema(negocioId, "Cal.com", {
        accion: "editar",
        entidad: "interesado",
        entidadId: antes.id,
        titulo: `${antes.nombre} cambió la hora de su reunión`,
        cambios: [{ campo: "Reunión", antes: cuandoTexto(antes.reunion_inicio.toISOString()), despues: cuandoTexto(a.inicio) }],
        importante: true,
        cuerpoAviso: `Ahora: ${cuandoTexto(a.inicio)}`,
      });
      return;
    }
  }
  // No teníamos la reserva original (se perdió su aviso): se guarda como nueva
  const r = await insertar(negocioId, a);
  if (r.rowCount) await avisarNueva(negocioId, r.rows[0].id, a, false);
}

async function avisarNueva(negocioId: string, id: string, a: Reserva, porAceptar: boolean) {
  await registrarSistema(negocioId, "Cal.com", {
    accion: "crear",
    entidad: "interesado",
    entidadId: id,
    titulo: porAceptar ? `${a.nombre} pidió una reunión: acéptala o recházala en Cal.com` : `Nuevo interesado: ${a.nombre} agendó una reunión`,
    cambios: [
      { campo: "Necesita", antes: "", despues: a.necesita ?? "—" },
      { campo: "Reunión", antes: "", despues: cuandoTexto(a.inicio) },
      ...(a.inversion ? [{ campo: "Inversión", antes: "", despues: a.inversion }] : []),
      ...(a.cuando ? [{ campo: "Cuándo empezar", antes: "", despues: a.cuando }] : []),
    ],
    importante: true,
    cuerpoAviso: [a.necesita, cuandoTexto(a.inicio), a.inversion].filter(Boolean).join(" · "),
  });
}

/**
 * Agendó desde el mensaje de WhatsApp a un prospecto (D-174): la cita trae "Referencia: <código>".
 * Se une el interesado con su prospecto y el prospecto pasa a "Agendó" (un «No contactar» no se toca).
 * Si falla, no se pierde la reserva: el interesado ya quedó guardado.
 */
async function vincularProspecto(negocioId: string, interesadoId: string, a: Reserva) {
  if (!a.referencia) return;
  try {
    const r = await db().query(
      `update prospectos set interesado_id = $3, estado = case when estado = 'no_contactar' then estado else 'agendo' end, actualizado = now()
        where negocio_id = $1 and replace(id::text, '-', '') like $2 || '%'
          and (select count(*) from prospectos where negocio_id = $1 and replace(id::text, '-', '') like $2 || '%') = 1
        returning id, nombre`,
      [negocioId, a.referencia, interesadoId]
    );
    if (r.rowCount)
      await registrarSistema(negocioId, "Cal.com", {
        accion: "editar",
        entidad: "prospecto",
        entidadId: r.rows[0].id,
        titulo: `${r.rows[0].nombre} agendó desde el mensaje de WhatsApp`,
        cambios: [{ campo: "Estado", antes: "", despues: "Agendó" }],
      });
  } catch (e) {
    console.error("[cal] no se pudo unir con el prospecto:", e instanceof Error ? e.message : e);
  }
}
