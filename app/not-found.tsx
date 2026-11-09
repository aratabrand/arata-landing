import Link from "next/link";
import type { Metadata } from "next";
import Logo from "@/components/Logo";
import { Button } from "@/components/v2/Button";
import { Glow } from "@/components/v2/primitives";
import { GridBackground } from "@/components/ui/grid-background";

// 404 de marca, estilo v2 (02-arquitectura.md §3.9, copy 03-copy.md). Vale para todo el sitio.
export const metadata: Metadata = {
  title: "Página no encontrada · Arata San",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink px-4 text-center text-white [color-scheme:dark]">
      <style>{`html,body{background:#03010B}`}</style>
      <GridBackground orb="50% 45%" glow={0.16} />
      <Glow className="left-1/2 top-1/2 -z-10 h-[30rem] w-[50rem] -translate-x-1/2 -translate-y-1/2" />

      <Link href="/" aria-label="Arata San — inicio">
        <Logo surface="dark" className="mb-12 h-7 w-auto" />
      </Link>
      <p className="font-display text-[clamp(5rem,22vw,9rem)] font-extrabold leading-none tracking-display text-lime">404</p>
      <h1 className="mt-4 font-display text-[clamp(1.75rem,5vw,2.5rem)] font-bold tracking-heading">Esta página no existe.</h1>
      <p className="mt-3 max-w-md text-fog">Puede que el enlace esté mal escrito o que la página ya no esté.</p>

      <div className="mt-9 flex w-full max-w-md flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
        <Button href="/" size="lg" arrow>
          Ir al inicio
        </Button>
        <Button href="/portafolio" size="lg" variant="secondary">
          Ver portafolio
        </Button>
        <Button href="/agendar" size="lg" variant="ghost" arrow className="justify-center">
          Agendar reunión
        </Button>
      </div>
    </main>
  );
}
