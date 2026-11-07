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
| D-015 | 2026-11-07 | Los cambios del sistema de diseño v2 los **describe Sergio** (no hay Figma aún); Claude los documenta y especifica | Sergio tiene la dirección clara (D5) | Sergio | Tomada (falta la descripción) |
| D-016 | 2026-11-07 | **Sin página Nosotros**: el equipo va como sección corta dentro del inicio. Ajusta el mapa de D-007 | Menos páginas que mantener; la confianza se da en el inicio (D6) | Sergio | Tomada |
| D-017 | 2026-11-07 | `/agendar` hace **3 preguntas antes del calendario**: tipo de proyecto, para cuándo, presupuesto | Reuniones mejor preparadas y menos curiosos (D7) | Sergio | Tomada |
| D-018 | 2026-11-07 | **Estructura de paquetes aprobada.** Web: Landing · Sitio web (recomendado) · Catálogo. Apps: Prototipo (precio fijo) · Primera versión (desde) · Soporte mensual | Cubre los dos servicios y aprovecha la prueba de los catálogos ya hechos | Sergio | Reemplazada (parcial) → D-019 a D-021 |
| D-019 | 2026-11-07 | **Paquete Landing:** desde **400 USD**, 5 secciones, entrega en **5 días hábiles** desde la aprobación | Plazo corto = palanca fuerte de "tiempo de espera" en la ecuación de valor | Sergio | Tomada |
| D-020 | 2026-11-07 | **Paquete Catálogo:** desde **800 USD**, con carrito, panel del cliente, inventario y envío del pedido por WhatsApp; entrega en **5 días hábiles** desde la aprobación. El precio sube según el tamaño de la tienda | Ya hay 3 casos reales de catálogo (Danrodedm, Arata Print, Caravana) | Sergio | Tomada |
| D-021 | 2026-11-07 | **"Apps" se reemplaza por "sistemas a medida"** (reservas, menús digitales, CRM), con precio según tamaño. Servicio 2 propuesto = **Catálogos y sistemas a medida**: el Catálogo es la entrada y el sistema a medida se cotiza | "App" es difuso para el cliente; "sistema de reservas" o "CRM" se entiende. Arata Print y Caravana ya son sistemas (panel, pedidos, inventario) | Sergio + Claude | Propuesta (confirmar estructura) |
| D-022 | 2026-11-07 | **Mensualidad = 15 % del valor del proyecto** (soporte y mantenimiento) | Ingreso recurrente proporcional al tamaño del proyecto | Sergio | Tomada |
| D-023 | 2026-11-07 | **Capacidad: 3 proyectos nuevos al mes** → se usa como escasez real ("tomamos 3 proyectos al mes") | Es verdad, así que se puede anunciar | Sergio | Tomada |
| D-024 | 2026-11-07 | **Inventario del portafolio completo** (tipo, URL, problema y solución de cada caso) en [`portafolio.md`](portafolio.md). Testimonios pendientes (posibles: Arata Print, Caravana) | Base para los casos de estudio | Sergio | Tomada (faltan testimonios) |
| D-025 | 2026-11-07 | **Diseño v2: solo fondo oscuro** `#03010B`; morado y lima (y demás colores de marca) solo como acentos sobre ese fondo. Tipografía igual. Referencia de estilo para componentes, botones, menú y animaciones: **21st.dev**. **Reemplaza** la regla v1 de `CLAUDE.md` §9 (alternar blanco y oscuro) | Estética premium de producto digital, coherente con lo que se vende | Sergio | Tomada |
| D-026 | 2026-11-07 | Los trabajos se muestran con **video en loop tipo GIF** de cada página y animaciones premium. Técnica propuesta: **video MP4/WebM** silenciado y en bucle, cargado solo al entrar en pantalla, con imagen de portada; **no archivos GIF** | Un GIF pesa entre 5 y 10 veces más que un video equivalente y hundiría la velocidad móvil (promesa D-014) | Sergio (estilo) + Claude (técnica) | Tomada (estilo) · Propuesta (técnica) |
