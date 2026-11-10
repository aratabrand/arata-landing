# 05 — Construcción (Fase 4)

| Estado | Versión | Última actualización | Aprueba |
|---|---|---|---|
| En revisión | 0.1 | 9 nov 2026 | Sergio (puerta: preview de Vercel revisado) |

Cómo quedó construido el sitio de agencia v2: rutas, carpetas, contenido, flujo de agenda y lo que falta para lanzar. Base: arquitectura [`02-arquitectura.md`](02-arquitectura.md), copy [`03-copy.md`](03-copy.md), sistema [`04-sistema-de-diseno.md`](04-sistema-de-diseno.md).

---

## 1. Rutas construidas

| Ruta | Archivo | Estado |
|---|---|---|
| `/v2` (pasa a `/` al lanzar) | `app/(v2)/(sitio)/v2/page.tsx` | ✅ |
| `/paginas-web` | `app/(v2)/(sitio)/paginas-web/page.tsx` | ✅ |
| `/catalogos-y-sistemas` | `app/(v2)/(sitio)/catalogos-y-sistemas/page.tsx` | ✅ (falta la FAQ del límite de productos ◻) |
| `/portafolio` | `app/(v2)/(sitio)/portafolio/page.tsx` | ✅ con filtro |
| `/portafolio/[slug]` (4 casos) | `app/(v2)/(sitio)/portafolio/[slug]/page.tsx` | ✅ estáticos (`generateStaticParams`) |
| `/agendar` | `app/(v2)/(sitio)/agendar/page.tsx` + `components/v2/BookingFlow.tsx` | ✅ (falta el enlace de Cal.com, §4) |
| `/agendar/gracias` | `app/(v2)/(sitio)/agendar/gracias/page.tsx` | ✅ siempre `noindex` |
| `/privacidad` | `app/(v2)/(sitio)/privacidad/page.tsx` | ✅ (faltan RUT y dirección ◻) |
| 404 | `app/not-found.tsx` | ✅ estilo v2, vale para todo el sitio |
| `/sistema` (guía viva) | `app/(v2)/sistema/page.tsx` | ✅ interna, `noindex` |

**Todas las páginas son estáticas (SSG):** el texto llega en el HTML para Google y la IA.

**Mientras no se lance (D-073):** todo el grupo `(v2)` es `noindex` y no está en el sitemap. La v1 sigue en `/`. Al lanzar (Fase 6): `/v2` pasa a `/`, `INICIO` cambia a `"/"` en `content/inicio.ts`, se quita el `noindex` del layout de `(v2)` y se agregan las rutas al sitemap.

---

## 2. Estructura de carpetas

```
app/
  (v2)/                     ← solo fondo oscuro, noindex hasta lanzar
    layout.tsx
    sistema/                ← guía viva del sistema de diseño
    (sitio)/                ← páginas públicas: comparten menú, footer y barra fija
      layout.tsx            ← SiteHeader + <main> + SiteFooter + StickyBookBar
      v2/ paginas-web/ catalogos-y-sistemas/ portafolio/[slug]/ agendar/gracias/ privacidad/
  not-found.tsx             ← 404 v2
components/
  ui/                       ← componentes de 21st.dev adaptados (tilted-grid-hero, grid-background)
  v2/                       ← componentes del sitio
    ServiceSections.tsx     ← secciones de las páginas de servicio (hero, incluye, casos, precio…)
    HomeSections.tsx        ← problema y pasos (reciben props: se reusan en servicios)
    Closing.tsx             ← FAQ, CTA final y footer (reciben props)
    BookingFlow.tsx         ← formulario de /agendar + Cal.com
    PortfolioFilter.tsx     ← filtro del portafolio
content/                    ← TODO el texto: se edita aquí, no en los componentes
  inicio.ts  servicios.ts  proyectos.ts  agendar.ts  privacidad.ts
```

**Regla:** las secciones son genéricas y el texto vive en `content/`. Una página nueva se arma juntando secciones y pasándoles su contenido.

---

## 3. Flujo de agenda (`/agendar`)

| Paso | Qué pasa |
|---|---|
| 1 · ¿Qué necesitas? | Tocar una opción la elige y pasa al siguiente paso. Si es **auditoría**, pide la URL de la página y se salta la pregunta de inversión |
| 2 · ¿Para cuándo? | Igual: tocar y avanzar |
| 3 · ¿Cuánto invertir? | Con "Menos de 400 USD" **no avanza solo**: primero muestra la facilidad de pago 50/50 (D-041) |
| 4 · Tus datos | Nombre, WhatsApp, correo y autorización (Ley 1581). Valida con los mensajes del copy y lleva el foco al primer error |
| 5 · Calendario | Cal.com con nombre, correo y notas ya llenos. Las **notas** llevan todas las respuestas: la reunión llega preparada |

- **Atajos:** `/agendar?tipo=pagina|catalogo|sistema|auditoria` deja elegido el paso 1. Los botones de cada página ya los usan (footer "Auditoría gratis" → `?tipo=auditoria`, "Cuéntanos tu idea" → `?tipo=sistema`).
- **Velocidad:** Cal.com (`embed.js`) se pide **solo al llegar al paso 5**; al abrir la página no carga nada de Cal (medido).
- **Plan B:** sin enlace de Cal.com configurado, o si Cal tarda más de 8 s, aparece **"Enviar por WhatsApp"** con todas las respuestas escritas. Nunca queda nadie atascado.
- **Al agendar:** Cal.com avisa (`bookingSuccessful`) y se pasa a `/agendar/gracias`.

### Eventos para GTM (dataLayer)

| Evento | Cuándo |
|---|---|
| `agendar_paso` | Cada cambio de paso (`paso`, `tipo`) → embudo: dónde se sale la gente |
| `agendar_datos_completos` | Datos válidos |
| `agendar_calendario` | Se abrió el calendario |
| `agendar_whatsapp` | Terminó por WhatsApp (sin Cal o Cal lento) |
| `cita_agendada` | Cal.com confirmó la cita (`tipo`) |
| `reunion_confirmada` | Se abrió `/agendar/gracias` → **conversión principal** |

Se conectan a GA4 desde GTM en la Fase 6 (sin tocar código).

---

## 4. Cal.com ✅ conectado (D-076)

| Evento | Enlace |
|---|---|
| Reunión | `arata-san/asesoria-30min` |
| Auditoría (aviso mínimo 48 h) | `arata-san/auditoria` |

Probado de punta a punta: el calendario abre en ~4 s, con nombre, correo y las respuestas en las notas. El idioma y la zona horaria salen del navegador de cada persona. Para cambiar de evento sin tocar código: `NEXT_PUBLIC_CAL_LINK` y `NEXT_PUBLIC_CAL_LINK_AUDITORIA` en Vercel.

### Cómo se configuró (para repetir en otro proyecto)

1. Crear cuenta en **cal.com** (gratis) y conectar el calendario de Google.
2. Crear 2 tipos de evento de **30 minutos**:
   - **Reunión** → ej. `aratasan/reunion`.
   - **Auditoría** → ej. `aratasan/auditoria`, con **aviso mínimo de 48 horas** (Ajustes avanzados → *Minimum notice*: 48 h). D-054.
3. En cada evento, dejar activas las preguntas **Nombre**, **Correo** y **Notas adicionales** (ahí llegan las respuestas del formulario).
4. Pasarle a Santiago/Claude los dos enlaces. Se configuran en Vercel → *Settings → Environment Variables* (no son secretos):
   - `NEXT_PUBLIC_CAL_LINK=aratasan/reunion`
   - `NEXT_PUBLIC_CAL_LINK_AUDITORIA=aratasan/auditoria`
5. Volver a desplegar. La CSP ya permite `app.cal.com` y `cal.com`.

---

## 4b. Puntajes de los proyectos del portafolio (D-080)

Lighthouse 12.6 sobre el sitio en vivo, celular (mediana de 3) y computador (2), 9 nov 2026. Datos en `content/proyectos.ts` → `puntajes` (con `mostrar`).

| Proyecto | Velocidad celular | Accesibilidad | Buenas prácticas | SEO | Se ve en (celular) | Computador | ¿Se publica? |
|---|---|---|---|---|---|---|---|
| Caravana | 99 | 98 | 100 | 63* | 2,0 s | 100 | ✅ |
| Arata Print | 96 | 98 | 100 | 63* | 2,6 s | 100 | ✅ |
| Danrodedm | 79 | 93 | 96 | 100 | 5,2 s | 97 | Se muestra lo fuerte (D-082, D-100) |
| Boost Your Menu | 70 | 90 | 96 | 100 | 5,3 s | 86–90 | Se muestra lo fuerte (D-082, D-100) |

\* Dominio de prueba (`vercel.app`) con `noindex` a propósito: el SEO no se muestra hasta que tengan su dominio.

## 5. Medición (Lighthouse móvil, local, 9 nov 2026)

| Página | Rendimiento | Accesibilidad | Buenas prácticas | LCP | CLS |
|---|---|---|---|---|---|
| `/paginas-web` | 91 | 100 | 96 | 3,4 s (título) | 0 |
| `/catalogos-y-sistemas` | 93 | 100 | 96 | 3,2 s (título) | 0 |
| `/portafolio` | 88 – 91 | 100 | 96 | 3,4 – 3,8 s (1.ª tarjeta) | 0 |
| `/portafolio/caravana` | 97 | 100 | 96 | 2,5 s | 0 |
| `/agendar` | 96 | 100 | 96 | 2,6 s | 0,003 |
| `/privacidad` | 95 | 100 | 96 | 2,9 s | 0 |
| `/v2` | 87 – 94 | 100 | — | 2,9 – 3,9 s | 0 |

- En este entorno la nota varía 5–7 puntos entre corridas. La puerta de la **Fase 5** es PageSpeed **≥ 90 en todas las páginas, medido en la URL publicada**: ahí se afina lo que quede por debajo.
- Buenas prácticas 96: errores de consola de GTM bloqueado en el entorno de prueba.

---

## 6. Lo que falta para lanzar

| Falta | Quién | Bloquea |
|---|---|---|
| ~~Datos de cada caso: ciudad, duración y proceso~~ ✅ recibidos (D-084) | — | — |
| Elegir versión de la pregunta 2 del formulario (D-077) | Sergio | Nada (va la A) |
| RUT y dirección del responsable | Sergio | `/privacidad` (Ley 1581). Recomendado: revisión de un abogado |
| Límite de productos del catálogo de 800 USD | Sergio | Una pregunta de la FAQ de catálogos |
| Testimonios (Arata Print, Caravana) y cifras (Danrodedm, Boost Your Menu) | Sergio | Nada: se agregan en `content/proyectos.ts` cuando lleguen |
| Aprobar copy nuevo ◻ (ver `03-copy.md`, "Copy nuevo de la Fase 4") | Sergio | Nada (se puede cambiar después) |
| SEO por página, schema, sitemap, `llms.txt` v2 | Fase 5 | Lanzamiento |
