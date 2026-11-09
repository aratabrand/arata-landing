# 06 — SEO, GEO, velocidad y legal (Fase 5)

| Estado | Versión | Última actualización | Aprueba |
|---|---|---|---|
| En revisión | 0.1 | 9 nov 2026 | Sergio (puerta: PageSpeed móvil ≥ 90 en todas las páginas, en la URL publicada) |

Qué quedó listo para que el sitio v2 aparezca en Google y en las IA, abra rápido y cumpla la ley, y la lista exacta para encenderlo el día del lanzamiento. Base técnica reutilizable: `CLAUDE.md` §10.

---

## 1. Cómo se enciende: un solo interruptor (D-088)

Vercel publica **solo `main`** en www.aratasan.com; esta rama solo se ve en el preview. Por eso todo lo de SEO está construido y probado, pero **apagado** con `lib/lanzamiento.ts`:

| `V2_PUBLICADO` | Qué pasa |
|---|---|
| `false` (hoy) | Las páginas v2 son `noindex`; el sitemap solo tiene la v1; el JSON-LD de la agencia es el de la v1; `/llms.txt` es idéntico al publicado hoy |
| `true` (lanzamiento) | Se indexa la v2 (menos `/sistema` y `/agendar/gracias`); el sitemap trae las 10 páginas; la agencia pasa al JSON-LD v2; `/llms.txt` pasa a la versión v2 |

**Probado con el interruptor encendido:** sitemap con 10 URL, `index, follow` en las páginas públicas, `noindex` en `/sistema` y `/agendar/gracias`, `llms.txt` v2 y **SEO 100** en Lighthouse (`/paginas-web`, `/portafolio/caravana`).

---

## 2. SEO por página (D-087)

| Pieza | Dónde | Qué hace |
|---|---|---|
| Metadatos | `lib/seo.ts` → `paginaV2()` | `title`, `description`, `canonical`, Open Graph y Twitter **propios** de cada página. Sin esto, las páginas v2 heredaban el título y la imagen de la v1 (chatbots) al compartirse |
| Imagen para compartir | `public/og/*.png` (1200×630, 84–113 KB) | General, por servicio, portafolio y una por caso con su captura real. Se regeneran con `npm run og` (necesita Playwright: `npm i -D playwright` una vez). Sergio puede reemplazar cualquiera con un export de Figma del mismo nombre |
| Un solo `<h1>` | Todas las páginas | Verificado en las 12 rutas |
| Contenido en el HTML | Todas (SSG) | Google y las IA leen el texto sin ejecutar JavaScript (también las cifras, D-069) |

### Datos estructurados (schema.org) — `lib/schema.ts`

| Página | Tipos |
|---|---|
| Todas | `ProfessionalService` de la agencia (v1 hasta lanzar; v2 con precios, correo y lo que hacemos) |
| Inicio | `FAQPage` |
| `/paginas-web` | `Service` con oferta **desde 400 USD** · `FAQPage` · `BreadcrumbList` |
| `/catalogos-y-sistemas` | `Service` **desde 800 USD** · `Service` "Tu Negocio en Orden" (cotizado) · `FAQPage` · `BreadcrumbList` |
| `/portafolio` | `CollectionPage` con la lista de casos · `BreadcrumbList` |
| `/portafolio/[caso]` | `CreativeWork` (sector, ciudad, sitio en vivo) · `BreadcrumbList` · `FAQPage` |

Los objetos salen de `content/` (estáticos). `components/JsonLd.tsx` escapa `<` para que ningún texto cierre la etiqueta.

---

## 3. GEO (que las IA lean y citen el sitio)

- `/llms.txt` es ahora una **ruta generada** (`app/llms.txt/route.ts`, estática) con dos versiones en `content/llms.ts`. La v2 resume oferta, precios, garantía, pago 50/50, cupos, los 4 casos con ciudad y plazo, y contacto. Solo datos reales.
- `robots.ts` ya permite explícitamente GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, anthropic-ai, PerplexityBot, Google-Extended, Applebot-Extended, Amazonbot y CCBot.
- Las FAQ de cada página van también como `FAQPage`: Google ya casi no las muestra como resultado enriquecido, pero las IA sí las leen.

---

## 4. Velocidad (Lighthouse celular, local, 9 nov 2026)

| Página | Rendimiento | Accesibilidad | Buenas prácticas | LCP simulado | **LCP real** | CLS |
|---|---|---|---|---|---|---|
| Inicio (`/v2`) | 87 – 94 | 100 | 96 | 3,8 s | **0,20 s** | 0 |
| `/paginas-web` | 90 | 100 | 96 | 3,6 s | **0,19 s** | 0 |
| `/catalogos-y-sistemas` | 91 | 100 | 96 | 3,5 s | **0,19 s** | 0 |
| `/portafolio` | 95 | 100 | 96 | 2,9 s | **0,16 s** | 0 |
| `/portafolio/danrodedm` | 93 | 100 | 96 | 3,2 s | **0,16 s** | 0 |
| `/portafolio/caravana` | 92 | 100 | 96 | 3,2 s | **0,18 s** | 0 |
| `/agendar` | 96 | 100 | 96 | 2,7 s | **0,12 s** | 0,003 |
| `/privacidad` | 98 | 100 | 96 | 2,4 s | **0,11 s** | 0 |

### En el sitio publicado (www.aratasan.com, 9 nov 2026) ✅ puerta cumplida (D-093)

| Página | Rendimiento celular (2 corridas) | SEO | Accesibilidad | CLS |
|---|---|---|---|---|
| Inicio | 95 – 96 (computador 100) | 100 | 100 | 0 |
| `/paginas-web` | 97 – 98 | 100 | 100 | 0 |
| `/catalogos-y-sistemas` | 98 – 99 | 100 | 100 | 0 |
| `/portafolio` | 97 – 99 | 100 | 100 | 0 |
| Casos (4) | 97 – 99 | 100 | 100 | 0 |
| `/agendar` | 99 | 100 | 100 | 0 |
| `/privacidad` | 100 | 100 | 100 | 0 |

En Vercel el servidor responde en 30–50 ms (en el entorno de prueba, ~460 ms): por eso lo publicado saca 5–8 puntos más que lo local.

**Cómo leer esto (aprendido, reutilizable):**

- El título se pinta en **0,1–0,2 s** en el navegador real. El "LCP simulado" de 3–3,8 s es la **simulación de un celular lento** de Lighthouse: suma la descarga de todo el JavaScript que la página pide antes de pintar (~193 KB) y el tiempo de respuesta de este servidor de prueba (~460 ms). En Vercel el servidor responde mucho más rápido.
- Se probó el Inicio **sin la banda de capturas**: misma franja (88–93). La banda no es la causa.
- En este entorno la nota varía 5–7 puntos entre corridas. Por eso la puerta se mide en **PageSpeed sobre la URL publicada**.
- El preview de Vercel tiene **Deployment Protection** (pide iniciar sesión, responde 302): no se puede medir desde fuera sin un token de bypass.
- Buenas prácticas 96: errores de consola de GTM bloqueado en el entorno de prueba.

### QA en celular (360 px y 320 px)

- 12 rutas sin desborde horizontal ni errores de JavaScript.
- Áreas táctiles agrandadas a 40–44 px sin cambiar el diseño: enlaces del footer, logo del menú y barra del carrusel del Inicio.

---

## 5. Legal

| Qué | Estado |
|---|---|
| Política de datos (`/privacidad`, Ley 1581 de 2012) | ✅ Publicada (D-075) y reforzada (D-099): autorización con prueba, envío fuera de Colombia (art. 26), dirección para notificaciones, plazo de conservación, cookies y seguridad |
| Autorización en el formulario de `/agendar` | ✅ Casilla obligatoria que nombra a Cal.com y Google y el envío fuera de Colombia; la fecha y hora de la autorización viajan en las notas de cada cita (D-099) |
| Datos del responsable | ✅ Nombre, domicilio digital (Bogotá), correo y teléfono. Cédula/NIT no se publica (D-090) |
| Revisión de un abogado | ◻ Pendiente: confirmar el correo como dirección de notificaciones y el plazo de 2 años (`07-medicion-lanzamiento.md` §5) |

---

## 6. Lista de lanzamiento (Fase 6)

En **un solo PR** a `main`:

1. ✅ Datos del responsable sin cédula/NIT y con domicilio digital (D-090).
2. ✅ `V2_PUBLICADO = true` (D-091).
3. ✅ Mover el Inicio v2 a `/`: `app/(v2)/(sitio)/v2/page.tsx` → `app/(v2)/(sitio)/page.tsx`, borrar `app/page.tsx` (v1) y poner `INICIO = "/"` en `content/inicio.ts`. Agregar en `next.config.mjs` una redirección permanente `/v2` → `/`.
4. ✅ En `app/layout.tsx`, pasar `metadata` (título, descripción, Open Graph, palabras clave) a los textos v2 y la imagen `/og/og-v2.png`.
5. ✅ `npm run build && npm run lint` limpios; verificado en local (Inicio, redirección, sitemap, llms.txt, política).
6. ◻ Merge → Vercel publica en www.aratasan.com.

Después de publicar:

7. ✅ **PageSpeed móvil en cada página** (D-093: 95–100) (puerta de la Fase 5: ≥ 90). Actualizar `velocidad` en `content/inicio.ts` con la medición real de la v2.
8. ✅ Google Search Console y Bing: enviar el sitemap nuevo (Sergio, D-095) y pedir indexación de las páginas de servicio.
9. ◻ Google Business: revisar que el enlace apunte al sitio.
10. ◻ GA4 desde GTM (no está instalado; guía en `07-medicion-lanzamiento.md` §3): marcar `reunion_confirmada` como conversión principal y armar el embudo con `agendar_paso` (ver `05-construccion.md` §3).
11. ◻ Revisar a dónde apuntan los anuncios activos (Meta Ads).
12. ◻ Optimizar Danrodedm y Boost Your Menu a 90+ en celular y pasar sus puntajes a `mostrar: "todo"` (D-082).
