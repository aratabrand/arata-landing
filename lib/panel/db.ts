import { Pool, types } from "pg";

// Columnas `date` como texto (AAAA-MM-DD), sin pasar por la zona horaria del servidor:
// si no, en un servidor al este de UTC saldrían con un día menos.
types.setTypeParser(1082, (v) => v);

// Conexión a Neon. SOLO servidor: el navegador nunca recibe DATABASE_URL.
// Una sola pool por proceso (en desarrollo, Next recarga módulos; se guarda en global).
const g = globalThis as unknown as { __panelPool?: Pool };

/**
 * Neon/Vercel entregan la cadena con `sslmode=require`. `pg` ya la trata como
 * `verify-full` (certificado verificado) pero avisa que eso cambiará en su v9.
 * Se pide `verify-full` de forma explícita: misma seguridad de hoy y sin aviso.
 */
export function conexionSegura(url = process.env.DATABASE_URL ?? "") {
  return url.replace(/([?&]sslmode=)(prefer|require|verify-ca)\b/, "$1verify-full");
}

export function db(): Pool {
  if (!g.__panelPool) {
    g.__panelPool = new Pool({
      connectionString: conexionSegura(),
      max: 5,
      idleTimeoutMillis: 10_000,
    });
  }
  return g.__panelPool;
}
