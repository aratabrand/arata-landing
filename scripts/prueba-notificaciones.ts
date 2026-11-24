// Prueba del tiempo de las notificaciones (D-185). Correr:  npx -y tsx scripts/prueba-notificaciones.ts
import { HORAS_NOTIFICACION, haceCuanto, quedan } from "../lib/panel/tiempo";
const ok = (c: boolean, m: string) => { console.log((c ? "✓ " : "✗ ") + m); if (!c) process.exitCode = 1; };
const ahora = Date.parse("2026-11-24T15:00:00Z");
const hace = (min: number) => new Date(ahora - min * 60_000).toISOString();
ok(HORAS_NOTIFICACION === 24, "viven 24 horas");
ok(haceCuanto(hace(0), ahora) === "Ahora" && haceCuanto(hace(0.5), ahora) === "Ahora", "menos de un minuto: «Ahora»");
ok(haceCuanto(hace(5), ahora) === "hace 5 min" && haceCuanto(hace(59), ahora) === "hace 59 min", "minutos");
ok(haceCuanto(hace(60), ahora) === "hace 1 h" && haceCuanto(hace(23 * 60 + 59), ahora) === "hace 23 h", "horas");
ok(haceCuanto(hace(25 * 60), ahora) === "Ayer" && haceCuanto(hace(72 * 60), ahora) === "hace 3 días", "más viejas (el historial)");
ok(quedan(hace(60), ahora) === "se borra en 23 h" && quedan(hace(24 * 60 - 10), ahora) === "se borra en 10 min" && quedan(hace(24 * 60), ahora) === "se borra ya", "cuánto le queda");
