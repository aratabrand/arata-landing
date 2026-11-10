// Portafolio — fuente de datos de tarjetas y casos de estudio.
// Texto aprobado en docs/blueprint/03-copy.md (D-052) a partir de docs/portafolio.md.
// Regla: solo resultados reales. Si no hay cifra, no se inventa.

export type TipoProyecto = "Página" | "Catálogo" | "Sistema";

export type VideoProyecto = {
  mp4: string; // H.264
  webm?: string;
  poster: string; // WebP
};

export type Puntajes = {
  /** seo = null si el sitio aún está en un dominio de prueba cerrado a Google (noindex): ese número no dice nada. */
  celular: { rendimiento: number; accesibilidad: number; buenasPracticas: number; seo: number | null };
  escritorio: { rendimiento: number };
  /** Tiempo en que se ve lo principal en celular (LCP), ej. "2,1 s". */
  abreEnCelular: string;
  fecha: string;
  /**
   * "todo" = se publican todos los números.
   * "fuerte" = D-082: la velocidad en celular está debajo de la garantía de 90 → no se muestra
   * (ni el tiempo en celular) hasta optimizar ese sitio; sí SEO, buenas prácticas, accesibilidad y computador.
   */
  mostrar: "todo" | "fuerte";
};

/** Datos del cliente que van arriba en el caso (Sector · Ciudad · Servicios · Duración). Vacío = no se muestra. */
export type Ficha = { sector: string; ciudad?: string; servicios: string; duracion?: string };

/** Paso del proceso real de un proyecto (si no hay, se muestra el proceso estándar de su servicio). */
export type PasoProyecto = { titulo: string; texto: string; marca?: string };

// Medición real: Lighthouse 12.6 móvil (3 corridas, mediana) y escritorio (2 corridas), 9 nov 2026.
const FECHA_MEDICION = "noviembre de 2026";

export type Proyecto = {
  slug: string;
  nombre: string;
  tipos: TipoProyecto[];
  etiqueta: string; // texto corto que va sobre el título del caso
  frase: string; // frase de la tarjeta
  titulo: string; // H1 del caso de estudio
  url: string;
  problema: string;
  solucion: string;
  funciones: string[];
  resultado?: string; // undefined = falta el dato (no se inventa)
  /** Si no hay resultado medido: qué hace la página (03-copy.md, "Qué logra la página"). */
  logra?: string;
  /** Puntajes de Google (Lighthouse, la medición detrás de PageSpeed) del sitio en vivo. Datos reales medidos. */
  puntajes?: Puntajes;
  ficha: Ficha;
  /** Proceso real del proyecto (lo cuenta Sergio). Sin esto, va el proceso estándar del servicio. */
  proceso?: PasoProyecto[];
  /** Qué preguntas frecuentes muestra el caso: las de páginas o las de catálogos y sistemas. */
  servicio: "pagina" | "catalogo";
  // Color de acento solo para la vista previa provisional (hasta tener video)
  acento: string;
  video?: VideoProyecto; // D-026: video en loop, se agrega cuando exista
  // Capturas reales del sitio (WebP 1280×800) en public/portafolio/capturas/
  capturas: { src: string; alt: string }[];
};

export const proyectos: Proyecto[] = [
  {
    slug: "danrodedm",
    // Datos de Sergio (9 nov 2026). Pasos: redacción de Claude a partir de su relato, aprobada (D-100)
    ficha: { sector: "Maquinaria de electroerosión", ciudad: "Bogotá", servicios: "Página con catálogo", duracion: "5 días" },
    proceso: [
      { titulo: "Investigación", texto: "Recogimos la información del negocio y de sus máquinas." },
      { titulo: "El problema principal", texto: "Atacamos lo que más frenaba: los PDF interminables de fichas técnicas." },
      { titulo: "Propuesta para validar", texto: "Les mostramos el diseño y el recorrido de la página para que lo aprobaran." },
      { titulo: "Construcción", texto: "La hicimos para celular y computador, con lo básico de SEO y GEO, y optimizada para que abra rápido." },
      { titulo: "Entrega", texto: "Entregada en el plazo acordado: 5 días." },
    ],
    servicio: "pagina",
    puntajes: { celular: { rendimiento: 79, accesibilidad: 93, buenasPracticas: 96, seo: 100 }, escritorio: { rendimiento: 97 }, abreEnCelular: "5,2 s", fecha: FECHA_MEDICION, mostrar: "fuerte" },
    nombre: "Danrodedm",
    tipos: ["Catálogo"],
    etiqueta: "Catálogo · Maquinaria",
    frase: "De PDF interminables a un catálogo de maquinaria que lleva a agendar.",
    titulo: "De PDF interminables a un catálogo que lleva a agendar.",
    url: "https://danrodedm.com/",
    problema:
      "Danrodedm vende maquinaria de alto valor. Quien entraba a su página se encontraba con PDF interminables de fichas técnicas, y así era difícil interesarse por una máquina.",
    solucion:
      "Convertimos las fichas en un catálogo organizado por línea, con solo la información que importa para decidir y un botón claro para agendar una reunión de compra.",
    funciones: [
      "Catálogo organizado por línea de máquinas",
      "Ficha simple de cada máquina",
      "Botón para agendar reunión de compra",
    ],
    resultado:
      "Más interesados pasaron a pedir reunión, porque mirar las máquinas dejó de ser una barrera.",
    acento: "#7D53FF",
    capturas: [
      { src: "/portafolio/capturas/danrodedm-1.webp", alt: "Inicio de la página de Danrodedm, maquinaria de electroerosión" },
      { src: "/portafolio/capturas/danrodedm-2.webp", alt: "Sección de problemas de la página de Danrodedm" },
    ],
  },
  {
    slug: "boost-your-menu",
    // Datos de Sergio (9 nov 2026). Pasos: redacción de Claude a partir de su relato, aprobada (D-100)
    ficha: { sector: "Menús digitales para restaurantes", ciudad: "New Jersey, EE. UU.", servicios: "Página que vende (landing)", duracion: "3 días" },
    proceso: [
      { titulo: "Investigación", texto: "Revisamos su página anterior y la información del negocio." },
      { titulo: "Propuesta de rediseño", texto: "Planteamos un rediseño para explicar simple su oferta de software y hardware." },
      { titulo: "Validación", texto: "Les mostramos el diseño y el recorrido de la página para que lo aprobaran." },
      { titulo: "Construcción", texto: "La hicimos para celular y computador, con lo básico de SEO y GEO, y optimizada para que abra rápido." },
      { titulo: "Entrega", texto: "Lista en 3 días." },
    ],
    servicio: "pagina",
    puntajes: { celular: { rendimiento: 70, accesibilidad: 90, buenasPracticas: 96, seo: 100 }, escritorio: { rendimiento: 88 }, abreEnCelular: "5,3 s", fecha: FECHA_MEDICION, mostrar: "fuerte" },
    nombre: "Boost Your Menu",
    tipos: ["Página"],
    etiqueta: "Página · New Jersey, EE. UU.",
    frase: "Una landing para vender menús digitales en New Jersey.",
    titulo: "Una landing para vender menús digitales en New Jersey.",
    url: "https://boostyourmenu.com/",
    problema:
      "Boost Your Menu vende menús digitales a restaurantes en New Jersey. Necesitaba conseguir interesados y explicar una oferta que combina software y hardware.",
    solucion:
      "Una landing en inglés, con estructura sencilla: los restaurantes con los que ya trabajan, cómo es su método y cómo dan una experiencia completa con software y hardware.",
    funciones: [
      "Landing en inglés",
      "Restaurantes que ya confían en ellos",
      "Su método de trabajo, paso a paso",
      "La oferta de software + hardware explicada simple",
    ],
    resultado: undefined, // sin cifra: se muestra "Qué logra la página" (D-100)
    // copy aprobado (D-100): reemplaza "El resultado"; no se esperan cifras
    logra:
      "Explica de forma simple una oferta que junta software y hardware, muestra los restaurantes que ya confían en ellos y lleva a pedir una demo o a probar el menú interactivo.",
    acento: "#B6FF00",
    capturas: [
      { src: "/portafolio/capturas/boost-your-menu-1.webp", alt: "Inicio de la landing de Boost Your Menu, menús digitales para iPad" },
      { src: "/portafolio/capturas/boost-your-menu-2.webp", alt: "Sección de beneficios de la landing de Boost Your Menu" },
    ],
  },
  {
    slug: "arata-print",
    // Datos de Sergio (9 nov 2026). Pasos: redacción de Claude a partir de su relato, aprobada (D-100)
    ficha: { sector: "Camisetas estampadas bajo pedido", ciudad: "Bogotá", servicios: "Catálogo + sistema a medida", duracion: "5 días" },
    proceso: [
      { titulo: "Primero, el flujo", texto: "Antes de lo visual, definimos cómo debía funcionar la venta." },
      { titulo: "Orden en la venta", texto: "Resolvimos la venta desordenada por WhatsApp, que no dejaba medir nada." },
      { titulo: "El recorrido de compra", texto: "Diseñamos cómo compra el cliente, paso a paso, con buenas prácticas de uso." },
      { titulo: "Celular primero", texto: "Todo pensado para el celular, que es donde compran sus clientes." },
      { titulo: "Entrega", texto: "Listo en 5 días." },
    ],
    servicio: "catalogo",
    puntajes: { celular: { rendimiento: 96, accesibilidad: 98, buenasPracticas: 100, seo: null }, escritorio: { rendimiento: 100 }, abreEnCelular: "2,6 s", fecha: FECHA_MEDICION, mostrar: "todo" },
    nombre: "Arata Print",
    tipos: ["Catálogo", "Sistema"],
    etiqueta: "Catálogo · Sistema",
    frase: "Del chat de WhatsApp a un catálogo con los datos del negocio.",
    titulo: "Del chat de WhatsApp a un negocio con datos.",
    url: "https://arata-print.vercel.app/",
    problema:
      "Un emprendedor que vendía por WhatsApp. El negocio vivía en el chat: no había orden en los pedidos ni datos de qué compraban sus clientes.",
    solucion:
      "Un catálogo interactivo que el dueño maneja desde el celular, con una línea de producción de los pedidos y datos de lo que compran sus clientes.",
    funciones: [
      "Catálogo interactivo para sus clientes",
      "Línea de producción de los pedidos",
      "Datos de qué compran sus clientes",
      "Todo manejado desde el celular",
    ],
    resultado:
      "Ahora toma mejores decisiones sobre en qué invertir, y sus clientes compran más fácil.",
    acento: "#9B7BFF",
    capturas: [
      { src: "/portafolio/capturas/arata-print-1.webp", alt: "Inicio del catálogo de Arata Print, camisetas estampadas" },
      { src: "/portafolio/capturas/arata-print-2.webp", alt: "Productos nuevos en el catálogo de Arata Print" },
    ],
  },
  {
    slug: "caravana",
    // Datos de Sergio (9 nov 2026): "igual que Arata Print" (ciudad, duración y proceso). Pasos aprobados (D-100)
    ficha: { sector: "Tecnología y accesorios", ciudad: "Bogotá", servicios: "Catálogo + panel de tienda", duracion: "5 días" },
    proceso: [
      { titulo: "Primero, el flujo", texto: "Antes de lo visual, definimos cómo debía funcionar la venta." },
      { titulo: "Orden en la venta", texto: "Resolvimos la venta por WhatsApp con fotos y más fotos, que no dejaba medir nada." },
      { titulo: "El recorrido de compra", texto: "Diseñamos cómo compra el cliente, paso a paso, con buenas prácticas de uso." },
      { titulo: "Celular primero", texto: "Todo pensado para el celular, que es donde compran sus clientes." },
      { titulo: "Entrega", texto: "Lista en 5 días." },
    ],
    servicio: "catalogo",
    puntajes: { celular: { rendimiento: 99, accesibilidad: 98, buenasPracticas: 100, seo: null }, escritorio: { rendimiento: 100 }, abreEnCelular: "2,0 s", fecha: FECHA_MEDICION, mostrar: "todo" },
    nombre: "Caravana",
    tipos: ["Catálogo", "Sistema"],
    etiqueta: "Catálogo · Sistema · Tecnología",
    frase: "De la galería de fotos a una tienda con inventario y panel.",
    titulo: "De la galería de fotos a una tienda con panel.",
    url: "https://caravana-ruddy.vercel.app/",
    problema:
      "Muchos locales y emprendedores que venden tecnología no sabían cómo organizar su mercancía: mandaban fotos por WhatsApp en una galería sin fin.",
    solucion: "Un catálogo con los productos organizados y un panel para la tienda.",
    funciones: [
      "Catálogo de productos organizado",
      "Panel de la tienda con inventario y pedidos",
      "Tablero con los datos de venta",
      "Opción de agregar personas del equipo",
    ],
    resultado: "Toda la mercancía organizada y la operación de la tienda en un solo lugar.",
    acento: "#D3FF5C",
    capturas: [
      { src: "/portafolio/capturas/caravana-1.webp", alt: "Inicio de la tienda de Caravana, tecnología y gadgets" },
      { src: "/portafolio/capturas/caravana-2.webp", alt: "Productos y pasos para pedir en la tienda de Caravana" },
    ],
  },
];

/** Capturas de todos los proyectos intercaladas (una de cada uno, luego la segunda de cada uno). */
export function capturasIntercaladas() {
  const max = Math.max(...proyectos.map((p) => p.capturas.length));
  const out: { src: string; alt: string }[] = [];
  for (let i = 0; i < max; i++) for (const p of proyectos) if (p.capturas[i]) out.push(p.capturas[i]);
  return out;
}

/* ── Textos de /portafolio y de los casos (03-copy.md, D-052) ─────────── */
export const portafolioPagina = {
  meta: {
    title: "Portafolio · Páginas, catálogos y sistemas reales · Arata San",
    description:
      "Trabajos reales para negocios reales: Danrodedm, Boost Your Menu, Arata Print y Caravana. Mira qué problema resolvió cada proyecto.",
  },
  titulo: "Trabajos reales, negocios reales.",
  texto: "Cada proyecto resolvió un problema concreto de un negocio. Mira cómo.",
  filtros: ["Todos", "Páginas", "Catálogos", "Sistemas"] as const,
  cta: {
    titulo: "¿Quieres el tuyo?",
    texto: "Agenda tu reunión y en 30 minutos te decimos cómo lo haríamos para tu negocio.",
    boton: "Agendar reunión",
    nota: "30 minutos, sin costo",
  },
};

export const casoTextos = {
  verSitio: "Ver sitio en vivo",
  problema: "El problema",
  solucion: "Lo que hicimos",
  resultado: "El resultado",
  logra: "Qué logra la página",
  volver: "Volver al portafolio",
  // copy aprobado (D-100)
  ficha: { sector: "Sector", ciudad: "Ciudad", servicios: "Servicios", duracion: "Duración" },
  proceso: "Cómo fue el proceso",
  procesoEstandar: "Cómo trabajamos un proyecto así",
  faqPagina: "Preguntas sobre páginas como esta",
  faqCatalogo: "Preguntas sobre catálogos y sistemas",
  // copy aprobado (D-100)
  puntajes: {
    titulo: "Así sale en Google",
    texto: "Medimos el sitio en vivo con Lighthouse, la herramienta de Google que está detrás de PageSpeed.",
    celular: "En celular",
    escritorio: "En computador",
    rendimiento: "Velocidad",
    accesibilidad: "Accesibilidad",
    buenasPracticas: "Buenas prácticas",
    seo: "SEO",
    abre: "Se ve lo principal en",
    medido: "Medido en",
    sinSeo: "Este sitio aún está en un dominio de prueba, cerrado a Google; por eso no mostramos su SEO.",
  },
  siguiente: "Siguiente proyecto",
  cta: {
    titulo: "¿Tu negocio tiene un problema parecido?",
    texto: "Agenda y lo vemos juntos en 30 minutos.",
    boton: "Agendar reunión",
    nota: "30 minutos, sin costo",
  },
};

/** Filtro del portafolio → tipo de proyecto. */
export const filtroATipo: Record<string, TipoProyecto | null> = {
  Todos: null,
  Páginas: "Página",
  Catálogos: "Catálogo",
  Sistemas: "Sistema",
};
