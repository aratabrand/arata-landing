# 06 — Finanzas y Equipo (solo Arata San)

| Estado | Versión | Última actualización | Aprueba |
|---|---|---|---|
| En revisión | 0.1 | 10 nov 2026 | Sergio |

> **Solo para la agencia (D-108).** Finanzas y Equipo existen únicamente para el negocio de tipo `agencia` (Arata San). Nunca aparecen en el panel de un cliente de página web, y la base de datos rechaza finanzas para cualquier otro negocio (trigger `exigir_agencia`).

---

## 1. Qué resuelve

| Pregunta | Dónde se ve |
|---|---|
| ¿Cuánto vendimos y cuánto ganamos? | Finanzas → Resumen |
| ¿Cuánto se gastó en cada proyecto? | Finanzas → Proyectos → ficha del proyecto |
| ¿Cuánto le toca a cada uno por proyecto? | Ficha del proyecto · Equipo |
| ¿Cuánto ha ganado cada uno en total, este mes y este año? | Equipo |
| ¿Con cuánta plata cuenta Arata para invertir? | Finanzas → Resumen → Fondos de la empresa |
| ¿Cuántos proyectos al mes necesitamos para cubrir gastos? | Resumen → Punto de equilibrio · Proyección |
| ¿Qué pasa si cerramos 3, 5 u 8 proyectos al mes? | Finanzas → Proyección |

**Venta = proyecto cerrado.** Todo en **pesos colombianos (COP)**, sin decimales.

## 2. Cómo se reparte la ganancia

Por proyecto, en este orden:

| Paso | Fórmula |
|---|---|
| 1. Ganancia | valor que paga el cliente − gastos del proyecto |
| 2. Bolsa de trabajo | ganancia × **% de bolsa** → se reparte según las **horas** de cada persona en ese proyecto |
| 3. Resto | ganancia − bolsa → se reparte con los **% fijos** de cada socio y de **Arata San (empresa)** (suman 100 %) |
| 4. Total de cada persona | su parte de la bolsa + su % del resto |

**Ejemplo** (bolsa 30 %; Sergio, Andrés, Santiago y Arata con 25 % cada uno):

| | Valor |
|---|---|
| Proyecto | $ 2.000.000 |
| Gastos | − $ 200.000 |
| **Ganancia** | **$ 1.800.000** |
| Bolsa de trabajo (30 %) | $ 540.000 → Sergio 10 h, Santiago 20 h |
| Resto (70 %) | $ 1.260.000 → $ 315.000 para cada uno |

| Persona | Trabajo | Socio | **Total** |
|---|---|---|---|
| Sergio | $ 180.000 | $ 315.000 | **$ 495.000** |
| Andrés | $ 0 | $ 315.000 | **$ 315.000** |
| Santiago | $ 360.000 | $ 315.000 | **$ 675.000** |
| Arata San (empresa) | — | $ 315.000 | **$ 315.000** |

**Casos especiales:**
- **Sin horas registradas:** no hay bolsa; toda la ganancia se reparte con los % de socios (no se pierde plata).
- **Pérdida** (gastos mayores que el valor): no se reparte; la absorbe la empresa.
- **Redondeo:** cada parte se redondea al peso; la diferencia va a la empresa, así la suma da exacto la ganancia.
- **% congelados:** al **cerrar** un proyecto se guarda una copia de los % de ese momento. Si después cambias el reparto, los proyectos cerrados no cambian. Desde la ficha de un proyecto cerrado se puede recalcular con los % de hoy ("Usar los porcentajes de hoy"), a propósito y uno por uno.

## 3. Fondos y punto de equilibrio

| Concepto | Cálculo |
|---|---|
| **Fondos de Arata** | todo lo que le ha tocado a la empresa (proyectos cerrados) − gastos e inversiones de la empresa |
| **Reserva** | gastos fijos mensuales × meses de reserva (3 de arranque; se cambia en Reparto) |
| **Disponible para invertir** | fondos − reserva (nunca menos de 0) |
| **Punto de equilibrio** | gastos fijos del mes ÷ lo que le deja a Arata un proyecto promedio, redondeado hacia arriba |

Ejemplo: gastos fijos $ 1.000.000/mes; un proyecto promedio de $ 2.000.000 con 10 % de gastos le deja a Arata $ 270.000 (con bolsa 40 %) → **4 proyectos al mes**.

**Proyección:** se elige cuántos proyectos al mes, el valor promedio y el % de gastos (arrancan con el promedio real). Muestra cuánto ganaría cada uno, cuánto le queda a Arata después de gastos fijos, el punto de equilibrio y en cuántos meses se llega a una meta de inversión. No guarda nada. La bolsa de trabajo se proyecta según cómo se han repartido las horas hasta hoy (si no hay horas, por partes iguales).

## 4. Quién ve y quién edita

| Persona | Rol (`miembros.rol`) | Puede |
|---|---|---|
| Sergio | `dueno` | Ver y editar todo: proyectos, gastos, horas, personas y porcentajes |
| Andrés, Santiago | `equipo` | **Ver todo**, sin editar. Su tarjeta en Equipo dice "Tú" |

Doble barrera: la pantalla no muestra los botones de editar a quien no es dueño, y **cada acción del servidor revisa otra vez** sesión con doble factor, negocio agencia y rol `dueno`. Probado: si Andrés llama la acción de guardar el reparto directo al servidor, la respuesta es "Solo Sergio puede cambiar las finanzas".

## 5. Pantallas

| Ruta | Contenido |
|---|---|
| `/panel/finanzas` → **Resumen** | Ventas, gastos, ganancia y fondos (este mes / este año / todo) · cuánto le toca a cada uno · fondos de la empresa con reserva · ganancia por mes · punto de equilibrio |
| → **Proyectos** | Lista con filtro (propuesta, en curso, cerrado) · ficha con reparto detallado, horas y gastos del proyecto · crear, editar, cerrar, borrar |
| → **Gastos** | Gastos fijos mensuales (con interruptor para dejar de contarlos) · gastos e inversiones de la empresa · gastos cargados a proyectos |
| → **Reparto** | % de bolsa, % de cada socio y de Arata (deben sumar 100 %), meses de reserva · ejemplo en vivo |
| → **Proyección** | Simulador de mes, punto de equilibrio, meta de inversión y tabla "¿cuántos proyectos necesitamos?" |
| `/panel/equipo` | Tarjeta por persona (total, este mes, este año, socio/trabajo, horas) · tabla por proyecto · agregar o editar personas (Sergio) |

## 6. Datos (`db/panel/003_finanzas.sql`)

| Tabla | Qué guarda |
|---|---|
| `equipo_personas` | Nombre, área, si es socio, activo y la cuenta enlazada (`usuario_id`) |
| `fin_config` (+ `fin_config_versiones`) | % de bolsa, % de reparto (JSON) y meses de reserva; cada cambio deja una versión con quién y cuándo |
| `fin_proyectos` | Nombre, cliente, servicio, estado, valor, fecha de cierre y `reparto_congelado` |
| `fin_gastos` | Gastos de un proyecto (`proyecto_id`) o de la empresa (`proyecto_id` vacío) con categoría |
| `fin_horas` | Horas por persona y proyecto, con área, fecha y nota |
| `fin_gastos_fijos` | Gastos mensuales de la empresa (para equilibrio y reserva) |

Código: cálculos puros en `lib/panel/finanzas/calculo.ts` (probados con `npx -y tsx scripts/prueba-finanzas.ts`, 17 casos), lectura en `lib/panel/finanzas/datos.ts`, acciones en `app/(panel)/panel/(app)/finanzas/acciones.ts`, pantallas en `components/panel/finanzas/`. Sin conexión a la base, muestra datos de ejemplo (`lib/panel/finanzas/demo.ts`) con aviso.

## 7. Dar acceso a Andrés y Santiago

Cada uno con su propio correo. Sergio corre en su computador:

```bash
node --env-file=.env.local scripts/panel-crear-usuario.mjs CORREO-DE-ANDRES "Andrés" arata-san equipo "Andrés"
```

```bash
node --env-file=.env.local scripts/panel-crear-usuario.mjs CORREO-DE-SANTIAGO "Santiago" arata-san equipo "Santiago"
```

El último dato enlaza la cuenta con su persona en Equipo. Cada comando muestra una contraseña **una sola vez**: se le pasa a cada uno por un medio privado (no por un grupo), y al entrar el panel le obliga a activar su propio doble factor.

> Para que ellos entren, el panel tiene que estar publicado (hoy solo corre en el computador de Sergio). Ver pendiente 3.

## 8. Pruebas (10 nov 2026)

Base local (PGlite), `next build` + `next start`, Chromium. 22 de 22 ✅:

| Prueba | Resultado |
|---|---|
| Sergio ve Finanzas y Equipo; datos reales sin aviso de ejemplo | ✅ |
| Crear proyecto, registrar horas (10 h y 20 h) y un gasto de $ 200.000 | ✅ |
| Reparto: Sergio $ 495.000 · Andrés $ 315.000 · Santiago $ 675.000 · Arata $ 315.000 | ✅ |
| Cerrar el proyecto congela los %; cambiar la bolsa a 40 % no lo altera | ✅ |
| No deja guardar un reparto que suma 105 % | ✅ |
| Fondos = $ 315.000 − $ 50.000 = $ 265.000 · equilibrio 4 proyectos/mes | ✅ |
| Andrés ve todo, con aviso de solo lectura, sin botones de editar; "Tú" en su tarjeta | ✅ |
| Andrés llamando la acción del servidor directo → rechazado | ✅ |
| La base rechaza crear finanzas para un cliente de página web | ✅ |
| Celular (iPhone 13): las 5 pestañas y Equipo sin scroll horizontal | ✅ |

## 8b. Clientes y servicios como listas (D-109)

En un proyecto, **cliente y servicio se eligen de una lista**: no se escriben a mano, para que no haya dos formas de escribir lo mismo.

| Lista | Tabla | Cómo se agrega | Regla contra repetidos |
|---|---|---|---|
| Clientes | `clientes` (con empresa, contacto, celular, de dónde llegó y detalle) | En Clientes → "Agregar cliente", o en el proyecto con "＋ Agregar cliente nuevo…" | Mismo celular, o misma empresa + contacto sin importar mayúsculas, tildes ni espacios |
| Servicios | `servicios` (nombre + categoría) | Finanzas → Proyectos → "Servicios", o en el proyecto con "＋ Agregar servicio nuevo…" | Mismo nombre sin importar mayúsculas ni espacios (también lo exige la base con un índice único) |

Servicios iniciales (los paquetes del sitio): Página Lista en 5 Días · Tienda por WhatsApp en 5 Días · Tu Negocio en Orden · Mantenimiento mensual. Un servicio se puede **renombrar** o **desactivar** (deja de salir en proyectos nuevos; los viejos lo conservan). Un cliente con proyectos **no se puede borrar** (la base lo impide): se marca inactivo.

**Módulo Clientes (datos reales, solo Arata):** lista con búsqueda, filtro "En curso" y por origen; cada cliente muestra estado, "Proyecto en curso", último servicio y cuánto ha comprado (proyectos cerrados). La ficha trae datos de contacto, de dónde llegó (origen + detalle), todos sus servicios y proyectos con estado y valor, notas y botón de WhatsApp. Sergio edita; Andrés y Santiago solo ven.

## 8c. Proyectos en grid con su proceso (D-111)

`/panel/proyectos` (Arata con sesión) muestra **una tarjeta por proyecto**: servicio, nombre, cliente, estado comercial, **etapa actual** con el siguiente paso, las 5 etapas, la fecha de entrega (aviso si va tarde) y **abajo la barra de avance** (pasos hechos / total). Filtros: En proceso · Entregados · Todos; resumen con cuántos van tarde. Cada tarjeta abre `/panel/proyectos/[id]`.

| Detalle del proyecto | |
|---|---|
| Proceso | 5 etapas (Arranque → Diseño → Construcción → Revisión → Entrega) con ✓, "Aquí vas" y % |
| Pasos por etapa | Casillas para marcar (Sergio), agregar o quitar pasos |
| Datos | Cliente, servicio, valor, inicio, **entrega prometida** (días que faltan o que pasaron), cierre |
| Horas | Horas por persona, con enlace a Finanzas |

**Regla:** la etapa y el avance **se calculan de los pasos** (etapa = la del primer paso sin terminar). No hay que actualizar dos cosas.

**Plantillas por tipo de servicio** (`lib/panel/finanzas/procesos.ts`): al crear un proyecto se cargan solas. La de página web sigue los 5 días que promete el sitio: propuesta → textos/logo/fotos → estructura de 5 secciones (día 1) → diseño en celular y computador (días 2 y 3) → construir (días 2 y 3) → 2 rondas de ajustes (día 4) → publicar, medir 90+ en Google y capacitar (día 5). Catálogo, sistema, mantenimiento y "otro" tienen la suya. Un proyecto sin pasos tiene el botón "Cargar el proceso". Sergio marca pasos; Andrés y Santiago los ven sin marcar.

Migración `db/panel/005_proceso.sql`: `fin_proyectos.fecha_inicio`, `fecha_limite` y tabla `fin_tareas`.

## 8d. Resumen con datos reales y equipo que marca pasos (D-112, D-113)

**Resumen (`/panel`) de Arata**, con selector 30 días · 90 días · 1 año y comparación con el periodo anterior:

| Pieza | Dato |
|---|---|
| Ventas | Suma de proyectos **cerrados** en el periodo (por fecha de cierre) |
| Ganancia | Ventas − gastos de esos proyectos · margen |
| Clientes nuevos | Clientes creados en el periodo |
| Proyectos en proceso | Con pasos sin terminar (o en curso sin pasos) · cuántos van tarde |
| Cómo van las ventas | Ventas por mes, últimos 12 meses · en curso por cobrar · propuestas abiertas · ticket promedio |
| Clientes que compran | Clientes con al menos un proyecto cerrado ÷ total · embudo Clientes → Con propuesta o proyecto → Compraron |
| De dónde llegan | Clientes por origen y cuántos compraron |
| Lo que más se vende | Servicios por ventas del periodo |
| Últimas ventas | 5 proyectos cerrados más recientes |
| Visitas e Instagram | **Pendiente** (Google Analytics y Meta por n8n). No se muestran números inventados |

Regla: un proyecto **cerrado sin pasos** cuenta como entregado (proyectos viejos de antes del panel). Cálculos en `lib/panel/resumen/agencia.ts`, prueba `npx -y tsx scripts/prueba-resumen.ts` (12 casos).

**Equipo marca pasos (D-112):** Andrés y Santiago pueden **marcar y desmarcar** pasos de los proyectos; agregar, quitar o editar sigue siendo de Sergio, igual que todo el dinero. Cada paso guarda quién lo marcó y cuándo ("Lo marcó Andrés · 10 nov"). Migración `006_quien_marca.sql`.

## 9. Pendiente

| # | Qué | Quién |
|---|---|---|
| 1 | Poner los % reales de bolsa y de cada socio, y los gastos fijos | Sergio |
| 2 | Cargar los proyectos cerrados de este año para tener historia | Sergio |
| 3 | Publicar el panel (merge a `main` + `BETTER_AUTH_SECRET` y `BETTER_AUTH_URL` en Vercel) para que Andrés y Santiago entren | Sergio aprueba · Santiago |
| 4 | Crear las cuentas de Andrés y Santiago (§7) | Sergio |
| 5 | Que el Resumen general del panel muestre las ventas reales (proyectos cerrados) | Siguiente paso |
| 7 | Cargar los clientes reales de Arata en Clientes | Sergio |
| 6 | Que cada uno registre sus propias horas (hoy solo Sergio) | Si se decide |
