"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleCheck, Megaphone, Monitor, Plus, RotateCcw, Send, Smartphone, Trash2 } from "lucide-react";
import type { BotonSitio, ConfigSitio as Config, Negocio } from "@/content/panel/tipos";
import { nuevoId, useGuardado } from "@/lib/panel/guardado";
import { LIM, enlaceValido, errores } from "@/lib/panel/sitio/reglas";
import { guardarSitio, publicarSitio } from "@/app/(panel)/panel/(app)/sitio/acciones";
import { PanelHeader, PanelPage, Tarjeta } from "./ui";
import { AvisoAcceso, useAccion } from "./finanzas/comun";

export { enlaceValido };
import { cn } from "@/lib/utils";

// Módulo 4 · Mi sitio (docs/panel-cliente/01-arquitectura.md §2.4)
// Edita títulos, descripciones y botones con vista previa en vivo (Google + celular).
// Se trabaja sobre un BORRADOR: nada cambia hasta "Guardar cambios".
// Dos modos:
// - Ejemplo (sin conexión): guarda en el navegador (useGuardado).
// - Arata San (D-111): arranca con lo que publica aratasan.com y guarda en Neon con historial.
//   "Publicar" (D-117) sube lo guardado a aratasan.com: Vercel reconstruye el sitio (1–2 min).
//   El sitio solo tiene los 3 botones fijos y no tiene franja de anuncio: aquí no se agregan.

/** Datos del modo real de Arata San. */
export type Remoto = { puedeEditar: boolean; fuente: "sitio" | "panel"; publicado: Config; publicadoEn: string | null; puedePublicar: boolean };

export default function ConfigSitio({ inicial, negocio, remoto }: { inicial: Config; negocio: Negocio; remoto?: Remoto }) {
  return remoto ? <SitioRemoto inicial={inicial} negocio={negocio} remoto={remoto} /> : <SitioLocal inicial={inicial} negocio={negocio} />;
}

function SitioLocal({ inicial, negocio }: { inicial: Config; negocio: Negocio }) {
  const [guardado, setGuardado, listo, restablecer] = useGuardado<Config>("sitio", inicial);
  return <EditorSitio inicial={inicial} negocio={negocio} guardado={guardado} setGuardado={setGuardado} listo={listo} restablecer={restablecer} />;
}

function SitioRemoto({ inicial, negocio, remoto }: { inicial: Config; negocio: Negocio; remoto: Remoto }) {
  const [guardado, setGuardado] = useState<Config>(inicial);
  return <EditorSitio inicial={inicial} negocio={negocio} guardado={guardado} setGuardado={setGuardado} listo remoto={remoto} />;
}

function EditorSitio({
  inicial,
  negocio,
  guardado,
  setGuardado,
  listo,
  restablecer,
  remoto,
}: {
  inicial: Config;
  negocio: Negocio;
  guardado: Config;
  setGuardado: (c: Config) => void;
  listo: boolean;
  restablecer?: () => void;
  remoto?: Remoto;
}) {
  const [borrador, setBorrador] = useState<Config>(inicial);
  const acc = useAccion();
  const pub = useAccion();
  const [publicando, setPublicando] = useState(false);
  const edita = !remoto || remoto.puedeEditar;
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

  const listoGuardado = (nuevo: Config) => {
    setGuardado(nuevo);
    setBorrador(nuevo);
    setAviso(true);
    window.setTimeout(() => setAviso(false), 2600);
  };
  const guardar = () => {
    if (hayErrores || !edita) return;
    const nuevo = { ...borrador, actualizado: new Date().toISOString() };
    if (remoto) acc.correr(() => guardarSitio(nuevo), () => listoGuardado(nuevo));
    else listoGuardado(nuevo);
  };
  // Qué difiere de lo que hoy publica aratasan.com
  const pendientes = remoto
    ? [
        guardado.seo.titulo !== remoto.publicado.seo.titulo && "título de Google",
        guardado.seo.descripcion !== remoto.publicado.seo.descripcion && "descripción de Google",
        guardado.portada.titulo !== remoto.publicado.portada.titulo && "título de la portada",
        guardado.portada.subtitulo !== remoto.publicado.portada.subtitulo && "texto de la portada",
        // Campo por campo: la base (jsonb) reordena las llaves y JSON.stringify daría diferencias falsas
        (guardado.anuncio.activo !== remoto.publicado.anuncio.activo || guardado.anuncio.texto !== remoto.publicado.anuncio.texto) && "franja de anuncio",
        claveBotones(guardado.botones) !== claveBotones(remoto.publicado.botones) && "botones",
      ].filter(Boolean)
    : [];

  const dominio = dominioDe(negocio.sitio);

  return (
    <PanelPage>
      <PanelHeader
        titulo="Ajustes del sitio"
        volver={{ href: "/panel/configuracion", texto: "Configuración" }}
        bajada="Cambia los textos y botones de tu página. Mira cómo queda a la derecha antes de guardar."
        accion={
          <a href={negocio.sitio} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center rounded-btn border border-white/10 bg-surface-2 px-5 text-sm font-semibold text-white hover:bg-surface-3">
            Ver mi página
          </a>
        }
      />

      {remoto && (
        <>
          <AvisoAcceso demo={false} puedeEditar={remoto.puedeEditar} />
          <div className="rounded-frame border border-white/8 bg-surface-1 px-4 py-3 text-sm text-fog">
            {remoto.fuente === "sitio" && pendientes.length === 0 ? (
              <>Estos son los textos y botones que <strong className="text-white">hoy publica {negocio.sitio.replace(/^https:\/\//, "")}</strong>, tomados del sitio.</>
            ) : pendientes.length ? (
              <>Guardado en el panel y <strong className="text-white">pendiente de publicar</strong> en el sitio: {pendientes.join(", ")}.</>
            ) : (
              <>Lo guardado en el panel es igual a lo que publica el sitio.</>
            )}{" "}
            <span className="text-fog-dim">Guardar deja los cambios en el panel con historial. Publicar los sube a la página (tarda 1–2 minutos).</span>
            {remoto.publicadoEn && (
              <span className="mt-1 block text-xs text-fog-dim">
                Última publicación: {new Date(remoto.publicadoEn).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Bogota" })}
              </span>
            )}
            {remoto.puedeEditar && pendientes.length > 0 && !sucio && (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  disabled={!remoto.puedePublicar || pub.pendiente || hayErrores}
                  onClick={() => pub.correr(() => publicarSitio(), () => setPublicando(true))}
                  className="v2-shine inline-flex h-11 items-center justify-center gap-2 rounded-btn bg-lime px-5 text-sm font-semibold text-ink hover:bg-[#C6FF33] disabled:opacity-30"
                >
                  <Send aria-hidden className="h-4 w-4" />
                  {pub.pendiente ? "Publicando…" : `Publicar en ${dominioDe(negocio.sitio)}`}
                </button>
                {!remoto.puedePublicar && <span className="text-xs text-fog-dim">Falta conectar el panel con Vercel (SITIO_DEPLOY_HOOK).</span>}
                {pub.error && <span role="alert" className="text-xs text-[#FF9BB0]">{pub.error}</span>}
              </div>
            )}
            {publicando && pendientes.length === 0 && (
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-lime" aria-live="polite">
                <CircleCheck aria-hidden className="h-4 w-4" /> Enviado. La página se actualiza en 1–2 minutos.
              </p>
            )}
          </div>
        </>
      )}

      <div className="grid gap-4 xl:grid-cols-[1fr_400px]">
        <fieldset disabled={!edita} className="min-w-0 space-y-4 disabled:opacity-80">
          <Tarjeta titulo="Cómo sale en Google" bajada="Lo que la gente lee antes de entrar">
            <div className="space-y-4">
              <Campo label="Título *" usado={borrador.seo.titulo.length} limite={LIM.seoTitulo} error={errs.seoTitulo}>
                <input value={borrador.seo.titulo} onChange={(e) => set("seo", { ...borrador.seo, titulo: e.target.value })} className="pn-input" maxLength={90} />
              </Campo>
              <Campo label="Descripción" opcional usado={borrador.seo.descripcion.length} limite={LIM.seoDesc} error={errs.seoDesc}>
                <textarea value={borrador.seo.descripcion} onChange={(e) => set("seo", { ...borrador.seo, descripcion: e.target.value })} rows={3} className="pn-input h-auto py-2.5" maxLength={220} />
              </Campo>
            </div>
          </Tarjeta>

          <Tarjeta titulo="Portada" bajada="Lo primero que se ve al abrir la página">
            <div className="space-y-4">
              <Campo label="Título *" usado={borrador.portada.titulo.length} limite={LIM.titulo} error={errs.titulo}>
                <input value={borrador.portada.titulo} onChange={(e) => set("portada", { ...borrador.portada, titulo: e.target.value })} className="pn-input" maxLength={LIM.titulo} />
              </Campo>
              {remoto && <p className="-mt-2 text-xs text-fog-dim">La primera frase sale en blanco y lo que sigue, en lima.</p>}
              <Campo label="Texto de apoyo" opcional usado={borrador.portada.subtitulo.length} limite={LIM.subtitulo}>
                <textarea value={borrador.portada.subtitulo} onChange={(e) => set("portada", { ...borrador.portada, subtitulo: e.target.value })} rows={2} className="pn-input h-auto py-2.5" maxLength={LIM.subtitulo} />
              </Campo>
            </div>
          </Tarjeta>

          {!remoto && (
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
                <span className={cn("absolute left-0 top-0.5 h-5 w-5 rounded-full transition-transform", borrador.anuncio.activo ? "translate-x-[22px] bg-ink" : "translate-x-0.5 bg-fog")} />
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
          )}

          <Tarjeta
            titulo="Botones"
            bajada="Texto y a dónde lleva cada botón"
            accion={
              !remoto && <button
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
                    {!remoto && <button
                      type="button"
                      onClick={() => set("botones", borrador.botones.filter((x) => x.id !== b.id))}
                      aria-label={`Quitar botón ${b.texto || b.ubicacion}`}
                      className="flex h-9 w-9 items-center justify-center rounded-btn text-fog-dim hover:text-white"
                    >
                      <Trash2 aria-hidden className="h-4 w-4" />
                    </button>}
                  </div>
                  <div className={cn("grid gap-3", remoto ? "sm:grid-cols-[1fr_1.4fr]" : "sm:grid-cols-[1fr_1.4fr_auto]")}>
                    <Campo label="Texto *" usado={b.texto.length} limite={LIM.boton} error={errs[`bt-${b.id}`]}>
                      <input value={b.texto} onChange={(e) => setBoton(b.id, { texto: e.target.value })} className="pn-input" maxLength={LIM.boton} />
                    </Campo>
                    <Campo label="Enlace *" error={errs[`bl-${b.id}`]}>
                      <input value={b.enlace} onChange={(e) => setBoton(b.id, { enlace: e.target.value })} className="pn-input" inputMode="url" maxLength={300} spellCheck={false} />
                    </Campo>
                    {!remoto && (
                      <Campo label="Estilo">
                        <select value={b.estilo} onChange={(e) => setBoton(b.id, { estilo: e.target.value as BotonSitio["estilo"] })} className="pn-input">
                          <option value="principal">Principal</option>
                          <option value="secundario">Secundario</option>
                        </select>
                      </Campo>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Tarjeta>
        </fieldset>

        {/* Vista previa */}
        <div className="xl:sticky xl:top-28 xl:self-start">
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
                    <p className="font-display text-[1.45rem] font-bold leading-[1.05] tracking-heading text-white">{remoto ? <TituloDosColores texto={borrador.portada.titulo} /> : borrador.portada.titulo || "Título de la portada"}</p>
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
            {acc.error ? (
              <span className="text-[#FF9BB0]">{acc.error}</span>
            ) : aviso ? (
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
              disabled={!sucio || hayErrores || !edita || acc.pendiente}
              onClick={guardar}
              className="v2-shine h-11 flex-1 rounded-btn bg-lime px-5 text-sm font-semibold text-ink hover:bg-[#C6FF33] disabled:opacity-30 sm:flex-none"
            >
              {acc.pendiente ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end text-xs text-fog-dim">
        {remoto ? (
          edita && (
            <button type="button" onClick={() => setBorrador(remoto.publicado)} className="inline-flex items-center gap-1.5 hover:text-white">
              <RotateCcw aria-hidden className="h-3.5 w-3.5" /> Volver a lo que publica el sitio
            </button>
          )
        ) : (
          <button
            type="button"
            onClick={() => {
              restablecer?.();
              setBorrador(inicial);
            }}
            className="inline-flex items-center gap-1.5 hover:text-white"
          >
            <RotateCcw aria-hidden className="h-3.5 w-3.5" /> Volver a los datos de ejemplo
          </button>
        )}
      </div>
    </PanelPage>
  );
}

/** Igual que el sitio (lib/sitio-textos.ts · partirTitulo): primera frase en blanco, el resto en lima. */
function TituloDosColores({ texto }: { texto: string }) {
  const m = texto.trim().match(/^(.+?[.!?])\s+(.+)$/);
  if (!m) return <>{texto || "Título de la portada"}</>;
  return (
    <>
      {m[1]} <span className="text-lime">{m[2]}</span>
    </>
  );
}

function claveBotones(b: BotonSitio[]) {
  return b.map((x) => [x.id, x.texto, x.enlace, x.estilo].join("\u0000")).join("\u0001");
}

function dominioDe(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function recortar(t: string, n: number) {
  return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t;
}

function Campo({ label, usado, limite, error, opcional, children }: { label: string; usado?: number; limite?: number; error?: string; opcional?: boolean; children: React.ReactNode }) {
  const req = /\*$/.test(label);
  const pasado = limite !== undefined && usado !== undefined && usado > limite;
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 flex items-baseline justify-between gap-2 text-xs font-medium text-fog">
        <span>
          {label.replace(/\s*\*$/, "")}
          {req && (
            <>
              <span aria-hidden className="ml-0.5 text-lime">*</span>
              <span className="sr-only"> (obligatorio)</span>
            </>
          )}
          {opcional && <span className="ml-1.5 font-normal text-fog-dim">· Opcional</span>}
        </span>
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
