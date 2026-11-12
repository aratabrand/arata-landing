import type { DatosFinanzas } from "./tipos";
import { plantillas } from "./procesos";

// Finanzas de EJEMPLO (modo sin conexión). Números ficticios, marcados en pantalla.
export function finanzasDemo(): DatosFinanzas {
  const personas = [
    { id: "d-sergio", nombre: "Sergio", area: "Estrategia y diseño", esSocio: true, usuarioId: null, activo: true },
    { id: "d-andres", nombre: "Andrés", area: "Comercial", esSocio: true, usuarioId: null, activo: true },
    { id: "d-santiago", nombre: "Santiago", area: "Tecnología", esSocio: true, usuarioId: null, activo: true },
  ];
  const reglas = { tarifaDia: 80_000, partes: ["d-sergio", "d-andres", "d-santiago", "empresa"] };
  return {
    negocioId: "demo",
    puedeEditar: false,
    esDueno: false,
    puedeMarcarPasos: false,
    miPersonaId: "d-sergio",
    demo: true,
    personas,
    config: { tarifaDia: 80_000, reservaMeses: 3, actualizado: null },
    proyectos: [
      { id: "dp-1", nombre: "Landing restaurante", clienteId: "dc-1", servicioId: "ds-1", estado: "cerrado", valor: 1_800_000, fechaCierre: "2026-09-18", fechaInicio: "2026-09-01", fechaLimite: "2026-09-18", tarifaDia: null, repartoCongelado: reglas, notas: null },
      { id: "dp-2", nombre: "Sitio de servicios", clienteId: "dc-2", servicioId: "ds-1", estado: "cerrado", valor: 2_600_000, fechaCierre: "2026-10-09", fechaInicio: "2026-09-01", fechaLimite: "2026-10-09", tarifaDia: null, repartoCongelado: reglas, notas: null },
      { id: "dp-3", nombre: "Landing con agenda", clienteId: "dc-3", servicioId: "ds-1", estado: "cerrado", valor: 2_000_000, fechaCierre: "2026-10-30", fechaInicio: "2026-09-01", fechaLimite: "2026-10-30", tarifaDia: null, repartoCongelado: reglas, notas: null },
      { id: "dp-4", nombre: "Rediseño de página", clienteId: "dc-4", servicioId: "ds-1", estado: "en-curso", valor: 2_200_000, fechaCierre: null, fechaInicio: "2026-09-01", fechaLimite: "2026-11-20", tarifaDia: null, repartoCongelado: null, notas: null },
      { id: "dp-5", nombre: "Landing de lanzamiento", clienteId: "dc-5", servicioId: "ds-1", estado: "propuesta", valor: 1_600_000, fechaCierre: null, fechaInicio: "2026-09-01", fechaLimite: "2026-11-20", tarifaDia: null, repartoCongelado: null, notas: null },
    ],
    gastos: [
      { id: "dg-1", proyectoId: "dp-1", concepto: "Fotos de banco", categoria: "herramientas", valor: 120_000, fecha: "2026-09-10" },
      { id: "dg-2", proyectoId: "dp-2", concepto: "Dominio y hosting 1 año", categoria: "hosting-dominio", valor: 260_000, fecha: "2026-10-01" },
      { id: "dg-3", proyectoId: "dp-2", concepto: "Ilustraciones freelance", categoria: "freelance", valor: 300_000, fecha: "2026-10-03" },
      { id: "dg-4", proyectoId: "dp-3", concepto: "Plantilla de agenda", categoria: "herramientas", valor: 90_000, fecha: "2026-10-20" },
      { id: "dg-5", proyectoId: null, concepto: "Publicidad en Instagram", categoria: "publicidad", valor: 250_000, fecha: "2026-10-15" },
      { id: "dg-6", proyectoId: null, concepto: "Suscripciones de herramientas", categoria: "herramientas", valor: 180_000, fecha: "2026-11-01" },
    ],
    // Días trabajados (1 día = 8 h, a 80.000): quién hizo qué en cada proyecto
    trabajo: [
      { id: "dw-1", proyectoId: "dp-1", personaId: "d-sergio", actividad: "Diseño", dias: 2, fecha: "2026-09-12", nota: null },
      { id: "dw-2", proyectoId: "dp-1", personaId: "d-santiago", actividad: "Desarrollo", dias: 1.5, fecha: "2026-09-15", nota: null },
      { id: "dw-3", proyectoId: "dp-2", personaId: "d-sergio", actividad: "Diseño", dias: 2.5, fecha: "2026-10-04", nota: null },
      { id: "dw-4", proyectoId: "dp-2", personaId: "d-santiago", actividad: "Desarrollo", dias: 3, fecha: "2026-10-07", nota: null },
      { id: "dw-5", proyectoId: "dp-2", personaId: "d-andres", actividad: "Comercial", dias: 0.5, fecha: "2026-09-29", nota: null },
      { id: "dw-6", proyectoId: "dp-3", personaId: "d-sergio", actividad: "Desarrollo", dias: 4, fecha: "2026-10-25", nota: null },
      { id: "dw-7", proyectoId: "dp-4", personaId: "d-sergio", actividad: "Diseño", dias: 1, fecha: "2026-11-05", nota: null },
    ],
    servicios: [
      { id: "ds-1", nombre: "Página Lista en 5 Días", categoria: "pagina-web", activo: true },
      { id: "ds-2", nombre: "Tienda por WhatsApp en 5 Días", categoria: "catalogo", activo: true },
      { id: "ds-3", nombre: "Tu Negocio en Orden", categoria: "sistema", activo: true },
      { id: "ds-4", nombre: "Mantenimiento mensual", categoria: "mantenimiento", activo: true },
    ],
    clientes: [1, 2, 3, 4, 5].map((i) => ({ id: `dc-${i}`, nombre: `Contacto ${i}`, empresa: `Negocio de ejemplo ${i}` })),
    // Pasos: cerrados = todo hecho; dp-4 a mitad (construcción); dp-5 sin empezar
    tareas: ["dp-1", "dp-2", "dp-3", "dp-4", "dp-5"].flatMap((pid, k) =>
      plantillas["pagina-web"].map((t, i) => ({ id: `dt-${k}-${i}`, proyectoId: pid, etapa: t.etapa, texto: t.texto, hecha: k < 3 || (k === 3 && i < 4), orden: i }))
    ),
    gastosFijos: [
      { id: "df-1", concepto: "Herramientas y suscripciones", valorMensual: 180_000, activo: true },
      { id: "df-2", concepto: "Publicidad propia", valorMensual: 250_000, activo: true },
      { id: "df-3", concepto: "Contador", valorMensual: 150_000, activo: true },
    ],
  };
}
