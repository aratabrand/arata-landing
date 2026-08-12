# CLAUDE.md — Arata San

Contexto maestro del proyecto para Claude Code. Lee este archivo antes de trabajar en cualquier build de la agencia.

---

## 1. Qué es Arata San

Agencia digital en Bogotá, Colombia (`@arata.san.web`). Construimos **ecosistemas de venta** para comerciantes y pymes colombianas: página + agente de WhatsApp con IA + automatización del negocio.

El producto core se vende como paquete:
- **Landing / sitio** (captación)
- **Agente de WhatsApp con IA** (atención y venta)
- **Automatización / sistematización** (operación)

Modelo de cobro: **montaje (pago único) + mensualidad (recurrente)**.

### Equipo

| Persona | Rol |
|---|---|
| Sergio | Estrategia digital, landing pages, Meta Ads, UX, contenido, diseño de producto (Figma). Aprueba copy y decisiones de marca. |
| Andrés | Líder comercial, relación con clientes, sourcing de producto. |
| Santiago | Líder técnico: flujos n8n, arquitectura de agentes IA, builds en Claude Code. |

Flujo típico: Sergio define a nivel de sistema/diseño (tokens Figma, marca) → Santiago implementa.

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

### Reglas visuales
- Slides con fondo morado `#7D53FF` = **color plano sólido**. Sin gradientes, sin orbes oscuros, sin overlays.
- El espacio vacío se llena con **data útil** (stat pills, grids de sub-métricas), no con decoración.
- Estética de charts: **dashboard-premium** — donuts/rings (número XL centrado + punta de arco con dot brillante), barras horizontales/verticales con endpoints redondeados, gauges de 180° con marcas de escala. Todo dentro de glass cards con `backdrop-filter: blur`, líneas de grid muy sutiles.

---

## 4. Stack técnico

| Área | Herramienta |
|---|---|
| Sitios multi-cliente | WordPress + Elementor |
| Proyectos individuales | Framer (incluye hosting/dominio) |
| E-commerce | Shopify Basic + Wompi |
| Automatización | n8n |
| IA | OpenAI |
| Base de datos | Supabase |
| Ads & tracking | Meta Ads + Meta Pixel (instalado con plugin WPCode en el header de WordPress) |
| Logística dropshipping | Dropi |

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

## 6. Agente de WhatsApp "Sara"

Arquitectura:
- Base en **n8n + OpenAI (GPT-4o-mini)**.
- Integrado con **Meta WhatsApp Business Cloud API**.
- Memoria de conversación vía **Google Sheets / Supabase**.
- **Transcripción de audio** con Whisper.
- **Envío nativo de fotos** vía Meta media upload API.

---

## 7. Apps en desarrollo (MVPs)

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

---

## 9. Landing page — sistema de diseño (MVP en Next.js)

Landing propia de la agencia (le vende a comerciantes/pymes de Colombia). MVP en **Next.js 14 + TypeScript + Tailwind**; más adelante se reconstruye en Framer.

### Fondos y color
- **Solo dos fondos de sección: blanco `#FFFFFF` y oscuro `#03010B`.** Se alternan.
- **Morado `#7D53FF` y lima `#B6FF00` NO son fondos de sección** — solo acentos, hover y CTA.
- **Hero siempre oscuro.** Cierre oscuro tipo bookend: Dudas → CTA final → Footer.
- Contraste: lima nunca como texto sobre blanco (solo sobre oscuro o como fondo con texto ink). En claro, los acentos/gráficos van en morado.

### CTAs
- Primario **lima** (hover → morado). Secundario sobre oscuro **blanco** (hover → lima). Terciario: contorno.
- Destino único: **WhatsApp `3134011189`** (`wa.me/573134011189`) para agendar diagnóstico. **Sin precios** en la página.

### Navbar
- **Píldora glassmorphism estilo iOS** (`rounded-full`), dark-glass consistente (no depende del fondo de sección).
- Transparente sobre el hero → glass al bajar; las **opciones cambian a lima** con el scroll. Punto "en vivo" que titila (efecto ping).

### Variación de componentes (no repetir la misma caja)
- Problema: lista escalonada con hairlines y números morados. Solución/"Qué hacemos": **bento animado oscuro** (framer-motion) con capacidades reales. Cómo funciona: **timeline** con línea que crece al scroll. Lo que te cuesta: comparación con la **tarjeta de Arata en oscuro resaltada** dentro de sección clara.

### Animación (siempre respetar `prefers-reduced-motion`)
- Reveals direccionales con stagger, **contador (count-up)** en toda cifra, anillos que se dibujan, timeline que crece, **fondo interactivo de rejilla** en el hero, **chat en loop** en el hero, **LightRays (WebGL/ogl)** en el CTA final, entrada escalonada del hero.
- Títulos del hero: máximo **3 líneas** en cualquier dispositivo.

### Stack técnico de la landing
- Fuentes **Funnel Display + Plus Jakarta Sans** auto-hospedadas con `next/font/local` (sin red en runtime).
- Charts/anillos = **SVG propio, sin librerías de charting**.
- Dependencias de efectos: `framer-motion`, `lucide-react`, `ogl`. Helper `cn` (clsx + tailwind-merge). Componentes vendidos en `components/ui/`.

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

### Rendimiento
- Página estática (SSG), fuentes locales con `display: swap`, gráficos en SVG (sin peso de imágenes).
- **Diferir dependencias pesadas** con `next/dynamic` + `ssr:false` (ej. `ogl`/LightRays) para sacarlas del bundle inicial. First Load objetivo < 150 KB.

### Verificación (evitar falsos positivos)
- Para animaciones, medir **visibilidad real** (`opacity`, `is-visible`), NO solo `textContent`/conteo de nodos (leen el DOM aunque esté invisible).
- En el panel oculto de Claude el scroll y el `IntersectionObserver` no disparan; usar componentes con temporizador (ej. el chat en loop) como prueba de hidratación.
- Opacidades Tailwind: solo pasos válidos de la escala (o extenderlos en config). `bg-white/8` NO es válido → sale invisible.

---

*Este archivo reemplaza cualquier versión previa del sistema de marca. Última consolidación de contexto.*
