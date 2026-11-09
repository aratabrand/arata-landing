// Política de tratamiento de datos (Ley 1581 de 2012 y Decreto 1377 de 2013, compilado en el 1074 de 2015).
// Datos del responsable: D-055 y D-090. Decreto 1377 de 2013, art. 13: nombre, domicilio,
// dirección, correo y teléfono del responsable. No se publica la cédula/NIT (decisión de
// Sergio, no la exige el art. 13) ni se guarda en el código. Negocio digital sin oficina:
// domicilio Bogotá + correo y teléfono como canales. Recomendado: revisión de un abogado.

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
  actualizacion: "9 de noviembre de 2026",
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
      ],
      parrafos: ["No vendemos tus datos ni los compartimos para que otros te ofrezcan cosas."],
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
        "Para agendar usamos Cal.com, y para medir el sitio usamos Google (Tag Manager y Analytics). Estos proveedores guardan los datos por nosotros, solo para prestarnos ese servicio, y pueden tener sus servidores fuera de Colombia, por ejemplo en Estados Unidos.",
        "Al marcar la casilla de autorización aceptas de forma expresa que tus datos se envíen a esos proveedores fuera de Colombia, solo para esas finalidades (Ley 1581 de 2012, art. 26). Les pedimos el mismo cuidado que exige la ley colombiana.",
      ],
    },
    {
      titulo: "5. Cookies y medición del sitio",
      parrafos: [
        "Usamos Google Analytics, a través de Google Tag Manager, para contar visitas y ver cómo se usa el sitio. Google Analytics guarda cookies en tu navegador (por ejemplo, _ga) con un número al azar, no con tu nombre. Se activa cuando tocas, haces scroll o pasados unos segundos.",
        "El sitio también guarda en tu navegador, solo mientras tienes la pestaña abierta, una marca para no repetir la animación de entrada. No tiene datos tuyos.",
        "Puedes borrar o bloquear las cookies desde la configuración de tu navegador, o instalar el complemento de Google para no ser medido por Analytics (tools.google.com/dlpage/gaoptout). El sitio sigue funcionando igual.",
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
