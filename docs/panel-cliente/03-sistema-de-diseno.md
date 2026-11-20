# 03 — Sistema de diseño del panel

| Estado | Versión | Última actualización | Aprueba |
|---|---|---|---|
| Aprobado | 0.4 | 20 nov 2026 | Sergio |

El panel usa **el mismo sistema v2 del sitio** (`docs/blueprint/04-sistema-de-diseno.md`, tokens en `tailwind.config.ts`). Aquí solo va lo propio del panel.

> **Desde el 20 nov 2026 el panel y el sitio siguen el mismo sistema** ([`docs/sistema-de-diseno.md`](../sistema-de-diseno.md), D-149): fondo `#020104`, tarjetas transparentes, morado solo en botones, lima solo en datos, sin íconos decorativos y con íconos Phosphor. Las piezas comunes (botón principal, tarjetas) están **copiadas** en `app/globals.css` y `styles/panel.src.css` porque el CSS del panel se compila aparte (D-135): si cambias una, cambia la otra. Lo propio del panel es el **modo claro** (§1).

---

## 1. Color y temas (D-149: mismo sistema que el sitio, con modo claro)

> **La fuente es [`docs/sistema-de-diseno.md`](../sistema-de-diseno.md)** (sistema único de Arata San). Aquí solo va cómo se aplica en el panel.

El panel tiene **dos temas**: **oscuro** (por defecto) y **claro**. Se cambia con el **interruptor de sol y luna** de la barra de arriba, **al lado de la campana** (D-152; `components/panel/InterruptorTema.tsx`, `role="switch"`, perilla que se desliza con `transform`). Se guarda un año en la cookie `pn-tema`, y el servidor pone el tema en `data-tema` de `.pn-root`, así que no hay destello al abrir (`lib/panel/tema.ts`, `app/(panel)/panel/layout.tsx`). **El acceso (login y doble factor) va siempre en oscuro.**

| Capa | Token | Oscuro | Claro |
|---|---|---|---|
| Marco y barra lateral | `noche` | `#020104` | `#F2F2F5` |
| Zona de contenido | `canvas` | `#08080A` | `#FAFAFB` |
| Tarjeta (`.v2-card`) | variables `--pn-tarjeta*` | **negra con humo** (D-153, igual al sitio): degradado `#0E0E10`→`#060607`, nube blanca suave, borde blanco 13 % | blanca con humo de tinta 3,5 % + borde tinta 10 % + sombra suave |
| Tarjeta destacada (`.v2-glass`) | `--pn-destacada*` | más humo + borde blanco 42 % | blanca + borde tinta 32 % |
| Píldora (`.pn-pildora`) | `--pn-pildora*` | **verde de Arata (D-154)**: negra con degradado, borde lima 40 %, texto lima (`--pn-pildora-texto`) | blanca + borde tinta 16 %, texto gris |
| Superficies sólidas | `surface-1/2/3` | `#0F0F12` · `#16161A` · `#1D1D22` | `#FFF` · `#F3F3F6` · `#FFF` |
| Texto principal / secundario / notas | `white` / `fog` / `fog-dim` | `#FFF` / `#B4AECB` / `#8A84A8` | `#03010B` / `#52505C` / `#686572` |
| **Datos** (sube, completado, nuevo) | `dato` (texto) · `lime` (relleno con texto ink) | `#B6FF00` | **morado** (D-151): texto `#6D45F0`, relleno `#9B7BFF` |
| **Botones y lo que actúa como botón** | `brand` | `#7D53FF` | igual |
| Malas noticias | `alerta` · `alerta-fuerte` | `#FF9BB0` · `#FF6B8B` | `#BE123C` · `#E11D48` |
| "En revisión" | `ambar` | `#FFC76B` | `#A16207` |

Reglas:
- **Todos los colores que cambian con el tema son variables** (canales RGB en `styles/panel.src.css`, bloque "Temas del panel"), y `tailwind.panel.config.ts` los usa. Por eso `text-white`, `bg-white/5` y `border-white/10` se vuelven tinta en claro. **Nunca escribir colores fijos** (`text-[#…]`, `rgba(255,255,255,…)`) en un componente del panel: usar los tokens o `rgb(var(--pn-…))` en SVG y estilos en línea. Fijos en los dos temas: `brand`, `lime` como fondo, `ink` y `blanco` (texto sobre morado).
- **El morado es solo para botones** y lo que actúa como botón: botón principal (`.pn-primario`), filtro y pestaña activa, interruptor encendido, marca de la opción del menú, foco de los campos. Nunca en tarjetas, avatares, barras de avance, gráficos ni íconos.
- **El lima solo destaca un dato.** En claro el dato va en **morado** (D-151, decisión de Sergio): `text-dato` `#6D45F0` y `lime` `#9B7BFF` (los dos son variables, cambian solos con el tema).
- **Sin íconos decorativos**: las cifras van sin cuadrito de ícono (`.pn-icono` ya no se usa). Íconos con **Phosphor `light`** desde `components/panel/iconos.tsx` (D-149; antes Lucide).
- Sin luces de color, sin desenfoque en las tarjetas y sin brillos.
- En gráficos, la serie va en **blanco** (tinta en claro) y el lima marca el dato a mirar. Ver §5.
- Rosa solo para malas noticias. Nunca como decoración.

## 2. Tipografía

| Elemento | Fuente | Tamaño |
|---|---|---|
| Título del módulo (`h1`) | Funnel Display Bold | `clamp(1.6rem, 3.2vw, 2.4rem)` |
| Título de tarjeta (`h2`) | Funnel Display Bold | 16–18 px |
| Cifra principal | Funnel Display Bold | `clamp(1.5rem, 2.6vw, 2rem)` |
| Texto, etiquetas, tablas | Plus Jakarta Sans | 12–15 px |
| Campos de formulario | Plus Jakarta Sans | **16 px en celular** (iOS no hace zoom), 14 px desde 640 px |

## 3. Marco (D-136, reemplaza el menú en píldora de D-120)

**Escritorio (≥ 1024 px):** barra lateral fija de 248 px a la izquierda y el contenido en una zona más clara (`canvas`) con las esquinas de 28 px y 12 px de aire alrededor.

- **Barra lateral:** logo · grupo **Menú** (Resumen, Clientes, Proyectos, Finanzas solo agencia) · grupo **General** (Configuración: Ajustes del sitio, Equipo y Notificaciones) · **tarjeta de la cuenta** abajo (inicial, nombre, correo; abre hacia arriba: ver mi página, escribirle a Arata San —solo clientes—, salir).
- **Selector que se desliza** detrás de la opción activa (solo `transform`, respeta movimiento reducido) con una marca morada al borde izquierdo.
- **Barra superior del contenido** (pegajosa): negocio + "Panel" a la izquierda y, a la derecha, el **interruptor de modo claro/oscuro** y la campana (D-152). El vidrio de la barra va en una capa de fondo aparte: si la barra tuviera `backdrop-filter`, la ventana de notificaciones (`position: fixed` en celular) quedaría atrapada en ella.

**Celular:** barra arriba (logo, campana, cuenta) + 5 pestañas abajo; la activa lleva una raya morada arriba (es navegación: cuenta como botón).

| | Celular | Escritorio (≥ 1024 px) |
|---|---|---|
| Navegación | Pestañas abajo (64 px + zona segura), barra superior de 56 px | Barra lateral fija de 248 px |
| Márgenes del contenido | 16 px | 40 px |
| Ancho máximo del contenido | — | 1280 px |
| Espacio abajo | 112 px (para no tapar con las pestañas) | 48 px |

### Acceso (login y doble factor)
Tarjeta dividida de hasta 1040 px, **siempre en oscuro**: a la izquierda una **esfera de luz hecha solo con CSS** (plateada desde D-149, antes morada; con un filo y un reflejo lima; flota y gira suave; 0 KB de imagen, sin JavaScript; quieta con movimiento reducido) con el logo; a la derecha el formulario. En celular la escena queda arriba, más baja. `components/panel/acceso/EscenaAcceso.tsx` + `.pn-escena` en `styles/panel.src.css`.

> Texto nuevo ◻ por aprobar: "Ventas, clientes y proyectos de tu negocio en un solo lugar." (escena del login) y la etiqueta "Panel privado".

## 4. Componentes (`components/panel/`)

| Componente | Archivo | Uso |
|---|---|---|
| `PanelShell` | `PanelShell.tsx` | Marco: barra lateral, barra superior, pestañas, franja de demo |
| `PanelPage`, `PanelHeader` | `ui.tsx` | Contenedor y encabezado (h1 + bajada + acción) de cada módulo |
| `Tarjeta` | `ui.tsx` | Caja base (`v2-card`), título, bajada y acción. La prop `icono` ya no pinta nada (D-149) |
| `Delta` | `ui.tsx` | Variación vs. periodo anterior (lima ↑ / rosa ↓) |
| `Pill` | `ui.tsx` | Estado en píldora: `lima` (relleno lima suave: el estado bueno), `neutro` y `morado` (= `.pn-pildora`: en oscuro contorno lima, D-154), `alerta`. Los filtros y pestañas sin elegir también son `.pn-pildora`; el elegido va en morado (actúa como botón) |
| `IconoMarca` | `IconosMarca.tsx` | Íconos SVG propios en grises (capas, tienda, sistema), copia de los del sitio. Solo en las tarjetas de proyecto de Arata, según el servicio (`iconoDeServicio()`); si el servicio no encaja, no se pinta nada (D-153) |
| `Segmentado` | `Resumen.tsx` | Selector tipo iOS (periodo, métrica). `role="radiogroup"` |
| `Hoja` | `Clientes.tsx` | Panel lateral en escritorio / hoja desde abajo en celular. Escape y clic afuera cierran, bloquea el scroll, devuelve el foco |
| Campos | clase `.pn-input` | 44 px de alto, borde fino, foco morado con halo |
| Botón principal | clase `.pn-primario` | Morado de marca, texto blanco. Se combina con `h-11 rounded-btn px-5 text-sm font-semibold` |
| Íconos | `iconos.tsx` | Phosphor `light` con los nombres que usaba Lucide (D-149). Sin íconos decorativos |

La primera cifra del Resumen (Ventas) usa `v2-glass`, que dentro del panel es la tarjeta destacada (un paso más clara y con borde más visible, sin morado). Las demás, `v2-card`.

## 5. Gráficos (`components/panel/graficos.tsx`)

SVG propio, **sin librerías** (CLAUDE.md §9). Estética dashboard-premium.

| Gráfico | Dónde | Detalles |
|---|---|---|
| `GraficoArea` | Cómo van las ventas | Curva suave en blanco (tinta en claro), relleno que se desvanece, rejilla punteada al 6 %, eje Y con techo "bonito", punto lima con halo en el último dato, tooltip al tocar/pasar |
| `Sparkline` | Cifras principales | Línea mínima, sin ejes |
| `Anillo` | Clientes que compran | Arco con punta redondeada y punto en la punta, número XL centrado |
| `Embudo` | Clientes que compran | Barras de 36 px que se acortan; "X % pasa" entre pasos; último paso lima |
| `BarrasHorizontales` | Fuentes, productos | Barra de 8 px con punta redonda; primera en lima |
| `BarrasVerticales` | Instagram | Columnas con punta redonda; última semana en lima; valor al pasar |

Todos se dibujan al entrar en vista con `onInView` (`lib/inview.ts`) y llevan `role="img"` + `aria-label` o `aria-hidden` si el dato ya está en texto al lado.

## 6. Movimiento

- Solo `transform`, `opacity` y el trazo del SVG (`stroke-dashoffset`). Clases `.pn-fade`, `.pn-trazo`, `.pn-barra`, `.pn-columna`, `.pn-hoja` en `globals.css`.
- Hojas: suben desde abajo en celular, entran desde la derecha en escritorio (0,35 s).
- Con `prefers-reduced-motion`: todo aparece ya dibujado, sin transiciones.

## 7. Palabras del panel

Reglas de CLAUDE.md §2 + estas, porque el cliente no es técnico:

| No usar | Usar |
|---|---|
| Conversión / tasa de conversión | **Clientes que compran** ("de cada 100 visitas, X compran") |
| Sesiones / tráfico | Visitas |
| Impresiones / views | Visualizaciones |
| Reach | Cuentas alcanzadas |
| Engagement | Interacciones |
| Leads | Clientes / personas interesadas |
| SEO / meta title / meta description | "Cómo sale en Google": título y descripción |
| Hero | Portada |
| CTA | Botón |
| Dashboard | Resumen |
| Kanban / backlog | Proyectos / Por hacer |
| Churn / inactivo | Inactivo ("no ha vuelto a comprar") |

Tono: tú, frases cortas, sin signos de admiración de más. Los mensajes de error dicen qué hacer ("Revisa el teléfono: debe tener al menos 7 números"), no qué salió mal.

## 8. Accesibilidad

- Áreas táctiles de 44 px mínimo (botones, campos, casillas de tareas).
- Foco visible lima en todo (regla global) y halo morado en campos.
- Todo lo que se hace arrastrando se puede hacer con botones (flechas en proyectos).
- Selectores con `role="radiogroup"/"radio"`, interruptor con `role="switch"`, casillas con `role="checkbox"`, pestañas con `role="tab"`.
- Contraste AA o más en los **dos temas**: textos en `white`, `fog` o `fog-dim`; en claro el dato pasa a morado (`#6D45F0`, 5,6:1; rellenos `#9B7BFF` con texto ink, 6,4:1).
