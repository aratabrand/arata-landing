# 04 — Sistema de diseño v2

| Estado | Versión | Última actualización | Aprueba |
|---|---|---|---|
| Aprobado (D-164 a D-168) | 1.1 | 23 nov 2026 | Sergio |

> **La fuente única es [`docs/sistema-de-diseno.md`](../sistema-de-diseno.md)** (v2.0, estilo Kept, D-164 a D-168): color, componentes, fondo, gráficos y movimiento del sitio, el panel y todo producto nuevo. **Si algo de aquí choca con esa guía, manda la guía.**
>
> Este documento queda como el detalle del **sitio**: la dirección que dio Sergio (D-025, D-026), la traducción de 21st.dev (§9), la implementación en código (§10–§12), el inventario de componentes (§5) y el historial de la dirección visual (§13). Se ve en vivo en `/sistema` (guía) y en aratasan.com. **El sitio y el panel comparten piezas**: si se cambia una en uno, se revisa en el otro (§13).

---

## 1. Qué cambia frente a la v1

| Tema | v1 (landing retirada) | v2 (sitio de agencia) |
|---|---|---|
| Fondos | Alterna blanco `#FFFFFF` y oscuro `#03010B` | **Solo oscuro**: `#020104` (D-145) |
| Colores de marca | Morado y lima como acentos | **Lima para actuar, elegir y destacar; morado para datos y gráficas** (D-164) |
| Tipografía | Funnel Display + Plus Jakarta Sans | Igual, más **Instrument Serif Italic** en lima para la última palabra de los títulos (D-164, D-166) |
| Estilo de componentes | Píldora glass, bento, timeline | **Estilo Kept**: un solo estilo por componente, todo lo que se toca es píldora, tarjetas lisas (D-164) |
| Botón principal | Lima | **Lima con texto tinta** (`.v2-primario`, D-164) |
| Trabajos | No había portafolio | Video en loop tipo GIF dentro de mockups + animaciones premium |

---


## 2. Color, fondo e íconos

Todo está en [`docs/sistema-de-diseno.md`](../sistema-de-diseno.md) §1, §2 y §5. Resumen para el sitio:

| Pieza | Cómo va |
|---|---|
| Fondo | `noche` `#020104` en toda la página (D-145) |
| Superficies | `surface-1/2/3` `#0B0B0D` · `#121215` · `#19191D` (menús, ventanas, botón secundario); bordes blancos al 6 / 10 / 16 % |
| Texto | `white` `#FFFFFF` · `fog` `#B8B8BE` · `fog-dim` `#8E8E96`, grises **neutros** (D-162) |
| Tarjeta (`.v2-card`) | **Lisa** `#0F0F12`, borde blanco al 13 % y un filo de luz arriba (D-164) |
| Tarjeta destacada (`.v2-destacada`) | **Degradado lima** con texto tinta y botón negro adentro: paquete recomendado y precio de cada servicio (D-164) |
| Lima `#B6FF00` | Botón principal, opción elegida (sólido), interruptores encendidos, destacada, número de los precios, palabra en cursiva de los títulos |
| Morado `#7D53FF` | Datos y gráficas. **Nunca** botones morados ni bloques morados con texto blanco |
| Líneas de fondo | Verticales, continuas en toda la página (`.v2-fondo` en `app/(v2)/layout.tsx`, sin `mask-image`). Nunca cuadrícula |
| Haces y luces | Haces finos por algunas líneas; luces blancas muy suaves con un **degradado lima tenue que se mueve** (`.v2-glow::after`, 24 s, solo `transform` y `opacity`; quieto con movimiento reducido, D-163). Nunca luces moradas |
| Íconos | Sin íconos decorativos (números 01, 02… o un punto en su lugar, D-147). Los que cumplen una función, con **Phosphor `light`** (versión SSR) en `components/v2/iconos.tsx` |
| No se usa | Grano (D-148), vidrio, humo en las tarjetas, tarjetas blancas sobre oscuro, naranja |

La regla de `CLAUDE.md` §3 ("sin degradados ni orbes") es para los slides de carruseles; en el sitio se permiten solo estas luces.

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
| Menú (header) | Barra completa (no píldora flotante); ítem activo en píldora; **mega menú** en "Servicios" con tarjetas de vista previa (captura 05); en celular, panel a pantalla completa con entrada escalonada, hamburguesa → X y botón de agendar fijo abajo (D-070) | P1 |
| Botón | **Uno solo, en píldora**, igual al del panel (`.v2-primario` = `.pn-primario`). Primario **lima con texto tinta** · secundario superficie oscura (`surface-2`) con borde fino · terciario texto con flecha ("Ver todo →"). La flecha se corre un poco al pasar el mouse. Para `<button>` propios: `clasesBoton()`, `FlechaBoton` (D-164) | P1 |
| Badge / etiqueta | Píldoras para estados, categorías y "en vivo" | P1 |
| Tarjeta base | **Lisa** (`.v2-card`, D-164): `#0F0F12`, borde blanco 13 %, filo de luz arriba, radio 24 px; luz blanca que sigue el cursor (`Spotlight`). La usan también las cifras del hero, el bento de servicios y las garantías | P1 |
| Tarjeta bento con vista previa | Vista previa **enmarcada dentro** de la tarjeta (marco de 8 px, radio interno 16 px) + pie con título, descripción y enlace con flecha a la derecha (captura 01) | P1 |
| Encabezado de sección | Título grande a la izquierda + subtítulo atenuado + botón secundario a la derecha (captura 01) | P1 |
| Barra de progreso segmentada | Indica qué proyecto se está mostrando en el carrusel del portafolio y avanza sola (captura 01) | P1 |
| Bento de servicios | Diagramas vivos (flujo de pedido, conexiones, gráfica "EJEMPLO"), adaptado de `ink-orbit-features` — `components/v2/ServicesBento.tsx` (D-065) | P1 |
| Banda curva de capturas | Hero: capturas reales girando en un cilindro, dibujadas en `<canvas>` — `components/ui/tilted-grid-hero.tsx` (D-064) | P1 |
| Tarjetas del problema | Apiladas, tarjeta lisa + **número** (01–05, D-147) + título + texto, resaltado que las recorre (el número se pinta de lima) (D-066) | P1 |
| Cifras del hero | 3 tarjetas lisas (`.v2-card`), **sin íconos**, más grandes en escritorio (cifra 48 px, ancho hasta 1024 px) + cifra con contador + texto (D-145) | P1 |
| Tarjeta de paquete | Nombre + para quién + precio grande (número en lima) + botón + lista con íconos de línea. La **recomendada** va en la destacada (`.v2-destacada`, **degradado lima** con texto tinta, etiqueta "Recomendado" y **botón negro** adentro); las demás, tarjeta lisa y botón secundario (D-164, captura 03) | P1 |
| Tarjetas de garantía | Garantía, pago 50/50 y mantenimiento: tarjeta lisa + ícono SVG animado (`Assurances`, D-068) | P1 |
| Tarjeta de proyecto | Mockup (celular / computador) con video en loop | P1 |
| Filtro del portafolio | Por tipo: landing · catálogo · sistema | P1 |
| Bloque de caso | Problema → solución → resultado | P1 |
| Métrica | Cifra con contador + anillo (patrón v1) | P1 |
| Pasos del proceso | Cómo trabajamos; la línea y los pasos se pintan de lima con el scroll (`ScrollPaint`, D-067) | P1 |
| Preguntas frecuentes | **Dos columnas**: título a la izquierda, acordeón a la derecha; en celular, una columna (captura 02) | P1 |
| Formulario de 3 pasos | Las 3 preguntas antes del calendario (D-017) | P1 |
| Calendario Cal.com | Integrado en `/agendar` | P1 |
| Banda de CTA | **Tarjeta grande** redondeada con collage de los trabajos al fondo; título centrado con la última palabra en cursiva lima, botón principal (lima) y nota corta debajo (captura 04) | P1 |
| Casos de éxito | Video vertical dentro de un celular con flechas tipo reel, sonido que se activa al tocar, datos del caso debajo (`CasosReel`, `CasosExito`, D-128, D-129) | P1 |
| Aviso de cookies | Tarjeta abajo con Aceptar (botón principal) y Rechazar (secundario) del mismo tamaño + "Elegir mis preferencias" (diálogo con interruptores **lima** al encenderse) (D-130, D-132, D-164) | P1 |
| Footer | v2 | P1 |
| Testimonio | Texto, nombre y foto | P1 (cuando haya testimonios) |
| Cápsula "Ver proyecto" | `components/v2/HoverCapsule.tsx`: cápsula **lima** con texto tinta que reemplaza el puntero y sigue al mouse sobre la vista previa de un proyecto. Solo con mouse (`hover: hover`), 2 variables CSS por `requestAnimationFrame` (D-085) | P1 |
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

- El **azul eléctrico** de 21st: se reemplaza por lima (botones, elegido, destacado) y morado (datos y gráficas), D-164.
- Las **tarjetas de colores claros** de la sección "Built for how you ship" (coral, rosa): rompen la regla de solo fondo oscuro (D-025).
- La **búsqueda ⌘K** y el "Log in": el sitio no los necesita.

### Tipografía al estilo de la referencia

Títulos muy grandes, en negrita, con **tracking negativo** (−0.03 a −0.04 em) e interlineado ajustado (~1.0). Se logra con **Funnel Display Bold**, sin cambiar de fuente (D-025).

---

## 10. Implementación en código (D-057, D-062)

| Pieza | Archivo | Qué hace |
|---|---|---|
| Tokens | `tailwind.config.ts` | Colores `surface-1/2/3`, `fog`, `fog-dim`, `brand-soft`; radios `btn` (10) · `frame` (16) · `card` (24); tracking `display` / `heading`; escala `v2-hero` · `v2-h2` · `v2-h3` · `v2-lead`; sombra `glow-purple`; opacidad `8` |
| Clases base | `app/globals.css` (bloque v2) | `.v2-card` (lisa), `.v2-destacada` (degradado lima), `.v2-icono` (sin uso desde D-147), `.v2-primario` (botón principal lima), `.v2-glass` (garantías), `.v2-frame`, `.v2-spotlight`, `.v2-glow`, `.v2-grid`, `.v2-faq`, `.v2-progress-fill`, `.v2-pop`. `.v2-shine` queda sin uso desde D-142 (archivada) |
| Contenido | `content/inicio.ts`, `content/proyectos.ts` | Copy aprobado y portafolio. **Para cambiar un texto o sumar un proyecto, se edita aquí**, no en los componentes |
| Botón | `components/v2/Button.tsx` | `primary` (lima, `.v2-primario`) · `secondary` (oscuro con borde) · `ghost`; `md` / `lg`; `arrow`; `external`. Para un `<button>` o enlace propio (formulario, portafolio): `clasesBoton()` y `FlechaBoton` |
| Primitivas | `components/v2/primitives.tsx` | `Container`, `Badge` (con `live`), `Eyebrow`, `Glow`, `SectionHeader`, `Acento` (última palabra del título en cursiva lima, D-164/D-166) |
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
| **Se precargan las dos fuentes** (D-158; antes solo la de títulos) | Cada familia es un solo archivo pequeño: precargada, la fuente sale del "Árbol de dependencias de red" (documento → fuente) y el subtítulo del hero no cambia de letra al abrir |
| **Una fuente variable por familia, recortada al español** (D-156, D-158): `app/fonts/funnel-display-wght-600-800.woff2` (11,5 KB) y `plus-jakarta-sans-wght-400-700.woff2` (13,7 KB) | Antes eran 7 archivos (87 KB) y 4 cadenas en Lighthouse; ahora 2 archivos (25 KB), precargados, y 0 cadenas de fuentes. Para regenerarlas: bajar `@fontsource-variable/<familia>` (archivo `latin-wght-normal`), recortar con `pyftsubset <archivo> --unicodes="U+0020-007E,U+00A0,U+00A1,U+00A7,U+00A9,U+00AA,U+00AB,U+00AE,U+00B0,U+00B7,U+00BA,U+00BB,U+00BF,U+00C1,U+00C9,U+00CD,U+00D1,U+00D3,U+00DA,U+00DC,U+00D7,U+00E1,U+00E9,U+00ED,U+00F1,U+00F3,U+00FA,U+00FC,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2022,U+2026,U+20AC,U+2192,U+2212" --flavor=woff2` (rasgos tipográficos por defecto) y limitar el peso con `python -m fontTools.varLib.instancer <archivo> wght=400:700` (títulos `600:800`). Lleva latín básico, vocales con tilde, ñ, ü, ¿ ¡, « », °, comillas, rayas, € y →. **Si un texto nuevo usa un carácter fuera de esa lista** (otra letra con tilde, un símbolo), ese carácter sale con la letra de respaldo: se agrega a la lista y se regenera |
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
| **Carruseles: solo se monta la imagen que se ve**; la siguiente, a la mitad de su turno si el carrusel está a la vista, o al pasar el mouse por su botón (`ShowcaseCarousel`, D-157) | Con las 4 capturas apiladas (opacidad 0) el navegador bajaba las 4 aunque se viera una: PageSpeed marcaba 80 KB de ahorro en "Mejora la entrega de imágenes" |
| El `sizes` de cada imagen es el **ancho real que ocupa**, restando márgenes: `calc(100vw - 3.25rem)`, no `100vw` (D-157) | Con `100vw` el celular pedía la versión de 750 px para una caja de 360 px. Lighthouse compara contra el ancho en pantalla; lo que queda marcado (unos 14 KB) es la versión para pantallas de alta densidad, que se deja para que las capturas no se vean borrosas |
| SVG de logos pasados por `svgo -p 1` (D-157) | Los logos de clientes pesaban 52 KB y se ven a 176 px: quedaron en 20 KB, sin diferencia visible |
| Paneles que se abren con un toque se **crean al primer toque** (y se abren al siguiente cuadro para que la animación corra) | Montados desde el inicio, Next precarga sus enlaces y suma ~95 KB al cargar |
| Menú del celular: opciones de **56 px o más**, acción principal **abajo** (zona del pulgar), cierre con X/Escape/al tocar, foco dentro del panel | Fácil de usar con una mano (D-070) |
| **Analítica (GTM/GA4) se carga al primer toque, scroll o tecla, o a los 7 s; de inmediato si hay un evento de conversión** | El contenedor con GA4 pesa ~178 KB; cargado al abrir, bajó el Inicio de 95 a 77–82 en celular. Medir siempre con los scripts de terceros permitidos: un entorno que los bloquea da números irreales (D-098) |
| **Scroll horizontal: recortar solo el `<main>` en celular con `overflow-x: clip`** (no el `body`, no `hidden`) | Evita que una luz o una banda 3D (Safari no siempre recorta lo 3D) mueva la página de lado, y deja que una sección tenga su propio scroll horizontal (D-097) |
| **Texturas (grano, ruido) en `<canvas>` pintado después de abrir, nunca un SVG con `feTurbulence` como fondo** | El filtro se rasteriza antes del primer pintado y retrasa el título (LCP) en celular (D-147) |
| Fondos fijos de página completa **sin `mask-image`**: desvanecer con una capa del color del fondo | La máscara obliga a rasterizar otra capa del tamaño de la pantalla (D-147) |
| Animación ligada al scroll: **un solo listener pasivo** que escribe una variable CSS (`--p`), activo solo mientras la sección se ve; lo demás es `calc()` en CSS | Sin listeners por elemento ni reflow (`ScrollPaint`, D-067) |

---

## 13. Historial de la dirección visual (19 a 22 nov 2026) y cómo mantenerla

Versiones del sitio y del panel publicadas y revisadas por Sergio. Queda registrado para no repetir lo que ya se descartó. **Lo vigente hoy es el estilo Kept (D-164 a D-168)**; el detalle de las decisiones viejas está en `docs/decisiones-archivo.md`.

| Decisión | Qué se probó | Resultado |
|---|---|---|
| D-164 a D-168 (21–22 nov) | **Estilo Kept unificado** en sitio y panel: un solo estilo por componente, botón y opción elegida en lima, destacada en degradado lima, tarjetas lisas, morado solo para datos y gráficas, palabra final en cursiva lima; en el panel oscuro, menú elegido en lima (D-167) y avisos blancos (D-168) | ✅ Vigente |
| D-162, D-163 (21 nov) | Grises neutros, cifras y nombre en lima, logo de un color, avisos al revés del fondo, contadores y degradado lima que se mueve en la web | ✅ Vigente (los botones cambiaron en D-164) |
| D-137 | Color plano con una referencia de estudio de marca: sin luces ni degradados, paquete recomendado y cierre en **bloques morados con texto blanco**, botones en píldora con círculo y flecha | Descartado: "horrible… ese morado y texto blanco se ve fatal". Gustaron solo los botones |
| D-138 | **Tarjetas blancas** con texto negro en lo destacado, títulos en dos tonos, botón negro con círculo lima | Publicado y descartado el mismo día |
| D-141 | Volver a la versión de la mañana (con luces moradas) y aplicarle el **estilo del panel** (D-136): tarjetas por capas, filo morado en lo destacado, cuadritos de ícono | Reemplazada por D-164 |
| D-142 | **Botones iguales a los del panel**: principal morado, secundario oscuro; lima solo para datos | Reemplazada por D-164 (botón lima) |
| D-155 (20 nov) | **Panel:** el lima solo en la píldora o pestaña **activa**; estados en **semáforo** (ámbar, verde, verde fuerte, rojo). El sitio sigue con la píldora gris | ✅ Vigente el semáforo; la píldora activa pasó a lima sólido (D-164) |
| D-154 (20 nov) | Panel: todas las píldoras en lima en oscuro | Reemplazada por D-155 el mismo día |
| D-153 (20 nov) | El **panel adopta las piezas del sitio**: tarjetas con humo, píldoras con borde e íconos de marca en las tarjetas de proyecto (versión blanca en el modo claro) | Reemplazada: tarjetas lisas (D-164) |
| D-150 (20 nov) | **Tarjetas negras con humo**, **píldoras negras con borde** (badges, etiquetas de sección, "Recomendado", filtros) e **íconos SVG propios en grises** en los paquetes de precio; el cierre pierde su tinte morado | Reemplazada: tarjetas lisas (D-164) |
| D-149 (20 nov) | **Sistema único** para sitio y panel (`docs/sistema-de-diseno.md`); el panel adopta el sistema y suma modo claro | ✅ Vigente |
| D-148 (20 nov) | **Sin grano** sobre la página | ✅ Vigente |
| D-147 (20 nov) | **Sin íconos decorativos** (números en su lugar), íconos funcionales con Phosphor `light`, fondo de líneas continuo para toda la página, grano en canvas | ✅ Vigente |
| D-146 (20 nov) | **Tarjetas transparentes, morado solo en botones, luces blancas suaves**; superficies neutras; íconos, etiquetas, checks y gráficos sin morado | Reemplazada por D-164 (lima para actuar, morado para datos) |
| D-145 (20 nov) | **Menos "look de IA"**: fondo negro `#020104`, sin cuadrícula (solo líneas verticales), haces de luz, grano, luces moradas más suaves, cifras del hero sin íconos | ✅ Vigente |

**Lo que no se vuelve a proponer sin una referencia nueva de Sergio:** bloques grandes de morado con texto blanco encima, **botones morados** (D-164), luces moradas, humo o vidrio en las tarjetas, **íconos decorativos en tarjetas** (D-147), tarjetas blancas sobre el oscuro, títulos en dos tonos, botones en píldora con círculo y **fondo en cuadrícula** (D-145).

**Sitio y panel siguen el mismo sistema desde D-149** ([`docs/sistema-de-diseno.md`](../sistema-de-diseno.md)). Las piezas están copiadas, no compartidas, porque el CSS del panel se compila aparte y el panel no importa piezas del sitio (D-135):

| Sitio (`app/globals.css`) | Panel (`styles/panel.src.css`) |
|---|---|
| `.v2-primario` | `.pn-primario` (iguales: si cambia uno, cambia el otro) |
| `.v2-card` (lisa) | `.pn-root .v2-card` (lisa en oscuro, blanca en claro; `--pn-tarjeta`) |
| `.v2-destacada` (degradado lima) | `.pn-root .v2-glass` (degradado lima; `--pn-destacada`) |
| `.v2-pildora` (gris) | `.pn-pildora` (gris) + `.pn-pildora-activa` (lima sólido: filtro o pestaña elegida, D-164) |
| `components/v2/IconosMarca.tsx` | `components/panel/IconosMarca.tsx` (ids `pn-im-*`) |
| `components/v2/iconos.tsx` (Phosphor `light`) | `components/panel/iconos.tsx` (Phosphor `light`) |

Si se cambia una de estas piezas, **se cambia en los dos archivos** y se anota en `docs/decisiones.md`. Diferencias que sí se mantienen: el sitio lleva líneas verticales con haces y luces blancas suaves con degradado lima; el panel no (es una herramienta) y tiene **modo claro** (D-149).
