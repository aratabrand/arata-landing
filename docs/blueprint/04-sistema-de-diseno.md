# 04 — Sistema de diseño v2

| Estado | Versión | Última actualización | Aprueba |
|---|---|---|---|
| Borrador (dirección) | 0.2 | 7 nov 2026 | Sergio |

> Esta versión registra la **dirección** que dio Sergio (D-025, D-026) y la traducción de las referencias de 21st.dev (D-044, §9). Los valores marcados **[decidir]** y la especificación fina de cada componente se cierran en la Fase 3, con capturas de referencia.

---

## 1. Qué cambia frente a la v1

| Tema | v1 (landing actual) | v2 (sitio de agencia) |
|---|---|---|
| Fondos | Alterna blanco `#FFFFFF` y oscuro `#03010B` | **Solo oscuro** `#03010B` |
| Colores de marca | Morado y lima como acentos | Igual: morado, lima y demás colores de marca **solo como acentos** sobre el oscuro |
| Tipografía | Funnel Display + Plus Jakarta Sans | **Igual** |
| Estilo de componentes | Píldora glass, bento, timeline | Referencia **21st.dev**: componentes, botones, menú y animaciones |
| Trabajos | No había portafolio | Video en loop tipo GIF dentro de mockups + animaciones premium |

---

## 2. Color

### Fondo y superficies

Como todo es oscuro, la profundidad no sale del cambio de fondo sino de **capas de superficie** y **bordes finos**.

| Token | Valor | Uso |
|---|---|---|
| `ink` | `#03010B` | Único fondo de página |
| `surface-1` | `#0A0714` | Tarjetas |
| `surface-2` | `#110C20` | Tarjeta en hover, elementos elevados |
| `surface-3` | `#18112D` | Menús desplegables, modales |
| `border-subtle` | blanco al 6 % | Borde por defecto de tarjetas |
| `border` | blanco al 10 % | Bordes de inputs y separadores |
| `border-strong` | blanco al 16 % | Hover y foco |

Las superficies tienen un leve tinte morado para que el oscuro se sienta de marca y no un gris cualquiera. Los valores son **[decidir]** al ver las referencias.

### Texto

| Token | Valor | Contraste sobre `ink` | Uso |
|---|---|---|---|
| `text` | `#FFFFFF` | 20:1 | Títulos y texto principal |
| `text-secondary` | `#B4AECB` | ≈ 9.8:1 | Párrafos |
| `text-muted` | `#8A84A8` | ≈ 5.9:1 | Etiquetas y notas (cumple AA) |

### Acentos

| Token | Valor | Uso | No usar para |
|---|---|---|---|
| `lime` | `#B6FF00` | **CTA principal** (fondo lima + texto `ink`), estados activos, cifras clave | Grandes superficies |
| `purple` | `#7D53FF` | Brillos, hover, enlaces, gráficos, detalles | Texto pequeño (contraste ≈ 4.5:1, solo texto grande) |
| `purple-deep` | `#3B1D99` | Tintes de brillos y fondos de luz | Texto (no se lee sobre oscuro) |

### Luces de fondo ✅ (D-044)

La referencia usa **luces radiales grandes y borrosas** detrás de las secciones (en 21st son azules). En Arata van en **morado**: `purple` / `purple-deep` con opacidad baja (10–25 %) y desenfoque grande.

- Son atmósfera y nunca llevan contenido encima que dependa de ellas para leerse.
- Máximo 1–2 luces por pantalla.
- La regla de `CLAUDE.md` §3 ("sin degradados ni orbes") **sigue vigente para los slides de carruseles**; en el sitio v2 se permiten solo estas luces.

---

## 3. Tipografía (sin cambios)

- **Funnel Display Bold:** títulos y números.
- **Plus Jakarta Sans:** cuerpo y etiquetas.
- Auto-hospedadas con `next/font/local`.
- Escala tipográfica **[decidir en Fase 3]**, mobile-first: tamaños definidos para 360 px que crecen por breakpoint.

---

## 4. Forma, espacio y ritmo **[decidir con referencias]**

| Tema | Propuesta inicial |
|---|---|
| Radios | Botones **10 px** · inputs 10 px · vista previa interna **16 px** · tarjetas **24 px** · badges en píldora (referencia: capturas 01, 03 y 05) |
| Espaciado | Escala de 4 px (4, 8, 12, 16, 24, 32, 48, 64, 96, 128) |
| Anchos | Contenido máx. 1200 px; texto corrido máx. ~65 caracteres |
| Breakpoints | Base 360 px → `sm` 640 → `md` 768 → `lg` 1024 → `xl` 1280 |
| Toque | Áreas táctiles de mínimo 44 × 44 px |

---

## 5. Componentes v2 (inventario)

Prioridad: **P1** se necesita para lanzar · **P2** se puede agregar después.

| Componente | Descripción | Prioridad |
|---|---|---|
| Menú (header) | Barra completa (no píldora flotante); ítem activo con fondo oscuro; **mega menú** en "Servicios" con tarjetas de vista previa (captura 05); en celular, panel a pantalla completa | P1 |
| Botón | Rectangular redondeado 10 px. Primario **lima** con texto `ink` · secundario superficie oscura (`surface-2`) · terciario texto con flecha ("Ver todo →") | P1 |
| Badge / etiqueta | Píldoras para estados, categorías y "en vivo" | P1 |
| Tarjeta base | Superficie + borde fino de 1 px + radio 24 px; luz que sigue el cursor en hover | P1 |
| Tarjeta bento con vista previa | Vista previa **enmarcada dentro** de la tarjeta (marco de 8 px, radio interno 16 px) + pie con título, descripción y enlace con flecha a la derecha (captura 01) | P1 |
| Encabezado de sección | Título grande a la izquierda + subtítulo atenuado + botón secundario a la derecha (captura 01) | P1 |
| Barra de progreso segmentada | Indica qué proyecto se está mostrando en el carrusel del portafolio y avanza sola (captura 01) | P1 |
| Tarjeta de servicio | Para los 2 servicios | P1 |
| Tarjeta de paquete | Nombre + para quién + precio grande + botón + lista con íconos de línea. La **recomendada** lleva borde morado, brillo suave, badge "Recomendado" y el único botón lima; las demás, botón oscuro (captura 03) | P1 |
| Sello de garantía | Garantía visible junto al precio | P1 |
| Tarjeta de proyecto | Mockup (celular / computador) con video en loop | P1 |
| Filtro del portafolio | Por tipo: landing · catálogo · sistema | P1 |
| Bloque de caso | Problema → solución → resultado | P1 |
| Métrica | Cifra con contador + anillo (patrón v1) | P1 |
| Pasos del proceso | Cómo trabajamos, de la aprobación a la entrega en 5 días hábiles | P1 |
| Preguntas frecuentes | **Dos columnas**: título a la izquierda, acordeón a la derecha; en celular, una columna (captura 02) | P1 |
| Formulario de 3 pasos | Las 3 preguntas antes del calendario (D-017) | P1 |
| Calendario Cal.com | Integrado en `/agendar` | P1 |
| Banda de CTA | **Tarjeta grande** redondeada con collage de los trabajos al fondo, tintado de morado; título centrado, botón lima y nota corta debajo (captura 04) | P1 |
| Footer | v2 | P1 |
| Testimonio | Texto, nombre y foto | P1 (cuando haya testimonios) |
| Franja de prueba | "Han confiado en nosotros" + nombres de los clientes (captura 02) | P1 |
| Sección equipo | Dentro del inicio; **fuera por ahora** (D-043) | P2 |

---

## 6. Cómo se muestran los trabajos (D-026)

**Formato:** video en loop **tipo GIF** dentro de un mockup de celular o computador. Se graba en video y no como GIF real, porque un GIF pesa entre 5 y 10 veces más y bajaría la velocidad móvil que prometemos.

| Especificación | Valor |
|---|---|
| Formatos | MP4 (H.264) + WebM |
| Duración | 8–12 s, en bucle sin corte visible |
| Tamaño | Computador ~1280 px de ancho · celular ~720 px de alto útil |
| Peso | Menos de 1.5 MB por video |
| Atributos | `muted`, `loop`, `playsinline`, `preload="none"`, imagen de portada WebP |
| Reproducción | Arranca al entrar en pantalla y se pausa al salir (`IntersectionObserver`) |
| Movimiento reducido | Si el usuario lo pide, solo se muestra la imagen de portada |

**Cómo grabarlos:** se pueden generar con Playwright (el mismo stack de los carruseles) recorriendo cada página en scroll, así salen parejos y en lote.

---

## 7. Movimiento

- Se mantienen los patrones v1: reveals con `IntersectionObserver`, contadores y anillos que se dibujan.
- Patrones nuevos (estilo 21st.dev) **[decidir con referencias]**: luz que sigue el cursor en tarjetas, brillo que recorre el botón principal, indicador que se desliza en el menú y franja de logos en movimiento.
- Solo se anima `transform` y `opacity`.
- Siempre se respeta `prefers-reduced-motion`.

---

## 8. Pendiente para cerrar la Fase 3

- [x] Capturas de 21st.dev (5, en `docs/referencias/21st-dev/`).
- [x] Referencia de cómo mostrar los trabajos: tarjeta con vista previa enmarcada + barra de progreso (captura 01).
- [x] Luces radiales permitidas en morado (§2, D-044).
- [ ] Escala tipográfica, radios y espaciado finales.

---

## 9. Referencias de 21st.dev → traducción a Arata (D-044)

Capturas en [`docs/referencias/21st-dev/`](../referencias/21st-dev/).

| # | Captura | Qué se toma | Cómo se traduce a Arata | Dónde se usa |
|---|---|---|---|---|
| 01 | `01-tarjetas-bento.png` | Encabezado con botón a la derecha; grilla bento de tarjetas grandes; vista previa enmarcada dentro de la tarjeta; pie con título, descripción y "Ver todo →"; barra de progreso segmentada | Igual, con superficies `surface-1` de tinte morado y borde blanco al 6–10 % | Portafolio destacado, servicios, grilla del portafolio |
| 02 | `02-pagina-completa.webp` | Ritmo de la página: hero centrado + vista previa grande enmarcada, franja de prueba social, bento, FAQ en dos columnas, CTA en tarjeta grande, footer de varias columnas; luces azules borrosas entre secciones | Mismo ritmo para el Inicio; luces en morado | Estructura del Inicio (`02-arquitectura` §3.1) |
| 03 | `03-precios.png` | Título enorme alineado a la izquierda con tracking negativo; prueba social con avatares; 3 tarjetas de precio; la recomendada con borde de color y brillo; precio grande; lista con íconos de línea | Borde y brillo en **morado**; botón principal **lima** solo en la recomendada; precio en Funnel Display | Sección de precios (`#precios`) |
| 04 | `04-cta-final.webp` | Tarjeta grande redondeada con collage de pantallas tintado de color; título centrado; botón; nota pequeña ("No card needed") | Collage de **nuestros trabajos** tintado de morado; nota: *"30 minutos, sin costo"* | CTA final de cada página |
| 05 | `05-mega-menu.png` | Menú en barra con ítem activo resaltado; desplegable grande con tarjetas de vista previa + título + descripción; botón principal a la derecha | Desplegable "Servicios" con 3 tarjetas: Páginas que venden · Catálogos y sistemas · Portafolio | Header |

### Lo que **no** se toma

- El **azul eléctrico** de 21st: se reemplaza por morado (brillos) y lima (CTA).
- Las **tarjetas de colores claros** de la sección "Built for how you ship" (coral, rosa): rompen la regla de solo fondo oscuro (D-025).
- La **búsqueda ⌘K** y el "Log in": el sitio no los necesita.

### Tipografía al estilo de la referencia

Títulos muy grandes, en negrita, con **tracking negativo** (−0.03 a −0.04 em) e interlineado ajustado (~1.0). Se logra con **Funnel Display Bold**, sin cambiar de fuente (D-025).

