// Prueba de las alertas de vencimiento (D-119). Correr:  npx -y tsx scripts/prueba-alertas.ts
import { alertasVencimiento } from "../lib/panel/alertas";
import type { FinProyecto } from "../lib/panel/finanzas/tipos";
const ok = (c: boolean, m: string) => { console.log((c ? "✓ " : "✗ ") + m); if (!c) process.exitCode = 1; };
const P = (id: string, limite: string | null, estado: FinProyecto["estado"] = "en-curso"): FinProyecto => ({ id, nombre: id, clienteId: null, servicioId: null, estado, valor: 0, fechaCierre: null, fechaInicio: null, fechaLimite: limite, tarifaDia: null, repartoCongelado: null, notas: null });
const T = (pid: string, hecha: boolean) => ({ id: pid + Math.random(), proyectoId: pid, etapa: "construccion" as const, texto: "x", hecha, orden: 0 });
const hoy = "2026-11-12";
const proyectos = [P("en2", "2026-11-14"), P("en1", "2026-11-13"), P("hoy", "2026-11-12"), P("tarde", "2026-11-10"), P("lejos", "2026-11-20"), P("prop", "2026-11-12", "propuesta"), P("listo", "2026-11-10"), P("sinfecha", null), P("cerradoSinPasos", "2026-11-01", "cerrado")];
const tareas = [T("en2", false), T("hoy", false), T("tarde", true), T("tarde", false), T("listo", true)];
const a = alertasVencimiento({ proyectos, tareas }, hoy);
const de = (id: string) => a.find((x) => x.proyecto.id === id);
ok(de("en2")?.tipo === "faltan-2" && de("en2")?.dias === 2, "2 días antes → por vencer");
ok(de("en1")?.tipo === "faltan-2" && de("en1")?.dias === 1, "1 día antes → por vencer (se ve en la pestaña)");
ok(de("hoy")?.tipo === "hoy", "el día de entrega → hoy");
ok(de("tarde")?.tipo === "tarde" && de("tarde")?.dias === -2 && de("tarde")!.texto.includes("hace 2 días") && de("tarde")!.pct === 50, "después → va tarde (hace 2 días, 50 %)");
ok(!de("lejos") && !de("prop") && !de("listo") && !de("sinfecha") && !de("cerradoSinPasos"), "no avisa: lejos, propuestas, entregados, sin fecha ni cerrados sin pasos");
ok(a[0].proyecto.id === "tarde", "primero lo más urgente");
if (process.exitCode) console.log("HAY FALLAS");
