# 07 — Retrospectiva: lo que salió bien y lo que aprendimos

| Estado | Versión | Fecha | Para |
|---|---|---|---|
| Borrador | 0.1 | 11 nov 2026 | Sergio · Andrés · Santiago |

Barrido del panel de Arata San, del 10 al 11 nov 2026 (D-102 a D-117). Sirve para repetirlo con el primer cliente de página web sin cometer los mismos errores.

---

## 1. Qué quedó hecho

| Módulo | Estado |
|---|---|
| Acceso | Contraseña + doble factor (TOTP) + 10 códigos de respaldo; sin registro abierto; 3 cuentas (Sergio dueño, Andrés y Santiago equipo) |
| Resumen | Datos reales: ventas, ganancia, clientes nuevos, proyectos tarde, embudo. Visitas e Instagram: pendientes (§5) |
| Clientes | Lista y ficha con origen, servicios y proyecto en curso; sin repetidos |
| Proyectos | Grid + detalle por etapas; avance calculado de los pasos; el equipo marca pasos |
| Finanzas / Equipo | Reparto con bolsa por horas, % congelados al cierre, fondos, equilibrio y proyección |
| Mi sitio | Textos reales de aratasan.com; Guardar (borrador) y **Publicar** al sitio sin perder velocidad (D-117) |
| Publicación | `panel.aratasan.com` en un proyecto de Vercel aparte; el sitio no tiene ninguna clave |

---

## 2. Técnico

### Aciertos

| Qué | Por qué sirvió |
|---|---|
| Una sola puerta de datos (`obtenerPanel`, `cargarFinanzas`…) y un contrato de tipos | Pasamos de datos de ejemplo a Neon sin rehacer pantallas |
| La base nunca va al navegador | Toda consulta pasa por el servidor y filtra por negocio; menos superficie de ataque que RLS con llaves públicas |
| Reglas en la base, no solo en la pantalla | `tipo` del negocio solo `agencia`/`pagina-web` (los catálogos no entran); finanzas solo para la agencia por trigger; nombres de servicio únicos |
| Cálculos puros con prueba (`prueba-finanzas.ts`, `prueba-resumen.ts`) | El reparto de plata se puede verificar sin abrir el panel |
| Proyecto de Vercel aparte para el panel | El sitio no carga ni un byte del panel y no guarda claves |
| Publicar = reconstruir el sitio | Los textos cambian sin volver dinámica la página: 0 consultas por visita |
| Pruebas de punta a punta con navegador real y base local (PGlite) | Encontraron errores que la revisión de código no ve (llaves reordenadas por la base, cookie del doble factor) |

### Aprendizajes (con el error que los enseñó)

| Error | Qué pasó | Regla nueva |
|---|---|---|
| Contraseña de la base en una captura | Se rotó desde la consola de Neon, no por el chat | **Nunca** pegar claves ni capturas de `.env`. Si pasa, rotar ya |
| Doble factor rechazado en producción | `BETTER_AUTH_SECRET` distinto entre el computador y Vercel, con la misma base | Misma clave donde se use la misma base; si se quiere otra, otra base (rama de Neon) |
| Fecha de "mañana" después de las 7 p. m. | La base estaba en GMT | Base en `America/Bogota` y fechas con `lib/panel/fecha.ts` |
| El CSS del panel subió 13 KB el sitio | `inlineCss` mete todo el CSS global en cada página | CSS del panel aparte, con su propio Tailwind |
| Un archivo JS extra en el sitio | El panel importaba piezas del sitio y Next las movió a archivos compartidos | El panel no importa del sitio: usa sus copias |
| Neon no dejaba crear proyectos | La organización la administra Vercel | Crear y borrar bases desde Vercel → Storage |
| "Pendiente de publicar" falso | Postgres (`jsonb`) reordena las llaves y `JSON.stringify` daba diferente | Comparar campo por campo, nunca JSON como texto |
| Proyecto cerrado contaba "en proceso" | No tenía pasos | Regla explícita `estaEntregado()` |
| La curva del gráfico bajaba de $0 | Los puntos de control de la curva | Limitar al piso |
| Interruptor que se salía de su caja | Faltaba `left-0` en el botón absoluto | Revisar en celular cada control nuevo |
| Cloudflare con nube naranja en `panel` | Vercel mostraba "Proxy detected" | Para subdominios de Vercel: nube gris (solo DNS), igual que www |

---

## 3. Comercial

### Aciertos

| Qué | Por qué importa para vender |
|---|---|
| Probarlo primero con Arata | Lo que le mostremos a un cliente ya lo usamos nosotros con datos reales |
| Catálogos separados desde el día 1 | No se mezclan dos productos con promesas distintas |
| "Mi sitio" con publicar en 1–2 min | Es un argumento de la mensualidad: el cliente cambia su texto sin escribirnos y la página sigue rápida |
| Resumen que no inventa números | "Pendiente" en vez de cifras de mentira: confianza |
| Finanzas con reglas claras (bolsa por horas, % congelados) | Los tres socios ven lo mismo y nadie discute lo ya cerrado |
| Plantilla de pasos de página web = la promesa de 5 días | El tablero mide si cumplimos lo que vendemos |

### Aprendizajes

| Qué | Para la próxima |
|---|---|
| El panel todavía no tiene precio | Decidir P-1 (incluido en el mantenimiento o adicional) antes del primer cliente |
| Visitas e Instagram son lo que el cliente más quiere ver | Conectar GA4 e Instagram (§5) antes de mostrarlo en ventas |
| Hoy solo se editan textos y 3 botones | Preguntar a los primeros clientes qué más cambian (precios, fotos, horarios) antes de construirlo (P-4) |
| Sergio cargó pocos datos reales todavía | Usarlo 2 semanas con todo (proyectos, gastos, horas) es la puerta de la Fase 5 |

---

## 4. Diseño

### Aciertos

| Qué | Detalle |
|---|---|
| Mismo sistema v2 (solo fondo `#03010B`) | El panel se siente parte de la marca; lima solo en acción principal |
| Celular primero | Pestañas abajo, botones de 44 px, barra de guardado al alcance del pulgar |
| Palabras del negocio | "Clientes que compran", "visitas", "botón"; nada de "conversión" ni "sesión" |
| Listas en vez de texto libre | Cliente y servicio se eligen: no hay "Pagina web" y "Página Web" |
| Borrador → vista previa → guardar → publicar | Nada cambia sin que Sergio lo vea antes; la vista previa pinta el título en dos colores como el sitio |
| Avisos honestos | "Panel de ejemplo", "solo lectura", "pendiente de publicar", "lo marcó Andrés" |

### Aprendizajes

| Qué | Para la próxima |
|---|---|
| Se construyó antes de aprobar copy y diseño (Fase 3 adelantada) | En clientes, volver al orden oferta → copy → diseño → construcción |
| Errores visuales chicos llegaron a Sergio | Revisar capturas en 360 px y escritorio antes de entregar cada módulo |
| El título de Google del sitio tiene 73 caracteres (Google corta en 60) | Al publicar por primera vez, el panel obliga a acortarlo: es a propósito |

---

## 5. Visitas e Instagram: ¿n8n o API directa?

Las dos usan las mismas APIs oficiales. La diferencia es **quién las llama y cuándo**.

| | API directa desde el panel | n8n cada noche → Neon |
|---|---|---|
| Cómo | El servidor del panel pide a GA4 Data API e Instagram Graph API al abrir el Resumen (con caché de horas) | Un flujo a las 2 a. m. pide los datos de ayer y los guarda en `metricas_diarias` y `fuentes_visitas` |
| Velocidad del panel | Primera carga del día más lenta (1–3 s esperando a Google/Meta) | Siempre rápida: lee de su propia base |
| Historial | Depende de lo que guarden Google/Meta (Instagram da pocos días hacia atrás) | Se acumula para siempre en Neon |
| Muchos clientes | Una llamada por cliente y por visita al panel | Un solo flujo recorre todos los negocios |
| Token de Instagram (vence cada 60 días) | Hay que renovarlo en código | n8n lo renueva y avisa a Santiago por WhatsApp si falla |
| Dónde viven las claves | Variables del proyecto `arata-panel` | Credenciales de n8n (más una conexión a Neon con permisos solo de escritura de métricas) |
| Tiempo para tenerlo | Medio día | 1 día (flujos + usuario de base con permisos mínimos) |

**Recomendación: n8n.** Es como ya trabaja Santiago (Sara corre en n8n), guarda el historial, aguanta muchos clientes y avisa cuando un token vence. La API directa solo tiene sentido si queremos ver la cifra "de hoy" en vivo.

**Lo que hay que tener listo (sin pegar claves en el chat):**

| Fuente | Qué se necesita | Quién |
|---|---|---|
| GA4 (`G-PWBJXQML6S`) | Una cuenta de servicio de Google Cloud con la **API de Google Analytics Data** activa, agregada como **Lector** en la propiedad de GA4. Se anota el **ID numérico de la propiedad** (`properties/123…`) en `negocios.ga4_propiedad` | Santiago (Cloud) + Sergio (agregar el lector en GA4) |
| Instagram | Cuenta de Instagram **profesional** conectada a una **página de Facebook**; app de Meta con permisos `instagram_basic`, `instagram_manage_insights`, `pages_read_engagement`; token de larga duración; `negocios.instagram_id` | Sergio (cuentas) + Santiago (app y token) |
| Neon | Un usuario de base **solo para n8n** que únicamente pueda escribir `metricas_diarias` y `fuentes_visitas` | Claude lo crea con la migración `009` cuando arranquemos |

Flujos (ya definidos en `02-modelo-de-datos.md` §4): `panel-ga4-diario` (2:00 a. m., re-pide 3 días porque GA4 consolida tarde), `panel-instagram-diario` (2:15 a. m.) y `panel-alerta-fallo`.

---

## 6. Lo que sigue

| # | Qué | Quién |
|---|---|---|
| 1 | Crear el Deploy Hook y poner `SITIO_DEPLOY_HOOK` en `arata-panel` (`05-acceso-y-seguridad.md` §3c) | Sergio |
| 2 | Andrés y Santiago entran y activan su doble factor | Andrés · Santiago |
| 3 | Cargar datos reales: % de reparto, gastos fijos, clientes y proyectos | Sergio |
| 4 | GA4 + Instagram por n8n (§5) | Santiago + Claude |
| 5 | Usarlo 2 semanas y decidir precio (P-1) y qué más editar (P-4) | Sergio + Andrés |
| 6 | Primer cliente de página web: repetir con `04-construccion.md` | Equipo |
