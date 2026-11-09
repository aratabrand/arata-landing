// Política de tratamiento de datos (Ley 1581 de 2012 y Decreto 1377 de 2013, compilado en el 1074 de 2015).
// Datos del responsable: D-055. ⚠ Antes de lanzar: completar `rut` y `direccion`
// (si quedan vacíos, la página no los muestra) y que un abogado revise el texto.

export const responsable = {
  nombre: "Sergio David Cuevas",
  tipo: "Persona natural",
  marca: "Arata San",
  rut: "", // ◻ pendiente (D-055)
  direccion: "", // ◻ pendiente (D-055)
  ciudad: "Bogotá, Colombia",
  correo: "contacto@aratasan.com",
  vigencia: "noviembre de 2026",
};

export const privacidad = {
  meta: {
    title: "Política de tratamiento de datos · Arata San",
    description: "Cómo Arata San recoge, usa y protege tus datos personales, y cómo ejercer tus derechos (Ley 1581 de 2012).",
  },
  titulo: "Política de tratamiento de datos personales",
  intro:
    "Esta política explica qué datos personales recogemos en este sitio, para qué los usamos y cómo puedes conocerlos, actualizarlos o pedir que los borremos, según la Ley 1581 de 2012 y el Decreto 1377 de 2013.",
  secciones: [
    {
      titulo: "1. Qué datos recogemos",
      parrafos: [
        "Cuando agendas una reunión o pides una auditoría nos das: tu nombre, tu número de WhatsApp, tu correo y tus respuestas del formulario (qué necesitas, para cuándo, cuánto piensas invertir y, si pides auditoría, la dirección de tu página).",
        "También medimos de forma general cómo se usa el sitio (páginas vistas, de dónde llegan las visitas) con herramientas de Google. Esa medición no te identifica por tu nombre.",
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
      parrafos: ["No vendemos ni compartimos tus datos para que otros te ofrezcan cosas."],
    },
    {
      titulo: "3. Quién más los ve",
      parrafos: [
        "Para agendar usamos Cal.com, y para medir el sitio usamos Google (Tag Manager y Analytics). Estos proveedores guardan los datos por nosotros y pueden tener sus servidores fuera de Colombia. Solo los usan para prestarnos ese servicio.",
      ],
    },
    {
      titulo: "4. Tus derechos",
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
      titulo: "5. Cómo ejercer tus derechos",
      parrafos: [
        "Escríbenos al correo de contacto con tu nombre, tu solicitud y un dato para responderte.",
        "Las consultas se responden en máximo 10 días hábiles (se pueden extender 5 días más, avisándote el motivo). Los reclamos —por ejemplo, para corregir o borrar datos— se responden en máximo 15 días hábiles (se pueden extender 8 días más, avisándote el motivo).",
      ],
    },
    {
      titulo: "6. Cuánto tiempo guardamos tus datos",
      parrafos: [
        "Mientras dure la relación contigo y el tiempo necesario para cumplir con lo que nos pediste o con obligaciones legales. Después los borramos.",
      ],
    },
    {
      titulo: "7. Cambios a esta política",
      parrafos: ["Si cambiamos algo importante, lo publicamos en esta página con la nueva fecha de vigencia."],
    },
  ],
};
