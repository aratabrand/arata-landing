// Fechas del panel siempre en hora de Bogotá (UTC−5, sin horario de verano).
// El servidor (Vercel) y la base (Neon) pueden estar en otra zona: nunca se usa la del sistema.

/** Hoy en Bogotá, AAAA-MM-DD. */
export const hoyColombia = () => new Date(Date.now() - 5 * 3600_000).toISOString().slice(0, 10);

/**
 * Valor de la base → AAAA-MM-DD en Bogotá.
 * - Columnas `date`: llegan como texto (lib/panel/db.ts) y se usan tal cual.
 * - Columnas `timestamptz` (un instante): se pasan a la fecha de Bogotá.
 */
export const fechaBogota = (d: Date | string | null | undefined) =>
  d ? (typeof d === "string" ? d.slice(0, 10) : new Date(d.getTime() - 5 * 3600_000).toISOString().slice(0, 10)) : null;
