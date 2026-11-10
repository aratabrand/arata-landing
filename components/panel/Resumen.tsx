"use client";

import { useMemo, useState } from "react";
import { Camera, Eye, MousePointerClick, ShoppingBag, Users } from "lucide-react";
import type { DatosPanel } from "@/lib/panel/datos";
import type { Periodo } from "@/content/panel/tipos";
import {
  agrupar,
  cambio,
  cortar,
  fechaCorta,
  numero,
  numeroCorto,
  pesos,
  pesosCorto,
  porcentaje,
  sumar,
  tasaCompra,
} from "@/lib/panel/formato";
import { Anillo, BarrasHorizontales, BarrasVerticales, Embudo, GraficoArea, Sparkline } from "./graficos";
import { Delta, PanelHeader, PanelPage, Pill, Tarjeta } from "./ui";
import { cn } from "@/lib/utils";

// Módulo 1 · Resumen (docs/panel-cliente/01-arquitectura.md §2.1)
// Ventas, visitas del sitio, Instagram y clientes que compran, con selector de periodo.

const periodos: { valor: Periodo; label: string }[] = [
  { valor: 7, label: "7 días" },
  { valor: 30, label: "30 días" },
  { valor: 90, label: "90 días" },
];

type Metrica = "ventas" | "pedidos" | "visitas";
const metricas: { valor: Metrica; label: string }[] = [
  { valor: "ventas", label: "Ventas" },
  { valor: "pedidos", label: "Pedidos" },
  { valor: "visitas", label: "Visitas" },
];

export function Segmentado<T extends string | number>({
  opciones,
  valor,
  onChange,
  etiqueta,
}: {
  opciones: { valor: T; label: string }[];
  valor: T;
  onChange: (v: T) => void;
  etiqueta: string;
}) {
  return (
    <div role="radiogroup" aria-label={etiqueta} className="inline-flex rounded-btn border border-white/8 bg-surface-1 p-1">
      {opciones.map((o) => (
        <button
          key={String(o.valor)}
          type="button"
          role="radio"
          aria-checked={valor === o.valor}
          onClick={() => onChange(o.valor)}
          className={cn(
            "h-9 rounded-[7px] px-3 text-xs font-semibold transition-colors sm:px-4 sm:text-sm",
            valor === o.valor ? "bg-surface-3 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]" : "text-fog-dim hover:text-white"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function Resumen({ datos }: { datos: DatosPanel }) {
  const [periodo, setPeriodo] = useState<Periodo>(30);
  const [metrica, setMetrica] = useState<Metrica>("ventas");
  const { negocio, dias } = datos;

  const c = useMemo(() => {
    const { actual, anterior } = cortar(dias, periodo);
    const t = sumar(actual);
    const ta = sumar(anterior);
    return { actual, t, ta };
  }, [dias, periodo]);

  const serie = useMemo(() => {
    const tam = periodo === 90 ? 7 : 1;
    return agrupar(c.actual, tam).map((b) => ({ etiqueta: fechaCorta(b.fecha), valor: b.t[metrica] }));
  }, [c.actual, periodo, metrica]);

  const igSemanas = useMemo(
    () => agrupar(dias.slice(-84), 7).map((b) => ({ etiqueta: fechaCorta(b.fecha), valor: b.t.igVisualizaciones })),
    [dias]
  );

  const tasa = tasaCompra(c.t);
  const tasaAnt = tasaCompra(c.ta);
  const ticket = c.t.pedidos ? c.t.ventas / c.t.pedidos : 0;

  const kpis = [
    {
      label: "Ventas",
      valor: pesos(c.t.ventas),
      delta: cambio(c.t.ventas, c.ta.ventas),
      icon: ShoppingBag,
      spark: c.actual.map((d) => d.ventas),
      nota: `${numero(c.t.pedidos)} pedidos`,
    },
    {
      label: "Visitas al sitio",
      valor: numero(c.t.visitas),
      delta: cambio(c.t.visitas, c.ta.visitas),
      icon: Eye,
      spark: c.actual.map((d) => d.visitas),
      nota: `${numero(c.t.clicsWhatsapp)} clics a WhatsApp`,
    },
    {
      label: "Visualizaciones en Instagram",
      valor: numeroCorto(c.t.igVisualizaciones),
      delta: cambio(c.t.igVisualizaciones, c.ta.igVisualizaciones),
      icon: Camera,
      spark: c.actual.map((d) => d.igVisualizaciones),
      nota: `+${numero(c.t.igSeguidoresNuevos)} seguidores`,
    },
    {
      label: "Clientes que compran",
      valor: porcentaje(tasa),
      delta: cambio(tasa, tasaAnt),
      icon: Users,
      spark: c.actual.map((d) => (d.visitas ? d.pedidos / d.visitas : 0)),
      nota: "de cada 100 visitas",
    },
  ];

  const totalFuentes = datos.fuentes.reduce((a, f) => a + f.visitas, 0);

  return (
    <PanelPage>
      <PanelHeader
        titulo={<>Hola, {negocio.contacto}</>}
        bajada={<>Así le fue a {negocio.nombre} en los últimos {periodo} días, comparado con los {periodo} días anteriores.</>}
        accion={<Segmentado etiqueta="Periodo" opciones={periodos} valor={periodo} onChange={setPeriodo} />}
      />

      {/* Cifras principales */}
      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <article key={k.label} className={cn("v2-card flex flex-col p-4 sm:p-5", i === 0 && "v2-glass")}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-fog sm:text-sm">{k.label}</p>
              <k.icon aria-hidden className={cn("h-4 w-4", i === 0 ? "text-lime" : "text-brand-soft")} />
            </div>
            <p className="mt-3 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-bold leading-none tracking-heading text-white">{k.valor}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Delta valor={k.delta} />
              <span className="text-xs text-fog-dim">{k.nota}</span>
            </div>
            <Sparkline valores={k.spark} className="mt-4" color={i === 0 ? "#B6FF00" : "#7D53FF"} />
          </article>
        ))}
      </div>

      {/* Gráfico principal + embudo */}
      <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <Tarjeta
          titulo="Cómo van las ventas"
          bajada={periodo === 90 ? "Por semana" : "Por día"}
          accion={<Segmentado etiqueta="Qué ver" opciones={metricas} valor={metrica} onChange={setMetrica} />}
        >
          <GraficoArea
            key={`${periodo}-${metrica}`}
            puntos={serie}
            formato={metrica === "ventas" ? pesos : numero}
            formatoEje={metrica === "ventas" ? pesosCorto : (n) => numeroCorto(Math.round(n))}
            etiqueta={`${metricas.find((m) => m.valor === metrica)?.label} de los últimos ${periodo} días`}
          />
          <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-white/6 pt-4">
            {[
              { k: "Ticket promedio", v: pesos(ticket) },
              { k: "Pedidos", v: numero(c.t.pedidos) },
              { k: "Mejor día", v: pesosCorto(Math.max(...c.actual.map((d) => d.ventas))) },
            ].map((s) => (
              <div key={s.k} className="min-w-0">
                <dt className="truncate text-[0.7rem] text-fog-dim sm:text-xs">{s.k}</dt>
                <dd className="mt-0.5 truncate font-display text-sm font-bold text-white sm:text-base">{s.v}</dd>
              </div>
            ))}
          </dl>
        </Tarjeta>

        <Tarjeta titulo="Clientes que compran" bajada="De la visita al pedido">
          <div className="flex items-center gap-5">
            <Anillo key={periodo} valor={tasa} max={10} centro={porcentaje(tasa)} bajada="compran" />
            <p className="text-sm text-fog">
              De cada <strong className="text-white">100 personas</strong> que entran a tu página,{" "}
              <strong className="text-lime">{tasa.toFixed(1).replace(".", ",")}</strong> terminan haciendo un pedido.
            </p>
          </div>
          <div className="mt-6">
            <Embudo
              key={periodo}
              pasos={[
                { nombre: "Visitas", valor: c.t.visitas, formato: numero(c.t.visitas) },
                { nombre: "Clics a WhatsApp", valor: c.t.clicsWhatsapp, formato: numero(c.t.clicsWhatsapp) },
                { nombre: "Pedidos", valor: c.t.pedidos, formato: numero(c.t.pedidos) },
              ]}
            />
          </div>
        </Tarjeta>
      </div>

      {/* Instagram + fuentes + productos */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Tarjeta titulo="Instagram" bajada={`${negocio.instagram} · últimas 12 semanas`}>
          <BarrasVerticales puntos={igSemanas} formato={numeroCorto} />
          <dl className="mt-5 grid grid-cols-2 gap-3">
            {[
              { k: "Visualizaciones", v: numeroCorto(c.t.igVisualizaciones), d: cambio(c.t.igVisualizaciones, c.ta.igVisualizaciones) },
              { k: "Cuentas alcanzadas", v: numeroCorto(c.t.igAlcance), d: cambio(c.t.igAlcance, c.ta.igAlcance) },
              { k: "Interacciones", v: numeroCorto(c.t.igInteracciones), d: cambio(c.t.igInteracciones, c.ta.igInteracciones) },
              { k: "Seguidores nuevos", v: `+${numero(c.t.igSeguidoresNuevos)}`, d: cambio(c.t.igSeguidoresNuevos, c.ta.igSeguidoresNuevos) },
            ].map((s) => (
              <div key={s.k} className="rounded-frame border border-white/6 bg-surface-2/60 p-3">
                <dt className="text-[0.7rem] text-fog-dim">{s.k}</dt>
                <dd className="mt-1 font-display text-lg font-bold leading-none text-white">{s.v}</dd>
                <dd className="mt-2">
                  <Delta valor={s.d} />
                </dd>
              </div>
            ))}
          </dl>
        </Tarjeta>

        <Tarjeta titulo="De dónde llegan" bajada="Visitas al sitio por fuente · 30 días">
          <BarrasHorizontales
            items={datos.fuentes.map((f) => ({
              nombre: f.fuente,
              valor: f.visitas,
              detalle: porcentaje((f.visitas / totalFuentes) * 100, 0),
            }))}
            formato={numero}
          />
        </Tarjeta>

        <Tarjeta titulo="Lo que más se vende" bajada="Productos · 30 días" className="lg:col-span-2 xl:col-span-1">
          <BarrasHorizontales
            items={datos.productosTop.map((p) => ({ nombre: p.nombre, valor: p.ventas, detalle: `${p.unidades} und.` }))}
            formato={pesosCorto}
          />
        </Tarjeta>
      </div>

      {/* Últimas ventas */}
      <Tarjeta titulo="Últimas ventas" accion={<Pill tono="lima">En vivo</Pill>}>
        <ul className="divide-y divide-white/6">
          {datos.ventasRecientes.map((v) => (
            <li key={v.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 font-display text-sm font-bold text-brand-soft">
                {v.cliente.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{v.cliente}</p>
                <p className="truncate text-xs text-fog-dim">
                  {v.producto} · {fechaCorta(v.fecha)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-sm font-bold text-white">{pesos(v.valor)}</p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-[0.7rem] text-fog-dim">
                  <MousePointerClick aria-hidden className="h-3 w-3" />
                  {v.canal}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Tarjeta>

      <p className="pb-2 text-center text-xs text-fog-dim">
        Datos actualizados al {fechaCorta(datos.hoy)}. Ventas: pedidos registrados · Visitas: Google Analytics · Instagram: Meta.
      </p>
    </PanelPage>
  );
}
