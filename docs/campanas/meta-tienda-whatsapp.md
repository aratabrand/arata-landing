# Campaña de Meta — Tienda por WhatsApp en 5 Días

| Estado | Versión | Última actualización | Aprueba |
|---|---|---|---|
| Borrador | 0.1 | 2026-11-24 | Sergio (copy y oferta) · Andrés (público y presupuesto) |

**Landing:** `aratasan.com/lp/catalogos` (D-188, D-189) · **Objetivo:** reuniones agendadas para *Tienda por WhatsApp en 5 Días* (desde 800 USD).
**Regla:** primero se aprueba el copy (§5) y después se construye (§4). Los dolores de §2 marcados como *por validar* se confirman en las llamadas antes de volverlos titulares.

---

## 1. Resultado de las pruebas (24 nov 2026)

Medido sobre la construcción de producción, en local, con Lighthouse en celular y Playwright (iPhone 13 y un celular pequeño de 360 × 640).

| Qué se midió | Resultado | Lectura |
|---|---|---|
| Velocidad (Lighthouse celular) | **84 y 92** (dos corridas) | Pasa la garantía de 90 en una de dos. Hay que dejarla fija arriba de 90 |
| Título (LCP) | **3,3 s** | Es la animación de entrada del título. Lo mismo pasa en la página del sitio (3,2 s) |
| Saltos de diseño (CLS) | 0 | Bien |
| Accesibilidad / buenas prácticas | 100 / 100 | Bien |
| SEO | 69 | Es por el `noindex` y es a propósito (la landing no compite en Google) |
| Peso al abrir | **487 KB** | Bien. El video de Caravana (2,3 MB) solo baja cuando la persona llega a él |
| Primer pantallazo (360 × 640) | Título, «Desde 800 USD» y botón visibles sin bajar | Bien |
| Largo de la página | **13 pantallas** en celular pequeño | Larga para tráfico frío de Instagram. Meta: 8 o 9 |
| Botones a agendar | 6, más la barra fija | Bien |
| Enlaces que sacan de la página | **0** (se quitaron portafolio y fichas, D-189) | Bien. Solo quedan Agendar y la política de datos (en otra pestaña) |
| Ofertas en la página | **2**: Tienda por WhatsApp y *Tu Negocio en Orden* | Distrae: el anuncio vende una sola cosa |
| Prueba social | 1 video (Caravana), **sin testimonio** | Es lo que más falta para tráfico frío |
| Origen del interesado | Las `utm` de Meta no pasan a `/agendar` ni a Cal.com | Si rechaza cookies, no sabemos que vino de Meta |
| `/agendar` | Tiene el menú completo del sitio | Al tocar «Agendar» vuelve a haber salidas |
| Pixel de Meta | No está | Lo instalan Sergio y Andrés (25 nov) |

---

## 2. Dolores del comerciante que vende por WhatsApp e Instagram

**Fuente:** *Caso* = lo vivimos con un cliente real (Caravana, Arata Print, Danrodedm). *Blueprint* = ya está en `01-estrategia-hormozi.md` §2 y §4. *Por validar* = hipótesis de mercado: Andrés la pregunta en las llamadas y la confirmamos antes de usarla como titular.

### A. El chat se come el día (tiempo)

| Lo que dice el comerciante | Lo que le cuesta | Lo que lo resuelve | Fuente |
|---|---|---|---|
| «Me toca mandar foto por foto» | Horas al día pegado al celular; el cliente se pierde en la galería | Catálogo con categorías: manda un enlace y el cliente ve todo | Caso Caravana |
| «Me preguntan "¿precio?" 50 veces al día» | Responde lo mismo todo el día y no alcanza a vender | Cada producto con precio y fotos; el cliente llega sabiendo qué quiere | Por validar |
| «Contesto pedidos a las 11 de la noche» | No descansa; el negocio depende de que él esté despierto | El cliente arma el pedido solo, a cualquier hora | Por validar |
| «Tengo los pedidos regados en el chat» | Errores de talla, color, cantidad o dirección | El pedido llega ordenado al WhatsApp, con productos y cantidades | Blueprint |

### B. Ventas que se escapan (plata)

| Lo que dice el comerciante | Lo que le cuesta | Lo que lo resuelve | Fuente |
|---|---|---|---|
| «Se me pierden pedidos» | Ventas que ya estaban hechas | Pedido ordenado + panel con todos los pedidos | Blueprint |
| «Si me demoro en contestar, el cliente le compra a otro» | Clientes que se salen mientras espera respuesta | El cliente ve precios y arma su pedido sin esperar | Por validar |
| «En Instagram nadie encuentra los precios» | Visitas al perfil que no compran | Enlace en la biografía que abre la tienda | Por validar |
| «El catálogo de WhatsApp Business se queda corto» | Desorden con muchos productos | Tienda propia con categorías y buscador | Por validar |

### C. No sabe qué pasa en su negocio (control)

| Lo que dice el comerciante | Lo que le cuesta | Lo que lo resuelve | Fuente |
|---|---|---|---|
| «No sé cuánto me queda» | Vende lo que no tiene y queda mal | Inventario en el panel | Blueprint |
| «No sé qué es lo que más me compran» | Compra mercancía a ciegas | Datos de venta en el panel | Caso Arata Print |
| «Llevo todo en un cuaderno o en Excel» | Cuentas que no cuadran, nada en el celular | Panel desde el celular | Blueprint |

### D. El cliente no le cree (confianza e imagen)

| Lo que dice el comerciante | Lo que le cuesta | Lo que lo resuelve | Fuente |
|---|---|---|---|
| «Me preguntan si soy real o si es estafa» | Clientes que no se atreven a pagar por transferencia | Tienda con dominio propio, se ve como negocio serio | Por validar |
| «Me veo más pequeño que la competencia» | Pierde frente a quien sí tiene tienda | Tienda con su marca, rápida en el celular | Por validar |

### E. Depende de otros (riesgo)

| Lo que dice el comerciante | Lo que le cuesta | Lo que lo resuelve | Fuente |
|---|---|---|---|
| «Si me cierran el Instagram, me quedo sin negocio» | Todo el negocio en una cuenta que no es suya | Tienda y dominio propios; Instagram solo lleva gente | Por validar |
| «Las plataformas me cobran comisión por cada venta» | Pierde margen en cada pedido | Pago único; el pedido llega directo, sin comisión | Por validar |
| «Las tiendas en línea cobran mensualidad en dólares y son difíciles» | Paga cada mes algo que no sabe usar | Pago único, panel en español y capacitación | Por validar |

### F. Miedos al comprar (objeciones de la reunión)

| Objeción | Respuesta que ya tenemos | Dónde va |
|---|---|---|
| «No sé de tecnología» | Te lo dejamos funcionando y te enseñamos a usarlo (capacitación incluida) | Proceso y FAQ |
| «No tengo tiempo para eso» | 5 días hábiles; tú solo apruebas y subes tus productos | Hero y proceso |
| «Es caro» | Pago 50 % / 50 %; se paga una vez, sin comisión por venta | Franja de precio y FAQ |
| «El que me hizo la página desapareció» | Mantenimiento opcional (15 % al mes); seguimos aquí | FAQ (nueva) |
| «¿Y si no me sirve?» | Garantía de velocidad + 2 rondas de ajustes | Junto al precio |
| «Mis clientes no pagan en línea» | No hace falta: el pedido llega por WhatsApp y cobras como siempre | FAQ (ya está) |
| «Tengo muchos productos» | ◻ Falta el límite de productos (pendiente de Sergio) | FAQ |
| «¿La tienda es mía? ¿Qué pasa después del primer año?» | ◻ Falta la respuesta: costo de dominio y hosting desde el año 2 | FAQ (nueva) |

---

## 3. Estrategia de la campaña

### Públicos (los define Andrés con el Administrador de anuncios)

| Público | A quién busca | Ángulo que mejor le habla |
|---|---|---|
| P1 — Vende por Instagram | Dueños de tiendas de ropa, accesorios, belleza, tecnología, comida empacada; intereses de emprendimiento y WhatsApp Business; Colombia | A (tiempo) y B (ventas) |
| P2 — Negocio con local | Ferreterías, papelerías, repuestos, distribuidoras que reciben pedidos por chat | C (control) |
| P3 — Abierto (Advantage+) | Sin intereses; Meta busca con el pixel | El ángulo que gane en P1 |

### Ángulos de anuncio (uno por grupo de dolores)

| Ángulo | Gancho de los primeros 3 segundos | Formato | Material real que ya existe |
|---|---|---|---|
| A — Tiempo | «¿Todavía mandas foto por foto?» | Reel 9:16: chat lleno de fotos → enlace a la tienda | Video de Caravana |
| B — Ventas | «El pedido te llega así de ordenado a tu WhatsApp» | Reel o imagen: mensaje de pedido real | Pedido real de Caravana o Arata Print (◻ captura) |
| C — Control | «¿Sabes qué es lo que más te compran?» | Carrusel: panel con inventario y datos | Panel de Caravana / Arata Print (◻ capturas) |
| D — Rapidez | «Tu tienda lista en 5 días hábiles» | Imagen o carrusel con el proceso de 5 pasos | Copy del proceso |

**Regla de continuidad (message match):** el titular de la landing repite la promesa del anuncio. Cada ángulo lleva su `utm_content` y, cuando se apruebe, su versión de titular (§5.1).

### Estructura y medición

| Tema | Propuesta |
|---|---|
| Objetivo de la campaña | **Clientes potenciales** en el sitio web, optimizando al evento *Lead* (reunión agendada en `/agendar/gracias`) |
| Mientras el pixel aprende | Si en 7 días hay menos de ~10 *Lead*, optimizar a un evento anterior (clic en «Agendar» o paso «datos») y volver a *Lead* cuando haya volumen |
| Estructura de prueba | 1 campaña · 2 o 3 conjuntos (P1, P2, P3) · 3 anuncios por conjunto (ángulos A, B, D) |
| Eventos | `PageView` en la landing → `clic_agendar` (nuevo, P0 #2) → `agendar_paso` y `agendar_datos_completos` (ya existen) → `cita_agendada` / `reunion_confirmada` = ***Lead*** (ya existen, `05-construccion.md` §3) |
| Permiso | El pixel solo se activa con un permiso propio de «publicidad» en el aviso de cookies (Ley 1581, igual que Analytics y Clarity, D-130 y D-132) |
| Costo máximo por reunión | Se calcula con números propios: **precio × % de cierre × % del valor que se acepta gastar en publicidad**. Ejemplo para llenar: 800 USD × 20 % de cierre × 25 % = 40 USD por reunión. Los porcentajes los ponen Sergio y Andrés |

### Embudo y qué mirar cada semana

| Paso | Dónde se ve | Si está bajo, se cambia |
|---|---|---|
| Ven el anuncio → tocan | Meta (CTR de enlace) | El gancho o el creativo |
| Tocan → abre la landing | Meta (vistas de la página de destino) | Velocidad dentro de Instagram |
| Landing → tocan «Agendar» | GA4 (`clic_agendar`, nuevo) | Titular, prueba social, oferta |
| Agendar → datos completos | GA4 (`agendar_paso`, `agendar_datos_completos`) | Preguntas del formulario |
| Datos → reunión agendada | Panel, pestaña Interesados | Calendario, horarios |
| Agendada → asiste | Panel | Recordatorio por WhatsApp |
| Asiste → cierra | Panel, Finanzas | Guion de la reunión (`01-estrategia-hormozi.md` §10) |

Cifras de referencia para empezar (se reemplazan por las propias después de 2 semanas): CTR de enlace bajo 1 % = cambiar el creativo; menos de 10 % de quienes abren la landing tocan «Agendar» = cambiar el titular o la oferta.

---

## 4. Mejoras de la landing (por prioridad)

### P0 — Antes de prender la campaña

| # | Mejora | Por qué | Quién |
|---|---|---|---|
| 1 | **Pixel + evento *Lead*** con permiso propio en el aviso de cookies y la política actualizada | Sin pixel, Meta no sabe a quién buscar | Sergio y Andrés (25 nov) + Claude |
| 2 | **Pasar el origen a la agenda:** las `utm` de la landing viajan a `/agendar` y quedan en las notas de Cal.com («Origen: Meta · ángulo A»); el panel lo muestra en Interesados. Además, evento `clic_agendar` en cada botón de la landing | Saber qué anuncio trae reuniones aunque rechacen cookies, y cuánta gente toca «Agendar» | Claude |
| 3 | **`/agendar` sin menú** cuando viene de la landing | Al tocar «Agendar» vuelven a aparecer salidas | Claude |
| 4 | **Quitar *Tu Negocio en Orden*** de la landing (sección y su pregunta frecuente) | Un anuncio, una oferta, un botón | Claude (aprueba Sergio) |
| 5 | **Titular según el ángulo del anuncio** (§5.1) | Continuidad entre anuncio y página | Copy: Sergio · Código: Claude |
| 6 | **Título sin animación en la landing** | Baja el LCP de 3,3 s y deja la velocidad fija arriba de 90 | Claude |

### P1 — Primera semana

| # | Mejora | Por qué |
|---|---|---|
| 7 | **Sección de dolores más fuerte:** 4 tarjetas por grupo (tiempo, ventas, control, confianza) con el costo de seguir igual (§5.2) | La sección actual es corta y no dice qué le cuesta |
| 8 | **«Así te llega el pedido»:** captura real de un pedido en WhatsApp | Es la promesa central; hoy no se ve |
| 9 | **Testimonio de Caravana** (texto o video corto del dueño) | Única pieza de prueba que falta y la más fuerte para tráfico frío |
| 10 | **Preguntas que faltan:** cuántos productos caben, qué pasa después del primer año, si la tienda es mía, si sirve si no sé de tecnología | Son las objeciones de §2-F |
| 11 | **Página más corta:** de 13 a 8 o 9 pantallas (sin *Tu Negocio en Orden*, casos en una fila deslizable) | Tráfico frío lee poco |
| 12 | **Precio también en pesos** («Desde 800 USD, unos $ X COP») | El comerciante colombiano piensa en pesos; el dólar asusta o confunde. Necesita decisión de Sergio |

### P2 — Pruebas A/B (una a la vez, con al menos 2 semanas de datos)

| # | Prueba | Hipótesis |
|---|---|---|
| 13 | Botón «Agendar reunión» **vs.** «Escríbenos por WhatsApp» | Este cliente vive en WhatsApp: escribir le cuesta menos que agendar. Riesgo: menos filtro |
| 14 | Gancho «En la reunión te mostramos cómo se vería tu tienda con tu logo» | Hace concreta la reunión (Hormozi: revelar el resultado) |
| 15 | «Cupos de diciembre: quedan X» | Urgencia real; solo si se actualiza de verdad (`01-estrategia-hormozi.md` §8) |
| 16 | Video de Caravana más liviano (480p, ~1 MB) | Datos móviles prepago |

---

## 5. Copy para aprobar (Sergio)

Español colombiano plano, en tú, igual que el sitio.

### 5.1 Titular (uno por ángulo)

| Ángulo | Versión | Titular | Subtítulo |
|---|---|---|---|
| Actual | — | Tu tienda lista en 5 días. Los pedidos te llegan al WhatsApp. | Catálogo con carrito, inventario y un panel para manejar tu negocio desde el celular. Desde 800 USD. |
| A — Tiempo | A1 | Deja de mandar foto por foto. | Tu tienda con todos tus productos en un enlace. El cliente arma su pedido y te llega ordenado al WhatsApp. Lista en 5 días. |
| A — Tiempo | A2 | Tus clientes arman el pedido solos. Tú solo lo despachas. | Catálogo con carrito que te manda el pedido al WhatsApp, a cualquier hora. Lista en 5 días, desde 800 USD. |
| B — Ventas | B1 | Que ningún pedido se te pierda en el chat. | Cada pedido te llega ordenado al WhatsApp y queda guardado en tu panel. Tu tienda lista en 5 días. |
| C — Control | C1 | Sabe qué vendes, qué te queda y qué te compran más. | Tienda con inventario y datos de venta en tu celular. Los pedidos te llegan al WhatsApp. Lista en 5 días. |

### 5.2 Sección de dolores (reemplaza «Si vendes por WhatsApp, esto te suena»)

**Título:** «Vender por WhatsApp no debería quitarte todo el día» · alterna: «Si vendes por chat, esto te pasa»

| Tarjeta | Texto |
|---|---|
| Tiempo | Mandas foto por foto y respondes «¿precio?» todo el día. |
| Ventas | Si te demoras en contestar, el cliente le compra a otro. |
| Pedidos | Los pedidos se te pierden entre mensajes, audios y fotos. |
| Control | No sabes cuánto te queda ni qué es lo que más se vende. |

**Cierre:** «Con tu tienda, el cliente ve todo, arma su pedido y te llega ordenado. Tú solo lo despachas.»

### 5.3 Preguntas nuevas

| Pregunta | Respuesta |
|---|---|
| ¿Necesito saber de tecnología? | No. Te la entregamos funcionando y te enseñamos a subir productos y ver pedidos desde el celular. |
| ¿Cuántos productos caben? | ◻ Pendiente del límite (Sergio). |
| ¿La tienda es mía? | ◻ Pendiente: dominio a nombre de quién y costo desde el segundo año. |
| ¿Y si después necesito un cambio? | Tienes 2 rondas de ajustes incluidas. Después, el mantenimiento es opcional. |

---

## 6. Calendario

| Cuándo | Qué | Quién |
|---|---|---|
| 25 nov | Pixel y evento *Lead*; permiso de publicidad en el aviso de cookies | Sergio, Andrés, Claude |
| 25–26 nov | Sergio aprueba titulares (§5.1), dolores (§5.2) y preguntas (§5.3); decide precio en pesos y quitar *Tu Negocio en Orden* | Sergio |
| 26–27 nov | Construir P0 y P1 aprobados; prueba de velocidad y dentro del navegador de Instagram | Claude |
| 27 nov | Creativos de los ángulos A, B y D (carrusel-studio para carruseles; Reel con el video de Caravana) | Sergio |
| 28 nov | Prender campaña | Andrés |
| Cada lunes | Revisar el embudo de §3 y anotar decisiones en `decisiones.md` | Andrés y Sergio |
| Semana 3 | Primera prueba A/B de P2 | Andrés |
