// Importa a Clientes → Prospectos los negocios que encontró Sellbird (D-171).
//
// Uso:
//   npx -y tsx scripts/panel-importar-prospectos.ts prospectos.csv            (escribe en la base de .env.local)
//   npx -y tsx scripts/panel-importar-prospectos.ts prospectos.csv --sql      (solo imprime el SQL, no toca nada)
//   --con-otros  incluye también los negocios fuera de los rubros de Arata
//
// ⚠ DATABASE_URL debe ser la base de Neon "arata-panel", nunca la de un catálogo.
//
// El CSV (UTF-8, con encabezado) lleva estas columnas; las que falten quedan vacías:
//   fuente_id, nombre, categoria, sitio, telefono, ciudad, resenas, calificacion, enlace_maps
// Sale de la base de Sellbird (data/sellbird.db, tabla companies + observations) o de `sellbird export --all`.
//
// Reimportar no duplica (mismo fuente_id) y nunca pisa lo que el equipo ya trabajó: estado, notas,
// ni el titular si alguien lo cambió después de revisar el RUES. Un «No contactar» se queda así.
import { readFileSync } from "node:fs";
import { clasificar, type FilaSellbird } from "../lib/panel/clientes/prospectos";

const [archivo, ...flags] = process.argv.slice(2);
if (!archivo) {
  console.error("Falta el CSV. Uso: npx -y tsx scripts/panel-importar-prospectos.ts prospectos.csv [--sql]");
  process.exit(1);
}
const soloSql = flags.includes("--sql");
// Por defecto solo los rubros que atiende Arata; --con-otros trae también los demás
const conOtros = flags.includes("--con-otros");

/** CSV sencillo con comillas dobles (RFC 4180). */
function leerCsv(texto: string): Record<string, string>[] {
  const filas: string[][] = [];
  let fila: string[] = [];
  let campo = "";
  let comillas = false;
  const t = texto.replace(/^﻿/, "");
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (comillas) {
      if (c === '"' && t[i + 1] === '"') ((campo += '"'), i++);
      else if (c === '"') comillas = false;
      else campo += c;
    } else if (c === '"') comillas = true;
    else if (c === ",") (fila.push(campo), (campo = ""));
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && t[i + 1] === "\n") i++;
      (fila.push(campo), filas.push(fila), (fila = []), (campo = ""));
    } else campo += c;
  }
  if (campo || fila.length) (fila.push(campo), filas.push(fila));
  const [cab, ...resto] = filas.filter((f) => f.some((x) => x.trim()));
  return resto.map((f) => Object.fromEntries(cab.map((k, i) => [k.trim(), (f[i] ?? "").trim()])));
}

const num = (v: string) => (v === "" || !Number.isFinite(Number(v)) ? null : Number(v));
const filas: FilaSellbird[] = leerCsv(readFileSync(archivo, "utf8"))
  .filter((r) => r.fuente_id && r.nombre)
  .map((r) => ({
    fuenteId: r.fuente_id.slice(0, 200),
    nombre: r.nombre,
    categoria: r.categoria || null,
    sitio: r.sitio || null,
    telefono: r.telefono || null,
    ciudad: r.ciudad || null,
    enlaceMaps: r.enlace_maps || null,
    resenas: num(r.resenas),
    calificacion: num(r.calificacion),
  }));
const prospectos = [...new Map(filas.map((f) => [f.fuenteId, clasificar(f)])).values()].filter((p) => conOtros || p.rubro !== "otro");
if (!prospectos.length) {
  console.error("El CSV no trae negocios (revisa las columnas fuente_id y nombre).");
  process.exit(1);
}

const COLS = [
  "fuente_id",
  "nombre",
  "rubro",
  "categoria",
  "servicio",
  "pagina",
  "sitio_web",
  "telefono",
  "tipo_telefono",
  "ciudad",
  "enlace_maps",
  "resenas",
  "calificacion",
  "titular",
  "prioridad",
  "puntos",
] as const;
const valores = (p: ReturnType<typeof clasificar>) => [
  p.fuenteId,
  p.nombre,
  p.rubro,
  p.categoria,
  p.servicio,
  p.pagina,
  p.sitioWeb,
  p.telefono,
  p.tipoTelefono,
  p.ciudad,
  p.enlaceMaps,
  p.resenas,
  p.calificacion,
  p.titular,
  p.prioridad,
  p.puntos,
];

// Datos del negocio: se actualizan siempre. Titular y prioridad: solo si nadie cambió el titular.
const UPSERT = `
  on conflict (negocio_id, fuente_id) do update set
    nombre = excluded.nombre, rubro = excluded.rubro, categoria = excluded.categoria, servicio = excluded.servicio,
    pagina = excluded.pagina, sitio_web = excluded.sitio_web, telefono = excluded.telefono, tipo_telefono = excluded.tipo_telefono,
    ciudad = excluded.ciudad, enlace_maps = excluded.enlace_maps, resenas = excluded.resenas, calificacion = excluded.calificacion,
    puntos = case when prospectos.titular = excluded.titular then excluded.puntos else prospectos.puntos end,
    prioridad = case when prospectos.titular = excluded.titular then excluded.prioridad else prospectos.prioridad end,
    actualizado = now()`;
const AGENCIA = `(select id from negocios where tipo = 'agencia' limit 1)`;

if (soloSql) {
  const lit = (v: unknown) => (v === null || v === undefined ? "null" : typeof v === "number" ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
  // Por tandas de 100 para no armar una sola sentencia gigante
  for (let i = 0; i < prospectos.length; i += 100) {
    const tanda = prospectos.slice(i, i + 100);
    // La agencia se busca una vez por tanda (no en cada fila)
    console.log(
      `insert into prospectos (negocio_id, ${COLS.join(", ")})\nselect a.id, v.* from (select id from negocios where tipo = 'agencia' limit 1) a cross join (values\n` +
        tanda.map((p) => `(${valores(p).map(lit).join(",")})`).join(",\n") +
        `) v(${COLS.join(", ")})` +
        UPSERT +
        ";\n",
    );
  }
}

async function escribir() {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    /* sin .env.local: se usa el entorno */
  }
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Falta DATABASE_URL (en .env.local o en el entorno).");
    process.exit(1);
  }
  const { default: pg } = await import("pg");
  const conexionSegura = (u: string) => u.replace(/([?&]sslmode=)(prefer|require|verify-ca)\b/, "$1verify-full");
  const cliente = new pg.Client({ connectionString: conexionSegura(url) });
  await cliente.connect();
  try {
    await cliente.query("begin");
    const ph = COLS.map((_, i) => `$${i + 1}`).join(", ");
    for (const p of prospectos) await cliente.query(`insert into prospectos (negocio_id, ${COLS.join(", ")}) values (${AGENCIA}, ${ph})${UPSERT}`, valores(p));
    await cliente.query("commit");
  } catch (e) {
    await cliente.query("rollback");
    console.error("✗ No se importó nada:", e instanceof Error ? e.message : e);
    process.exit(1);
  } finally {
    await cliente.end();
  }
}

function resumen() {
  const cuenta = (k: "prioridad" | "titular" | "rubro") =>
    Object.entries(prospectos.reduce<Record<string, number>>((a, p) => ((a[p[k]] = (a[p[k]] ?? 0) + 1), a), {}))
      .map(([v, n]) => `${v} ${n}`)
      .join(" · ");
  console.error(`${soloSql ? "SQL listo" : "✓ Importados"}: ${prospectos.length} prospectos`);
  console.error(`  Prioridad: ${cuenta("prioridad")}`);
  console.error(`  Titular:   ${cuenta("titular")}`);
  console.error(`  Rubro:     ${cuenta("rubro")}`);
}

if (soloSql) resumen();
else escribir().then(resumen);
