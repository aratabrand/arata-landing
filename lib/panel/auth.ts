import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins";
import { db } from "./db";

// Better Auth: correo + contraseña y doble factor obligatorio con app (TOTP)
// y códigos de respaldo (docs/panel-cliente/05-acceso-y-seguridad.md).
// - Sin registro abierto: las cuentas se crean con scripts/panel-crear-usuario.mjs.
// - 5 códigos mal seguidos → cuenta bloqueada 15 minutos.
// - Límite de intentos guardado en la base (en Vercel la memoria no se comparte).
// ⚠ Si cambias plugins u opciones de tablas, actualiza también
//   scripts/panel-crear-usuario.mjs y regenera la migración (05 §2).

function crear() {
  return betterAuth({
    appName: "Arata San",
    database: db(),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    basePath: "/api/auth",
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 días
      updateAge: 60 * 60 * 24, // se renueva una vez al día de uso
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 30,
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
        "/two-factor/*": { window: 60, max: 5 },
      },
    },
    plugins: [
      twoFactor({
        issuer: "Arata San",
        accountLockout: { enabled: true, maxFailedAttempts: 5, durationSeconds: 15 * 60 },
      }),
      nextCookies(), // siempre de último
    ],
  });
}

const g = globalThis as unknown as { __panelAuth?: ReturnType<typeof crear> };

/** Instancia única de Better Auth (solo se crea si el panel está activo). */
export function auth() {
  if (!g.__panelAuth) g.__panelAuth = crear();
  return g.__panelAuth;
}
