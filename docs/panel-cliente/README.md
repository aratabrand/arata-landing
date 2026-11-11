# Blueprint — Panel del cliente

| Estado | Versión | Última actualización | Aprueba |
|---|---|---|---|
| En revisión | 0.1 | 10 nov 2026 | Sergio (diseño y copy) · Santiago (datos e integraciones) |

Este folder documenta **el panel** para ver cómo va el negocio y manejarlo desde un solo lugar. Sirve para dos cosas:

1. Usarlo en **Arata San** primero (en `/panel`, con acceso por contraseña + doble factor).
2. **Repetirlo después en clientes de página web** sin empezar de cero: mismas piezas, mismos datos, otro negocio.

> **A quién aplica (D-106):** primero **Arata San** (Sergio lo prueba con la agencia). Después, solo clientes de **página web**. Los clientes de **catálogo** (Arata Print, Caravana…) **no** usan este panel: tienen su propio sistema y su propia base de datos. No se mezclan ni en código ni en base de datos.
>
> **Base de datos del panel: Neon + Better Auth** (D-108), solo para este proyecto. El resto de la agencia sigue con Supabase.


> **Regla:** si se decidió, se escribe en [`../decisiones.md`](../decisiones.md). Si se construyó, se documenta aquí.

---

## Cómo está organizado

| Archivo | Qué contiene |
|---|---|
| [`00-plan.md`](00-plan.md) | Objetivo, para quién es, módulos, qué entra en el MVP y qué después, fases, decisiones pendientes y riesgos |
| [`01-arquitectura.md`](01-arquitectura.md) | Rutas, navegación y cada módulo pieza por pieza: qué muestra, de dónde sale el dato y qué puede hacer el cliente |
| [`02-modelo-de-datos.md`](02-modelo-de-datos.md) | Tablas (Neon), acceso por negocio, definición exacta de cada métrica e integraciones (GA4, Instagram, ventas, n8n) |
| [`03-sistema-de-diseno.md`](03-sistema-de-diseno.md) | Cómo se aplica el sistema v2 de Arata al panel: marco, componentes, gráficos, movimiento, accesibilidad y palabras del panel |
| [`04-construccion.md`](04-construccion.md) | Carpetas y archivos, cómo montar el panel de un cliente nuevo (lista paso a paso), cómo pasar de datos de ejemplo a Supabase, seguridad y verificación |
| [`06-finanzas.md`](06-finanzas.md) | **Finanzas y Equipo (solo Arata San):** reparto de ganancia (bolsa por horas + % de socios y empresa), gastos, fondos, punto de equilibrio, proyección y quién ve qué |
| [`05-acceso-y-seguridad.md`](05-acceso-y-seguridad.md) | **Acceso con doble factor** (Neon + Better Auth), cómo crear la base y el usuario de Sergio, qué hacer si se pierde el celular y pruebas de seguridad |

## Dónde se ve

| Ruta | Qué es |
|---|---|
| `/panel` | Resumen: ventas, visitas del sitio, Instagram y clientes que compran |
| `/panel/clientes` | Lista de clientes con búsqueda, filtros, ficha y alta |
| `/panel/proyectos` | Tablero tipo to-do por fases |
| `/panel/sitio` | Títulos, descripciones, portada, franja de anuncio y botones, con vista previa |
| `/panel/finanzas` | **Solo Arata San.** Resumen, proyectos, gastos, reparto y proyección (datos reales en Neon) |
| `/panel/equipo` | **Solo Arata San.** Cuánto gana cada uno, por proyecto y en total |
| `/panel/entrar` | Paso 1 del acceso: correo y contraseña |
| `/panel/doble-factor` | Paso 2: código de la app de autenticación (la primera vez, se activa con un QR) |

Todo el panel es `noindex`, no va en el sitemap y `robots.txt` bloquea `/panel`. Los módulos todavía muestran **datos de ejemplo** (Panadería La Espiga, negocio ficticio de página web) y lo dicen en pantalla. Con las variables de Neon y Better Auth puestas, el panel pide contraseña + doble factor.

## Código

| Qué | Dónde |
|---|---|
| Rutas | `app/(panel)/panel/` |
| Componentes | `components/panel/` |
| Tipos (el contrato de datos) | `content/panel/tipos.ts` |
| Datos de ejemplo | `content/panel/demo.ts` |
| Entrada única de datos | `lib/panel/datos.ts` → `obtenerPanel()` |
| Formatos y cálculos | `lib/panel/formato.ts` |
| Guardado (demo: navegador) | `lib/panel/guardado.ts` |
| Estilos propios | `app/globals.css`, bloque "Panel del cliente" (`.pn-*`) |
| Acceso (protección de rutas) | `proxy.ts` + `app/(panel)/panel/(app)/layout.tsx` |
| Pantallas de acceso | `app/(panel)/panel/(acceso)/`, `components/panel/acceso/` |
| Cuentas y doble factor | `lib/panel/auth.ts` (Better Auth), `lib/panel/auth-cliente.ts`, `app/api/auth/[...all]/route.ts` |
| Sesión y negocios del usuario | `lib/panel/sesion.ts` |
| Conexión a Neon | `lib/panel/db.ts`, `lib/panel/config.ts` (variables en `.env.example`) |
| Base de datos | `db/panel/001_cuentas.sql`, `db/panel/002_panel.sql` |
| Scripts | `scripts/panel-migrar.mjs`, `scripts/panel-crear-usuario.mjs` |
