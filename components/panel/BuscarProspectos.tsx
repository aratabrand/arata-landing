"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, RotateCcw, Search, Target } from "./iconos";
import { buscarPagina, prepararBusqueda, recuperarDescartados, type Preparacion, type ResumenPagina } from "@/app/(panel)/panel/(app)/clientes/buscar";
import { ENFOQUES, FILTROS_INICIALES, MAX_PAGINAS, MOTIVOS, NICHO, NICHOS, ZONA, ZONAS, type Enfoque, type Filtros, type MotivoDescarte } from "@/lib/panel/clientes/nichos";
import { PAGINAS, PRIORIDADES, SERVICIOS, type EstadoPagina, type Prioridad } from "@/lib/panel/clientes/prospectos";
import type { BusquedaProspectos } from "@/lib/panel/clientes/datos";
import { numero } from "@/lib/panel/formato";
import { BotonPrincipal, BotonSecundario, MensajeError } from "./finanzas/comun";
import { cn } from "@/lib/utils";

// «Buscar más prospectos» (D-179): eliges nicho y zona, ves el costo en créditos de Scavio
// antes de gastar, y la búsqueda corre página por página (1 crédito = hasta 20 negocios).

const textoMotivos = (m: Partial<Record<MotivoDescarte, number>>) =>
  (Object.entries(m) as [MotivoDescarte, number][]).map(([k, n]) => `${n} ${MOTIVOS[k].toLowerCase()}`).join(" · ");

function Pildora({ activa, onClick, children, className }: { activa: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button type="button" aria-pressed={activa} onClick={onClick} className={cn("min-h-9 rounded-full border px-3.5 py-1.5 text-xs font-semibold", activa ? "pn-pildora-activa" : "pn-pildora hover:text-white", className)}>
      {children}
    </button>
  );
}

function Grupo({ titulo, ayuda, children }: { titulo: string; ayuda?: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-white">{titulo}</legend>
      {ayuda && <p className="text-xs text-fog-dim">{ayuda}</p>}
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

type Total = Omit<ResumenPagina, "ok" | "omitida" | "fin"> & { paginas: number; omitidas: number; creditos: number };
const TOTAL_VACIO: Total = { encontrados: 0, nuevos: 0, repetidos: 0, descartados: 0, altas: 0, motivos: {}, saldo: null, paginas: 0, omitidas: 0, creditos: 0 };

export default function BuscarProspectos({ busquedas, onListo }: { busquedas: BusquedaProspectos[]; onListo: () => void }) {
  const router = useRouter();
  const [nicho, setNicho] = useState(NICHOS[0].clave);
  const [verTodos, setVerTodos] = useState(false);
  const [zona, setZona] = useState(ZONAS[0].clave);
  const [paginas, setPaginas] = useState(1);
  const [enfoque, setEnfoque] = useState<Enfoque>(NICHOS[0].enfoque);
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIALES);
  const [prep, setPrep] = useState<Preparacion | null>(null);
  const [forzar, setForzar] = useState(false);
  const [fase, setFase] = useState<"elegir" | "buscando" | "listo">("elegir");
  const [avance, setAvance] = useState({ pagina: 0, total: 0 });
  const [total, setTotal] = useState<Total>(TOTAL_VACIO);
  const [error, setError] = useState("");

  const n = NICHO[nicho];
  const visibles = verTodos ? NICHOS : NICHOS.filter((x) => x.recomendado || x.clave === nicho);

  // Saldo y páginas ya pagadas: se consultan sin gastar créditos cada vez que cambia nicho o zona
  useEffect(() => {
    let vivo = true;
    setPrep(null);
    setForzar(false);
    prepararBusqueda({ nicho, zona })
      .then((r) => vivo && setPrep(r))
      .catch(() => vivo && setPrep({ ok: false, error: "Sin conexión. Intenta otra vez." }));
    return () => {
      vivo = false;
    };
  }, [nicho, zona]);

  const pagadas = prep?.ok ? new Set(prep.repetidas.map((r) => r.pagina)) : new Set<number>();
  const porBuscar = Array.from({ length: paginas }, (_, i) => i).filter((i) => forzar || !pagadas.has(i));
  const costo = porBuscar.length;
  const saldo = prep?.ok ? prep.saldo : null;
  const sinSaldo = saldo !== null && saldo < costo;

  const elegirNicho = (clave: string) => {
    setNicho(clave);
    setEnfoque(NICHO[clave].enfoque);
  };
  const cambiar = <K extends keyof Filtros>(k: K, v: Filtros[K]) => setFiltros((f) => ({ ...f, [k]: v }));
  const alternarPagina = (p: EstadoPagina) =>
    setFiltros((f) => {
      const lista = f.paginas.includes(p) ? f.paginas.filter((x) => x !== p) : [...f.paginas, p];
      return { ...f, paginas: lista.length ? lista : f.paginas };
    });

  async function buscar() {
    setError("");
    setFase("buscando");
    let t: Total = { ...TOTAL_VACIO, motivos: {} };
    setTotal(t);
    const lista = Array.from({ length: paginas }, (_, i) => i);
    for (const [i, pagina] of lista.entries()) {
      setAvance({ pagina: i + 1, total: lista.length });
      const r = await buscarPagina({ nicho, zona, enfoque, pagina, filtros, forzar }).catch(() => ({ ok: false as const, error: "Se perdió la conexión. Lo que ya se buscó quedó guardado." }));
      if (!r.ok) {
        setError(r.error);
        break;
      }
      const motivos = { ...t.motivos };
      (Object.entries(r.motivos) as [MotivoDescarte, number][]).forEach(([k, v]) => (motivos[k] = (motivos[k] ?? 0) + v));
      t = {
        encontrados: t.encontrados + r.encontrados,
        nuevos: t.nuevos + r.nuevos,
        repetidos: t.repetidos + r.repetidos,
        descartados: t.descartados + r.descartados,
        altas: t.altas + r.altas,
        motivos,
        saldo: r.saldo ?? t.saldo,
        paginas: t.paginas + (r.omitida ? 0 : 1),
        omitidas: t.omitidas + (r.omitida ? 1 : 0),
        creditos: t.creditos + (r.omitida ? 0 : 1),
      };
      setTotal(t);
      if (r.fin) break; // Google ya no trae más: no se gasta en páginas vacías
    }
    setFase("listo");
    router.refresh();
  }

  if (fase !== "elegir") {
    const buscando = fase === "buscando";
    return (
      <div className="space-y-5">
        <div className="v2-card p-4">
          <p className="text-xs text-fog">
            {n.nombre} · {ZONA[zona].nombre}
          </p>
          <p className="mt-1 font-display text-lg font-bold text-white" role="status" aria-live="polite">
            {buscando ? `Buscando página ${avance.pagina} de ${avance.total}…` : error ? "La búsqueda se detuvo" : "Búsqueda lista"}
          </p>
          {buscando && <p className="mt-1 text-xs text-fog-dim">Google Maps tarda hasta un minuto por página. No cierres esta ventana.</p>}
        </div>
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { k: "Encontrados", v: total.encontrados },
            { k: "Nuevos guardados", v: total.nuevos },
            { k: "Prioridad alta", v: total.altas },
            { k: "Créditos usados", v: total.creditos },
          ].map((x) => (
            <div key={x.k} className="rounded-frame border border-white/8 bg-surface-1 p-3">
              <dt className="text-[0.7rem] text-fog-dim">{x.k}</dt>
              <dd className="mt-1 font-display text-lg font-bold pn-cifra">{numero(x.v)}</dd>
            </div>
          ))}
        </dl>
        <ul className="space-y-1 text-sm text-fog">
          {total.repetidos > 0 && <li>{total.repetidos} ya estaban en la lista (no se tocaron).</li>}
          {total.descartados > 0 && <li>Se dejaron por fuera {total.descartados}: {textoMotivos(total.motivos)}.</li>}
          {total.omitidas > 0 && <li>{total.omitidas === 1 ? "1 página ya se había buscado" : `${total.omitidas} páginas ya se habían buscado`}: no se volvió a pagar.</li>}
          {total.saldo !== null && <li>Te quedan {numero(total.saldo)} créditos en Scavio.</li>}
        </ul>
        <MensajeError error={error} />
        {!buscando && (
          <div className="flex flex-wrap gap-2">
            <BotonPrincipal type="button" className="flex-1" onClick={onListo}>
              Ver los prospectos
            </BotonPrincipal>
            <BotonSecundario
              type="button"
              onClick={() => {
                setFase("elegir");
                setError("");
                setPrep(null);
                prepararBusqueda({ nicho, zona }).then(setPrep, () => setPrep({ ok: false, error: "Sin conexión. Intenta otra vez." }));
              }}
            >
              Buscar otra
            </BotonSecundario>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Grupo titulo="Nicho" ayuda="Los recomendados tienen buena demanda y ya venden por redes o WhatsApp.">
        {visibles.map((x) => (
          <Pildora key={x.clave} activa={nicho === x.clave} onClick={() => elegirNicho(x.clave)}>
            {x.nombre}
          </Pildora>
        ))}
        <button type="button" onClick={() => setVerTodos((v) => !v)} className="min-h-9 px-2 text-xs font-semibold text-fog underline-offset-4 hover:text-white hover:underline">
          {verTodos ? "Ver solo recomendados" : `Ver los ${NICHOS.length}`}
        </button>
      </Grupo>
      <div className="rounded-frame border border-white/8 bg-surface-1 p-3 text-sm">
        <p className="text-fog">{n.porque}</p>
        <p className="mt-2 text-xs text-fog-dim">
          Se busca «{n.busqueda}» · sugerido: <span className="text-white">{SERVICIOS[n.servicio]}</span>
        </p>
      </div>

      <label className="block space-y-2">
        <span className="flex items-center gap-2 text-sm font-semibold text-white">
          <MapPin aria-hidden className="h-4 w-4 text-fog" /> Zona de Bogotá
        </span>
        <select value={zona} onChange={(e) => setZona(e.target.value)} className="pn-input">
          {ZONAS.map((z) => (
            <option key={z.clave} value={z.clave}>
              {z.nombre}
            </option>
          ))}
        </select>
        <span className="block text-xs text-fog-dim">Una zona trae negocios más cerca entre sí y no repite los de otras zonas.</span>
      </label>

      <Grupo titulo="Cuántos negocios" ayuda="Cada página trae hasta 20 negocios y gasta 1 crédito.">
        {Array.from({ length: MAX_PAGINAS }, (_, i) => i + 1).map((p) => (
          <Pildora key={p} activa={paginas === p} onClick={() => setPaginas(p)}>
            {p * 20} · {p} {p === 1 ? "crédito" : "créditos"}
          </Pildora>
        ))}
      </Grupo>

      <Grupo titulo="Prioridad con enfoque en">
        {(Object.entries(ENFOQUES) as [Enfoque, string][]).map(([k, l]) => (
          <Pildora key={k} activa={enfoque === k} onClick={() => setEnfoque(k)}>
            {l}
          </Pildora>
        ))}
      </Grupo>
      <p className="-mt-4 text-xs text-fog-dim">
        {enfoque === "ya_vende"
          ? "Sube primero a quien vende por redes o WhatsApp sin sistema, o tiene página sin orden. Baja a las cadenas grandes."
          : "Sube primero a quien no tiene página propia (como la primera carga)."}
      </p>

      <details className="rounded-frame border border-white/8 bg-surface-1 p-3">
        <summary className="cursor-pointer select-none text-sm font-semibold text-white">Qué se guarda (filtros)</summary>
        <p className="mt-2 text-xs text-fog-dim">Google no filtra antes de cobrar: estos filtros deciden qué entra a la lista. Lo que quede por fuera se puede guardar después sin gastar.</p>
        <div className="mt-4 space-y-5">
          <Grupo titulo="Calificación mínima">
            {[0, 4, 4.3, 4.5].map((v) => (
              <Pildora key={v} activa={filtros.calificacionMin === v} onClick={() => cambiar("calificacionMin", v)}>
                {v === 0 ? "Cualquiera" : `${String(v).replace(".", ",")} ★`}
              </Pildora>
            ))}
          </Grupo>
          <Grupo titulo="Reseñas mínimas" ayuda="Más reseñas = más clientes = más demanda.">
            {[0, 10, 50, 100].map((v) => (
              <Pildora key={v} activa={filtros.resenasMin === v} onClick={() => cambiar("resenasMin", v)}>
                {v === 0 ? "Cualquiera" : `${v} o más`}
              </Pildora>
            ))}
          </Grupo>
          <Grupo titulo="Página web">
            {(Object.entries(PAGINAS) as [EstadoPagina, string][]).map(([k, l]) => (
              <Pildora key={k} activa={filtros.paginas.includes(k)} onClick={() => alternarPagina(k)}>
                {l}
              </Pildora>
            ))}
          </Grupo>
          <Grupo titulo="Contacto">
            <Pildora activa={!filtros.soloCelular} onClick={() => cambiar("soloCelular", false)}>
              Cualquier teléfono
            </Pildora>
            <Pildora activa={filtros.soloCelular} onClick={() => cambiar("soloCelular", true)}>
              Solo con celular (WhatsApp)
            </Pildora>
          </Grupo>
          <Grupo titulo="Prioridad mínima">
            {(["baja", "media", "alta"] as Prioridad[]).map((k) => (
              <Pildora key={k} activa={filtros.prioridadMin === k} onClick={() => cambiar("prioridadMin", k)}>
                {k === "baja" ? "Todas" : `${PRIORIDADES[k]}${k === "media" ? " o alta" : ""}`}
              </Pildora>
            ))}
          </Grupo>
        </div>
      </details>

      <section className="space-y-3 border-t border-white/8 pt-4">
        {!prep ? (
          <p className="text-sm text-fog-dim">Consultando el saldo de Scavio…</p>
        ) : !prep.ok ? (
          <MensajeError error={prep.error} />
        ) : (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm text-fog">
                Costo: <strong className="font-display text-lg text-white">{costo}</strong> {costo === 1 ? "crédito" : "créditos"}
              </p>
              <p className="text-xs text-fog-dim">{saldo === null ? "No se pudo leer el saldo" : `Te quedan ${numero(saldo)}`}</p>
            </div>
            {prep.repetidas.length > 0 && (
              <div className="rounded-frame border border-white/8 bg-surface-1 p-3 text-sm text-fog">
                <p>
                  Ya buscaste {n.nombre.toLowerCase()} en {ZONA[zona].nombre}:{" "}
                  {prep.repetidas.map((r) => `página ${r.pagina + 1} hace ${r.hace === 0 ? "menos de un día" : `${r.hace} ${r.hace === 1 ? "día" : "días"}`} (${r.nuevos} nuevos)`).join(", ")}.
                  {!forzar && " Esas páginas no se vuelven a pagar."}
                </p>
                <label className="mt-2 flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={forzar} onChange={(e) => setForzar(e.target.checked)} className="h-4 w-4 accent-lime" />
                  Buscarlas otra vez (Google pudo haber agregado negocios)
                </label>
              </div>
            )}
            {prep.corriendo && <p className="text-sm text-fog">Hay otra búsqueda corriendo. Espera a que termine.</p>}
            {sinSaldo && <p className="text-sm text-alerta">No alcanzan los créditos. Baja el número de páginas o recarga en scavio.dev.</p>}
            <BotonPrincipal type="button" className="flex w-full items-center justify-center gap-2" disabled={prep.corriendo || sinSaldo || costo === 0} onClick={buscar}>
              <Search aria-hidden className="h-4 w-4" />
              {costo === 0 ? "Ya buscaste estas páginas" : `Buscar · ${costo} ${costo === 1 ? "crédito" : "créditos"}`}
            </BotonPrincipal>
          </>
        )}
      </section>

      <Rendimiento busquedas={busquedas} />
    </div>
  );
}

/** Qué nicho y qué zona rinden: prospectos de prioridad alta por crédito, y lo que se puede guardar sin gastar. */
function Rendimiento({ busquedas }: { busquedas: BusquedaProspectos[] }) {
  const router = useRouter();
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [aviso, setAviso] = useState("");
  const listas = busquedas.filter((b) => b.estado === "lista");
  const porNicho = useMemo(() => {
    const m = new Map<string, { creditos: number; nuevos: number; altas: number; paginas: number }>();
    listas.forEach((b) => {
      const x = m.get(b.nicho) ?? { creditos: 0, nuevos: 0, altas: 0, paginas: 0 };
      m.set(b.nicho, { creditos: x.creditos + b.creditos, nuevos: x.nuevos + b.nuevos, altas: x.altas + b.altas, paginas: x.paginas + 1 });
    });
    return [...m.entries()].sort((a, b) => b[1].altas / Math.max(1, b[1].creditos) - a[1].altas / Math.max(1, a[1].creditos));
  }, [listas]);
  if (!busquedas.length) return null;

  const recuperar = async (id: string) => {
    setOcupado(id);
    setAviso("");
    const r = await recuperarDescartados(id).catch(() => ({ ok: false as const, error: "Sin conexión." }));
    setOcupado(null);
    setAviso(r.ok ? `Se guardaron ${r.nuevos} sin gastar créditos.` : r.error);
    router.refresh();
  };

  return (
    <section className="space-y-4 border-t border-white/8 pt-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
        <Target aria-hidden className="h-4 w-4 text-fog" /> Qué nicho rinde más
      </h3>
      {porNicho.length > 0 && (
        <ul className="divide-y divide-white/6 rounded-frame border border-white/8 bg-surface-1">
          {porNicho.map(([k, x]) => (
            <li key={k} className="flex items-center gap-3 px-3 py-2.5 text-sm">
              <span className="min-w-0 flex-1 truncate text-fog">{NICHO[k]?.nombre ?? k}</span>
              <span className="shrink-0 text-xs text-fog-dim">
                {x.nuevos} nuevos · {x.altas} alta · {x.creditos} cr.
              </span>
              <span className="w-14 shrink-0 text-right font-display font-bold text-white" title="Prospectos de prioridad alta por crédito">
                {(x.altas / Math.max(1, x.creditos)).toFixed(1).replace(".", ",")}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-fog-dim">El número de la derecha: prospectos de prioridad alta por cada crédito.</p>

      <h3 className="pt-2 text-sm font-semibold text-white">Últimas búsquedas</h3>
      <ul className="space-y-2">
        {busquedas.slice(0, 12).map((b) => (
          <li key={b.id} className="rounded-frame border border-white/8 bg-surface-1 p-3 text-sm">
            <p className="text-white">
              {NICHO[b.nicho]?.nombre ?? b.nicho} · {ZONA[b.zona]?.nombre ?? b.zona} · pág. {b.pagina + 1}
            </p>
            <p className="mt-0.5 text-xs text-fog-dim">
              {new Date(b.creado).toLocaleDateString("es-CO", { day: "numeric", month: "short", timeZone: "America/Bogota" })} · {b.quien.split(" ")[0]} ·{" "}
              {b.estado === "fallo" ? `no se pudo: ${b.error ?? ""}` : b.estado === "corriendo" ? "corriendo…" : `${b.encontrados} encontrados, ${b.nuevos} nuevos, ${b.altas} alta`}
            </p>
            {b.recuperables > 0 && (
              <button
                type="button"
                disabled={ocupado !== null}
                onClick={() => recuperar(b.id)}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-fog hover:text-white disabled:opacity-50"
              >
                <RotateCcw aria-hidden className="h-3.5 w-3.5" />
                {ocupado === b.id ? "Guardando…" : `Guardar ${b.recuperables} que dejaron los filtros (gratis)`}
              </button>
            )}
          </li>
        ))}
      </ul>
      {aviso && (
        <p role="status" className="text-sm text-fog">
          {aviso}
        </p>
      )}
    </section>
  );
}
