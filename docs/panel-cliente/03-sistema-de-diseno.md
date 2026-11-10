# 03 — Sistema de diseño del panel

| Estado | Versión | Última actualización | Aprueba |
|---|---|---|---|
| En revisión | 0.1 | 10 nov 2026 | Sergio |

El panel usa **el mismo sistema v2 del sitio** (`docs/blueprint/04-sistema-de-diseno.md`, tokens en `tailwind.config.ts`). Aquí solo va lo propio del panel.

---

## 1. Color

| Uso | Token | Valor |
|---|---|---|
| Fondo de página | `ink` | `#03010B` (único fondo, igual que el sitio v2) |
| Barra lateral y pestañas | — | `#06040F` (un paso más claro que ink) |
| Tarjetas | `surface-1` + borde blanco 7 % | `#0A0714` |
| Elevado, hover, campos activos | `surface-2` | `#110C20` |
| Hojas (modales) y tooltips | `surface-3` | `#18112D` |
| Texto principal / secundario / notas | `white` / `fog` / `fog-dim` | `#FFF` / `#B4AECB` / `#8A84A8` |
| Acción principal, dato destacado, "sube" | `lime` | `#B6FF00` |
| Gráficos, selección, foco de campos | `brand` | `#7D53FF` |
| Etiquetas moradas sobre oscuro | `brand-soft` | `#B9A4FF` |
| **"Baja", error, vencido** (solo panel) | — | fondo `#FF6B8B` al 10 %, texto `#FF9BB0` |
| Fase "En revisión" (solo panel) | — | `#FFC76B` (punto y franja, nunca texto largo) |

Reglas:
- **Un solo botón lima por vista** (la acción principal del módulo: Agregar cliente, Nuevo proyecto, Guardar cambios).
- En gráficos, **morado** para la serie y **lima** para lo que hay que mirar (último dato, primer lugar, último paso del embudo).
- Rosa solo para malas noticias. Nunca como decoración.

## 2. Tipografía

| Elemento | Fuente | Tamaño |
|---|---|---|
| Título del módulo (`h1`) | Funnel Display Bold | `clamp(1.6rem, 3.2vw, 2.4rem)` |
| Título de tarjeta (`h2`) | Funnel Display Bold | 16–18 px |
| Cifra principal | Funnel Display Bold | `clamp(1.5rem, 2.6vw, 2rem)` |
| Texto, etiquetas, tablas | Plus Jakarta Sans | 12–15 px |
| Campos de formulario | Plus Jakarta Sans | **16 px en celular** (iOS no hace zoom), 14 px desde 640 px |

## 3. Marco

| | Celular | Escritorio (≥ 1024 px) |
|---|---|---|
| Navegación | Pestañas abajo (64 px + zona segura), barra superior de 56 px con vidrio | Barra lateral fija de 248 px |
| Márgenes | 16 px | 40 px |
| Ancho máximo del contenido | — | 1280 px |
| Espacio abajo | 112 px (para no tapar con las pestañas) | 48 px |

## 4. Componentes (`components/panel/`)

| Componente | Archivo | Uso |
|---|---|---|
| `PanelShell` | `PanelShell.tsx` | Marco: barra lateral, pestañas, franja de demo |
| `PanelPage`, `PanelHeader` | `ui.tsx` | Contenedor y encabezado (h1 + bajada + acción) de cada módulo |
| `Tarjeta` | `ui.tsx` | Caja base (`v2-card`), título, bajada y acción opcional |
| `Delta` | `ui.tsx` | Variación vs. periodo anterior (lima ↑ / rosa ↓) |
| `Pill` | `ui.tsx` | Estado en píldora: `lima`, `morado`, `neutro`, `alerta` |
| `Segmentado` | `Resumen.tsx` | Selector tipo iOS (periodo, métrica). `role="radiogroup"` |
| `Hoja` | `Clientes.tsx` | Panel lateral en escritorio / hoja desde abajo en celular. Escape y clic afuera cierran, bloquea el scroll, devuelve el foco |
| Campos | clase `.pn-input` | 44 px de alto, borde fino, foco morado con halo |

La primera cifra del Resumen (Ventas) usa `v2-glass` (vidrio con luz morada) para marcarla como la más importante. Las demás, `v2-card`.

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
