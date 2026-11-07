# 04 — Sistema de diseño v2

| Estado | Versión | Última actualización | Aprueba |
|---|---|---|---|
| Borrador (dirección) | 0.1 | 7 nov 2026 | Sergio |

> Esta versión registra la **dirección** que dio Sergio (D-025, D-026). Los valores marcados **[decidir]** y la especificación fina de cada componente se cierran en la Fase 3, con capturas de referencia.

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

### Luces y degradados **[decidir]**

El estilo de 21st.dev usa luces radiales suaves (spotlights) y brillos en bordes. Las reglas de marca de `CLAUDE.md` §3 prohíben degradados y orbes **en los slides de carruseles**. Para el sitio se propone permitir **solo luces radiales muy sutiles** (tinte `purple-deep`, opacidad baja) como atmósfera. Sergio decide.

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
| Radios | 8 · 12 · 16 · 24 · píldora |
| Espaciado | Escala de 4 px (4, 8, 12, 16, 24, 32, 48, 64, 96, 128) |
| Anchos | Contenido máx. 1200 px; texto corrido máx. ~65 caracteres |
| Breakpoints | Base 360 px → `sm` 640 → `md` 768 → `lg` 1024 → `xl` 1280 |
| Toque | Áreas táctiles de mínimo 44 × 44 px |

---

## 5. Componentes v2 (inventario)

Prioridad: **P1** se necesita para lanzar · **P2** se puede agregar después.

| Componente | Descripción | Prioridad |
|---|---|---|
| Menú (header) | Multi-página, estilo 21st.dev; en celular, panel a pantalla completa | P1 |
| Botón | Primario lima · secundario con borde · terciario texto; con brillo en hover | P1 |
| Badge / etiqueta | Píldoras para estados, categorías y "en vivo" | P1 |
| Tarjeta base | Superficie + borde fino + luz que sigue el cursor en hover | P1 |
| Tarjeta de servicio | Para los 2 servicios | P1 |
| Tarjeta de paquete | Precio, pila de lo que incluye, paquete recomendado resaltado, garantía | P1 |
| Sello de garantía | Garantía visible junto al precio | P1 |
| Tarjeta de proyecto | Mockup (celular / computador) con video en loop | P1 |
| Filtro del portafolio | Por tipo: landing · catálogo · sistema | P1 |
| Bloque de caso | Problema → solución → resultado | P1 |
| Métrica | Cifra con contador + anillo (patrón v1) | P1 |
| Pasos del proceso | Cómo trabajamos, de la aprobación a la entrega en 5 días hábiles | P1 |
| Preguntas frecuentes | Acordeón | P1 |
| Formulario de 3 pasos | Las 3 preguntas antes del calendario (D-017) | P1 |
| Calendario Cal.com | Integrado en `/agendar` | P1 |
| Banda de CTA | Cierre de cada página | P1 |
| Footer | v2 | P1 |
| Testimonio | Texto, nombre y foto | P1 (cuando haya testimonios) |
| Franja de logos | Clientes, en movimiento continuo | P2 |
| Sección equipo | Dentro del inicio (D-016) | P2 |

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

- [ ] Capturas de 21st.dev con los componentes que gustan (botón, menú, tarjeta, animación), porque el sitio no se puede abrir desde el entorno de Claude.
- [ ] Imagen de referencia de cómo mostrar los trabajos (no llegó en el mensaje).
- [ ] Decidir si se permiten luces radiales sutiles (§2).
- [ ] Escala tipográfica, radios y espaciado finales.
