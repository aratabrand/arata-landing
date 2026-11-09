import type { Metadata } from "next";
import { Container } from "@/components/v2/primitives";
import { privacidad as c, responsable as r } from "@/content/privacidad";
import { paginaV2 } from "@/lib/seo";

// Política de datos (02-arquitectura.md §3.8). Texto en content/privacidad.ts.
export const metadata: Metadata = paginaV2({ path: "/privacidad", title: c.meta.title, description: c.meta.description });

export default function Privacidad() {
  const filas = [
    ["Responsable", `${r.nombre} (${r.tipo.toLowerCase()}), marca ${r.marca}`],
    r.rut ? ["RUT", r.rut] : null,
    r.direccion ? ["Dirección", r.direccion] : null,
    ["Ciudad", r.ciudad],
    ["Correo para tus datos", r.correo],
  ].filter(Boolean) as [string, string][];

  return (
    <section className="pb-24 pt-28 sm:pt-32">
      <Container className="max-w-3xl">
        <h1 className="font-display text-[clamp(2rem,6vw,3.25rem)] font-extrabold leading-[1.05] tracking-display text-white">
          {c.titulo}
        </h1>
        <p className="mt-5 text-v2-lead text-fog">{c.intro}</p>

        <dl className="mt-10 divide-y divide-white/8 rounded-card border border-white/8 bg-surface-1">
          {filas.map(([k, v]) => (
            <div key={k} className="grid gap-1 px-5 py-4 sm:grid-cols-[200px_1fr] sm:gap-4">
              <dt className="text-sm text-fog-dim">{k}</dt>
              <dd className="text-white">
                {k.startsWith("Correo") ? (
                  <a href={`mailto:${v}`} className="underline decoration-white/30 underline-offset-4 hover:text-lime">
                    {v}
                  </a>
                ) : (
                  v
                )}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 space-y-10">
          {c.secciones.map((s, i) => (
            <section key={s.titulo} aria-labelledby={`pol-${i}`}>
              <h2 id={`pol-${i}`} className="font-display text-xl font-bold tracking-heading text-white">
                {s.titulo}
              </h2>
              {s.lista && (
                <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-fog marker:text-brand-soft">
                  {s.lista.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              )}
              {s.parrafos?.map((p) => (
                <p key={p} className="mt-4 leading-relaxed text-fog">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>

        <p className="mt-12 border-t border-white/8 pt-6 text-sm text-fog-dim">Vigente desde {r.vigencia}.</p>
      </Container>
    </section>
  );
}
