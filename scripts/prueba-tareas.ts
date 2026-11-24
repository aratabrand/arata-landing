// Prueba de Tareas (D-181), sin base de datos. Correr:  npx -y tsx scripts/prueba-tareas.ts
import { activaEn, duracion, moverRango, rangoTexto, vence, cuandoLlega, textoRecordatorio, tocaRecordar, diasDeSemana, diasLaborales, esFinDeSemana, semanaDeTrabajo, fechaCorta, lunesDe, ordenarDia, ordenarTabla, partesDia, rangoSemana, resumenDiario, sumarDias, vencida, type Tarea } from "../lib/panel/tareas/tareas";
const ok = (c: boolean, m: string) => { console.log((c ? "✓ " : "✗ ") + m); if (!c) process.exitCode = 1; };

// Semanas de lunes a domingo
ok(lunesDe("2026-11-24") === "2026-11-23" && lunesDe("2026-11-23") === "2026-11-23" && lunesDe("2026-11-29") === "2026-11-23", "lunes de la semana (martes, lunes y domingo)");
ok(lunesDe("2027-01-01") === "2026-12-28", "la semana cruza de año");
ok(JSON.stringify(diasDeSemana("2026-11-23")) === JSON.stringify(["2026-11-23", "2026-11-24", "2026-11-25", "2026-11-26", "2026-11-27", "2026-11-28", "2026-11-29"]), "7 días de lunes a domingo");
ok(sumarDias("2026-02-28", 1) === "2026-03-01" && sumarDias("2026-03-01", -1) === "2026-02-28", "sumar y restar días");
ok(partesDia("2026-11-24").dia === "Martes" && partesDia("2026-11-24").corto === "24 nov", "nombre del día y fecha corta");
ok(rangoSemana("2026-11-23") === "23 – 27 nov" && rangoSemana("2026-12-28") === "28 dic – 1 ene" && rangoSemana("2026-11-23", 6) === "23 – 29 nov", "rango de lunes a viernes (y hasta el domingo si se pide)");
ok(diasLaborales("2026-11-23").length === 5 && diasLaborales("2026-11-23")[4] === "2026-11-27", "tablero de lunes a viernes");
ok(esFinDeSemana("2026-11-28") && esFinDeSemana("2026-11-29") && !esFinDeSemana("2026-11-27"), "sábado y domingo son fin de semana");
ok(semanaDeTrabajo("2026-11-25") === "2026-11-23" && semanaDeTrabajo("2026-11-28") === "2026-11-30" && semanaDeTrabajo("2026-11-29") === "2026-11-30", "el fin de semana el tablero abre la semana siguiente");
ok(fechaCorta("2026-11-24", "2026-11-24") === "Hoy" && fechaCorta("2026-11-25", "2026-11-24") === "Mañana" && fechaCorta("2026-11-23", "2026-11-24") === "Ayer", "hoy, mañana y ayer");
ok(fechaCorta("2026-11-27", "2026-11-24") === "Vie 27 nov" && fechaCorta(null, "2026-11-24") === "Sin fecha", "otro día y sin fecha");

// Vencidas y orden
const t = (x: Partial<Tarea>): Tarea => ({ id: x.id ?? "a", titulo: x.titulo ?? "T", descripcion: null, area: "marketing", proyectoId: null, responsables: x.responsables ?? [], fecha: x.fecha ?? null, fechaFin: x.fechaFin ?? null, prioridad: x.prioridad ?? "media", estado: x.estado ?? "por_hacer", orden: x.orden ?? 0, recordatorio: x.recordatorio ?? null, creadoPor: null, creado: x.creado ?? "2026-11-01T00:00:00Z", items: [], comentarios: [] });
ok(vencida(t({ fecha: "2026-11-23" }), "2026-11-24") && !vencida(t({ fecha: "2026-11-23", estado: "hecha" }), "2026-11-24") && !vencida(t({ fecha: null }), "2026-11-24"), "vencida: pendiente con fecha pasada");
const dia = ordenarDia([t({ id: "hecha", estado: "hecha", orden: 1 }), t({ id: "b", orden: 2 }), t({ id: "a", orden: 1 })]);
ok(dia.map((x) => x.id).join() === "a,b,hecha", "en el día: pendientes por orden y las hechas al final");
const empate = ordenarDia([t({ id: "media", prioridad: "media" }), t({ id: "urgente", prioridad: "urgente" })]);
ok(empate[0].id === "urgente", "mismo orden: primero la más urgente");
const tabla = ordenarTabla([t({ id: "sin", fecha: null }), t({ id: "jue", fecha: "2026-11-26" }), t({ id: "lun", fecha: "2026-11-23" })], "fecha", true, () => "");
ok(tabla.map((x) => x.id).join() === "lun,jue,sin", "tabla por fecha: sin fecha al final");
const porPrioridad = ordenarTabla([t({ id: "baja", prioridad: "baja" }), t({ id: "urg", prioridad: "urgente" }), t({ id: "alta", prioridad: "alta" })], "prioridad", true, () => "");
ok(porPrioridad.map((x) => x.id).join() === "urg,alta,baja", "tabla por prioridad: urgente primero");
const porNombre = ordenarTabla([t({ id: "x", responsables: [] }), t({ id: "s", responsables: ["s"] }), t({ id: "a", responsables: ["a", "s"] })], "responsable", true, (id) => (id === "a" ? "Andrés" : "Santiago"));
ok(porNombre.map((x) => x.id).join() === "a,s,x", "tabla por responsable: sin asignar al final");

// Aviso de las 8 a. m.
const hoy = "2026-11-24";
ok(resumenDiario("Sergio", [t({ fecha: "2026-11-25" }), t({ fecha: hoy, estado: "hecha" })], hoy) === null, "sin pendientes de hoy ni vencidas: no avisa");
const r = resumenDiario("Andrés Cuadros", [t({ titulo: "Llamar a Pets And Go", fecha: hoy, prioridad: "urgente" }), t({ titulo: "Factura", fecha: "2026-11-20" }), t({ fecha: hoy })], hoy)!;
ok(r.titulo === "⚠️ Andrés, tienes 2 para hoy y 1 vencida", "título: para hoy y vencidas");
ok(r.cuerpo === "Empieza por: Llamar a Pets And Go (y 2 más)", "empieza por la más urgente");
ok(resumenDiario("Santi", [t({ fecha: hoy })], hoy)!.titulo === "✅ Santi, tienes 1 para hoy", "solo de hoy: sin alerta");

// Recordatorios (D-183)
ok(!tocaRecordar(t({ fecha: "2026-11-27", recordatorio: "1_dia" }), "2026-11-25"), "un día antes: el miércoles todavía no (tarea del viernes)");
ok(tocaRecordar(t({ fecha: "2026-11-27", recordatorio: "1_dia" }), "2026-11-26"), "un día antes: llega el jueves");
ok(tocaRecordar(t({ fecha: "2026-11-27", recordatorio: "mismo_dia" }), "2026-11-27") && !tocaRecordar(t({ fecha: "2026-11-27", recordatorio: "mismo_dia" }), "2026-11-26"), "el mismo día: solo ese día");
ok(tocaRecordar(t({ fecha: "2026-11-27", recordatorio: "1_semana" }), "2026-11-26"), "puesto tarde (una semana antes): llega en el siguiente aviso");
ok(!tocaRecordar(t({ fecha: "2026-11-27", recordatorio: "1_dia", estado: "hecha" }), "2026-11-26") && !tocaRecordar(t({ fecha: null, recordatorio: "1_dia" }), "2026-11-26") && !tocaRecordar(t({ fecha: "2026-11-24", recordatorio: "1_dia" }), "2026-11-26"), "no llega si está hecha, sin fecha o ya pasó");
ok(textoRecordatorio(t({ titulo: "Enviar cotización", fecha: "2026-11-27", prioridad: "urgente" }), "2026-11-26").cuerpo === "Es para mañana · Urgente", "texto del recordatorio");
ok(cuandoLlega("1_dia", "2026-11-27", "2026-11-24") === "Llega jue 26 nov a las 8 a. m." && cuandoLlega(null, "2026-11-27", "2026-11-24") === null, "la ficha dice cuándo llega");

// Rango de fechas (D-187)
const r3 = t({ fecha: "2026-11-23", fechaFin: "2026-11-26" });
ok(vence(r3) === "2026-11-26" && duracion(r3) === 4 && duracion(t({ fecha: "2026-11-23" })) === 1, "rango: vence el último día y dura 4");
ok(activaEn(r3, "2026-11-23") && activaEn(r3, "2026-11-25") && !activaEn(r3, "2026-11-27") && !activaEn(t({ fecha: null }), "2026-11-23"), "rango: sale en cada día que dura");
ok(!vencida(r3, "2026-11-25") && vencida(r3, "2026-11-27"), "rango: vencida solo después del último día");
ok(rangoTexto(r3, "2026-11-20") === "Lun 23 – Jue 26 nov" && rangoTexto(t({ fecha: "2026-11-30", fechaFin: "2026-12-02" }), "2026-11-20") === "Lun 30 nov – Mié 2 dic", "texto del rango (mismo mes y entre meses)");
ok(JSON.stringify(moverRango(r3, "2026-11-26", "2026-11-25")) === JSON.stringify({ fecha: "2026-11-24", fechaFin: "2026-11-27" }), "mover: arrastrar el miércoles al jueves corre todo un día");
ok(JSON.stringify(moverRango(r3, null, "2026-11-25")) === JSON.stringify({ fecha: null, fechaFin: null }) && JSON.stringify(moverRango(t({ fecha: "2026-11-23" }), "2026-11-27", "2026-11-23")) === JSON.stringify({ fecha: "2026-11-27", fechaFin: null }), "mover a «Sin fecha» y mover tarea de un día");
ok(tocaRecordar({ recordatorio: "1_dia", fecha: "2026-11-23", fechaFin: "2026-11-27", estado: "por_hacer" }, "2026-11-26") && !tocaRecordar({ recordatorio: "1_dia", fecha: "2026-11-23", fechaFin: "2026-11-27", estado: "por_hacer" }, "2026-11-22"), "recordatorio cuenta desde el final del rango");
const rr = resumenDiario("Sergio", [{ titulo: "Rango en curso", fecha: "2026-11-20", fechaFin: "2026-11-26", estado: "por_hacer", prioridad: "media" }], "2026-11-24")!;
ok(rr.titulo === "✅ Sergio, tienes 1 para hoy", "un rango en curso cuenta «para hoy», no vencida");
