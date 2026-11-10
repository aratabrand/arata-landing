import type { DatosFinanzas } from "./tipos";
import { plantillas } from "./procesos";

// Finanzas de EJEMPLO (modo sin conexión). Números ficticios, marcados en pantalla.
export function finanzasDemo(): DatosFinanzas {
  const personas = [
    { id: "d-sergio", nombre: "Sergio", area: "Estrategia y diseño", esSocio: true, usuarioId: null, activo: true },
    { id: "d-andres", nombre: "Andrés", area: "Comercial", esSocio: true, usuarioId: null, activo: true },
    { id: "d-santiago", nombre: "Santiago", area: "Tecnología", esSocio: true, usuarioId: null, activo: true },
  ];
  const reparto = [
    { beneficiario: "d-sergio", pct: 25 },
    { beneficiario: "d-andres", pct: 25 },
    { beneficiario: "d-santiago", pct: 25 },
    { beneficiario: "empresa", pct: 25 },
  ];
  const reglas = { bolsaTrabajoPct: 30, reparto };
  return {
    negocioId: "demo",
    puedeEditar: false,
    puedeMarcarPasos: false,
    miPersonaId: "d-sergio",
    demo: true,
    personas,
    config: { ...reglas, reservaMeses: 3, actualizado: null },
    proyectos: [
      { id: "dp-1", nombre: "Landing restaurante", clienteId: "dc-1", servicioId: "ds-1", estado: "cerrado", valor: 1_800_000, fechaCierre: "2026-09-18", fechaInicio: "2026-09-01", fechaLimite: "2026-09-18", repartoCongelado: reglas, notas: null },
      { id: "dp-2", nombre: "Sitio de servicios", clienteId: "dc-2", servicioId: "ds-1", estado: "cerrado", valor: 2_600_000, fechaCierre: "2026-10-09", fechaInicio: "2026-09-01", fechaLimite: "2026-10-09", repartoCongelado: reglas, notas: null },
      { id: "dp-3", nombre: "Landing con agenda", clienteId: "dc-3", servicioId: "ds-1", estado: "cerrado", valor: 2_000_000, fechaCierre: "2026-10-30", fechaInicio: "2026-09-01", fechaLimite: "2026-10-30", repartoCongelado: reglas, notas: null },
      { id: "dp-4", nombre: "Rediseño de página", clienteId: "dc-4", servicioId: "ds-1", estado: "en-curso", valor: 2_200_000, fechaCierre: null, fechaInicio: "2026-09-01", fechaLimite: "2026-11-20", repartoCongelado: null, notas: null },
      { id: "dp-5", nombre: "Landing de lanzamiento", clienteId: "dc-5", servicioId: "ds-1", estado: "propuesta", valor: 1_600_000, fechaCierre: null, fechaInicio: "2026-09-01", fechaLimite: "2026-11-20", repartoCongelado: null, notas: null },
    ],
    gastos: [
      { id: "dg-1", proyectoId: "dp-1", concepto: "Fotos de banco", categoria: "herramientas", valor: 120_000, fecha: "2026-09-10" },
      { id: "dg-2", proyectoId: "dp-2", concepto: "Dominio y hosting 1 año", categoria: "hosting-dominio", valor: 260_000, fecha: "2026-10-01" },
      { id: "dg-3", proyectoId: "dp-2", concepto: "Ilustraciones freelance", categoria: "freelance", valor: 300_000, fecha: "2026-10-03" },
      { id: "dg-4", proyectoId: "dp-3", concepto: "Plantilla de agenda", categoria: "herramientas", valor: 90_000, fecha: "2026-10-20" },
      { id: "dg-5", proyectoId: null, concepto: "Publicidad en Instagram", categoria: "publicidad", valor: 250_000, fecha: "2026-10-15" },
      { id: "dg-6", proyectoId: null, concepto: "Suscripciones de herramientas", categoria: "herramientas", valor: 180_000, fecha: "2026-11-01" },
    ],
    horas: [
      { id: "dh-1", proyectoId: "dp-1", personaId: "d-sergio", area: "Estrategia y diseño", horas: 14, fecha: "2026-09-12", nota: null },
      { id: "dh-2", proyectoId: "dp-1", personaId: "d-santiago", area: "Tecnología", horas: 10, fecha: "2026-09-15", nota: null },
      { id: "dh-3", proyectoId: "dp-1", personaId: "d-andres", area: "Comercial", horas: 4, fecha: "2026-09-08", nota: null },
      { id: "dh-4", proyectoId: "dp-2", personaId: "d-sergio", area: "Estrategia y diseño", horas: 18, fecha: "2026-10-04", nota: null },
      { id: "dh-5", proyectoId: "dp-2", personaId: "d-santiago", area: "Tecnología", horas: 22, fecha: "2026-10-07", nota: null },
      { id: "dh-6", proyectoId: "dp-2", personaId: "d-andres", area: "Comercial", horas: 6, fecha: "2026-09-29", nota: null },
      { id: "dh-7", proyectoId: "dp-3", personaId: "d-sergio", area: "Estrategia y diseño", horas: 12, fecha: "2026-10-25", nota: null },
      { id: "dh-8", proyectoId: "dp-3", personaId: "d-santiago", area: "Tecnología", horas: 16, fecha: "2026-10-28", nota: null },
      { id: "dh-9", proyectoId: "dp-4", personaId: "d-sergio", area: "Estrategia y diseño", horas: 6, fecha: "2026-11-05", nota: null },
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
