// Scavio (Google Maps) para «Buscar más prospectos» (D-179). Solo servidor: la clave nunca llega al navegador.
//
// Variable del SERVIDOR, solo en el proyecto «arata-panel» de Vercel (nunca en el sitio, nunca NEXT_PUBLIC_):
//   SCAVIO_API_KEY   clave de https://scavio.dev (la misma que usa Sellbird)
//
// Costos (nov 2026): buscar en Maps = 1 crédito por página de hasta 20 negocios; consultar el saldo no cuesta.
// Una búsqueda tarda entre 10 y 60 segundos: por eso el panel pide una página por llamada.

import type { FilaMaps } from "./prospectos";

// SCAVIO_API_URL solo para pruebas locales (un servidor falso); en Vercel no se define.
const API = process.env.SCAVIO_API_URL || "https://api.scavio.dev";

export const scavioActivo = () => Boolean(process.env.SCAVIO_API_KEY);

const cabeceras = () => ({ Authorization: `Bearer ${process.env.SCAVIO_API_KEY ?? ""}`, "Content-Type": "application/json" });

/** Mensaje claro para la pantalla según lo que respondió Scavio. */
function errorScavio(estado: number, cuerpo: string) {
  if (estado === 401 || estado === 403) return "Scavio no aceptó la clave. Revisa SCAVIO_API_KEY en Vercel (arata-panel).";
  if (estado === 402) return "Se acabaron los créditos de Scavio. Recarga en scavio.dev para seguir buscando.";
  if (estado === 429) return "Scavio pidió esperar un momento. Intenta otra vez en un minuto.";
  const detalle = (() => {
    try {
      return String(JSON.parse(cuerpo)?.error ?? "");
    } catch {
      return "";
    }
  })();
  return `Scavio respondió ${estado}${detalle ? `: ${detalle.slice(0, 160)}` : ""}.`;
}

/** Créditos que quedan (no gasta créditos). null si no se pudo consultar. */
export async function saldoScavio(): Promise<{ saldo: number; plan: string } | null> {
  if (!scavioActivo()) return null;
  try {
    const r = await fetch(`${API}/api/v1/usage`, { headers: cabeceras(), cache: "no-store", signal: AbortSignal.timeout(15_000) });
    if (!r.ok) return null;
    const d = await r.json();
    const saldo = Number(d?.credit_balance);
    return Number.isFinite(saldo) ? { saldo, plan: String(d?.plan ?? "") } : null;
  } catch {
    return null;
  }
}

export type RespuestaMaps = { negocios: FilaMaps[]; creditosUsados: number; saldo: number | null };

/** Una página de Google Maps (20 negocios). Gasta 1 crédito. */
export async function buscarEnMaps(consulta: string, ll: string, pagina: number): Promise<RespuestaMaps> {
  if (!scavioActivo()) throw new Error("Falta conectar Scavio: agrega SCAVIO_API_KEY en Vercel (arata-panel).");
  let r: Response;
  try {
    r = await fetch(`${API}/api/v2/google/maps/search`, {
      method: "POST",
      headers: cabeceras(),
      body: JSON.stringify({ query: consulta, ll, start: pagina * 20, hl: "es", gl: "co" }),
      cache: "no-store",
      signal: AbortSignal.timeout(110_000),
    });
  } catch (e) {
    throw new Error(e instanceof Error && e.name === "TimeoutError" ? "Google Maps tardó demasiado. Intenta otra vez." : "No se pudo conectar con Scavio.");
  }
  const texto = await r.text();
  if (!r.ok) throw new Error(errorScavio(r.status, texto));
  let d: Record<string, unknown>;
  try {
    d = JSON.parse(texto);
  } catch {
    throw new Error("Scavio respondió algo que no se pudo leer.");
  }
  const lista = Array.isArray(d.local_results) ? (d.local_results as FilaMaps[]) : [];
  const usados = Number(d.credits_used);
  const saldo = Number(d.credits_remaining);
  return { negocios: lista.slice(0, 40), creditosUsados: Number.isFinite(usados) ? usados : 1, saldo: Number.isFinite(saldo) ? saldo : null };
}
