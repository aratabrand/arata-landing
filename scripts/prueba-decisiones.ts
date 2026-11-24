// Prueba de la bitácora de decisiones (D-194). Uso:
//   npx -y tsx scripts/prueba-decisiones.ts              → revisa todo el proyecto
//   npx -y tsx scripts/prueba-decisiones.ts --siguiente  → dice el siguiente número libre (mira también main)
//
// Revisa:
//   ERROR  · un ID repetido, en los dos archivos a la vez, con huecos o mal escrito (siempre D-000, 3 cifras)
//   ERROR  · una referencia en el código o en los documentos a un ID que no existe
//   ERROR  · una fila sin fecha o sin estado
//   AVISO  · una cita a una decisión ARCHIVADA que no dice que es historia (antes, archivada, reemplaza, revierte…)
//   AVISO  · una decisión vigente cuyo estado dice que se reemplazó del todo (debería ir al archivo)
//   AVISO  · decisiones que siguen en «Propuesta», «Por confirmar» o «Pendiente»
//   AVISO  · una decisión archivada cuyo estado no dice qué la reemplazó
// Sale con código 1 si hay errores. Los avisos no frenan.
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const VIGENTES = "docs/decisiones.md";
const ARCHIVO = "docs/decisiones-archivo.md";
// Fila: | ID | Fecha | Decisión | Por qué | Quién | Estado | (el archivo agrega una nota al final)
const FILA = /^\| (D-\d+) \|/;

type Fila = { id: string; n: number; fecha: string; estado: string; texto: string; linea: number };

function leerTabla(texto: string): Fila[] {
  return texto.split("\n").flatMap((l, i) => {
    const m = FILA.exec(l);
    if (!m) return [];
    const c = l.split("|").map((x) => x.trim()); // ["", ID, Fecha, Decisión, Por qué, Quién, Estado, nota?]
    return [{ id: m[1], n: Number(m[1].slice(2)), fecha: c[2] ?? "", estado: c[6] ?? "", texto: c[3] ?? "", linea: i + 1 }];
  });
}

function git(cmd: string): string {
  try {
    return execSync(`git ${cmd}`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return "";
  }
}

const vigentes = leerTabla(readFileSync(VIGENTES, "utf8"));
const archivadas = leerTabla(readFileSync(ARCHIVO, "utf8"));
const todas = [...vigentes, ...archivadas];
const max = Math.max(...todas.map((f) => f.n));

// ── --siguiente: el número libre más alto entre esta rama y main ──
if (process.argv.includes("--siguiente")) {
  const enMain = leerTabla(git(`show origin/main:${VIGENTES}`) + "\n" + git(`show origin/main:${ARCHIVO}`));
  const maxMain = enMain.length ? Math.max(...enMain.map((f) => f.n)) : 0;
  const siguiente = Math.max(max, maxMain) + 1;
  console.log(`Siguiente decisión libre: D-${String(siguiente).padStart(3, "0")}`);
  console.log(`  (en esta rama la última es D-${String(max).padStart(3, "0")}; en origin/main, D-${String(maxMain).padStart(3, "0")}.`);
  console.log("   Antes, trae main al día: git fetch origin main)");
  if (maxMain >= max && enMain.length) {
    const nuevasRama = vigentes.filter((f) => !enMain.some((m) => m.id === f.id && m.texto === f.texto));
    const chocan = nuevasRama.filter((f) => enMain.some((m) => m.id === f.id));
    if (chocan.length) console.log(`  ⚠ Estas decisiones de la rama usan un número que main ya usa para otra cosa: ${chocan.map((f) => f.id).join(", ")}. Renuméralas antes de unir.`);
  }
  process.exit(0);
}

const errores: string[] = [];
const avisos: string[] = [];

// ── IDs: formato, repetidos, en los dos archivos, huecos ──
for (const f of todas) {
  if (!/^D-\d{3}$/.test(f.id)) errores.push(`${f.id} (línea ${f.linea}): el ID va con 3 cifras, p. ej. D-007`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f.fecha)) errores.push(`${f.id}: fecha «${f.fecha}» (va AAAA-MM-DD)`);
  if (!f.estado) errores.push(`${f.id}: sin estado`);
}
for (const [nombre, lista] of [[VIGENTES, vigentes], [ARCHIVO, archivadas]] as const) {
  const vistos = new Map<string, number>();
  for (const f of lista) {
    if (vistos.has(f.id)) errores.push(`${f.id} repetida en ${nombre} (líneas ${vistos.get(f.id)} y ${f.linea})`);
    vistos.set(f.id, f.linea);
  }
}
for (const f of vigentes) if (archivadas.some((a) => a.id === f.id)) errores.push(`${f.id} está en vigentes y en el archivo a la vez`);
const ids = new Set(todas.map((f) => f.n));
for (let i = 1; i <= max; i++) if (!ids.has(i)) errores.push(`Falta D-${String(i).padStart(3, "0")} (hueco en la numeración)`);

// ── Estados ──
const pendientes = vigentes.filter((f) => /^(Propuesta|Por confirmar|Pendiente)/i.test(f.estado));
if (pendientes.length) avisos.push(`${pendientes.length} decisiones sin confirmar: ${pendientes.map((f) => `${f.id} (${f.estado})`).join(", ")}`);
for (const f of vigentes) {
  if (/^(Reemplazada|Revertida)(?! \(parcial\))/i.test(f.estado))
    avisos.push(`${f.id} figura como «${f.estado}»: si ya no queda nada vigente, pásala a ${ARCHIVO}`);
}

for (const f of archivadas) {
  if (!/^(Reemplazada|Revertida|Archivada)/i.test(f.estado))
    avisos.push(`${f.id} está en ${ARCHIVO} con estado «${f.estado}»: debe decir «Reemplazada por…», «Revertida por…» o «Archivada (…)»`);
}

// ── Referencias en el proyecto ──
const archivadasIds = new Set(archivadas.map((f) => f.id));
const historia = /antes|archivad|reemplaz|revert|revirti|descart|origen|histori|ya no|se quit|se quita|vigente|→/i;
const archivos = git("ls-files")
  .split("\n")
  .filter((a) => a && /\.(ts|tsx|mjs|js|css|sql|md|json)$/.test(a) && a !== VIGENTES && a !== ARCHIVO && !a.startsWith("db/"));
let referencias = 0;
const archivadasCitadas: string[] = [];
for (const a of archivos) {
  let texto: string;
  try {
    texto = readFileSync(a, "utf8");
  } catch {
    continue;
  }
  texto.split("\n").forEach((l, i) => {
    for (const m of l.matchAll(/\bD-(\d{1,4})\b/g)) {
      referencias++;
      const n = Number(m[1]);
      const id = `D-${String(n).padStart(3, "0")}`;
      if (!ids.has(n)) errores.push(`${a}:${i + 1} cita ${m[0]}, que no existe`);
      else if (archivadasIds.has(id) && !historia.test(l)) archivadasCitadas.push(`${a}:${i + 1} cita ${id} (archivada)`);
    }
  });
}
if (archivadasCitadas.length)
  avisos.push(`Citas a decisiones archivadas sin decir que son historia (cita la vigente o escribe «antes», «archivada»):\n    ${archivadasCitadas.join("\n    ")}`);

// ── Resultado ──
console.log(`Decisiones: ${vigentes.length} vigentes + ${archivadas.length} archivadas (D-001 a D-${String(max).padStart(3, "0")}), ${referencias} referencias en ${archivos.length} archivos.`);
for (const a of avisos) console.log(`AVISO · ${a}`);
for (const e of errores) console.log(`ERROR · ${e}`);
if (errores.length) {
  console.log(`\n✗ ${errores.length} errores.`);
  process.exit(1);
}
console.log("\n✓ Sin errores.");
