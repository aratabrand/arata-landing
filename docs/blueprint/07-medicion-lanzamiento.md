# 07 — Medición y lanzamiento (Fase 6)

| Estado | Versión | Última actualización | Aprueba |
|---|---|---|---|
| En curso | 0.1 | 9 nov 2026 | Sergio |

El sitio v2 se lanzó el 9 nov 2026 (D-091). Este documento cubre lo que falta para **medir** si cumple su único objetivo: que la gente agende reuniones.

---

## 1. Estado (9 nov 2026)

| Qué | Estado |
|---|---|
| Sitio publicado en www.aratasan.com | ✅ D-091 |
| PageSpeed celular 95–100 en todas las páginas | ✅ D-093 |
| Sitemap enviado a Google Search Console y Bing | ✅ Sergio (D-095) |
| Google Tag Manager `GTM-TL7RLDMS` en todas las páginas | ✅ instalado desde la v1 |
| **Google Analytics 4** | ◻ **No está instalado.** El contenedor de GTM está publicado (versión 1) pero no tiene ninguna etiqueta (revisado el 9 nov 2026, D-095) |
| Eventos de la agenda en el sitio (`dataLayer`) | ✅ el sitio ya los envía; falta que GA4 los reciba |

---

## 2. Eventos que el sitio ya envía

No hay que tocar código: estos eventos salen solos hacia GTM (`05-construccion.md` §3).

| Evento | Cuándo | Datos |
|---|---|---|
| `agendar_paso` | Cada vez que alguien pasa de paso en `/agendar` | `paso`, `tipo` |
| `agendar_datos_completos` | Llenó bien nombre, WhatsApp y correo | `tipo` |
| `agendar_calendario` | Se abrió el calendario de Cal.com | — |
| `agendar_whatsapp` | Terminó por WhatsApp (sin calendario o calendario lento) | `motivo` |
| `cita_agendada` | Cal.com confirmó la cita | `tipo` |
| `reunion_confirmada` | Se abrió `/agendar/gracias` → **conversión principal** | — |

---

## 3. Cómo instalar Google Analytics 4 (con GTM, unos 20 minutos)

### A. Crear la propiedad en Google Analytics

1. Entra a **analytics.google.com** con la cuenta de Arata San → **Administrar** (ícono de engranaje, abajo a la izquierda) → **Crear** → **Propiedad**.
2. Nombre: **Arata San**. Zona horaria: **Colombia**. Moneda: **peso colombiano (COP)** o **dólar (USD)**. Siguiente y completa los datos del negocio.
3. En **Flujos de datos**, elige **Web**: URL `www.aratasan.com`, nombre **Sitio web**. Deja activada la **Medición mejorada**.
4. Copia el **ID de medición**: empieza por `G-` (ej. `G-AB12CD34EF`).

### B. Conectarlo en Google Tag Manager

Entra a **tagmanager.google.com** → contenedor **GTM-TL7RLDMS**.

5. **Etiqueta base:**
   - Ve a **Etiquetas** → **Nueva** → Configuración de la etiqueta: **Etiqueta de Google**.
   - ID: tu `G-…`.
   - Activación: **Initialization - All Pages**.
   - Nombre: `GA4 - Etiqueta de Google` → **Guardar**.
6. **Variables:**
   - Ve a **Variables**.
   - En "Variables integradas" → **Configurar** → activa **Event**.
   - En "Variables definidas por el usuario" → **Nueva** → **Variable de capa de datos**:
     - Una con nombre de variable `paso` (llámala `dlv - paso`).
     - Otra con `tipo` (llámala `dlv - tipo`).
7. **Activador:**
   - Ve a **Activadores** → **Nuevo** → **Evento personalizado**.
   - Nombre del evento: `^(agendar_.*|cita_agendada|reunion_confirmada)$`.
   - Marca **Usar coincidencia de expresión regular**.
   - Nombre: `Eventos de agenda`.
8. **Etiqueta de eventos:**
   - Ve a **Etiquetas** → **Nueva** → **Google Analytics: evento de GA4**.
   - ID de medición: tu `G-…`.
   - Nombre del evento: `{{Event}}`.
   - En **Parámetros del evento**: `paso` = `{{dlv - paso}}` y `tipo` = `{{dlv - tipo}}`.
   - Activación: `Eventos de agenda`.
   - Nombre: `GA4 - Eventos de agenda` → **Guardar**.
9. **Probar:**
   - Haz clic en **Vista previa** → escribe `https://www.aratasan.com` → **Connect**.
   - En la pestaña que se abre, ve a `/agendar` y avanza en el formulario.
   - En Tag Assistant deben aparecer `agendar_paso` y la etiqueta **GA4 - Eventos de agenda** como *Fired*.
10. **Publicar:**
    - **Enviar** → nombre de versión `GA4 + embudo de agenda` → **Publicar**.

### C. Marcar las conversiones en Analytics

11. En Analytics → **Administrar** → **Eventos clave** → **Nuevo evento clave**: escribe `reunion_confirmada` y guarda. Repite con `cita_agendada`.
12. Revisa **Informes → Tiempo real** mientras haces una prueba en el sitio. Los informes normales tardan hasta 24 horas.
13. *(Recomendado)* **Administrar → Vinculaciones de productos → Search Console** → vincula `www.aratasan.com`, para ver en Analytics las búsquedas de Google que traen visitas.

**Ya está listo en el sitio:**

- La política de seguridad (CSP) ya permite Analytics (`googletagmanager.com`, `google-analytics.com`).
- La política de datos ya menciona Google Analytics.

---

## 4. Qué mirar cada semana

| Métrica | Dónde | Qué dice |
|---|---|---|
| Reuniones agendadas (`reunion_confirmada`) | GA4 → Eventos clave | La métrica principal del sitio |
| Embudo de `/agendar` (`agendar_paso` por `paso`) | GA4 → Explorar → Exploración de embudo | En qué pregunta se sale la gente |
| Visitas que llegan a `/agendar` | GA4 → Páginas y pantallas | Si los botones del sitio están funcionando |
| Búsquedas y clics | Search Console | Qué buscan en Google para encontrarnos |
| Velocidad | PageSpeed (una vez al mes) | Que se mantenga en 90 o más |

---

## 5. Pendientes

| Pendiente | Quién |
|---|---|
| Instalar GA4 (§3) | Sergio (o Claude, con el ID `G-…` si se prefiere instalar directo en el código) |
| Logo de Boost Your Menu para la franja de logos | Sergio |
| Repositorios de Danrodedm y Boost Your Menu para subir su velocidad en celular a 90+ (mientras tanto, se muestra lo fuerte, D-082) | Sergio |
| Revisar a dónde apuntan los anuncios activos de Meta | Sergio |
| Revisión de la política de datos con un abogado | Sergio |
