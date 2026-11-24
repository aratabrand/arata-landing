---
name: alex-hormozi-pitch
description: Crea, mejora y AUDITA ofertas y pitches con la metodología de Alex Hormozi ($100M Offers y $100M Leads) — ecuación de valor, oferta Grand Slam, apilado de valor y bonos, garantías, escasez y urgencia, nombre MAGIC, anclaje de precio y objeciones — para que la oferta sea «demasiado buena para decir que no». Úsala siempre que se hable de la oferta, el precio, los paquetes, una promoción, una garantía, bonos, cupos, un descuento, un pitch, una propuesta, el gancho de un anuncio o una landing de campaña, o cuando pidan revisar «cómo está la oferta» o «qué mejorar para vender más», aunque no digan «Hormozi». Create irresistible offers and pitches using Alex Hormozi's methodology from $100M Offers (value equation, guarantees, pricing, Grand Slam Offer, MAGIC naming) for any product or service.
---

# Ofertas irresistibles con el método de Alex Hormozi

Una oferta Grand Slam es la que el cliente se sentiría tonto rechazando: vale mucho más de lo que cuesta, se entiende en segundos y quita el riesgo de decir que sí. Esta skill guía para **crear** una oferta nueva o **auditar** una que ya existe, y deja el resultado listo para aprobar y construir.

## Cuándo usarla

- Crear o rediseñar una oferta, paquete, precio o pitch.
- Armar una promoción (descuento con fecha, cupos, bonos) o el gancho de un anuncio o landing.
- Revisar una oferta existente y decir qué mejorar, con evidencia.
- Preparar la reunión de venta (objeciones, cierre) o una propuesta.

## Reglas que pesan más que el método

Hormozi da la estructura; estas reglas deciden qué se puede decir. Están aquí porque una oferta que promete algo falso o ilegal destruye justo lo que la oferta busca: confianza.

1. **Nada inventado.** Cifras, testimonios, logos, resultados de clientes y «valor» de bonos solo si son reales y se pueden mostrar. Si falta un dato, se marca `◻ falta` y se pregunta; no se rellena.
2. **Escasez y urgencia reales.** Solo cupos, fechas y bonos que de verdad se cumplen y se respetan. Un contador falso o una fecha que se mueve es engaño.
3. **Colombia — Estatuto del Consumidor (Ley 1480 de 2011):** toda promoción dice su **vigencia y sus condiciones**; el precio anunciado se respeta; el «antes» de un descuento es un precio real que se cobró o se cobra; una garantía dice qué cubre, cómo se pide y en qué plazo. Si hay datos personales o medición, aplica la Ley 1581 de 2012.
4. **Garantías que se controlan.** Prometer solo lo que depende de quien vende (plazo, velocidad, ajustes, entrega), nunca las ventas del cliente, salvo que se mida y se pueda pagar.
5. **Copy del proyecto.** Si el repositorio tiene reglas de copy (por ejemplo `CLAUDE.md`), mandan: en Arata San, español colombiano plano, sin jerga («clientes que compran», no «conversión»; «te devuelve», no «ROI»). Se entregan **varias versiones para elegir** y nada se construye antes de que quien aprueba elija.

## Contexto de Arata San (si se usa en este repositorio)

| Qué | Dónde |
|---|---|
| Estrategia Hormozi aprobada (paquetes, avatar, ecuación, MAGIC, garantía, gancho, potenciadores, embudo, CLOSER) | `docs/blueprint/01-estrategia-hormozi.md` |
| Oferta vigente y precios | `CLAUDE.md` §1, `content/servicios.ts`, `content/inicio.ts` (`precios`) |
| Landings y ofertas de campaña | `content/campanas/`, `app/(v2)/(campana)/`, `docs/campanas/` |
| Casos y pruebas reales | `content/proyectos.ts`, `content/casos-exito.ts`, `docs/portafolio.md` |
| Decisiones | `docs/decisiones.md`; número con `npx -y tsx scripts/prueba-decisiones.ts --siguiente` |

Orden del proyecto: **oferta → copy → diseño → construcción**. Una mejora de oferta se registra como decisión antes de tocar el sitio.

## Flujo A — Crear o rediseñar una oferta

Hazlo en este orden: cada paso usa lo del anterior. Los marcos completos, con preguntas y ejemplos, están en `references/marcos.md`; léelos al llegar a cada paso.

1. **Mercado y avatar.** Quién compra, qué le duele, si puede pagar, si es fácil de encontrar y si el mercado crece. Si el avatar es difuso, la oferta lo será.
2. **Resultado soñado.** Lo que el cliente quiere en sus palabras (no lo que se entrega). Una frase.
3. **Todos los problemas.** Lista cada obstáculo antes, durante y después de lograr el resultado, ordenados por las cuatro palancas de la ecuación de valor.
4. **Problemas → soluciones.** Convierte cada problema en «Cómo [lograr X] sin [dolor Y]».
5. **Cómo se entrega.** Para cada solución, vehículos posibles (hecho por ti / contigo / por ellos; uno a uno / grupo; plantilla, video, software, llamada; velocidad). Busca lo de **alto valor para el cliente y bajo costo para entregar**.
6. **Recortar y apilar.** Quita lo caro y poco valioso; apila lo que más pesa en el valor. Ese es el núcleo.
7. **Potenciadores.** Escasez, urgencia, bonos, garantía y nombre (MAGIC). Cada bono resuelve una objeción concreta.
8. **Precio y anclaje.** Valor apilado vs. precio; forma de pago; qué pasa si no compra (costo de seguir igual).
9. **Pitch.** Ensambla con la plantilla de `references/marcos.md` §9: gancho → dolor → resultado → cómo funciona → pila de valor → prueba → garantía → precio y anclaje → escasez y urgencia → llamado → preguntas.
10. **Entrega para aprobar.** Versiones A/B/C de nombre, titular y garantía; qué es real y qué falta (`◻`); riesgos legales; qué decisión registrar.

## Flujo B — Auditar una oferta existente

Úsalo cuando pidan «revisa cómo está la oferta», «por qué no vende» o «qué mejoras hacer». El objetivo es un diagnóstico con evidencia y mejoras priorizadas, no una opinión general.

1. **Reúne la oferta tal como la ve el cliente**: la página publicada o el código (`content/`, rutas), el anuncio, el guion de venta y la estrategia escrita. Cita archivo y línea, o la URL, de cada cosa que evalúes.
2. **Puntúa con la tabla de `references/auditoria.md`**: 12 criterios de 1 a 5 (ecuación de valor, pila, garantía, escasez, urgencia, bonos, nombre, prueba, precio y anclaje, objeciones, claridad, continuidad anuncio → página → reunión). Cada nota lleva evidencia; sin evidencia no hay nota.
3. **Busca las fugas**: promesas sin prueba, valor que existe pero no se dice, objeciones sin respuesta, potenciadores falsos o vencidos, pasos donde el cliente se pierde (anuncio, página, agenda, reunión, propuesta).
4. **Revisa los riesgos** de las reglas de arriba (inventado, escasez falsa, Ley 1480, garantía incumplible).
5. **Propón mejoras priorizadas**: P0 (antes de gastar en anuncios o este mismo día), P1 (esta semana), P2 (pruebas A/B). Cada mejora dice qué palanca mueve, por qué, el esfuerzo y quién decide. El copy nuevo va en versiones para elegir.
6. **Entrega el informe** con la plantilla de `references/auditoria.md` §3, guárdalo donde el proyecto guarda sus documentos (en Arata: `docs/campanas/` o `docs/blueprint/`) y resume en el chat: puntaje, las 3 fugas más grandes y lo que hay que decidir.

## Qué no hacer

- No subir el «valor» de un bono con cifras inventadas para inflar la pila: se valora por lo que costaría resolver ese problema de otra forma, y se dice cómo se calculó.
- No apilar bonos que nadie pidió: cada uno responde a una objeción o a un obstáculo real.
- No cambiar el sitio ni el copy durante una auditoría: se propone y se espera la aprobación.
- No mezclar varias ofertas en una página de campaña: un anuncio, una oferta, un llamado.
