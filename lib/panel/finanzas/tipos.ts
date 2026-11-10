// Tipos de Finanzas y Equipo (solo Arata San, D-108). Todo en COP, sin decimales.
// docs/panel-cliente/06-finanzas.md

export const EMPRESA = "empresa" as const;

export type Persona = {
  id: string;
  nombre: string;
  area: string;
  esSocio: boolean;
  usuarioId: string | null;
  activo: boolean;
};

/** Un % del reparto de socios. `beneficiario` = id de persona o "empresa". */
export type PartReparto = { beneficiario: string; pct: number };

export type ReglasReparto = {
  /** % de la ganancia que va a la bolsa de trabajo (se reparte por horas). */
  bolsaTrabajoPct: number;
  /** % del resto para cada socio y la empresa. Suma 100. */
  reparto: PartReparto[];
};

export type FinConfig = ReglasReparto & {
  /** Meses de gastos fijos que la empresa guarda como reserva antes de invertir. */
  reservaMeses: number;
  actualizado: string | null;
};

export type EstadoProyecto = "propuesta" | "en-curso" | "cerrado";

export type FinProyecto = {
  id: string;
  nombre: string;
  /** Cliente y servicio salen de sus tablas (no texto libre, D-109). */
  clienteId: string | null;
  servicioId: string | null;
  estado: EstadoProyecto;
  valor: number;
  fechaCierre: string | null; // AAAA-MM-DD
  /** Reglas con las que se cerró. null = usa las actuales (aún no cerrado). */
  repartoCongelado: ReglasReparto | null;
  notas: string | null;
};

export const categoriasGasto = [
  { valor: "herramientas", label: "Herramientas y licencias" },
  { valor: "publicidad", label: "Publicidad" },
  { valor: "hosting-dominio", label: "Hosting y dominio" },
  { valor: "freelance", label: "Freelance externo" },
  { valor: "transporte", label: "Transporte" },
  { valor: "impuestos", label: "Impuestos" },
  { valor: "inversion", label: "Inversión" },
  { valor: "otros", label: "Otros" },
] as const;
export type CategoriaGasto = (typeof categoriasGasto)[number]["valor"];

export type Gasto = {
  id: string;
  /** null = gasto de la empresa (no de un proyecto). */
  proyectoId: string | null;
  concepto: string;
  categoria: CategoriaGasto;
  valor: number;
  fecha: string;
};

export type RegistroHoras = {
  id: string;
  proyectoId: string;
  personaId: string;
  area: string;
  horas: number;
  fecha: string;
  nota: string | null;
};

export type GastoFijo = { id: string; concepto: string; valorMensual: number; activo: boolean };

export const categoriasServicio = [
  { valor: "pagina-web", label: "Página web" },
  { valor: "catalogo", label: "Catálogo" },
  { valor: "sistema", label: "Sistema a medida" },
  { valor: "mantenimiento", label: "Mantenimiento" },
  { valor: "otro", label: "Otro" },
] as const;
export type CategoriaServicio = (typeof categoriasServicio)[number]["valor"];

export type Servicio = { id: string; nombre: string; categoria: CategoriaServicio; activo: boolean };

/** Cliente para elegir en una lista (los datos completos están en el módulo Clientes). */
export type ClienteRef = { id: string; nombre: string; empresa: string | null };

/** "Empresa · Contacto" o solo el nombre. */
export const nombreCliente = (c: ClienteRef | undefined | null) => (!c ? "Sin cliente" : c.empresa ? `${c.empresa} · ${c.nombre}` : c.nombre);

/** Todo lo que necesita la sección de finanzas. */
export type DatosFinanzas = {
  negocioId: string;
  puedeEditar: boolean;
  /** Persona del equipo de quien mira (para resaltar "lo tuyo"). */
  miPersonaId: string | null;
  demo: boolean;
  personas: Persona[];
  config: FinConfig;
  proyectos: FinProyecto[];
  gastos: Gasto[];
  horas: RegistroHoras[];
  gastosFijos: GastoFijo[];
  servicios: Servicio[];
  clientes: ClienteRef[];
};
