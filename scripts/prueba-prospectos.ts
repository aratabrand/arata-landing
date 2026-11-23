// Prueba de la clasificación de prospectos (D-173). Correr:  npx -y tsx scripts/prueba-prospectos.ts
import { clasificar, codigoDe, enlaceAgenda, mensajeProspecto, nombreCorto, saludoDe, whatsappDe, paginaDe, prioridadDe, puntuar, rubroDe, telefonoTexto, tipoTelefonoDe, titularDe } from "../lib/panel/clientes/prospectos";
const ok = (c: boolean, m: string) => { console.log((c ? "✓ " : "✗ ") + m); if (!c) process.exitCode = 1; };

ok(rubroDe("Hardware store") === "ferreteria" && rubroDe("Tool store") === "ferreteria", "ferretería desde la categoría de Google");
ok(rubroDe("Dentist") === "odontologia" && rubroDe("Orthodontist") === "odontologia", "odontología");
ok(rubroDe("Auto parts store") === "repuestos" && rubroDe("Clothing store") === "ropa" && rubroDe("Bakery") === "otro", "repuestos y ropa; panaderías ya no se trabajan (D-180)");
ok(rubroDe("Home goods store", "Depósito y Ferretería San Cipriano") === "ferreteria" && rubroDe("Home goods store", "Hogar Ideal") === "electrodomesticos", "el nombre manda si dice el rubro");
ok(rubroDe("Real estate agency") === "otro" && rubroDe(null) === "otro", "lo que no es de un rubro queda en otro");

ok(paginaDe("") === "sin_pagina" && paginaDe(null) === "sin_pagina", "sin página");
ok(paginaDe("https://linktr.ee/x") === "solo_redes" && paginaDe("https://instagram.com/x") === "solo_redes" && paginaDe("https://wa.me/57300") === "solo_redes", "redes no cuentan como página");
ok(paginaDe("https://www.draluzorozco.com/") === "tiene_pagina", "página propia");

ok(titularDe("Todo Repuestos H.B SAS") === "empresa" && titularDe("Ferretería La Mundial S.A.S.") === "empresa" && titularDe("Distribuciones Ltda") === "empresa", "empresa con NIT");
ok(titularDe("Dra. Luz Orozco - Dentista Bogotá") === "persona_natural" && titularDe("Dr Pérez") === "persona_natural", "consultorio a nombre de persona");
ok(titularDe("Panadería Latina") === "por_verificar" && titularDe("Sasha Boutique") === "por_verificar", "lo demás, por verificar (sin falsos SAS)");

ok(tipoTelefonoDe("+57 313 866 4158") === "celular" && tipoTelefonoDe("576012345678") === "fijo" && tipoTelefonoDe("") === null && tipoTelefonoDe("12015550123") === "otro", "tipo de teléfono");
ok(telefonoTexto("573138664158") === "+57 313 866 4158", "teléfono para mostrar");
ok(tipoTelefonoDe("5714744600") === "fijo" && telefonoTexto("5714744600") === "+57 1 474 4600", "fijo de Bogotá con el formato viejo");
ok(paginaDe("https://wa.link/gj086a") === "solo_redes" && paginaDe("https://rappi.sng.link/x") === "solo_redes", "wa.link y Rappi no son página propia");
ok(paginaDe("https://www.paginasamarillas.com.co/empresas/x") === "solo_redes", "un directorio no es página propia");

ok(prioridadDe(5) === "alta" && prioridadDe(4) === "media" && prioridadDe(3) === "media" && prioridadDe(2) === "baja", "cortes de prioridad");
ok(puntuar({ pagina: "sin_pagina", resenas: 101, calificacion: 4.5, titular: "empresa" }).puntos === 7, "máximo: 7 puntos");
ok(puntuar({ pagina: "tiene_pagina", resenas: 5, calificacion: 3.9, titular: "por_verificar" }).prioridad === "baja", "con página y pocas reseñas: baja");

const p = clasificar({ fuenteId: "x1", nombre: "  Ferretería   El Campin ", categoria: "Hardware store", sitio: "", telefono: "+57 310 000 0000", resenas: 846, calificacion: 4.4 });
ok(p.nombre === "Ferretería El Campin" && p.rubro === "ferreteria" && p.servicio === "catalogo" && p.pagina === "sin_pagina", "clasificar: nombre limpio, rubro y servicio");
ok(p.prioridad === "alta" && p.puntos === 6 && p.titular === "por_verificar" && p.tipoTelefono === "celular" && p.telefono === "573100000000", "clasificar: prioridad, titular y teléfono");
const q = clasificar({ fuenteId: "x2", nombre: "X", sitio: "javascript:alert(1)", enlaceMaps: "http://inseguro", calificacion: 9 });
const largo = clasificar({ fuenteId: "x3", nombre: "Y", sitio: "https://ejemplo.com/" + "a".repeat(400) });
ok(largo.sitioWeb === null && largo.pagina === "tiene_pagina", "enlace muy largo: no se guarda pero cuenta como página");
ok(q.sitioWeb === null && q.enlaceMaps === null && q.calificacion === 5 && q.resenas === 0, "clasificar: rechaza enlaces raros y acota la calificación");


// Mensaje de WhatsApp (D-174, versión B)
const id = "8f3a1c2b-9d4e-4a7b-b1c2-3d4e5f6a7b8c";
ok(codigoDe(id) === "8f3a1c2b9d", "código corto de 10 letras");
ok(nombreCorto("Dentica Dental Clinic Bogotá - Dental Anxiety Specialists") === "Dentica Dental Clinic Bogotá" && nombreCorto("Mattelsa Bogotá | Chapinero") === "Mattelsa Bogotá" && nombreCorto("Ferretería El Campin") === "Ferretería El Campin", "nombre corto del negocio");
ok(whatsappDe({ telefono: "573054127369" }) === "573054127369" && whatsappDe({ telefono: "3057482519" }) === "573057482519" && whatsappDe({ telefono: "576012345678" }) === null && whatsappDe({ telefono: null }) === null, "WhatsApp solo a celulares");
// 9 a. m., 3 p. m. y 8 p. m. en Bogotá (UTC-5)
ok(saludoDe(Date.parse("2026-11-23T14:00:00Z")) === "Buenos días" && saludoDe(Date.parse("2026-11-23T20:00:00Z")) === "Buenas tardes" && saludoDe(Date.parse("2026-11-24T01:00:00Z")) === "Buenas noches", "saludo según la hora de Bogotá");
ok(enlaceAgenda({ id, pagina: "sin_pagina", servicio: "catalogo" }) === "https://aratasan.com/agendar?tipo=catalogo&p=8f3a1c2b9d", "enlace con tipo y código");
ok(enlaceAgenda({ id, pagina: "tiene_pagina", servicio: "pagina" }).includes("tipo=auditoria"), "si ya tiene página, el enlace va a la auditoría");
const m = mensajeProspecto({ id, nombre: "Ferretería El Campin", rubro: "ferreteria", pagina: "sin_pagina", servicio: "catalogo" }, "Andrés Gómez", Date.parse("2026-11-23T20:00:00Z"));
ok(m.startsWith("Buenas tardes. Le escribe Andrés, de Arata San, una agencia de Bogotá. Encontramos Ferretería El Campin en Google Maps y vimos que todavía no tienen página."), "mensaje B: saludo, quién firma y de dónde salió el número");
ok(m.includes("catálogos para vender por WhatsApp") && m.includes("p=8f3a1c2b9d") && m.endsWith("Si no desea que le escribamos, responda NO y no volveremos a contactarle."), "mensaje B: oferta, enlace y cómo pedir que no le escribamos");
const d = mensajeProspecto({ id, nombre: "Dra. Camila Novoa", rubro: "odontologia", pagina: "solo_redes", servicio: "pagina" }, "", Date.parse("2026-11-23T14:00:00Z"));
ok(d.includes("Le escribimos de Arata San") && d.includes("redes pero no una página propia") && d.includes("apartan su cita solos"), "mensaje B: consultorio con solo redes y sin firma");
ok(!/conversi[oó]n|ROI/i.test(m + d), "sin jerga (conversión, ROI)");

if (process.exitCode) console.log("HAY FALLAS");
