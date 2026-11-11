# 04 — Construcción y cómo montar un panel nuevo

| Estado | Versión | Última actualización | Aprueba |
|---|---|---|---|
| Borrador | 0.1 | 10 nov 2026 | Santiago |

---

## 1. Carpetas

```
app/(panel)/panel/
  layout.tsx            Marco + metadatos noindex (lee el negocio con obtenerPanel)
  page.tsx              Resumen
  clientes/page.tsx
  proyectos/page.tsx
  sitio/page.tsx
components/panel/
  PanelShell.tsx        Barra lateral, pestañas, franja de demo  ("use client": usa la ruta activa)
  ui.tsx                PanelPage, PanelHeader, Tarjeta, Delta, Pill (servidor o cliente)
  graficos.tsx          Gráficos SVG
  Resumen.tsx           Módulo 1
  Clientes.tsx          Módulo 2 (+ Hoja, reutilizada en Proyectos)
  Proyectos.tsx         Módulo 3
  ConfigSitio.tsx       Módulo 4
content/panel/
  tipos.ts              Contrato de datos
  demo.ts               Negocio de ejemplo (determinístico: mismos números en servidor y navegador)
lib/panel/
  datos.ts              obtenerPanel(): ÚNICA entrada de datos
  formato.ts            pesos, números, fechas, sumas por periodo, variación
  guardado.ts           useGuardado (demo: localStorage) + nuevoId
```

- Las páginas son del servidor y pasan los datos como props; los módulos son componentes cliente (tienen estado).
- El grupo `(panel)` tiene **su propio layout**: no hereda el menú ni el footer del sitio.
- `robots.ts` bloquea `/panel` para todos los bots; el layout pone `noindex, nofollow, nocache`; no está en el sitemap.
- La CSP del sitio (`next.config.mjs`) ya cubre el panel: no carga nada de afuera.

## 2. Montar el panel para un cliente nuevo (lista)

Hasta la fase 4 (demo):

- [ ] Copiar `content/panel/demo.ts` y cambiar `negocio` (nombre, contacto, plan, sitio, Instagram, WhatsApp).
- [ ] Dejar `demo: true` mientras los datos no sean reales.
- [ ] Ajustar `configSitio` con los textos y botones reales de su página.
- [ ] Cargar sus proyectos reales con Arata (fases y tareas).

Con datos reales (fase 4 en adelante):

- [ ] Crear la fila en `negocios` (con `ga4_propiedad`, `instagram_id`, `whatsapp`).
- [ ] Invitar al dueño (Supabase Auth → enlace mágico) y crear su fila en `miembros` con rol `dueno`. Agregar a Arata con rol `arata`.
- [ ] Dar acceso de **lector** de su propiedad GA4 a la cuenta de servicio de n8n.
- [ ] Verificar que su sitio manda el evento `clic_whatsapp` en todos los botones de WhatsApp.
- [ ] Conectar su Instagram Business a la app de Meta y guardar el token en n8n.
- [ ] Decidir de dónde salen sus ventas (P-3) y activar el flujo `panel-ventas` que corresponda.
- [ ] Correr los flujos de n8n a mano una vez y revisar que `metricas_diarias` tenga datos de ayer.
- [ ] Llenar 180 días hacia atrás desde GA4 e Instagram (lo que la API permita) para que haya comparación.
- [ ] Cargar `config_sitio` con los textos actuales de su página.
- [ ] **Prueba de aislamiento** (§5) antes de mandarle el enlace.
- [ ] Mandarle el enlace y una nota de voz de 1 minuto explicando los 4 módulos.

## 3. Pasar de demo a Supabase (una sola vez, para todos los clientes)

> **Actualizado (D-108): la base es Neon y el acceso es Better Auth**, no Supabase. Hechos el 10 nov 2026: base (`db/panel/`), acceso con doble factor, protección con `proxy.ts` (Next 16 reemplaza `middleware.ts`) y pantallas de entrada. Los pasos 1–5 de abajo quedan como referencia de la versión con Supabase; la guía vigente es `05-acceso-y-seguridad.md`. Pendientes: 6, 7 y 8 (que los módulos lean y escriban en Neon).

1. Crear tablas, vistas y políticas de `02-modelo-de-datos.md` §2 como migraciones.
2. Instalar `@supabase/supabase-js` y `@supabase/ssr`. Variables en `.env.local` (nunca commiteado): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. La service key **no** va en Next.
3. Agregar `connect-src https://<proyecto>.supabase.co` a la CSP de `next.config.mjs`.
4. `middleware.ts` para `/panel/:path*`: si no hay sesión → `/panel/entrar`.
5. Página `/panel/entrar`: correo → enlace mágico (Supabase Auth). Mismo diseño v2.
6. Reescribir `lib/panel/datos.ts` → `async function obtenerPanel()` que lee con la sesión del usuario y devuelve las formas de `tipos.ts`. Las páginas pasan a `async` y dejan de ser estáticas (`dynamic = "force-dynamic"`).
7. Reemplazar `useGuardado` en cada módulo por Server Actions (`agregarCliente`, `moverProyecto`, `guardarConfigSitio`…) con validación en el servidor (mismas reglas de `ConfigSitio.tsx`: largos y `enlaceValido`).
8. `guardarConfigSitio`: guarda en `config_sitio`, inserta en `config_sitio_versiones` y revalida el sitio del cliente (§4).
9. Quitar la franja de demo cuando `negocio.demo` sea `false` (ya funciona así).

## 4. Cómo llegan los cambios de "Mi sitio" a la página del cliente

| Sitio del cliente | Cómo se aplica |
|---|---|
| Next.js de Arata | La página lee `config_sitio` en el build/ISR; al guardar, el panel llama un endpoint de revalidación del sitio (con secreto en `.env`) |
| WordPress + Elementor | n8n recibe el cambio y actualiza por la REST API de WP (título SEO con el plugin de SEO; textos/botones como campos globales) |
| Framer | Por ahora manual: n8n avisa a Arata con el cambio y se aplica en Framer. Después: CMS de Framer |
| Shopify | n8n actualiza por la Admin API (metacampos de la tienda) |

## 5. Seguridad (antes de cada lanzamiento)

- [ ] RLS encendido en **todas** las tablas (`select relname from pg_class where relrowsecurity = false` no debe listar tablas del panel).
- [ ] **Prueba de aislamiento:** con dos usuarios de negocios distintos, el usuario A no puede leer ni escribir nada del negocio B (ni cambiando el id en la URL ni llamando la API).
- [ ] La service key solo existe en n8n y en el servidor.
- [ ] Validación en el servidor de todo lo que entra (no confiar en la del navegador).
- [ ] Enlaces de botones: solo `https://`, `/ruta`, `tel:`, `mailto:` (función `enlaceValido`).
- [ ] Enlaces externos con `rel="noopener noreferrer"`.
- [ ] Sin `innerHTML` con datos del cliente; React escapa los textos.
- [ ] Panel con `noindex` y bloqueado en `robots.txt`.

## 6. Verificación (lo que se probó en la construcción)

Medido el 10 nov 2026 con Playwright sobre `next build` + `next start` (escritorio 1440 × 900 y iPhone 13):

| Prueba | Resultado |
|---|---|
| Build y TypeScript | ✅ sin errores; las 4 rutas salen estáticas |
| Errores de JavaScript en las 4 rutas | ✅ ninguno |
| Scroll horizontal en celular y escritorio | ✅ 0 px |
| Agregar cliente → aparece → sigue tras recargar | ✅ |
| Mover proyecto con flecha y con arrastrar y soltar | ✅ |
| Mi sitio: título de 70 letras bloquea guardar | ✅ |
| Mi sitio: enlace `javascript:` bloquea guardar | ✅ |
| Guardar → aviso "Cambios guardados" → sigue tras recargar | ✅ |

Para repetirlo: arrancar `npm run build && npx next start` y recorrer las 4 rutas en celular. En animaciones, medir visibilidad real (clase `is-visible`), no solo que el texto exista (CLAUDE.md §10).

## 7. Pendiente

| # | Qué | Quién |
|---|---|---|
| 1 | Aprobar copy y diseño del panel en el preview (fases 1–2) | Sergio |
| 2 | Resolver P-1 a P-5 de `00-plan.md` | Sergio, Andrés, Santiago |
| 3 | Fase 4: Supabase + Auth + flujos de n8n | Santiago |
| 4 | Estado "Conecta tu Instagram" cuando no hay datos de Meta | Santiago (fase 4) |
| 5 | Elegir el cliente piloto | Andrés |
