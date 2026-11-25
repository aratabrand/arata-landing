# Auditoría de la oferta — Tienda por WhatsApp en 5 Días, campaña de Meta (24 nov 2026)

| Estado | Fuente | Aprueba |
|---|---|---|
| Borrador | Skill `alex-hormozi-pitch` (Flujo B), sobre `main` después de [#32](https://github.com/aratabrand/arata-landing/pull/32) y D-195 | Sergio (oferta y copy) · Andrés (reunión y cupos) |

**Qué se auditó:** `aratasan.com/lp/catalogos` (oferta de noviembre: $ 2.200.000, antes $ 2.800.000, para quien agende hasta el 30 de noviembre), el paso de agenda (`/agendar`), lo que le llega a la reunión y, de paso, la oferta general del sitio.

---

## Resumen

- **Puntaje: 35/60.** El titular, los dolores, las preguntas y la urgencia están bien. La oferta **se ve más pequeña de lo que es** y **se rompe al pasar de la landing a la agenda**.
- **Las 3 fugas más grandes:**
  1. **La pila de valor no se ve.** La landing no dice qué incluye la tienda (dominio y hosting, panel, inventario, capacitación, 2 rondas de ajustes, Google…) y no tiene bonos. El cliente compara $ 2.200.000 contra «una tienda», no contra todo lo que recibe.
  2. **La continuidad se rompe.** Al tocar «Agendar», la agenda pregunta la inversión **en dólares**, empezando por «Menos de 800 USD», muestra el menú del sitio (vuelve a haber salidas) y no le dice a la reunión que la persona viene de la oferta. Andrés no tiene cómo saber a quién respetarle el precio (D-195).
  3. **Prueba y garantía débiles para tráfico frío.** Hay un solo caso con video y sin testimonio. La garantía es de velocidad, y el comerciante no teme a una página lenta: teme que no le sirva, no saber usarla o perder la plata.
- **Lo que hay que decidir:** qué incluye la pila visible y qué bonos van en noviembre (§Mejoras 1 y 6); qué garantía nueva (§Copy B); qué pasa si agendan más personas que cupos (§Riesgos 2).

---

## Puntaje

1 = no existe · 2 = débil · 3 = correcto · 4 = fuerte · 5 = difícil de mejorar.

| # | Criterio | Nota | Evidencia | Por qué |
|---|---|---|---|---|
| 1 | Resultado soñado | 4 | `content/campanas/catalogos.ts:56-58` | «Deja de mandar foto por foto» nombra el dolor y el subtítulo da el resultado (pedido ordenado al WhatsApp). Le falta el resultado final: vender más, también de noche y en temporada |
| 2 | Probabilidad percibida | 2 | `content/casos-exito.ts:56` (testimonio ◻), `content/proyectos.ts:181` | Un caso con video (Caravana: 5 días, 99 en velocidad). Sin testimonio, sin el número de tiendas entregadas y sin demostración |
| 3 | Tiempo de espera | 3 | Hero y proceso (`content/servicios.ts`, «Cómo trabajamos») | «5 días» está arriba, pero el camino real es reunión → propuesta en 48 h → aprobación → 5 días hábiles, con un proyecto por semana (D-172). No se dice cuándo empieza ni cuál es el primer avance |
| 4 | Esfuerzo y sacrificio | 3 | Preguntas «¿Necesito saber de tecnología?» y «¿Quién sube los productos…?» | Pago 50/50 y capacitación, bien. Pero **el cliente sube sus productos** (D-047): para quien tiene más de 100, es el esfuerzo más grande y la oferta no lo quita |
| 5 | Pila de valor | 1 | `content/servicios.ts` (`tienda.items`, oculto por D-129) | La lista de 10 cosas que incluye existe y no se muestra en la landing. No hay bonos ni total de valor frente al precio |
| 6 | Garantía | 2 | `content/campanas/catalogos.ts:90` | Solo la de velocidad, que no ataca el miedo de este cliente. No dice cómo se pide ni en qué plazo (Ley 1480) |
| 7 | Escasez | 3 | Cierre: «Tomamos 4 proyectos nuevos al mes» | Es real (D-172), pero queda al final, lejos del precio, y no se cruza con la oferta (ver Riesgos 2) |
| 8 | Urgencia | 4 | `CintaOferta.tsx`, `OFERTA.vence` | Fecha real que se apaga sola y contador de días. En celular la cinta no dice la condición («agenda antes del 30») y no se usa la temporada de diciembre |
| 9 | Nombre | 4 | «Tienda por WhatsApp en 5 Días» (D-030) | Canal del cliente + plazo + contenedor. «Precio de noviembre» funciona como razón magnética |
| 10 | Precio y anclaje | 3 | `PriceBar` con `antes` | Pesos, precio tachado y 50/50. Falta decirlo en plata («arrancas con $ 1.100.000») y anclarlo contra el costo de seguir igual |
| 11 | Objeciones | 4 | 9 preguntas (`catalogos.ts`, `faq`) | Comisión, Instagram, tecnología, productos y pago mensual, bien. Faltan «¿y si no me sirve?», «¿cuándo empiezan?» y «no tengo buenas fotos» |
| 12 | Continuidad | 2 | `content/agendar.ts:47-55`, `BookingFlow.tsx:157-166`, layout de `/agendar` | La agenda pregunta en USD («Menos de 800 USD» muestra la nota de pagar por partes aunque la oferta cuesta unos 627 USD), tiene el menú del sitio y las notas de Cal.com no dicen «landing / precio de noviembre». El anuncio y el pixel aún no existen |

**Total: 35/60** (30 a 44 = arreglar las fugas, no rehacer la oferta).

---

## Ecuación de valor

| Palanca | Hoy | Cómo subirla |
|---|---|---|
| ⬆ Resultado soñado | Pedido ordenado, sin foto por foto | Sumar el resultado de temporada: «Lista para vender en diciembre» (solo si los cupos lo permiten, Riesgos 2) |
| ⬆ Probabilidad | 1 video, sin testimonio | Testimonio del dueño de Caravana; mostrar «así te llega el pedido» con una captura real; el número real de catálogos entregados; garantía «te la dejamos funcionando» |
| ⬇ Tiempo de espera | «5 días» | Decir el camino completo en una línea: «Agendas hoy, propuesta en 48 h, tienda en 5 días hábiles» y cuándo arranca según el cupo |
| ⬇ Esfuerzo | El cliente sube sus productos | Bono: «Te subimos tus primeros productos» (cuántos lo decide Sergio) |

---

## Fugas en el camino del cliente

| Paso | Qué ve | Qué se pierde |
|---|---|---|
| Anuncio | Aún no existe | Debe repetir el titular y el precio de la landing (continuidad) |
| Landing (celular) | Cinta: «Noviembre: $ 2.200.000 ~~$ 2.800.000~~ · Quedan 7 días» | No dice que es para quien agenda; no ve qué incluye; la garantía no le habla a su miedo |
| Agenda | Menú del sitio; «¿Cuánto tienes pensado invertir?» en USD | Salidas otra vez; precio en otra moneda que el anunciado; «Menos de 800 USD» suena a «no te alcanza» |
| Reunión | Notas: tipo, cuándo, inversión | No dice que viene de la landing ni con qué precio: Andrés no puede aplicar D-195 sin preguntar |
| Propuesta (48 h) | Precio normal por defecto | Riesgo de mandar $ 2.800.000 a quien agendó con la oferta |
| Entrega | Capacitación y el cliente sube sus productos | Si tarda en subirlos, la tienda «lista en 5 días» no vende en 5 días |

---

## Riesgos

| # | Riesgo | Dónde | Qué hacer |
|---|---|---|---|
| 1 | **Ley 1480: condición poco visible en celular.** Junto al precio sí está («para quien agende hasta el 30 de noviembre», D-195), pero la cinta del celular no la dice | `CintaOferta.tsx` | Cambiar la cinta del celular (Copy A) |
| 2 | **Más interesados que cupos.** La oferta vale para todos los que agenden, pero hay 4 proyectos al mes, uno por semana (D-172). Si 10 personas agendan y aprueban, no todas reciben su tienda «en 5 días» en diciembre | Oferta vs. D-172 | Decidir y decir: el precio se respeta a todos y la fecha de arranque va por orden de aprobación (Copy D). Lo decide Sergio con Andrés |
| 3 | **Garantía sin cómo se pide ni plazo** | Tarjeta de garantía | Agregar cómo se pide y el plazo (Copy B) |
| 4 | **«Antes $ 2.800.000».** Es el mínimo del precio normal («desde 800 USD») a la TRM del 24 nov, así que se sostiene. Si el dólar se mueve mucho, se revisa | `PRECIO_COP` | Sin acción; revisar si la oferta se repite |
| 5 | **Valores de bonos inventados.** Si se agregan bonos, su valor sale de un dato real (por ejemplo, días de trabajo × $ 80.000, el valor del día de D-118) o no se pone cifra | Mejoras 6 | Regla de la skill |

---

## Mejoras

### P0 — antes de prender los anuncios

| # | Mejora | Palanca | Por qué | Esfuerzo | Decide |
|---|---|---|---|---|---|
| 1 | ✅ **Hecho (D-198).** **Mostrar «Todo lo que incluye tu tienda»** junto al precio, con la lista que ya existe en `tienda.items` (10 cosas), y al final «Todo por $ 2.200.000» | Pila de valor | Hoy el precio se compara con «una tienda». Con la lista se compara con todo lo que recibe | Bajo: el componente (`IncludesSection`) y la lista (`tienda.items`) ya existen en el sitio | Sergio |
| 2 | ✅ **Hecho (D-197): agenda directa, sin preguntas ni menú.** **Agenda coherente cuando viene de la landing:** sin menú del sitio, sin la pregunta de inversión en USD (o con opciones en pesos) y con «Origen: landing de Meta · Precio de noviembre» en las notas de Cal.com | Continuidad | Andrés sabe a quién respetarle el precio y la persona no ve otra moneda ni otras salidas | Medio | Sergio |
| 3 | **Cinta del celular con la condición** (Copy A) | Urgencia + Ley 1480 | Es lo primero que se ve; la condición tiene que estar ahí | Bajo | Sergio |
| 4 | ✅ **Decidido (D-198): máximo 8 tiendas al mes en esta campaña; Sergio decide después si se vuelve regla del sitio.** **Regla de cupos para la oferta** y una pregunta frecuente (Copy D) | Escasez honesta | Evita prometer una fecha que no se puede cumplir | Bajo (es una decisión) | Sergio y Andrés |

### P1 — esta semana

| # | Mejora | Palanca | Por qué | Esfuerzo | Decide |
|---|---|---|---|---|---|
| 5 | ✅ **Hecho (D-198): «Te la dejamos funcionando», junto a la de velocidad.** **Garantía que ataque el miedo del comerciante** (Copy B) | Probabilidad | La de velocidad es para páginas; este cliente teme que no le sirva | Bajo | Sergio (D-029 había descartado la garantía de plazo) |
| 6 | ✅ **Hecho (D-198, D-201): los tres bonos — 30 productos, código QR y kit para compartir.** **Bonos de noviembre** que quiten objeciones (Copy C) | Esfuerzo + pila | Quitan el esfuerzo más grande (subir productos) y ayudan a vender desde el día uno. Un bono con fecha protege el precio mejor que otro descuento | Medio (se entregan en cada proyecto) | Sergio |
| 7 | **Testimonio del dueño de Caravana** y captura real de un pedido en WhatsApp | Probabilidad | La prueba que más pesa para tráfico frío | Bajo (falta el material) | Sergio |
| 8 | ✅ **Hecho (D-197).** **Precio en plata para arrancar:** «Arrancas con $ 1.100.000 y el resto al entregar» | Sacrificio | Baja la sensación de gasto sin bajar el precio | Bajo | Sergio |
| 9 | **El camino completo en una línea:** «Agendas, en 48 h tienes la propuesta y en 5 días hábiles tu tienda» | Tiempo de espera | Hace creíble el «5 días» | Bajo | Sergio |

### P2 — pruebas A/B (una a la vez, 2 semanas de datos)

| # | Prueba | Hipótesis |
|---|---|---|
| 10 | Titular de temporada: «Tu tienda lista para vender en diciembre» vs. el actual | La temporada es una urgencia que el cliente ya siente (solo si los cupos alcanzan) |
| 11 | «Agendar reunión» vs. «Escríbenos por WhatsApp» | Para este cliente escribir cuesta menos que agendar (del plan, P2 #13) |
| 12 | Diciembre: bono con fecha vs. descuento | Proteger el precio de lista |
| 13 | Gancho más pequeño para tráfico frío: «Mira cómo se vería tu tienda» (demostración en la reunión con su logo) | Hace concreta la reunión (plan, P2 #14) |

---

## Copy para elegir

**A. Cinta en celular** (hoy: «Noviembre: $ 2.200.000 ~~$ 2.800.000~~ · Quedan 7 días»)

| Versión | Texto |
|---|---|
| A1 ★ | «Agenda antes del 30: **$ 2.200.000** ~~$ 2.800.000~~» (y debajo de 400 px se quita «Quedan N días») |
| A2 | «Hasta el 30: **$ 2.200.000** ~~$ 2.800.000~~ · Quedan 7 días» |
| A3 | «**$ 2.200.000** si agendas antes del 30» |

**B. Garantía** (cada una dice cómo se pide y el plazo)

| Versión | Nombre | Texto |
|---|---|---|
| B1 ★ | Garantía «Te la dejamos funcionando» | «El día de la entrega hacemos contigo un pedido de prueba y te llega a tu WhatsApp. Si algo no funciona, lo arreglamos sin costo antes de cobrarte el segundo 50 %.» |
| B2 | Garantía de 5 días | «Si tu tienda no está lista 5 días hábiles después de que nos mandas tu logo y tus productos, [◻ qué devolvemos o qué regalamos: lo decide Sergio].» (D-029 la había descartado) |
| B3 | Doble garantía | B1 + la de velocidad que ya existe |

**C. Bonos de noviembre** (◻ cada uno lo confirma Sergio: que se pueda entregar y cuánto vale de verdad)

| Bono | Objeción que quita | Cómo se entrega | Valor |
|---|---|---|---|
| «Te subimos tus primeros [◻ N] productos» | «No tengo tiempo», «tengo muchos productos» | El equipo los sube desde el panel | ◻ días de trabajo × $ 80.000 (D-118) |
| «Código QR para tu local y tus empaques» | «¿Cómo llevo a mis clientes a la tienda?» | Archivo listo para imprimir | ◻ |
| «Kit para compartir tu tienda» (mensaje de difusión, texto para estados y biografía de Instagram) | «¿Y si nadie entra?» | Textos listos en la capacitación | ◻ |

**D. Pregunta frecuente nueva sobre cupos** (si se aprueba la regla de Riesgos 2)

> **¿Si agendo antes del 30, cuándo empiezan?** — Te respetamos el precio de noviembre. Tomamos un proyecto nuevo por semana, así que la fecha de arranque va por orden de aprobación y te la decimos en la propuesta.

**E. Anclaje junto al precio**

| Versión | Texto |
|---|---|
| E1 ★ | «Arrancas con $ 1.100.000 y pagas el resto cuando te entregamos.» |
| E2 | «Un solo pago, sin comisión por cada venta. Arrancas con $ 1.100.000.» |

---

## Qué no tocar

- Titular, sección de dolores, caso de Caravana y las 9 preguntas (copy aprobado, D-193).
- Cinta fija arriba, precio en pesos y oferta que se apaga sola (D-192).
- Una sola oferta en la página y sin salidas (D-189, D-190).

---

## Oferta general del sitio (de paso)

| Hallazgo | Dónde | Sugerencia |
|---|---|---|
| La misma garantía de velocidad para todos los paquetes | `content/inicio.ts` (`aseguramientos`) | Para la tienda y los sistemas, sumar «te lo dejamos funcionando» (B1) |
| El sitio cobra en USD y la campaña en pesos | `content/inicio.ts`, `content/servicios.ts` | Decidir si el público de Colombia ve pesos en todo el sitio |
| `CLAUDE.md` §1 y `01-estrategia-hormozi.md` §1 no tienen el «Sitio Corporativo con Panel» (desde 700 USD, D-175) | Documentación | Actualizar las dos tablas |
| «Tu Negocio en Orden» no tiene ancla de precio («Lo cotizamos contigo») | `content/inicio.ts` | Un «desde» real, si existe, ayuda a filtrar |
| El gancho «Auditoría gratis en 48 horas» existe y casi no se usa en campañas | `docs/blueprint/01-estrategia-hormozi.md` §7 | Probarlo como anuncio de Páginas (tráfico frío con un paso pequeño) |
