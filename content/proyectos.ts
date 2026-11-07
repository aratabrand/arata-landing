// Portafolio — fuente de datos de tarjetas y casos de estudio.
// Texto aprobado en docs/blueprint/03-copy.md (D-052) a partir de docs/portafolio.md.
// Regla: solo resultados reales. Si no hay cifra, no se inventa.

export type TipoProyecto = "Página" | "Catálogo" | "Sistema";

export type VideoProyecto = {
  mp4: string; // H.264
  webm?: string;
  poster: string; // WebP
};

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
  // Color de acento solo para la vista previa provisional (hasta tener video)
  acento: string;
  video?: VideoProyecto; // D-026: video en loop, se agrega cuando exista
};

export const proyectos: Proyecto[] = [
  {
    slug: "danrodedm",
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
  },
  {
    slug: "boost-your-menu",
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
    resultado: undefined, // ◻ falta el dato
    acento: "#B6FF00",
  },
  {
    slug: "arata-print",
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
  },
  {
    slug: "caravana",
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
  },
];
