# 03 — Sistema de diseño del panel

| Estado | Versión | Última actualización | Aprueba |
|---|---|---|---|
| En revisión | 0.2 | 19 nov 2026 | Sergio |

El panel usa **el mismo sistema v2 del sitio** (`docs/blueprint/04-sistema-de-diseno.md`, tokens en `tailwind.config.ts`). Aquí solo va lo propio del panel.

---

## 1. Color (D-136: más sobrio, con superficies en capas)

> El panel tiene sus propias superficies (en `tailwind.panel.config.ts`), un paso más claras y menos saturadas que las del sitio, para que las tarjetas se separen del fondo. El sitio no cambia.

| Capa | Token / clase | Valor |
|---|---|---|
| Marco y barra lateral | `ink` | `#03010B` |
| Zona de contenido | `canvas` | `#0A0813` |
| Tarjeta | `surface-1` (+ `.v2-card` del panel: degradado muy suave, borde blanco 7 %, radio 20 px) | `#100D1A` |
| Detalle dentro de una tarjeta, hover, campos | `surface-2` | `#161226` |
| Ventanas, menús y tooltips | `surface-3` | `#1D1832` |
| Texto principal / secundario / notas | `white` / `fog` / `fog-dim` | `#FFF` / `#B4AECB` / `#8A84A8` |
| **Actuar y elegir** (botón principal, selección, foco, interruptores, íconos de interfaz) | `brand` / `brand-soft` | `#7D53FF` / `#B9A4FF` |
| **Destacar un dato** (sube, completado, nuevo, ganancia, último punto) | `lime` | `#B6FF00` |
| "Baja", error, vencido (solo panel) | — | fondo `#FF6B8B` al 10 %, texto `#FF9BB0` |
| Fase "En revisión" (solo panel) | — | `#FFC76B` (punto y franja, nunca texto largo) |

Reglas:
- **El botón principal es morado** (`.pn-primario`: `#7D53FF` con texto blanco, 4,6:1). Uno por vista. Antes era lima y hacía ver el panel "neón".
- **El lima solo destaca un dato, en dosis pequeñas.** Nunca en botones, íconos de menú, enlaces, interruptores ni fondos grandes.
- Sin luces de color de fondo, sin desenfoque en las tarjetas y sin el brillo que recorre los botones (`v2-shine` queda apagado dentro del panel).
- En gráficos, **morado** para la serie; **lima** solo para el punto o el valor que hay que mirar (último dato, primer lugar). Las barras verticales van apagadas y la elegida (la que tocas o la última) va en morado con un punto lima.
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
- **Barra superior del contenido** (pegajosa): negocio + "Panel" a la izquierda y la campana a la derecha. El vidrio de la barra va en una capa de fondo aparte: si la barra tuviera `backdrop-filter`, la ventana de notificaciones (`position: fixed` en celular) quedaría atrapada en ella.

**Celular:** barra arriba (logo, campana, cuenta) + 5 pestañas abajo; la activa lleva ícono morado y una raya morada arriba.

| | Celular | Escritorio (≥ 1024 px) |
|---|---|---|
| Navegación | Pestañas abajo (64 px + zona segura), barra superior de 56 px | Barra lateral fija de 248 px |
| Márgenes del contenido | 16 px | 40 px |
| Ancho máximo del contenido | — | 1280 px |
| Espacio abajo | 112 px (para no tapar con las pestañas) | 48 px |

### Acceso (login y doble factor)
Tarjeta dividida de hasta 1040 px: a la izquierda una **esfera de luz hecha solo con CSS** (morado de marca, un filo y un reflejo lima; flota y gira suave; 0 KB de imagen, sin JavaScript; quieta con movimiento reducido) con el logo; a la derecha el formulario. En celular la escena queda arriba, más baja. `components/panel/acceso/EscenaAcceso.tsx` + `.pn-escena` en `styles/panel.src.css`.

> Texto nuevo ◻ por aprobar: "Ventas, clientes y proyectos de tu negocio en un solo lugar." (escena del login) y la etiqueta "Panel privado".

## 4. Componentes (`components/panel/`)

| Componente | Archivo | Uso |
|---|---|---|
| `PanelShell` | `PanelShell.tsx` | Marco: barra lateral, barra superior, pestañas, franja de demo |
| `PanelPage`, `PanelHeader` | `ui.tsx` | Contenedor y encabezado (h1 + bajada + acción) de cada módulo |
| `Tarjeta` | `ui.tsx` | Caja base (`v2-card`), título, bajada, acción y **ícono opcional** en cuadrito (`icono`) |
| `Delta` | `ui.tsx` | Variación vs. periodo anterior (lima ↑ / rosa ↓) |
| `Pill` | `ui.tsx` | Estado en píldora: `lima`, `morado`, `neutro`, `alerta` |
| `Segmentado` | `Resumen.tsx` | Selector tipo iOS (periodo, métrica). `role="radiogroup"` |
| `Hoja` | `Clientes.tsx` | Panel lateral en escritorio / hoja desde abajo en celular. Escape y clic afuera cierran, bloquea el scroll, devuelve el foco |
| Campos | clase `.pn-input` | 44 px de alto, borde fino, foco morado con halo |
| Botón principal | clase `.pn-primario` | Morado de marca, texto blanco. Se combina con `h-11 rounded-btn px-5 text-sm font-semibold` |
| Cuadrito de ícono | clase `.pn-icono` | 36 px, borde fino, ícono `brand-soft`. Al inicio de cada cifra y de las tarjetas con `icono` |

La primera cifra del Resumen (Ventas) usa `v2-glass`, que dentro del panel es la misma tarjeta con un filo morado arriba (sin desenfoque ni luz de fondo). Las demás, `v2-card`.

## 5. Gráficos (`components/panel/graficos.tsx`)

SVG propio, **sin librerías** (CLAUDE.md §9). Estética dashboard-premium.

| Gráfico | Dónde | Detalles |
|---|---|---|
| `GraficoArea` | Cómo van las ventas | Curva suave, relleno morado que se desvanece, rejilla punteada al 6 %, eje Y con techo "bonito", punto lima con halo en el último dato, tooltip al tocar/pasar |
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
- Contraste: textos en `white`, `fog` o `fog-dim` sobre ink/surface (AA o más).
