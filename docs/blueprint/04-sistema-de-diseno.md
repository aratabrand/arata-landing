# 04 — Sistema de diseño v2

| Estado | Versión | Última actualización | Aprueba |
|---|---|---|---|
| Aprobado (D-145 a D-153) | 1.0 | 20 nov 2026 | Sergio |

> **La fuente única es [`docs/sistema-de-diseno.md`](../sistema-de-diseno.md)** (sistema de Arata San para el sitio, el panel y todo producto nuevo, D-149). Este documento queda como el detalle del **sitio**: componentes, historial y reglas de velocidad.
>
> Esta versión registra la **dirección** que dio Sergio (D-025, D-026), la traducción de las referencias de 21st.dev (D-044, §9), la **implementación en código** (§10–§12) y el **estilo vigente desde el 19 nov 2026: el del panel aplicado al sitio** (D-141, D-142; §2 y §13). Se ve en vivo en `/sistema` (guía) y en aratasan.com. **El sitio y el panel comparten base visual**: si se cambia una pieza en uno, se revisa en el otro (§13).

---

## 1. Qué cambia frente a la v1

| Tema | v1 (landing actual) | v2 (sitio de agencia) |
|---|---|---|
| Fondos | Alterna blanco `#FFFFFF` y oscuro `#03010B` | **Solo oscuro**: `#020104` desde D-145 (antes `#03010B`) |
| Colores de marca | Morado y lima como acentos | Igual: morado, lima y demás colores de marca **solo como acentos** sobre el oscuro |
| Tipografía | Funnel Display + Plus Jakarta Sans | **Igual** |
| Estilo de componentes | Píldora glass, bento, timeline | Referencia **21st.dev** para componentes, menú y animaciones; **botón principal igual al del panel** (D-142); **tarjetas transparentes y morado solo en botones** (D-146) |
| Botón principal | Lima | **Morado de marca** con texto blanco (D-142); el lima queda para los datos |
| Trabajos | No había portafolio | Video en loop tipo GIF dentro de mockups + animaciones premium |

---

## 2. Color

### Fondo y superficies

Como todo es oscuro, la profundidad no sale del cambio de fondo sino de **capas de superficie** y **bordes finos**.

| Token | Valor | Uso |
|---|---|---|
| `noche` | `#020104` | **Único fondo de página** (D-145): negro casi neutro, para que el morado no se lea como "look de IA" |
| `ink` | `#03010B` | Texto sobre lima y fondo del panel (el panel no cambió) |
| `surface-1` | `#0B0B0D` | Superficies sólidas (las tarjetas son transparentes, D-146) |
| `surface-2` | `#121215` | Hover, botón secundario, elementos elevados |
| `surface-3` | `#19191D` | Menús desplegables, modales |
| `border-subtle` | blanco al 6 % | Borde por defecto de tarjetas |
| `border` | blanco al 10 % | Bordes de inputs y separadores |
| `border-strong` | blanco al 16 % | Hover y foco |

**Desde D-146 las superficies son neutras** (sin tinte morado) y las tarjetas son **transparentes** (blanco al 2 %): el color de marca queda para los botones.

### Texto

| Token | Valor | Contraste sobre `ink` | Uso |
|---|---|---|---|
| `text` | `#FFFFFF` | 20:1 | Títulos y texto principal |
| `text-secondary` | `#B4AECB` | ≈ 9.8:1 | Párrafos |
| `text-muted` | `#8A84A8` | ≈ 5.9:1 | Etiquetas y notas (cumple AA) |

### Acentos

| Token | Valor | Uso | No usar para |
|---|---|---|---|
| `lime` | `#B6FF00` | **Solo datos** (D-142): cifras clave, anillos, pasos del proceso, estados "en vivo", la línea destacada del título del hero | Botones, interruptores, opciones elegidas, grandes superficies |
| `purple` | `#7D53FF` | **Solo botones** (D-146): botón principal (`.v2-primario`, texto blanco 4,6:1) y lo que actúa como botón (opciones elegidas del formulario, interruptores de cookies, cápsula "Ver proyecto", sonido del video). Nunca en tarjetas, íconos, etiquetas, gráficos ni luces | Texto pequeño sobre oscuro (≈ 4.5:1, solo texto grande) |
| `purple-deep` (`brand-ink`) | `#3B1D99` | Sin uso en el sitio desde D-146 | Texto (no se lee sobre oscuro) |
| `brand-soft` | `#B9A4FF` | Sin uso en el sitio desde D-146: etiquetas, íconos y checks pasan a `fog` | Fondos |

### Íconos y fondo continuo ✅ (D-147)

| Pieza | Cómo va |
|---|---|
| Íconos decorativos | **Fuera** (Sergio: "se ven muy IA"). El Problema y "Todo lo que trae" llevan **número** (01, 02…) en vez de ícono; "Es para ti si…" lleva un punto; el adicional, el aviso de cookies y `/agendar` van sin ícono |
| Íconos que cumplen una función | Flechas, abrir/cerrar, check, video y WhatsApp con **Phosphor** en trazo `light` (`@phosphor-icons/react`, versión SSR), en `components/v2/iconos.tsx`. **Lucide ya no se usa en el sitio** (el panel sí la sigue usando) |
| Fondo continuo | Las líneas verticales y los haces van **una sola vez para toda la página** (`.v2-fondo` en `app/(v2)/layout.tsx`, fijo detrás del contenido; los lados se desvanecen con una capa del color del fondo, sin `mask-image`). Las secciones solo ponen su luz blanca suave (`GridBackground`, sin líneas) |
| Grano | **Quitado** (D-148: Sergio no lo quiere, "efecto borroso"). La regla de velocidad de §12 queda por si se vuelve a usar una textura |

### Fondo premium ✅ (D-145)

Sergio sintió el sitio "muy IA". Lo que más lo causaba: morado brillante sobre un negro con tinte morado, cuadrícula de fondo y cuadritos de ícono en todo. Cambios:

| Pieza | Cómo va |
|---|---|
| Fondo | `noche` `#020104` en toda la página (antes `ink` `#03010B`, con tinte morado) |
| Cuadrícula | **Fuera.** Solo líneas verticales (`GridBackground`, también en el hero) |
| Haces de luz | Luces finas que bajan por algunas líneas del hero y de Cómo trabajamos, lejos del texto. Solo `transform`; con movimiento reducido no salen |
| Grano | Se probó al 4,5 % y se quitó en D-148 |
| Luces moradas | Más suaves: 0,17 / 0,06 (antes 0,28 / 0,12) |
| Cifras del hero | Transparentes, sin íconos y más grandes en escritorio |

### Luces de fondo ✅ (D-044 → **blancas desde D-146**)

Luces radiales grandes y suaves detrás de algunas secciones. **Desde D-146 son blancas** (6,5 % en el centro, 2 % a la mitad), igual que la luz de la rejilla, los haces y la luz que sigue el cursor. Antes eran moradas y eran lo que más daba el "look de IA".

- Son atmósfera y nunca llevan contenido encima que dependa de ellas para leerse.
- Máximo 1–2 luces por pantalla.
- La regla de `CLAUDE.md` §3 ("sin degradados ni orbes") **sigue vigente para los slides de carruseles**; en el sitio v2 se permiten solo estas luces.

### Estilo del panel aplicado al sitio (D-141; tarjetas y colores ajustados en D-146)

Es el estilo vigente. El 19 nov se probaron y se descartaron dos direcciones (color plano con bloques morados, D-137; tarjetas blancas, D-138; ver §13). Se volvió a la versión con luces y se le aplicó el estilo del panel (D-136, `docs/panel-cliente/03-sistema-de-diseno.md`):

| Pieza | Cómo va |
|---|---|
| Tarjeta (`.v2-card`) | **Transparente** (D-146): blanco al 2 %, borde blanco al 7 % y un filo de luz arriba. Antes, por capas sobre `#0F0C19` (tinte morado) |
| Tarjeta destacada (`.v2-destacada`) | **Transparente y un poco más clara** (D-146): blanco al 4,5 % y borde blanco al 20 %. Paquete recomendado y precio de cada servicio. Antes, filo morado |
| Garantías (`.v2-glass`) | Transparentes como `.v2-card`, borde blanco al 9 % (D-146) |
| Cuadrito de ícono (`.v2-icono`) | **Sin uso en el sitio desde D-147** (se quitaron los íconos decorativos) |
| Botones | Los del panel (D-142): principal morado con texto blanco (`.v2-primario` = `.pn-primario`) y secundario oscuro con borde fino. La píldora con círculo de D-137 se quitó |
| Lima | **Solo datos** (cifras, anillos, pasos, la línea del título del hero), como en el panel. Botones, opciones elegidas del formulario, interruptores de cookies y la cápsula "Ver proyecto" van en morado (D-142). Los checks de "Es para ti si" pasan a morado |

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
| Menú (header) | Barra completa (no píldora flotante); ítem activo con fondo oscuro; **mega menú** en "Servicios" con tarjetas de vista previa (captura 05); en celular, panel a pantalla completa con entrada escalonada, hamburguesa → X y botón de agendar fijo abajo (D-070) | P1 |
| Botón | **El del panel** (D-142, igual a `.pn-primario` de D-136). Rectangular redondeado 10 px. Primario **morado de marca** con texto blanco (4,6:1) y filo de luz arriba (`.v2-primario`) · secundario superficie oscura (`surface-2`) con borde fino · terciario texto con flecha ("Ver todo →"). La flecha se corre un poco al pasar el mouse. Para `<button>` propios: `clasesBoton()`, `FlechaBoton` | P1 |
| Badge / etiqueta | Píldoras para estados, categorías y "en vivo" | P1 |
| Tarjeta base | **Negra con humo** (`.v2-card`, D-150): degradado `#0E0E10`→`#060607`, nube blanca suave abajo a la derecha, borde blanco 13 %, radio 24 px; luz blanca que sigue el cursor (`Spotlight`). La usan también las cifras del hero, el bento de servicios y las garantías | P1 |
| Tarjeta bento con vista previa | Vista previa **enmarcada dentro** de la tarjeta (marco de 8 px, radio interno 16 px) + pie con título, descripción y enlace con flecha a la derecha (captura 01) | P1 |
| Encabezado de sección | Título grande a la izquierda + subtítulo atenuado + botón secundario a la derecha (captura 01) | P1 |
| Barra de progreso segmentada | Indica qué proyecto se está mostrando en el carrusel del portafolio y avanza sola (captura 01) | P1 |
| Bento de servicios | Diagramas vivos (flujo de pedido, conexiones, gráfica "EJEMPLO"), adaptado de `ink-orbit-features` — `components/v2/ServicesBento.tsx` (D-065) | P1 |
| Banda curva de capturas | Hero: capturas reales girando en un cilindro, dibujadas en `<canvas>` — `components/ui/tilted-grid-hero.tsx` (D-064) | P1 |
| Tarjetas del problema | Apiladas, tarjeta transparente + **número** (01–05, D-147) + título + texto, resaltado que las recorre (el número se pinta de lima) (D-066, D-141) | P1 |
| Cifras del hero | 3 tarjetas **transparentes** (blanco al 2 %, borde 7 %), **sin íconos**, más grandes en escritorio (cifra 48 px, ancho hasta 1024 px) + cifra con contador + texto (D-145) | P1 |
| Tarjeta de paquete | Nombre + para quién + precio grande + botón + lista con íconos de línea. La **recomendada** lleva la tarjeta destacada (`.v2-destacada`, transparente con borde blanco más visible, D-146), etiqueta "Recomendado" blanca con texto `ink` y el único botón principal (morado, D-142); las demás, tarjeta por capas y botón oscuro (captura 03) | P1 |
| Tarjetas de garantía | Garantía, pago 50/50 y mantenimiento: tarjeta transparente (`.v2-glass`, D-146) + ícono SVG animado en lima y blanco (`Assurances`, D-068) | P1 |
| Tarjeta de proyecto | Mockup (celular / computador) con video en loop | P1 |
| Filtro del portafolio | Por tipo: landing · catálogo · sistema | P1 |
| Bloque de caso | Problema → solución → resultado | P1 |
| Métrica | Cifra con contador + anillo (patrón v1) | P1 |
| Pasos del proceso | Cómo trabajamos; la línea y los pasos se pintan de lima con el scroll (`ScrollPaint`, D-067) | P1 |
| Preguntas frecuentes | **Dos columnas**: título a la izquierda, acordeón a la derecha; en celular, una columna (captura 02) | P1 |
| Formulario de 3 pasos | Las 3 preguntas antes del calendario (D-017) | P1 |
| Calendario Cal.com | Integrado en `/agendar` | P1 |
| Banda de CTA | **Tarjeta grande** redondeada con collage de los trabajos al fondo, tintado de morado; título centrado, botón principal (morado) y nota corta debajo (captura 04) | P1 |
| Casos de éxito | Video vertical dentro de un celular con flechas tipo reel, sonido que se activa al tocar, datos del caso debajo (`CasosReel`, `CasosExito`, D-128, D-129) | P1 |
| Aviso de cookies | Tarjeta abajo con Aceptar (botón principal) y Rechazar (secundario) del mismo tamaño + "Elegir mis preferencias" (diálogo con interruptores morados) (D-130, D-132, D-142) | P1 |
| Footer | v2 | P1 |
| Testimonio | Texto, nombre y foto | P1 (cuando haya testimonios) |
| Cápsula "Ver proyecto" | `components/v2/HoverCapsule.tsx`: cápsula morada (D-142; antes lima) que reemplaza el puntero y sigue al mouse sobre la vista previa de un proyecto. Solo con mouse (`hover: hover`), 2 variables CSS por `requestAnimationFrame` (D-085) | P1 |
| Fondo de líneas | **Continuo para toda la página** (`.v2-fondo`, D-147): líneas verticales blancas al 4,5 %, una cada 80 px y centradas, con haces de luz a los lados del texto; sin cuadrícula (D-145). `components/ui/grid-background.tsx` ahora solo pone la luz blanca suave de cada sección (con `lineas` vuelve a dibujar las líneas, solo para muestras) | P1 |
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
- Patrones nuevos (estilo 21st.dev): luz que sigue el cursor en tarjetas, indicador que se desliza en el menú, franja de logos en movimiento y flecha del botón que se corre al pasar el mouse. El brillo que recorría el botón principal se quitó con los botones del panel (D-142).
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
| 01 | `01-tarjetas-bento.webp` | Encabezado con botón a la derecha; grilla bento de tarjetas grandes; vista previa enmarcada dentro de la tarjeta; pie con título, descripción y "Ver todo →"; barra de progreso segmentada | Igual, con superficies `surface-1` de tinte morado y borde blanco al 6–10 % | Portafolio destacado, servicios, grilla del portafolio |
| 02 | `02-pagina-completa.webp` | Ritmo de la página: hero centrado + vista previa grande enmarcada, franja de prueba social, bento, FAQ en dos columnas, CTA en tarjeta grande, footer de varias columnas; luces azules borrosas entre secciones | Mismo ritmo para el Inicio; luces en morado | Estructura del Inicio (`02-arquitectura` §3.1) |
| 03 | `03-precios.webp` | Título enorme alineado a la izquierda con tracking negativo; prueba social con avatares; 3 tarjetas de precio; la recomendada con borde de color y brillo; precio grande; lista con íconos de línea | Borde y brillo en **morado**; botón principal **lima** solo en la recomendada; precio en Funnel Display | Sección de precios (`#precios`) |
| 04 | `04-cta-final.webp` | Tarjeta grande redondeada con collage de pantallas tintado de color; título centrado; botón; nota pequeña ("No card needed") | Collage de **nuestros trabajos** tintado de morado; nota: *"30 minutos, sin costo"* | CTA final de cada página |
| 05 | `05-mega-menu.webp` | Menú en barra con ítem activo resaltado; desplegable grande con tarjetas de vista previa + título + descripción; botón principal a la derecha | Desplegable "Servicios" con 3 tarjetas: Páginas que venden · Catálogos y sistemas · Portafolio | Header |

### Lo que **no** se toma

- El **azul eléctrico** de 21st: se reemplaza por morado (luces y botón principal, D-142) y lima (datos).
- Las **tarjetas de colores claros** de la sección "Built for how you ship" (coral, rosa): rompen la regla de solo fondo oscuro (D-025).
- La **búsqueda ⌘K** y el "Log in": el sitio no los necesita.

### Tipografía al estilo de la referencia

Títulos muy grandes, en negrita, con **tracking negativo** (−0.03 a −0.04 em) e interlineado ajustado (~1.0). Se logra con **Funnel Display Bold**, sin cambiar de fuente (D-025).

---

## 10. Implementación en código (D-057, D-062)

| Pieza | Archivo | Qué hace |
|---|---|---|
| Tokens | `tailwind.config.ts` | Colores `surface-1/2/3`, `fog`, `fog-dim`, `brand-soft`; radios `btn` (10) · `frame` (16) · `card` (24); tracking `display` / `heading`; escala `v2-hero` · `v2-h2` · `v2-h3` · `v2-lead`; sombra `glow-purple`; opacidad `8` |
| Clases base | `app/globals.css` (bloque v2) | `.v2-card` (transparente), `.v2-destacada` (transparente, borde más claro), `.v2-icono` (cuadrito de ícono), `.v2-primario` (botón principal), `.v2-glass` (garantías), `.v2-frame`, `.v2-spotlight`, `.v2-glow`, `.v2-grid`, `.v2-faq`, `.v2-progress-fill`, `.v2-pop`. `.v2-shine` queda sin uso desde D-142 |
| Contenido | `content/inicio.ts`, `content/proyectos.ts` | Copy aprobado y portafolio. **Para cambiar un texto o sumar un proyecto, se edita aquí**, no en los componentes |
| Botón | `components/v2/Button.tsx` | `primary` (morado, `.v2-primario`) · `secondary` (oscuro con borde) · `ghost`; `md` / `lg`; `arrow`; `external`. Para un `<button>` o enlace propio (formulario, portafolio): `clasesBoton()` y `FlechaBoton` |
| Primitivas | `components/v2/primitives.tsx` | `Container`, `Badge` (con `live`), `Eyebrow`, `Glow`, `SectionHeader` |
| Header | `components/v2/SiteHeader.tsx` | Barra, mega menú "Servicios", panel móvil, Escape y clic afuera cierran |
| Barra fija | `components/v2/StickyBookBar.tsx` | "Agendar reunión" en celular al bajar del hero |
| Tarjeta con luz | `components/v2/Spotlight.tsx` | Tarjeta base + luz que sigue el cursor |
| Vista previa | `components/v2/ProjectPreview.tsx` | Video si existe; si no, mockup provisional por tipo (D-063) |
| Video | `components/v2/LoopVideo.tsx` | Especificación de §6 |
| Secciones del Inicio | `Hero`, `HomeSections`, `PortfolioShowcase` + `ShowcaseCarousel`, `Pricing`, `Closing` | Una por cada fila de `02-arquitectura` §3.1 |
| Páginas | `app/(v2)/v2`, `app/(v2)/sistema`, `app/(v2)/layout.tsx` | Muestra y guía; `noindex`, fuera del sitemap; fondo `ink` en todo el documento |

**Para agregar el video de un proyecto:** subir `public/portafolio/<slug>.mp4` (+ `.webm` y póster `.webp`) y agregar `video: { mp4, webm, poster }` a ese proyecto en `content/proyectos.ts`. El mockup se reemplaza solo.

---

## 11. Medición de la muestra (Lighthouse móvil, local)

| Medición | Rendimiento | Accesibilidad | Buenas prácticas | LCP | TBT | CLS |
|---|---|---|---|---|---|---|
| Primera versión | 92 | 100 | 96 | 3.0 s | 160 ms | 0 |
| Con optimizaciones (2 corridas) | **94 – 97** | **100** | 96 | 2.4 – 3.0 s | **50 – 60 ms** | **0** |
| Banda de capturas con `<img>` (D-064, descartado) | 78 – 81 | 100 | 96 | 4.8 – 5.5 s | 90 – 160 ms | 0 |
| Banda de capturas con `<canvas>` (D-064, actual) | **90 – 96** | **100** | 96 | 2.7 – 3.6 s | **50 – 60 ms** | **0** |
| Escritorio, banda con `<canvas>` | **98 – 99** | 100 | — | 0.8 s | 0 ms | 0 |

- **SEO sale 66 a propósito:** la muestra es `noindex`. Al lanzar vuelve a 100.
- **Buenas prácticas 96:** los errores de consola son GTM (bloqueado en el entorno de prueba) y la precarga de `/agendar`, que aún no existe. Ambos desaparecen en producción.
- **El número oficial** se toma en PageSpeed sobre la URL publicada (Fase 5).

---

## 12. Reglas aprendidas (reutilizables en cualquier página)

| Regla | Por qué |
|---|---|
| El `h1` del hero **no se anima** | Es el LCP: animar su opacidad retrasa el primer pintado |
| `experimental.inlineCss: true` en `next.config.mjs` | Quita la hoja de estilos que bloqueaba el primer pintado |
| Precargar **solo la fuente de títulos**; el cuerpo con `preload: false` | Menos archivos compitiendo en conexiones lentas |
| **Una fuente variable por familia, recortada al español** (D-156): `app/fonts/funnel-display-wght-600-800.woff2` y `plus-jakarta-sans-wght-400-700.woff2` | Antes eran 7 archivos (87 KB) y Lighthouse marcaba 4 cadenas en el "Árbol de dependencias de red"; ahora 2 archivos (35 KB) y 1 cadena. Para regenerarlas: bajar `@fontsource-variable/<familia>` (archivo `latin-wght-normal`), recortar con `pyftsubset <archivo> --unicodes="U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02C6,U+02DC,U+2013-2014,U+2018-201E,U+2022,U+2026,U+2030,U+2039-203A,U+20AC,U+2122,U+2190-2193,U+2212,U+2248,U+2264-2265" --flavor=woff2 --layout-features='*'` y limitar el peso con `python -m fontTools.varLib.instancer <archivo> wght=400:700` (títulos `600:800`). Si un texto nuevo usa un carácter fuera de esa lista, se agrega y se regenera |
| Lo decorativo se renderiza en el **servidor** y se pasa como `children`/props a los componentes de cliente | El navegador no hidrata lo que no necesita interacción |
| Contenido oculto (mega menú) se crea **al abrirlo por primera vez** | Menos elementos al cargar |
| Luces de fondo con gradiente radial, **sin `filter: blur`** | El blur grande es caro de pintar en celular |
| Al combinar una animación con `transform` y un centrado con `translate`, van en **capas distintas** | Si no, la animación pisa el centrado (pasó con el mega menú) |
| Tamaño del hero **medido**, no adivinado: `clamp(1.8rem, 5.8vw, 4.25rem)` | 3 líneas en 360–430 px y 2 desde tablet (regla de `CLAUDE.md`: máx. 3) |
| En Tailwind, toda opacidad usada debe existir en la escala (se agregó `8`) | `border-white/8` sin el paso `8` sale invisible (gotcha de `CLAUDE.md`) |
| Pruebas con Playwright: bloquear dominios externos y no esperar `networkidle` | GTM bloqueado deja la red "ocupada" para siempre |
| **Imágenes decorativas grandes que se mueven (carruseles 3D, bandas) van en `<canvas>`** | Chrome toma como LCP cualquier `<img>` o `background-image` que se pinte después y más grande que el `h1`; con perspectiva, las tarjetas de los bordes se agrandan y cada una que entra es un candidato nuevo. El canvas no cuenta para el LCP (D-064) |
| Una imagen recortada (`overflow:hidden`) cuenta para el LCP con **su tamaño completo**, no con lo visible | Por eso achicar la banda no bastó |
| Geometría que depende solo de la proporción → **proporción fija** (`ratio`) | El servidor calcula el layout final y no hay que ocultar nada hasta que JS mida |
| Una instancia por breakpoint (`md:hidden` / `hidden md:block`) y descargas solo si la instancia tiene ancho | Lo oculto con `display:none` no descarga imágenes |
| Contadores: el servidor renderiza **la cifra real**; el efecto la reinicia a 0 solo en el navegador | Google y los bots de IA leen "5 días", no "0 días" |
| Capas invisibles (`opacity:0`) de menús: **`pointer-events-none` cuando están cerradas** + retraso de intención al abrir | Si no, se abren al pasar el mouse por debajo del botón (bug del mega menú) |
| **Nada `position: fixed` dentro de un elemento con `backdrop-filter`, `transform` o `filter`** | Ese padre se vuelve el contenedor del `fixed`: el panel del menú quedaba recortado al alto del header (D-070). Los paneles a pantalla completa van como hermanos del header |
| Paneles que se abren con un toque se **crean al primer toque** (y se abren al siguiente cuadro para que la animación corra) | Montados desde el inicio, Next precarga sus enlaces y suma ~95 KB al cargar |
| Menú del celular: opciones de **56 px o más**, acción principal **abajo** (zona del pulgar), cierre con X/Escape/al tocar, foco dentro del panel | Fácil de usar con una mano (D-070) |
| **Analítica (GTM/GA4) se carga al primer toque, scroll o tecla, o a los 7 s; de inmediato si hay un evento de conversión** | El contenedor con GA4 pesa ~178 KB; cargado al abrir, bajó el Inicio de 95 a 77–82 en celular. Medir siempre con los scripts de terceros permitidos: un entorno que los bloquea da números irreales (D-098) |
| **Scroll horizontal: recortar solo el `<main>` en celular con `overflow-x: clip`** (no el `body`, no `hidden`) | Evita que una luz o una banda 3D (Safari no siempre recorta lo 3D) mueva la página de lado, y deja que una sección tenga su propio scroll horizontal (D-097) |
| **Texturas (grano, ruido) en `<canvas>` pintado después de abrir, nunca un SVG con `feTurbulence` como fondo** | El filtro se rasteriza antes del primer pintado y retrasa el título (LCP) en celular (D-147) |
| Fondos fijos de página completa **sin `mask-image`**: desvanecer con una capa del color del fondo | La máscara obliga a rasterizar otra capa del tamaño de la pantalla (D-147) |
| Animación ligada al scroll: **un solo listener pasivo** que escribe una variable CSS (`--p`), activo solo mientras la sección se ve; lo demás es `calc()` en CSS | Sin listeners por elemento ni reflow (`ScrollPaint`, D-067) |

---

## 13. Historial de la dirección visual (19 nov 2026) y cómo mantenerla

Ese día se probaron cuatro versiones del sitio, publicadas y revisadas por Sergio. Queda registrado para no repetir lo que ya se descartó.

| Decisión | Qué se probó | Resultado |
|---|---|---|
| D-137 | Color plano con una referencia de estudio de marca: sin luces ni degradados, paquete recomendado y cierre en **bloques morados con texto blanco**, botones en píldora con círculo y flecha | Descartado: "horrible… ese morado y texto blanco se ve fatal". Gustaron solo los botones |
| D-138 | **Tarjetas blancas** con texto negro en lo destacado, títulos en dos tonos, botón negro con círculo lima | Publicado y descartado el mismo día |
| D-141 | Volver a la versión de la mañana (con luces moradas) y aplicarle el **estilo del panel** (D-136): tarjetas por capas, filo morado en lo destacado, cuadritos de ícono | ✅ Vigente |
| D-142 | **Botones iguales a los del panel**: principal morado, secundario oscuro; lima solo para datos | ✅ Vigente |
| D-155 (20 nov) | **Panel:** el lima solo en la píldora o pestaña **activa**; estados en **semáforo** (ámbar, verde, verde fuerte, rojo). El sitio sigue con la píldora gris | ✅ Vigente |
| D-154 (20 nov) | Panel: todas las píldoras en lima en oscuro | Reemplazada por D-155 el mismo día |
| D-153 (20 nov) | El **panel adopta las piezas del sitio**: tarjetas con humo, píldoras con borde e íconos de marca en las tarjetas de proyecto (versión blanca en el modo claro) | ✅ Vigente |
| D-150 (20 nov) | **Tarjetas negras con humo**, **píldoras negras con borde** (badges, etiquetas de sección, "Recomendado", filtros) e **íconos SVG propios en grises** en los paquetes de precio; el cierre pierde su tinte morado | ✅ Vigente |
| D-149 (20 nov) | **Sistema único** para sitio y panel (`docs/sistema-de-diseno.md`); el panel adopta el sistema y suma modo claro | ✅ Vigente |
| D-148 (20 nov) | **Sin grano** sobre la página | ✅ Vigente |
| D-147 (20 nov) | **Sin íconos decorativos** (números en su lugar), íconos funcionales con Phosphor `light`, fondo de líneas continuo para toda la página, grano en canvas | ✅ Vigente (en vista previa) |
| D-146 (20 nov) | **Tarjetas transparentes, morado solo en botones, luces blancas suaves**; superficies neutras; íconos, etiquetas, checks y gráficos sin morado | ✅ Vigente (en vista previa) |
| D-145 (20 nov) | **Menos "look de IA"**: fondo negro `#020104`, sin cuadrícula (solo líneas verticales), haces de luz, grano, luces moradas más suaves, cifras del hero sin íconos | ✅ Vigente |

**Lo que no se vuelve a proponer sin una referencia nueva de Sergio:** bloques grandes de morado con texto blanco encima, **morado fuera de los botones** (D-146), **íconos decorativos en tarjetas** (D-147), tarjetas blancas sobre el oscuro, títulos en dos tonos, botones en píldora con círculo y **fondo en cuadrícula** (D-145).

**Sitio y panel siguen el mismo sistema desde D-149** ([`docs/sistema-de-diseno.md`](../sistema-de-diseno.md)). Las piezas están copiadas, no compartidas, porque el CSS del panel se compila aparte y el panel no importa piezas del sitio (D-135):

| Sitio (`app/globals.css`) | Panel (`styles/panel.src.css`) |
|---|---|
| `.v2-primario` | `.pn-primario` (iguales: si cambia uno, cambia el otro) |
| `.v2-card` (negra con humo) | `.pn-root .v2-card` (con humo en oscuro, blanca en claro; `--pn-tarjeta`) |
| `.v2-destacada` | `.pn-root .v2-glass` (`--pn-destacada`) |
| `.v2-pildora` (gris) | `.pn-pildora` (gris) + `.pn-pildora-activa` (lima, solo en el panel: filtro o pestaña elegida, D-155) |
| `components/v2/IconosMarca.tsx` | `components/panel/IconosMarca.tsx` (ids `pn-im-*`) |
| `components/v2/iconos.tsx` (Phosphor `light`) | `components/panel/iconos.tsx` (Phosphor `light`) |

Si se cambia una de estas piezas, **se cambia en los dos archivos** y se anota en `docs/decisiones.md`. Diferencias que sí se mantienen: el sitio lleva líneas verticales con haces y luces blancas suaves; el panel no (es una herramienta) y tiene **modo claro** (D-149).
