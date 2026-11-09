"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, MessageCircle } from "lucide-react";
import { agendar as c, calLinks, type TipoAgenda } from "@/content/agendar";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

// Flujo de /agendar (02-arquitectura.md §2): 3 preguntas + datos + calendario.
// - Tocar una opción la elige y pasa al siguiente paso (cómodo con el pulgar).
// - En "auditoría" se pide la URL y se salta la pregunta de inversión (D-036).
// - Las respuestas viajan con la cita en las notas de Cal.com (la reunión llega preparada).
// - Cada paso empuja un evento a GTM (dataLayer) para medir dónde se sale la gente.
// - Cal.com se carga SOLO al llegar al último paso (el script no pesa al abrir la página).

type Paso = "tipo" | "cuando" | "inversion" | "datos" | "calendario";

type Datos = { nombre: string; whatsapp: string; correo: string; url: string; autoriza: boolean };

const TIPOS: TipoAgenda[] = ["pagina", "catalogo", "sistema", "auditoria"];

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    Cal?: CalFn;
  }
}
type CalFn = ((...args: unknown[]) => void) & { loaded?: boolean; ns?: Record<string, unknown>; q?: unknown[] };

function track(event: string, data: Record<string, unknown> = {}) {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...data });
}

const soloDigitos = (s: string) => s.replace(/\D/g, "");
const whatsappValido = (s: string) => {
  const d = soloDigitos(s);
  return d.length >= 10 && d.length <= 15;
};
const correoValido = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());
const urlValida = (s: string) => /^(https?:\/\/)?[^\s.]+\.[^\s]{2,}/i.test(s.trim());

export default function BookingFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const inicial = params.get("tipo") as TipoAgenda | null;

  const [tipo, setTipo] = useState<TipoAgenda | null>(inicial && TIPOS.includes(inicial) ? inicial : null);
  const [cuando, setCuando] = useState<string | null>(null);
  const [inversion, setInversion] = useState<string | null>(null);
  const [datos, setDatos] = useState<Datos>({ nombre: "", whatsapp: "", correo: "", url: "", autoriza: false });
  const [paso, setPaso] = useState<Paso>("tipo");
  const [errores, setErrores] = useState<Partial<Record<keyof Datos | "opcion", string>>>({});
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const primerRender = useRef(true);

  const auditoria = tipo === "auditoria";
  const orden: Paso[] = useMemo(
    () => (auditoria ? ["tipo", "cuando", "datos", "calendario"] : ["tipo", "cuando", "inversion", "datos", "calendario"]),
    [auditoria]
  );
  const idx = orden.indexOf(paso);
  const total = orden.length;

  // Al cambiar de paso, el foco va al título del paso (lectores de pantalla y teclado)
  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    tituloRef.current?.focus({ preventScroll: true });
    const top = tituloRef.current?.closest("[data-flujo]")?.getBoundingClientRect().top ?? 0;
    if (top < 64) window.scrollBy({ top: top - 88, behavior: "smooth" });
  }, [paso]);

  const ir = (p: Paso) => {
    setErrores({});
    setPaso(p);
    track("agendar_paso", { paso: p, tipo });
  };
  const siguiente = () => ir(orden[Math.min(idx + 1, total - 1)]);
  const atras = () => ir(orden[Math.max(idx - 1, 0)]);

  const elegir = (setter: (v: string) => void, v: string, avanzar = true) => {
    setter(v);
    if (avanzar) window.setTimeout(siguiente, 180);
  };

  const continuarTipo = () => {
    if (!tipo) return setErrores({ opcion: c.errores.opcion });
    if (auditoria && !urlValida(datos.url)) return setErrores({ url: c.errores.url });
    siguiente();
  };

  const validarDatos = () => {
    const e: typeof errores = {};
    if (!datos.nombre.trim()) e.nombre = c.errores.nombre;
    if (!whatsappValido(datos.whatsapp)) e.whatsapp = c.errores.whatsapp;
    if (!correoValido(datos.correo)) e.correo = c.errores.correo;
    if (!datos.autoriza) e.autoriza = c.errores.autorizacion;
    setErrores(e);
    if (Object.keys(e).length === 0) {
      track("agendar_datos_completos", { tipo });
      ir("calendario");
    } else {
      // Lleva al primer campo con error
      const primero = Object.keys(e)[0];
      document.getElementById(`campo-${primero}`)?.focus();
    }
  };

  const tipoLabel = c.pasos.tipo.opciones.find((o) => o.valor === tipo)?.label ?? "";
  const resumen = [
    `Necesito: ${tipoLabel}`,
    auditoria && datos.url ? `Mi página: ${datos.url.trim()}` : null,
    `Para cuándo: ${cuando ?? "-"}`,
    !auditoria ? `Inversión: ${inversion ?? "-"}` : null,
    `WhatsApp: ${datos.whatsapp.trim()}`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div data-flujo className="rounded-[28px] border border-white/8 bg-surface-1 p-5 sm:p-8">
      {/* Progreso */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-fog-dim">
          Paso <span className="font-semibold text-white">{idx + 1}</span> de {total}
        </p>
        {idx > 0 && paso !== "calendario" && (
          <button
            type="button"
            onClick={atras}
            className="-mr-2 inline-flex h-10 items-center gap-1.5 rounded-btn px-2 text-sm font-medium text-fog transition-colors hover:text-white"
          >
            <ArrowLeft aria-hidden className="h-4 w-4" />
            {c.botones.atras}
          </button>
        )}
      </div>
      <div className="mt-3 flex gap-1.5" aria-hidden>
        {orden.map((p, i) => (
          <span key={p} className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
            <span
              className="block h-full origin-left rounded-full bg-lime transition-transform duration-500 ease-out"
              style={{ transform: `scaleX(${i <= idx ? 1 : 0})` }}
            />
          </span>
        ))}
      </div>

      <div key={paso} className="v2-step mt-8">
        {paso === "tipo" && (
          <Pregunta titulo={c.pasos.tipo.pregunta} tituloRef={tituloRef} error={errores.opcion}>
            <Opciones
              opciones={c.pasos.tipo.opciones.map((o) => ({ valor: o.valor, label: o.label }))}
              valor={tipo}
              onElegir={(v) => {
                const t = v as TipoAgenda;
                setTipo(t);
                setErrores({});
                if (t !== "auditoria") window.setTimeout(() => ir("cuando"), 180);
              }}
            />
            {auditoria && (
              <div className="mt-6">
                <Campo
                  id="campo-url"
                  label={c.pasos.url.pregunta}
                  error={errores.url}
                  input={{
                    type: "text",
                    inputMode: "url",
                    autoComplete: "url",
                    placeholder: c.pasos.url.placeholder,
                    value: datos.url,
                    onChange: (e) => setDatos({ ...datos, url: e.target.value }),
                  }}
                />
                <p className="mt-3 text-sm text-fog">{c.auditoriaNota}</p>
                <Siguiente onClick={continuarTipo}>{c.botones.siguiente}</Siguiente>
              </div>
            )}
            {tipo && !auditoria && <Siguiente onClick={continuarTipo}>{c.botones.siguiente}</Siguiente>}
          </Pregunta>
        )}

        {paso === "cuando" && (
          <Pregunta titulo={c.pasos.cuando.pregunta} tituloRef={tituloRef}>
            <Opciones
              opciones={c.pasos.cuando.opciones.map((o) => ({ valor: o, label: o }))}
              valor={cuando}
              onElegir={(v) => elegir(setCuando, v)}
            />
          </Pregunta>
        )}

        {paso === "inversion" && (
          <Pregunta titulo={c.pasos.inversion.pregunta} tituloRef={tituloRef}>
            <Opciones
              opciones={c.pasos.inversion.opciones.map((o) => ({ valor: o, label: o }))}
              valor={inversion}
              // "Menos de 400 USD" no avanza solo: primero ve la facilidad de pago (D-041)
              onElegir={(v) => elegir(setInversion, v, v !== c.pasos.inversion.opciones[0])}
            />
            {inversion === c.pasos.inversion.opciones[0] && (
              <div className="v2-step mt-5">
                <p className="rounded-frame border border-lime/30 bg-lime/[0.06] p-4 text-white">{c.pasos.inversion.notaMenos}</p>
                <Siguiente onClick={siguiente}>{c.botones.siguiente}</Siguiente>
              </div>
            )}
          </Pregunta>
        )}

        {paso === "datos" && (
          <Pregunta titulo={c.pasos.datos.pregunta} tituloRef={tituloRef}>
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                validarDatos();
              }}
              className="space-y-4"
            >
              <Campo
                id="campo-nombre"
                label={c.pasos.datos.nombre}
                error={errores.nombre}
                input={{
                  type: "text",
                  autoComplete: "name",
                  value: datos.nombre,
                  onChange: (e) => setDatos({ ...datos, nombre: e.target.value }),
                }}
              />
              <Campo
                id="campo-whatsapp"
                label={c.pasos.datos.whatsapp}
                error={errores.whatsapp}
                input={{
                  type: "tel",
                  inputMode: "tel",
                  autoComplete: "tel",
                  placeholder: c.pasos.datos.whatsappPlaceholder,
                  value: datos.whatsapp,
                  onChange: (e) => setDatos({ ...datos, whatsapp: e.target.value }),
                }}
              />
              <Campo
                id="campo-correo"
                label={c.pasos.datos.correo}
                error={errores.correo}
                input={{
                  type: "email",
                  inputMode: "email",
                  autoComplete: "email",
                  placeholder: c.pasos.datos.correoPlaceholder,
                  value: datos.correo,
                  onChange: (e) => setDatos({ ...datos, correo: e.target.value }),
                }}
              />
              <div>
                <label
                  htmlFor="campo-autoriza"
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-frame border p-4 text-sm leading-relaxed text-fog transition-colors",
                    errores.autoriza ? "border-[#FF6B8A]/60" : "border-white/8 hover:border-white/16"
                  )}
                >
                  <input
                    id="campo-autoriza"
                    type="checkbox"
                    checked={datos.autoriza}
                    onChange={(e) => setDatos({ ...datos, autoriza: e.target.checked })}
                    aria-invalid={!!errores.autoriza}
                    aria-describedby={errores.autoriza ? "error-autoriza" : undefined}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-[#B6FF00]"
                  />
                  <span>
                    {c.pasos.datos.autorizacion}{" "}
                    <Link href="/privacidad" target="_blank" className="font-semibold text-white underline decoration-white/30 underline-offset-4 hover:text-lime">
                      {c.pasos.datos.autorizacionLink}
                    </Link>
                    .
                  </span>
                </label>
                {errores.autoriza && <Error id="error-autoriza">{errores.autoriza}</Error>}
              </div>
              <button
                type="submit"
                className="v2-shine group mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-btn bg-lime px-6 text-[0.95rem] font-semibold text-ink transition-colors hover:bg-[#C6FF33]"
              >
                {c.botones.elegirHora}
                <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>
          </Pregunta>
        )}

        {paso === "calendario" && (
          <Pregunta titulo={c.calendario.titulo} tituloRef={tituloRef}>
            <Calendario
              link={auditoria ? calLinks.auditoria : calLinks.reunion}
              nombre={datos.nombre.trim()}
              correo={datos.correo.trim()}
              notas={resumen}
              onAgendada={() => {
                track("cita_agendada", { tipo });
                router.push(`/agendar/gracias${tipo ? `?tipo=${tipo}` : ""}`);
              }}
            />
            <button
              type="button"
              onClick={atras}
              className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-btn text-sm font-medium text-fog transition-colors hover:text-white"
            >
              <ArrowLeft aria-hidden className="h-4 w-4" />
              {c.botones.atras}
            </button>
          </Pregunta>
        )}
      </div>
    </div>
  );
}

/* ── Piezas ──────────────────────────────────────────────────────────── */

function Pregunta({
  titulo,
  tituloRef,
  error,
  children,
}: {
  titulo: string;
  tituloRef: React.RefObject<HTMLHeadingElement>;
  error?: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <fieldset aria-labelledby={id} className="min-w-0">
      <h2
        id={id}
        ref={tituloRef}
        tabIndex={-1}
        className="font-display text-[1.6rem] font-bold leading-tight tracking-heading text-white outline-none sm:text-3xl"
      >
        {titulo}
      </h2>
      {error && <Error>{error}</Error>}
      <div className="mt-6">{children}</div>
    </fieldset>
  );
}

function Opciones({
  opciones,
  valor,
  onElegir,
}: {
  opciones: { valor: string; label: string }[];
  valor: string | null;
  onElegir: (v: string) => void;
}) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {opciones.map((o) => {
        const on = valor === o.valor;
        return (
          <button
            key={o.valor}
            type="button"
            aria-pressed={on}
            onClick={() => onElegir(o.valor)}
            className={cn(
              "flex min-h-[3.75rem] items-center justify-between gap-3 rounded-frame border px-4 py-3 text-left font-medium transition-[background-color,border-color,transform] active:scale-[0.98]",
              on ? "border-lime bg-lime/[0.08] text-white" : "border-white/10 bg-ink/50 text-white hover:border-white/20 hover:bg-surface-2"
            )}
          >
            {o.label}
            <span
              aria-hidden
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                on ? "border-lime bg-lime text-ink" : "border-white/20"
              )}
            >
              {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Campo({
  id,
  label,
  error,
  input,
}: {
  id: string;
  label: string;
  error?: string;
  input: React.InputHTMLAttributes<HTMLInputElement>;
}) {
  const errId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-white">
        {label}
      </label>
      <input
        id={id}
        {...input}
        aria-invalid={!!error}
        aria-describedby={error ? errId : undefined}
        className={cn(
          "mt-2 block h-12 w-full rounded-btn border bg-ink px-4 text-base text-white placeholder:text-fog-dim/70 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30",
          error ? "border-[#FF6B8A]/70" : "border-white/10"
        )}
      />
      {error && <Error id={errId}>{error}</Error>}
    </div>
  );
}

function Error({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} role="alert" className="mt-2 text-sm text-[#FF8FA6]">
      {children}
    </p>
  );
}

function Siguiente({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-btn border border-white/10 bg-surface-2 px-6 text-[0.95rem] font-semibold text-white transition-colors hover:border-white/16 hover:bg-surface-3 sm:w-auto"
    >
      {children}
      <ArrowRight aria-hidden className="h-4 w-4" />
    </button>
  );
}

/* ── Calendario de Cal.com ───────────────────────────────────────────── */

const CAL_ORIGIN = "https://app.cal.com";

/** Carga el embed oficial de Cal.com (una sola vez) y devuelve la función Cal. */
function cargarCal(): CalFn {
  const w = window;
  if (!w.Cal) {
    // Equivalente al snippet oficial de Cal.com (sin eval): encola llamadas hasta que carga embed.js
    const cal = function (...args: unknown[]) {
      const self = cal as CalFn;
      if (!self.loaded) {
        self.ns = {};
        self.q = self.q ?? [];
        const s = document.createElement("script");
        s.src = `${CAL_ORIGIN}/embed/embed.js`;
        s.async = true;
        document.head.appendChild(s);
        self.loaded = true;
      }
      (self.q as unknown[]).push(args);
    } as CalFn;
    w.Cal = cal;
    w.Cal("init", { origin: "https://cal.com" });
  }
  return w.Cal;
}

function Calendario({
  link,
  nombre,
  correo,
  notas,
  onAgendada,
}: {
  link: string;
  nombre: string;
  correo: string;
  notas: string;
  onAgendada: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [listo, setListo] = useState(false);
  // Si Cal.com no abre en 8 s (señal lenta, bloqueador), se ofrece terminar por WhatsApp
  const [lento, setLento] = useState(false);
  useEffect(() => {
    if (!link || listo) return;
    const t = window.setTimeout(() => setLento(true), 8000);
    return () => window.clearTimeout(t);
  }, [link, listo]);
  const textoWhatsapp = `Hola Arata San, quiero agendar mi reunión.\n\nNombre: ${nombre}\nCorreo: ${correo}\n${notas}`;
  const hrefWhatsapp = `https://wa.me/${site.phone}?text=${encodeURIComponent(textoWhatsapp)}`;

  useEffect(() => {
    if (!link || !ref.current) return;
    const Cal = cargarCal();
    const el = ref.current;
    el.innerHTML = "";
    Cal("inline", {
      elementOrSelector: el,
      calLink: link,
      layout: "month_view",
      config: { name: nombre, email: correo, notes: notas, theme: "dark", layout: "month_view" },
    });
    Cal("ui", {
      theme: "dark",
      hideEventTypeDetails: false,
      layout: "month_view",
      cssVarsPerTheme: { dark: { "cal-brand": "#B6FF00" } },
    });
    Cal("on", { action: "linkReady", callback: () => setListo(true) });
    Cal("on", { action: "bookingSuccessful", callback: onAgendada });
    Cal("on", { action: "bookingSuccessfulV2", callback: onAgendada });
    track("agendar_calendario", {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [link]);

  // Sin Cal.com configurado: se termina por WhatsApp con las respuestas ya escritas
  if (!link) {
    return (
      <div className="rounded-frame border border-white/8 bg-ink/50 p-5">
        <p className="text-fog">{c.calendario.sinCalendario}</p>
        <a
          href={hrefWhatsapp}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("agendar_whatsapp", {})}
          className="v2-shine mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-btn bg-lime px-6 text-[0.95rem] font-semibold text-ink sm:w-auto"
        >
          <MessageCircle aria-hidden className="h-4 w-4" />
          {c.calendario.botonWhatsapp}
        </a>
      </div>
    );
  }

  return (
    <div className="relative min-h-[560px] overflow-hidden rounded-frame border border-white/8 bg-ink/50">
      {!listo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center" aria-live="polite">
          <p className="text-sm text-fog-dim">{c.calendario.cargando}</p>
          {lento && (
            <a
              href={hrefWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("agendar_whatsapp", { motivo: "calendario_lento" })}
              className="inline-flex h-11 items-center gap-2 rounded-btn border border-white/10 bg-surface-2 px-5 text-sm font-semibold text-white hover:bg-surface-3"
            >
              <MessageCircle aria-hidden className="h-4 w-4" />
              {c.calendario.botonWhatsapp}
            </a>
          )}
        </div>
      )}
      <div ref={ref} className="relative min-h-[560px] w-full" />
    </div>
  );
}
