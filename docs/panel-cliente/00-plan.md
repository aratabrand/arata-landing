# 00 — Plan: panel del cliente

| Estado | Versión | Última actualización | Aprueba |
|---|---|---|---|
| En revisión | 0.1 | 10 nov 2026 | Sergio |

---

## 1. Objetivo

Que cada cliente de Arata San **vea en un solo lugar si su página le está vendiendo** y pueda manejar lo básico de su negocio sin escribirnos para todo.

**Para el cliente:** saber cuánto vendió, cuánta gente entró, cómo va Instagram, quién le compra y en qué va cada trabajo con nosotros.
**Para Arata:** el panel justifica la mensualidad (el cliente ve el resultado cada semana), baja los mensajes de soporte ("¿me cambias este texto?") y se vuelve parte del paquete que vendemos.

**Cómo sabemos que funciona:**

| Métrica | Meta inicial |
|---|---|
| Clientes que entran al panel al menos 1 vez por semana | 70 % |
| Cambios de texto que el cliente hace solo (sin escribirnos) | 50 % de los pedidos de cambio |
| Clientes con mantenimiento que renuevan | sube frente a hoy |

## 2. Para quién

Dueños de pymes colombianas (panaderías, restaurantes, tiendas, servicios). Lo abren **sobre todo en el celular**, entre una cosa y otra. No son técnicos: no saben qué es una "sesión" ni una "tasa de conversión".

Consecuencias de diseño:
- **Celular primero.** Pestañas abajo, zona del pulgar, nada que dependa de pasar el mouse.
- **Palabras del negocio**, no de marketing (ver `03-sistema-de-diseno.md` §7).
- **Cada cifra se compara** con el periodo anterior: el cliente quiere saber si va mejor o peor, no el número suelto.

## 3. Módulos

| # | Módulo | Ruta | Qué resuelve |
|---|---|---|---|
| 1 | **Resumen** | `/panel` | Ventas, visitas del sitio, visualizaciones en Instagram y clientes que compran, con selector de 7/30/90 días |
| 2 | **Clientes** | `/panel/clientes` | Quién compra, cuánto y hace cuánto; notas; escribirle por WhatsApp; agregar clientes |
| 3 | **Proyectos** | `/panel/proyectos` | En qué fase va cada trabajo con Arata, qué falta y qué le toca al cliente |
| 4 | **Mi sitio** | `/panel/sitio` | Cambiar títulos y descripciones (Google y portada), franja de anuncio y botones, con vista previa |

## 4. Alcance

### MVP (construido, con datos de ejemplo)

- Los 4 módulos completos en interfaz, celular y escritorio.
- Datos de ejemplo de un negocio ficticio, marcados en pantalla.
- Cambios guardados en el navegador (para probar y mostrar en reuniones de venta).
- Contrato de datos cerrado (`content/panel/tipos.ts`): lo que conecte Supabase debe devolver esas formas.

### Fase siguiente (para el primer cliente real)

- Inicio de sesión (Supabase Auth, enlace mágico al correo).
- Tablas en Supabase con seguridad por negocio (RLS).
- Flujos de n8n que llenan las métricas diarias (GA4, Instagram, ventas).
- "Guardar" en Mi sitio escribe en Supabase y actualiza la página del cliente.

### Después (no en el MVP)

- Varios usuarios por negocio con permisos (dueño, empleado).
- Inventario y pedidos dentro del panel (se cruza con el sistema de inventario por código de barras de Santiago).
- Conversaciones del agente de WhatsApp (Sara) y resumen de lo que más preguntan.
- Informe mensual en PDF enviado por correo.
- Comentarios en los proyectos.

## 5. Fases

| Fase | Qué | Puerta para pasar | Estado |
|---|---|---|---|
| 0 | Plan y módulos (este archivo) | Sergio aprueba alcance | En revisión |
| 1 | Arquitectura y copy de cada módulo | Sergio aprueba textos y orden | En revisión |
| 2 | Diseño (sistema v2 aplicado al panel) | Sergio aprueba en el preview | En revisión |
| 3 | Construcción con datos de ejemplo | Funciona en celular y escritorio | ✅ Hecho (D-101) |
| 4 | Datos reales: Supabase + Auth + n8n | Santiago prueba con un cliente piloto | Pendiente |
| 5 | Primer cliente en vivo | El cliente lo usa 2 semanas | Pendiente |

> La construcción de la Fase 3 se adelantó a pedido de Sergio para tener la base y el blueprint juntos. Copy y diseño quedan **En revisión** hasta su aprobación; cambios se hacen sobre lo construido.

## 6. Decisiones pendientes

| # | Pregunta | Opciones | Quién decide |
|---|---|---|---|
| P-1 | ¿El panel va incluido en la mensualidad o es un adicional? | Incluido en el mantenimiento (15 %) · Adicional mensual · Solo en paquetes de catálogo/sistema | Sergio + Andrés |
| P-2 | ¿Dónde vive cada panel? | Un solo proyecto multi-cliente (`panel.aratasan.com`, recomendado) · Un despliegue por cliente | Santiago |
| P-3 | ¿Qué cuenta como "venta" para clientes sin tienda en línea? | Pedido registrado a mano en el panel · Pedido que llega por WhatsApp (n8n) · Ventas de Shopify/Wompi | Santiago, por cliente |
| P-4 | ¿Qué campos del sitio puede editar el cliente? | Hoy: SEO, portada, anuncio y botones. ¿Precios, fotos, horarios? | Sergio |
| P-5 | Nombre del producto para venderlo | "Panel", "Tu tablero", otro | Sergio |

## 7. Riesgos y cómo se manejan

| Riesgo | Cómo se maneja |
|---|---|
| Un cliente ve datos de otro | RLS en todas las tablas por `negocio_id`; prueba obligatoria con dos cuentas antes de cada lanzamiento (`04-construccion.md` §5) |
| El cliente rompe su página con un enlace o texto | Validación en el panel (largos, enlaces solo `https://`, `/`, `tel:`, `mailto:`), borrador antes de guardar, historial de cambios en Supabase |
| Métricas que no cuadran con GA4 o Instagram | Definición escrita de cada métrica (`02-modelo-de-datos.md` §3) y fecha de "datos actualizados al…" visible |
| Mostrar cifras inventadas | El modo demo se anuncia en pantalla (`negocio.demo`); nunca se usa demo con un cliente real |
| Tokens de Meta/Google vencidos | n8n avisa por WhatsApp a Santiago si un flujo falla; el panel muestra la última fecha con datos |
