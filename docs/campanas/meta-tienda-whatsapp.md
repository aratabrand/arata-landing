# Campaña de Meta — Tienda por WhatsApp en 5 Días

| Estado | Versión | Última actualización | Aprueba |
|---|---|---|---|
| Copy aprobado (D-193) | 0.4 | 2026-11-24 | Sergio (copy y oferta) · Andrés (público y presupuesto) |

**Landing:** `aratasan.com/lp/catalogos` (D-189, D-190) · **Objetivo:** reuniones agendadas para *Tienda por WhatsApp en 5 Días* (desde 800 USD).
**Regla:** primero se aprueba el copy (§5) y después se construye (§4). Ya construido (D-191): sin *Tu Negocio en Orden*, precio en pesos y las respuestas de productos y primer año. Los dolores de §2 marcados como *por validar* se confirman en las llamadas antes de volverlos titulares.

---

## 0. Oferta vigente (D-192)

| Qué | Valor |
|---|---|
| Precio de noviembre | **$ 2.200.000** (antes $ 2.800.000), precio fijo, sin «desde» |
| Hasta | 30 de noviembre de 2026, 11:59 p. m. de Bogotá. El 1 de diciembre la landing vuelve sola a «Desde $ 2.800.000» y la cinta desaparece (se revisa cada hora) |
| Dónde se ve | Cinta lima fija arriba (precio, precio tachado y días que quedan), inicio y franja de precio |
| Se cambia en | `OFERTA` en `content/campanas/catalogos.ts` |
| Bonos (D-198, D-201) | 1) Te subimos tus primeros 30 productos · 2) Código QR para tu local y tus empaques · 3) Kit para compartir tu tienda (mensaje de difusión, texto para estados y frase con el enlace para Instagram). Gratis para quien agende hasta el 30 |
| Cupos (D-198) | Máximo 8 tiendas al mes, solo en esta campaña (el sitio sigue con 4, D-172) |
| Condición (D-195) | Vale para quien **agende** la reunión hasta el 30 de noviembre, aunque la propuesta o el pago lleguen en diciembre. Se dice junto al precio. Auditoría y mejoras: [`auditoria-oferta-2026-11-24.md`](auditoria-oferta-2026-11-24.md) |
| Regla | El Estatuto del Consumidor (Ley 1480 de 2011) pide que una promoción diga su vigencia y sus condiciones, y que se respete el precio anunciado. Los anuncios de Meta con este precio se apagan el 30 de noviembre |

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
| Enlaces que sacan de la página | **0** (se quitaron portafolio y fichas, D-190) | Bien. Solo quedan Agendar y la política de datos (en otra pestaña) |
| Ofertas en la página | ~~2~~ → **1** (se quitó *Tu Negocio en Orden*, D-191) | Un anuncio, una oferta |
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
| «Tengo muchos productos» | Caben más de 100 (D-191) | FAQ ✅ |
| «¿Qué pasa después del primer año?» | Se renueva el contrato y se paga el dominio (D-191) | FAQ ✅ |

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
| 4 | ✅ **Quitar *Tu Negocio en Orden*** de la landing (sección, pregunta y mención en el proceso), D-191 | Un anuncio, una oferta, un botón | Hecho |
| 5 | **Titular según el ángulo del anuncio** (§5.1) | Continuidad entre anuncio y página | Copy: Sergio · Código: Claude |
| 6 | **Título sin animación en la landing** | Baja el LCP de 3,3 s y deja la velocidad fija arriba de 90 | Claude |

### P1 — Primera semana

| # | Mejora | Por qué |
|---|---|---|
| 7 | **Sección de dolores más fuerte:** 4 tarjetas por grupo (tiempo, ventas, control, confianza) con el costo de seguir igual (§5.2) | La sección actual es corta y no dice qué le cuesta |
| 8 | **«Así te llega el pedido»:** captura real de un pedido en WhatsApp | Es la promesa central; hoy no se ve |
| 9 | **Testimonio de Caravana** (texto o video corto del dueño) | Única pieza de prueba que falta y la más fuerte para tráfico frío |
| 10 | **Preguntas que faltan** (§5.4). ✅ Ya están: cuántos productos caben y qué pasa después del primer año (D-191) | Son las objeciones de §2-F |
| 11 | **Página más corta:** de 13 a 8 o 9 pantallas (sin *Tu Negocio en Orden*, casos en una fila deslizable) | Tráfico frío lee poco |
| 12 | ✅ **Precio en pesos:** «Desde $ 2.800.000 · unos 800 USD» (D-191) | El comerciante colombiano piensa en pesos |

### P2 — Pruebas A/B (una a la vez, con al menos 2 semanas de datos)

| # | Prueba | Hipótesis |
|---|---|---|
| 13 | Botón «Agendar reunión» **vs.** «Escríbenos por WhatsApp» | Este cliente vive en WhatsApp: escribir le cuesta menos que agendar. Riesgo: menos filtro |
| 14 | Gancho «En la reunión te mostramos cómo se vería tu tienda con tu logo» | Hace concreta la reunión (Hormozi: revelar el resultado) |
| 15 | «Cupos de diciembre: quedan X» | Urgencia real; solo si se actualiza de verdad (`01-estrategia-hormozi.md` §8) |
| 16 | Video de Caravana más liviano (480p, ~1 MB) | Datos móviles prepago |

---

## 5. Copy: ¿resuelve los dolores? (revisión del 24 nov 2026) — ✅ aprobado y construido (D-193)

### 5.0 Lo que la landing dice hoy, dolor por dolor

Se compararon los 24 dolores de §2 con todo el texto de `/lp/catalogos` (ya sin *Tu Negocio en Orden* y con precio en pesos, D-191).

| Grupo | Dolor | ¿Lo dice hoy? | Dónde / qué falta |
|---|---|---|---|
| A. Tiempo | Foto por foto | ✅ | Dolores, tarjeta 1. No dice cuánto tiempo le quita |
| A. Tiempo | «¿Precio?» todo el día | ❌ | En ninguna parte |
| A. Tiempo | Pedidos a las 11 de la noche | ❌ | Nunca se dice que la tienda recibe pedidos a cualquier hora |
| A. Tiempo | Pedidos regados en el chat | ✅ | Dolores, tarjeta 2 |
| B. Ventas | Pedidos que se pierden | ✅ | Dolores, tarjeta 2, y el titular |
| B. Ventas | Si se demora, el cliente compra en otro lado | ❌ | — |
| B. Ventas | En Instagram nadie encuentra los precios | ❌ | — |
| B. Ventas | El catálogo de WhatsApp Business se queda corto | ❌ | — |
| C. Control | No sabe cuánto le queda | ✅ | Dolores, tarjeta 3, y preguntas |
| C. Control | No sabe qué le compran más | ✅ | Dolores, tarjeta 4. No se muestra el panel con datos |
| C. Control | Cuaderno o Excel | 🟡 | Solo «panel desde el celular» en el subtítulo |
| D. Confianza | «¿Es real o es estafa?» | ❌ | — |
| D. Confianza | Se ve más pequeño que la competencia | ❌ | — |
| E. Riesgo | Si cierran el Instagram, se queda sin negocio | ❌ | — |
| E. Riesgo | Comisión por cada venta | ❌ | Es un argumento fuerte y no se usa: el pedido llega directo |
| E. Riesgo | Mensualidad en dólares | 🟡 | El precio ya va en pesos, pero «Mantenimiento 15 % al mes» parece una mensualidad obligatoria |
| F. Miedos | No sabe de tecnología | 🟡 | Solo «Capacitación incluida» en el proceso |
| F. Miedos | No tiene tiempo | ✅ | 5 días hábiles, desde el primer pantallazo |
| F. Miedos | Es caro | ✅ | Pesos y pago 50 % / 50 % |
| F. Miedos | El que le hizo la página desapareció | 🟡 | La tarjeta de mantenimiento no dice para qué sirve |
| F. Miedos | ¿Y si no me sirve? | 🟡 | La garantía es de velocidad y dice «tu página», no «tu tienda» |
| F. Miedos | Sus clientes no pagan en línea | ✅ | Preguntas |
| F. Miedos | Tiene muchos productos | ✅ | Preguntas: más de 100 (D-191) |
| F. Miedos | Después del primer año | ✅ | Preguntas: se renueva el contrato y se paga el dominio (D-191) |

**Resultado: 10 resueltos, 5 a medias y 9 sin tocar.** Lo mejor cubierto es el *control* (inventario, qué se vende). Faltan por completo la *confianza* y la *dependencia de Instagram*, y la mitad del *tiempo* y de las *ventas que se escapan*: justo los dolores que más se sienten en el día a día.

Otros problemas del copy actual:

| # | Problema | Por qué importa |
|---|---|---|
| 1 | El subtítulo del inicio es una lista de funciones («catálogo con carrito, inventario y un panel») | El comerciante compra el resultado (menos chat, más pedidos), no las funciones |
| 2 | La sección de dolores no tiene cierre | Nombra el problema y no lo conecta con la solución |
| 3 | «Videos reales de los catálogos y páginas que hicimos, y lo que dicen sus dueños» | Hoy no hay testimonio y habla de páginas: promete algo que la sección no muestra |
| 4 | La garantía dice «tu página» | En esta landing se vende una tienda |
| 5 | «Mantenimiento opcional: 15 % al mes» sin contexto | Para este cliente suena a mensualidad obligatoria |

### 5.1 Titular (★ = recomendado)

| Ángulo | Versión | Titular | Subtítulo | Dolores que cubre |
|---|---|---|---|---|
| Actual | — | Tu tienda lista en 5 días. Los pedidos te llegan al WhatsApp. | Catálogo con carrito, inventario y un panel para manejar tu negocio desde el celular. Desde $ 2.800.000. | B1, F2 |
| A — Tiempo | ★ A1 | Deja de mandar foto por foto. | Todos tus productos con precio en un enlace. El cliente arma su pedido y te llega ordenado al WhatsApp. Tu tienda lista en 5 días, desde $ 2.800.000. | A1, A2, A4, B1, F2, F3 |
| A — Tiempo | A2 | Tus clientes arman el pedido solos. Tú solo lo despachas. | Una tienda que te manda los pedidos ordenados al WhatsApp, a cualquier hora. Lista en 5 días, desde $ 2.800.000. | A3, A4, B1, F2, F3 |
| B — Ventas | B1 | Que ningún pedido se te pierda en el chat. | Cada pedido te llega ordenado al WhatsApp y queda guardado en tu panel. Tu tienda lista en 5 días, desde $ 2.800.000. | A4, B1, C3, F2, F3 |
| C — Control | C1 | Sabe qué vendes, qué te queda y qué se vende más. | Tienda con inventario y datos de venta en tu celular. Los pedidos te llegan al WhatsApp. Lista en 5 días, desde $ 2.800.000. | C1, C2, C3, F2, F3 |

★ **A1** porque nombra el dolor que más se ve (la galería de fotos, caso Caravana) y en el subtítulo resuelve el «¿precio?», el pedido ordenado, el tiempo y el precio. Las otras quedan para los anuncios de cada ángulo (`utm_content`).

### 5.2 Sección de dolores

**Título:** ★ «Vender por chat no debería quitarte todo el día» · alterna: «Si vendes por WhatsApp, esto te suena» (la actual)

| # | Título de la tarjeta | Texto | Dolores |
|---|---|---|---|
| 1 | Mandas foto por foto | Y respondes «¿precio?» todo el día. El cliente se cansa antes de comprar. | A1, A2 |
| 2 | Los pedidos se pierden en el chat | Entre audios, fotos y mensajes, alguno se te pasa o llega con la talla equivocada. | A4, B1 |
| 3 | Si te demoras, compra en otro lado | Mientras le contestas a uno, otro se cansa de esperar. Y de noche nadie te compra. | B2, A3 |
| 4 | No sabes qué tienes ni qué se vende | Vendes lo que ya no hay y compras mercancía a ciegas. | C1, C2 |

**Cierre (nuevo):** «Con tu tienda, el cliente ve todo con precio, arma su pedido a cualquier hora y te llega ordenado al WhatsApp. Tú solo lo despachas.»

### 5.3 Caso de éxito (corrige el problema 3)

| Campo | Hoy | Propuesta |
|---|---|---|
| Etiqueta | Casos de éxito | Caso real |
| Título | Mira cómo les funciona a nuestros clientes. | Así le funciona a Caravana. |
| Texto | Videos reales de los catálogos y páginas que hicimos, y lo que dicen sus dueños. | Pasaron de mandar fotos por WhatsApp a una tienda con inventario, pedidos y datos de venta en un panel. |

Cuando llegue el testimonio del dueño de Caravana, se vuelve a «lo que dice su dueño».

### 5.4 Preguntas frecuentes (orden por objeción)

Se cubren los dolores D y E sin agregar secciones nuevas. Quedan 9 preguntas (hoy son 8).

| # | Pregunta | Respuesta | Estado |
|---|---|---|---|
| 1 | ¿Cómo me llegan los pedidos? | El cliente arma su pedido en tu tienda y te llega ordenado a tu WhatsApp, con productos y cantidades. | Ya está |
| 2 | ¿Me cobran comisión por cada venta? | No. El pedido te llega directo a tu WhatsApp y el pago lo recibes tú completo. | Nueva (E2) |
| 3 | ¿Por qué una tienda y no solo Instagram o el catálogo de WhatsApp? | Porque es tuya: tu dominio, tus productos y tus pedidos. Si Instagram cambia o te cierran la cuenta, tu tienda sigue funcionando. Y se ve como un negocio serio, así tus clientes confían en comprarte. | Nueva (B3, B4, D1, D2, E1) |
| 4 | ¿Necesito saber de tecnología? | No. Te la entregamos funcionando y te enseñamos a subir productos y ver tus pedidos desde el celular. | Nueva (F1) |
| 5 | ¿Cuántos productos caben? | Más de 100. El precio depende de cuántos productos y categorías tengas: en la reunión te damos el precio exacto. | Ya está (reemplaza «¿Por qué el precio dice "desde"?») |
| 6 | ¿Quién sube los productos y maneja el inventario? | Tú, desde tu panel, también en el celular. Te enseñamos en la capacitación. | Une dos que ya están |
| 7 | ¿Puedo pagar por partes? | Sí: 50 % para arrancar y 50 % cuando te entregamos. | Ya está |
| 8 | ¿Mis clientes pueden pagar en línea? | Por ahora no. El cliente arma su pedido, te llega por WhatsApp y cobras como siempre. | Ya está, más corta |
| 9 | ¿Hay que pagar algo cada mes? | No es obligatorio. El primer año el dominio y el hosting van por nuestra cuenta; después se renueva el contrato y se paga el dominio. El mantenimiento (15 % del valor del proyecto al mes) es opcional, por si quieres que nos encarguemos del soporte. | Une «después del primer año» con el mantenimiento (E3, F4) |

### 5.5 Ajustes cortos

| Dónde | Hoy | Propuesta |
|---|---|---|
| Garantía | «Si tu página no saca 90…» | «Si tu tienda no saca 90 o más en velocidad móvil de Google, la seguimos ajustando gratis hasta lograrlo.» |
| Mantenimiento | «15 % del valor de tu proyecto al mes.» | «Opcional: 15 % al mes si quieres que nos encarguemos del soporte.» |
| Llamado final | «Agenda y te decimos en 30 minutos qué necesitas y cuánto cuesta.» | «Agenda y en 30 minutos te decimos cuánto cuesta tu tienda.» |

**Con todo lo anterior: 21 de 24 dolores cubiertos y 3 a medias.** «No sabe qué le compran» necesita mostrar el panel con datos (P1 #8). «El que me la hizo desapareció» y «¿y si no me sirve?» se responden con texto, pero lo que los cierra es la prueba: el testimonio del dueño de Caravana (P1 #9).

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

---

## 7. Paso a paso para prender la campaña (26 nov 2026)

Lo hacen Sergio y Andrés en Cal.com, Vercel, Meta y Cloudflare. Ninguna clave pasa por el chat. Los nombres de los botones pueden variar un poco según el idioma de cada herramienta.

### 7.1 Evento de Cal.com para la landing (15 min · Sergio)

El webhook del panel está en **Ajustes → Desarrollador → Webhooks** y vale para toda la cuenta, así que el evento nuevo también llega a Interesados sin tocar nada más.

1. Cal.com → **Tipos de evento** → **Nuevo**.
   - Título: `Tienda por WhatsApp · Precio de noviembre`
   - URL: `tienda-noviembre`
   - Duración: 30 min
2. Pestaña **Detalles**: la misma ubicación de la reunión de siempre (Cal Video).
3. Pestaña **Disponibilidad**: el mismo horario de la reunión de siempre.
4. Pestaña **Avanzado**:
   - **Requiere confirmación: apagado.** Quien viene del anuncio queda agendado de una; si se queda encendido, espera a que lo acepten.
   - **Preguntas de reserva → Agregar una pregunta**:

     | Tipo | Identificador | Etiqueta | Obligatoria |
     |---|---|---|---|
     | Teléfono | `whatsapp` | Tu WhatsApp | Sí |
     | Casilla de verificación | `autorizacion` | Autorizo a Arata San a usar mis datos para atender mi solicitud, según la Política de tratamiento de datos (aratasan.com/privacidad). | Sí |

   - Dejar visible **Notas adicionales** (no obligatoria): ahí llegan «Necesito» e «Inversión» desde la landing.
5. Guardar. **Hecho el 26 nov:** el evento quedó en `cal.com/arata-san/catalogo-noviembre` (sin confirmación manual, teléfono obligatorio con el campo propio de Cal.com `attendeePhoneNumber`, que el panel también lee, y casilla `autorizacion` obligatoria). El valor para Vercel es **`arata-san/catalogo-noviembre`**. Correo visible y obligatorio ✅ (revisado en la página pública del evento). ◻ Falta en Vercel `NEXT_PUBLIC_CAL_LINK_LANDING` + redeploy.

Los identificadores deben ser exactamente `whatsapp` y `autorizacion` (minúsculas y sin tilde): así los busca el panel (`lib/panel/cal.ts`).

### 7.2 Conectar el evento a la landing (5 min · Sergio)

1. Vercel → proyecto **`arata-landing`** (no `arata-panel`) → **Settings → Environment Variables → Add**:
   - Key: `NEXT_PUBLIC_CAL_LINK_LANDING`
   - Value: `arata-san/catalogo-noviembre`
   - Environments: **Production** y **Preview**. No es secreta: no marcar «Sensitive».
2. **Deployments** → el último de Production → **⋯ → Redeploy**. Las variables `NEXT_PUBLIC_` se leen al construir: sin redeploy no cambia nada.

### 7.3 Prueba completa (10 min · Sergio o Andrés)

1. Desde el celular, abrir `aratasan.com/lp/catalogos` → tocar **Agendar reunión**.
2. Elegir una hora. Cal.com debe pedir nombre, correo, **WhatsApp** y la **casilla**.
3. Al confirmar, debe llegar a «¡Listo! Tu reunión quedó agendada» y al celular el aviso del panel.
4. Panel → **Clientes → Interesados**: la reserva debe tener el WhatsApp, «Necesito: Un catálogo o tienda · oferta de noviembre», «Inversión: $ 2.200.000, precio de noviembre (agendé antes del 30)» y la autorización «sí, casilla en Cal.com».
5. Cancelar la reserva de prueba en Cal.com: debe llegar el aviso de cancelación.

### 7.4 Pixel de Meta (20 min · Sergio y Andrés, después Claude)

1. **Crear el pixel.** Meta Business → **Administrador de eventos → Conectar orígenes de datos → Web → Pixel de Meta**.
   - Nombre: `Arata San`
   - Sitio: `aratasan.com`
   - Cuando pregunte cómo instalarlo, elegir **instalar el código manualmente**. No usar WPCode: el sitio es Next.js y el código lo pone Claude con su permiso de cookies.
   - Copiar el **ID del pixel** (un número de 15 a 16 cifras). No es secreto: es público en la página.
2. **Verificar el dominio.** Meta Business → **Configuración del negocio → Seguridad de la marca → Dominios → Agregar** `aratasan.com` → método **registro TXT de DNS** → copiar el valor.
   - Cloudflare → `aratasan.com` → **DNS → Add record**: tipo `TXT`, nombre `@`, contenido el valor de Meta.
   - Volver a Meta → **Verificar** (puede tardar unos minutos).
3. **Pasarle el ID del pixel a Claude.** Claude lo instala así:
   - Un permiso propio **«Publicidad»** en el aviso de cookies: sin aceptar, el pixel no abre (Ley 1581, como Analytics y Clarity).
   - La política de datos y la casilla de autorización actualizadas.
   - `PageView` en el sitio y la landing, y **`Lead`** cuando la cita queda agendada (`/agendar/gracias`, el mismo momento que `reunion_confirmada`).
4. **Probar.** Administrador de eventos → **Probar eventos** → abrir la landing, aceptar «Publicidad» y agendar una prueba: deben verse `PageView` y `Lead`.

### 7.5 Antes de la primera venta (Andrés)

| Bono | Qué preparar |
|---|---|
| Subir 30 productos | Pedirle al cliente fotos, nombre, precio y categoría de 30 productos. Se suben antes de la entrega |
| Código QR | Cuando la tienda esté publicada, un QR a su enlace, listo para imprimir (local y empaques) |
| Kit para compartir | Mensaje de difusión, texto para estados y frase con el enlace para la biografía de Instagram, con el nombre y el enlace de la tienda |

Precio: **$ 2.200.000** a todo el que haya agendado hasta el 30 de noviembre (D-195), aunque apruebe o pague en diciembre. Máximo 8 tiendas este mes (D-198).

### 7.6 Anuncios (Andrés)

- Enlace del anuncio, con su origen para medir cada ángulo:
  `https://www.aratasan.com/lp/catalogos?utm_source=meta&utm_medium=paid&utm_campaign=tienda-noviembre&utm_content=angulo-a`
  (cambiar `angulo-a` por `angulo-b`, `angulo-d` según el anuncio, §3)
- Objetivo: **Clientes potenciales** en el sitio web, optimizando a `Lead` cuando el pixel esté probado (§3).
- **30 de noviembre: apagar los anuncios con $ 2.200.000.** La página quita la oferta y los bonos sola el 1 de diciembre, los anuncios no.
