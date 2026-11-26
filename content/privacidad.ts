// Política de tratamiento de datos (Ley 1581 de 2012 y Decreto 1377 de 2013, compilado en el 1074 de 2015).
// Datos del responsable: D-055 y D-090. Decreto 1377 de 2013, art. 13: nombre, domicilio,
// dirección, correo y teléfono del responsable. No se publica la cédula/NIT (decisión de
// Sergio, no la exige el art. 13) ni se guarda en el código. Negocio digital sin oficina:
// domicilio Bogotá + correo y teléfono como canales. Recomendado: revisión de un abogado.

import { CLARITY_ACTIVO, PIXEL_ACTIVO } from "@/lib/consentimiento";
import { CLARITY_DESDE } from "@/lib/clarity.mjs";
import { PIXEL_DESDE } from "@/lib/pixel.mjs";

// D-203: herramientas de medición encendidas, para los textos que las nombran
const herramientas = [
  "Google Analytics, a través de Google Tag Manager, que cuenta las visitas",
  ...(CLARITY_ACTIVO ? ["Microsoft Clarity, que nos muestra por dónde se mueve la gente en cada página"] : []),
  ...(PIXEL_ACTIVO ? ["el pixel de Meta, que nos dice si llegaste por nuestros anuncios de Facebook o Instagram"] : []),
];
const enLista = (l: string[]) => (l.length === 1 ? l[0] : `${l.slice(0, -1).join(", ")} y ${l[l.length - 1]}`);

export const responsable = {
  nombre: "Sergio David Cuevas",
  tipo: "Persona natural",
  marca: "Arata San",
  domicilio: "Bogotá, Colombia",
  // D-099: negocio 100 % digital, sin oficina abierta al público. ◻ Confirmar con el abogado
  // si el correo basta como dirección de notificaciones.
  notificaciones: "contacto@aratasan.com (negocio digital, sin oficina abierta al público)",
  telefono: "+57 313 401 1189 (WhatsApp)",
  correo: "contacto@aratasan.com",
  vigencia: "noviembre de 2026",
  // D-132 y D-203: si Clarity o el pixel de Meta están encendidos, la fecha es la de su encendido.
  actualizacion: (PIXEL_ACTIVO && PIXEL_DESDE) || (CLARITY_ACTIVO && CLARITY_DESDE) || "17 de noviembre de 2026",
};

// D-099: ajustes de la revisión (autorización expresa, envío fuera de Colombia, dirección
// de notificaciones, plazo de conservación) + cookies/medición y seguridad. ◻ Revisión del abogado.
export const privacidad = {
  meta: {
    title: "Política de tratamiento de datos · Arata San",
    description: "Cómo Arata San recoge, usa y protege tus datos personales, y cómo ejercer tus derechos (Ley 1581 de 2012).",
  },
  titulo: "Política de tratamiento de datos personales",
  intro:
    "Esta política explica qué datos personales recogemos en este sitio, para qué los usamos, con quién los compartimos, cuánto tiempo los guardamos y cómo puedes conocerlos, actualizarlos o pedir que los borremos, según la Ley 1581 de 2012 y el Decreto 1377 de 2013.",
  secciones: [
    {
      titulo: "1. Qué datos recogemos",
      parrafos: [
        "Cuando agendas una reunión o pides una auditoría nos das: tu nombre, tu número de WhatsApp, tu correo y tus respuestas del formulario (qué necesitas, cuándo te gustaría empezar, cuánto piensas invertir y, si pides auditoría, la dirección de tu página).",
        "También medimos de forma general cómo se usa el sitio (páginas vistas, de dónde llegan las visitas, en qué paso del formulario se queda la gente). Esa medición no te identifica por tu nombre.",
        "No pedimos datos sensibles (como salud, origen, creencias u orientación) ni datos de menores de edad.",
      ],
    },
    {
      titulo: "2. Para qué los usamos",
      lista: [
        "Contactarte sobre tu solicitud y confirmar tu reunión.",
        "Preparar la reunión y, si pediste auditoría, revisar tu página.",
        "Enviarte la propuesta con el paquete, el precio y el plazo.",
        "Entender cómo se usa el sitio para mejorarlo.",
        ...(PIXEL_ACTIVO ? ["Si lo aceptas en el aviso de cookies, medir nuestros anuncios de Facebook e Instagram y mostrarte anuncios de Arata San."] : []),
      ],
      parrafos: [
        PIXEL_ACTIVO
          ? "No vendemos tus datos ni los compartimos para que otros te ofrezcan cosas. Lo que mide el pixel de Meta (sección 5) lo recibe Meta, que también lo usa según su propia política de datos."
          : "No vendemos tus datos ni los compartimos para que otros te ofrezcan cosas.",
      ],
    },
    {
      titulo: "3. Cómo nos das tu autorización",
      parrafos: [
        "Antes de enviar el formulario de agendar marcas una casilla en la que autorizas, de forma previa, expresa e informada, el uso de tus datos según esta política, incluido su envío a los proveedores de la sección 4. Sin esa casilla el formulario no se puede enviar.",
        "Guardamos la constancia de tu autorización (con la fecha y la hora) junto con tu solicitud, y te la damos si la pides.",
      ],
    },
    {
      titulo: "4. Quién más los ve y envío fuera de Colombia",
      parrafos: [
        `Para agendar usamos Cal.com, y para medir el sitio usamos ${enLista(["Google (Tag Manager y Analytics)", ...(CLARITY_ACTIVO ? ["Microsoft (Clarity)"] : []), ...(PIXEL_ACTIVO ? ["Meta (pixel de Meta, para nuestros anuncios de Facebook e Instagram)"] : [])])}. Estos proveedores guardan los datos por nosotros, solo para prestarnos ese servicio, y pueden tener sus servidores fuera de Colombia, por ejemplo en Estados Unidos.`,
        "Al marcar la casilla de autorización aceptas de forma expresa que tus datos se envíen a esos proveedores fuera de Colombia, solo para esas finalidades (Ley 1581 de 2012, art. 26). Les pedimos el mismo cuidado que exige la ley colombiana.",
      ],
    },
    {
      id: "cookies",
      titulo: "5. Cookies y medición del sitio",
      parrafos: [
        herramientas.length > 1
          ? `Usamos ${herramientas.length === 2 ? "dos" : "tres"} herramientas: ${enLista(herramientas)}. Cada una se activa solo si la aceptas, por separado, en el aviso de cookies que aparece la primera vez que entras. Si las rechazas o no respondes, no se cargan.`
          : "Usamos Google Analytics, a través de Google Tag Manager, para contar visitas y ver cómo se usa el sitio. Solo se activa si lo aceptas en el aviso de cookies que aparece la primera vez que entras. Si lo rechazas o no respondes, no se carga.",
        "Google Analytics guarda cookies en tu navegador (por ejemplo, _ga) con un número al azar, no con tu nombre ni tu correo. Los datos los procesa Google en Estados Unidos y las cookies duran hasta 2 años, salvo que las borres.",
        ...(CLARITY_ACTIVO
          ? [
              "Microsoft Clarity nos muestra mapas de calor (dónde hace clic y hasta dónde baja la gente) y grabaciones de la visita: se ve cómo se mueve el mouse, los clics y el desplazamiento por la página, sin sonido ni imagen tuya. Lo que escribes en los formularios (nombre, WhatsApp, correo y la dirección de tu página) se oculta y no se graba. Clarity guarda cookies de este sitio (_clck y _clsk) y otras de Microsoft (por ejemplo, CLID y MUID), con un código al azar, no con tu nombre ni tu correo. Algunas duran un día y otras hasta un año. Microsoft procesa los datos en Estados Unidos y los conserva por un tiempo limitado.",
            ]
          : []),
        ...(PIXEL_ACTIVO
          ? [
              "El pixel de Meta nos dice si llegaste por un anuncio nuestro de Facebook o Instagram, qué páginas viste y si agendaste una reunión, para saber qué anuncios funcionan y mostrarte anuncios de Arata San. No le enviamos tu nombre, tu correo ni tu WhatsApp, y no lee lo que escribes en los formularios. Guarda cookies de este sitio (_fbp y, si llegaste por un anuncio, _fbc) con un código al azar, que duran hasta 90 días. Meta procesa los datos en Estados Unidos y también los usa según su propia política de datos.",
            ]
          : []),
        "Hay cookies y datos del navegador necesarios, que no piden permiso porque sin ellos la página no funciona como pediste: tu elección de cookies (se guarda 12 meses; después te volvemos a preguntar), una marca mientras tienes la pestaña abierta para no repetir la animación de entrada y, si agendas, las que usa el calendario de Cal.com para reservar tu cita. No se usan para publicidad.",
        PIXEL_ACTIVO
          ? `Puedes cambiar tu elección cuando quieras en «Preferencias de cookies», al final de cada página. Si retiras un permiso, dejamos de medir con esa herramienta y borramos sus cookies de este sitio (${enLista(["las de Google Analytics", ...(CLARITY_ACTIVO ? ["las de Clarity"] : []), "_fbp y _fbc de Meta"])}); al retirar ${CLARITY_ACTIVO ? "el de Clarity o el de Meta" : "el de Meta"}, la página se recarga sola. Las que ${CLARITY_ACTIVO ? "Microsoft y Meta guardan" : "Meta guarda"} en su propio dominio las puedes borrar desde la configuración de tu navegador. El sitio funciona igual.`
          : CLARITY_ACTIVO
          ? "Puedes cambiar tu elección cuando quieras en «Preferencias de cookies», al final de cada página. Si retiras el permiso, dejamos de medir y borramos las cookies de Google Analytics y de Clarity de este sitio (al retirar el de Clarity, la página se recarga sola). Las que Microsoft guarda en su propio dominio, como CLID y MUID, las puedes borrar desde la configuración de tu navegador. El sitio funciona igual."
          : "Puedes cambiar tu elección cuando quieras en «Preferencias de cookies», al final de cada página. Si retiras el permiso, dejamos de medir y borramos las cookies de Google Analytics de este sitio. También puedes borrarlas o bloquearlas desde tu navegador. El sitio funciona igual.",
      ],
    },
    {
      titulo: "6. Cómo cuidamos tus datos",
      parrafos: [
        "El sitio funciona con conexión cifrada (HTTPS) y cabeceras de seguridad. Solo el responsable y las personas del equipo que atienden tu solicitud ven tus datos, y únicamente para lo que dice esta política. Nuestros proveedores tienen sus propias medidas de seguridad.",
      ],
    },
    {
      titulo: "7. Tus derechos",
      lista: [
        "Conocer, actualizar y corregir tus datos.",
        "Pedir prueba de la autorización que nos diste.",
        "Saber cómo hemos usado tus datos.",
        "Retirar tu autorización o pedir que borremos tus datos, cuando no haya una obligación legal de guardarlos.",
        "Consultar tus datos gratis.",
        "Presentar quejas ante la Superintendencia de Industria y Comercio (SIC).",
      ],
    },
    {
      titulo: "8. Cómo ejercer tus derechos",
      parrafos: [
        "Escríbenos a contacto@aratasan.com, que es también nuestra dirección para notificaciones, con tu nombre, tu solicitud y un dato para responderte.",
        "Las consultas se responden en máximo 10 días hábiles (se pueden extender 5 días más, avisándote el motivo). Los reclamos —por ejemplo, para corregir o borrar datos— se responden en máximo 15 días hábiles (se pueden extender 8 días más, avisándote el motivo).",
      ],
    },
    {
      titulo: "9. Cuánto tiempo guardamos tus datos",
      lista: [
        "Si no llegamos a trabajar juntos: hasta 2 años después del último contacto. Después los borramos.",
        "Si eres cliente: mientras dure el proyecto y el mantenimiento, y luego solo lo que la ley obliga a guardar en soportes contables y de facturación (hasta 10 años, Código de Comercio, art. 60).",
        "Puedes pedir que los borremos antes, cuando no haya una obligación legal de guardarlos.",
      ],
    },
    {
      titulo: "10. Cambios a esta política",
      parrafos: ["Si cambiamos algo importante, lo publicamos en esta página con la nueva fecha de actualización."],
    },
  ],
};
