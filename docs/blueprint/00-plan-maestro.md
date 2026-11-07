# 00 — Plan maestro: sitio de agencia Arata San (v2)

| Estado | Versión | Última actualización | Aprueba |
|---|---|---|---|
| En revisión | 0.2 | 7 nov 2026 | Sergio |

---

## 1. Objetivo

Convertir la landing actual (un solo servicio de chatbot y automatización, CTA a WhatsApp) en un **sitio de agencia** con un único objetivo:

> **Que el visitante agende una reunión.**

**Métrica principal:** reuniones agendadas por semana.
**Métricas de apoyo:** % de visitantes que llegan a `/agendar`, % que completa la agenda, asistencia a la llamada, velocidad móvil (PageSpeed) de cada página.

---

## 2. Alcance

### Servicios (exclusivamente dos)

| # | Servicio | Para quién | Paquetes (ver `01-estrategia` §1) |
|---|---|---|---|
| 1 | **Páginas que venden** (landing pages y sitios web) | Negocios que necesitan que les lleguen clientes por internet | Landing desde 400 USD · 5 días hábiles |
| 2 | **Catálogos y sistemas a medida** *(antes "apps", D-027)* | Negocios que venden por WhatsApp o manejan pedidos, reservas, inventario o clientes a mano | Catálogo desde 800 USD · 5 días hábiles · Sistema a medida cotizado |

Mantenimiento mensual: 15 % del valor del proyecto (D-022). Cupos: 3 proyectos nuevos al mes (D-023).

**Promesa en los dos servicios:** todo se diseña **primero para celular** (mobile-first) y sale **optimizado**: rápido, encontrable en Google y en la IA, y medido. Se presenta como promesa + auditoría gratis de gancho (D-014).

### Qué sale del sitio

- Chatbot con IA y automatización **dejan de ser servicios públicos**. Pueden aparecer como funcionalidad dentro de una app, pero no se venden por separado en el sitio. *(Consecuencia de D-002; por confirmar.)*
- El agente "Sara" sigue siendo herramienta interna (puede responder el WhatsApp y confirmar citas), no se ofrece como producto.

---

## 3. Principios del proyecto

1. **Una sola acción: agendar.** Todo CTA principal lleva a `/agendar`. WhatsApp queda como opción secundaria.
2. **Oferta antes que copy, copy antes que diseño.** Nada se diseña sin copy aprobado (regla de `CLAUDE.md` §2).
3. **Prueba antes que promesa.** Portafolio real, métricas reales, testimonios reales. Nada inventado.
4. **Mobile-first de verdad.** Cada página se diseña y se prueba primero a 360 px de ancho.
5. **El sitio es la prueba.** Si vendemos velocidad, nuestro sitio saca 90 o más en móvil en todas sus páginas.
6. **Todo se documenta.** Cada decisión en [`decisiones.md`](../decisiones.md); cada fase deja su documento en este blueprint.
7. **Se rehace lo que vende, se conserva lo que funciona.** Estructura, copy y componentes se hacen de cero. La base técnica que ya probó resultados (SEO 100, velocidad 100/93, seguridad, GTM) se conserva.

---

## 4. Mapa del sitio propuesto

| Ruta | Página | Trabajo de la página |
|---|---|---|
| `/` | Inicio | Entender la oferta en 5 segundos y llevar a agendar. Incluye la sección del equipo (D-016) |
| `/paginas-web` | Páginas que venden | Oferta completa de la *Página Lista en 5 Días* (D-037) |
| `/catalogos-y-sistemas` | Catálogos y sistemas a medida | Oferta de la *Tienda por WhatsApp en 5 Días* y de *Tu Negocio en Orden* (D-037) |
| `/portafolio` | Portafolio | Mostrar los trabajos, filtrados por tipo |
| `/portafolio/[proyecto]` | Caso de estudio | Problema → solución → resultado de cada proyecto |
| `/agendar` | Agendar | 3 preguntas (D-017), opción de auditoría gratis (D-036) y calendario de Cal.com (D-012). **La página que cuenta.** |
| `/agendar/gracias` | Confirmación | Confirmar la cita, preparar la llamada y registrar el evento |
| `/privacidad` | Política de datos | Cumplimiento de la Ley 1581 de 2012 (habeas data) |
| 404 | No encontrada | Ya existe; se adapta |

**Efecto en SEO:** pasar de una sola página a varias resuelve el hueco que salió en el diagnóstico orgánico ("una sola página = pocos términos para rankear"). Cada servicio y cada caso de estudio es una página que Google puede mostrar.

---

## 5. Fases

Cada fase tiene una **puerta**: no se pasa a la siguiente sin esa aprobación.

| # | Fase | Entregables | Documento | Puerta |
|---|---|---|---|---|
| 0 | Descubrimiento | Decisiones D1–D7, inventario del portafolio | Este archivo + `decisiones.md` | Sergio responde las decisiones |
| 1 | Estrategia (Hormozi) | Avatar, ecuación de valor, oferta de cada servicio, gancho, garantía, nombres, embudo, guion de llamada | `01-estrategia-hormozi.md` | Sergio aprueba la oferta |
| 2 | Arquitectura y copy | Mapa final, estructura sección por sección, copy en 2–3 versiones | `02-arquitectura.md`, `03-copy.md` | Sergio aprueba el copy |
| 3 | Sistema de diseño v2 | Tokens ampliados, componentes nuevos especificados, página de muestra | `04-sistema-de-diseno.md` | Sergio aprueba lo visual |
| 4 | Construcción | Sitio multi-página en Next.js, portafolio por datos, agenda integrada | `05-construccion.md` | Preview de Vercel revisado |
| 5 | SEO, IA, velocidad y legal | Metadatos y schema por página, sitemap, `llms.txt`, política de datos, QA móvil | `06-seo-geo-velocidad.md` | PageSpeed móvil ≥ 90 en todas las páginas |
| 6 | Medición y lanzamiento | Eventos de GTM/GA4, QA final, salida a producción | `07-medicion-lanzamiento.md` | Merge a `main` |
| 7 | Blueprint | Plantilla reutilizable y checklists consolidadas | `docs/README.md` | — |

---

## 6. Qué se conserva y qué se rehace

| Se conserva (ya probado) | Se rehace de cero |
|---|---|
| Next.js 16 + TypeScript + Tailwind | Estructura: de una página a sitio multi-página |
| Tokens de color y tipografías (Funnel Display + Plus Jakarta Sans locales) | Todo el copy |
| Cabeceras de seguridad y CSP | Componentes de secciones |
| Google Tag Manager (`GTM-TL7RLDMS`) | Navegación (menú con varias páginas, móvil incluido) |
| Base SEO: robots, sitemap, `llms.txt`, Open Graph, schema | Portafolio y casos de estudio |
| Reveals con `IntersectionObserver`, LightRays diferido | Flujo de agenda y calificación |

---

## 7. Decisiones pendientes (Fase 0)

| ID | Decisión | Opciones | Respuesta |
|---|---|---|---|
| D1 | **Portafolio** | ¿Qué proyectos reales hay y con qué material? | ✅ 4 proyectos (2 sitios web + 2 webs tipo catálogo) y 2 testimonios → D-011. Falta el inventario detallado (§10) |
| D2 | **Herramienta de agenda** | Cal.com · Calendly · Google Calendar | ✅ **Cal.com** → D-012 |
| D3 | **Precios en el sitio** | Ninguno · "Desde $X" · Paquetes con precio | ✅ **Paquetes con precio** → D-013. Faltan los precios |
| D4 | **Optimización y mobile-first** | Promesa · Tercer servicio · Promesa + auditoría | ✅ **Promesa + auditoría gratis** → D-014 |
| D5 | **Cambios del sistema de diseño** | Figma · Sergio los describe · Claude propone | ✅ **Sergio los describe** → D-015. Falta la descripción |
| D6 | **Página Nosotros** | Sí · No | ✅ **No**: el equipo va como sección del inicio → D-016 |
| D7 | **Preguntas antes de agendar** | Sin filtro · 3 preguntas | ✅ **3 preguntas** (tipo de proyecto, para cuándo, presupuesto) → D-017 |
| — | **Estructura de paquetes** | Propuesta en `01-estrategia` §4.3 | ✅ **Aprobada** → D-018. Faltan precios y plazos |

---

## 8. Riesgos y cómo se manejan

| Riesgo | Manejo |
|---|---|
| Portafolio sin métricas de negocio | Usar métricas técnicas que sí controlamos (velocidad, plazo) + testimonios textuales + proyectos propios como casos |
| El calendario embebido pesa y baja la velocidad | Cargarlo solo en `/agendar` y después de la primera interacción |
| Prometer resultados que no controlamos (ventas del cliente) | Garantías solo sobre lo que sí controlamos: plazo, velocidad, ajustes |
| Recoger datos personales (nombre, teléfono, correo) | Política de tratamiento de datos + casilla de autorización (Ley 1581 de 2012, Decreto 1377 de 2013) |
| Cambiar la oferta rompe campañas activas que apuntan a la landing actual | Redirigir las URLs viejas a las nuevas y revisar a dónde apuntan los anuncios antes de lanzar |

---

## 9. Estado

- [x] Plan maestro v0.1
- [x] Estrategia Hormozi — borrador v0.1
- [x] Estructura de documentación (`docs/`)
- [x] Decisiones D1–D4 respondidas
- [x] Decisiones D5–D7 respondidas y estructura de paquetes aprobada
- [x] Dirección del sistema de diseño v2 (D-025, D-026 → `04-sistema-de-diseno.md`)
- [ ] Capturas de referencia de 21st.dev y del estilo de portafolio
- [x] Inventario del portafolio (§10 → `portafolio.md`)
- [x] Precios, plazos, cupos y mensualidad
- [x] Estructura de servicios, moneda, garantía y nombres (D-027 a D-030)
- [x] Mantenimiento opcional y qué incluye cada paquete (D-031, D-032)
- [x] Panel de la Landing: adicional con costo (D-034)
- [x] **Estrategia aprobada — Fase 1 cerrada (D-035)**
- [x] Arquitectura v0.1 (`02-arquitectura.md`) y copy del Inicio v0.1 (`03-copy.md`)
- [x] Copy del Inicio aprobado (D-038 a D-043)
- [x] Referencias visuales de 21st.dev recibidas y traducidas (D-044)
- [x] Copy de las páginas de servicio aprobado (D-049 a D-051)
- [x] Copy de portafolio, casos, agendar, gracias, privacidad y 404 v0.1
- [x] **Copy aprobado — Fase 2 cerrada (D-056)**. Datos pendientes en `03-copy.md`
- [x] Sistema de diseño v2 en código: guía `/sistema` y muestra del Inicio `/v2` (D-057)
- [x] Velocidad de la muestra: Lighthouse móvil 94–97, accesibilidad 100 (D-059)
- [ ] **Aprobación visual de Sergio (puerta de la Fase 3)**
- [ ] Construcción
- [ ] SEO, IA, velocidad y legal
- [ ] Medición y lanzamiento
- [ ] Blueprint consolidado

---

## 10. Inventario del portafolio

✅ Completo en [`docs/portafolio.md`](../portafolio.md) (D-024): **Danrodedm** (catálogo de maquinaria), **Boost Your Menu** (landing), **Arata Print** (catálogo + sistema) y **Caravana** (catálogo + panel de tienda).

- El servicio 2 sí tiene prueba: Arata Print y Caravana ya son sistemas, con panel, pedidos, inventario y datos.
- Falta: testimonios (posibles: Arata Print, Caravana), cifras de resultado si existen, videos en loop y permiso de cada cliente.
