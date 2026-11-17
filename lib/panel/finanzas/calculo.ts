import {
  EMPRESA,
  type DatosFinanzas,
  type FinConfig,
  type FinProyecto,
  type Gasto,
  type GastoFijo,
  type Persona,
  type RegistroTrabajo,
  type ReglasReparto,
} from "./tipos";

// Cálculos de finanzas (D-118). Funciones puras: sin base de datos ni pantalla.
// docs/panel-cliente/06-finanzas.md §2 explica cada fórmula con un ejemplo.
//
//   ganancia     = valor − gastos del proyecto
//   pago por días = días de cada persona × valor del día   (se paga PRIMERO)
//   para repartir = ganancia − pago por días
//   parte igual   = para repartir ÷ partes (socios activos + Arata)
//
// Nunca se reparte más de lo que dejó el proyecto:
// - Si los días cuestan más que la ganancia, se pagan en proporción hasta la ganancia y no hay parte igual.
// - Si hay pérdida (ganancia < 0), no se paga nada: la absorbe la empresa.
// Los pesos se redondean al peso; la diferencia de redondeo va a la empresa,
// así la suma de todas las partes es exactamente la ganancia.

export type PartePersona = {
  personaId: string;
  dias: number;
  porDias: number; // días × valor del día
  parteIgual: number; // su parte igual de lo que queda
  total: number;
};

export type ResultadoProyecto = {
  proyectoId: string;
  ingreso: number;
  gastos: number;
  ganancia: number;
  margenPct: number;
  tarifaDia: number;
  diasTotales: number;
  /** Lo que se paga por días (después de recortar si no alcanza). */
  pagoDias: number;
  /** Lo que costarían los días completos (antes de recortar). */
  pagoDiasCompleto: number;
  paraRepartir: number;
  parteIgual: number;
  numPartes: number;
  /** Los días costaban más que la ganancia y se pagaron en proporción. */
  recortado: boolean;
  perdida: boolean;
  personas: PartePersona[];
  empresa: number;
  reglas: ReglasReparto;
};

/** Quiénes reciben parte igual hoy: socios activos + la empresa. */
export function partesActuales(personas: Persona[]): string[] {
  return [...personas.filter((p) => p.esSocio && p.activo).map((p) => p.id), EMPRESA];
}

export function reglasActuales(config: FinConfig, personas: Persona[]): ReglasReparto {
  return { tarifaDia: config.tarifaDia, partes: partesActuales(personas) };
}

/** Reglas congeladas, aceptando la forma vieja (bolsa y %) por si quedó alguna. */
function normalizar(r: unknown, actuales: ReglasReparto): ReglasReparto | null {
  if (!r || typeof r !== "object") return null;
  const x = r as { tarifaDia?: unknown; partes?: unknown; reparto?: { beneficiario: string }[] };
  const partes = Array.isArray(x.partes)
    ? x.partes.map(String)
    : Array.isArray(x.reparto)
      ? x.reparto.map((p) => p.beneficiario)
      : actuales.partes;
  const tarifa = Number(x.tarifaDia);
  return { tarifaDia: tarifa > 0 ? tarifa : actuales.tarifaDia, partes: partes.includes(EMPRESA) ? partes : [...partes, EMPRESA] };
}

export function calcularProyecto(
  p: FinProyecto,
  gastos: Gasto[],
  trabajo: RegistroTrabajo[],
  config: FinConfig,
  personas: Persona[]
): ResultadoProyecto {
  const actuales = reglasActuales(config, personas);
  const congeladas = normalizar(p.repartoCongelado, actuales);
  const reglas = congeladas ?? actuales;
  const tarifa = p.tarifaDia ?? reglas.tarifaDia;

  const gastosP = gastos.filter((g) => g.proyectoId === p.id).reduce((a, g) => a + g.valor, 0);
  const ganancia = p.valor - gastosP;
  const diasPor = new Map<string, number>();
  trabajo.filter((t) => t.proyectoId === p.id).forEach((t) => diasPor.set(t.personaId, (diasPor.get(t.personaId) ?? 0) + t.dias));
  const diasTotales = [...diasPor.values()].reduce((a, b) => a + b, 0);

  // Personas que aparecen: el equipo, las que tienen parte y las que tienen días
  const ids = new Set<string>([...personas.map((x) => x.id), ...reglas.partes.filter((x) => x !== EMPRESA), ...diasPor.keys()]);
  const personasPartes = reglas.partes.filter((x) => x !== EMPRESA);
  const numPartes = personasPartes.length + 1; // + empresa

  const completo = new Map([...diasPor].map(([id, d]) => [id, Math.round(d * tarifa)]));
  const pagoDiasCompleto = [...completo.values()].reduce((a, b) => a + b, 0);

  const base = {
    proyectoId: p.id,
    ingreso: p.valor,
    gastos: gastosP,
    ganancia,
    margenPct: p.valor > 0 ? (ganancia / p.valor) * 100 : 0,
    tarifaDia: tarifa,
    diasTotales,
    pagoDiasCompleto,
    numPartes,
    reglas: { ...reglas, tarifaDia: tarifa },
  };

  if (ganancia <= 0) {
    return {
      ...base,
      pagoDias: 0,
      paraRepartir: 0,
      parteIgual: 0,
      recortado: false,
      perdida: ganancia < 0,
      personas: [...ids].map((id) => ({ personaId: id, dias: diasPor.get(id) ?? 0, porDias: 0, parteIgual: 0, total: 0 })),
      empresa: ganancia, // la pérdida la absorbe la empresa
    };
  }

  // 1.º días (en proporción si no alcanza la ganancia)
  const recortado = pagoDiasCompleto > ganancia;
  const porDias = new Map(
    [...completo].map(([id, v]) => [id, recortado ? Math.floor((v * ganancia) / pagoDiasCompleto) : v])
  );
  const pagoDias = [...porDias.values()].reduce((a, b) => a + b, 0);

  // 2.º partes iguales de lo que queda
  const paraRepartir = ganancia - pagoDias;
  // Si se recortaron los días, lo que sobra es redondeo: va a la empresa
  const parteIgual = recortado ? 0 : Math.floor(paraRepartir / numPartes);

  const partes: PartePersona[] = [...ids].map((id) => {
    const d = porDias.get(id) ?? 0;
    const igual = personasPartes.includes(id) ? parteIgual : 0;
    return { personaId: id, dias: diasPor.get(id) ?? 0, porDias: d, parteIgual: igual, total: d + igual };
  });
  // La empresa recibe su parte igual y absorbe el redondeo: todo suma exacto la ganancia
  const empresa = ganancia - partes.reduce((a, x) => a + x.total, 0);

  return { ...base, pagoDias, paraRepartir, parteIgual, recortado, perdida: false, personas: partes, empresa };
}

export const totalGastosFijos = (fijos: GastoFijo[]) => fijos.filter((f) => f.activo).reduce((a, f) => a + f.valorMensual, 0);

const mes = (iso: string) => iso.slice(0, 7);

/** Resumen de la empresa con los proyectos cerrados (opcionalmente desde una fecha). */
export function resumenFinanzas(d: DatosFinanzas, desde?: string) {
  const cerrados = d.proyectos.filter((p) => p.estado === "cerrado" && p.fechaCierre && (!desde || p.fechaCierre >= desde));
  const calc = (p: FinProyecto) => calcularProyecto(p, d.gastos, d.trabajo, d.config, d.personas);
  const resultados = cerrados.map(calc);
  const ingresos = resultados.reduce((a, r) => a + r.ingreso, 0);
  const gastosProyectos = resultados.reduce((a, r) => a + r.gastos, 0);
  const ganancia = resultados.reduce((a, r) => a + r.ganancia, 0);
  const empresaProyectos = resultados.reduce((a, r) => a + r.empresa, 0);

  const porPersona = d.personas.map((pe) => {
    const partes = resultados.map((r) => r.personas.find((x) => x.personaId === pe.id));
    const sum = (k: "porDias" | "parteIgual" | "total" | "dias") => partes.reduce((a, x) => a + (x?.[k] ?? 0), 0);
    return { persona: pe, dias: sum("dias"), porDias: sum("porDias"), parteIgual: sum("parteIgual"), total: sum("total") };
  });

  // Fondos: todo lo que le ha tocado a la empresa (siempre, no solo el periodo) − gastos de la empresa
  const empresaHistorica = d.proyectos
    .filter((p) => p.estado === "cerrado")
    .map((p) => calc(p).empresa)
    .reduce((a, b) => a + b, 0);
  const gastosEmpresa = d.gastos.filter((g) => g.proyectoId === null).reduce((a, g) => a + g.valor, 0);
  const fondos = empresaHistorica - gastosEmpresa;
  const fijosMes = totalGastosFijos(d.gastosFijos);
  const reserva = fijosMes * d.config.reservaMeses;

  // Por mes (para el gráfico): ganancia de proyectos cerrados
  const meses = new Map<string, { ingresos: number; ganancia: number; proyectos: number }>();
  resultados.forEach((r, i) => {
    const m = mes(cerrados[i].fechaCierre!);
    const x = meses.get(m) ?? { ingresos: 0, ganancia: 0, proyectos: 0 };
    x.ingresos += r.ingreso;
    x.ganancia += r.ganancia;
    x.proyectos += 1;
    meses.set(m, x);
  });

  const diasCerrados = resultados.reduce((a, r) => a + r.diasTotales, 0);

  return {
    cerrados: resultados.length,
    ingresos,
    gastosProyectos,
    ganancia,
    margenPct: ingresos ? (ganancia / ingresos) * 100 : 0,
    empresaProyectos,
    porPersona,
    fondos,
    gastosEmpresa,
    fijosMes,
    reserva,
    disponible: Math.max(0, fondos - reserva),
    porMes: [...meses.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([m, v]) => ({ mes: m, ...v })),
    promedio: {
      valor: resultados.length ? ingresos / resultados.length : 0,
      gastosPct: ingresos ? (gastosProyectos / ingresos) * 100 : 0,
      dias: resultados.length ? diasCerrados / resultados.length : 0,
    },
    resultados,
  };
}

/** Proyección mensual y punto de equilibrio. */
export function proyectar({
  proyectosMes,
  valorPromedio,
  gastosPct,
  diasPorProyecto,
  tarifaDia,
  personas,
  fijosMes,
  participacionDias,
}: {
  proyectosMes: number;
  valorPromedio: number;
  gastosPct: number;
  /** Días trabajados en un proyecto promedio. */
  diasPorProyecto: number;
  tarifaDia: number;
  personas: Persona[];
  fijosMes: number;
  /** Fracción de días de cada persona (suma 1). Si falta, se reparte igual entre socios. */
  participacionDias?: Map<string, number>;
}) {
  const socios = personas.filter((p) => p.esSocio && p.activo);
  const numPartes = socios.length + 1;
  // Un proyecto promedio
  const uno = (() => {
    const g = valorPromedio * (1 - gastosPct / 100);
    const dias = Math.min(Math.max(0, g), diasPorProyecto * tarifaDia);
    return { ganancia: g, dias, empresa: g > 0 ? (g - dias) / numPartes : g };
  })();

  const ingresos = proyectosMes * valorPromedio;
  const gastos = Math.round(ingresos * (gastosPct / 100));
  const ganancia = ingresos - gastos;
  const pagoDias = ganancia > 0 ? Math.min(ganancia, Math.round(proyectosMes * diasPorProyecto * tarifaDia)) : 0;
  const paraRepartir = Math.max(0, ganancia - pagoDias);
  const parteIgual = Math.floor(paraRepartir / numPartes);
  const part =
    participacionDias && participacionDias.size
      ? participacionDias
      : new Map(socios.map((p) => [p.id, socios.length ? 1 / socios.length : 0]));
  const activos = personas.filter((p) => p.activo);
  const porPersona = activos.map((p) => {
    const porDias = Math.round(pagoDias * (part.get(p.id) ?? 0));
    const igual = p.esSocio ? parteIgual : 0;
    return { persona: p, porDias, parteIgual: igual, total: porDias + igual };
  });
  const empresa = ganancia - porPersona.reduce((a, x) => a + x.total, 0);

  // Cuánto le deja a la empresa un proyecto promedio → cuántos cubren los gastos fijos
  const empresaPorProyecto = uno.empresa;
  const equilibrio = fijosMes <= 0 ? 0 : empresaPorProyecto > 0 ? Math.ceil(fijosMes / empresaPorProyecto) : null;

  return { ingresos, gastos, ganancia, pagoDias, paraRepartir, parteIgual, porPersona, empresa, empresaNeta: empresa - fijosMes, empresaPorProyecto, equilibrio };
}

/** Fracción de días de cada persona en todos los proyectos (para proyectar). */
export function participacionHistorica(trabajo: RegistroTrabajo[]) {
  const total = trabajo.reduce((a, t) => a + t.dias, 0);
  const m = new Map<string, number>();
  if (!total) return m;
  trabajo.forEach((t) => m.set(t.personaId, (m.get(t.personaId) ?? 0) + t.dias / total));
  return m;
}

/** "2,5 días (20 h)" */
export function textoDias(d: number) {
  const n = String(Math.round(d * 10) / 10).replace(".", ",");
  return `${n} ${d === 1 ? "día" : "días"} (${String(Math.round(d * 8 * 10) / 10).replace(".", ",")} h)`;
}
