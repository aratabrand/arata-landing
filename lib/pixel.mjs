// Pixel de Meta (Facebook e Instagram). D-203.
//
// ENCENDIDO el 26 nov 2026 con el pixel «Arata San» (ID 2929047020815339, lo pasó Sergio). El ID es público:
// va en la página. Se puede cambiar sin tocar código: en Vercel, proyecto `arata-landing` → Environment Variables:
//   NEXT_PUBLIC_META_PIXEL_ID    = el ID del pixel (Administrador de eventos de Meta; 15 o 16 cifras). Es público.
//   NEXT_PUBLIC_META_PIXEL_DESDE = la fecha de hoy, así: "26 de noviembre de 2026" (va en la política de datos).
// y después Redeploy. Con el ID puesto, a la vez:
//   - el aviso de cookies suma el permiso "Publicidad (Meta)" y vuelve a preguntar a quien ya había elegido,
//   - la política de datos nombra a Meta y explica qué mide y qué cookies usa,
//   - las casillas de autorización (/agendar y la agenda de las landings) nombran a Meta,
//   - la política de seguridad (CSP) deja pasar connect.facebook.net y facebook.com.
// Vacío = pixel apagado: no se pide nada a Meta y no se menciona en ningún texto.
//
// Es .mjs porque next.config.mjs (la CSP) y el código del sitio leen el MISMO valor.
// Para APAGARLO: poner NEXT_PUBLIC_META_PIXEL_ID = "0" en Vercel (o borrar el valor por defecto de aquí).
const ID_POR_DEFECTO = "2929047020815339";
// Una variable vacía o sin números (p. ej. creada en Vercel sin valor) NO apaga el pixel: usa el ID de Arata San.
const crudo = (process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "").trim();
export const PIXEL_ID = crudo === "0" ? "" : crudo.replace(/\D/g, "") || ID_POR_DEFECTO;

// Fecha en que se encendió, con este formato: "26 de noviembre de 2026". Va en "Última actualización" de la política.
export const PIXEL_DESDE = (process.env.NEXT_PUBLIC_META_PIXEL_DESDE ?? "").trim() || "26 de noviembre de 2026";
