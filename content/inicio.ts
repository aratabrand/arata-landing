// Copy del Inicio v2 — aprobado en docs/blueprint/03-copy.md (D-038 a D-043).
// Para cambiar un texto, se cambia aquí (y en 03-copy.md), no en los componentes.

import { site } from "@/lib/site";

export const AGENDAR = "/agendar";
// Muestra de la Fase 3 en /v2. En la Fase 4 (lanzamiento) se cambia a "/".
export const INICIO = "/v2";
export const PRECIOS = `${INICIO}#precios`;

export const hero = {
  badge: "Tomamos 3 proyectos nuevos al mes",
  titulo: "Tu página lista en 5 días.",
  tituloSigue: "Hecha para vender desde el celular.",
  subtitulo:
    "Diseñamos páginas, catálogos y sistemas para negocios que quieren clientes por internet. Rápidos, fáciles de encontrar en Google y con garantía de velocidad.",
  ctaPrincipal: "Agenda tu reunión gratis",
  ctaSecundario: "Ver trabajos",
  pruebas: [
    { valor: 5, sufijo: " días", texto: "hábiles para entregar" },
    { valor: 90, sufijo: "+", texto: "en velocidad de Google, garantizado" },
    { valor: 4, sufijo: "", texto: "negocios ya trabajando con lo que hicimos" },
  ],
};

export const prueba = {
  titulo: "Han confiado en nosotros",
  nombres: ["Danrodedm", "Boost Your Menu", "Arata Print", "Caravana"],
};

export const problema = {
  titulo: "¿Tu negocio vive en el chat?",
  items: [
    "Mandas fotos por WhatsApp y el cliente se pierde en la galería.",
    "Tu página se demora en abrir en el celular y la gente se sale.",
    "Tienes fichas técnicas o PDF que nadie lee.",
    "Nadie te encuentra en Google.",
    "No sabes cuánto tienes en inventario ni qué te compran.",
  ],
  cierre: "Todo esto tiene arreglo, y no tarda meses.",
};

export const servicios = {
  titulo: "Dos formas de ayudarte",
  items: [
    {
      titulo: "Páginas que venden",
      texto:
        "Una página clara, rápida y hecha para el celular, que lleva a la gente a escribirte o a agendar.",
      etiqueta: "Página Lista en 5 Días · desde 400 USD",
      boton: "Ver páginas",
      href: "/paginas-web",
    },
    {
      titulo: "Catálogos y sistemas a medida",
      texto:
        "Tu catálogo con carrito, inventario y pedidos que te llegan por WhatsApp. O un sistema hecho para tu negocio: reservas, menús digitales o registro de clientes (CRM).",
      etiqueta: "Tienda por WhatsApp en 5 Días · desde 800 USD",
      boton: "Ver catálogos y sistemas",
      href: "/catalogos-y-sistemas",
    },
  ],
};

export const portafolio = {
  titulo: "Trabajos reales, negocios reales",
  boton: "Ver todo el portafolio",
};

export const pasos = {
  titulo: "De la reunión a tu página en 5 días hábiles",
  items: [
    { titulo: "Agendas una reunión", texto: "30 minutos. Nos cuentas tu negocio y qué necesitas." },
    { titulo: "Te mandamos la propuesta", texto: "En 48 horas: paquete, precio y fecha de entrega." },
    { titulo: "Apruebas y arrancamos", texto: "Nos mandas tus textos, tu logo y tus fotos." },
    { titulo: "Te entregamos en 5 días hábiles", texto: "Tu página o tu catálogo publicado y funcionando." },
    { titulo: "Te enseñamos a usarlo", texto: "Capacitación incluida." },
  ],
};

export type Paquete = {
  nombre: string;
  precio: string;
  nota?: string;
  incluye: string[];
  adicional?: string;
  boton: string;
  recomendado?: boolean;
};

export const precios = {
  titulo: "Precios claros, sin sorpresas",
  paquetes: [
    {
      nombre: "Página Lista en 5 Días",
      precio: "Desde 400 USD",
      incluye: [
        "5 secciones",
        "Diseño hecho primero para el celular",
        "Velocidad de 90 o más en Google, garantizada",
        "Lista para que te encuentren en Google, Google Business y la IA",
        "Dominio y hosting el primer año",
        "2 rondas de ajustes",
        "Capacitación para que la manejes tú",
        "Entrega en 5 días hábiles",
      ],
      adicional:
        "Adicional: panel para editar tu página y ver las métricas de tu negocio (se cotiza aparte).",
      boton: "Agenda tu reunión",
    },
    {
      nombre: "Tienda por WhatsApp en 5 Días",
      precio: "Desde 800 USD",
      nota: "El precio depende del tamaño de tu tienda",
      incluye: [
        "Catálogo con carrito de compras",
        "El pedido te llega ordenado a tu WhatsApp",
        "Panel para manejar tu tienda",
        "Inventario",
        "Velocidad de 90 o más en Google, garantizada",
        "Lista para Google, Google Business y la IA",
        "Dominio y hosting el primer año",
        "2 rondas de ajustes",
        "Capacitación",
        "Entrega en 5 días hábiles",
      ],
      boton: "Agenda tu reunión",
      recomendado: true,
    },
    {
      nombre: "Tu Negocio en Orden",
      precio: "Lo cotizamos contigo",
      incluye: [
        "Sistema de reservas, menú digital, registro de clientes (CRM) o lo que tu negocio necesite",
        "Diseñado a la medida de cómo trabajas",
        "Capacitación",
      ],
      boton: "Cuéntanos tu idea",
    },
  ] satisfies Paquete[],
  garantia:
    "Si tu página no saca 90 o más en velocidad móvil de Google, la seguimos ajustando gratis hasta lograrlo.",
  pago: "Paga por partes: 50 % para arrancar y 50 % cuando te entregamos.",
  mantenimiento: "Mantenimiento opcional: 15 % del valor de tu proyecto al mes.",
  ayuda: "¿No sabes cuál necesitas?",
  ayudaCta: "Agenda y te decimos en 30 minutos.",
};

export const faq = {
  titulo: "Preguntas frecuentes",
  subtitulo: "Lo que casi todos nos preguntan antes de agendar.",
  items: [
    {
      p: "¿De verdad está lista en 5 días?",
      r: "Sí. Son 5 días hábiles desde que apruebas la propuesta y nos mandas tus textos, tu logo y tus fotos.",
    },
    {
      p: "¿Qué tengo que tener listo?",
      r: "Tus textos, tu logo y fotos de tu negocio o de tus productos.",
    },
    {
      p: "¿Por qué el precio dice “desde”?",
      r: "Porque depende del tamaño. La página incluye 5 secciones; la tienda depende de cuántos productos y categorías tengas. En la reunión te damos el precio exacto.",
    },
    {
      p: "¿Qué significa la garantía de velocidad?",
      r: "Medimos tu página en celular con la herramienta de Google (PageSpeed). Si no saca 90 o más, la seguimos ajustando sin costo hasta que lo logre.",
    },
    {
      p: "¿Qué pasa después de la entrega?",
      r: "Te enseñamos a usar todo. Si quieres que sigamos cuidando tu página, tienes el mantenimiento opcional: 15 % del valor del proyecto al mes.",
    },
    {
      p: "¿Trabajan con negocios fuera de Colombia?",
      r: "Sí. Por ejemplo, hicimos la landing de Boost Your Menu, en New Jersey.",
    },
    {
      p: "¿Por qué solo 3 proyectos al mes?",
      r: "Porque así cumplimos los 5 días sin bajar la calidad.",
    },
    {
      p: "¿Puedo pagar por partes?",
      r: "Sí. Pagas el 50 % para arrancar y el otro 50 % cuando te entregamos.",
    },
    {
      p: "¿La reunión tiene costo?",
      r: "No. Son 30 minutos y sales con el paquete y el precio para tu caso.",
    },
  ],
};

export const ctaFinal = {
  titulo: "Este mes tomamos 3 proyectos nuevos.",
  texto: "Agenda tu reunión y separa tu cupo. En 30 minutos sabes qué necesitas y cuánto cuesta.",
  boton: "Agendar reunión",
  nota: "30 minutos, sin costo",
};

export const footer = {
  frase: "Páginas, catálogos y sistemas para negocios que quieren clientes por internet.",
  columnas: [
    {
      titulo: "Servicios",
      links: [
        { label: "Páginas que venden", href: "/paginas-web" },
        { label: "Catálogos y sistemas", href: "/catalogos-y-sistemas" },
        { label: "Precios", href: PRECIOS },
      ],
    },
    {
      titulo: "Arata San",
      links: [
        { label: "Portafolio", href: "/portafolio" },
        { label: "Agendar reunión", href: AGENDAR },
        { label: "Auditoría gratis", href: AGENDAR },
      ],
    },
    {
      titulo: "Contacto",
      links: [
        { label: "WhatsApp", href: site.whatsapp },
        { label: "Instagram", href: site.instagram },
      ],
    },
    {
      titulo: "Legal",
      links: [{ label: "Política de datos", href: "/privacidad" }],
    },
  ],
  cierre: "Bogotá, Colombia",
};

export const menu = {
  servicios: [
    {
      titulo: "Páginas que venden",
      texto: "Tu página lista en 5 días, desde 400 USD.",
      href: "/paginas-web",
    },
    {
      titulo: "Catálogos y sistemas",
      texto: "Tienda por WhatsApp y sistemas a tu medida.",
      href: "/catalogos-y-sistemas",
    },
    {
      titulo: "Portafolio",
      texto: "Trabajos reales, negocios reales.",
      href: "/portafolio",
    },
  ],
  links: [
    { label: "Portafolio", href: "/portafolio" },
    { label: "Precios", href: PRECIOS },
  ],
  cta: "Agendar reunión",
};
