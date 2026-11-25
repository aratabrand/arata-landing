# CLAUDE.md — Arata San

Contexto maestro del proyecto para Claude Code. Lee este archivo antes de trabajar en cualquier build de la agencia.

---

## 1. Qué es Arata San

Agencia digital en Bogotá, Colombia (`@arata.san.web`, sitio `aratasan.com`). Diseñamos **páginas, catálogos y sistemas** para negocios que quieren clientes por internet: hechos primero para el celular, rápidos y fáciles de encontrar en Google y en la IA. Objetivo del sitio: **agendar una reunión** (`/agendar`, Cal.com).

**Ya no se vende el paquete "página + agente de WhatsApp con IA + automatización"** (v1). El chatbot con IA y la automatización dejaron de ser servicios públicos; Sara ya no se usa (D-169). La oferta vigente sale de `docs/blueprint/00-plan-maestro.md` §2 y `content/servicios.ts`:

| Servicio | Paquete | Precio | Entrega |
|---|---|---|---|
| Páginas que venden | **Página Lista en 5 Días** (5 secciones, dominio y hosting el primer año, 2 rondas de ajustes, capacitación) | Desde 400 USD | 5 días hábiles |
| Catálogos y sistemas a medida | **Tienda por WhatsApp en 5 Días** (catálogo con carrito, pedido ordenado al WhatsApp, panel, inventario) | Desde 800 USD | 5 días hábiles |
| Catálogos y sistemas a medida | **Tu Negocio en Orden** (reservas, menú digital, registro de clientes/CRM) | Se cotiza | Según el sistema |

- **Garantía de velocidad:** 90 o más en PageSpeed móvil o se sigue ajustando gratis.
- **Pago:** 50 % para arrancar y 50 % al entregar. **Mantenimiento opcional:** 15 % del valor del proyecto al mes (D-022). **Cupos:** 4 proyectos nuevos al mes, uno por semana (D-172).
- **Adicional:** panel para editar la página y ver métricas (se cotiza aparte, D-034).
- Portafolio real: Danrodedm, Boost Your Menu, Arata Print y Caravana (`docs/portafolio.md`).

### Equipo

| Persona | Rol |
|---|---|
| Sergio | Estrategia digital, landing pages, Meta Ads, UX, contenido, diseño de producto (Figma) y **programación** (sitio, panel y builds en Claude Code, desde nov 2026). Aprueba copy y decisiones de marca. |
| Andrés | Líder comercial, relación con clientes, sourcing de producto. |
| Santiago | Automatización: flujos n8n y conexiones entre herramientas. |

Flujo típico: Sergio define el sistema/diseño (tokens Figma, marca) y lo construye con Claude Code; Santiago automatiza (n8n).

---

## 2. Reglas de lenguaje y copy (CRÍTICO)

Todo el copy (carruseles, landings, scripts del agente) va en **español colombiano plano**. Sin jerga de marketing. Sin voseo argentino.

Sustituciones obligatorias:

| No usar | Usar |
|---|---|
| ROI | te devuelve |
| conversión | clientes que compran |
| cargar | abrir |
| abandonan | se sale |
| ecosistemas (como jerga) | (quitar) |

Principios de copy:
- **Copy antes que diseño.** Sergio aprueba el copy en un ciclo dedicado antes de que empiece el diseño. Evita rework.
- **Varias versiones para elegir** cuando se itera copy o diseño.
- Frases directas, sin decoración.

---

## 3. Sistema de marca

### Tokens de color

| Token | Valor |
|---|---|
| Brand primary | `#7D53FF` (morado) |
| Accent | `#B6FF00` (lima) |
| Text primary | `#03010B` |
| Text secondary | `#3B1D99` |
| Text on-brand | `#FFFFFF` |
| Surface subtle | `#FFFFFF` |
| Surface brand | `#03010B` |

### Tipografía
- **Funnel Display Bold** → títulos y números.
- **Plus Jakarta Sans Regular** → cuerpo y labels.

### Reglas visuales (carruseles de Instagram)
> Para el sitio y el panel manda [`docs/sistema-de-diseno.md`](docs/sistema-de-diseno.md); estas reglas son para los carruseles (§5).

- Slides con fondo morado `#7D53FF` = **color plano sólido**. Sin gradientes, sin orbes oscuros, sin overlays.
- El espacio vacío se llena con **data útil** (stat pills, grids de sub-métricas), no con decoración.
- Estética de charts: **dashboard-premium** — donuts/rings (número XL centrado + punta de arco con dot brillante), barras horizontales/verticales con endpoints redondeados, gauges de 180° con marcas de escala. Todo dentro de glass cards con `backdrop-filter: blur`, líneas de grid muy sutiles.

---

## 4. Stack técnico

Se suman herramientas; no se deja ninguna. Cada proyecto usa la que mejor le sirve.

| Área | Herramienta |
|---|---|
| Páginas web de clientes (Página Lista en 5 Días) | **Astro** (D-171) |
| Sitios multi-cliente | WordPress + Elementor |
| Proyectos individuales | Framer (incluye hosting/dominio) |
| Sitio y panel de Arata San | Next.js + TypeScript + Tailwind, en Vercel |
| E-commerce | Shopify Basic + Wompi |
| Base de datos | **Supabase** (clientes) · **Neon** + Better Auth (solo el panel de Arata, D-108) |
| Agenda | Cal.com (webhook firmado al panel, D-133) |
| Automatización | n8n (Santiago) |
| IA | OpenAI |
| Ads & tracking | Meta Ads + Meta Pixel (en WordPress, con el plugin WPCode en el header); GA4 + Search Console con permiso de cookies (D-130) |

---

## 5. Pipeline de carruseles (Instagram)

Skill: `carrusel-studio`. Produce carruseles publicables de 8–12 slides.

### Render
- **Python + Playwright** (Chromium headless) para renderizar.
- **Pillow** para montaje/ZIP.
- Viewport **1080×1350px** con `device_scale_factor=2` → PNGs retina **2160×2700px**.
- Output a `/mnt/user-data/outputs/` vía `present_files`.

### Fuentes
- Funnel Display Bold + Plus Jakarta Sans Regular vía paquetes npm `@fontsource`.
- Se extraen del tgz, se codifican base64 como bloques `@font-face` woff2 embebidos directamente en el `<style>` del HTML. **Sin dependencias de red.**

### Detalles de rendering
- `page.wait_for_timeout(2500)` después de `document.fonts.ready` (necesario para que carguen las fuentes).
- Ocultar el botón de descarga con `page.evaluate` antes del screenshot.
- Logo desde `/mnt/user-data/uploads/LOGO.png`, recortado por canal alpha con PIL y embebido en base64.

### Charts
- Todos los componentes (donuts, gauges, barras, tablas comparativas) son **funciones Python que devuelven SVG inline** usando `math.pi/cos/sin`. **Sin librerías de charting externas.**

Series ya construidas: "7 Cifras de IA para tu negocio" y "Plantilla vs Profesional".

---

## 6. Agente de WhatsApp "Sara" (ya no se usa)

**Sara se dejó de usar (D-169, nov 2026).** No contar con ella en ningún flujo nuevo: el WhatsApp de Arata lo contesta una persona. Lo que hagan otros documentos con Sara (panel, plan maestro) es historia.

---

## 7. Apps en desarrollo (MVPs)

> **Por confirmar:** Mesa y Dental no aparecen en el blueprint v2. Hoy reservas, menú digital y CRM se venden dentro de *Tu Negocio en Orden*.

| App | Descripción | Estado |
|---|---|---|
| **Mesa** | Gestión de restaurantes | Sergio lidera diseño en Figma → Santiago construye con Claude Code |
| Dental | Gestión de clínica dental | Diseño Figma → build Claude Code |
| Dashboard cliente | Conectado a n8n + sistema de inventario por código de barras de Santiago | Planeado |

Progresión: **sistema Figma → build Claude Code**.

---

## 8. Convenciones para Claude Code

- Respetar tokens de marca y reglas de copy de este archivo en cualquier UI o contenido.
- Español colombiano plano en toda interfaz de cara al usuario.
- Secretos (API keys, tokens de Meta/OpenAI/Supabase) van en `.env`, **nunca commiteados**.
- Salidas modulares: preferir respuestas tipo tabla, no prosa larga.
- Iteración dirigida: cambios puntuales a slides/elementos específicos, no rebuilds completos.
- **Ofertas, precios, promociones, garantías, bonos o pitch:** usar la skill `alex-hormozi-pitch` (`.claude/skills/alex-hormozi-pitch/`): crear (Flujo A) o auditar (Flujo B) con el método de *$100M Offers*, sin inventar datos y con la Ley 1480 (D-196). Última auditoría: `docs/campanas/auditoria-oferta-2026-11-24.md`.

---

## 9. Landing v1 (retirada)

La v1 de la landing (alternancia blanco/oscuro, sin precios, CTA único a WhatsApp, LightRays) ya no aplica y se quitó de aquí: manda la §11 y [`docs/sistema-de-diseno.md`](docs/sistema-de-diseno.md). La base técnica de la §10 sigue vigente.

---

## 10. Landing page — SEO, GEO, seguridad y rendimiento (checklist reusable)

Estándar técnico para toda landing en Next.js. Todo esto quedó implementado y verificado en la landing de Arata.

### SEO (archivos que SIEMPRE deben existir)
- `app/layout.tsx` con `metadata`: `title`, `description`, `metadataBase`, **`alternates: { canonical: "/" }`**, `openGraph` (con `images`), `twitter` (con `images`), `robots`.
- **Structured data** JSON-LD (`ProfessionalService`/`Organization`) vía `<script type="application/ld+json">` con `dangerouslySetInnerHTML` de un objeto estático.
- `app/sitemap.ts` y `app/robots.ts` (Metadata Routes de Next → generan `/sitemap.xml` y `/robots.txt`).
- `app/icon.svg` = favicon (usar la marca del logo sobre fondo `#03010B`).
- `app/not-found.tsx` = 404 de marca (oscura, con vuelta al inicio), `robots: { index:false }`.
- **og:image**: PNG 1200×630. `next/og` **falla en Windows si la ruta del proyecto tiene espacios** ("ARATA SAN WEB") → genera un PNG estático con `sharp` a `public/og.png` y referéncialo en el metadata. (Sergio puede reemplazarlo con un export de Figma con el mismo nombre.)
- `<html lang="es-CO">`. Un solo `<h1>` por página.

### GEO (que las IA lean y citen el sitio)
- **`public/llms.txt`** (formato llmstxt.org): resumen del negocio + qué hacemos + contacto.
- En `robots.ts`, **permitir explícitamente** los bots de IA: GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, anthropic-ai, PerplexityBot, Google-Extended, Applebot-Extended, CCBot.
- Contenido **server-rendered** (SSG) para que los crawlers lo lean sin ejecutar JS.

### Seguridad
- **Cabeceras en `next.config.mjs`** (`headers()`): `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`. Además `poweredByHeader: false`.
- **⚠️ GOTCHA CRÍTICO — CSP y `unsafe-eval`:** Next en **desarrollo usa `eval`** (Hot Reload). Una CSP sin `'unsafe-eval'` rompe el `npm run dev`: no hidrata, y todo lo que depende de JS (reveals, framer, contadores) queda en `opacity:0` → **se ve solo el hero (CSS) y el resto en blanco**. Solución: incluir `'unsafe-eval'` y `ws:` **solo si `process.env.NODE_ENV === "development"`**; producción va estricta. Producción NO usa eval, así que no se rompe.
- Enlaces `target="_blank"` **siempre** con `rel="noopener noreferrer"` (anti-tabnabbing).
- Secretos en `.env` (nunca commiteados); nada de `eval`/`new Function`/`innerHTML` dinámico.
- Con dominio en Cloudflare + Vercel: modo **proxied (naranja) + SSL "Full (strict)"** suma WAF y anti-DDoS gratis (si se deja "Flexible" → bucle de redirección).
- **Cookies (Ley 1581 / Decreto 1377):** si hay Analytics o píxel, **aviso de cookies con Aceptar, Rechazar (mismo peso) y Preferencias**; nada de medición hasta que acepten (sin casillas marcadas). Consent mode de Google en "denied" por defecto y el contenedor de GTM **no se pide** sin permiso; sin `<noscript>` de GTM. Elección guardada 12 meses y reabrible desde el footer; al retirar el permiso se borran `_ga`. Base reutilizable: `lib/consentimiento.ts` + `components/CookieBanner.tsx` (D-130). **Un permiso por finalidad:** Analytics (contar visitas) y, si hay mapas de clics o grabaciones (Microsoft Clarity), un segundo permiso aparte, con los campos de formularios enmascarados (`data-clarity-mask`), la política y la casilla de autorización actualizadas en el mismo cambio (D-132, se enciende en `lib/clarity.mjs`).
- **Formularios:** `type`, `inputMode`, `autoComplete` y `maxLength` en cada campo; máscara de teléfono (+57 300 000 0000); limpiar caracteres de control y `< >`; validar URL con `new URL` y rechazar `javascript:`/`data:`. Si el formulario no pasa por un servidor propio (Cal.com, WhatsApp), el anti-bot es en el navegador (campo trampa, tiempo mínimo, límite de intentos) y el límite real se configura en el servicio externo. Si hay endpoint propio: rate limit en el servidor. Base: `lib/formulario.ts` (D-131).

### Rendimiento
- Página estática (SSG), fuentes locales con `display: swap`, gráficos en SVG (sin peso de imágenes).
- **Diferir dependencias pesadas** con `next/dynamic` + `ssr:false` (ej. `ogl`/LightRays) para sacarlas del bundle inicial. First Load objetivo < 150 KB.
- **Reveals al scroll: usar `IntersectionObserver` (fuera del hilo principal) + un chequeo inmediato de `getBoundingClientRect` al montar** (helper `lib/inview.ts`). NO listeners de `scroll` por elemento (causan reflow/jank en móvil). El chequeo al montar cubre recargas a mitad de página que el observer solo no revelaría.
- Animar solo **`transform` y `opacity`** (compuestas por GPU). Evitar animar `width/height/top/left` (PageSpeed: "animaciones no compuestas").
- `browserslist` a navegadores modernos en `package.json` → reduce el "JavaScript heredado".

### Verificación (evitar falsos positivos)
- Para animaciones, medir **visibilidad real** (`opacity`, `is-visible`), NO solo `textContent`/conteo de nodos (leen el DOM aunque esté invisible).
- En el panel oculto de Claude el scroll y el `IntersectionObserver` no disparan; usar componentes con temporizador (ej. el chat en loop) como prueba de hidratación.
- Opacidades Tailwind: solo pasos válidos de la escala (o extenderlos en config). `bg-white/8` NO es válido → sale invisible.

---

## 11. Proyecto en curso — sitio de agencia v2 (desde nov 2026)

La landing (secciones 9 y 10 = **v1**) se está reestructurando como **sitio de agencia** con un único objetivo: **agendar reuniones**. Servicios: (1) páginas que venden (landing desde 400 USD, 5 días hábiles), (2) catálogos y sistemas a medida (catálogo desde 800 USD, 5 días hábiles; sistemas cotizados). Promesa central: mobile-first y optimización. Estrategia de captación: método Hormozi. **Diseño v2: solo fondo oscuro, `#020104` (token `noche`, D-145; antes `#03010B`)** (reemplaza la alternancia blanco/oscuro de la v1) y **paquetes con precio visibles** (reemplaza "sin precios" de la v1).

- **Antes de trabajar en el sitio, lee [`docs/README.md`](docs/README.md)** y el plan maestro en `docs/blueprint/00-plan-maestro.md` (fase actual, decisiones pendientes).
- Toda decisión nueva se registra en `docs/decisiones.md`. **Número único para todo el proyecto (D-194):** pídelo con `npx -y tsx scripts/prueba-decisiones.ts --siguiente` (mira también `main`) y corre la prueba sin `--siguiente` antes de unir a `main`; si choca, se renumera la rama. En el código se cita la decisión vigente; una archivada solo como historia.
- Solo se construye lo que está `Aprobado` en el blueprint. Orden: oferta → copy → diseño → construcción.
- La base técnica de la sección 10 sigue vigente para la v2.
- **Sistema de diseño: [`docs/sistema-de-diseno.md`](docs/sistema-de-diseno.md) (v2.0) es la fuente única** para el sitio, el panel y todo producto nuevo; vistas previas en el artefacto «Arata San» (https://claude.ai/artifact/GtT3zLjfseXgTcjeRkeyih). Resumen vigente (estilo Kept, D-164 a D-168): **un solo estilo por componente** en el sitio y el panel; **lima para actuar, elegir y destacar** (botón principal lima con texto tinta `.v2-primario`, opción elegida lima sólido, tarjeta destacada en degradado lima `.v2-destacada` con botón negro adentro, precios con número en lima), **morado para datos y gráficas**, blanco, grises neutros (`fog` `#B8B8BE`, `fog-dim` `#8E8E96`) y negro para lo demás; todo lo que se toca es **píldora**; tarjetas **lisas** `#0F0F12`; la última palabra de los títulos en **cursiva con serifa lima** (`Acento`, Instrument Serif); fondo `#020104` con líneas verticales, haces y luces suaves con degradado lima que se mueve; íconos Phosphor `light`, sin íconos decorativos. **No usar:** botones morados, bloques morados con texto blanco, tarjetas blancas sobre oscuro, tarjetas con humo, luces moradas, cuadrícula, vidrio, grano, naranja, dos estilos para un componente. Las decisiones reemplazadas están en `docs/decisiones-archivo.md`.
- **Landings de campaña (D-189):** en `/lp/…` dentro del mismo sitio, grupo `app/(v2)/(campana)/` (sin menú, footer corto, siempre `noindex` y fuera del sitemap). Textos propios en `content/campanas/` que parten de los del sitio. Primera: `/lp/catalogos` (Meta, Tienda por WhatsApp). **Sus botones van directo al calendario** (`/lp/catalogos/agendar`, D-197): sin las preguntas de `/agendar` (son del sitio); el origen y el precio viajan en las notas de Cal.com («Necesito», «Inversión») y el WhatsApp lo pide Cal.com (pregunta `whatsapp`, lo lee `lib/panel/cal.ts`). Oferta de noviembre (D-198): «Todo lo que incluye tu tienda» antes del precio, bonos (te subimos tus primeros 30 productos, código QR para el local y los empaques, kit para compartir la tienda; D-201), garantía «Te la dejamos funcionando» y máximo 8 tiendas al mes solo en esta campaña.
- **Sitio v2 lanzado el 9 nov 2026 (D-091):** el Inicio v2 está en `/` y `/v2` redirige allí. Páginas en `app/(v2)/(sitio)/` (comparten menú y footer), componentes en `components/v2/`, contenido en `content/` (textos y portafolio se editan ahí), tokens v2 en `tailwind.config.ts`. Guía viva en `/sistema` (noindex). Interruptor de lanzamiento y SEO: `lib/lanzamiento.ts`, `lib/seo.ts`, `lib/schema.ts`; lista de lanzamiento en `docs/blueprint/06-seo-geo-velocidad.md` §6. Construcción y agenda: `docs/blueprint/05-construccion.md`. Reglas de velocidad aprendidas: `docs/blueprint/04-sistema-de-diseno.md` §12.

---

## 12. Panel del cliente (desde nov 2026)

Panel **primero para Arata San** y después **solo para clientes de página web o de aplicación a la medida** (D-106, D-122). **A los clientes de catálogo NO se les monta este modelo de panel**: tienen su propio sistema y su propia base; nunca mezclarlos. Eso es distinto de la lista de **Clientes de Arata** dentro del panel de la agencia: ahí va **cualquier cliente de cualquier servicio** (página, catálogo, sistema, mantenimiento). Módulos: **Resumen** (ventas, visitas, Instagram, clientes que compran), **Clientes**, **Proyectos** (tablero por fases) y **Mi sitio** (títulos, descripciones, botones). Mismo sistema de diseño que el sitio (`docs/sistema-de-diseno.md`), con modo oscuro y claro.

- **Antes de trabajar en el panel, lee [`docs/panel-cliente/README.md`](docs/panel-cliente/README.md).** Es el blueprint para repetirlo en cada cliente.
- Rutas en `app/(panel)/panel/`, componentes en `components/panel/`, contrato de datos en `content/panel/tipos.ts`, datos solo por `lib/panel/datos.ts` (`obtenerPanel()`).
- Hoy usa un negocio **de ejemplo** marcado en pantalla (`negocio.demo`). Nunca mostrar datos demo a un cliente real.
- **Base: Neon (solo este proyecto) + acceso con Better Auth: contraseña + doble factor (TOTP) + códigos de respaldo** (D-108; reemplaza Supabase en el panel). La base nunca se expone al navegador: solo el servidor consulta, por `lib/panel/sesion.ts`. Barreras: `proxy.ts` + layout de `(app)`. Migraciones en `db/panel/`, scripts `scripts/panel-migrar.mjs` y `scripts/panel-crear-usuario.mjs`, guía en `docs/panel-cliente/05-acceso-y-seguridad.md`. Sin `DATABASE_URL`/`BETTER_AUTH_SECRET`, el panel queda en modo ejemplo. Nunca apuntar a la base de un catálogo.
- **Finanzas y Equipo (`/panel/finanzas`, `/panel/equipo`): solo Arata San** (D-109), nunca para clientes. Venta = proyecto cerrado (COP). **Reparto (D-118):** ganancia = valor − gastos; primero los días trabajados (quién hizo qué × días × valor del día, $ 80.000, 1 día = 8 h, medios días) y lo que queda en partes iguales entre socios activos + Arata; se congela al cerrar. Roles: Sergio `dueno` (todo; solo él cambia el valor del día y el equipo), Andrés `finanzas` (edita Finanzas), Santiago `equipo` (ve y marca pasos). Cálculos en `lib/panel/finanzas/calculo.ts` (prueba: `npx -y tsx scripts/prueba-finanzas.ts`), guía en `docs/panel-cliente/06-finanzas.md`.
- **Clientes y servicios son listas** (tablas `clientes`, `servicios`): en los proyectos se eligen, nunca texto libre (D-110). Clientes de Arata y "Mi sitio" ya leen datos reales; Mi sitio parte de `content/inicio.ts` y guarda en Neon sin publicar todavía al sitio (D-111).
- **Estilo del panel:** barra lateral a la izquierda (en celular, pestañas abajo), contenido en `canvas` redondeado; modo oscuro y claro con interruptor al lado de la campana (cookie `pn-tema`); colores como variables de `[data-tema]` en `styles/panel.src.css` + `tailwind.panel.config.ts` (**nunca colores fijos en componentes**, salvo lima y tinta). Mismos componentes que el sitio (§11 y `docs/sistema-de-diseno.md`): `.pn-primario` lima, `.pn-secundario`, `.pn-pildora` / `.pn-pildora-activa` (lima sólido), `Pill` en semáforo (ámbar atención, verde bien, rojo mal), destacada `.v2-glass` en degradado lima, `.pn-aviso` al revés del fondo (oscuro: blanco con letras negras; claro: negro con letras blancas), `.pn-cita`, `.pn-interno`, contador lima en el menú. Menú elegido y cuenta: negros con ícono lima en claro, **lima con texto tinta en oscuro** (D-167). Cifras grandes y nombre del saludo: lima en oscuro, tinta en claro (`.pn-cifra`, nombre en cursiva). En claro el dato va en morado. Logo del panel de un solo color. El acceso va siempre en oscuro. Guía: `docs/panel-cliente/03-sistema-de-diseno.md`.
- **Proyectos de Arata (`/panel/proyectos`)**: grid + detalle `/panel/proyectos/[id]`; etapa y avance se calculan de los pasos (`fin_tareas`), plantillas por servicio en `lib/panel/finanzas/procesos.ts` (D-112).
- **Resumen de Arata con datos reales** (`lib/panel/resumen/agencia.ts`, prueba `scripts/prueba-resumen.ts`); visitas e Instagram pendientes de n8n (D-114). Todos pueden **marcar pasos** de proyectos (D-113); crear o quitar pasos es de `dueno` y `finanzas`. **Quién trabajó (D-125):** los días se ponen por persona y área (no por paso, D-124 revirtió D-123): en el formulario del proyecto al elegir "Cerrado" (con reparto en vivo, se guarda junto) o en la ficha del proyecto; solo `dueno`/`finanzas`.
- **Publicación (D-115): `panel.aratasan.com`, proyecto de Vercel aparte** del mismo repo (`PANEL_SOLO=1` + claves); el sitio solo lleva `PANEL_URL` (redirige `/panel`) y ninguna clave. Redirecciones fijas en `next.config.mjs`. **CSS del panel aparte y compilado FUERA de Next (D-135):** fuente `styles/panel.src.css` + `tailwind.panel.config.ts` → `styles/panel.generated.css` con `npm run panel:css` (lo corren solos `npm run build` y `npm run dev`, que además lo vigila); el layout del panel importa el generado. **Nunca usar `@config` ni dos configuraciones de Tailwind dentro de lo que procesa Next:** en Vercel, según el archivo que se procese primero, el sitio quedaba compilado con la configuración del panel y se veía sin estilos (título de 16 px, layout desarmado) y el panel **no importa piezas del sitio** (usa `components/panel/LogoPanel.tsx`, `lib/panel/inview.ts`): si las importara, Next las movería a archivos compartidos y el sitio descargaría más. Pasos en `docs/panel-cliente/05-acceso-y-seguridad.md` §3b.
- **Mi sitio publica (D-117):** Guardar = borrador (`config_sitio.datos`); Publicar = `config_sitio.publicado` + Deploy Hook (`SITIO_DEPLOY_HOOK`, solo en el panel). El sitio lee `panel.aratasan.com/api/sitio` **al construirse** (`lib/sitio-textos.ts`) y sigue estático; si el panel no responde, la construcción falla (o `SITIO_SIN_PANEL=1`). En el panel de la agencia no va "Escribirle a Arata San".
- **Historial y avisos (D-119):** toda acción del servidor llama `registrar()` (`lib/panel/historial.ts`): quién, qué, cuándo, antes → después; `importante: true` además manda aviso al celular (`lib/panel/push.ts`, Web Push con VAPID). Borrar proyectos y clientes: solo `dueno` (proyecto: alerta + escribir el nombre). Notificaciones en `/panel/notificaciones` (alertas de entrega `lib/panel/alertas.ts` + historial). **Notificaciones de cada persona (D-185):** campana y «Mis notificaciones» = cambios de otros de las últimas 24 h (se van solas), borrar una (X o deslizar) o «Borrar todas» solo para quien las borra (`notificaciones_borradas`, `borradas_hasta`, migración 020, `lib/panel/notificaciones.ts`, `components/panel/ListaNotificaciones.tsx`); el historial no se borra (pestaña «Historial del panel»). Aviso diario 8 a. m.: `app/api/avisos/diario` con `CRON_SECRET` (`vercel.json`). Clientes: nombre + celular, país y ciudad desde tablas (`paises`, `ciudades`; ciudad solo Colombia). Formularios con máscaras (`lib/panel/mascaras.ts`, `components/panel/campos.tsx`) y `*` / "Opcional". Pruebas: `scripts/prueba-alertas.ts`, `scripts/prueba-mascaras.ts`.
- **Interesados desde Cal.com (D-133):** quien agenda en `/agendar` llega por webhook firmado (`app/api/cal/webhook`, `CAL_WEBHOOK_SECRET` solo en el panel, `lib/panel/cal.ts`) a la tabla `interesados`, al historial como "Cal.com" y como aviso al celular de todos (`registrarSistema`). Clientes → pestaña **Interesados**: entrar a la llamada, "Confirmar y pasar a cliente" (abre el formulario lleno; `confirmarInteresado`) o "No avanzó". Con confirmación manual en Cal.com (D-134), la solicitud queda **Por aceptar en Cal.com** (`por_aceptar`) hasta aceptarla o rechazarla allá. **En espera (D-144):** «Poner en espera» con nota + plazo (1 día a 1 semana, `PLAZOS`), recordatorio al celular un día antes y el día del plazo (en `app/api/avisos/diario`, tabla `avisos_interesados`), notas en `interesado_notas` y botón «Escribirle por WhatsApp» con el mensaje de `mensajeSeguimiento()`. Confirman Sergio y Andrés; borra solo Sergio. Código del navegador importa de `lib/panel/clientes/interesados.ts`, nunca de `lib/panel/cal.ts` (usa `node:crypto`). Prueba: `npx -y tsx scripts/prueba-cal.ts`. Guía en `docs/panel-cliente/05-acceso-y-seguridad.md` §3e.
- **Prospectos (D-173):** pestaña de Clientes (orden **Prospectos · Interesados · Clientes**) con los negocios que encontró **Sellbird** (Google Maps vía Scavio). Tabla `prospectos` (migración `db/panel/016_prospectos.sql`), clasificación pura en `lib/panel/clientes/prospectos.ts` (rubro, servicio sugerido, página, titular **empresa / persona natural / por verificar**, prioridad por puntos: sin página propia +3, reseñas +1/+2, calificación ≥ 4,3 +1, empresa con NIT +1; alta ≥ 5, media ≥ 3). Perfil de cada negocio con el porqué de su prioridad y enlace al RUES; Sergio y Andrés cambian estado, titular y notas (`guardarProspecto`, recalcula la prioridad), solo Sergio borra. **«No contactar» es para siempre** (Ley 1581): solo Sergio lo quita. Importar: `npx -y tsx scripts/panel-importar-prospectos.ts archivo.csv` (o `--sql`); reimportar no pisa estado, notas ni titular editado. Prueba: `npx -y tsx scripts/prueba-prospectos.ts`. Solo datos que el negocio publicó. **Botón «Escribirle por WhatsApp» (D-174):** mensaje **versión B (usted)** de `mensajeProspecto()`, firmado por quien está en sesión, con saludo según la hora de Bogotá, de dónde salió el número y «responda NO»; solo a celulares (`whatsappDe`), nunca a «No contactar» ni «No le interesa». Al tocarlo pasa a «Contactado» (`marcarContactado`). El enlace `aratasan.com/agendar?tipo=…&p=<código de 10>` hace que `BookingFlow` agregue `Referencia:` a las notas de Cal.com y el webhook une el interesado con su prospecto, que pasa solo a «Agendó» (`vincularProspecto`). Si ya tiene página, el mensaje ofrece la auditoría gratis. **Buscar más prospectos (D-179):** botón en Prospectos (Sergio y Andrés) que consulta Google Maps por **Scavio** desde el servidor (`SCAVIO_API_KEY` solo en `arata-panel`; 1 crédito = 1 página de hasta 20 negocios). Nicho y zona de `lib/panel/clientes/nichos.ts`, costo y saldo antes de gastar, no repite una página pagada en 90 días, filtros de lo que se guarda y descartados recuperables gratis (`prospecto_busquedas`, migración 017). Prioridad con enfoque **«Ya vende por internet»** (redes sin sistema +3, página sin sistema +2, celular +1, cadena grande −2) o «Necesita página». Acciones en `app/(panel)/panel/(app)/clientes/buscar.ts`, pantalla `components/panel/BuscarProspectos.tsx`. Prueba: `npx -y tsx scripts/prueba-buscar-prospectos.ts`.
- **Tareas (D-181, `/panel/tareas`, solo la agencia):** vista general = tablero por estado como Notion (D-184: Por hacer rojo, En curso ámbar, Hecha verde; arrastrar entre columnas y botón «¡Hecha!»); otras pestañas: semana de lunes a viernes (D-182; arrastrar entre días, «Sin fecha», «Atrasadas»; lo del sábado o domingo solo sale en la Tabla) y tabla tipo Notion. Campos: título, detalles, área (D-188: fijas `AREAS` proyectos, marketing, desarrollo, finanzas, diseño + «Agregar área» en `tarea_areas`, migración 023; quita solo Sergio si no tiene tareas), proyecto opcional (sale en la ficha del proyecto), responsables (uno o varios, D-186, `tarea_responsables`, migración 021), rango de fechas (Desde/Hasta, D-187, `fecha_fin`, migración 022; arrastrar con el dedo en el celular, `arrastreTactil.ts`), prioridad urgente/alta/media/baja, estado por hacer/en curso/hecha, lista de chequeo (`tarea_items`) y comentarios (`tarea_comentarios`). Los tres crean y asignan; borra solo Sergio. Aviso al asignar y al comentar (`avisarA`), resumen de las 8 a. m. por persona (`avisos_tareas`) y contador en el menú. **Recordatorio (D-183):** el mismo día, 1 día (24 h), 2 días o 1 semana antes, con el aviso de las 8 a. m. a quien tiene la tarea y a quien lo puso (`avisos_recordatorios`, migración 019). Estado y prioridad en semáforo; la tarjeta muestra el nombre del responsable. **Menú lateral recogible** (cookie `pn-menu`, solo íconos). Tabla `agencia_tareas` (migración 018; la vieja `tareas` es del panel de ejemplo). Lógica pura en `lib/panel/tareas/tareas.ts`, acciones en `app/(panel)/panel/(app)/tareas/acciones.ts`, pantalla en `components/panel/tareas/`. Prueba: `npx -y tsx scripts/prueba-tareas.ts`.
- **Reglas de producción (D-116):** `BETTER_AUTH_SECRET` igual donde se use la misma base (cifra el doble factor); fechas siempre en Bogotá con `lib/panel/fecha.ts` (la base está en `America/Bogota`, el servidor en UTC); el panel no carga Google Analytics.
- Datos: n8n (GA4, Instagram, ventas) llena métricas. Panel siempre `noindex` y bloqueado en `robots.txt`.
- Palabras del panel: "clientes que compran" (no "conversión"), "visitas", "visualizaciones", "portada", "botón" (glosario en `docs/panel-cliente/03-sistema-de-diseno.md` §7).

---

*Este archivo reemplaza cualquier versión previa del sistema de marca. Última consolidación de contexto.*
