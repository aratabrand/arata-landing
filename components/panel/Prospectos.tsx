"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Globe, MapPin, MessageCircle, Phone, Search, Trash2 } from "./iconos";
import {
  ESTADOS_PROSPECTO,
  PAGINAS,
  PRIORIDADES,
  RUBROS,
  RUES,
  SERVICIOS,
  TITULARES,
  maxPuntos,
  mensajeProspecto,
  razonesDe,
  telefonoTexto,
  whatsappDe,
  type EstadoProspecto,
  type Prioridad,
  type Prospecto,
  type Titular,
} from "@/lib/panel/clientes/prospectos";
import { borrarProspecto, guardarProspecto, marcarContactado } from "@/app/(panel)/panel/(app)/clientes/acciones";
import { ENFOQUES } from "@/lib/panel/clientes/nichos";
import type { BusquedaProspectos } from "@/lib/panel/clientes/datos";
import BuscarProspectos from "./BuscarProspectos";
import { numero } from "@/lib/panel/formato";
import { Hoja } from "./Clientes";
import { Pill, Tarjeta, type TonoPill } from "./ui";
import { BotonPrincipal, BotonSecundario, Campo, MensajeError, useAccion } from "./finanzas/comun";
import { cn } from "@/lib/utils";

// Prospectos (D-173): negocios de Google Maps (Sellbird o el botón «Buscar más prospectos», D-179) que todavía no han agendado.
// Prospectos → Interesados (agendan por Cal.com) → Clientes. Solo datos que el negocio publicó.

const TONO_PRIORIDAD: Record<Prioridad, TonoPill> = { alta: "verde", media: "ambar", baja: "neutro" };
// Semáforo del riesgo de contactar (Ley 1581): empresa con NIT es lo más seguro
const TONO_TITULAR: Record<Titular, TonoPill> = { empresa: "verde", persona_natural: "ambar", por_verificar: "neutro" };
const TONO_ESTADO: Record<EstadoProspecto, TonoPill> = {
  nuevo: "neutro",
  contactado: "ambar",
  respondio: "verde",
  agendo: "verdeFuerte",
  no_interesa: "neutro",
  no_contactar: "alerta",
};
const TIPO_TEL = { celular: "celular", fijo: "fijo", otro: "teléfono" } as const;
// 10 negocios por página: menos scroll (sobre todo en el celular)
const POR_PAGINA = 10;

const opciones = <T extends string>(o: Record<T, string>) => Object.entries(o) as [T, string][];

export default function Prospectos({
  prospectos,
  busquedas,
  scavio,
  puedeEditar,
  puedeBorrar,
  yo,
  ahora,
}: {
  prospectos: Prospecto[];
  /** Búsquedas hechas con «Buscar más prospectos» (D-179). */
  busquedas: BusquedaProspectos[];
  /** Hay clave de Scavio en el servidor. */
  scavio: boolean;
  puedeEditar: boolean;
  puedeBorrar: boolean;
  /** Quien está en sesión: firma el mensaje de WhatsApp (D-174). */
  yo: string;
  /** Hora del servidor (ISO): el saludo sale igual al hidratar. */
  ahora: string;
}) {
  const [q, setQ] = useState("");
  const [prioridad, setPrioridad] = useState<Prioridad | "">("");
  const [titular, setTitular] = useState<Titular | "">("");
  const [rubro, setRubro] = useState("");
  const [pagina, setPagina] = useState("");
  const [estado, setEstado] = useState("");
  const [enfoque, setEnfoque] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [paginaLista, setPaginaLista] = useState(0);
  const inicioLista = useRef<HTMLParagraphElement | null>(null);
  const [abierto, setAbierto] = useState<string | null>(null);

  const resumen = useMemo(
    () => ({
      total: prospectos.length,
      alta: prospectos.filter((p) => p.prioridad === "alta").length,
      sinPagina: prospectos.filter((p) => p.pagina !== "tiene_pagina").length,
      empresas: prospectos.filter((p) => p.titular === "empresa").length,
      porPrioridad: (Object.keys(PRIORIDADES) as Prioridad[]).map((k) => ({ k, n: prospectos.filter((p) => p.prioridad === k).length })),
    }),
    [prospectos]
  );

  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    return prospectos
      .filter((p) => !prioridad || p.prioridad === prioridad)
      .filter((p) => !titular || p.titular === titular)
      .filter((p) => !rubro || p.rubro === rubro)
      .filter((p) => !pagina || p.pagina === pagina)
      .filter((p) => !estado || p.estado === estado)
      .filter((p) => !enfoque || p.enfoque === enfoque)
      .filter((p) => !t || [p.nombre, p.categoria, p.telefono, RUBROS[p.rubro]].some((v) => v?.toLowerCase().includes(t)));
  }, [prospectos, q, prioridad, titular, rubro, pagina, estado, enfoque]);

  // Solo los rubros que hay en la lista (los nichos son más de 20)
  const rubros = useMemo(() => {
    const hay = new Set(prospectos.map((p) => p.rubro));
    return opciones(RUBROS).filter(([k]) => hay.has(k));
  }, [prospectos]);

  const actual = prospectos.find((p) => p.id === abierto) ?? null;
  // Si un filtro o un borrado deja menos páginas, se queda en la última que existe
  const totalPaginas = Math.max(1, Math.ceil(visibles.length / POR_PAGINA));
  const paginaActual = Math.min(paginaLista, totalPaginas - 1);
  const desde = paginaActual * POR_PAGINA;
  const irA = (n: number) => {
    setPaginaLista(Math.min(Math.max(0, n), totalPaginas - 1));
    // Vuelve al primer negocio de la página si quedó arriba de la pantalla
    if ((inicioLista.current?.getBoundingClientRect().top ?? 0) < 0) inicioLista.current?.scrollIntoView({ block: "start" });
  };
  const filtrar = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPaginaLista(0);
  };

  return (
    <>
      {puedeEditar && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-fog">Negocios de Google Maps que todavía no han agendado.</p>
          <BotonPrincipal type="button" onClick={() => setBuscando(true)} className="inline-flex items-center gap-2" title={scavio ? undefined : "Falta SCAVIO_API_KEY en Vercel"}>
            <Search aria-hidden className="h-4 w-4" /> Buscar más prospectos
          </BotonPrincipal>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          { k: "Prospectos", v: numero(resumen.total) },
          { k: "Prioridad alta", v: numero(resumen.alta) },
          { k: "Sin página propia", v: numero(resumen.sinPagina) },
          { k: "Empresas con NIT", v: numero(resumen.empresas) },
        ].map((s) => (
          <div key={s.k} className="v2-card p-4 sm:p-5">
            <p className="text-xs text-fog">{s.k}</p>
            <p className="mt-2 truncate font-display text-[clamp(1.2rem,2.2vw,1.6rem)] font-bold leading-none pn-cifra">{s.v}</p>
          </div>
        ))}
      </div>

      <Tarjeta>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative block w-full lg:max-w-sm">
              <span className="sr-only">Buscar prospecto</span>
              <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fog-dim" />
              <input type="search" value={q} onChange={(e) => filtrar(setQ)(e.target.value)} placeholder="Buscar por negocio, rubro o teléfono" className="pn-input pl-9" />
            </label>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Prioridad">
              {[{ k: "" as const, l: `Todas (${resumen.total})` }, ...resumen.porPrioridad.map((x) => ({ k: x.k, l: `${PRIORIDADES[x.k]} (${x.n})` }))].map((f) => (
                <button
                  key={f.k || "todas"}
                  type="button"
                  aria-pressed={prioridad === f.k}
                  onClick={() => filtrar(setPrioridad)(f.k)}
                  className={cn("h-9 rounded-full border px-3.5 text-xs font-semibold", prioridad === f.k ? "pn-pildora-activa" : "pn-pildora hover:text-white")}
                >
                  {f.l}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Filtro etiqueta="Titular" valor={titular} onChange={(v) => filtrar(setTitular)(v as Titular | "")} todos="Empresa o persona" opciones={opciones(TITULARES)} />
            <Filtro etiqueta="Rubro" valor={rubro} onChange={filtrar(setRubro)} todos="Todos los rubros" opciones={rubros} />
            <Filtro etiqueta="Página" valor={pagina} onChange={filtrar(setPagina)} todos="Con o sin página" opciones={opciones(PAGINAS)} />
            <Filtro etiqueta="Estado" valor={estado} onChange={filtrar(setEstado)} todos="Todos los estados" opciones={opciones(ESTADOS_PROSPECTO)} />
            <Filtro etiqueta="Enfoque" valor={enfoque} onChange={filtrar(setEnfoque)} todos="Cualquier enfoque" opciones={opciones(ENFOQUES)} />
          </div>
        </div>

        {prospectos.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-fog">Todavía no hay prospectos.</p>
            <p className="mt-1 text-xs text-fog-dim">Toca «Buscar más prospectos» para traerlos de Google Maps.</p>
          </div>
        ) : visibles.length === 0 ? (
          <p className="py-10 text-center text-sm text-fog">No hay prospectos con esos filtros.</p>
        ) : (
          <>
            <p ref={inicioLista} className="mt-4 scroll-mt-24 text-xs text-fog-dim">
              {visibles.length > POR_PAGINA
                ? `${numero(desde + 1)}–${numero(Math.min(desde + POR_PAGINA, visibles.length))} de ${numero(visibles.length)} negocios, de mayor a menor prioridad`
                : `${numero(visibles.length)} ${visibles.length === 1 ? "negocio" : "negocios"}, de mayor a menor prioridad`}
            </p>
            <ul className="mt-2 divide-y divide-white/6">
              {visibles.slice(desde, desde + POR_PAGINA).map((p) => (
                <li key={p.id}>
                  <button type="button" onClick={() => setAbierto(p.id)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 py-3.5 text-left hover:bg-surface-2/40">
                    <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.08] font-display text-sm font-bold text-fog">
                      {p.nombre.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1 basis-56">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-medium text-white">{p.nombre}</span>
                        <Pill tono={TONO_PRIORIDAD[p.prioridad]}>{PRIORIDADES[p.prioridad]}</Pill>
                        <Pill tono={TONO_TITULAR[p.titular]}>{TITULARES[p.titular]}</Pill>
                        {p.estado !== "nuevo" && <Pill tono={TONO_ESTADO[p.estado]}>{ESTADOS_PROSPECTO[p.estado]}</Pill>}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-fog-dim">
                        {[RUBROS[p.rubro], PAGINAS[p.pagina], p.servicio ? `sugerido: ${SERVICIOS[p.servicio]}` : null].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    <span className="grid grid-cols-2 gap-4 text-right text-sm sm:w-48">
                      <span>
                        <span className="block text-[0.68rem] text-fog-dim">Reseñas</span>
                        <span className="font-display font-bold text-white">{numero(p.resenas)}</span>
                      </span>
                      <span>
                        <span className="block text-[0.68rem] text-fog-dim">Calificación</span>
                        <span className="font-display font-bold text-white">{p.calificacion === null ? "—" : `${String(p.calificacion).replace(".", ",")} ★`}</span>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {totalPaginas > 1 && (
              <nav aria-label="Páginas de prospectos" className="flex items-center justify-between gap-3 border-t border-white/6 pt-4">
                <BotonSecundario type="button" onClick={() => irA(paginaActual - 1)} disabled={paginaActual === 0} aria-label="Página anterior">
                  <ChevronLeft aria-hidden className="h-4 w-4" /> <span className="hidden sm:inline">Anterior</span>
                </BotonSecundario>
                <p className="text-sm text-fog" aria-live="polite">
                  Página <span className="font-display font-bold text-white">{paginaActual + 1}</span> de {totalPaginas}
                </p>
                <BotonSecundario type="button" onClick={() => irA(paginaActual + 1)} disabled={paginaActual >= totalPaginas - 1} aria-label="Página siguiente">
                  <span className="hidden sm:inline">Siguiente</span> <ChevronRight aria-hidden className="h-4 w-4" />
                </BotonSecundario>
              </nav>
            )}
          </>
        )}
      </Tarjeta>

      {buscando && (
        <Hoja titulo="Buscar más prospectos" onClose={() => setBuscando(false)}>
          <BuscarProspectos busquedas={busquedas} onListo={() => setBuscando(false)} />
        </Hoja>
      )}

      {actual && (
        <Hoja titulo={actual.nombre} onClose={() => setAbierto(null)}>
          <Perfil key={actual.id} p={actual} yo={yo} ahora={ahora} puedeEditar={puedeEditar} puedeBorrar={puedeBorrar} onBorrado={() => setAbierto(null)} />
        </Hoja>
      )}
    </>
  );
}

function Filtro<T extends string>({ etiqueta, valor, onChange, todos, opciones }: { etiqueta: string; valor: string; onChange: (v: string) => void; todos: string; opciones: [T, string][] }) {
  return (
    <select aria-label={`Filtrar por ${etiqueta.toLowerCase()}`} value={valor} onChange={(e) => onChange(e.target.value)} className="pn-input h-9 w-full py-0 text-xs sm:w-auto">
      <option value="">{todos}</option>
      {opciones.map(([k, l]) => (
        <option key={k} value={k}>
          {l}
        </option>
      ))}
    </select>
  );
}

/** Perfil del negocio: lo que publicó, por qué tiene esa prioridad y en qué va el contacto. */
function Perfil({ p, yo, ahora, puedeEditar, puedeBorrar, onBorrado }: { p: Prospecto; yo: string; ahora: string; puedeEditar: boolean; puedeBorrar: boolean; onBorrado: () => void }) {
  const acc = useAccion();
  const [guardado, setGuardado] = useState(false);
  const razones = razonesDe(p);
  const celularWa = whatsappDe(p);
  const mensaje = mensajeProspecto(p, yo, Date.parse(ahora));
  const cerrado = p.estado === "no_contactar" || p.estado === "no_interesa";
  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setGuardado(false);
    acc.correr(() => guardarProspecto({ id: p.id, estado: String(f.get("estado")), titular: String(f.get("titular")), notas: String(f.get("notas") ?? "") }), () => setGuardado(true));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Pill tono={TONO_PRIORIDAD[p.prioridad]}>Prioridad {PRIORIDADES[p.prioridad].toLowerCase()}</Pill>
        <Pill tono={TONO_TITULAR[p.titular]}>{TITULARES[p.titular]}</Pill>
        <Pill tono={TONO_ESTADO[p.estado]}>{ESTADOS_PROSPECTO[p.estado]}</Pill>
      </div>

      <dl className="grid grid-cols-3 gap-2">
        {[
          { k: "Reseñas", v: numero(p.resenas) },
          { k: "Calificación", v: p.calificacion === null ? "—" : `${String(p.calificacion).replace(".", ",")} ★` },
          { k: "Puntos", v: `${p.puntos} de ${maxPuntos(p.enfoque)}` },
        ].map((x) => (
          <div key={x.k} className="rounded-frame border border-white/8 bg-surface-1 p-3">
            <dt className="text-[0.7rem] text-fog-dim">{x.k}</dt>
            <dd className="mt-1 truncate font-display text-sm font-bold text-white">{x.v}</dd>
          </div>
        ))}
      </dl>

      {puedeEditar && (
        <section className="space-y-2">
          {cerrado ? (
            <p className="rounded-frame border border-white/8 bg-surface-1 p-3 text-sm text-fog">
              {p.estado === "no_contactar" ? "Pidió que no le escribamos. No se le vuelve a escribir." : "Dijo que no le interesa por ahora."}
            </p>
          ) : celularWa ? (
            <>
              <a
                href={`https://wa.me/${celularWa}?text=${encodeURIComponent(mensaje)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => p.estado === "nuevo" && acc.correr(() => marcarContactado(p.id))}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full pn-primario text-sm font-semibold"
              >
                <MessageCircle aria-hidden className="h-4 w-4" /> Escribirle por WhatsApp
              </a>
              <details className="rounded-frame border border-white/8 bg-surface-1 p-3 text-sm text-fog">
                <summary className="cursor-pointer select-none text-white">Ver el mensaje</summary>
                <p className="mt-2 whitespace-pre-line">{mensaje}</p>
              </details>
              {p.estado === "nuevo" && <p className="text-xs text-fog-dim">Al tocarlo, queda como «Contactado». Si agenda con el enlace, pasa solo a «Agendó».</p>}
            </>
          ) : (
            <p className="rounded-frame border border-white/8 bg-surface-1 p-3 text-sm text-fog">
              {p.telefono ? "Su número es fijo: no tiene WhatsApp. Llámalo o busca su celular en Google Maps." : "No publicó teléfono. Búscalo en Google Maps o en sus redes."}
            </p>
          )}
        </section>
      )}

      <section>
        <h3 className="mb-2 text-sm font-semibold text-white">Negocio</h3>
        <ul className="space-y-2 text-sm text-fog">
          <li className="text-white">
            {RUBROS[p.rubro] ?? "Otro"}
            {p.categoria && <span className="text-fog"> · {p.categoria} en Google</span>}
          </li>
          {p.ciudad && (
            <li className="flex items-center gap-2">
              <MapPin aria-hidden className="h-4 w-4 text-fog" />
              {p.ciudad}
            </li>
          )}
          {p.telefono && (
            <li className="flex items-center gap-2">
              <Phone aria-hidden className="h-4 w-4 text-fog" />
              <a href={`tel:+${p.telefono}`} className="hover:text-white">
                {telefonoTexto(p.telefono)}
              </a>
              {p.tipoTelefono && <span className="text-xs text-fog-dim">({TIPO_TEL[p.tipoTelefono]})</span>}
            </li>
          )}
          <li className="flex items-center gap-2">
            <Globe aria-hidden className="h-4 w-4 text-fog" />
            {p.sitioWeb ? (
              <a href={p.sitioWeb} target="_blank" rel="noopener noreferrer" className="truncate hover:text-white">
                {p.sitioWeb.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
              </a>
            ) : (
              <span>Sin página</span>
            )}
            {p.pagina === "solo_redes" && <span className="text-xs text-fog-dim">(solo redes)</span>}
          </li>
          {p.enlaceMaps && (
            <li>
              <a href={p.enlaceMaps} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-white">
                <ExternalLink aria-hidden className="h-4 w-4 text-fog" /> Ver en Google Maps
              </a>
            </li>
          )}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-white">Servicio sugerido</h3>
        <p className="text-sm text-fog">
          {p.servicio ? <strong className="font-semibold text-white">{SERVICIOS[p.servicio]}</strong> : "Por definir en la reunión"}
          {p.rubro === "odontologia" && " · con reservas de citas"}
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-white">Por qué tiene prioridad {PRIORIDADES[p.prioridad].toLowerCase()}</h3>
        {razones.length === 0 ? (
          <p className="text-sm text-fog-dim">{p.enfoque === "ya_vende" ? "No vemos que venda por internet, tiene pocas reseñas y no sabemos si es empresa." : "Tiene página, pocas reseñas y no sabemos si es empresa."}</p>
        ) : (
          <ul className="divide-y divide-white/6 rounded-frame border border-white/8 bg-surface-1">
            {razones.map((r) => (
              <li key={r.texto} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                <span className="min-w-0 flex-1 text-fog">{r.texto}</span>
                <span className="shrink-0 font-display font-bold text-white">{r.puntos > 0 ? `+${r.puntos}` : `−${Math.abs(r.puntos)}`}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-fog-dim">Enfoque: {ENFOQUES[p.enfoque].toLowerCase()}. Alta desde 5 puntos, media desde 3.</p>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-white">Titular</h3>
        <p className="text-sm text-fog">
          {p.titular === "empresa"
            ? "Es empresa con NIT: su contacto público no es un dato personal."
            : p.titular === "persona_natural"
              ? "Es persona natural: su celular es un dato personal (Ley 1581). Un solo mensaje, uno a uno, y si dice que no, «No contactar»."
              : "No sabemos si es empresa o persona natural. Búscalo en el RUES y cámbialo aquí."}
        </p>
        {p.titular !== "empresa" && (
          <a href={RUES} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 text-sm text-fog hover:text-white">
            <ExternalLink aria-hidden className="h-4 w-4" /> Buscar en el RUES
          </a>
        )}
      </section>

      {puedeEditar ? (
        <form onSubmit={enviar} noValidate className="space-y-4 border-t border-white/8 pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo etiqueta="Estado">
              <select name="estado" defaultValue={p.estado} className="pn-input">
                {opciones(ESTADOS_PROSPECTO).map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo etiqueta="Titular">
              <select name="titular" defaultValue={p.titular} className="pn-input">
                {opciones(TITULARES).map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </select>
            </Campo>
          </div>
          <Campo etiqueta="Notas" obligatorio={false}>
            <textarea name="notas" defaultValue={p.notas ?? ""} rows={3} maxLength={2000} placeholder="Ej. contestó la dueña, quiere ver precios del catálogo" className="pn-input h-auto py-2.5" />
          </Campo>
          <MensajeError error={acc.error} />
          {guardado && !acc.pendiente && (
            <p role="status" className="text-sm text-fog">
              Guardado. La prioridad se recalcula si cambió el titular.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <BotonPrincipal type="submit" pendiente={acc.pendiente} className="flex-1">
              Guardar
            </BotonPrincipal>
            {puedeBorrar && (
              <BotonSecundario
                type="button"
                className="text-alerta"
                onClick={() => window.confirm(`¿Borrar a ${p.nombre} de los prospectos? No se puede deshacer.`) && acc.correr(() => borrarProspecto(p.id), onBorrado)}
              >
                <Trash2 aria-hidden className="h-4 w-4" /> Borrar
              </BotonSecundario>
            )}
          </div>
        </form>
      ) : (
        p.notas && (
          <section>
            <h3 className="mb-2 text-sm font-semibold text-white">Notas</h3>
            <p className="whitespace-pre-line text-sm text-fog">{p.notas}</p>
          </section>
        )
      )}
    </div>
  );
}
