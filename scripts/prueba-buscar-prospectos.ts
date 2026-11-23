// Prueba de «Buscar más prospectos» (D-179), sin gastar créditos. Correr:  npx -y tsx scripts/prueba-buscar-prospectos.ts
import { ciudadDe, clasificarMaps, maxPuntos, mensajeProspecto, normalizarTelefono, puntuar, razonesDe } from "../lib/panel/clientes/prospectos";
import { FILTROS_INICIALES, NICHO, NICHOS, ZONAS, filtrosValidos, motivoDescarte } from "../lib/panel/clientes/nichos";
const ok = (c: boolean, m: string) => { console.log((c ? "✓ " : "✗ ") + m); if (!c) process.exitCode = 1; };

// Teléfonos como los muestra Google Maps en Colombia
ok(normalizarTelefono("311 4485245") === "573114485245", "celular con espacio");
ok(normalizarTelefono("(601) 6408571") === "576016408571", "fijo nuevo (601)");
ok(normalizarTelefono("16604340") === "5716604340", "fijo viejo de Bogotá");
ok(normalizarTelefono("+57 300 123 4567") === "573001234567", "ya con el 57");
ok(normalizarTelefono("") === null && normalizarTelefono(undefined) === null, "sin teléfono");
ok(ciudadDe("Cra. 44a #24 - 11, Teusaquillo, Bogotá, Cundinamarca") === "Bogotá" && ciudadDe("Cl. 10 #5-20, Chía, Cundinamarca") === "Chía", "ciudad desde la dirección");

// Nichos y zonas
ok(new Set(NICHOS.map((n) => n.clave)).size === NICHOS.length && NICHOS.every((n) => /^[a-z_]{2,40}$/.test(n.clave)), "claves de nicho únicas y válidas para la base");
ok(NICHOS.filter((n) => n.recomendado).every((n) => n.enfoque === "ya_vende" && n.servicio !== "pagina"), "los recomendados ya venden por internet y llevan catálogo o sistema");
ok(ZONAS.every((z) => /^@-?\d+\.\d+,-?\d+\.\d+,\d+z$/.test(z.ll)), "zonas con centro de mapa válido");
ok(["odontologia", "ropa", "ferreteria", "repuestos", "electrodomesticos", "panaderia"].every((k) => NICHO[k]), "los rubros de la primera carga siguen existiendo");

// Un resultado real de Google Maps (tienda de mascotas, Teusaquillo)
const mascotas = NICHO.mascotas;
const fila = { place_id: "ChIJ2ZPgbCibP44Ru535xGJ7hRs", title: "Puppy Export Tienda de Mascotas", type: "Tienda de productos para mascotas", rating: 4.5, reviews: 467, phone: "311 4485245", website: "https://instagram.com/puppyexport", address: "Cra. 44a #24 - 11, Teusaquillo, Bogotá, Cundinamarca" };
const p = clasificarMaps(fila, mascotas)!;
ok(p.fuenteId === "gmaps:ChIJ2ZPgbCibP44Ru535xGJ7hRs" && p.enlaceMaps!.endsWith("place_id:ChIJ2ZPgbCibP44Ru535xGJ7hRs"), "mismo fuente_id que la primera carga (no se duplica)");
ok(p.rubro === "mascotas" && p.servicio === "catalogo" && p.enfoque === "ya_vende" && p.delNicho, "rubro, servicio y enfoque salen del nicho");
ok(p.pagina === "solo_redes" && p.tipoTelefono === "celular" && p.ciudad === "Bogotá", "solo redes, celular y ciudad");
ok(p.puntos === 7 && p.prioridad === "alta" && maxPuntos("ya_vende") === 8, "ya vende: redes 3 + celular 1 + reseñas 2 + calificación 1 = 7 de 8 (falta ser empresa)");
ok(clasificarMaps({ ...fila, type: "Veterinario", title: "Clínica Veterinaria Sur" }, mascotas)!.delNicho === false && clasificarMaps({ ...fila, type: "Veterinario", title: "Clínica Veterinaria Sur" }, NICHO.veterinarias)!.delNicho, "una veterinaria va en su propio nicho, no en tiendas de mascotas");
ok(clasificarMaps({ ...fila, type: "Restaurante", title: "Asadero El Gran Pollo" }, mascotas)!.delNicho === false, "un restaurante no es del nicho de mascotas");
ok(clasificarMaps({ title: "Sin id" }, mascotas) === null, "sin place_id no se guarda");

// Puntaje «ya vende por internet»
const base = { resenas: 20, calificacion: 4.0, titular: "por_verificar" as const, enfoque: "ya_vende" as const };
ok(puntuar({ ...base, pagina: "solo_redes", tipoTelefono: "celular" }).puntos === 5, "vende por redes + celular + 20 reseñas = 5 (alta)");
ok(puntuar({ ...base, pagina: "tiene_pagina", tipoTelefono: "fijo" }).puntos === 3, "página sin sistema + 20 reseñas = 3 (media)");
ok(puntuar({ ...base, pagina: "sin_pagina", tipoTelefono: null }).prioridad === "baja", "sin página ni celular: baja (todavía no vende por internet)");
ok(razonesDe({ ...base, pagina: "tiene_pagina", resenas: 1321, calificacion: 4.3, tipoTelefono: "celular" }).some((r) => r.puntos < 0), "cadena grande (página y 1.000+ reseñas) resta");
ok(puntuar({ pagina: "sin_pagina", resenas: 101, calificacion: 4.5, titular: "empresa" }).puntos === 7, "el enfoque «necesita página» no cambia (7 máximo)");

// Filtros: qué se guarda
const f = filtrosValidos({ calificacionMin: 4.3, resenasMin: 10, paginas: ["solo_redes", "tiene_pagina"], soloCelular: true, prioridadMin: "media" });
ok(motivoDescarte(p, f) === null, "pasa todos los filtros");
ok(motivoDescarte({ ...p, delNicho: false }, f) === "fuera_del_nicho", "fuera del nicho primero");
ok(motivoDescarte({ ...p, calificacion: 4.1 }, f) === "calificacion" && motivoDescarte({ ...p, resenas: 3 }, f) === "resenas", "calificación y reseñas");
ok(motivoDescarte({ ...p, pagina: "sin_pagina" }, f) === "pagina" && motivoDescarte({ ...p, tipoTelefono: "fijo" }, f) === "sin_celular", "página y celular");
ok(motivoDescarte({ ...p, prioridad: "baja" }, f) === "prioridad", "prioridad mínima");
ok(motivoDescarte({ ...p, delNicho: true, calificacion: null, resenas: 0, tipoTelefono: null, prioridad: "baja" }, FILTROS_INICIALES) === null, "sin filtros entra todo lo del nicho");
const raro = filtrosValidos({ calificacionMin: 99, resenasMin: -5, paginas: ["x" as never], prioridadMin: "x" as never, soloCelular: "si" as never });
ok(raro.calificacionMin === 5 && raro.resenasMin === 0 && raro.paginas.length === 3 && raro.prioridadMin === "baja" && raro.soloCelular === false, "filtros del navegador se limpian");

// Mensaje para nichos de sistema (barberías, uñas…)
const m = mensajeProspecto({ id: "8f3a1c2b-0000-4000-8000-000000000000", nombre: "Barbería La 70", rubro: "barberias", pagina: "solo_redes", servicio: "sistema" }, "Sergio", Date.UTC(2026, 10, 23, 15));
ok(/aparten su cita/.test(m) && /tipo=sistema/.test(m) && /responda NO/.test(m), "barbería: ofrece sistema y enlaza al tipo sistema");
