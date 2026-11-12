// Tipos de Finanzas y Equipo (solo Arata San, D-109). Todo en COP, sin decimales.
// docs/panel-cliente/06-finanzas.md

import type { FinTarea } from "./procesos";

export const EMPRESA = "empresa" as const;

export type Persona = {
  id: string;
  nombre: string;
  area: string;
  esSocio: boolean;
  usuarioId: string | null;
  activo: boolean;
};

/** Valor de un día de trabajo por defecto (COP). Un día = 8 horas. */
export const TARIFA_DIA_INICIAL = 80_000;
export const HORAS_POR_DIA = 8;

/**
 * Reglas del reparto (D-118). Se congelan al cerrar un proyecto.
 * - `tarifaDia`: valor de un día de trabajo.
 * - `partes`: quiénes reciben parte igual de lo que queda (ids de persona + "empresa").
 */
export type ReglasReparto = { tarifaDia: number; partes: string[] };

export type FinConfig = {
  /** Valor del día por defecto (solo Sergio lo cambia). */
  tarifaDia: number;
  /** Meses de gastos fijos que la empresa guarda como reserva antes de invertir. */
  reservaMeses: number;
  actualizado: string | null;
};

/** Actividades para registrar quién hizo qué. */
export const actividades = ["Estrategia", "Diseño", "Desarrollo", "Contenido", "Comercial", "Gestión del proyecto", "Otra"] as const;

export type EstadoProyecto = "propuesta" | "en-curso" | "cerrado";

export type FinProyecto = {
  id: string;
  nombre: string;
  /** Cliente y servicio salen de sus tablas (no texto libre, D-110). */
  clienteId: string | null;
  servicioId: string | null;
  estado: EstadoProyecto;
  valor: number;
  fechaCierre: string | null; // AAAA-MM-DD
  fechaInicio: string | null;
  /** Fecha prometida de entrega. */
  fechaLimite: string | null;
  /** Valor del día solo para este proyecto (null = el de Reparto). Solo Sergio lo cambia. */
  tarifaDia: number | null;
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

/** Días trabajados por una persona en una actividad de un proyecto (1 día = 8 horas). */
export type RegistroTrabajo = {
  id: string;
  proyectoId: string;
  personaId: string;
  actividad: string;
  dias: number;
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
  /** Sergio (dueño) y Andrés (finanzas) editan los números. */
  puedeEditar: boolean;
  /** Solo Sergio: valor del día y personas del equipo. */
  esDueno: boolean;
  /** Cualquier miembro del equipo puede marcar pasos de los proyectos (D-113). */
  puedeMarcarPasos: boolean;
  /** Persona del equipo de quien mira (para resaltar "lo tuyo"). */
  miPersonaId: string | null;
  demo: boolean;
  personas: Persona[];
  config: FinConfig;
  proyectos: FinProyecto[];
  gastos: Gasto[];
  trabajo: RegistroTrabajo[];
  gastosFijos: GastoFijo[];
  servicios: Servicio[];
  clientes: ClienteRef[];
  /** Pasos del proceso de entrega de cada proyecto (D-112). */
  tareas: FinTarea[];
};
