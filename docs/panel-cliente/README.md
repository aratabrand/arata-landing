# Blueprint — Panel del cliente

| Estado | Versión | Última actualización | Aprueba |
|---|---|---|---|
| En revisión | 0.1 | 10 nov 2026 | Sergio (diseño y copy) · Santiago (datos e integraciones) |

Este folder documenta **el panel que le entregamos a cada cliente** para que vea cómo le va y maneje su negocio desde un solo lugar. Sirve para dos cosas:

1. Construir el panel de Arata (primera versión en `/panel`, con un negocio de ejemplo).
2. **Repetirlo en cada cliente nuevo** sin empezar de cero: mismas piezas, mismos datos, otro negocio.

> **Regla:** si se decidió, se escribe en [`../decisiones.md`](../decisiones.md). Si se construyó, se documenta aquí.

---

## Cómo está organizado

| Archivo | Qué contiene |
|---|---|
| [`00-plan.md`](00-plan.md) | Objetivo, para quién es, módulos, qué entra en el MVP y qué después, fases, decisiones pendientes y riesgos |
| [`01-arquitectura.md`](01-arquitectura.md) | Rutas, navegación y cada módulo pieza por pieza: qué muestra, de dónde sale el dato y qué puede hacer el cliente |
| [`02-modelo-de-datos.md`](02-modelo-de-datos.md) | Tablas de Supabase, seguridad por negocio (RLS), definición exacta de cada métrica e integraciones (GA4, Instagram, ventas, n8n) |
| [`03-sistema-de-diseno.md`](03-sistema-de-diseno.md) | Cómo se aplica el sistema v2 de Arata al panel: marco, componentes, gráficos, movimiento, accesibilidad y palabras del panel |
| [`04-construccion.md`](04-construccion.md) | Carpetas y archivos, cómo montar el panel de un cliente nuevo (lista paso a paso), cómo pasar de datos de ejemplo a Supabase, seguridad y verificación |

## Dónde se ve

| Ruta | Qué es |
|---|---|
| `/panel` | Resumen: ventas, visitas del sitio, Instagram y clientes que compran |
| `/panel/clientes` | Lista de clientes con búsqueda, filtros, ficha y alta |
| `/panel/proyectos` | Tablero tipo to-do por fases |
| `/panel/sitio` | Títulos, descripciones, portada, franja de anuncio y botones, con vista previa |

Todo el panel es `noindex`, no va en el sitemap y `robots.txt` bloquea `/panel`. Hoy muestra **datos de ejemplo** (Panadería La Espiga, negocio ficticio) y lo dice en pantalla.

## Código

| Qué | Dónde |
|---|---|
| Rutas | `app/(panel)/panel/` |
| Componentes | `components/panel/` |
| Tipos (el contrato de datos) | `content/panel/tipos.ts` |
| Datos de ejemplo | `content/panel/demo.ts` |
| Entrada única de datos | `lib/panel/datos.ts` → `obtenerPanel()` |
| Formatos y cálculos | `lib/panel/formato.ts` |
| Guardado (demo: navegador) | `lib/panel/guardado.ts` |
| Estilos propios | `app/globals.css`, bloque "Panel del cliente" (`.pn-*`) |
