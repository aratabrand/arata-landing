import { Pool } from "pg";

// Conexión a Neon. SOLO servidor: el navegador nunca recibe DATABASE_URL.
// Una sola pool por proceso (en desarrollo, Next recarga módulos; se guarda en global).
const g = globalThis as unknown as { __panelPool?: Pool };

export function db(): Pool {
  if (!g.__panelPool) {
    g.__panelPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 10_000,
    });
  }
  return g.__panelPool;
}
