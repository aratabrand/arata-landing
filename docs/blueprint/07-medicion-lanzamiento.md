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
| Google Tag Manager en todas las páginas | ✅ **`GTM-MVW5FKSQ`** (D-096). Reemplaza al contenedor vacío `GTM-TL7RLDMS` |
| **Google Analytics 4** | ✅ **`G-PWBJXQML6S`**, dentro de `GTM-MVW5FKSQ`, con medición mejorada (páginas vistas, scroll, clics salientes, formularios). Probado: llegan todos los eventos (D-096) |
| Eventos de la agenda | ✅ el sitio los manda **directo a GA4** (`gtag`) y también a GTM (`dataLayer`), con `lib/medir.ts` |

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

## 3. Google Analytics 4 — cómo quedó y qué falta (D-096)

**Cómo quedó:**

- El sitio carga **`GTM-MVW5FKSQ`**, que trae la etiqueta de Google de GA4 (`G-PWBJXQML6S`) con medición mejorada.
- La etiqueta de Google **no convierte sola** los eventos de `dataLayer` en eventos de GA4. Por eso `lib/medir.ts` manda cada evento de la agenda de dos formas:
  - con `gtag("event", …)`, directo a GA4;
  - con `dataLayer.push`, para usarlo en GTM más adelante (por ejemplo, el píxel de Meta).
- `GtmInit` crea la cola y `gtag('js')` al principio de la página. Así, la conversión de `/agendar/gracias` no se pierde aunque se dispare antes de que el contenedor termine de abrir.
- **Política de seguridad (CSP):** permite `*.google-analytics.com`, `*.analytics.google.com`, `*.googletagmanager.com` y `www.google.com`. GA4 manda una copia de cada evento a `www.google.com/g/collect`; sin ese permiso, quedaba bloqueada.
- **Probado en el navegador:** llegan `page_view`, `agendar_paso`, `agendar_datos_completos`, `agendar_calendario`, `reunion_confirmada` y `form_start`, sin errores de seguridad.

> ⚠ **No crear en GTM una etiqueta "Evento de GA4" para estos eventos**: ya llegan solos y se contarían doble. Los pasos 5–8 de la guía anterior ya no hacen falta.

**Lo que falta hacer en Analytics:**

1. ✅ `reunion_confirmada` creado como evento clave ("Crear con código"). `cita_agendada` **no** se marca como clave (se contaría doble la misma reunión) y no hay que crearlo: aparece solo. Dimensiones personalizadas `tipo`, `paso` y `motivo` creadas (Sergio).
2. **Informes → Tiempo real:** abre www.aratasan.com en el celular y confirma que apareces.
3. ✅ **GA4 vinculado con Search Console** (`aratasan.com` → flujo `www.aratasan.com`), hecho desde la cuenta dueña de Search Console (Sergio, 10 nov 2026). Los datos se ven desde el día siguiente en **Informes → Search Console**.
4. ✅ **Search Console:** verificado por **proveedor de nombres de dominio (DNS)**. No depende de GTM ni de GA4, así que cambiar de contenedor no lo afecta (Sergio, 9 nov 2026).

**Vincular GA4 con Search Console cuando están en cuentas de Google distintas:** Google exige que **una misma cuenta** sea a la vez *propietaria verificada* en Search Console y *Editor o Administrador* en la propiedad de GA4. Lo más simple:

1. Entra a GA4 con la cuenta que lo administra → **Administrar → Gestión del acceso a la propiedad → + → Añadir usuarios**.
2. Escribe el correo de la cuenta dueña de Search Console, con rol **Administrador** (o Editor), sin marcar notificaciones si no quieres. Guarda.
3. Cierra sesión y entra a GA4 **con la cuenta de Search Console** → elige la propiedad de Arata → **Administrar → Vinculaciones de productos → Vínculos de Search Console → Vincular**.
4. **Elegir cuentas** → marca `aratasan.com` (sc-domain) → **Siguiente** → elige el flujo web de `www.aratasan.com` → **Enviar**.
5. Al día siguiente aparecen los informes en **Informes → Search Console** (si no salen, en **Biblioteca** publica la colección "Search Console").

Si después quieres quitarle el acceso a esa cuenta en GA4, el vínculo sigue funcionando.

> Si en el paso 4 sale **"No hay resultados"**, la sesión abierta en GA4 no es la de Search Console. Cambia de cuenta (o abre una ventana de incógnito con la cuenta de Search Console).
>
> **No sirve verificar Search Console con el método "Google Analytics" o "Google Tag Manager":** el sitio carga GTM después del primer toque o a los 7 s (D-098), y el verificador de Google busca la etiqueta en el HTML inicial. Para verificar otra cuenta, usa **otro registro TXT en el DNS**.

**Pasar todo a la cuenta de Google de Search Console (nov 2026):** en Google no se "mueven" las herramientas de una cuenta a otra: se le da a la otra cuenta acceso de **Administrador** y, si se quiere, se le quita a la vieja. Así se conservan los mismos ID (`GTM-MVW5FKSQ`, `G-PWBJXQML6S`) y **no hay que tocar el código del sitio**. No crear contenedores ni propiedades nuevas.

| Herramienta | Dónde (con la cuenta vieja) | Qué dar a la cuenta nueva |
|---|---|---|
| GA4 | Administrar → Gestión del acceso a la cuenta | Administrador ✅ (ya está) |
| Tag Manager | Administrar → Gestión de usuarios (de la **cuenta**) | Cuenta: Administrador · Contenedor `GTM-MVW5FKSQ`: Publicar |
| Google Business | Configuración del perfil → Personas y acceso | Propietario → luego "Transferir la propiedad principal" |
| Search Console | — | Ya está en la cuenta nueva |

Quitar la cuenta vieja **solo después** de entrar con la nueva y comprobar que ve y edita todo. Recomendado: dejar la vieja como segunda administradora de respaldo.

**Rendimiento (D-098):** el contenedor de GA4 pesa unos 178 KB. Cargado al abrir la página, el Inicio publicado bajó a 77–82 en celular. Ahora se carga **al primer toque, scroll, movimiento del mouse o tecla**, de inmediato si hay un evento de conversión, o a los 7 s. Así la velocidad vuelve a 90+ y no se pierde ningún evento. Costo: quien se va en menos de 7 s sin tocar nada no queda registrado.

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
| Logo de Boost Your Menu para la franja de logos | Sergio |
| Repositorios de Danrodedm y Boost Your Menu para subir su velocidad en celular a 90+ (mientras tanto, se muestra lo fuerte, D-082) | Sergio |
| Cuando vuelvan los anuncios de Meta: apuntarlos a `/agendar` o a la página del servicio (hoy no hay anuncios activos) | Sergio |
| Revisión de la política de datos con un abogado (D-099): confirmar si el correo basta como dirección de notificaciones y el plazo de 2 años de conservación | Sergio |
