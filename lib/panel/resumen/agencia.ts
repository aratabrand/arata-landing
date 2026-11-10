import type { DatosFinanzas } from "../finanzas/tipos";
import { calcularProyecto } from "../finanzas/calculo";
import { avance, estaEntregado } from "../finanzas/procesos";
import type { ClienteAgencia } from "../clientes/datos";

// Resumen de Arata San con datos reales (D-113). Funciones puras.
// Venta = proyecto cerrado (por fecha de cierre). Compara el periodo con el anterior del mismo largo.

export type PeriodoResumen = 30 | 90 | 365;

const restar = (iso: string, dias: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - dias);
  return d.toISOString().slice(0, 10);
};
const entre = (f: string | null, desde: string, hasta: string) => !!f && f > desde && f <= hasta;
export const cambioPct = (a: number, b: number) => (b ? ((a - b) / b) * 100 : null);

export function resumenAgencia(d: DatosFinanzas, clientes: ClienteAgencia[], hoy: string, periodo: PeriodoResumen) {
  const desde = restar(hoy, periodo);
  const desdeAnt = restar(hoy, periodo * 2);
  const calc = (p: (typeof d.proyectos)[number]) => calcularProyecto(p, d.gastos, d.horas, d.config, d.personas);

  const cerrados = d.proyectos.filter((p) => p.estado === "cerrado" && p.fechaCierre);
  const actual = cerrados.filter((p) => entre(p.fechaCierre, desde, hoy));
  const anterior = cerrados.filter((p) => entre(p.fechaCierre, desdeAnt, desde));
  const suma = (l: typeof cerrados) => l.reduce((a, p) => a + p.valor, 0);
  const ganancia = (l: typeof cerrados) => l.reduce((a, p) => a + calc(p).ganancia, 0);

  const ventas = suma(actual);
  const ventasAnt = suma(anterior);
  const gan = ganancia(actual);
  const ganAnt = ganancia(anterior);

  const nuevos = clientes.filter((c) => entre(c.creado, desde, hoy)).length;
  const nuevosAnt = clientes.filter((c) => entre(c.creado, desdeAnt, desde)).length;

  // Proceso de los proyectos abiertos
  const abiertos = d.proyectos
    .map((p) => {
      const a = avance(d.tareas.filter((t) => t.proyectoId === p.id));
      const vence = p.fechaLimite && !estaEntregado(p.estado, a) ? Math.round((Date.parse(`${p.fechaLimite}T12:00:00Z`) - Date.parse(`${hoy}T12:00:00Z`)) / 86_400_000) : null;
      return { p, a, vence };
    })
    .filter((x) => !estaEntregado(x.p.estado, x.a) && x.p.estado !== "propuesta")
    .sort((x, y) => (x.vence ?? 9999) - (y.vence ?? 9999));
  const tarde = abiertos.filter((x) => x.vence !== null && x.vence < 0).length;

  // Clientes que compran: de todos los clientes, cuántos tienen al menos un proyecto cerrado
  const conProyecto = clientes.filter((c) => c.proyectos.length > 0).length;
  const compraron = clientes.filter((c) => c.proyectos.some((p) => p.estado === "cerrado")).length;
  const tasa = clientes.length ? (compraron / clientes.length) * 100 : 0;

  // De dónde llegan (con cuántos compraron)
  const origenes = new Map<string, { clientes: number; compraron: number }>();
  clientes.forEach((c) => {
    const k = c.origen ?? "Sin registrar";
    const x = origenes.get(k) ?? { clientes: 0, compraron: 0 };
    x.clientes += 1;
    if (c.proyectos.some((p) => p.estado === "cerrado")) x.compraron += 1;
    origenes.set(k, x);
  });

  // Lo que más se vende (cerrados del periodo, por servicio)
  const servicios = new Map<string, { nombre: string; ventas: number; proyectos: number }>();
  actual.forEach((p) => {
    const s = d.servicios.find((x) => x.id === p.servicioId);
    const k = s?.id ?? "sin";
    const x = servicios.get(k) ?? { nombre: s?.nombre ?? "Sin servicio", ventas: 0, proyectos: 0 };
    x.ventas += p.valor;
    x.proyectos += 1;
    servicios.set(k, x);
  });

  // Ventas por mes (últimos 12 meses)
  const meses: { mes: string; ventas: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const dt = new Date(`${hoy.slice(0, 7)}-15T12:00:00Z`);
    dt.setUTCMonth(dt.getUTCMonth() - i);
    const m = dt.toISOString().slice(0, 7);
    meses.push({ mes: m, ventas: cerrados.filter((p) => p.fechaCierre!.startsWith(m)).reduce((a, p) => a + p.valor, 0) });
  }

  const ultimas = [...cerrados].sort((a, b) => b.fechaCierre!.localeCompare(a.fechaCierre!)).slice(0, 5);

  return {
    ventas,
    ventasAnt,
    deltaVentas: cambioPct(ventas, ventasAnt),
    proyectosVendidos: actual.length,
    ganancia: gan,
    deltaGanancia: cambioPct(gan, ganAnt),
    margen: ventas ? (gan / ventas) * 100 : 0,
    clientesNuevos: nuevos,
    deltaClientes: cambioPct(nuevos, nuevosAnt),
    enProceso: abiertos.length,
    tarde,
    abiertos,
    embudo: { clientes: clientes.length, conProyecto, compraron },
    tasa,
    origenes: [...origenes.entries()].map(([origen, v]) => ({ origen, ...v })).sort((a, b) => b.clientes - a.clientes),
    servicios: [...servicios.values()].sort((a, b) => b.ventas - a.ventas),
    meses,
    ultimas,
    porCobrar: d.proyectos.filter((p) => p.estado === "en-curso").reduce((a, p) => a + p.valor, 0),
    propuestas: d.proyectos.filter((p) => p.estado === "propuesta"),
  };
}
