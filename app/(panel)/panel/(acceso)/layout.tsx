import Link from "next/link";
import Logo from "@/components/panel/LogoPanel";

// Pantallas de acceso: centradas, sin menú del panel.
export default function AccesoLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div aria-hidden className="v2-glow left-1/2 top-[-12%] h-[420px] w-[640px] -translate-x-1/2" />
      <Link href="/" aria-label="Arata San, ir al sitio" className="mb-8">
        <Logo className="h-5 w-auto" />
      </Link>
      <div className="v2-glass w-full max-w-[400px] p-6 sm:p-8">{children}</div>
      <p className="mt-6 text-center text-xs text-fog-dim">Panel privado de Arata San.</p>
    </main>
  );
}
