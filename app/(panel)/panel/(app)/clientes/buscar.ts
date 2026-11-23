"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/panel/db";
import { panelActivo } from "@/lib/panel/config";
import { contextoAgencia, type ContextoAgencia } from "@/lib/panel/finanzas/datos";
import { registrar } from "@/lib/panel/historial";
import { clasificarMaps, type ProspectoMaps } from "@/lib/panel/clientes/prospectos";
import { DIAS_SIN_REPETIR, MAX_PAGINAS, NICHO, ZONA, filtrosValidos, motivoDescarte, type Enfoque, type Filtros, type MotivoDescarte } from "@/lib/panel/clientes/nichos";
import { buscarEnMaps, saldoScavio, scavioActivo } from "@/lib/panel/clientes/scavio";

// «Buscar más prospectos» (D-179): el panel consulta Google Maps por Scavio, una página (1 crédito)
// por llamada. Solo Sergio y Andrés. Nunca repite sin avisar una página ya pagada, nunca toca lo que
// el equipo ya trabajó (estado, notas, «No contactar») y deja todo en el historial.

type Fallo = { ok: false; error: string };
const NO = (error: string): Fallo => ({ ok: false, error });

async function contexto(): Promise<ContextoAgencia | Fallo> {
  if (!panelActivo) return NO("El panel está en modo ejemplo: no se puede buscar.");
  const ctx = await contextoAgencia();
  if (!ctx) return NO("Tu sesión terminó. Vuelve a entrar.");
  if (!ctx.editaFinanzas) return NO("Solo Sergio y Andrés pueden buscar prospectos.");
  if (!scavioActivo()) return NO("Falta conectar Scavio: agrega SCAVIO_API_KEY en Vercel (arata-panel).");
  return ctx;
}

const clave = /^[a-z_]{2,40}$/;

export type Preparacion = { ok: true; saldo: number | null; plan: string; repetidas: { pagina: number; hace: number; nuevos: number }[]; corriendo: boolean } | Fallo;

/** Antes de gastar: saldo de Scavio y qué páginas de esa búsqueda ya se pagaron hace poco. No gasta créditos. */
export async function prepararBusqueda(entrada: { nicho: string; zona: string }): Promise<Preparacion> {
  try {
    const ctx = await contexto();
    if ("ok" in ctx) return ctx;
    if (!clave.test(entrada.nicho) || !NICHO[entrada.nicho]) return NO("Elige un nicho de la lista.");
    if (!clave.test(entrada.zona) || !ZONA[entrada.zona]) return NO("Elige una zona de la lista.");
    const [saldo, previas, corriendo] = await Promise.all([
      saldoScavio(),
      db().query(
        `select distinct on (pagina) pagina, extract(day from now() - creado)::int hace, nuevos
           from prospecto_busquedas
          where negocio_id = $1 and nicho = $2 and zona = $3 and estado = 'lista' and creado > now() - make_interval(days => $4)
          order by pagina, creado desc`,
        [ctx.negocioId, entrada.nicho, entrada.zona, DIAS_SIN_REPETIR]
      ),
      db().query(`select 1 from prospecto_busquedas where negocio_id = $1 and estado = 'corriendo' and creado > now() - interval '3 minutes' limit 1`, [ctx.negocioId]),
    ]);
    return {
      ok: true,
      saldo: saldo?.saldo ?? null,
      plan: saldo?.plan ?? "",
      repetidas: previas.rows.map((r) => ({ pagina: Number(r.pagina), hace: Number(r.hace), nuevos: Number(r.nuevos) })),
      corriendo: corriendo.rowCount! > 0,
    };
  } catch (e) {
    return NO(e instanceof Error ? e.message : "No se pudo preparar la búsqueda.");
  }
}

export type ResumenPagina = {
  ok: true;
  /** true = esa página ya se había pagado y no se volvió a buscar. */
  omitida: boolean;
  encontrados: number;
  nuevos: number;
  repetidos: number;
  descartados: number;
  altas: number;
  motivos: Partial<Record<MotivoDescarte, number>>;
  saldo: number | null;
  /** Google ya no trae más negocios: no vale la pena pedir la página siguiente. */
  fin: boolean;
};

const COLS = [
  "fuente",
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
  "enfoque",
  "prioridad",
  "puntos",
] as const;
const valores = (p: ProspectoMaps) => [
  "panel",
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
  p.enfoque,
  p.prioridad,
  p.puntos,
];

/** Guarda los prospectos nuevos. Los que ya estaban no se tocan (ni su estado, ni sus notas, ni un «No contactar»). */
async function guardarNuevos(negocioId: string, lista: ProspectoMaps[]) {
  let nuevos = 0;
  let altas = 0;
  const ph = COLS.map((_, i) => `$${i + 2}`).join(", ");
  for (const p of lista) {
    const r = await db().query(`insert into prospectos (negocio_id, ${COLS.join(", ")}) values ($1, ${ph}) on conflict (negocio_id, fuente_id) do nothing returning id`, [negocioId, ...valores(p)]);
    if (r.rowCount) {
      nuevos++;
      if (p.prioridad === "alta") altas++;
    }
  }
  return { nuevos, altas };
}

/** Busca UNA página de Google Maps (1 crédito) y guarda lo que pasa los filtros. */
export async function buscarPagina(entrada: { nicho: string; zona: string; enfoque: string; pagina: number; filtros: Partial<Filtros>; forzar?: boolean }): Promise<ResumenPagina | Fallo> {
  let busquedaId: string | null = null;
  try {
    const ctx = await contexto();
    if ("ok" in ctx) return ctx;
    const nicho = clave.test(entrada.nicho) ? NICHO[entrada.nicho] : undefined;
    const zona = clave.test(entrada.zona) ? ZONA[entrada.zona] : undefined;
    if (!nicho) return NO("Elige un nicho de la lista.");
    if (!zona) return NO("Elige una zona de la lista.");
    const enfoque: Enfoque = entrada.enfoque === "sin_pagina" ? "sin_pagina" : "ya_vende";
    const pagina = Math.trunc(Number(entrada.pagina));
    if (!(pagina >= 0 && pagina < MAX_PAGINAS)) return NO(`Máximo ${MAX_PAGINAS} páginas por búsqueda.`);
    const filtros = filtrosValidos(entrada.filtros);

    // ¿Esa página ya se pagó hace poco? No se vuelve a gastar, salvo que se pida
    if (!entrada.forzar) {
      const previa = await db().query(
        `select 1 from prospecto_busquedas where negocio_id = $1 and nicho = $2 and zona = $3 and pagina = $4 and estado = 'lista'
            and creado > now() - make_interval(days => $5) limit 1`,
        [ctx.negocioId, nicho.clave, zona.clave, pagina, DIAS_SIN_REPETIR]
      );
      if (previa.rowCount) return { ok: true, omitida: true, encontrados: 0, nuevos: 0, repetidos: 0, descartados: 0, altas: 0, motivos: {}, saldo: null, fin: false };
    }
    // Una búsqueda a la vez (cada una gasta créditos)
    const ocupada = await db().query(`select 1 from prospecto_busquedas where negocio_id = $1 and estado = 'corriendo' and creado > now() - interval '3 minutes' limit 1`, [ctx.negocioId]);
    if (ocupada.rowCount) return NO("Ya hay una búsqueda corriendo. Espera a que termine.");

    const quien = String((await db().query(`select name from "user" where id = $1`, [ctx.usuarioId])).rows[0]?.name ?? "Alguien");
    busquedaId = (
      await db().query(
        `insert into prospecto_busquedas (negocio_id, usuario_id, quien, nicho, zona, enfoque, pagina, consulta, filtros) values ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning id`,
        [ctx.negocioId, ctx.usuarioId, quien.slice(0, 120), nicho.clave, zona.clave, enfoque, pagina, nicho.busqueda, JSON.stringify(filtros)]
      )
    ).rows[0].id as string;

    const maps = await buscarEnMaps(nicho.busqueda, zona.ll, pagina);
    const clasificados = [...new Map(maps.negocios.map((f) => clasificarMaps(f, nicho, enfoque)).filter((p): p is ProspectoMaps => p !== null).map((p) => [p.fuenteId, p])).values()];

    // Los que ya están en la base no cuentan como nuevos ni se tocan
    const ya = new Set(
      clasificados.length
        ? (await db().query(`select fuente_id from prospectos where negocio_id = $1 and fuente_id = any($2)`, [ctx.negocioId, clasificados.map((p) => p.fuenteId)])).rows.map((r) => r.fuente_id as string)
        : []
    );
    const nuevosPosibles = clasificados.filter((p) => !ya.has(p.fuenteId));
    const motivos: Partial<Record<MotivoDescarte, number>> = {};
    const pasan: ProspectoMaps[] = [];
    const descartados: (ProspectoMaps & { motivo: MotivoDescarte })[] = [];
    for (const p of nuevosPosibles) {
      const m = motivoDescarte(p, filtros);
      if (m) {
        motivos[m] = (motivos[m] ?? 0) + 1;
        descartados.push({ ...p, motivo: m });
      } else pasan.push(p);
    }
    const { nuevos, altas } = await guardarNuevos(ctx.negocioId, pasan);

    await db().query(
      `update prospecto_busquedas set estado = 'lista', creditos = $2, encontrados = $3, nuevos = $4, repetidos = $5, descartados = $6, altas = $7,
              resultados = $8, saldo_despues = $9, terminado = now() where id = $1`,
      [busquedaId, maps.creditosUsados, clasificados.length, nuevos, clasificados.length - nuevosPosibles.length, descartados.length, altas, JSON.stringify(descartados), maps.saldo]
    );
    await registrar(ctx, {
      accion: "crear",
      entidad: "prospecto",
      entidadId: busquedaId,
      titulo: `Buscó ${nicho.nombre.toLowerCase()} en ${zona.nombre} (página ${pagina + 1}): ${nuevos} ${nuevos === 1 ? "nuevo" : "nuevos"} · ${maps.creditosUsados} ${maps.creditosUsados === 1 ? "crédito" : "créditos"}`,
    });
    revalidatePath("/panel/clientes");
    return {
      ok: true,
      omitida: false,
      encontrados: clasificados.length,
      nuevos,
      repetidos: clasificados.length - nuevosPosibles.length,
      descartados: descartados.length,
      altas,
      motivos,
      saldo: maps.saldo,
      fin: maps.negocios.length < 20,
    };
  } catch (e) {
    const error = e instanceof Error ? e.message : "No se pudo buscar.";
    if (busquedaId) await db().query(`update prospecto_busquedas set estado = 'fallo', error = $2, terminado = now() where id = $1`, [busquedaId, error.slice(0, 500)]).catch(() => {});
    return NO(error);
  }
}

/** Guarda, sin gastar créditos, los negocios que los filtros dejaron por fuera en una búsqueda (menos los que no son del nicho). */
export async function recuperarDescartados(busquedaId: string): Promise<{ ok: true; nuevos: number } | Fallo> {
  try {
    const ctx = await contexto();
    if ("ok" in ctx) return ctx;
    if (!/^[0-9a-f-]{36}$/i.test(busquedaId)) return NO("Búsqueda no válida.");
    const b = (await db().query(`select nicho, zona, pagina, resultados from prospecto_busquedas where id = $1 and negocio_id = $2 and estado = 'lista'`, [busquedaId, ctx.negocioId])).rows[0];
    if (!b) return NO("Esa búsqueda no existe.");
    const lista = (Array.isArray(b.resultados) ? b.resultados : []) as (ProspectoMaps & { motivo: MotivoDescarte })[];
    const sirven = lista.filter((p) => p.motivo !== "fuera_del_nicho" && typeof p.fuenteId === "string" && NICHO[p.rubro]);
    const { nuevos, altas } = await guardarNuevos(ctx.negocioId, sirven);
    const quedan = lista.filter((p) => !sirven.includes(p));
    await db().query(`update prospecto_busquedas set resultados = $2, nuevos = nuevos + $3, altas = altas + $4, descartados = $5 where id = $1`, [busquedaId, JSON.stringify(quedan), nuevos, altas, quedan.length]);
    if (nuevos)
      await registrar(ctx, {
        accion: "crear",
        entidad: "prospecto",
        entidadId: busquedaId,
        titulo: `Recuperó ${nuevos} ${nuevos === 1 ? "prospecto descartado" : "prospectos descartados"} de ${NICHO[b.nicho]?.nombre.toLowerCase() ?? b.nicho} en ${ZONA[b.zona]?.nombre ?? b.zona}`,
      });
    revalidatePath("/panel/clientes");
    return { ok: true, nuevos };
  } catch (e) {
    return NO(e instanceof Error ? e.message : "No se pudo recuperar.");
  }
}

