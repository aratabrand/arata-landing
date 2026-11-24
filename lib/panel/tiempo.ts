// Tiempo relativo para las notificaciones (D-185), como en Android o iPhone:
// «Ahora», «hace 5 min», «hace 2 h»; después de 24 horas la notificación ya no se muestra.

/** Horas que vive una notificación en la campana antes de irse sola. */
export const HORAS_NOTIFICACION = 24;

export function haceCuanto(iso: string, ahoraMs: number) {
  const min = Math.floor((ahoraMs - Date.parse(iso)) / 60_000);
  if (min < 1) return "Ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  return h < 48 ? "Ayer" : `hace ${Math.floor(h / 24)} días`;
}

/** Cuánto le queda antes de borrarse sola: «se borra en 3 h». */
export function quedan(iso: string, ahoraMs: number) {
  const restan = Date.parse(iso) + HORAS_NOTIFICACION * 3_600_000 - ahoraMs;
  if (restan <= 0) return "se borra ya";
  const h = Math.floor(restan / 3_600_000);
  return h >= 1 ? `se borra en ${h} h` : `se borra en ${Math.max(1, Math.ceil(restan / 60_000))} min`;
}
