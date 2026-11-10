// Crea una cuenta del panel y le da acceso a un negocio.
// El panel no tiene registro abierto: esta es la única forma de crear cuentas.
//
// Uso:  node --env-file=.env.local scripts/panel-crear-usuario.mjs <correo> "<nombre>" <slug-negocio> [rol] ["<persona del equipo>"]
// Ej.:  node --env-file=.env.local scripts/panel-crear-usuario.mjs sergio@... "Sergio" arata-san dueno
//       node --env-file=.env.local scripts/panel-crear-usuario.mjs andres@... "Andrés" arata-san equipo "Andrés"
// rol: dueno (edita todo) · equipo (ve Finanzas y Equipo sin editar).
// persona: nombre en Equipo (solo agencia). Enlaza la cuenta para que el panel le marque "Tú".
//
// Genera una contraseña fuerte y la muestra UNA vez: guárdala en tu gestor de contraseñas.
// Al entrar por primera vez, el panel obliga a activar el doble factor.
// ⚠ Mismas opciones de tablas que lib/panel/auth.ts (correo+contraseña y twoFactor).
import { randomBytes } from "node:crypto";
import pg from "pg";

// Mismo ajuste que lib/panel/db.ts: pide verify-full explícito (sin aviso de pg).
const conexionSegura = (url = "") => url.replace(/([?&]sslmode=)(prefer|require|verify-ca)\b/, "$1verify-full");
import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins";

const [correo, nombre, slug, rol = "dueno", persona] = process.argv.slice(2);
if (!correo || !nombre || !slug || !["dueno", "equipo", "arata"].includes(rol)) {
  console.error('Uso: node --env-file=.env.local scripts/panel-crear-usuario.mjs <correo> "<nombre>" <slug-negocio> [dueno|equipo|arata] ["<persona del equipo>"]');
  process.exit(1);
}
if (!process.env.DATABASE_URL || !process.env.BETTER_AUTH_SECRET) {
  console.error("Faltan DATABASE_URL o BETTER_AUTH_SECRET (usa --env-file=.env.local).");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: conexionSegura(process.env.DATABASE_URL), max: 1 });
try {
  const negocio = (await pool.query("select id, tipo from negocios where slug = $1", [slug])).rows[0];
  if (!negocio) throw new Error(`No existe el negocio "${slug}".`);

  const existe = (await pool.query('select id from "user" where lower(email) = lower($1)', [correo])).rows[0];
  let usuarioId = existe?.id;
  let clave = null;

  if (!usuarioId) {
    // Instancia local con registro habilitado SOLO para este script
    const auth = betterAuth({
      database: pool,
      secret: process.env.BETTER_AUTH_SECRET,
      baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
      emailAndPassword: { enabled: true, minPasswordLength: 12, maxPasswordLength: 128 },
      plugins: [twoFactor({ issuer: "Arata San" })],
    });
    clave = randomBytes(18).toString("base64url"); // 24 caracteres
    const r = await auth.api.signUpEmail({ body: { email: correo, password: clave, name: nombre } });
    usuarioId = r.user.id;
    await pool.query('update "user" set "emailVerified" = true where id = $1', [usuarioId]);
  }

  await pool.query(
    `insert into miembros (negocio_id, usuario_id, rol) values ($1, $2, $3)
     on conflict (negocio_id, usuario_id) do update set rol = excluded.rol`,
    [negocio.id, usuarioId, rol]
  );

  console.log(`✓ ${correo} tiene acceso a "${slug}" como ${rol}.`);

  if (persona) {
    const r = await pool.query(
      `update equipo_personas set usuario_id = $3
        where negocio_id = $1 and lower(nombre) = lower($2) and (usuario_id is null or usuario_id = $3)
        returning nombre`,
      [negocio.id, persona, usuarioId]
    );
    console.log(r.rowCount ? `✓ Enlazado con "${r.rows[0].nombre}" en Equipo.` : `⚠ No encontré a "${persona}" libre en Equipo (revisa el nombre exacto).`);
  }
  if (clave) {
    console.log("\nContraseña (se muestra UNA sola vez, guárdala ya en tu gestor de contraseñas):\n");
    console.log(`   ${clave}\n`);
  } else {
    console.log("La cuenta ya existía: no se cambió la contraseña.");
  }
} catch (e) {
  console.error(`✗ ${e.message}`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
