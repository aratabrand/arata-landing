# 01 — Arquitectura del panel

| Estado | Versión | Última actualización | Aprueba |
|---|---|---|---|
| En revisión | 0.1 | 10 nov 2026 | Sergio |

---

## 1. Navegación

| Dispositivo | Cómo se navega |
|---|---|
| Celular (< 1024 px) | Barra superior con logo y nombre del negocio + **4 pestañas abajo** (Resumen, Clientes, Proyectos, Mi sitio) |
| Escritorio (≥ 1024 px) | **Barra lateral fija** (248 px): logo, tarjeta "Tu negocio", 4 opciones, "Ver mi página" y "Escribirle a Arata San" (WhatsApp de soporte) |

- La opción activa lleva ícono lima y un punto lima. `aria-current="page"`.
- Si el panel está en modo demo, una franja morada arriba lo dice: *"Estás viendo un panel de ejemplo con datos ficticios."*
- Cada módulo tiene **un solo `<h1>`** (el título del módulo).

```
/panel                 Resumen
/panel/clientes        Clientes
/panel/proyectos       Proyectos
/panel/sitio           Mi sitio
(fase 4) /panel/entrar Inicio de sesión
```

---

## 2. Módulos, pieza por pieza

### 2.1 Resumen (`/panel`)

**Encabezado:** "Hola, {contacto}" + "Así le fue a {negocio} en los últimos N días, comparado con los N días anteriores." + selector **7 días · 30 días · 90 días** (30 por defecto).

| Pieza | Qué muestra | Dato (ver `02` §3) | Interacción |
|---|---|---|---|
| 4 cifras principales | **Ventas** (COP + nº de pedidos) · **Visitas al sitio** (+ clics a WhatsApp) · **Visualizaciones en Instagram** (+ seguidores nuevos) · **Clientes que compran** (% de visitas que terminan en pedido) | `metricas_diarias` sumadas en el periodo | Cada una con variación vs. periodo anterior (lima sube / rosa baja) y línea mínima del periodo |
| Cómo van las ventas | Gráfico de área por día (por semana en 90 días) | `ventas`, `pedidos` o `visitas` por día | Selector Ventas/Pedidos/Visitas; tooltip al tocar o pasar el mouse. Debajo: ticket promedio, pedidos, mejor día |
| Clientes que compran | Anillo con el % + frase "De cada 100 personas que entran a tu página, X terminan haciendo un pedido" + embudo **Visitas → Clics a WhatsApp → Pedidos** con el % que pasa en cada paso | `visitas`, `clics_whatsapp`, `pedidos` | — |
| Instagram | Barras por semana (12 semanas, la última en lima) + 4 cifras: visualizaciones, cuentas alcanzadas, interacciones, seguidores nuevos | `ig_*` | Valor al pasar sobre cada barra |
| De dónde llegan | Barras horizontales por fuente con visitas y % | `fuentes_visitas` (30 días) | — |
| Lo que más se vende | Top 5 productos por valor, con unidades | `ventas` agrupadas por producto (30 días) | — |
| Últimas ventas | 5 ventas más recientes: cliente, producto, fecha, valor y canal | `ventas` | (fase 4: tocar abre el cliente) |
| Pie | "Datos actualizados al {fecha}. Ventas: pedidos registrados · Visitas: Google Analytics · Instagram: Meta." | `max(fecha)` de `metricas_diarias` | — |

**Estados:** sin periodo anterior → "sin dato anterior" en lugar del % (construido). Sin Instagram conectado → la tarjeta dirá "Conecta tu Instagram" con botón a WhatsApp de soporte (fase 4, pendiente).

### 2.2 Clientes (`/panel/clientes`)

| Pieza | Qué hace |
|---|---|
| Encabezado | "Clientes" + "Quién te compra, cuánto y hace cuánto…" + botón lima **Agregar cliente** |
| 4 cifras | Clientes · Nuevos este mes · Recurrentes · Compra promedio por cliente |
| Buscador | Por nombre, teléfono o ciudad |
| Filtros | Todos · Nuevo · Activo · Recurrente · Inactivo (con conteo) |
| Lista | **Escritorio:** tabla (cliente, estado, llegó por, compras, total, última compra, botón WhatsApp). **Celular:** tarjetas (iniciales, nombre, compras y total, estado). Orden: última compra primero |
| Ficha (hoja lateral / desde abajo en celular) | Compras, total, última compra · botón lima **Escribirle por WhatsApp** (mensaje con su nombre) · teléfono, correo, ciudad, origen, cliente desde · **cambiar estado** · **notas** · borrar (con confirmación) |
| Agregar cliente | Nombre*, celular*, correo, ciudad, llegó por, notas. Validación: nombre ≥ 2 letras, celular ≥ 7 números. Entra como "Nuevo" |

**Estados de cliente** (regla para calcularlos automático en la fase 4):

| Estado | Regla |
|---|---|
| Nuevo | Primera compra o registro hace ≤ 30 días |
| Activo | Compró en los últimos 60 días |
| Recurrente | 3 compras o más y compró en los últimos 60 días |
| Inactivo | Más de 60 días sin comprar |

### 2.3 Proyectos (`/panel/proyectos`)

Tablero tipo to-do con **5 fases**:

| Fase | Color | Significa |
|---|---|---|
| Por hacer | gris | Acordado, sin empezar |
| En diseño | morado claro | Se está diseñando o escribiendo |
| En construcción | morado | Se está construyendo |
| En revisión | ámbar | Esperando aprobación o correcciones |
| Entregado | lima | Publicado y entregado |

| Pieza | Qué hace |
|---|---|
| Avance de todas las tareas | % de tareas hechas + barra lima |
| Proyectos en curso | Conteo + franja con las fases que tienen proyectos |
| **Te toca a ti** | Proyectos donde el responsable es "Tu equipo" (lo que el cliente debe entregar: fotos, textos, aprobaciones). Es lo que más destraba los plazos |
| Tablero | **Escritorio:** 5 columnas, arrastrar y soltar. **Celular:** pestañas por fase, una columna a la vez |
| Tarjeta | Prioridad (alta/media/baja), responsable, título, descripción (2 líneas), "x/y tareas", fecha límite (rosa si venció), barra de avance (lima al 100 %), flechas ‹ › para mover de fase (sirven con teclado y en celular) |
| Detalle (hoja) | Cambiar fase y fecha · lista de tareas con casillas · agregar y quitar tareas · borrar proyecto |
| Nuevo proyecto | Nombre*, qué hay que hacer, fase, prioridad, responsable, fecha límite |

> Arrastrar nunca es la única forma de mover: las flechas hacen lo mismo (accesibilidad y celular).

### 2.4 Mi sitio (`/panel/sitio`)

Se trabaja sobre un **borrador**: nada cambia en la página hasta **Guardar cambios**.

| Bloque | Campos | Límite | Por qué el límite |
|---|---|---|---|
| Cómo sale en Google | Título · Descripción | 60 · 155 | Google corta después de eso |
| Portada | Título · Texto de apoyo | 70 · 140 | Máx. 3 líneas en celular (regla de Arata) |
| Franja de anuncio | Encendida/apagada · Texto | 60 | Una línea en celular |
| Botones | Por botón: ubicación, texto, enlace, estilo (principal/secundario) · agregar · quitar | Texto 28 | Que quepa en un botón de celular |

| Pieza | Qué hace |
|---|---|
| Contador | "56/60" junto a cada campo; rosa si se pasa |
| Vista previa | **Celular** (franja, menú con botón, portada, botones con los colores reales) o **Google** (resultado de búsqueda con dominio, título y descripción recortados como los recorta Google) |
| Validación | Título de Google y de portada obligatorios; textos dentro del límite; enlaces solo `https://…`, `/ruta`, `tel:` o `mailto:` (bloquea `javascript:`) |
| Barra de guardado (fija abajo) | Dice el estado: "Todo está al día" · "Tienes cambios sin guardar" · "Revisa los campos marcados" · "Cambios guardados" · "Guardado el {fecha}". Botones **Descartar** y **Guardar cambios** (lima) |

**Fase 4:** guardar escribe en `config_sitio` (con historial en `config_sitio_versiones`) y llama la revalidación de la página del cliente (`revalidatePath` o webhook de Vercel). Si el sitio del cliente es Framer o WordPress, ver `04-construccion.md` §4.

---

## 3. Qué se reutiliza en cada cliente y qué cambia

| Igual para todos | Cambia por cliente |
|---|---|
| Rutas, componentes, gráficos, estilos | Datos (Supabase, filtrados por `negocio_id`) |
| Tipos y definición de métricas | Nombre, contacto, plan, URL, Instagram, WhatsApp (`negocios`) |
| Fases de proyectos | Botones y textos del sitio (`config_sitio`) |
| Estados de clientes | Qué fuentes de venta se conectan (P-3) |
