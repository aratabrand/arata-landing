import type {
  Cliente,
  ConfigSitio,
  DiaMetricas,
  FuenteVisitas,
  Negocio,
  ProductoTop,
  Proyecto,
  Venta,
} from "./tipos";

// Datos de EJEMPLO del panel del cliente. Negocio ficticio: no son métricas reales
// de nadie (regla "nada inventado": el panel lo dice en pantalla con `negocio.demo`).
// Para un cliente real, esta capa se reemplaza por lib/panel/datos.ts → Supabase,
// sin tocar la interfaz (docs/panel-cliente/04-construccion.md §3).

export const negocio: Negocio = {
  id: "demo-panaderia",
  nombre: "Panadería La Espiga",
  contacto: "Rosa",
  rubro: "Panadería y pastelería",
  ciudad: "Bogotá",
  sitio: "https://ejemplo.aratasan.com",
  instagram: "@laespiga.ejemplo",
  whatsapp: "573000000000",
  plan: "Catálogo + mantenimiento",
  demo: true,
};

/** "Hoy" fijo para que el ejemplo se vea igual en el servidor y en el navegador. */
export const HOY = "2026-11-10";

// Generador pseudoaleatorio con semilla (mismos números siempre → sin saltos al hidratar).
function semilla(n: number) {
  let s = n;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function fechaMenos(dias: number) {
  const d = new Date(`${HOY}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - dias);
  return d.toISOString().slice(0, 10);
}

/** 180 días: 90 para mostrar + 90 para comparar con el periodo anterior. */
export const dias: DiaMetricas[] = (() => {
  const r = semilla(7);
  const out: DiaMetricas[] = [];
  for (let i = 179; i >= 0; i--) {
    const fecha = fechaMenos(i);
    const dow = new Date(`${fecha}T12:00:00Z`).getUTCDay(); // 0 domingo
    const finde = dow === 0 || dow === 6 ? 1.35 : 1;
    const tendencia = 1 + (179 - i) / 260; // el negocio crece con la página
    const ruido = 0.8 + r() * 0.4;
    const visitas = Math.round(140 * tendencia * finde * ruido);
    const clicsWhatsapp = Math.round(visitas * (0.085 + r() * 0.03));
    const pedidos = Math.max(1, Math.round(clicsWhatsapp * (0.42 + r() * 0.12)));
    const ticket = 38000 + r() * 22000;
    const igVisualizaciones = Math.round(2100 * tendencia * (0.7 + r() * 0.7) * (dow === 5 ? 1.5 : 1));
    out.push({
      fecha,
      ventas: Math.round((pedidos * ticket) / 100) * 100,
      pedidos,
      visitas,
      clicsWhatsapp,
      igVisualizaciones,
      igAlcance: Math.round(igVisualizaciones * (0.52 + r() * 0.1)),
      igInteracciones: Math.round(igVisualizaciones * (0.045 + r() * 0.02)),
      igSeguidoresNuevos: Math.round(6 * tendencia + r() * 9),
    });
  }
  return out;
})();

/** Reparto de visitas por fuente (últimos 30 días). */
export const fuentes: FuenteVisitas[] = [
  { fuente: "Instagram", visitas: 2140 },
  { fuente: "Google", visitas: 1610 },
  { fuente: "Directo", visitas: 720 },
  { fuente: "WhatsApp", visitas: 455 },
  { fuente: "Facebook", visitas: 180 },
];

export const productosTop: ProductoTop[] = [
  { nombre: "Torta de chocolate (libra)", unidades: 86, ventas: 3870000 },
  { nombre: "Ancheta de desayuno", unidades: 54, ventas: 3240000 },
  { nombre: "Pan de masa madre", unidades: 212, ventas: 2544000 },
  { nombre: "Caja de 12 almojábanas", unidades: 98, ventas: 1960000 },
  { nombre: "Cheesecake de maracuyá", unidades: 31, ventas: 1395000 },
];

export const ventasRecientes: Venta[] = [
  { id: "v-1048", cliente: "Camila Rojas", producto: "Ancheta de desayuno", valor: 62000, fecha: "2026-11-10T09:42:00-05:00", canal: "WhatsApp" },
  { id: "v-1047", cliente: "Julián Pardo", producto: "Torta de chocolate (2 lb)", valor: 90000, fecha: "2026-11-10T08:15:00-05:00", canal: "Página" },
  { id: "v-1046", cliente: "Natalia Gómez", producto: "Caja de 12 almojábanas", valor: 20000, fecha: "2026-11-09T18:30:00-05:00", canal: "Instagram" },
  { id: "v-1045", cliente: "Andrés Villamil", producto: "Pan de masa madre x2", valor: 24000, fecha: "2026-11-09T16:02:00-05:00", canal: "Local" },
  { id: "v-1044", cliente: "Laura Méndez", producto: "Cheesecake de maracuyá", valor: 45000, fecha: "2026-11-09T11:20:00-05:00", canal: "WhatsApp" },
];

export const clientes: Cliente[] = [
  { id: "c-01", nombre: "Camila Rojas", telefono: "3001112233", correo: "camila@ejemplo.com", ciudad: "Bogotá", estado: "recurrente", origen: "Instagram", compras: 9, totalComprado: 486000, ultimaCompra: "2026-11-10", notas: "Pide ancheta para la oficina cada mes.", creado: "2026-06-02" },
  { id: "c-02", nombre: "Julián Pardo", telefono: "3102223344", ciudad: "Bogotá", estado: "activo", origen: "Google", compras: 3, totalComprado: 214000, ultimaCompra: "2026-11-10", creado: "2026-08-19" },
  { id: "c-03", nombre: "Natalia Gómez", telefono: "3153334455", correo: "nata.gomez@ejemplo.com", ciudad: "Chía", estado: "nuevo", origen: "Instagram", compras: 1, totalComprado: 20000, ultimaCompra: "2026-11-09", creado: "2026-11-09" },
  { id: "c-04", nombre: "Andrés Villamil", telefono: "3204445566", ciudad: "Bogotá", estado: "recurrente", origen: "Referido", compras: 14, totalComprado: 392000, ultimaCompra: "2026-11-09", notas: "Cliente del local. Prefiere pan sin semillas.", creado: "2026-05-11" },
  { id: "c-05", nombre: "Laura Méndez", telefono: "3015556677", ciudad: "Cota", estado: "activo", origen: "WhatsApp", compras: 4, totalComprado: 231000, ultimaCompra: "2026-11-09", creado: "2026-07-23" },
  { id: "c-06", nombre: "Felipe Castaño", telefono: "3126667788", correo: "felipe.c@ejemplo.com", ciudad: "Bogotá", estado: "inactivo", origen: "Página", compras: 2, totalComprado: 118000, ultimaCompra: "2026-08-14", notas: "No ha vuelto desde agosto. Mandar cupón.", creado: "2026-07-30" },
  { id: "c-07", nombre: "Valentina Ríos", telefono: "3187778899", ciudad: "Bogotá", estado: "nuevo", origen: "Google", compras: 1, totalComprado: 45000, ultimaCompra: "2026-11-07", creado: "2026-11-07" },
  { id: "c-08", nombre: "Sebastián Ortiz", telefono: "3008889900", ciudad: "Soacha", estado: "activo", origen: "Instagram", compras: 5, totalComprado: 297000, ultimaCompra: "2026-10-30", creado: "2026-06-28" },
  { id: "c-09", nombre: "Daniela Herrera", telefono: "3119990011", correo: "dani.h@ejemplo.com", ciudad: "Bogotá", estado: "recurrente", origen: "Página", compras: 11, totalComprado: 640000, ultimaCompra: "2026-11-05", notas: "Tortas de cumpleaños para sus hijos.", creado: "2026-04-15" },
  { id: "c-10", nombre: "Mauricio León", telefono: "3140001122", ciudad: "Bogotá", estado: "inactivo", origen: "WhatsApp", compras: 1, totalComprado: 36000, ultimaCompra: "2026-07-02", creado: "2026-07-02" },
];

export const proyectos: Proyecto[] = [
  {
    id: "p-01",
    titulo: "Catálogo con pedidos por WhatsApp",
    descripcion: "Catálogo de 40 productos con carrito que arma el pedido y lo manda al WhatsApp del negocio.",
    fase: "entregado",
    responsable: "Arata San",
    prioridad: "alta",
    fechaLimite: "2026-10-20",
    tareas: [
      { id: "t1", texto: "Fotos y precios de los productos", hecha: true },
      { id: "t2", texto: "Diseño en celular aprobado", hecha: true },
      { id: "t3", texto: "Carrito y mensaje de WhatsApp", hecha: true },
      { id: "t4", texto: "Publicar en el dominio", hecha: true },
    ],
  },
  {
    id: "p-02",
    titulo: "Sección de tortas personalizadas",
    descripcion: "Formulario para pedir tortas por encargo: sabor, tamaño, fecha y foto de referencia.",
    fase: "construccion",
    responsable: "Arata San",
    prioridad: "alta",
    fechaLimite: "2026-11-14",
    tareas: [
      { id: "t1", texto: "Definir sabores y tamaños", hecha: true },
      { id: "t2", texto: "Diseño del formulario", hecha: true },
      { id: "t3", texto: "Subida de foto de referencia", hecha: false },
      { id: "t4", texto: "Aviso al WhatsApp del negocio", hecha: false },
    ],
  },
  {
    id: "p-03",
    titulo: "Fotos nuevas de temporada navideña",
    descripcion: "Fotos de las anchetas y tortas de diciembre para la página y para Instagram.",
    fase: "por-hacer",
    responsable: "Tu equipo",
    prioridad: "media",
    fechaLimite: "2026-11-25",
    tareas: [
      { id: "t1", texto: "Escoger 8 productos de temporada", hecha: false },
      { id: "t2", texto: "Enviar fotos a Arata San", hecha: false },
    ],
  },
  {
    id: "p-04",
    titulo: "Agente de WhatsApp para responder precios",
    descripcion: "Respuestas automáticas a las preguntas más comunes: precios, horarios y domicilios.",
    fase: "diseno",
    responsable: "Arata San",
    prioridad: "media",
    fechaLimite: "2026-12-05",
    tareas: [
      { id: "t1", texto: "Lista de preguntas frecuentes", hecha: true },
      { id: "t2", texto: "Guion de respuestas", hecha: false },
      { id: "t3", texto: "Pruebas con el equipo", hecha: false },
    ],
  },
  {
    id: "p-05",
    titulo: "Textos de la página de domicilios",
    descripcion: "Zonas, horarios y costo del domicilio. Lo revisa Rosa antes de publicar.",
    fase: "revision",
    responsable: "Tu equipo",
    prioridad: "baja",
    fechaLimite: "2026-11-12",
    tareas: [
      { id: "t1", texto: "Borrador de textos", hecha: true },
      { id: "t2", texto: "Revisión de Rosa", hecha: false },
    ],
  },
];

export const configSitio: ConfigSitio = {
  seo: {
    titulo: "Panadería La Espiga · Pan y tortas a domicilio en Bogotá",
    descripcion: "Pan de masa madre, tortas y anchetas hechas cada mañana. Pide por WhatsApp y te llega a la casa en Bogotá, Chía y Cota.",
  },
  portada: {
    titulo: "Pan recién horneado, en tu puerta antes de las 9",
    subtitulo: "Pide por WhatsApp en dos minutos. Domicilios en Bogotá, Chía y Cota.",
  },
  anuncio: { activo: true, texto: "Ya puedes encargar tus anchetas de Navidad" },
  botones: [
    { id: "b-1", ubicacion: "Portada · principal", texto: "Pedir por WhatsApp", enlace: "https://wa.me/573000000000", estilo: "principal" },
    { id: "b-2", ubicacion: "Portada · secundario", texto: "Ver el catálogo", enlace: "/catalogo", estilo: "secundario" },
    { id: "b-3", ubicacion: "Menú", texto: "Hacer pedido", enlace: "https://wa.me/573000000000", estilo: "principal" },
  ],
  actualizado: null,
};
