import type { Proyecto, TipoProyecto } from "@/content/proyectos";
import LoopVideo from "./LoopVideo";
import { cn } from "@/lib/utils";

// Vista previa de un proyecto dentro de un marco.
// - Si el proyecto tiene video → LoopVideo (D-026).
// - Si no (provisional) → mockup dibujado con CSS según el tipo, en el color del proyecto.
//   Es decorativo: no imita la página real del cliente.

export default function ProjectPreview({
  proyecto,
  className,
  device = "desktop",
}: {
  proyecto: Pick<Proyecto, "nombre" | "tipos" | "acento" | "video">;
  className?: string;
  device?: "desktop" | "phone";
}) {
  if (proyecto.video) {
    return (
      <LoopVideo
        video={proyecto.video}
        label={`Video del proyecto ${proyecto.nombre}`}
        className={cn("h-full w-full object-cover object-top", className)}
      />
    );
  }
  const tipo: TipoProyecto = proyecto.tipos.includes("Sistema")
    ? "Sistema"
    : proyecto.tipos.includes("Catálogo")
      ? "Catálogo"
      : "Página";

  return (
    <div
      role="img"
      aria-label={`Vista previa ilustrativa de ${proyecto.nombre}`}
      className={cn("relative h-full w-full overflow-hidden bg-[#0D0919]", className)}
      style={{ ["--acc" as string]: proyecto.acento }}
    >
      {device === "desktop" ? <BrowserBar /> : <PhoneBar />}
      <div className={cn("absolute inset-x-0 bottom-0", device === "desktop" ? "top-7" : "top-6")}>
        {tipo === "Página" && <MockPagina device={device} />}
        {tipo === "Catálogo" && <MockCatalogo device={device} />}
        {tipo === "Sistema" && <MockSistema device={device} />}
      </div>
    </div>
  );
}

function BrowserBar() {
  return (
    <div className="absolute inset-x-0 top-0 flex h-7 items-center gap-1.5 border-b border-white/6 bg-[#120D22] px-3">
      <span className="h-2 w-2 rounded-full bg-white/16" />
      <span className="h-2 w-2 rounded-full bg-white/16" />
      <span className="h-2 w-2 rounded-full bg-white/16" />
      <span className="ml-3 h-3 w-1/3 rounded-full bg-white/6" />
    </div>
  );
}

function PhoneBar() {
  return (
    <div className="absolute inset-x-0 top-0 flex h-6 items-center justify-center">
      <span className="h-1.5 w-12 rounded-full bg-white/16" />
    </div>
  );
}

// ── Mockups (solo formas; usan --acc para el color del proyecto) ──────────

function MockPagina({ device }: { device: "desktop" | "phone" }) {
  const phone = device === "phone";
  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <span className="h-2.5 w-12 rounded-full bg-white/30" />
        {!phone && (
          <span className="flex gap-2">
            <span className="h-2 w-8 rounded-full bg-white/10" />
            <span className="h-2 w-8 rounded-full bg-white/10" />
            <span className="h-2 w-8 rounded-full bg-white/10" />
          </span>
        )}
        <span className="h-4 w-12 rounded-md" style={{ background: "var(--acc)" }} />
      </div>
      <div className={cn("mt-2 space-y-2", phone ? "" : "w-3/5")}>
        <span className="block h-4 w-11/12 rounded bg-white/80" />
        <span className="block h-4 w-3/4 rounded bg-white/80" />
        <span className="block h-2 w-full rounded bg-white/14" />
        <span className="block h-2 w-5/6 rounded bg-white/14" />
      </div>
      <span className="mt-1 h-6 w-24 rounded-md" style={{ background: "var(--acc)" }} />
      <div className={cn("mt-auto grid gap-2", phone ? "grid-cols-1" : "grid-cols-3")}>
        {[0, 1, 2].slice(0, phone ? 2 : 3).map((i) => (
          <span key={i} className="h-14 rounded-lg border border-white/6 bg-white/[0.04]" />
        ))}
      </div>
    </div>
  );
}

function MockCatalogo({ device }: { device: "desktop" | "phone" }) {
  const phone = device === "phone";
  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <span className="h-2.5 w-14 rounded-full bg-white/30" />
        <span className="flex h-5 items-center gap-1 rounded-md px-2" style={{ background: "var(--acc)" }}>
          <span className="h-1.5 w-1.5 rounded-full bg-ink/70" />
          <span className="h-1.5 w-5 rounded-full bg-ink/50" />
        </span>
      </div>
      <div className="flex gap-1.5">
        {["w-10", "w-8", "w-12", "w-9"].slice(0, phone ? 3 : 4).map((w, i) => (
          <span
            key={i}
            className={cn("h-4 rounded-full", w, i === 0 ? "" : "bg-white/10")}
            style={i === 0 ? { background: "var(--acc)", opacity: 0.85 } : undefined}
          />
        ))}
      </div>
      <div className={cn("grid flex-1 gap-2", phone ? "grid-cols-2" : "grid-cols-4")}>
        {Array.from({ length: phone ? 4 : 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5 rounded-lg border border-white/6 bg-white/[0.035] p-1.5">
            <span className="flex-1 rounded-md bg-white/[0.07]" />
            <span className="h-1.5 w-3/4 rounded-full bg-white/30" />
            <span className="h-1.5 w-1/3 rounded-full" style={{ background: "var(--acc)", opacity: 0.8 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function MockSistema({ device }: { device: "desktop" | "phone" }) {
  const phone = device === "phone";
  const bars = [38, 62, 48, 80, 56, 92, 70];
  return (
    <div className="flex h-full">
      {!phone && (
        <div className="flex w-1/5 flex-col gap-2 border-r border-white/6 p-3">
          <span className="h-2.5 w-3/4 rounded-full bg-white/30" />
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={cn("h-2 rounded-full", i === 1 ? "w-4/5" : "w-3/5 bg-white/10")}
              style={i === 1 ? { background: "var(--acc)", opacity: 0.85 } : undefined}
            />
          ))}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-lg border border-white/6 bg-white/[0.04] p-2">
              <span className="block h-1.5 w-1/2 rounded-full bg-white/14" />
              <span className="mt-1.5 block h-3 w-3/4 rounded bg-white/60" />
            </div>
          ))}
        </div>
        <div className="flex flex-1 items-end gap-1.5 rounded-lg border border-white/6 bg-white/[0.03] p-3">
          {bars.slice(0, phone ? 5 : 7).map((h, i) => (
            <span
              key={i}
              className="flex-1 rounded-t-md"
              style={{
                height: `${h}%`,
                background: i === (phone ? 4 : 5) ? "var(--acc)" : "rgba(255,255,255,0.14)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
