import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import Ring from "@/components/Ring";
import { Button } from "@/components/v2/Button";
import { Badge, Container, Eyebrow, Glow, SectionHeader } from "@/components/v2/primitives";
import Spotlight from "@/components/v2/Spotlight";
import ProjectPreview from "@/components/v2/ProjectPreview";
import { GuaranteeSeal, PricingCard } from "@/components/v2/Pricing";
import { precios } from "@/content/inicio";

// Guía viva del sistema de diseño v2 (Fase 3).
// Especificación escrita: docs/blueprint/04-sistema-de-diseno.md
export const metadata: Metadata = {
  title: "Sistema de diseño v2 · Arata San",
  robots: { index: false, follow: false },
};

const colores = [
  { token: "ink", hex: "#03010B", uso: "Único fondo de página", clase: "bg-ink border border-white/10" },
  { token: "surface-1", hex: "#0A0714", uso: "Tarjetas", clase: "bg-surface-1 border border-white/10" },
  { token: "surface-2", hex: "#110C20", uso: "Hover, botón secundario", clase: "bg-surface-2" },
  { token: "surface-3", hex: "#18112D", uso: "Menús y modales", clase: "bg-surface-3" },
  { token: "lime", hex: "#B6FF00", uso: "CTA principal, cifras clave", clase: "bg-lime" },
  { token: "brand", hex: "#7D53FF", uso: "Brillos, bordes destacados, gráficos", clase: "bg-brand" },
  { token: "brand-soft", hex: "#B9A4FF", uso: "Texto morado sobre oscuro", clase: "bg-brand-soft" },
  { token: "brand-ink", hex: "#3B1D99", uso: "Tintes de luces (no es texto)", clase: "bg-brand-ink" },
];

const textos = [
  { token: "white", hex: "#FFFFFF", ratio: "20:1", uso: "Títulos y texto principal", clase: "text-white" },
  { token: "fog", hex: "#B4AECB", ratio: "≈9.8:1", uso: "Párrafos", clase: "text-fog" },
  { token: "fog-dim", hex: "#8A84A8", ratio: "≈5.9:1", uso: "Etiquetas y notas", clase: "text-fog-dim" },
];

function Bloque({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t border-white/6 py-14">
      <h2 id={id} className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-brand-soft">
        {titulo}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function SistemaV2() {
  return (
    <>
      <header className="border-b border-white/6">
        <Container className="flex h-16 items-center justify-between">
          <Link href="/v2" aria-label="Ver la muestra del Inicio v2">
            <Logo surface="dark" className="h-6 w-auto" />
          </Link>
          <Button href="/v2" variant="secondary">
            Ver muestra del Inicio
          </Button>
        </Container>
      </header>

      <main className="relative overflow-hidden">
        <Glow className="left-1/2 top-[-20rem] h-[40rem] w-[60rem] -translate-x-1/2" />
        <Container className="relative pb-24 pt-16">
          <h1 className="font-display text-v2-hero font-extrabold tracking-display text-white">Sistema de diseño v2</h1>
          <p className="mt-5 max-w-2xl text-v2-lead text-fog">
            Tokens y componentes del sitio de agencia. Solo fondo oscuro, morado y lima como acentos, referencia visual
            21st.dev. Especificación completa en <code className="text-white">docs/blueprint/04-sistema-de-diseno.md</code>.
          </p>

          <Bloque id="b-color" titulo="Color · superficies y acentos">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {colores.map((c) => (
                <div key={c.token} className="v2-card p-2">
                  <div className={`h-20 rounded-frame ${c.clase}`} />
                  <div className="px-2 pb-2 pt-3">
                    <p className="text-sm font-semibold text-white">{c.token}</p>
                    <p className="font-mono text-xs text-fog-dim">{c.hex}</p>
                    <p className="mt-1 text-xs text-fog">{c.uso}</p>
                  </div>
                </div>
              ))}
            </div>
          </Bloque>

          <Bloque id="b-texto" titulo="Color · texto (contraste sobre ink)">
            <div className="grid gap-3 sm:grid-cols-3">
              {textos.map((t) => (
                <div key={t.token} className="v2-card p-5">
                  <p className={`font-display text-2xl font-bold ${t.clase}`}>Aa · {t.ratio}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{t.token}</p>
                  <p className="font-mono text-xs text-fog-dim">{t.hex}</p>
                  <p className="mt-1 text-xs text-fog">{t.uso}</p>
                </div>
              ))}
            </div>
          </Bloque>

          <Bloque id="b-tipo" titulo="Tipografía · escala mobile-first">
            <div className="space-y-6">
              <div>
                <p className="font-mono text-xs text-fog-dim">v2-hero · Funnel Display 800 · −0.04em</p>
                <p className="mt-2 font-display text-v2-hero font-extrabold tracking-display text-white">Lista en 5 días.</p>
              </div>
              <div>
                <p className="font-mono text-xs text-fog-dim">v2-h2 · Funnel Display 700 · −0.03em</p>
                <p className="mt-2 font-display text-v2-h2 font-bold tracking-heading text-white">Precios claros, sin sorpresas</p>
              </div>
              <div>
                <p className="font-mono text-xs text-fog-dim">v2-h3 · Funnel Display 700</p>
                <p className="mt-2 font-display text-v2-h3 font-bold tracking-heading text-white">Tienda por WhatsApp en 5 Días</p>
              </div>
              <div>
                <p className="font-mono text-xs text-fog-dim">v2-lead · Plus Jakarta Sans · fog</p>
                <p className="mt-2 max-w-2xl text-v2-lead text-fog">
                  Diseñamos páginas, catálogos y sistemas para negocios que quieren clientes por internet.
                </p>
              </div>
              <div>
                <p className="font-mono text-xs text-fog-dim">Eyebrow · 12 px · mayúsculas · +0.16em · brand-soft</p>
                <Eyebrow className="mt-2">Etiqueta de sección</Eyebrow>
              </div>
            </div>
          </Bloque>

          <Bloque id="b-botones" titulo="Botones · radio 10 px · alto mín. 44 px">
            <div className="flex flex-wrap items-center gap-3">
              <Button href="#" size="lg" arrow>
                Primario (lima)
              </Button>
              <Button href="#">Primario md</Button>
              <Button href="#" variant="secondary" size="lg">
                Secundario
              </Button>
              <Button href="#" variant="ghost" arrow>
                Terciario
              </Button>
            </div>
            <p className="mt-4 text-sm text-fog">Regla: un solo botón lima por vista (el CTA principal).</p>
          </Bloque>

          <Bloque id="b-badges" titulo="Badges">
            <div className="flex flex-wrap gap-3">
              <Badge live>Tomamos 3 proyectos nuevos al mes</Badge>
              <Badge>Catálogo · Sistema</Badge>
              <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">Recomendado</span>
            </div>
          </Bloque>

          <Bloque id="b-tarjetas" titulo="Tarjetas · base (24 px) y bento con vista previa enmarcada (16 px)">
            <div className="grid gap-4 md:grid-cols-3">
              <Spotlight className="p-6">
                <p className="text-xs font-semibold text-brand-soft">Tarjeta base</p>
                <p className="mt-2 font-display text-v2-h3 font-bold tracking-heading text-white">Pasa el mouse</p>
                <p className="mt-2 text-sm text-fog">Superficie, borde de 1 px y luz morada que sigue el cursor.</p>
              </Spotlight>
              {(["Página", "Catálogo"] as const).map((t) => (
                <Spotlight key={t} as="article" className="p-2">
                  <div className="v2-frame aspect-[16/10]">
                    <ProjectPreview proyecto={{ nombre: t, tipos: [t], acento: t === "Página" ? "#B6FF00" : "#7D53FF" }} />
                  </div>
                  <div className="px-3 pb-3 pt-4">
                    <p className="font-semibold text-white">Bento · {t}</p>
                    <p className="text-sm text-fog">Marco de 8 px, vista previa con radio 16 px.</p>
                  </div>
                </Spotlight>
              ))}
            </div>
          </Bloque>

          <Bloque id="b-previews" titulo="Vista previa provisional por tipo (se reemplaza por video en loop)">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <div className="grid gap-4 sm:grid-cols-3">
                {(["Página", "Catálogo", "Sistema"] as const).map((t) => (
                  <div key={t} className="v2-card p-2">
                    <div className="v2-frame aspect-[16/10]">
                      <ProjectPreview proyecto={{ nombre: t, tipos: [t], acento: "#9B7BFF" }} />
                    </div>
                    <p className="px-2 pb-1 pt-3 text-sm text-white">{t}</p>
                  </div>
                ))}
              </div>
              <div className="mx-auto w-40 rounded-[26px] border border-white/10 bg-surface-1 p-2">
                <div className="aspect-[9/19] overflow-hidden rounded-[20px] border border-white/6">
                  <ProjectPreview device="phone" proyecto={{ nombre: "Celular", tipos: ["Catálogo"], acento: "#B6FF00" }} />
                </div>
              </div>
            </div>
          </Bloque>

          <Bloque id="b-precio" titulo="Precio · tarjeta recomendada y normal">
            <div className="grid gap-5 lg:grid-cols-2">
              <PricingCard paquete={precios.paquetes[1]} />
              <PricingCard paquete={precios.paquetes[0]} />
            </div>
            <GuaranteeSeal className="mt-5">{precios.garantia}</GuaranteeSeal>
          </Bloque>

          <Bloque id="b-metrica" titulo="Métrica · anillo dashboard-premium (contador + punta con dot)">
            <div className="flex flex-wrap gap-8">
              <Ring value={93} centerValue={93} label="Celular" />
              <Ring value={100} centerValue={100} label="Escritorio" />
              <Ring value={72} centerValue={72} arcColor="#7D53FF" label="Acento morado" />
            </div>
          </Bloque>

          <Bloque id="b-encabezado" titulo="Encabezado de sección · título + acción a la derecha">
            <SectionHeader
              title="Trabajos reales, negocios reales"
              subtitle="Subtítulo opcional en fog."
              action={
                <Button href="#" variant="secondary">
                  Ver todo
                </Button>
              }
            />
          </Bloque>

          <Bloque id="b-movimiento" titulo="Movimiento">
            <ul className="grid gap-3 text-sm text-fog sm:grid-cols-2">
              <li className="v2-card p-4">Solo se anima transform y opacity (GPU).</li>
              <li className="v2-card p-4">Siempre se respeta prefers-reduced-motion.</li>
              <li className="v2-card p-4">El h1 del hero no se anima: aparece en el primer pintado (mejor LCP).</li>
              <li className="v2-card p-4">Luces de fondo: gradiente radial sin filter:blur.</li>
            </ul>
          </Bloque>
        </Container>
      </main>
    </>
  );
}
