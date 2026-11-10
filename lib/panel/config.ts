// Panel de Arata San: acceso con Neon (Postgres) + Better Auth (D-107).
// ⚠ Base de datos PROPIA del panel (proyecto Neon "arata-panel"). No es la de
// Arata Print ni la de Caravana (esos son catálogos, con su propio sistema, D-105).
//
// Variables del SERVIDOR (en .env.local y en Vercel; nunca commiteadas, nunca NEXT_PUBLIC_):
//   DATABASE_URL         cadena de conexión de Neon (con pooler y sslmode=require)
//   BETTER_AUTH_SECRET   32+ caracteres aleatorios (openssl rand -base64 32)
//   BETTER_AUTH_URL      https://www.aratasan.com (o http://localhost:3000 en local)
//
// Sin DATABASE_URL o BETTER_AUTH_SECRET el panel queda en modo ejemplo (sin acceso).

export const panelActivo = Boolean(process.env.DATABASE_URL && process.env.BETTER_AUTH_SECRET);

export const RUTA_ENTRAR = "/panel/entrar";
export const RUTA_DOBLE_FACTOR = "/panel/doble-factor";
