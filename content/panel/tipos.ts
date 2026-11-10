// Tipos del panel del cliente (docs/panel-cliente/02-modelo-de-datos.md).
// Son el CONTRATO entre la interfaz y la fuente de datos: hoy los llena
// `content/panel/demo.ts`; mañana, Supabase (mismas formas, mismas claves).

/** Negocio dueño del panel. Una fila por cliente de Arata San. */
export type Negocio = {
  id: string;
  nombre: string;
  /** Cómo saludar en el panel ("Hola, Rosa"). */
  contacto: string;
  rubro: string;
  ciudad: string;
  sitio: string; // URL pública
  instagram: string; // @usuario
  whatsapp: string; // solo dígitos con indicativo, ej. 573001234567
  plan: string;
  /** true mientras el panel muestra datos de ejemplo. */
  demo: boolean;
};

/** Métricas de un día. Todo el dashboard se calcula sumando días. */
export type DiaMetricas = {
  fecha: string; // AAAA-MM-DD
  ventas: number; // COP
  pedidos: number;
  visitas: number; // sesiones del sitio (GA4)
  clicsWhatsapp: number; // evento `clic_whatsapp` (GA4)
  igVisualizaciones: number; // Instagram Graph API: views
  igAlcance: number; // reach
  igInteracciones: number; // total_interactions
  igSeguidoresNuevos: number; // follower_count (delta)
};

export type Periodo = 7 | 30 | 90;

export type FuenteVisitas = { fuente: string; visitas: number };
export type ProductoTop = { nombre: string; unidades: number; ventas: number };

export type Venta = {
  id: string;
  cliente: string;
  producto: string;
  valor: number;
  fecha: string; // ISO
  canal: "WhatsApp" | "Página" | "Instagram" | "Local";
};

// ── Clientes (CRM) ───────────────────────────────────────────────
export type EstadoCliente = "nuevo" | "activo" | "recurrente" | "inactivo";
export type OrigenCliente = "Instagram" | "Google" | "WhatsApp" | "Referido" | "Página";

export type Cliente = {
  id: string;
  nombre: string;
  telefono: string;
  correo?: string;
  ciudad: string;
  estado: EstadoCliente;
  origen: OrigenCliente;
  compras: number;
  totalComprado: number; // COP
  ultimaCompra: string | null; // AAAA-MM-DD
  notas?: string;
  creado: string; // AAAA-MM-DD
};

// ── Proyectos (tablero tipo to-do) ───────────────────────────────
export type FaseProyecto = "por-hacer" | "diseno" | "construccion" | "revision" | "entregado";
export type Prioridad = "alta" | "media" | "baja";

export type Tarea = { id: string; texto: string; hecha: boolean };

export type Proyecto = {
  id: string;
  titulo: string;
  descripcion: string;
  fase: FaseProyecto;
  /** Quién tiene la pelota: Arata San o el equipo del cliente. */
  responsable: "Arata San" | "Tu equipo";
  prioridad: Prioridad;
  fechaLimite: string; // AAAA-MM-DD
  tareas: Tarea[];
};

// ── Configuración del sitio ──────────────────────────────────────
export type BotonSitio = {
  id: string;
  ubicacion: string; // "Portada · principal", "Menú", …
  texto: string;
  enlace: string;
  estilo: "principal" | "secundario";
};

export type ConfigSitio = {
  seo: { titulo: string; descripcion: string };
  portada: { titulo: string; subtitulo: string };
  anuncio: { activo: boolean; texto: string };
  botones: BotonSitio[];
  /** Fecha ISO del último guardado (null = nunca). */
  actualizado: string | null;
};
