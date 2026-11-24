// /agendar y /agendar/gracias — copy APROBADO en docs/blueprint/03-copy.md (D-053, D-041, D-054).
// Flujo: docs/blueprint/02-arquitectura.md §2.

import { CLARITY_ACTIVO } from "@/lib/consentimiento";

export type TipoAgenda = "pagina" | "catalogo" | "sistema" | "auditoria";

// Enlaces de Cal.com (usuario/evento), D-076. No son secretos (son públicos).
// Se pueden cambiar sin tocar código con NEXT_PUBLIC_CAL_LINK y
// NEXT_PUBLIC_CAL_LINK_AUDITORIA. La auditoría lleva aviso mínimo de 48 h en Cal.com (D-054).
// Si Cal.com no abre, el último paso ofrece terminar por WhatsApp.
export const calLinks = {
  reunion: process.env.NEXT_PUBLIC_CAL_LINK || "arata-san/asesoria-30min",
  auditoria: process.env.NEXT_PUBLIC_CAL_LINK_AUDITORIA || "arata-san/auditoria",
  // D-197: agenda directa de las landings de campaña. Evento propio en Cal.com que pide el WhatsApp
  // (y la casilla de datos); mientras no exista, usa el de la reunión.
  landing: process.env.NEXT_PUBLIC_CAL_LINK_LANDING || process.env.NEXT_PUBLIC_CAL_LINK || "arata-san/asesoria-30min",
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
    // D-077: sin afán. Versión A elegida por defecto; B y C en 03-copy.md.
    cuando: {
      pregunta: "¿Cuándo te gustaría empezar?",
      opciones: ["En las próximas semanas", "En uno o dos meses", "Más adelante, sin afán", "Todavía lo estoy pensando"],
    },
    // D-143: las opciones dependen de lo que eligió en "¿Qué necesitas?". Ninguna baja del precio base
    // del servicio, salvo "Menos de 800 USD" en catálogo, que muestra la nota de pagar por partes.
    // La auditoría no tiene este paso.
    inversion: {
      pregunta: "¿Cuánto tienes pensado invertir?",
      opciones: {
        pagina: ["400 a 800 USD", "800 a 2.000 USD", "Más de 2.000 USD"],
        catalogo: ["Menos de 800 USD", "800 a 1.500 USD", "1.500 a 3.000 USD", "Más de 3.000 USD"],
        sistema: ["1.000 a 3.000 USD", "3.000 a 6.000 USD", "Más de 6.000 USD"],
      } as Record<Exclude<TipoAgenda, "auditoria">, string[]>,
      // Opción que no avanza sola y muestra la nota (solo donde existe)
      menos: { catalogo: "Menos de 800 USD" } as Partial<Record<TipoAgenda, string>>,
      notaMenos: "Puedes pagar por partes: 50 % para arrancar y 50 % al entregar.",
    },
    datos: {
      pregunta: "Tus datos",
      nombre: "Tu nombre",
      whatsapp: "Tu WhatsApp",
      whatsappPlaceholder: "+57 300 000 0000",
      correo: "Tu correo",
      correoPlaceholder: "tucorreo@ejemplo.com",
      // D-099: autorización previa, expresa e informada, incluido el envío fuera de Colombia (art. 9 y 26)
      autorizacion: `Autorizo a Arata San a usar mis datos para atender mi solicitud y a enviarlos a los proveedores que usa para agendar y medir el sitio (${CLARITY_ACTIVO ? "Cal.com, Google y Microsoft" : "Cal.com y Google"}), que pueden estar fuera de Colombia, según la`,
      autorizacionLink: "Política de tratamiento de datos",
    },
  },
  botones: { siguiente: "Siguiente", elegirHora: "Elegir hora", atras: "Atrás" },
  errores: {
    opcion: "Elige una opción para seguir.",
    whatsapp: "Revisa tu WhatsApp: con indicativo, por ejemplo +57 300 000 0000.",
    correo: "Revisa tu correo, parece que le falta algo.",
    autorizacion: "Necesitamos tu autorización para poder contactarte.",
    // aprobados en D-100
    nombre: "Escribe tu nombre (mínimo 2 letras).",
    url: "Escribe la dirección de tu página, por ejemplo tunegocio.com.",
  },
  // ◻ D-131: mensajes cuando se frena un envío (anti-bot, sin servidor)
  freno: {
    rapido: "Fue muy rápido. Revisa tus datos y vuelve a tocar «Elegir hora».",
    trampa: "No pudimos validar el envío.",
    intentos: "Ya enviaste varias solicitudes en la última hora.",
    whatsapp: "Escríbenos por WhatsApp",
  },
  auditoriaNota: "Te la entregamos en 48 horas y la revisamos juntos en la reunión.",
  calendario: {
    // textos del último paso (aprobados en D-100)
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
    cupos: "Tomamos 4 proyectos nuevos al mes.",
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
