# 02 — Arquitectura del sitio

| Estado | Versión | Última actualización | Aprueba |
|---|---|---|---|
| En revisión | 0.2 | 7 nov 2026 | Sergio |

Estructura sección por sección de cada página. **Cada sección tiene un trabajo**: si no ayuda a que la persona agende, sobra.

Base: estrategia aprobada en [`01-estrategia-hormozi.md`](01-estrategia-hormozi.md) (D-035).

---

## 1. Elementos globales

### Menú (header)

| Escritorio | Celular |
|---|---|
| Logo · **Servicios ▾** (mega menú: Páginas que venden · Catálogos y sistemas · Portafolio, con vista previa) · Portafolio · Precios · **[Agendar reunión]** | Logo · ☰ → panel a pantalla completa con los mismos enlaces + botón grande "Agendar reunión" |

- "Precios" lleva a la sección de paquetes del inicio (`/#precios`).
- El botón **Agendar reunión** siempre está visible y es el único con color lima.

### Barra fija en celular

Al bajar del hero aparece un botón fijo abajo: **Agendar reunión**. Se oculta en `/agendar` (allí ya está la acción).

### Footer

Servicios · Portafolio · Precios · Agendar · Auditoría gratis · WhatsApp · Instagram · Política de datos · "Bogotá, Colombia".

---

## 2. Flujo de agendamiento (el corazón del sitio)

```
Cualquier CTA ──► /agendar
                   │
                   ├─ Paso 1 · ¿Qué necesitas?
                   │     ○ Página nueva            (→ Página Lista en 5 Días)
                   │     ○ Catálogo o tienda       (→ Tienda por WhatsApp en 5 Días)
                   │     ○ Sistema a medida        (→ Tu Negocio en Orden)
                   │     ○ Auditoría gratis de mi página → pide la URL (D-036)
                   │
                   ├─ Paso 2 · ¿Para cuándo lo necesitas?
                   │     ○ Ya   ○ Este mes   ○ En 1–3 meses   ○ Solo estoy averiguando
                   │
                   ├─ Paso 3 · ¿Cuánto tienes pensado invertir?   (no aparece en Auditoría)
                   │     ○ Menos de 400 USD   ○ 400–800 USD   ○ 800–2.000 USD   ○ Más de 2.000 USD
                   │
                   ├─ Nombre · WhatsApp · Correo · ☐ Autorizo el tratamiento de mis datos (Ley 1581)
                   │
                   └─ Calendario Cal.com (las respuestas viajan con la cita)
                           │
                           └─► /agendar/gracias  (evento de conversión en GTM)
```

- Las respuestas llegan con la cita, así la reunión arranca preparada (CLOSER, paso C).
- "Menos de 400 USD" **sí puede agendar** (D-041). Se le muestra: *"Puedes pagar por partes: 50 % para arrancar y 50 % al entregar."* (D-040)

---

## 3. Páginas

### 3.1 Inicio — `/`

| # | Sección | Trabajo | Contenido | Componentes |
|---|---|---|---|---|
| 1 | **Hero** | Entender la oferta en 5 segundos | Badge de cupos, título (resultado + plazo), subtítulo, CTA principal y secundario, 3 pruebas rápidas | Badge · Botón · Mockup con video |
| 2 | **Prueba** | Confianza inmediata | Nombres de los 4 proyectos | Franja de logos |
| 3 | **Problema** | Que la persona se reconozca | 4–5 dolores reales | Lista con íconos |
| 4 | **Servicios** | Elegir camino | 2 tarjetas: Páginas que venden · Catálogos y sistemas | Tarjeta de servicio |
| 5 | **Portafolio destacado** | Probar que sabemos hacerlo | 4 casos con video | Tarjeta de proyecto |
| 6 | **Cómo trabajamos** | Bajar el miedo al proceso | 5 pasos hasta la entrega en 5 días hábiles | Pasos del proceso |
| 7 | **Precios** (`#precios`) | Filtrar y anclar valor | 3 paquetes + mantenimiento opcional + garantía | Tarjeta de paquete · Sello de garantía |
| 8 | **Testimonios** | Prueba social | Solo cuando lleguen los reales | Testimonio |
| 9 | **Preguntas frecuentes** | Resolver objeciones | 6–8 preguntas | Acordeón |
| 10 | **CTA final** | Cerrar | Cupos (escasez real) + agendar | Banda de CTA (LightRays) |

### 3.2 Páginas que venden — `/paginas-web`

| # | Sección | Trabajo | Contenido |
|---|---|---|---|
| 1 | Hero | Oferta completa arriba | *Página Lista en 5 Días* · desde 400 USD · CTA |
| 2 | Para quién es | Que el cliente se vea | Negocios que necesitan clientes por internet |
| 3 | Qué incluye | Apilar valor | 5 secciones, celular primero, velocidad garantizada, Google + Business + IA, capacitación |
| 4 | Adicional: panel | Venta adicional | Editar tu página y ver tus métricas (costo aparte, D-034) |
| 5 | Casos | Prueba | Boost Your Menu, Danrodedm |
| 6 | Qué necesitamos de ti | Evitar demoras (los textos no van incluidos, D-032) | Textos, logo, fotos |
| 7 | Proceso de 5 días | Bajar el miedo | Día a día |
| 8 | Precio + garantía | Cerrar la oferta | Desde 400 USD, sello de garantía, mantenimiento opcional 15 % |
| 9 | Preguntas frecuentes | Objeciones | Del servicio |
| 10 | CTA final | Agendar | — |

### 3.3 Catálogos y sistemas a medida — `/catalogos-y-sistemas`

| # | Sección | Trabajo | Contenido |
|---|---|---|---|
| 1 | Hero | Oferta arriba | *Tienda por WhatsApp en 5 Días* + *Tu Negocio en Orden* · CTA |
| 2 | El problema | Que se reconozca | Fotos por WhatsApp sin fin, pedidos perdidos, no saber qué tienes |
| 3 | Tienda por WhatsApp | Oferta 1 | Carrito, panel, inventario, pedido al WhatsApp · desde 800 USD · 5 días hábiles |
| 4 | Tu Negocio en Orden | Oferta 2 | Reservas, menús digitales, CRM · se cotiza |
| 5 | Casos | Prueba | Caravana, Arata Print, Danrodedm |
| 6 | Proceso | Bajar el miedo | De la reunión a la entrega |
| 7 | Precio + garantía | Cerrar | Desde 800 USD, sello, mantenimiento opcional |
| 8 | Preguntas frecuentes | Objeciones | Del servicio |
| 9 | CTA final | Agendar | — |

### 3.4 Portafolio — `/portafolio`

| # | Sección | Contenido |
|---|---|---|
| 1 | Encabezado | Título corto + filtro: Todos · Páginas · Catálogos · Sistemas |
| 2 | Grilla | Tarjetas de proyecto con video en loop (D-026) |
| 3 | CTA | "¿Quieres el tuyo?" → agendar |

### 3.5 Caso de estudio — `/portafolio/[proyecto]`

| # | Sección | Contenido |
|---|---|---|
| 1 | Hero | Nombre, tipo, una frase de resultado, link al sitio, video grande |
| 2 | El problema | De `portafolio.md` |
| 3 | La solución | Qué hicimos y qué funciones tiene |
| 4 | El resultado | Solo real; con cifra si existe |
| 5 | Galería | Capturas en celular y computador |
| 6 | Testimonio | Si existe |
| 7 | Siguiente caso + CTA | Navegación + agendar |

### 3.6 Agendar — `/agendar`

| Zona | Contenido |
|---|---|
| Principal | Flujo de 3 pasos + datos + calendario (§2) |
| Lateral (abajo en celular) | Qué pasa en la reunión (30 min, sin costo, sales con paquete y precio) · garantía · cupos del mes |

### 3.7 Gracias — `/agendar/gracias`

Confirmación de la cita · qué preparar (tu página actual o ejemplos que te gusten, logo, fotos) · WhatsApp por si necesita cambiar la hora · evento de conversión en GTM. `noindex`.

### 3.8 Política de datos — `/privacidad`

Política de tratamiento de datos personales (Ley 1581 de 2012 y Decreto 1377 de 2013): responsable, finalidad, derechos del titular y cómo ejercerlos.

### 3.9 404

Se adapta la existente al estilo v2, con enlaces a inicio, portafolio y agendar.

---

## 4. Redirecciones desde la v1

| URL vieja | Va a |
|---|---|
| `/#solucion`, `/#como`, `/#dudas` (enlaces de `llms.txt` v1) | Se actualizan en `llms.txt` v2 |
| Anuncios activos que apunten a la landing actual | Se revisan antes de lanzar |

---

## 5. Pendiente

- [x] "Menos de 400 USD" puede agendar, con facilidad de pago (D-041)
- [ ] Aprobar la estructura de cada página.
