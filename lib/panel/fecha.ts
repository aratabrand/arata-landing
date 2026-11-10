/** Fecha de hoy en Bogotá (UTC−5, sin horario de verano), AAAA-MM-DD. */
export const hoyColombia = () => new Date(Date.now() - 5 * 3600_000).toISOString().slice(0, 10);
