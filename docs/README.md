# Blueprint Arata San — sitios de agencia que agendan reuniones

Este folder documenta **todo** el proceso de construcción del sitio de agencia de Arata San, para repetirlo en futuras páginas (propias o de clientes) sin empezar de cero.

> **Regla:** si se decidió, se escribe. Si se construyó, se documenta. Nada queda solo en el chat.

---

## Cómo está organizado

| Archivo | Qué contiene | Fase |
|---|---|---|
| [`blueprint/00-plan-maestro.md`](blueprint/00-plan-maestro.md) | Objetivo, alcance, mapa del sitio, fases, estado y decisiones pendientes | 0 |
| [`blueprint/01-estrategia-hormozi.md`](blueprint/01-estrategia-hormozi.md) | Paquetes y precios, avatar, ecuación de valor, nombres, garantías, gancho, embudo y guion de llamada | 1 |
| [`blueprint/02-arquitectura.md`](blueprint/02-arquitectura.md) | Menú, flujo de agendamiento y estructura sección por sección de cada página | 2 |
| [`blueprint/03-copy.md`](blueprint/03-copy.md) | Copy de cada página con versiones para elegir (todas las páginas) | 2 |
| [`blueprint/04-sistema-de-diseno.md`](blueprint/04-sistema-de-diseno.md) | Tokens v2 y especificación de cada componente (hoy: dirección) | 3 |
| [`blueprint/05-construccion.md`](blueprint/05-construccion.md) | Rutas, carpetas, flujo de agenda, eventos de GTM, configuración de Cal.com y pendientes de lanzamiento | 4 |
| [`blueprint/06-seo-geo-velocidad.md`](blueprint/06-seo-geo-velocidad.md) | SEO por página, datos estructurados, GEO (`llms.txt`), velocidad medida, legal y **lista de lanzamiento** | 5 |
| [`blueprint/07-medicion-lanzamiento.md`](blueprint/07-medicion-lanzamiento.md) | Estado del lanzamiento, eventos que envía el sitio, **guía para instalar GA4 en GTM** y qué mirar cada semana | 6 |
| [`portafolio.md`](portafolio.md) | Casos de estudio: problema → solución → resultado de cada proyecto | 0–2 |
| [`decisiones.md`](decisiones.md) | Bitácora de cada decisión: qué, cuándo, quién y por qué | Todas |

Los archivos sin enlace todavía no existen: se crean al llegar a su fase.

### Dónde se ve en vivo (Fase 3)

| Ruta | Qué es |
|---|---|
| `/v2` | Muestra del Inicio v2 con el copy aprobado |
| `/sistema` | Guía viva de tokens y componentes v2 |

Ambas están ocultas a Google (`noindex`) y se revisan en el preview de Vercel de la rama. El código vive en `components/v2/` y el contenido en `content/`.

---

## Cómo usar este blueprint en una página nueva

1. Copia `00-plan-maestro.md` y llena las decisiones de la Fase 0 para el nuevo proyecto.
2. Recorre `01-estrategia-hormozi.md` con el avatar y la oferta del nuevo negocio. **No se escribe copy sin oferta aprobada.**
3. Sigue las fases en orden. Cada fase tiene una **puerta**: no se pasa a la siguiente sin la aprobación indicada.
4. Usa las checklists de las fases 5 y 6 antes de publicar.

---

## Convenciones de documentación

- **Encabezado de estado** en cada archivo: `Estado`, `Versión`, `Última actualización`, `Aprueba`.
- **Estados posibles:** `Borrador` → `En revisión` → `Aprobado`. Solo lo `Aprobado` se construye.
- **Decisiones:** toda decisión va a `decisiones.md` con un ID (`D-001`, `D-002`…). Si una decisión cambia, no se borra: se marca como reemplazada y se enlaza la nueva.
- **Copy:** español colombiano plano, según las reglas de `CLAUDE.md` §2. Esto aplica también a estos documentos cuando muestran texto que irá al sitio.
- **Nada inventado:** métricas, testimonios y logos de clientes solo si son reales y verificables.
