import Link from "next/link";
import Logo from "@/components/panel/LogoPanel";
import EscenaAcceso from "@/components/panel/acceso/EscenaAcceso";

// Pantallas de acceso (D-136): tarjeta dividida. A la izquierda la escena de luz de Arata con el logo;
// a la derecha el formulario. En celular la escena queda arriba, más baja. Sin menú del panel.
// D-149: el acceso va siempre en oscuro (data-tema="oscuro"), aunque la persona use el panel en claro.
export default function AccesoLayout({ children }: { children: React.ReactNode }) {
  return (
    <main data-tema="oscuro" className="flex min-h-screen items-center justify-center bg-noche p-3 text-white sm:p-6">
      <div className="grid w-full max-w-[1040px] overflow-hidden rounded-[28px] border border-white/[0.08] bg-canvas shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] lg:min-h-[640px] lg:grid-cols-2">
        <div className="relative min-h-[176px] lg:min-h-0">
          <EscenaAcceso />
          <Link href="/" aria-label="Arata San, ir al sitio" className="absolute left-6 top-6 z-10 lg:left-9 lg:top-9">
            <Logo className="h-[17px] w-auto" />
          </Link>
          <p className="absolute inset-x-9 bottom-9 z-10 hidden max-w-[17rem] text-sm leading-relaxed text-fog lg:block">
            Ventas, clientes y proyectos de tu negocio en un solo lugar.
          </p>
        </div>

        <section className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-14">
          <div className="mx-auto w-full max-w-[360px]">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-fog">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand" />
              Panel privado
            </p>
            {children}
            <p className="mt-8 text-xs text-fog-dim">Panel privado de Arata San.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
