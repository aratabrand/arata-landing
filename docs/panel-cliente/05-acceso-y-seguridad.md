# 05 — Acceso con doble factor y seguridad

| Estado | Versión | Última actualización | Aprueba |
|---|---|---|---|
| Borrador | 0.2 | 10 nov 2026 | Santiago |

> **Alcance (D-105):** este acceso es para el panel de **Arata San** y, más adelante, para clientes de **página web**. Los catálogos (Arata Print, Caravana) tienen su propio sistema y su propia base de datos: no se tocan.
>
> **Base de datos: Neon** (D-107, solo para este proyecto). Reemplaza la primera versión con Supabase (D-106). El resto de la agencia sigue con Supabase.

---

## 1. Cómo funciona

| Pieza | Herramienta | Dónde |
|---|---|---|
| Base de datos | **Neon** (Postgres), proyecto `arata-panel` | `db/panel/*.sql` |
| Cuentas, sesión y doble factor | **Better Auth** (corre dentro de Next.js y guarda todo en Neon) | `lib/panel/auth.ts`, rutas en `/api/auth/*` |
| Protección de rutas | `proxy.ts` (Next 16, reemplaza a `middleware.ts`) + layout del servidor | `proxy.ts`, `app/(panel)/panel/(app)/layout.tsx` |
| Pantallas | `/panel/entrar` y `/panel/doble-factor` | `components/panel/acceso/` |

```
/panel/…  ──► proxy.ts ──┬─ sin cookie de sesión ──────────► /panel/entrar         (correo + contraseña)
                         │   (o con entrada a medias) ─────► /panel/doble-factor   (código de la app)
                         └─ con cookie ─► layout del servidor revisa en la base:
                                          sesión válida + doble factor activo ──► módulos del panel
                                          sin doble factor activo ─────────────► /panel/doble-factor (activar)
```

| Paso | Pantalla | Qué pasa |
|---|---|---|
| 1 | `/panel/entrar` | Correo + contraseña. Mismo mensaje si el correo o la contraseña están mal (no revela qué cuentas existen) |
| 2a | `/panel/doble-factor` (primera vez) | Confirma la contraseña → QR o clave manual → código de 6 números → **10 códigos de respaldo** (se muestran una sola vez) |
| 2b | `/panel/doble-factor` (siguientes) | Código de 6 números, o un código de respaldo si no tiene el celular |
| — | Botón **Salir** | Cierra la sesión en la base y vuelve a `/panel/entrar` |

**Por qué es seguro:**

- **La base no se expone al navegador.** Solo el servidor de Next tiene `DATABASE_URL`. El navegador habla con `/api/auth` y con las páginas del mismo dominio; nunca ve la conexión. (Con Supabase el navegador hablaba directo con la base y la protección dependía de reglas RLS; aquí no hace falta.)
- **Con doble factor activo, no hay sesión hasta el código.** Better Auth deja la entrada "pendiente" con una cookie temporal; la API de sesión responde `null` hasta verificar.
- **El servidor revisa cada vez** en la base que la sesión sea válida y que el doble factor esté activo antes de pintar un módulo. Toda consulta futura de datos pasa por `lib/panel/sesion.ts` y se limita a los negocios donde la persona es miembro (`negociosDe`).
- **Límites de intentos** guardados en la base (en Vercel la memoria no se comparte entre servidores): 5 entradas por minuto y 5 códigos por minuto; **5 códigos equivocados seguidos bloquean la cuenta 15 minutos**.
- **Sin registro abierto:** `/api/auth/sign-up/email` responde error. Las cuentas solo se crean con `scripts/panel-crear-usuario.mjs`.
- Contraseñas de 12 a 128 caracteres, guardadas con hash (scrypt) por Better Auth.
- Cookies de sesión `httpOnly`, `secure` en producción, `sameSite=lax`. Better Auth revisa el origen de cada petición (protección CSRF).
- Sin variables, `/api/auth` responde 404 y el panel queda en **modo ejemplo** (como está publicado hoy).

## 2. Base de datos

| Archivo | Qué crea |
|---|---|
| `db/panel/001_cuentas.sql` | Tablas de Better Auth: `user`, `session`, `account`, `verification`, `twoFactor`, `rateLimit`. **Generado por el propio Better Auth** (`getMigrations`) con las opciones de `lib/panel/auth.ts` |
| `db/panel/002_panel.sql` | `negocios` (solo tipo `agencia` o `pagina-web`), `miembros`, métricas, clientes, ventas, proyectos, tareas, configuración del sitio con historial, vista `clientes_resumen` y el negocio **Arata San** |

`scripts/panel-migrar.mjs` las aplica en orden y anota cada una en `_migraciones_panel`, así que correrlo dos veces no repite nada.

> Si se cambian los plugins u opciones de Better Auth, hay que regenerar `001` (o crear un `003` con lo nuevo) y actualizar `scripts/panel-crear-usuario.mjs`.

## 3. Puesta en marcha (una sola vez)

### 3.1 Neon

- [ ] Crear cuenta en [neon.tech](https://neon.tech) (plan gratis) y un proyecto **`arata-panel`**, región **AWS us-east-1** (la más cercana a Colombia y a Vercel).
- [ ] En **Connect**, copiar la cadena con **Pooled connection** (termina en `?sslmode=require`).

### 3.2 Variables

Crear `.env.local` en la raíz (está en `.gitignore`; la plantilla es `.env.example`):

```
DATABASE_URL=postgresql://…-pooler….neon.tech/neondb?sslmode=require
BETTER_AUTH_SECRET=   ← generar con: openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000
```

Las tres son **solo del servidor**: nunca llevan el prefijo `NEXT_PUBLIC_`.

### 3.3 Crear la base y tu usuario

```bash
node --env-file=.env.local scripts/panel-migrar.mjs
```

```bash
node --env-file=.env.local scripts/panel-crear-usuario.mjs TU-CORREO "Sergio" arata-san dueno
```

El segundo comando muestra **una sola vez** una contraseña fuerte generada al azar: guárdala de inmediato en tu gestor de contraseñas.

### 3.4 Primera entrada

1. `npm run dev` → abrir `http://localhost:3000/panel` → te lleva a **Entrar**.
2. Correo + contraseña → el panel pide **activar el doble factor**: confirma la contraseña, escanea el QR con tu app de autenticación (Google Authenticator, 1Password, Authy…) y escribe el código.
3. Guarda los **10 códigos de respaldo** en tu gestor de contraseñas. No se vuelven a mostrar.
4. Desde ahí, cada entrada pide contraseña + código.

### 3.5 Producción (Vercel)

- [ ] Vercel → Settings → Environment Variables: `DATABASE_URL`, `BETTER_AUTH_SECRET` (**distinto** al de local) y `BETTER_AUTH_URL=https://www.aratasan.com`, en Production. Para Preview, usar una **rama de Neon** aparte, no la base de producción.
- [ ] Volver a desplegar: las páginas del panel pasan de "modo ejemplo" a pedir acceso.

## 4. Si se pierde el celular

1. Entrar con **uno de los códigos de respaldo** ("No tengo el celular: usar un código de respaldo"). Cada código sirve una vez.
2. Sin códigos de respaldo: alguien de Arata, **después de confirmar por llamada o en persona** que es el dueño, borra el doble factor en Neon (SQL Editor):

```sql
delete from "twoFactor" where "userId" = (select id from "user" where email = 'CORREO');
update "user" set "twoFactorEnabled" = false where email = 'CORREO';
delete from session where "userId" = (select id from "user" where email = 'CORREO');
```

3. La persona entra con su contraseña y el panel le pide activar el doble factor otra vez.

## 5. Reglas que no se rompen

- **Nunca** apuntar `DATABASE_URL` a la base de un catálogo, ni crear negocios de catálogo aquí. La base rechaza cualquier `tipo` distinto de `agencia` o `pagina-web`.
- `DATABASE_URL` y `BETTER_AUTH_SECRET` nunca en el repositorio, nunca en el navegador, nunca con `NEXT_PUBLIC_`.
- Toda consulta de datos del panel se hace en el servidor y filtra por `negociosDe(usuarioId)`.
- Cada guardado de "Mi sitio" deja una copia en `config_sitio_versiones` con quién lo hizo.
- **Recomendado en Neon:** crear un rol `panel_app` con solo permisos de leer y escribir datos (sin crear ni borrar tablas) y usarlo en `DATABASE_URL` de Vercel; el rol dueño queda solo para migraciones.

## 6. Pruebas (10 nov 2026)

Corridas con un Postgres local (PGlite) en lugar de Neon, `next build` + `next start`, Chromium (iPhone 13).

| # | Prueba | Resultado |
|---|---|---|
| 1 | Abrir `/panel/clientes` sin sesión | ✅ Lleva a `/panel/entrar` |
| 2 | Contraseña equivocada | ✅ "Correo o contraseña incorrectos." |
| 3 | Contraseña correcta (primera vez) | ✅ Lleva a activar el doble factor |
| 4 | Intentar abrir `/panel` sin activar el doble factor | ✅ Vuelve a `/panel/doble-factor` |
| 5 | QR y clave manual | ✅ Visibles |
| 6 | Código equivocado | ✅ "Ese código no sirve…" |
| 7 | Código correcto | ✅ Activa y muestra 10 códigos de respaldo |
| 8 | "Ya los guardé" | ✅ Entra al panel |
| 9–10 | Salir y volver a abrir un módulo | ✅ Lleva a `/panel/entrar` |
| 11 | Con contraseña pero sin código, abrir `/panel` | ✅ Lleva a `/panel/doble-factor` |
| 12 | Contraseña + código | ✅ Entra al panel |
| 13 | Contraseña + código de respaldo | ✅ Entra al panel |
| 14 | Pedir la sesión a la API antes del código | ✅ `null` (no hay sesión) |
| — | 6.º intento de entrada en el mismo minuto | ✅ "Demasiados intentos…" |
| — | Registro abierto (`/api/auth/sign-up/email`) | ✅ Rechazado |
| — | Correr la migración dos veces | ✅ No repite nada |
| — | Crear usuario en un negocio que no existe | ✅ Rechazado |
| — | Sin variables: `/panel`, `/panel/entrar`, `/panel/doble-factor` | ✅ Modo ejemplo; `/api/auth` → 404 |

Repetir 1–14 en Neon real antes de dar acceso a cualquier cliente de página web.

## 7. Pendiente

| # | Qué | Quién |
|---|---|---|
| 1 | Crear el proyecto Neon `arata-panel` y `.env.local` (§3.1–3.2) | Sergio |
| 2 | Correr la migración y crear tu usuario (§3.3), primera entrada (§3.4) | Sergio |
| 3 | Variables en Vercel y nuevo despliegue (§3.5) | Santiago |
| 4 | Los módulos leen y escriben en Neon (hoy siguen con datos de ejemplo) | Siguiente paso |
| 5 | Pantalla "olvidé mi contraseña" (hoy la cambia Arata) | Después |
| 6 | Rol `panel_app` con permisos mínimos (§5) | Santiago |
