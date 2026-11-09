// Contenido de las páginas de servicio (Fase 4).
// Copy APROBADO en docs/blueprint/03-copy.md (D-049, D-050, D-051). Para cambiar un
// texto, se cambia aquí y en 03-copy.md, no en los componentes.
import { precios } from "./inicio";

export type Incluye = { icono: string; titulo: string; texto: string };

/* ── Páginas que venden — /paginas-web ─────────────────────────────────── */
export const paginasWeb = {
  meta: {
    title: "Páginas que venden · Lista en 5 días desde 400 USD · Arata San",
    description:
      "Una página diseñada primero para el celular, rápida y lista para Google. Lista en 5 días hábiles, desde 400 USD, con garantía de velocidad.",
  },
  hero: {
    etiqueta: "Página Lista en 5 Días",
    titulo: "Una página que trabaja por ti, lista en 5 días.",
    texto: "Diseñada primero para el celular, rápida y lista para que te encuentren en Google. Desde 400 USD.",
    cta: "Agenda tu reunión gratis",
    ctaSecundario: "Ver trabajos",
    casos: ["boost-your-menu", "danrodedm"],
  },
  paraQuien: {
    titulo: "Es para ti si…",
    items: [
      "Tu negocio vive del voz a voz o de Instagram y quieres que te encuentren en internet.",
      "Tienes una página vieja que se ve mal en el celular.",
      "Necesitas que la gente te escriba o agende, no solo que mire.",
      "Vendes fuera de Colombia y necesitas una página en inglés.",
    ],
  },
  incluye: {
    titulo: "Todo lo que trae tu página",
    items: [
      { icono: "secciones", titulo: "5 secciones", texto: "Las partes que tu negocio necesita para explicar qué haces y llevar a la gente a escribirte." },
      { icono: "celular", titulo: "Hecha primero para el celular", texto: "Porque es donde te van a ver tus clientes." },
      { icono: "velocidad", titulo: "Velocidad garantizada", texto: "90 o más en la medición de Google. Si no lo logra, la seguimos ajustando gratis." },
      { icono: "google", titulo: "Lista para Google y la IA", texto: "Configuración para Google, tu perfil de Google Business y para que la IA encuentre tu página." },
      { icono: "dominio", titulo: "Dominio y hosting", texto: "El primer año va por nuestra cuenta." },
      { icono: "ajustes", titulo: "2 rondas de ajustes", texto: "Para que quede como la quieres." },
      { icono: "capacitacion", titulo: "Capacitación", texto: "Te enseñamos a manejarla." },
      { icono: "entrega", titulo: "Entrega en 5 días hábiles", texto: "Desde que apruebas y nos mandas tus textos, tu logo y tus fotos." },
    ] satisfies Incluye[],
  },
  panel: {
    etiqueta: "Adicional",
    titulo: "Maneja tu página tú mismo.",
    texto:
      "Un panel para cambiar textos y fotos sin depender de nadie, y ver las métricas de tu negocio. Lo cotizamos según las funciones que necesites.",
  },
  casos: {
    titulo: "Páginas que ya están trabajando",
    boton: "Ver todo el portafolio",
    items: [
      { slug: "boost-your-menu", frase: "Una landing para vender menús digitales a restaurantes en New Jersey." },
      { slug: "danrodedm", frase: "De PDF interminables a un catálogo de maquinaria que lleva a agendar." },
    ],
  },
  necesitamos: {
    titulo: "Para entregarte en 5 días, necesitamos",
    items: [
      { titulo: "Tus textos", texto: "Qué haces, qué ofreces y cómo te contactan." },
      { titulo: "Tu logo", texto: "" },
      { titulo: "Fotos", texto: "De tu negocio, tus productos o tu trabajo." },
    ],
    nota: "Con esto listo, empieza a correr el plazo.",
  },
  dias: {
    titulo: "Cómo son los 5 días",
    items: [
      { marca: "1", titulo: "Día 1", texto: "Armamos la estructura de tus 5 secciones con tus textos." },
      { marca: "2–3", titulo: "Días 2 y 3", texto: "Diseñamos y construimos tu página, primero para el celular." },
      { marca: "4", titulo: "Día 4", texto: "Te la mostramos y hacemos los ajustes (2 rondas)." },
      { marca: "5", titulo: "Día 5", texto: "La publicamos, la medimos en Google y te enseñamos a usarla." },
    ],
  },
  precio: {
    paquete: "Página Lista en 5 Días",
    precio: "Desde 400 USD",
    pago: precios.pago,
    garantia: precios.garantia,
    mantenimiento: precios.mantenimiento,
    boton: "Agenda tu reunión gratis",
    tipo: "pagina",
  },
  faq: {
    titulo: "Preguntas frecuentes",
    items: [
      { p: "¿Qué son las 5 secciones?", r: "Son las partes de tu página: por ejemplo, inicio, qué ofreces, trabajos o productos, preguntas y contacto. Las definimos contigo en la reunión." },
      { p: "¿Tengo que escribir los textos?", r: "Sí. Tú nos mandas los textos de tu negocio y nosotros los organizamos en el diseño para que se lean fácil." },
      { p: "¿Y si necesito más de 5 secciones?", r: "Se puede. Te damos el precio en la propuesta." },
      { p: "¿Qué es el panel adicional?", r: "Un panel para que cambies textos y fotos tú mismo y veas las métricas de tu negocio. Lo cotizamos según las funciones que necesites." },
      { p: "¿Puedo pagar por partes?", r: "Sí: 50 % para arrancar y 50 % cuando te entregamos." },
      { p: "¿Incluye dominio y hosting?", r: "Sí, el primer año va incluido. Después lo renuevas tú o lo incluimos si tomas el mantenimiento." },
      { p: "¿Cuántos cambios puedo pedir?", r: "Dos rondas de ajustes dentro de los 5 días." },
    ],
  },
  cta: {
    titulo: "Tu página puede estar publicada en 5 días hábiles.",
    texto: "Este mes tomamos 3 proyectos nuevos. Agenda y separa tu cupo.",
    boton: "Agendar reunión",
    nota: "30 minutos, sin costo",
    href: "/agendar?tipo=pagina",
  },
};

/* ── Catálogos y sistemas a medida — /catalogos-y-sistemas ─────────────── */
export const catalogos = {
  meta: {
    title: "Catálogos y sistemas a medida · Tienda por WhatsApp en 5 días · Arata San",
    description:
      "Catálogo con carrito, inventario y un panel para manejar tu negocio desde el celular. Los pedidos te llegan al WhatsApp. Desde 800 USD, en 5 días hábiles.",
  },
  hero: {
    etiqueta: "Tienda por WhatsApp en 5 Días",
    titulo: "Tu tienda lista en 5 días. Los pedidos te llegan al WhatsApp.",
    texto: "Catálogo con carrito, inventario y un panel para manejar tu negocio desde el celular. Desde 800 USD.",
    cta: "Agenda tu reunión gratis",
    ctaSecundario: "Ver trabajos",
    casos: ["caravana", "arata-print"],
  },
  problema: {
    titulo: "Si vendes por WhatsApp, esto te suena",
    items: [
      { icono: "fotos", texto: "Mandas fotos y más fotos, y el cliente se pierde en la galería." },
      { icono: "pedidos", texto: "Los pedidos llegan desordenados y alguno se te pierde." },
      { icono: "datos", texto: "No sabes cuánto te queda en inventario." },
      { icono: "ventas", texto: "No sabes qué es lo que más te compran." },
    ],
  },
  tienda: {
    titulo: "Tu catálogo, listo para vender",
    items: [
      { icono: "carrito", titulo: "Catálogo con carrito", texto: "Tus clientes ven tus productos ordenados por categoría y arman su pedido." },
      { icono: "whatsapp", titulo: "Pedido directo a tu WhatsApp", texto: "El pedido te llega ordenado, con productos y cantidades." },
      { icono: "panel", titulo: "Panel para tu tienda", texto: "Manejas tus productos y tus pedidos desde el celular." },
      { icono: "inventario", titulo: "Inventario", texto: "Sabes cuánto tienes de cada producto." },
      { icono: "velocidad", titulo: "Velocidad garantizada", texto: "90 o más en la medición de Google, o la seguimos ajustando gratis." },
      { icono: "google", titulo: "Lista para Google y la IA", texto: "Configuración para Google, Google Business y la IA." },
      { icono: "dominio", titulo: "Dominio y hosting", texto: "El primer año va por nuestra cuenta." },
      { icono: "ajustes", titulo: "2 rondas de ajustes", texto: "Para que quede como la quieres." },
      { icono: "capacitacion", titulo: "Capacitación", texto: "Te enseñamos a usar todo, también a subir tus productos." },
      { icono: "entrega", titulo: "Entrega en 5 días hábiles", texto: "Desde que apruebas la propuesta. Tus productos los subes tú desde el panel." },
    ] satisfies Incluye[],
    precio: "Desde 800 USD",
    precioNota: "el precio depende del tamaño de tu tienda.",
    pago: "Paga por partes: 50 % para arrancar y 50 % al entregar.",
    boton: "Agenda tu reunión gratis",
  },
  sistema: {
    etiqueta: "Tu Negocio en Orden",
    titulo: "¿Necesitas algo más a tu medida?",
    intro: "Hacemos sistemas para cómo trabaja tu negocio:",
    items: [
      { titulo: "Reservas", texto: "tus clientes apartan su cita o su mesa solos." },
      { titulo: "Menú digital", texto: "tu carta en el celular de tus clientes." },
      { titulo: "Registro de clientes (CRM)", texto: "quién te compra, cuándo y qué." },
      { titulo: "O lo que tu negocio necesite", texto: "" },
    ],
    cierreFuerte: "Lo cotizamos contigo.",
    cierre: "En la reunión vemos qué necesitas y en 48 horas te mandamos la propuesta con precio y plazo.",
    boton: "Cuéntanos tu idea",
  },
  casos: {
    titulo: "Negocios que ya se organizaron",
    boton: "Ver todo el portafolio",
    items: [
      { slug: "caravana", frase: "De la galería de fotos a una tienda con inventario, pedidos, datos de venta y su equipo dentro del panel." },
      { slug: "arata-print", frase: "Del chat de WhatsApp a un catálogo con línea de producción de pedidos y datos de qué compran sus clientes." },
      { slug: "danrodedm", frase: "De PDF interminables a un catálogo de maquinaria organizado por línea." },
    ],
  },
  proceso: {
    titulo: "Cómo trabajamos",
    items: [
      { titulo: "Agendas una reunión", texto: "30 minutos. Nos cuentas cómo vendes hoy." },
      { titulo: "Te mandamos la propuesta", texto: "En 48 horas: paquete, precio y fecha de entrega." },
      { titulo: "Apruebas y arrancamos", texto: "Pagas el 50 % y nos mandas tu logo." },
      { titulo: "Te entregamos", texto: "Tu tienda en 5 días hábiles. Si es un sistema a medida, en el plazo de la propuesta." },
      { titulo: "Te enseñamos a usarlo", texto: "Capacitación incluida." },
    ],
  },
  faq: {
    titulo: "Preguntas frecuentes",
    items: [
      { p: "¿Cómo me llegan los pedidos?", r: "El cliente arma su pedido en el catálogo y te llega ordenado a tu WhatsApp, con productos y cantidades." },
      { p: "¿Puedo manejar el inventario yo mismo?", r: "Sí, desde tu panel, también en el celular." },
      { p: "¿Por qué el precio dice “desde”?", r: "Porque depende de cuántos productos y categorías tengas. En la reunión te damos el precio exacto." },
      { p: "¿Qué es “Tu Negocio en Orden”?", r: "Un sistema hecho para cómo trabaja tu negocio: reservas, menú digital, registro de clientes (CRM) u otro. Lo cotizamos contigo." },
      { p: "¿Puedo pagar por partes?", r: "Sí: 50 % para arrancar y 50 % cuando te entregamos." },
      { p: "¿Quién sube los productos?", r: "Tú, desde tu panel. Te enseñamos a hacerlo en la capacitación." },
      { p: "¿Mis clientes pueden pagar en línea?", r: "Por ahora no. El cliente arma su pedido, te llega por WhatsApp y el pago lo coordinas tú directamente." },
      // ◻ "¿Cuántos productos caben?" se agrega cuando Sergio confirme el límite (03-copy.md).
    ],
  },
  cta: {
    titulo: "Ordena tu negocio este mes.",
    texto: "Tomamos 3 proyectos nuevos al mes. Agenda y te decimos en 30 minutos qué necesitas y cuánto cuesta.",
    boton: "Agendar reunión",
    nota: "30 minutos, sin costo",
    href: "/agendar?tipo=catalogo",
  },
};
