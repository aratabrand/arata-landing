import {
  EMPRESA,
  type DatosFinanzas,
  type FinProyecto,
  type Gasto,
  type GastoFijo,
  type Persona,
  type RegistroHoras,
  type ReglasReparto,
} from "./tipos";

// Cálculos de finanzas (D-108). Funciones puras: sin base de datos ni pantalla.
// docs/panel-cliente/06-finanzas.md §2 explica cada fórmula con un ejemplo.
//
//   ganancia        = valor − gastos del proyecto
//   bolsa de trabajo = ganancia × bolsa%            → por horas de cada persona
//   resto           = ganancia − bolsa              → por % de socios y empresa
//   Si nadie registró horas, la bolsa se suma al resto (no se pierde plata).
//   Si hay pérdida (ganancia < 0), no se reparte: la absorbe la empresa.
// Los pesos se redondean al peso; la diferencia de redondeo va a la empresa,
// así la suma de todas las partes es exactamente la ganancia.

export type PartePersona = {
  personaId: string;
  horas: number;
  trabajo: number; // de la bolsa por horas
  socio: number; // del % de socios
  total: number;
};

export type ResultadoProyecto = {
  proyectoId: string;
  ingreso: number;
  gastos: number;
  ganancia: number;
  margenPct: number;
  bolsa: number;
  resto: number;
  horasTotales: number;
  sinHoras: boolean;
  perdida: boolean;
  personas: PartePersona[];
  empresa: number;
  reglas: ReglasReparto;
};

export function sumaReparto(r: ReglasReparto) {
  return r.reparto.reduce((a, p) => a + p.pct, 0);
}

/** Problemas de unas reglas (lista vacía = válidas). */
export function validarReglas(r: ReglasReparto, personas: Persona[]): string[] {
  const e: string[] = [];
  if (!(r.bolsaTrabajoPct >= 0 && r.bolsaTrabajoPct <= 100)) e.push("La bolsa de trabajo debe estar entre 0 % y 100 %.");
  if (r.reparto.some((p) => !(p.pct >= 0 && p.pct <= 100))) e.push("Cada porcentaje debe estar entre 0 % y 100 %.");
  const suma = Math.round(sumaReparto(r) * 100) / 100;
  if (suma !== 100) e.push(`Los porcentajes de socios y empresa suman ${String(suma).replace(".", ",")} %: deben sumar 100 %.`);
  if (!r.reparto.some((p) => p.beneficiario === EMPRESA)) e.push("Falta el porcentaje de Arata San (empresa).");
  const ids = new Set(personas.map((p) => p.id));
  if (r.reparto.some((p) => p.beneficiario !== EMPRESA && !ids.has(p.beneficiario))) e.push("Hay un porcentaje para una persona que ya no está en el equipo.");
  return e;
}

export function calcularProyecto(
  p: FinProyecto,
  gastos: Gasto[],
  horas: RegistroHoras[],
  reglasActuales: ReglasReparto,
  personas: Persona[]
): ResultadoProyecto {
  const reglas = p.repartoCongelado ?? reglasActuales;
  const gastosP = gastos.filter((g) => g.proyectoId === p.id).reduce((a, g) => a + g.valor, 0);
  const ganancia = p.valor - gastosP;
  const horasP = horas.filter((h) => h.proyectoId === p.id);
  const horasPor = new Map<string, number>();
  horasP.forEach((h) => horasPor.set(h.personaId, (horasPor.get(h.personaId) ?? 0) + h.horas));
  const horasTotales = [...horasPor.values()].reduce((a, b) => a + b, 0);

  // Personas que aparecen: las del reparto, las que tienen horas y el resto del equipo
  const idsPersonas = new Set<string>([
    ...personas.map((x) => x.id),
    ...reglas.reparto.filter((r) => r.beneficiario !== EMPRESA).map((r) => r.beneficiario),
    ...horasPor.keys(),
  ]);

  const base = {
    proyectoId: p.id,
    ingreso: p.valor,
    gastos: gastosP,
    ganancia,
    margenPct: p.valor > 0 ? (ganancia / p.valor) * 100 : 0,
    horasTotales,
    reglas,
  };

  if (ganancia <= 0) {
    return {
      ...base,
      bolsa: 0,
      resto: 0,
      sinHoras: horasTotales === 0,
      perdida: ganancia < 0,
      personas: [...idsPersonas].map((id) => ({ personaId: id, horas: horasPor.get(id) ?? 0, trabajo: 0, socio: 0, total: 0 })),
      empresa: ganancia, // la pérdida la absorbe la empresa
    };
  }

  const sinHoras = horasTotales === 0;
  const bolsa = sinHoras ? 0 : Math.round(ganancia * (reglas.bolsaTrabajoPct / 100));
  const resto = ganancia - bolsa;
  const pctDe = (id: string) => reglas.reparto.find((r) => r.beneficiario === id)?.pct ?? 0;

  const partes: PartePersona[] = [...idsPersonas].map((id) => {
    const h = horasPor.get(id) ?? 0;
    const trabajo = sinHoras ? 0 : Math.round((bolsa * h) / horasTotales);
    const socio = Math.round((resto * pctDe(id)) / 100);
    return { personaId: id, horas: h, trabajo, socio, total: trabajo + socio };
  });
  // La empresa recibe su % y absorbe el redondeo: las partes suman exacto la ganancia
  const empresa = ganancia - partes.reduce((a, x) => a + x.total, 0);

  return { ...base, bolsa, resto, sinHoras, perdida: false, personas: partes, empresa };
}

export const totalGastosFijos = (fijos: GastoFijo[]) => fijos.filter((f) => f.activo).reduce((a, f) => a + f.valorMensual, 0);

const mes = (iso: string) => iso.slice(0, 7);

/** Resumen de la empresa con los proyectos cerrados (opcionalmente desde una fecha). */
export function resumenFinanzas(d: DatosFinanzas, desde?: string) {
  const cerrados = d.proyectos.filter((p) => p.estado === "cerrado" && p.fechaCierre && (!desde || p.fechaCierre >= desde));
  const resultados = cerrados.map((p) => calcularProyecto(p, d.gastos, d.horas, d.config, d.personas));
  const ingresos = resultados.reduce((a, r) => a + r.ingreso, 0);
  const gastosProyectos = resultados.reduce((a, r) => a + r.gastos, 0);
  const ganancia = resultados.reduce((a, r) => a + r.ganancia, 0);
  const empresaProyectos = resultados.reduce((a, r) => a + r.empresa, 0);

  const porPersona = d.personas.map((pe) => {
    const partes = resultados.map((r) => r.personas.find((x) => x.personaId === pe.id));
    const sum = (k: "trabajo" | "socio" | "total" | "horas") => partes.reduce((a, x) => a + (x?.[k] ?? 0), 0);
    return { persona: pe, horas: sum("horas"), trabajo: sum("trabajo"), socio: sum("socio"), total: sum("total") };
  });

  // Fondos: todo lo que le ha tocado a la empresa (siempre, no solo el periodo) − gastos de la empresa
  const todosCerrados = d.proyectos.filter((p) => p.estado === "cerrado");
  const empresaHistorica = todosCerrados
    .map((p) => calcularProyecto(p, d.gastos, d.horas, d.config, d.personas).empresa)
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
    },
    resultados,
  };
}

/** Proyección mensual y punto de equilibrio. */
export function proyectar({
  proyectosMes,
  valorPromedio,
  gastosPct,
  reglas,
  personas,
  fijosMes,
  participacionHoras,
}: {
  proyectosMes: number;
  valorPromedio: number;
  gastosPct: number;
  reglas: ReglasReparto;
  personas: Persona[];
  fijosMes: number;
  /** Fracción de horas de cada persona (suma 1). Si falta, se reparte igual entre socios. */
  participacionHoras?: Map<string, number>;
}) {
  const ingresos = proyectosMes * valorPromedio;
  const gastos = Math.round(ingresos * (gastosPct / 100));
  const ganancia = ingresos - gastos;
  const bolsa = Math.round(ganancia * (reglas.bolsaTrabajoPct / 100));
  const resto = ganancia - bolsa;
  const socios = personas.filter((p) => p.activo);
  const part =
    participacionHoras && participacionHoras.size
      ? participacionHoras
      : new Map(socios.map((p) => [p.id, socios.length ? 1 / socios.length : 0]));
  const pctDe = (id: string) => reglas.reparto.find((r) => r.beneficiario === id)?.pct ?? 0;
  const porPersona = socios.map((p) => {
    const trabajo = Math.round(bolsa * (part.get(p.id) ?? 0));
    const socio = Math.round((resto * pctDe(p.id)) / 100);
    return { persona: p, trabajo, socio, total: trabajo + socio };
  });
  const empresa = ganancia - porPersona.reduce((a, x) => a + x.total, 0);

  // Cuánto le deja a la empresa un proyecto promedio → cuántos cubren los gastos fijos
  const empresaPorProyecto = proyectosMes > 0 ? empresa / proyectosMes : (() => {
    const g1 = valorPromedio * (1 - gastosPct / 100);
    return (g1 - g1 * (reglas.bolsaTrabajoPct / 100)) * (pctDe(EMPRESA) / 100);
  })();
  const equilibrio = fijosMes <= 0 ? 0 : empresaPorProyecto > 0 ? Math.ceil(fijosMes / empresaPorProyecto) : null;

  return { ingresos, gastos, ganancia, bolsa, resto, porPersona, empresa, empresaNeta: empresa - fijosMes, empresaPorProyecto, equilibrio };
}

/** Fracción de horas de cada persona en todos los proyectos (para proyectar). */
export function participacionHistorica(horas: RegistroHoras[]) {
  const total = horas.reduce((a, h) => a + h.horas, 0);
  const m = new Map<string, number>();
  if (!total) return m;
  horas.forEach((h) => m.set(h.personaId, (m.get(h.personaId) ?? 0) + h.horas / total));
  return m;
}
