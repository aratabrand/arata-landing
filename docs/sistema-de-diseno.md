# Sistema de diseño de Arata San

| Estado | Versión | Última actualización | Aprueba |
|---|---|---|---|
| Vigente (hasta D-168 y D-176) | 2.0 | 23 nov 2026 | Sergio |

**Es la fuente única para todos los productos de Arata San**: el sitio (aratasan.com) y el panel (`panel.aratasan.com`). Todo producto nuevo arranca de aquí. Este documento dice **solo lo que está vigente**; las decisiones reemplazadas están en [`decisiones-archivo.md`](decisiones-archivo.md).

- Vistas previas de cada componente, colores en los dos modos y logos: artefacto **«Arata San»** (https://claude.ai/artifact/GtT3zLjfseXgTcjeRkeyih).
- Cómo se aplica en cada producto: sitio en [`blueprint/04-sistema-de-diseno.md`](blueprint/04-sistema-de-diseno.md), panel en [`panel-cliente/03-sistema-de-diseno.md`](panel-cliente/03-sistema-de-diseno.md).

---

## 1. La idea

Limpio, premium y hecho a mano (referencia: **Kept**, D-164). **Un solo estilo por componente**: el mismo en el sitio y en el panel, y en modo oscuro y claro. Por modo solo cambian el fondo, el texto y los bordes, para que todo se lea. Hay **tres excepciones** que pidió Sergio para el modo oscuro del panel:

- El menú elegido y la cuenta van en lima (D-167).
- Los avisos van al revés del fondo (D-168).
- Las cifras grandes van en lima (D-162).

**Regla de color:**

| Color | Para qué |
|---|---|
| **Lima** | Actuar, elegir y destacar |
| **Morado** | Datos y gráficas |
| **Blanco, grises y negro** | Todo lo demás |

**No se usa:**

- Dos estilos para el mismo componente.
- Botones morados.
- Bloques morados con texto blanco.
- Tarjetas blancas sobre oscuro.
- Tarjetas con humo.
- Luces moradas.
- Cuadrícula de fondo.
- Cuadritos con ícono en cada tarjeta.
- Íconos de Lucide.
- Vidrio borroso, grano, brillos que recorren los botones y sombras de color.
- Naranja.

---

## 2. Color

### 2.1 Marca

| Token | Valor | Uso |
|---|---|---|
| `lime` (lima) | `#B6FF00` | Botón principal y opción elegida (con texto `ink`), tarjeta destacada en degradado, ícono del menú elegido, contadores, interruptores encendidos, cifras y palabra en cursiva en oscuro. **Nunca como texto sobre blanco** |
| `brand` (morado) | `#7D53FF` | Gráficas (barras, líneas, anillos) y el dato en claro (`#6D45F0`). **No va en botones** |
| `ink` (tinta) | `#03010B` | Texto sobre lima; menú elegido y cuenta en claro; avisos en claro |

### 2.2 Oscuro (sitio y panel)

| Token | Valor | Uso |
|---|---|---|
| `noche` | `#020104` | Fondo de página |
| `canvas` | `#08080A` | Zona de contenido del panel |
| Tarjeta | `#0F0F12` lisa, borde blanco al 13 %, filo de luz arriba | `.v2-card` (sitio y panel) |
| `surface-1/2/3` | Sitio `#0B0B0D` · `#121215` · `#19191D`; panel `#0F0F12` · `#16161A` · `#1D1D22` | Menús, ventanas, botón secundario |
| Texto | `white` `#FFFFFF` · `fog` `#B8B8BE` · `fog-dim` `#8E8E96` | 20:1 · 10:1 · 6:1. Grises **neutros**, nunca con tinte morado |
| Semáforo | ámbar `#FFC76B` · verde `#4ADE80` · rojo `#FF9BB0` | Estados |

### 2.3 Claro (solo panel)

| Token | Valor | Uso |
|---|---|---|
| `noche` | `#ECEDE7` | Marco y barra lateral (gris cálido) |
| `canvas` | `#F5F5F1` | Zona de contenido |
| Tarjeta | blanca lisa, borde tinta al 12 %, sombra suave | |
| `surface-2` | `#EFEFE9` | Recuadros internos |
| Texto | `ink` · `#52505C` · `#686572` | 20:1 · 7,8:1 · 5,6:1 sobre blanco |
| Dato | morado `#6D45F0` (5,6:1) | El lima no se lee sobre blanco |
| Semáforo | ámbar `#A16207` · verde `#15803D` · rojo `#BE123C` | Estados |

**Cómo lo hace el código (panel):** los colores que cambian con el modo son variables CSS de `[data-tema]` en `styles/panel.src.css`, que lee `tailwind.panel.config.ts`. Así `text-white`, `bg-white/5` y `border-white/10` se vuelven tinta en claro. **Nunca colores fijos en componentes del panel**, salvo lima y tinta, que son iguales en los dos modos.

---

## 3. Tipografía

| Uso | Fuente |
|---|---|
| Títulos y cifras | **Funnel Display** 600–800, `letter-spacing: -0.03em` |
| Texto, etiquetas, botones | **Plus Jakarta Sans** 400–700 |
| **Acento**: una palabra en cursiva con serifa | **Instrument Serif Italic** (`font-acento`), en lima |

Dónde va el acento:

- La **última palabra** de cada título de sección del sitio («¿Tu negocio vive en el *chat?*»). Es automático con `Acento` en `components/v2/primitives.tsx`.
- La línea en cursiva del hero.
- El **nombre del saludo** del panel («Hola, *Sergio*»).

Nunca un párrafo entero. Dentro de una tarjeta lima, el acento va en tinta.

Las tres fuentes van auto-hospedadas con `next/font/local`, recortadas a los caracteres del español: 11,5 + 13,7 + 17 KB. Los campos de formulario van a 16 px en celular (iOS no hace zoom).

---

## 4. Componentes

**Forma:** todo lo que se toca es **píldora**. Campos 12 px, tarjetas 20 px en el panel y 24 px en el sitio, filas y avisos flotantes 10 px, lienzo del panel 28 px. Alto mínimo 40 px (44 px el botón principal).

| Componente | Cómo es | Sitio | Panel |
|---|---|---|---|
| **Botón principal** | Píldora **lima con texto tinta**. Dentro de una tarjeta lima, **negro** con texto blanco. Uno por vista | `Button` / `.v2-primario` | `.pn-primario`, `BotonPrincipal` |
| **Botón secundario** | Píldora de superficie con borde fino: oscura en oscuro, blanca en claro | `variant="secondary"` | `.pn-secundario`, `BotonSecundario` |
| Botón de texto | Texto con flecha | `variant="ghost"` | enlaces |
| **Opción elegida** (selector 7/30/90 días, filtros, pestañas, opciones del formulario, interruptor) | **Lima sólido** con texto tinta | `BookingFlow`, cookies | `.pn-pildora-activa`, `Segmentado` |
| **Tarjeta** | **Lisa** con borde fino | `.v2-card`, `.v2-glass` | `.v2-card` |
| **Tarjeta destacada** | **Degradado lima** con brillo blanco y texto tinta. Una o dos por vista | `.v2-destacada` (paquete recomendado, precio de cada servicio) | `.v2-glass` (la cifra principal) |
| **Píldora / etiqueta** | Oscuro: negra con borde; claro: blanca con borde | `.v2-pildora`, `Badge`, `Eyebrow` | `.pn-pildora`, `Pill tono="neutro"` |
| **Estado** (semáforo) | **Ámbar** lo que pide atención (nuevo, por aceptar, por confirmar, en espera, hoy); **verde** lo que va bien (activo, cerrado, ya es cliente); **rojo** solo lo que salió mal (inactivo, tarde, plazo vencido, canceló). Siempre con palabra | — | `Pill` |
| **Menú elegido** | Píldora que se desliza. Claro: **negra** con borde, texto blanco e ícono lima. Oscuro: **lima** con texto tinta (D-167) | menú en píldora del encabezado | `.pn-selector`, `.pn-nav-on` |
| **Cuenta** | Igual que el menú elegido | — | `.pn-negro` |
| **Contador** | Píldora lima con el número en tinta | — | menú lateral (Clientes) |
| **Aviso** | **Al revés del fondo**: en claro negro con letras blancas, en oscuro blanco con letras negras (D-168) | — | `.pn-aviso` |
| **Cita / seguimiento** | Tinte lima suave con borde lima y la nota en cursiva | — | `.pn-cita` |
| **Inicial de una persona** | Círculo negro con la letra en lima | — | Interesados |
| **Recuadro interno** | Superficie 2 suave con borde fino (formularios dentro de una tarjeta) | — | `.pn-interno` |
| **Título de sección con número** | Punto (`dato`, o ámbar si hay que atender) + título + número en píldora | — | Interesados |
| **Cifras grandes** | Oscuro: **lima**; claro: tinta. En el sitio, los precios con número | precios | `.pn-cifra` |
| Lista con números | `01`, `02`… en Funnel Display en vez de íconos | Problema, "Todo lo que trae" | — |
| Íconos | **Phosphor** `light`, solo los que cumplen una función | `components/v2/iconos.tsx` | `components/panel/iconos.tsx` |
| Íconos de marca | SVG propio en grises, solo en algunas tarjetas | `IconosMarca.tsx` (paquetes); chulos de lo que incluye en círculo lima (D-176) | `IconosMarca.tsx` (tarjetas de proyecto) |
| Campo | 44 px, radio 12 px, borde fino, foco con halo | `BookingFlow` | `.pn-input` |
| Logo | Sitio: marca lima y texto blanco. Panel: **de un solo color** (blanco en oscuro, tinta en claro), 24 px | `Logo` | `LogoPanel` |

Las piezas que existen en los dos productos están **copiadas, no compartidas**: el panel no importa piezas del sitio (D-115, D-135). Si se cambia una pieza común, se cambia en los dos lados.

---

## 5. Fondo

| | Sitio | Panel |
|---|---|---|
| Fondo | `#020104` | `noche` + `canvas` |
| Líneas | Verticales cada 80 px, blancas al 4,5 %, continuas en toda la página (`.v2-fondo`). **Nunca cuadrícula** | No |
| Haces de luz | Luces finas que bajan por algunas líneas | No |
| Luces | Blancas y muy suaves, con un **degradado lima tenue que se mueve despacio** adentro (`.v2-glow::after`, 24 s, solo `transform` y `opacity`) | Brillo lima suave al pie de la barra lateral |

---

## 6. Gráficos

- SVG propio, sin librerías.
- La serie va en **morado** en los dos modos; las barras apagadas, al 9 %.
- El dato que hay que mirar (último punto, primer lugar) va en `dato`: lima en oscuro, morado en claro.
- Para las categorías (personas en el reparto) hay una paleta fija.
- Se dibujan al entrar en vista y respetan el movimiento reducido.

---

## 7. Movimiento

- Solo se anima `transform` y `opacity`.
- **Siempre** se respeta `prefers-reduced-motion`.
- El título principal (LCP) no se anima.
- Los detalles (haces, flechas, degradado lima) arrancan después de abrir la página.

---

## 8. Velocidad (reglas que nacieron de medir)

- Texturas o ruido: en `<canvas>` pintado después de abrir, **nunca** un SVG con `feTurbulence` como fondo.
- Fondos fijos de página completa **sin `mask-image`**.
- Imágenes grandes que se mueven: en `<canvas>` (no cuentan para el LCP).
- Íconos: la versión SSR de Phosphor, importada por nombre.
- Imágenes: `sizes` con el ancho real y carruseles que montan solo la imagen que se ve (D-157).
- Fuentes: una variable por familia, recortada al español y precargada (D-156, D-158). Nunca un archivo por peso.
- Meta: PageSpeed móvil ≥ 90 en la URL publicada. Más reglas en [`blueprint/04-sistema-de-diseno.md`](blueprint/04-sistema-de-diseno.md) §12.

---

## 9. Cómo aplicarlo a un producto nuevo

1. **Colores:** copiar los tokens de §2 y, si lleva modo claro, las variables `[data-tema]` de `styles/panel.src.css`.
2. **Botones:** principal lima con texto tinta (`.pn-primario`) y secundario con borde. Opción elegida en lima sólido.
3. **Tarjetas:** lisas con borde fino; la destacada, en degradado lima.
4. **Tipografía:** las tres fuentes, el acento solo en una palabra.
5. **Íconos:** un `iconos.tsx` con Phosphor `light`, solo los que cumplen una función.
6. **Revisar contra §1:** un solo estilo por componente y nada de la lista de «no se usa».
7. **Medir:** PageSpeed ≥ 90 y contraste AA en los dos modos.
8. **Anotar** en `docs/decisiones.md` toda excepción.

---

## 10. Historial

| Versión | Fecha | Qué |
|---|---|---|
| 2.0 | 23 nov 2026 | Reescrito con lo vigente: estilo Kept, un solo estilo por componente (D-161 a D-168), sitio corporativo (D-176). Las reglas viejas (morado en botones, tarjetas con humo, píldora activa morada…) salieron; están en [`decisiones-archivo.md`](decisiones-archivo.md) y en el historial de git |
| 1.0–1.6 | 20 nov 2026 | Sistema único para el sitio y el panel (D-145 a D-158) |
