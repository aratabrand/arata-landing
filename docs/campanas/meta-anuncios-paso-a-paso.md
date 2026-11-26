# Campaña de Meta · Tienda por WhatsApp (noviembre) — paso a paso y textos

> 26 nov 2026. Parte de [`meta-tienda-whatsapp.md`](meta-tienda-whatsapp.md) (plan, dolores y §7 con Cal.com y el pixel, ya listos). Los textos se escribieron con la skill de copy y las reglas de `CLAUDE.md` §2. **✅ Aprobado por Sergio el 26 nov: las versiones ★ de los tres ángulos (A1, B1, D1, con su título y descripción ★).**

## 0. Lo que hay que tener presente

| Tema | Qué pasa |
|---|---|
| **Quedan 4 días** | La oferta vale para quien agende **hasta el 30 de noviembre**. Hay que publicar hoy o mañana: Meta tarda hasta 24 h en revisar los anuncios. |
| **El pixel no alcanza a aprender** | Meta aprende con unas 50 conversiones por semana. En 4 días no se llega. Por eso va **un solo conjunto** y **3 anuncios**: si se reparte la plata en muchos conjuntos, ninguno aprende. |
| **Se apaga solo** | Se programa la **fecha de fin el 30 nov a las 11:59 p. m.**. El 1 de diciembre la landing quita la oferta sola; los anuncios no lo harían. |
| **Ley 1480** | Todo anuncio con el precio dice **hasta cuándo vale y la condición**. «Antes $ 2.800.000» es el precio real del sitio. No se usan cifras de resultados que no tengamos. |
| **Ya está listo** | Landing, agenda directa a `catalogo-noviembre`, webhook al panel, pixel con permiso, dominio verificado y la conversión «lead tienda campaña noviembre». |

## 1. Antes de crear (10 min · Andrés)

| Paso | Dónde | Qué revisar |
|---|---|---|
| 1 | Administrador de anuncios → **Configuración de la cuenta publicitaria** | Moneda **COP** y zona horaria **Bogotá**. La fecha de fin usa esa zona. |
| 2 | Configuración del negocio → **Cuentas → Páginas** y **Cuentas de Instagram** | La página de Facebook de Arata San y `@arata.san.web` conectadas a la cuenta publicitaria. |
| 3 | Configuración de la cuenta → **Pagos** | Tarjeta o método de pago activo. |
| 4 | Video | El único video que hay, en 9:16 (Reels e historias). Si se puede, una copia en 4:5 para el feed; si no, Meta lo recorta (revisar la vista previa). |

## 2. Campaña (5 min)

| Campo | Valor |
|---|---|
| Botón | **+ Crear** |
| Objetivo | **Clientes potenciales** |
| Tipo, si pregunta | **Campaña manual de clientes potenciales** (más control que la automática) |
| Nombre | `Tienda noviembre · Clientes potenciales` |
| Categorías especiales | **Ninguna** (no es crédito, empleo, vivienda ni política) |
| Presupuesto de la campaña Advantage | **Encendido**, presupuesto **diario** (§4) |
| Prueba A/B | Apagada. Los 3 anuncios compiten solos dentro del conjunto. |

## 3. Conjunto de anuncios (10 min)

| Campo | Valor |
|---|---|
| Nombre | `Colombia · vende por WhatsApp e Instagram` |
| Ubicación de la conversión | **Sitio web** |
| Objetivo de rendimiento | **Maximizar el número de conversiones** |
| Pixel | **arata.san - Web Principal** |
| Evento | La conversión personalizada **lead tienda campaña noviembre**. Si no sale en la lista, **Cliente potencial** (Lead): hoy casi todo el que agenda viene de la landing. |
| Programación | Inicio: apenas lo aprueben. **Fin: 30 nov 2026, 11:59 p. m.** |
| Público | **Público Advantage+** con sugerencias (abajo) |
| Ubicaciones | **Ubicaciones Advantage+** (Meta reparte entre feed, Reels e historias) |
| Atribución | La que trae: 7 días después del clic y 1 día después de ver el anuncio |

**Sugerencias de público** (Meta las usa como punto de partida, no como límite):

| Campo | Sugerencia |
|---|---|
| Ubicación | Colombia |
| Edad sugerida | 24 a 55 |
| Intereses | WhatsApp Business, Emprendimiento, Pequeñas empresas, Instagram para empresas, Tienda de ropa, Accesorios de moda, Productos de belleza |
| Idioma | Español |

> P1, P2 y P3 del plan (§3 de `meta-tienda-whatsapp.md`) quedan para diciembre, cuando haya tiempo y datos para separar públicos.

## 4. Presupuesto (lo deciden Sergio y Andrés)

No ponemos una cifra inventada. Se saca con los números de ustedes:

| Paso | Fórmula | Para llenar |
|---|---|---|
| Reuniones que necesitan | 8 tiendas ÷ % de cierre en la reunión | 8 ÷ ___ % = ___ reuniones |
| Lo máximo por reunión | $ 2.200.000 × % de cierre × % del valor que aceptan gastar en anuncios | 2.200.000 × ___ % × ___ % = $ ___ |
| Presupuesto diario | reuniones × máximo por reunión ÷ días que quedan | ___ × $ ___ ÷ 4 = $ ___ al día |

**Regla:** si a las 48 h el gasto ya pasó el máximo de 2 reuniones y no hay ninguna agendada, se revisa el anuncio antes de subir la plata. No se sube más del 20 % al día: cada cambio grande reinicia el aprendizaje.

## 5. Anuncios (3, uno por ángulo · 15 min)

Para cada anuncio:

| Campo | Valor |
|---|---|
| Nombre | `A · tiempo`, `B · pedido`, `D · 5 días` |
| Identidad | Página de Arata San + `@arata.san.web` |
| Formato | **Video**: el mismo en los 3 anuncios. Lo que cambia es el texto (el ángulo) |
| Destino | **Sitio web**: `https://www.aratasan.com/lp/catalogos` |
| Parámetros de URL | `utm_source=meta&utm_medium=paid&utm_campaign=tienda-noviembre&utm_content=angulo-a` (cambiar a `angulo-b` o `angulo-d`) |
| Botón | **Reservar** (si no aparece, **Más información**) |
| Seguimiento | Pixel **arata.san - Web Principal** marcado |
| Mejoras de Advantage+ | **Apagar las que cambian o generan texto** (variaciones de texto, texto con IA): podrían quitar la fecha o la condición de la oferta. Las de imagen (brillo, recorte) pueden quedar. |

Revisar y **Publicar**. Meta manda aviso cuando los aprueba.

### Textos para elegir

Los textos usan «tú», no llevan signos de admiración y repiten la promesa de la landing («Deja de mandar foto por foto»). En el celular se ven unos 125 caracteres antes de «Ver más». Por eso **lo importante va en la primera línea**.

#### Ángulo A — Tiempo (foto por foto)

**Texto principal A1 (corto) ★**
> ¿Todavía mandas foto por foto cada vez que te preguntan «qué tienes»?
> Con tu tienda por WhatsApp mandas un solo enlace: el cliente ve todo, arma su pedido y te llega ordenado a tu WhatsApp.
> Lista en 5 días hábiles.
> Precio de noviembre: $ 2.200.000 (antes $ 2.800.000) para quien agende hasta el 30 de noviembre. Este mes tomamos máximo 8 tiendas.

**Texto principal A2 (largo)**
> Te escriben «precio?», mandas 20 fotos, te preguntan por tallas y colores, mandas más fotos… y se quedan pensando.
> Eso se arregla con un enlace.
> • Tu catálogo con fotos, precios y carrito
> • El pedido te llega completo a tu WhatsApp
> • Un panel para cambiar precios e inventario tú mismo
> • Dominio y hosting el primer año
> Si agendas este mes, te regalamos: tus primeros 30 productos subidos, el código QR para tu local y tus empaques, y un kit para compartir la tienda.
> $ 2.200.000 (antes $ 2.800.000) para quien agende hasta el 30 de noviembre. Máximo 8 tiendas este mes.

| Título (elige 1) | Por qué |
|---|---|
| **Deja de mandar foto por foto** ★ | Es el titular de la landing: quien toca ve lo mismo que le prometieron |
| Un enlace en vez de 20 fotos | Muestra el cambio en una imagen |
| Tu tienda por WhatsApp en 5 días | Nombra el producto para quien ya sabe lo que busca |

| Descripción (elige 1) |
|---|
| **$ 2.200.000 hasta el 30 de noviembre** ★ |
| Máximo 8 tiendas este mes |

#### Ángulo B — Ventas (el pedido llega ordenado)

**Texto principal B1 ★**
> Así te llega un pedido de tu tienda por WhatsApp: los productos, las cantidades y el total, en un solo mensaje.
> Sin pedidos perdidos en el chat. Sin anotar en un cuaderno.
> Tú confirmas y cobras como siempre: tus clientes no tienen que pagar en línea.
> Lista en 5 días hábiles. $ 2.200.000 (antes $ 2.800.000) para quien agende hasta el 30 de noviembre.

**Texto principal B2**
> Cuando el cliente tiene que esperar a que le mandes fotos, se sale y le compra a otro.
> Con tu catálogo ve todo solo, elige y te manda el pedido listo a tu WhatsApp. Tú solo confirmas.
> Incluye panel, inventario y dominio el primer año. Y te la dejamos funcionando.
> $ 2.200.000 (antes $ 2.800.000) para quien agende hasta el 30 de noviembre. Máximo 8 tiendas este mes.

| Título (elige 1) | Por qué |
|---|---|
| **El pedido te llega ordenado** ★ | Es la imagen del anuncio dicha en palabras |
| Tú solo confirmas y cobras | Quita el miedo de «mis clientes no pagan en línea» |
| Tu catálogo con carrito al WhatsApp | Directo, para quien compara opciones |

| Descripción (elige 1) |
|---|
| **Cobras como siempre** ★ |
| $ 2.200.000 hasta el 30 de noviembre |

#### Ángulo D — Rapidez (5 días)

**Texto principal D1 ★**
> Tu tienda por WhatsApp lista en 5 días hábiles.
> Catálogo con carrito, pedido ordenado a tu WhatsApp, panel e inventario. Te la dejamos funcionando.
> Pagas 50 % para arrancar ($ 1.100.000) y 50 % cuando la recibes.
> Precio de noviembre: $ 2.200.000 (antes $ 2.800.000) para quien agende hasta el 30 de noviembre. Este mes tomamos máximo 8 tiendas.

**Texto principal D2**
> Diciembre es cuando más te escriben. ¿Lo vas a atender foto por foto?
> En 5 días hábiles te entregamos tu tienda por WhatsApp funcionando, con tus primeros 30 productos ya subidos.
> $ 2.200.000 (antes $ 2.800.000) para quien agende hasta el 30 de noviembre. Máximo 8 tiendas este mes.

> D2 depende de algo que no medimos (que en diciembre les escriben más). Úsalo solo si Sergio y Andrés lo ven en sus clientes.

| Título (elige 1) | Por qué |
|---|---|
| **Lista en 5 días hábiles** ★ | La promesa del ángulo, sin rodeos |
| Te la dejamos funcionando | La garantía como título |
| 50 % al arrancar, 50 % al recibir | Para quien duda por la plata |

| Descripción (elige 1) |
|---|
| **Máximo 8 tiendas este mes** ★ |
| $ 2.200.000 hasta el 30 de noviembre |

### Creativo: un solo video para los 3 anuncios (26 nov)

Hay un solo video. No hace falta más para esta campaña: **el mismo video va en los 3 anuncios y cada uno lleva el texto de su ángulo** (A, B o D) y su `utm_content`. Así Meta muestra más el texto que más funciona y se ve en Analytics cuál trajo las reuniones.

| Tema | Qué hacer |
|---|---|
| Subirlo | En cada anuncio: **Agregar contenido → Video** y elegir el mismo archivo (o, al duplicar el anuncio A, cambiar solo textos y parámetros de URL) |
| Tamaño | 9:16 para Reels e historias. Para el feed, una copia en 4:5 si se puede; si no, revisar en la vista previa que el recorte no tape lo importante |
| Miniatura | Elegir un cuadro donde se vea la tienda o el pedido, no una pantalla en negro |
| Subtítulos | Activar los subtítulos automáticos de Meta si el video tiene voz: la mayoría lo ve sin sonido |
| Texto dentro del video | Si se le agrega algo, que sirva para los 3 ángulos: «Tu tienda por WhatsApp en 5 días» y al final «$ 2.200.000 hasta el 30 de nov.». Poco texto: Meta muestra menos los anuncios llenos de letras |
| Si hay tiempo | Se puede sumar una imagen 4:5 del ángulo B (captura de un pedido real, con permiso y sin datos del cliente) o un carrusel del D con `carrusel-studio`. No es obligatorio para arrancar |

## 6. Mientras corre (cada día · Andrés)

| Cuándo | Qué mirar | Qué hacer |
|---|---|---|
| Al aprobarse | Que el enlace abra la landing con la cinta de la oferta, dentro de Instagram y de Facebook | Si algo falla, pausar y avisar a Claude |
| Cada día | Panel → **Clientes → Interesados**: quién agendó | Escribirle por WhatsApp el mismo día (lo contesta una persona) |
| Cada día | Comentarios y mensajes del anuncio | Responder con la respuesta de abajo |
| A las 48 h | CTR del enlace de cada anuncio | Si uno está bajo 1 % y otro lo pasa, **apagar el bajo** (no borrarlo). No tocar el conjunto. |
| 29 nov | Cuántas tiendas van | Si ya van 8, apagar la campaña: no se puede ofrecer lo que no hay |
| **30 nov, 11:59 p. m.** | Se apaga sola por la fecha de fin | Confirmar el 1 dic que quedó apagada y que la landing ya no muestra la oferta |

**Respuesta para comentarios y mensajes** (Andrés la ajusta a su forma de hablar):
> Hola, gracias por escribir. La tienda por WhatsApp queda lista en 5 días hábiles y este mes cuesta $ 2.200.000 (antes $ 2.800.000) si agendas hasta el 30 de noviembre. Agenda aquí una reunión de 30 minutos y te mostramos cómo quedaría la tuya: aratasan.com/lp/catalogos

## 7. Después del 30 de noviembre

| Decisión | Quién |
|---|---|
| ¿Se sigue en diciembre con $ 2.800.000 o con otra oferta? Una oferta nueva pasa por la skill `alex-hormozi-pitch` y la aprueba Sergio | Sergio y Andrés |
| ¿Los 8 cupos al mes pasan a ser regla del sitio? (hoy solo esta campaña, D-198) | Sergio |
| Con los datos de noviembre: separar públicos P1, P2 y P3 y probar el ángulo C (control) | Andrés |
| Anotar lo que se decida en `docs/decisiones.md` | Sergio |
