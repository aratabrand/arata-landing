// Aplica las migraciones del panel (db/panel/*.sql) en orden, una sola vez cada una.
// Uso:  node --env-file=.env.local scripts/panel-migrar.mjs
// ⚠ DATABASE_URL debe ser la base de Neon "arata-panel", nunca la de un catálogo.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

// Mismo ajuste que lib/panel/db.ts: pide verify-full explícito (sin aviso de pg).
const conexionSegura = (url = "") => url.replace(/([?&]sslmode=)(prefer|require|verify-ca)\b/, "$1verify-full");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Falta DATABASE_URL (usa --env-file=.env.local).");
  process.exit(1);
}

const dir = join(import.meta.dirname, "..", "db", "panel");
const archivos = readdirSync(dir).filter((f) => /^\d{3}_.+\.sql$/.test(f)).sort();
const cliente = new pg.Client({ connectionString: conexionSegura(url) });
await cliente.connect();
try {
  await cliente.query(`create table if not exists _migraciones_panel (archivo text primary key, aplicado timestamptz not null default now())`);
  const hechas = new Set((await cliente.query(`select archivo from _migraciones_panel`)).rows.map((r) => r.archivo));
  for (const f of archivos) {
    if (hechas.has(f)) {
      console.log(`· ${f} (ya estaba)`);
      continue;
    }
    await cliente.query("begin");
    try {
      await cliente.query(readFileSync(join(dir, f), "utf8"));
      await cliente.query(`insert into _migraciones_panel (archivo) values ($1)`, [f]);
      await cliente.query("commit");
      console.log(`✓ ${f}`);
    } catch (e) {
      await cliente.query("rollback");
      console.error(`✗ ${f}: ${e.message}`);
      process.exit(1);
    }
  }
  console.log("Base del panel al día.");
} finally {
  await cliente.end();
}
