// Prueba de los cálculos de finanzas (D-118). Correr:  npx -y tsx scripts/prueba-finanzas.ts
// Cada línea debe salir con ✓. Si cambias lib/panel/finanzas/calculo.ts, córrela antes de subir.
import { calcularProyecto, resumenFinanzas, proyectar, participacionHistorica, partesActuales } from "../lib/panel/finanzas/calculo";
import type { DatosFinanzas, FinConfig, RegistroTrabajo } from "../lib/panel/finanzas/tipos";
const personas = [
  { id: "S", nombre: "Sergio", area: "Diseño", esSocio: true, usuarioId: null, activo: true },
  { id: "A", nombre: "Andrés", area: "Comercial", esSocio: true, usuarioId: null, activo: true },
  { id: "T", nombre: "Santiago", area: "Tecnología", esSocio: true, usuarioId: null, activo: true },
];
const config: FinConfig = { tarifaDia: 80_000, reservaMeses: 3, actualizado: null };
const ok = (c: boolean, m: string) => { console.log((c ? "✓ " : "✗ ") + m); if (!c) process.exitCode = 1; };

// Ejemplo de Sergio: 2.000.000, gastos 200.000 → ganancia 1.800.000.
// Sergio 5 días de desarrollo × 80.000 = 400.000 → quedan 1.400.000 ÷ 4 = 350.000 c/u
const p = { id: "p1", nombre: "Landing", clienteId: null, servicioId: null, estado: "cerrado" as const, valor: 2_000_000, fechaCierre: "2026-11-05", fechaInicio: null, fechaLimite: null, tarifaDia: null, repartoCongelado: null, notas: null };
const gastos = [{ id: "g1", proyectoId: "p1", concepto: "Plantilla", categoria: "herramientas" as const, valor: 200_000, fecha: "2026-11-01" }, { id: "g2", proyectoId: null, concepto: "Canva", categoria: "herramientas" as const, valor: 50_000, fecha: "2026-11-02" }];
const trabajo: RegistroTrabajo[] = [{ id: "t1", proyectoId: "p1", personaId: "S", actividad: "Desarrollo", dias: 5, fecha: "2026-11-02", nota: null }];
const r = calcularProyecto(p, gastos, trabajo, config, personas);
const de = (x: typeof r, id: string) => x.personas.find((y) => y.personaId === id)!;
const suma = (x: typeof r) => x.personas.reduce((a, y) => a + y.total, 0) + x.empresa;
ok(r.ganancia === 1_800_000, "ganancia = valor − gastos del proyecto = 1.800.000 → " + r.ganancia);
ok(r.pagoDias === 400_000 && r.paraRepartir === 1_400_000, "primero los días: 5 × 80.000 = 400.000; quedan 1.400.000");
ok(r.parteIgual === 350_000 && r.numPartes === 4, "partes iguales: 1.400.000 ÷ 4 = 350.000");
ok(de(r, "S").total === 750_000 && de(r, "A").total === 350_000 && de(r, "T").total === 350_000 && r.empresa === 350_000, "Sergio 750.000 · Andrés 350.000 · Santiago 350.000 · Arata 350.000");
ok(suma(r) === r.ganancia, "todo suma exacto la ganancia");
ok(r.gastos === 200_000, "el gasto de la empresa (Canva) no se resta del proyecto");

// Medio día y dos actividades de la misma persona
const t2: RegistroTrabajo[] = [...trabajo, { id: "t2", proyectoId: "p1", personaId: "S", actividad: "Diseño", dias: 0.5, fecha: "2026-11-03", nota: null }, { id: "t3", proyectoId: "p1", personaId: "T", actividad: "Desarrollo", dias: 2, fecha: "2026-11-03", nota: null }];
const r2 = calcularProyecto(p, gastos, t2, config, personas);
ok(de(r2, "S").dias === 5.5 && de(r2, "S").porDias === 440_000 && de(r2, "T").porDias === 160_000, "medios días: Sergio 5,5 → 440.000 · Santiago 2 → 160.000");
ok(suma(r2) === r2.ganancia, "con varias actividades todo suma exacto");

// Sin días: todo por partes iguales
const r3 = calcularProyecto({ ...p, id: "p3" }, [], [], config, personas);
ok(r3.pagoDias === 0 && r3.parteIgual === 500_000 && r3.empresa === 500_000, "sin días: 2.000.000 ÷ 4 = 500.000 c/u");

// Valor del día propio del proyecto
const r4 = calcularProyecto({ ...p, tarifaDia: 100_000 }, gastos, trabajo, config, personas);
ok(r4.tarifaDia === 100_000 && de(r4, "S").porDias === 500_000, "valor del día del proyecto (100.000) manda sobre el de Reparto");

// Los días cuestan más que la ganancia: se pagan en proporción, nunca más de lo que dejó
const caro: RegistroTrabajo[] = [{ ...trabajo[0], dias: 20 }, { id: "t9", proyectoId: "p1", personaId: "T", actividad: "Desarrollo", dias: 10, fecha: "2026-11-03", nota: null }];
const r5 = calcularProyecto(p, gastos, caro, config, personas);
ok(r5.recortado && r5.pagoDias <= r5.ganancia && r5.parteIgual === 0, "días > ganancia: se recortan, no hay parte igual");
ok(de(r5, "S").porDias === 1_200_000 && de(r5, "T").porDias === 600_000 && suma(r5) === r5.ganancia, "recorte proporcional: Sergio 1.200.000 · Santiago 600.000 = 1.800.000");

// Pérdida
const r6 = calcularProyecto({ ...p, id: "p6", valor: 100_000 }, [{ ...gastos[0], proyectoId: "p6" }], [], config, personas);
ok(r6.perdida && r6.empresa === -100_000 && r6.personas.every((x) => x.total === 0), "pérdida: no se reparte, la absorbe Arata (−100.000)");

// Redondeo
const r7 = calcularProyecto({ ...p, id: "p7", valor: 1_000_003 }, [], [], config, personas);
ok(r7.parteIgual === 250_000 && r7.empresa === 250_003 && suma(r7) === 1_000_003, "redondeo: lo que sobra va a Arata");

// Congelado al cierre: cambiar el valor del día o el equipo después no cambia lo cerrado
const congelado = { ...p, repartoCongelado: { tarifaDia: 80_000, partes: ["S", "A", "T", "empresa"] } };
const otroEquipo = [...personas, { id: "N", nombre: "Nuevo", area: "x", esSocio: true, usuarioId: null, activo: true }];
const r8 = calcularProyecto(congelado, gastos, trabajo, { ...config, tarifaDia: 120_000 }, otroEquipo);
ok(r8.tarifaDia === 80_000 && r8.numPartes === 4 && r8.parteIgual === 350_000, "congelado: otro valor del día y un socio nuevo no cambian lo cerrado");
ok(partesActuales(otroEquipo).length === 5, "abiertos: un socio nuevo entra a las partes");
// Forma vieja (bolsa y %) se lee sin romper
const viejo = calcularProyecto({ ...p, repartoCongelado: { bolsaTrabajoPct: 30, reparto: [{ beneficiario: "S", pct: 25 }, { beneficiario: "empresa", pct: 75 }] } as never }, gastos, [], config, personas);
ok(viejo.numPartes === 2 && suma(viejo) === viejo.ganancia, "reglas viejas congeladas se leen sin romper");

// Resumen y fondos
const d: DatosFinanzas = { negocioId: "n", puedeEditar: true, esDueno: true, puedeMarcarPasos: true, miPersonaId: "S", demo: false, personas, config, proyectos: [p, { ...p, id: "px", estado: "en-curso", fechaCierre: null }], gastos, trabajo, gastosFijos: [{ id: "f", concepto: "Herramientas", valorMensual: 100_000, activo: true }], servicios: [], clientes: [], tareas: [] };
const res = resumenFinanzas(d);
ok(res.cerrados === 1 && res.ingresos === 2_000_000, "resumen solo cuenta cerrados");
ok(res.fondos === 300_000, "fondos = 350.000 de Arata − 50.000 gasto de la empresa = " + res.fondos);
ok(res.reserva === 300_000 && res.disponible === 0, "reserva 3 meses 300.000 → disponible 0");
ok(res.porPersona.find((x) => x.persona.id === "S")!.total === 750_000, "Equipo: Sergio ganó 750.000");

// Proyección: 2 proyectos de 2.000.000, 10 % gastos, 5 días por proyecto
const pr = proyectar({ proyectosMes: 2, valorPromedio: 2_000_000, gastosPct: 10, diasPorProyecto: 5, tarifaDia: 80_000, personas, fijosMes: 1_000_000, participacionDias: participacionHistorica(trabajo) });
ok(pr.ganancia === 3_600_000 && pr.pagoDias === 800_000 && pr.parteIgual === 700_000 && pr.empresa === 700_000, "proyección: ganancia 3.600.000, días 800.000, 700.000 c/u");
ok(pr.equilibrio === 3, "punto de equilibrio: 1.000.000 ÷ 350.000 por proyecto = 3 proyectos → " + pr.equilibrio);
if (process.exitCode) console.log("HAY FALLAS");
