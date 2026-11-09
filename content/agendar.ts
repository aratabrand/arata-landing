// /agendar y /agendar/gracias — copy APROBADO en docs/blueprint/03-copy.md (D-053, D-041, D-054).
// Flujo: docs/blueprint/02-arquitectura.md §2.

export type TipoAgenda = "pagina" | "catalogo" | "sistema" | "auditoria";

// Enlaces de Cal.com (usuario/evento). No son secretos: van en .env como
// NEXT_PUBLIC_CAL_LINK y NEXT_PUBLIC_CAL_LINK_AUDITORIA (este último con aviso
// mínimo de 48 horas configurado en Cal.com, D-054). Sin ellos, el último paso
// ofrece terminar por WhatsApp con las respuestas ya escritas.
export const calLinks = {
  reunion: process.env.NEXT_PUBLIC_CAL_LINK ?? "",
  auditoria: process.env.NEXT_PUBLIC_CAL_LINK_AUDITORIA ?? process.env.NEXT_PUBLIC_CAL_LINK ?? "",
};

export const agendar = {
  meta: {
    title: "Agenda tu reunión · 30 minutos, sin costo · Arata San",
    description:
      "Responde 3 preguntas y elige la hora. En 30 minutos sales con el paquete y el precio para tu caso. También puedes pedir una auditoría gratis de tu página.",
  },
  titulo: "Agenda tu reunión.",
  texto: "30 minutos, sin costo. Sales con el paquete y el precio para tu caso.",
  pasos: {
    tipo: {
      pregunta: "¿Qué necesitas?",
      opciones: [
        { valor: "pagina", label: "Una página nueva" },
        { valor: "catalogo", label: "Un catálogo o tienda" },
        { valor: "sistema", label: "Un sistema a medida" },
        { valor: "auditoria", label: "Una auditoría gratis de mi página" },
      ] as { valor: TipoAgenda; label: string }[],
    },
    url: {
      pregunta: "¿Cuál es tu página?",
      placeholder: "tunegocio.com",
    },
    cuando: {
      pregunta: "¿Para cuándo lo necesitas?",
      opciones: ["Ya", "Este mes", "En 1 a 3 meses", "Solo estoy averiguando"],
    },
    inversion: {
      pregunta: "¿Cuánto tienes pensado invertir?",
      opciones: ["Menos de 400 USD", "400 a 800 USD", "800 a 2.000 USD", "Más de 2.000 USD"],
      notaMenos: "Puedes pagar por partes: 50 % para arrancar y 50 % al entregar.",
    },
    datos: {
      pregunta: "Tus datos",
      nombre: "Tu nombre",
      whatsapp: "Tu WhatsApp",
      whatsappPlaceholder: "+57 300 000 0000",
      correo: "Tu correo",
      correoPlaceholder: "tucorreo@ejemplo.com",
      autorizacion: "Autorizo a Arata San a usar mis datos para contactarme sobre mi solicitud, según la",
      autorizacionLink: "Política de tratamiento de datos",
    },
  },
  botones: { siguiente: "Siguiente", elegirHora: "Elegir hora", atras: "Atrás" },
  errores: {
    opcion: "Elige una opción para seguir.",
    whatsapp: "Escribe tu WhatsApp con el indicativo, por ejemplo +57 300 000 0000.",
    correo: "Revisa tu correo, parece que le falta algo.",
    autorizacion: "Necesitamos tu autorización para poder contactarte.",
    // ◻ nuevos (no estaban en 03-copy.md): por aprobar
    nombre: "Escribe tu nombre.",
    url: "Escribe la dirección de tu página.",
  },
  auditoriaNota: "Te la entregamos en 48 horas y la revisamos juntos en la reunión.",
  calendario: {
    // ◻ nuevos: textos del último paso
    titulo: "Elige la hora que te sirva",
    cargando: "Abriendo el calendario…",
    sinCalendario: "Termina por WhatsApp: te mandamos los horarios disponibles.",
    botonWhatsapp: "Enviar por WhatsApp",
  },
  lateral: {
    titulo: "Qué pasa en la reunión",
    pasos: [
      "Nos cuentas tu negocio y qué necesitas.",
      "Te decimos qué paquete te sirve y cuánto cuesta.",
      "En 48 horas te mandamos la propuesta.",
    ],
    garantiaFuerte: "Garantía de velocidad",
    garantia: "si tu página no saca 90 o más en celular, la seguimos ajustando gratis.",
    cupos: "Tomamos 3 proyectos nuevos al mes.",
  },
};

export const gracias = {
  meta: { title: "¡Listo! Tu reunión quedó agendada · Arata San" },
  titulo: "¡Listo! Tu reunión quedó agendada.",
  texto: "Te llegó la confirmación al correo con el link de la reunión.",
  preparaTitulo: "Para aprovechar los 30 minutos, ten a mano:",
  prepara: [
    "Tu página actual, si tienes una.",
    "Ejemplos de páginas o tiendas que te gusten.",
    "Tu logo.",
    "Qué quieres que pase con tu página o tu tienda.",
  ],
  cambiar: "¿Necesitas cambiar la hora? Usa el link de tu correo o",
  cambiarLink: "escríbenos por WhatsApp",
  mientras: "Mientras tanto,",
  mientrasLink: "mira nuestros trabajos",
};
