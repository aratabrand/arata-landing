// Prueba de la clasificación de prospectos (D-173). Correr:  npx -y tsx scripts/prueba-prospectos.ts
import { clasificar, paginaDe, prioridadDe, puntuar, rubroDe, telefonoTexto, tipoTelefonoDe, titularDe } from "../lib/panel/clientes/prospectos";
const ok = (c: boolean, m: string) => { console.log((c ? "✓ " : "✗ ") + m); if (!c) process.exitCode = 1; };

ok(rubroDe("Hardware store") === "ferreteria" && rubroDe("Tool store") === "ferreteria", "ferretería desde la categoría de Google");
ok(rubroDe("Dentist") === "odontologia" && rubroDe("Orthodontist") === "odontologia", "odontología");
ok(rubroDe("Auto parts store") === "repuestos" && rubroDe("Clothing store") === "ropa" && rubroDe("Bakery") === "panaderia", "repuestos, ropa y panadería");
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

if (process.exitCode) console.log("HAY FALLAS");
