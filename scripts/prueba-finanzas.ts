// Prueba de los cálculos de finanzas (D-108). Correr:  npx -y tsx scripts/prueba-finanzas.ts
// Cada línea debe salir con ✓. Si cambias lib/panel/finanzas/calculo.ts, córrela antes de subir.
import { calcularProyecto, resumenFinanzas, proyectar, validarReglas, participacionHistorica } from "../lib/panel/finanzas/calculo";
import type { DatosFinanzas } from "../lib/panel/finanzas/tipos";
const personas = [
  { id: "S", nombre: "Sergio", area: "Diseño", esSocio: true, usuarioId: null, activo: true },
  { id: "A", nombre: "Andrés", area: "Comercial", esSocio: true, usuarioId: null, activo: true },
  { id: "T", nombre: "Santiago", area: "Tecnología", esSocio: true, usuarioId: null, activo: true },
];
const reglas = { bolsaTrabajoPct: 30, reparto: [{ beneficiario: "S", pct: 25 }, { beneficiario: "A", pct: 25 }, { beneficiario: "T", pct: 25 }, { beneficiario: "empresa", pct: 25 }] };
const ok = (c: boolean, m: string) => { console.log((c ? "✓ " : "✗ ") + m); if (!c) process.exitCode = 1; };
// Proyecto: 2.000.000, gastos 200.000 → ganancia 1.800.000; bolsa 540.000; resto 1.260.000 (315.000 c/u)
// Horas: S 10, T 20 → S trabajo 180.000, T 360.000
const p = { id: "p1", nombre: "Landing", clienteId: null, servicioId: null, estado: "cerrado" as const, valor: 2_000_000, fechaCierre: "2026-11-05", repartoCongelado: null, notas: null };
const gastos = [{ id: "g1", proyectoId: "p1", concepto: "Plantilla", categoria: "herramientas" as const, valor: 200_000, fecha: "2026-11-01" }, { id: "g2", proyectoId: null, concepto: "Canva", categoria: "herramientas" as const, valor: 50_000, fecha: "2026-11-02" }];
const horas = [{ id: "h1", proyectoId: "p1", personaId: "S", area: "Diseño", horas: 10, fecha: "2026-11-02", nota: null }, { id: "h2", proyectoId: "p1", personaId: "T", area: "Tecnología", horas: 20, fecha: "2026-11-03", nota: null }];
const r = calcularProyecto(p, gastos, horas, reglas, personas);
const de = (id: string) => r.personas.find((x) => x.personaId === id)!;
ok(r.ganancia === 1_800_000, "ganancia 1.800.000 → " + r.ganancia);
ok(r.bolsa === 540_000 && r.resto === 1_260_000, "bolsa 540.000 / resto 1.260.000");
ok(de("S").trabajo === 180_000 && de("T").trabajo === 360_000 && de("A").trabajo === 0, "bolsa por horas S 180.000 · T 360.000 · A 0");
ok(de("S").total === 495_000 && de("A").total === 315_000 && de("T").total === 675_000, "totales S 495.000 · A 315.000 · T 675.000");
ok(r.empresa === 315_000, "empresa 315.000 → " + r.empresa);
ok(r.personas.reduce((a, x) => a + x.total, 0) + r.empresa === r.ganancia, "todo suma exacto la ganancia");
// Sin horas: bolsa va al resto
const r2 = calcularProyecto({ ...p, id: "p2" }, [], [], reglas, personas);
ok(r2.sinHoras && r2.bolsa === 0 && r2.empresa === 500_000, "sin horas: 2.000.000 se reparte 25 % c/u → empresa 500.000");
// Pérdida
const r3 = calcularProyecto({ ...p, id: "p3", valor: 100_000 }, [{ ...gastos[0], proyectoId: "p3" }], [], reglas, personas);
ok(r3.perdida && r3.empresa === -100_000 && r3.personas.every((x) => x.total === 0), "pérdida: no se reparte, empresa −100.000");
// Redondeo: valor impar
const r4 = calcularProyecto({ ...p, id: "p4", valor: 1_000_001 }, [], [{ ...horas[0], proyectoId: "p4" }, { ...horas[1], proyectoId: "p4", horas: 7 }], reglas, personas);
ok(r4.personas.reduce((a, x) => a + x.total, 0) + r4.empresa === 1_000_001, "redondeo: la suma da exacto 1.000.001");
// Congelado: cambiar reglas no cambia proyecto cerrado congelado
const rc = calcularProyecto({ ...p, repartoCongelado: reglas }, gastos, horas, { bolsaTrabajoPct: 0, reparto: [{ beneficiario: "empresa", pct: 100 }] }, personas);
ok(rc.empresa === 315_000, "reglas congeladas: cambiar % después no altera el proyecto cerrado");
// Validación
ok(validarReglas(reglas, personas).length === 0, "reglas válidas");
ok(validarReglas({ ...reglas, reparto: reglas.reparto.map((x) => ({ ...x, pct: 20 })) }, personas)[0]?.includes("suman 80"), "detecta que no suman 100");
// Resumen y fondos
const d: DatosFinanzas = { negocioId: "n", puedeEditar: true, miPersonaId: "S", demo: false, personas, config: { ...reglas, reservaMeses: 3, actualizado: null }, proyectos: [p, { ...p, id: "px", estado: "en-curso", fechaCierre: null }], gastos, horas, gastosFijos: [{ id: "f", concepto: "Herramientas", valorMensual: 100_000, activo: true }], servicios: [], clientes: [] };
const res = resumenFinanzas(d);
ok(res.cerrados === 1 && res.ingresos === 2_000_000, "resumen solo cuenta cerrados");
ok(res.fondos === 265_000, "fondos = 315.000 − 50.000 gasto empresa = " + res.fondos);
ok(res.reserva === 300_000 && res.disponible === 0, "reserva 3 meses 300.000 → disponible 0");
// Proyección: 2 proyectos de 2.000.000 con 10 % gastos
const pr = proyectar({ proyectosMes: 2, valorPromedio: 2_000_000, gastosPct: 10, reglas, personas, fijosMes: 1_000_000, participacionHoras: participacionHistorica(horas) });
ok(pr.ganancia === 3_600_000 && pr.empresa === 630_000, "proyección: ganancia 3.600.000, empresa 630.000 → " + pr.empresa);
ok(pr.equilibrio === 4, "punto de equilibrio: 1.000.000 / 315.000 por proyecto = 4 proyectos → " + pr.equilibrio);
if (process.exitCode) console.log("HAY FALLAS");
