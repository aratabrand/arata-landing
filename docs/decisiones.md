# Bitácora de decisiones

Cada decisión del proyecto queda aquí. Si una decisión cambia, **no se borra**: se marca como `Reemplazada` y se enlaza la nueva.

**Estados:** `Tomada` (la decidió quien aprueba) · `Propuesta` (la sugirió Claude, falta confirmar) · `Reemplazada`.

| ID | Fecha | Decisión | Por qué | Quién | Estado |
|---|---|---|---|---|---|
| D-001 | 2026-11-07 | La landing pasa a ser un **sitio de agencia** con un solo objetivo: **agendar reuniones** | La reunión es donde se cierra la venta de proyectos de diseño y desarrollo | Sergio | Tomada |
| D-002 | 2026-11-07 | Solo **dos servicios**: (1) landing pages y sitios web, (2) apps a medida | Oferta clara y fácil de entender | Sergio | Tomada |
| D-003 | 2026-11-07 | Mobile-first y optimización son parte central de la oferta | Diferencia frente a plantillas y freelancers; el propio sitio lo demuestra | Sergio | Tomada (forma exacta en D4) |
| D-004 | 2026-11-07 | Estrategia de captación con el método de **Alex Hormozi** aplicado a web y apps | Misma estrategia que funcionó en la landing actual | Sergio | Tomada |
| D-005 | 2026-11-07 | Se conserva el sistema de diseño base y se hace una **v2** con cambios y componentes nuevos | Mantener la identidad y documentar la evolución | Sergio | Tomada (cambios en D5) |
| D-006 | 2026-11-07 | Todo el proceso se documenta como **blueprint** reutilizable en `docs/` | Repetir el proceso en futuras páginas sin empezar de cero | Sergio | Tomada |
| D-007 | 2026-11-07 | El sitio pasa de **una página a varias** (inicio, 2 servicios, portafolio, casos, agendar, nosotros, privacidad) | Cada servicio necesita su oferta completa; mejora SEO (hoy solo hay 1 página indexable) | Claude | Propuesta |
| D-008 | 2026-11-07 | Chatbot y automatización **salen de la oferta pública** | Consecuencia de D-002 | Claude | Propuesta |
| D-009 | 2026-11-07 | Se conserva la base técnica (Next.js 16, fuentes locales, seguridad, GTM, SEO) y se rehace estructura, copy y componentes | La base ya logró SEO 100 y velocidad 100/93; rehacerla no suma | Claude | Propuesta |
| D-010 | 2026-11-07 | Garantías solo sobre lo que controlamos (plazo, velocidad, ajustes), nunca sobre ventas del cliente | Una garantía incumplible destruye confianza | Claude | Propuesta |
| D-011 | 2026-11-07 | **Portafolio inicial:** 4 proyectos reales (Your Boost Menu, Danrodedm, Caravana, Arata Print) — 2 sitios web + 2 webs tipo catálogo — y 2 testimonios | Es la prueba real disponible hoy (D1) | Sergio | Tomada (falta inventario detallado) |
| D-012 | 2026-11-07 | Agenda con **Cal.com** integrado en `/agendar` | Gratis, se integra en la página y emite eventos medibles en GTM (D2) | Sergio | Tomada |
| D-013 | 2026-11-07 | **Paquetes con precio** visibles en el sitio | Filtra curiosos y llega a la reunión gente que ya sabe el rango (D3). **Reemplaza** la regla v1 de `CLAUDE.md` §9 "sin precios en la página" | Sergio | Tomada (faltan precios) |
| D-014 | 2026-11-07 | Mobile-first y optimización = **promesa de los dos servicios + auditoría gratis** como gancho para agendar | Diferencia la oferta y abre una puerta de entrada de bajo riesgo (D4) | Sergio | Tomada |
