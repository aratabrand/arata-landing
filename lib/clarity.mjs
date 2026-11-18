// Microsoft Clarity (mapas de clics y grabaciones). D-132.
//
// Para ENCENDERLO: pega aquí el ID del proyecto (clarity.microsoft.com → Settings → Overview → "Project ID";
// son ~10 letras y números, ej. "abcd1234ef") y la fecha de hoy. Es un dato público, no un secreto.
// Con el ID puesto, a la vez y con el mismo cambio:
//   - el aviso de cookies suma el permiso "Cómo navegas (Microsoft Clarity)" y vuelve a preguntar a quien ya había elegido,
//   - la política de datos nombra a Microsoft y explica qué graba y qué cookies usa,
//   - la casilla de autorización de /agendar nombra a Microsoft,
//   - la política de seguridad (CSP) deja pasar clarity.ms.
// Vacío = Clarity apagado: no se pide nada a Microsoft y no se menciona en ningún texto.
//
// Es .mjs porque next.config.mjs (la CSP) y el código del sitio leen el MISMO valor.
export const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || "";

// Fecha en que se encendió, con este formato: "20 de noviembre de 2026". Va en "Última actualización" de la política.
export const CLARITY_DESDE = "";
