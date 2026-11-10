"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleCheck, Megaphone, Monitor, Plus, RotateCcw, Smartphone, Trash2 } from "lucide-react";
import type { BotonSitio, ConfigSitio as Config, Negocio } from "@/content/panel/tipos";
import { nuevoId, useGuardado } from "@/lib/panel/guardado";
import { PanelHeader, PanelPage, Tarjeta } from "./ui";
import { cn } from "@/lib/utils";

// Módulo 4 · Mi sitio (docs/panel-cliente/01-arquitectura.md §2.4)
// Edita títulos, descripciones y botones con vista previa en vivo (Google + celular).
// Se trabaja sobre un BORRADOR: nada cambia hasta "Guardar cambios".
// En producción, guardar escribe en Supabase y revalida la página del cliente.

const LIM = { seoTitulo: 60, seoDesc: 155, titulo: 70, subtitulo: 140, anuncio: 60, boton: 28 };

/** Enlaces permitidos: https, rutas internas, wa.me, tel: y mailto:. Nada de javascript:. */
export function enlaceValido(url: string) {
  const u = url.trim();
  if (u.startsWith("/")) return !u.startsWith("//");
  return /^(https:\/\/[^\s]+|tel:\+?[\d\s-]{7,}|mailto:[^\s@]+@[^\s@]+)$/i.test(u);
}

function errores(c: Config) {
  const e: Record<string, string> = {};
  if (!c.seo.titulo.trim()) e.seoTitulo = "El título no puede quedar vacío.";
  if (c.seo.titulo.length > LIM.seoTitulo) e.seoTitulo = `Google corta el título después de ${LIM.seoTitulo} caracteres.`;
  if (c.seo.descripcion.length > LIM.seoDesc) e.seoDesc = `Google corta la descripción después de ${LIM.seoDesc} caracteres.`;
  if (!c.portada.titulo.trim()) e.titulo = "La portada necesita un título.";
  c.botones.forEach((b) => {
    if (!b.texto.trim()) e[`bt-${b.id}`] = "Escribe el texto del botón.";
    else if (!enlaceValido(b.enlace)) e[`bl-${b.id}`] = "Usa un enlace que empiece por https://, / o wa.me.";
  });
  return e;
}

export default function ConfigSitio({ inicial, negocio }: { inicial: Config; negocio: Negocio }) {
  const [guardado, setGuardado, listo, restablecer] = useGuardado<Config>("sitio", inicial);
  const [borrador, setBorrador] = useState<Config>(inicial);
  const [vista, setVista] = useState<"celular" | "google">("celular");
  const [aviso, setAviso] = useState(false);

  // Al leer lo guardado, el borrador arranca desde ahí
  useEffect(() => {
    if (listo) setBorrador(guardado);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listo]);

  const sucio = useMemo(() => JSON.stringify({ ...borrador, actualizado: null }) !== JSON.stringify({ ...guardado, actualizado: null }), [borrador, guardado]);
  const errs = errores(borrador);
  const hayErrores = Object.keys(errs).length > 0;

  const set = <K extends keyof Config>(k: K, v: Config[K]) => setBorrador((b) => ({ ...b, [k]: v }));
  const setBoton = (id: string, cambios: Partial<BotonSitio>) => set("botones", borrador.botones.map((b) => (b.id === id ? { ...b, ...cambios } : b)));

  const guardar = () => {
    if (hayErrores) return;
    const nuevo = { ...borrador, actualizado: new Date().toISOString() };
    setGuardado(nuevo);
    setBorrador(nuevo);
    setAviso(true);
    window.setTimeout(() => setAviso(false), 2600);
  };

  const dominio = negocio.sitio.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <PanelPage>
      <PanelHeader
        titulo="Mi sitio"
        bajada="Cambia los textos y botones de tu página. Mira cómo queda a la derecha antes de guardar."
        accion={
          <a href={negocio.sitio} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center rounded-btn border border-white/10 bg-surface-2 px-5 text-sm font-semibold text-white hover:bg-surface-3">
            Ver mi página
          </a>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_400px]">
        <div className="space-y-4">
          <Tarjeta titulo="Cómo sale en Google" bajada="Lo que la gente lee antes de entrar">
            <div className="space-y-4">
              <Campo label="Título" usado={borrador.seo.titulo.length} limite={LIM.seoTitulo} error={errs.seoTitulo}>
                <input value={borrador.seo.titulo} onChange={(e) => set("seo", { ...borrador.seo, titulo: e.target.value })} className="pn-input" maxLength={90} />
              </Campo>
              <Campo label="Descripción" usado={borrador.seo.descripcion.length} limite={LIM.seoDesc} error={errs.seoDesc}>
                <textarea value={borrador.seo.descripcion} onChange={(e) => set("seo", { ...borrador.seo, descripcion: e.target.value })} rows={3} className="pn-input h-auto py-2.5" maxLength={220} />
              </Campo>
            </div>
          </Tarjeta>

          <Tarjeta titulo="Portada" bajada="Lo primero que se ve al abrir la página">
            <div className="space-y-4">
              <Campo label="Título" usado={borrador.portada.titulo.length} limite={LIM.titulo} error={errs.titulo}>
                <input value={borrador.portada.titulo} onChange={(e) => set("portada", { ...borrador.portada, titulo: e.target.value })} className="pn-input" maxLength={LIM.titulo} />
              </Campo>
              <Campo label="Texto de apoyo" usado={borrador.portada.subtitulo.length} limite={LIM.subtitulo}>
                <textarea value={borrador.portada.subtitulo} onChange={(e) => set("portada", { ...borrador.portada, subtitulo: e.target.value })} rows={2} className="pn-input h-auto py-2.5" maxLength={LIM.subtitulo} />
              </Campo>
            </div>
          </Tarjeta>

          <Tarjeta
            titulo="Franja de anuncio"
            bajada="Una línea arriba de todo para promociones o avisos"
            accion={
              <button
                type="button"
                role="switch"
                aria-checked={borrador.anuncio.activo}
                aria-label="Mostrar franja de anuncio"
                onClick={() => set("anuncio", { ...borrador.anuncio, activo: !borrador.anuncio.activo })}
                className={cn("relative h-7 w-12 rounded-full border transition-colors", borrador.anuncio.activo ? "border-lime bg-lime" : "border-white/15 bg-surface-2")}
              >
                <span className={cn("absolute top-0.5 h-5 w-5 rounded-full transition-transform", borrador.anuncio.activo ? "translate-x-[22px] bg-ink" : "translate-x-0.5 bg-fog")} />
              </button>
            }
          >
            <Campo label="Texto" usado={borrador.anuncio.texto.length} limite={LIM.anuncio}>
              <input
                value={borrador.anuncio.texto}
                disabled={!borrador.anuncio.activo}
                onChange={(e) => set("anuncio", { ...borrador.anuncio, texto: e.target.value })}
                className="pn-input disabled:opacity-40"
                maxLength={LIM.anuncio}
              />
            </Campo>
          </Tarjeta>

          <Tarjeta
            titulo="Botones"
            bajada="Texto y a dónde lleva cada botón"
            accion={
              <button
                type="button"
                onClick={() => set("botones", [...borrador.botones, { id: nuevoId("b"), ubicacion: "Portada · extra", texto: "", enlace: `https://wa.me/${negocio.whatsapp}`, estilo: "secundario" }])}
                className="inline-flex h-9 items-center gap-1.5 rounded-btn border border-white/10 px-3 text-xs font-semibold text-white hover:border-white/20"
              >
                <Plus aria-hidden className="h-3.5 w-3.5" /> Agregar
              </button>
            }
          >
            <ul className="space-y-3">
              {borrador.botones.map((b) => (
                <li key={b.id} className="rounded-frame border border-white/8 bg-surface-2/50 p-3 sm:p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-soft">{b.ubicacion}</p>
                    <button
                      type="button"
                      onClick={() => set("botones", borrador.botones.filter((x) => x.id !== b.id))}
                      aria-label={`Quitar botón ${b.texto || b.ubicacion}`}
                      className="flex h-9 w-9 items-center justify-center rounded-btn text-fog-dim hover:text-white"
                    >
                      <Trash2 aria-hidden className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[1fr_1.4fr_auto]">
                    <Campo label="Texto" usado={b.texto.length} limite={LIM.boton} error={errs[`bt-${b.id}`]}>
                      <input value={b.texto} onChange={(e) => setBoton(b.id, { texto: e.target.value })} className="pn-input" maxLength={LIM.boton} />
                    </Campo>
                    <Campo label="Enlace" error={errs[`bl-${b.id}`]}>
                      <input value={b.enlace} onChange={(e) => setBoton(b.id, { enlace: e.target.value })} className="pn-input" inputMode="url" maxLength={300} spellCheck={false} />
                    </Campo>
                    <Campo label="Estilo">
                      <select value={b.estilo} onChange={(e) => setBoton(b.id, { estilo: e.target.value as BotonSitio["estilo"] })} className="pn-input">
                        <option value="principal">Principal</option>
                        <option value="secundario">Secundario</option>
                      </select>
                    </Campo>
                  </div>
                </li>
              ))}
            </ul>
          </Tarjeta>
        </div>

        {/* Vista previa */}
        <div className="xl:sticky xl:top-8 xl:self-start">
          <Tarjeta
            titulo="Vista previa"
            accion={
              <div className="inline-flex rounded-btn border border-white/8 bg-surface-2 p-1" role="radiogroup" aria-label="Vista previa">
                {([
                  { v: "celular", icon: Smartphone, l: "Celular" },
                  { v: "google", icon: Monitor, l: "Google" },
                ] as const).map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    role="radio"
                    aria-checked={vista === o.v}
                    onClick={() => setVista(o.v)}
                    className={cn("inline-flex h-8 items-center gap-1.5 rounded-[7px] px-3 text-xs font-semibold", vista === o.v ? "bg-surface-3 text-white" : "text-fog-dim")}
                  >
                    <o.icon aria-hidden className="h-3.5 w-3.5" /> {o.l}
                  </button>
                ))}
              </div>
            }
          >
            {vista === "google" ? (
              <div className="rounded-frame bg-white p-4 text-left font-[arial,sans-serif]">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F1F3F4] text-[0.7rem] font-bold text-[#202124]">{negocio.nombre[0]}</span>
                  <div className="min-w-0 leading-tight">
                    <p className="truncate text-[0.8rem] text-[#202124]">{negocio.nombre}</p>
                    <p className="truncate text-[0.72rem] text-[#4D5156]">https://{dominio}</p>
                  </div>
                </div>
                <p className="mt-2 text-[1.1rem] leading-snug text-[#1A0DAB]">{recortar(borrador.seo.titulo, LIM.seoTitulo) || "Título de tu página"}</p>
                <p className="mt-1 text-[0.82rem] leading-relaxed text-[#4D5156]">{recortar(borrador.seo.descripcion, LIM.seoDesc) || "Descripción de tu página"}</p>
              </div>
            ) : (
              <div className="mx-auto w-full max-w-[300px] rounded-[34px] border border-white/12 bg-[#0D0A18] p-2.5 shadow-2xl">
                <div className="overflow-hidden rounded-[26px] bg-ink">
                  {borrador.anuncio.activo && borrador.anuncio.texto && (
                    <p className="flex items-center justify-center gap-1.5 bg-lime px-3 py-1.5 text-center text-[0.65rem] font-semibold text-ink">
                      <Megaphone aria-hidden className="h-3 w-3" /> {borrador.anuncio.texto}
                    </p>
                  )}
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="font-display text-xs font-bold text-white">{negocio.nombre}</span>
                    {borrador.botones.find((b) => b.ubicacion === "Menú") && (
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[0.6rem] font-semibold text-white">
                        {borrador.botones.find((b) => b.ubicacion === "Menú")!.texto || "Botón"}
                      </span>
                    )}
                  </div>
                  <div className="px-4 pb-8 pt-6">
                    <p className="font-display text-[1.45rem] font-bold leading-[1.05] tracking-heading text-white">{borrador.portada.titulo || "Título de la portada"}</p>
                    <p className="mt-3 text-[0.78rem] leading-relaxed text-fog">{borrador.portada.subtitulo}</p>
                    <div className="mt-5 flex flex-col gap-2">
                      {borrador.botones
                        .filter((b) => b.ubicacion !== "Menú")
                        .map((b) => (
                          <span
                            key={b.id}
                            className={cn(
                              "flex h-10 items-center justify-center rounded-btn text-[0.78rem] font-semibold",
                              b.estilo === "principal" ? "bg-lime text-ink" : "border border-white/12 bg-surface-2 text-white"
                            )}
                          >
                            {b.texto || "Botón"}
                          </span>
                        ))}
                    </div>
                  </div>
                  <div className="mx-4 mb-4 h-24 rounded-[14px] bg-gradient-to-br from-brand/30 to-surface-2" aria-hidden />
                </div>
              </div>
            )}
          </Tarjeta>
        </div>
      </div>

      {/* Barra de guardado */}
      <div className="sticky bottom-20 z-20 lg:bottom-6">
        <div className={cn("flex flex-col gap-3 rounded-card border p-3 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-4", sucio ? "border-brand/50 bg-surface-3/90" : "border-white/8 bg-surface-1/90")}>
          <p className="text-sm text-fog" aria-live="polite">
            {aviso ? (
              <span className="inline-flex items-center gap-2 text-lime"><CircleCheck aria-hidden className="h-4 w-4" /> Cambios guardados</span>
            ) : hayErrores ? (
              <span className="text-[#FF9BB0]">Revisa los campos marcados antes de guardar.</span>
            ) : sucio ? (
              "Tienes cambios sin guardar."
            ) : guardado.actualizado ? (
              `Guardado el ${new Date(guardado.actualizado).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}`
            ) : (
              "Todo está al día."
            )}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!sucio}
              onClick={() => setBorrador(guardado)}
              className="h-11 flex-1 rounded-btn border border-white/10 px-4 text-sm font-semibold text-white disabled:opacity-30 sm:flex-none"
            >
              Descartar
            </button>
            <button
              type="button"
              disabled={!sucio || hayErrores}
              onClick={guardar}
              className="v2-shine h-11 flex-1 rounded-btn bg-lime px-5 text-sm font-semibold text-ink hover:bg-[#C6FF33] disabled:opacity-30 sm:flex-none"
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end text-xs text-fog-dim">
        <button
          type="button"
          onClick={() => {
            restablecer();
            setBorrador(inicial);
          }}
          className="inline-flex items-center gap-1.5 hover:text-white"
        >
          <RotateCcw aria-hidden className="h-3.5 w-3.5" /> Volver a los datos de ejemplo
        </button>
      </div>
    </PanelPage>
  );
}

function recortar(t: string, n: number) {
  return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t;
}

function Campo({ label, usado, limite, error, children }: { label: string; usado?: number; limite?: number; error?: string; children: React.ReactNode }) {
  const pasado = limite !== undefined && usado !== undefined && usado > limite;
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 flex items-baseline justify-between gap-2 text-xs font-medium text-fog">
        {label}
        {limite !== undefined && (
          <span className={cn("tabular-nums", pasado ? "text-[#FF9BB0]" : "text-fog-dim")}>
            {usado}/{limite}
          </span>
        )}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-xs text-[#FF9BB0]">{error}</span>}
    </label>
  );
}
