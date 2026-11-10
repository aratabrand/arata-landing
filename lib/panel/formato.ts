import type { DiaMetricas, Periodo } from "@/content/panel/tipos";

// Formatos y cálculos del panel. Funciones puras: corren igual en servidor y navegador.

const cop = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const num = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });

export const pesos = (n: number) => cop.format(n).replace(/\s/g, " ");
export const numero = (n: number) => num.format(n);
export const porcentaje = (n: number, dec = 1) => `${n.toFixed(dec).replace(".", ",")} %`;

/** Pesos cortos para ejes y pills: $1,2 M · $850 mil. */
export function pesosCorto(n: number): string {
  if (n < 0) return `−${pesosCorto(-n)}`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1).replace(".", ",").replace(",0", "")} M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)} mil`;
  return `$${n}`;
}

/** Números cortos: 12,4 mil. */
export function numeroCorto(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".", ",")} M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1).replace(".", ",").replace(",0", "")} mil`;
  return numero(n);
}

const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
export function fechaCorta(iso: string) {
  const [, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} ${meses[m - 1]}`;
}

export type Totales = Omit<DiaMetricas, "fecha">;

const vacio = (): Totales => ({
  ventas: 0,
  pedidos: 0,
  visitas: 0,
  clicsWhatsapp: 0,
  igVisualizaciones: 0,
  igAlcance: 0,
  igInteracciones: 0,
  igSeguidoresNuevos: 0,
});

export function sumar(dias: DiaMetricas[]): Totales {
  return dias.reduce((acc, d) => {
    (Object.keys(acc) as (keyof Totales)[]).forEach((k) => (acc[k] += d[k]));
    return acc;
  }, vacio());
}

/** Días del periodo actual y del periodo anterior del mismo largo. */
export function cortar(dias: DiaMetricas[], periodo: Periodo) {
  const actual = dias.slice(-periodo);
  const anterior = dias.slice(-periodo * 2, -periodo);
  return { actual, anterior };
}

/** Cambio % frente al periodo anterior (null si no hay base). */
export function cambio(actual: number, anterior: number) {
  if (!anterior) return null;
  return ((actual - anterior) / anterior) * 100;
}

/** Agrupa días en bloques (semanas) para que el gráfico de 90 días no quede ilegible. */
export function agrupar(dias: DiaMetricas[], tam: number) {
  const out: { fecha: string; t: Totales }[] = [];
  for (let i = 0; i < dias.length; i += tam) {
    const bloque = dias.slice(i, i + tam);
    out.push({ fecha: bloque[0].fecha, t: sumar(bloque) });
  }
  return out;
}

/** Tasa de clientes que compran: pedidos / visitas. */
export const tasaCompra = (t: Totales) => (t.visitas ? (t.pedidos / t.visitas) * 100 : 0);
