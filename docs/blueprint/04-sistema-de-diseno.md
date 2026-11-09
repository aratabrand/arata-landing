# 04 — Sistema de diseño v2

| Estado | Versión | Última actualización | Aprueba |
|---|---|---|---|
| En revisión (implementado en código) | 0.3 | 7 nov 2026 | Sergio |

> Esta versión registra la **dirección** que dio Sergio (D-025, D-026), la traducción de las referencias de 21st.dev (D-044, §9) y la **implementación en código** (§10–§12). Se ve en vivo en `/sistema` (guía) y `/v2` (muestra del Inicio). Los valores marcados **[decidir]** y la especificación fina de cada componente se cierran en la Fase 3, con capturas de referencia.

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
| `purple-deep` (`brand-ink`) | `#3B1D99` | Tintes de brillos y fondos de luz | Texto (no se lee sobre oscuro) |
| `brand-soft` | `#B9A4FF` | Texto morado sobre oscuro: etiquetas, íconos de lista (≈9.7:1) | Fondos |

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
| Menú (header) | Barra completa (no píldora flotante); ítem activo con fondo oscuro; **mega menú** en "Servicios" con tarjetas de vista previa (captura 05); en celular, panel a pantalla completa con entrada escalonada, hamburguesa → X y botón de agendar fijo abajo (D-070) | P1 |
| Botón | Rectangular redondeado 10 px. Primario **lima** con texto `ink` · secundario superficie oscura (`surface-2`) · terciario texto con flecha ("Ver todo →") | P1 |
| Badge / etiqueta | Píldoras para estados, categorías y "en vivo" | P1 |
| Tarjeta base | Superficie + borde fino de 1 px + radio 24 px; luz que sigue el cursor en hover | P1 |
| Tarjeta bento con vista previa | Vista previa **enmarcada dentro** de la tarjeta (marco de 8 px, radio interno 16 px) + pie con título, descripción y enlace con flecha a la derecha (captura 01) | P1 |
| Encabezado de sección | Título grande a la izquierda + subtítulo atenuado + botón secundario a la derecha (captura 01) | P1 |
| Barra de progreso segmentada | Indica qué proyecto se está mostrando en el carrusel del portafolio y avanza sola (captura 01) | P1 |
| Bento de servicios | Diagramas vivos (flujo de pedido, conexiones, gráfica "EJEMPLO"), adaptado de `ink-orbit-features` — `components/v2/ServicesBento.tsx` (D-065) | P1 |
| Banda curva de capturas | Hero: capturas reales girando en un cilindro, dibujadas en `<canvas>` — `components/ui/tilted-grid-hero.tsx` (D-064) | P1 |
| Tarjetas del problema | Apiladas, caja de ícono + título + texto, resaltado que las recorre (D-066) | P1 |
| Tarjeta de paquete | Nombre + para quién + precio grande + botón + lista con íconos de línea. La **recomendada** lleva borde morado, brillo suave, badge "Recomendado" y el único botón lima; las demás, botón oscuro (captura 03) | P1 |
| Tarjetas glass de garantía | Garantía, pago 50/50 y mantenimiento, `backdrop-filter` + ícono SVG animado (`Assurances`, D-068) | P1 |
| Tarjeta de proyecto | Mockup (celular / computador) con video en loop | P1 |
| Filtro del portafolio | Por tipo: landing · catálogo · sistema | P1 |
| Bloque de caso | Problema → solución → resultado | P1 |
| Métrica | Cifra con contador + anillo (patrón v1) | P1 |
| Pasos del proceso | Cómo trabajamos; la línea y los pasos se pintan de lima con el scroll (`ScrollPaint`, D-067) | P1 |
| Preguntas frecuentes | **Dos columnas**: título a la izquierda, acordeón a la derecha; en celular, una columna (captura 02) | P1 |
| Formulario de 3 pasos | Las 3 preguntas antes del calendario (D-017) | P1 |
| Calendario Cal.com | Integrado en `/agendar` | P1 |
| Banda de CTA | **Tarjeta grande** redondeada con collage de los trabajos al fondo, tintado de morado; título centrado, botón lima y nota corta debajo (captura 04) | P1 |
| Footer | v2 | P1 |
| Testimonio | Texto, nombre y foto | P1 (cuando haya testimonios) |
| Cápsula "Ver proyecto" | `components/v2/HoverCapsule.tsx`: cápsula lima que reemplaza el puntero y sigue al mouse sobre la vista previa de un proyecto. Solo con mouse (`hover: hover`), 2 variables CSS por `requestAnimationFrame` (D-085) | P1 |
| Fondo de rejilla | `components/ui/grid-background.tsx` (ref. 21st.dev): líneas blancas al 5 %, celda de 40 px, luz morada suave y bordes desvanecidos. Variantes *rejilla* (Problema, Precios) y *líneas* (Cómo trabajamos). Solo CSS, sin JS. **Nunca en el hero** y nunca en dos secciones seguidas con la misma variante (D-071) | P1 |
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
| 01 | `01-tarjetas-bento.webp` | Encabezado con botón a la derecha; grilla bento de tarjetas grandes; vista previa enmarcada dentro de la tarjeta; pie con título, descripción y "Ver todo →"; barra de progreso segmentada | Igual, con superficies `surface-1` de tinte morado y borde blanco al 6–10 % | Portafolio destacado, servicios, grilla del portafolio |
| 02 | `02-pagina-completa.webp` | Ritmo de la página: hero centrado + vista previa grande enmarcada, franja de prueba social, bento, FAQ en dos columnas, CTA en tarjeta grande, footer de varias columnas; luces azules borrosas entre secciones | Mismo ritmo para el Inicio; luces en morado | Estructura del Inicio (`02-arquitectura` §3.1) |
| 03 | `03-precios.webp` | Título enorme alineado a la izquierda con tracking negativo; prueba social con avatares; 3 tarjetas de precio; la recomendada con borde de color y brillo; precio grande; lista con íconos de línea | Borde y brillo en **morado**; botón principal **lima** solo en la recomendada; precio en Funnel Display | Sección de precios (`#precios`) |
| 04 | `04-cta-final.webp` | Tarjeta grande redondeada con collage de pantallas tintado de color; título centrado; botón; nota pequeña ("No card needed") | Collage de **nuestros trabajos** tintado de morado; nota: *"30 minutos, sin costo"* | CTA final de cada página |
| 05 | `05-mega-menu.webp` | Menú en barra con ítem activo resaltado; desplegable grande con tarjetas de vista previa + título + descripción; botón principal a la derecha | Desplegable "Servicios" con 3 tarjetas: Páginas que venden · Catálogos y sistemas · Portafolio | Header |

### Lo que **no** se toma

- El **azul eléctrico** de 21st: se reemplaza por morado (brillos) y lima (CTA).
- Las **tarjetas de colores claros** de la sección "Built for how you ship" (coral, rosa): rompen la regla de solo fondo oscuro (D-025).
- La **búsqueda ⌘K** y el "Log in": el sitio no los necesita.

### Tipografía al estilo de la referencia

Títulos muy grandes, en negrita, con **tracking negativo** (−0.03 a −0.04 em) e interlineado ajustado (~1.0). Se logra con **Funnel Display Bold**, sin cambiar de fuente (D-025).

---

## 10. Implementación en código (D-057, D-062)

| Pieza | Archivo | Qué hace |
|---|---|---|
| Tokens | `tailwind.config.ts` | Colores `surface-1/2/3`, `fog`, `fog-dim`, `brand-soft`; radios `btn` (10) · `frame` (16) · `card` (24); tracking `display` / `heading`; escala `v2-hero` · `v2-h2` · `v2-h3` · `v2-lead`; sombra `glow-purple`; opacidad `8` |
| Clases base | `app/globals.css` (bloque v2) | `.v2-card`, `.v2-frame`, `.v2-spotlight`, `.v2-shine`, `.v2-glow`, `.v2-grid`, `.v2-faq`, `.v2-progress-fill`, `.v2-pop` |
| Contenido | `content/inicio.ts`, `content/proyectos.ts` | Copy aprobado y portafolio. **Para cambiar un texto o sumar un proyecto, se edita aquí**, no en los componentes |
| Botón | `components/v2/Button.tsx` | `primary` · `secondary` · `ghost`; `md` / `lg`; `arrow`; `external` |
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
| Animación ligada al scroll: **un solo listener pasivo** que escribe una variable CSS (`--p`), activo solo mientras la sección se ve; lo demás es `calc()` en CSS | Sin listeners por elemento ni reflow (`ScrollPaint`, D-067) |

