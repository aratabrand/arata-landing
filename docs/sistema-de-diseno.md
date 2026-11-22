# Sistema de diseño de Arata San

| Estado | Versión | Última actualización | Aprueba |
|---|---|---|---|
| Aprobado (D-145 a D-156) | 1.6 | 20 nov 2026 | Sergio |

**Es la fuente única para todos los productos de Arata San.** Hoy se aplica a dos productos:

- **El sitio** (aratasan.com, la landing de la agencia).
- **El panel** (`panel.aratasan.com`).

Todo producto nuevo (una página de cliente, una app a la medida) arranca de aquí.

Los documentos de cada producto solo explican cómo se aplica allí, sin repetir lo que dice este:

- Sitio: [`blueprint/04-sistema-de-diseno.md`](blueprint/04-sistema-de-diseno.md) (componentes, historial de decisiones y reglas de velocidad aprendidas).
- Panel: [`panel-cliente/03-sistema-de-diseno.md`](panel-cliente/03-sistema-de-diseno.md) (marco, módulos, gráficos y palabras).

---

## 1. La idea

Arata San vende páginas y sistemas de alto valor. El diseño tiene que verse **sobrio, premium y hecho a mano, no "hecho con IA"**.

En noviembre de 2026 se probaron varias direcciones (D-137 a D-148). Estas son las cosas que delataban el "look de IA" y por eso **no se usan**:

| No | Por qué |
|---|---|
| Morado brillante sobre negro con tinte morado, luces moradas grandes | Es la paleta de casi todas las plantillas de herramientas de IA |
| Cuadrícula de fondo | Recurso de plantilla |
| Cuadritos con ícono en cada tarjeta | Lo primero que delata una plantilla; se reemplazan por números o nada. Solo **algunas** tarjetas llevan un ícono SVG propio en grises (§4) |
| Íconos de Lucide | Los usa casi todo producto hecho con IA; se usa Phosphor en trazo fino |
| Vidrio borroso, brillos que recorren los botones, sombras de color, grano | "Efectos" que no aportan información |
| Bloques grandes de morado con texto blanco, tarjetas blancas sobre oscuro, títulos en dos tonos, botones en píldora con círculo | Se probaron y Sergio los descartó (D-137, D-138) |

**Regla de oro del color:** el **morado** es para lo que se toca, es decir los botones. El **lima** es para los datos. **Todo lo demás va en blanco, grises y negro.**

---

## 2. Color

### 2.1 Marca (no cambia)

| Token | Valor | Uso |
|---|---|---|
| `brand` (morado) | `#7D53FF` | **Solo botones** y lo que actúa como botón: opción elegida, interruptor encendido, filtro activo, pestaña activa, foco de un campo |
| `lime` (lima) | `#B6FF00` | **Solo datos**: cifras que suben, completado, "nuevo", el último punto de un gráfico. Como fondo, siempre con texto `ink` |
| `ink` | `#03010B` | Texto sobre lima. Texto principal en claro |

### 2.2 Tema oscuro (sitio y panel por defecto)

| Token | Valor | Uso |
|---|---|---|
| `noche` | `#020104` | **Fondo de página**: negro casi neutro, sin tinte morado (D-145) |
| `canvas` | `#08080A` | Zona de contenido del panel |
| Tarjeta | **negra con humo** (D-150): degradado `#0E0E10` → `#060607`, una nube blanca muy suave abajo a la derecha (5,5 %), borde blanco al 13 % y filo de luz arriba | `.v2-card` en el sitio y en el panel (D-153; en el panel por la variable `--pn-tarjeta`) |
| Tarjeta destacada | negra con **más humo** (varias nubes blancas abajo, hasta 14 %) y **borde blanco al 42 %** (D-150) | `.v2-destacada` en el sitio, `.pn-root .v2-glass` en el panel (D-153): lo que queremos que elijan o mirar primero. Una o dos por vista |
| `surface-1/2/3` | `#0B0B0D` · `#121215` · `#19191D` (sitio); `#0F0F12` · `#16161A` · `#1D1D22` (panel) | Superficies sólidas: menús, ventanas, botón secundario |
| Texto | `white` `#FFFFFF` · `fog` `#B4AECB` · `fog-dim` `#8A84A8` | Títulos · párrafos · notas (20:1 · 9,8:1 · 5,9:1) |
| Alerta / ámbar | `#FF9BB0` · `#FFC76B` | Solo malas noticias / "en revisión" |

### 2.3 Tema claro (panel, D-149; grises cálidos y acentos lima desde D-159)

| Token | Valor | Uso |
|---|---|---|
| `noche` | `#ECEDE7` (D-159, gris cálido; antes `#F2F2F5`) | Marco y barra lateral, con un brillo lima suave al pie |
| `canvas` | `#F5F5F1` (D-159; antes `#FAFAFB`) | Zona de contenido |
| `surface-2` / píldoras | `#EFEFE9` sólido, sin borde marcado | Chips, estados neutros, filtros sin elegir |
| Tarjeta | blanca + borde tinta al 8 % + sombra muy suave | Se separa del fondo sin bloques de color |
| Tarjeta destacada | **Degradado lima** (`#E3FF8A` → `#C8F53A` → `#A8E33A`) con brillo blanco, texto `ink` (D-159). Una por vista: la cifra principal | Los grises de adentro se oscurecen para leerse sobre el lima |
| Opción elegida del menú | **Píldora negra** (`ink`) con texto blanco y el ícono en lima (D-159) | |
| Píldora activa (filtros, 7/30/90 días, pestañas) | **Relleno lima** con texto `ink` (D-159; antes morado) | |
| Texto | `ink` `#03010B` · `#52505C` · `#686572` | 20:1 · 7,8:1 · 5,6:1 sobre blanco |
| Dato | **Morado** (D-151, decisión de Sergio: no verde) | Texto `#6D45F0` (5,6:1 sobre blanco); rellenos (barras, etiquetas) `#9B7BFF` con texto `ink` encima (6,4:1). El lima `#B6FF00` no se lee sobre blanco. En claro el morado marca botones **y** datos; los distingue la forma (un botón es un botón) |
| Alerta / ámbar | `#BE123C` · `#A16207` | |
| Botón principal | **Lima con texto `ink`** (17:1) en claro (D-159); en oscuro sigue morado con texto blanco | |

**Cómo lo hace el código:** los colores que cambian con el tema son variables CSS (canales RGB) que lee la configuración de Tailwind del panel. Así `text-white`, `bg-white/5` y `border-white/10` se vuelven tinta en claro sin tocar cada componente.

Sitio: el sitio solo tiene tema oscuro.

---

## 3. Tipografía

| Uso | Fuente |
|---|---|
| Títulos y cifras | **Funnel Display** 700 (la v1 usaba 800 en el hero) |
| Texto, etiquetas, botones | **Plus Jakarta Sans** 400–600 |
| Campos de formulario | 16 px en celular (iOS no hace zoom) |

Ambas van auto-hospedadas con `next/font/local` (sin red), **una fuente variable por familia recortada a los caracteres del español** (D-156, D-158): títulos 600–800 y texto 400–700, 2 archivos en total (25 KB), los dos precargados. Los títulos van en un solo tono, sin degradados ni contornos.

---

## 4. Componentes comunes

| Componente | Cómo es | Sitio | Panel |
|---|---|---|---|
| **Botón principal** | Rectangular, radio 10 px, morado con texto blanco y filo de luz arriba; 44 px mínimo. Uno por vista | `Button` / `.v2-primario` | `.pn-primario` |
| **Botón secundario** | Superficie oscura con borde fino (en claro: blanco con borde) | `Button variant="secondary"` | `BotonSecundario` |
| Botón de texto | Texto con flecha que se corre al pasar el mouse | `variant="ghost"` | enlaces |
| **Tarjeta** | Negra con humo y borde gris (oscuro) / blanca con un humo de tinta casi invisible (claro), radio 20–24 px (D-150, D-153) | `.v2-card` | `.v2-card` del panel |
| **Tarjeta destacada** | Más humo y borde más visible (42 % en oscuro, 32 % en claro), **sin morado** | `.v2-destacada` | `.v2-glass` del panel |
| **Lista con números** | `01`, `02`… en Funnel Display en vez de íconos | Problema, "Todo lo que trae" | — |
| **Píldora** (badge, etiqueta de sección, "Recomendado", filtros) | Negra con degradado sutil, **borde blanco al 24 %**, texto blanco (`.v2-pildora`, D-150); "en vivo" con punto lima que titila. La etiqueta de sección (`Eyebrow`) es una píldora. En el panel: estados neutros y filtros sin elegir (D-153); el filtro elegido va en morado porque actúa como botón. **Variante del panel (D-155):** la píldora, pestaña o selector **activo** (filtros, 7/30/90 días, secciones de Finanzas) va en el verde de Arata (`.pn-pildora-activa`: borde lima 55 %, texto lima, tinte lima suave; en claro, morado), las demás grises. Los **estados** van en **semáforo**: ámbar (nuevo), verde (activo, a tiempo, cerrado), verde fuerte (recurrente), rojo (inactivo, tarde). El verde de semáforo (`#4ADE80`; en claro `#15803D`) no es el lima de Arata | `Badge`, `Eyebrow`, `.v2-pildora` | `.pn-pildora`, `.pn-pildora-activa`, `Pill` |
| **Íconos de marca** | SVG propio en **grises metálicos con volumen** (capas, tienda, sistema), sin color. **Solo en algunas tarjetas** donde ayudan a distinguir opciones (hoy: paquetes de precio). Nunca en todas | `components/v2/IconosMarca.tsx` (paquetes de precio) | `components/panel/IconosMarca.tsx` (tarjetas de proyecto según el servicio, `iconoDeServicio()`, D-153) |
| **Íconos** | **Phosphor** en trazo `light` (check en `regular`; play/pausa en `fill`). Solo los que cumplen una función: flechas, abrir y cerrar, menú, acciones, estados. **Nunca decorativos** | `components/v2/iconos.tsx` | `components/panel/iconos.tsx` |
| Campo | 44 px, borde fino, foco morado con halo | `BookingFlow` | `.pn-input` |
| Interruptor | Encendido en morado (es un botón) | Cookies | Ajustes |

Las piezas que existen en los dos productos están **copiadas, no compartidas**: el panel no importa piezas del sitio (D-135). Por eso, si se cambia una pieza común, se cambia en los dos lados.

---

## 5. Fondo

| | Sitio | Panel |
|---|---|---|
| Fondo | `#020104` | `noche` + `canvas` (oscuro o claro) |
| Líneas | **Líneas verticales** cada 80 px, centradas, blancas al 4,5 %, **continuas en toda la página** (`.v2-fondo`, fijo); se desvanecen a los lados. **Nunca cuadrícula** | No (es una herramienta de trabajo) |
| Haces de luz | Luces finas que bajan por algunas líneas, a los lados del texto | No |
| Luces | **Blancas y muy suaves** detrás de algunas secciones (6,5 % al centro) | No |
| Humo en tarjetas | Sí: nubes blancas muy suaves dentro de las tarjetas (solo gradientes, sin `filter: blur`) | No |
| Grano, vidrio, sombras de color | No | No |

---

## 6. Gráficos (estética dashboard-premium)

- SVG propio, sin librerías.
- La serie va en **blanco** (tinta en claro), con barras apagadas al 9 %.
- **El lima solo marca el dato que hay que mirar**: el último punto, el primer lugar o lo completado.
- Sin morado, salvo los colores de categoría que necesitan distinguirse (personas en el reparto). Para eso hay una paleta fija sin morado: gris, azul, ámbar, verde agua y rosa.
- Los gráficos se dibujan al entrar en vista y respetan el movimiento reducido.

---

## 7. Movimiento

- Solo se anima `transform` y `opacity`.
- **Siempre** se respeta `prefers-reduced-motion`.
- El título principal (LCP) **no se anima**.
- Los detalles (haces, flechas) arrancan después de abrir la página.

---

## 8. Velocidad (reglas que nacieron de medir)

- Texturas o ruido: en `<canvas>` pintado después de abrir, **nunca** un SVG con `feTurbulence` como fondo, porque retrasa el título.
- Fondos fijos de página completa **sin `mask-image`**: se desvanecen con una capa del color del fondo.
- Imágenes grandes que se mueven: en `<canvas>`, porque así no cuentan para el LCP.
- Íconos: la versión SSR de Phosphor, importada por nombre.
- Imágenes: `sizes` con el ancho real (restando márgenes) y carruseles que montan solo la imagen que se ve (D-157).
- Fuentes: **una variable por familia**, recortada al español y al rango de pesos que se usa, y precargada (D-156, D-158). Nunca un archivo por peso.
- Meta: PageSpeed móvil ≥ 90 en la URL publicada. El resto de reglas está en [`blueprint/04-sistema-de-diseno.md`](blueprint/04-sistema-de-diseno.md) §12.

---

## 9. Cómo aplicarlo a un producto nuevo

1. **Fondo y colores:** copiar los tokens de §2 (oscuro; claro si es una herramienta de uso diario) y las variables del tema si lleva modo claro (`styles/panel.src.css`, bloque "Temas del panel").
2. **Botones:** principal morado (copiar `.pn-primario` o `.v2-primario`) y secundario oscuro. Nada más en morado.
3. **Tarjetas:** transparentes con borde fino. La destacada, más clara, **sin color**.
4. **Íconos:** crear el `iconos.tsx` del producto con Phosphor `light` y solo los íconos que cumplen una función.
5. **Datos en lima**, todo lo demás en blanco y grises.
6. **Revisar contra §1:** que no haya cuadrícula, cuadritos de ícono, luces moradas, vidrio, grano ni brillos.
7. **Medir:** PageSpeed ≥ 90 y contraste AA en los dos temas.
8. **Anotar** en `docs/decisiones.md` toda excepción.

---

## 10. Historial

| Versión | Fecha | Qué |
|---|---|---|
| 1.6 | 20 nov 2026 | Fuentes variables recortadas (2 archivos en vez de 7, D-156); selectores activos del panel en lima (D-155) |
| 1.5 | 20 nov 2026 | Panel: lima solo en la píldora o pestaña activa; estados en semáforo (D-155, reemplaza D-154) |
| 1.4 | 20 nov 2026 | Variante del panel: en oscuro las píldoras van en el verde de Arata (D-154, reemplazada por D-155) |
| 1.3 | 20 nov 2026 | El panel usa las mismas piezas del sitio: tarjetas con humo, píldoras negras con borde e íconos de marca en las tarjetas de proyecto; en claro, su versión blanca (D-153) |
| 1.2 | 20 nov 2026 | En el modo claro del panel el dato va en morado, no en verde (D-151) |
| 1.1 | 20 nov 2026 | Tarjetas negras con humo y borde gris, píldoras negras con borde, íconos SVG propios en grises solo en algunas tarjetas (D-150) |
| 1.0 | 20 nov 2026 | Sistema único para el sitio y el panel: fondo `#020104`, tarjetas transparentes, morado solo en botones, lima solo en datos, sin íconos decorativos, Phosphor, líneas verticales con haces (sitio), modo claro del panel (D-145 a D-149) |
