import Link from "next/link";
import type { Metadata } from "next";
import Logo from "@/components/Logo";
import { site } from "@/lib/site";
import { WhatsAppIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Página no encontrada — Arata San",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-5 text-center text-paper">
      <Logo surface="dark" className="mb-10 h-7 w-auto" />

      <p className="font-display text-7xl font-extrabold text-lime sm:text-8xl">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
        Esta página se perdió.
      </h1>
      <p className="mt-3 max-w-md text-white/70">
        El enlace no existe o cambió de lugar. Volvamos a lo importante: que tu negocio
        venda por internet.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-lime px-6 py-3.5 text-[15px] font-bold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand hover:text-white"
        >
          Volver al inicio
        </Link>
        <a
          href={site.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3.5 text-[15px] font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-lime hover:text-lime"
        >
          <WhatsAppIcon className="h-[18px] w-[18px]" />
          Escríbenos
        </a>
      </div>
    </main>
  );
}
