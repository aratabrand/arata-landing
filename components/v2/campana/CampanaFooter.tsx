import Link from "next/link";
import Logo from "@/components/Logo";
import { Container } from "../primitives";
import { AbrirPreferenciasCookies } from "@/components/CookieBanner";
import { cookies } from "@/content/cookies";
import { footer } from "@/content/inicio";

// Footer corto de las landings de campaña (D-188): sin columnas de enlaces.
// Solo lo que pide la ley: política de datos y volver a elegir las cookies (D-130).
export default function CampanaFooter() {
  return (
    <footer className="border-t border-white/6 pb-28 pt-12 lg:pb-12">
      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Logo surface="dark" className="h-6 w-auto" />
          <p className="max-w-xs text-sm text-fog">{footer.frase}</p>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-white/6 pt-6 text-xs text-fog-dim sm:flex-row sm:justify-between">
          <p>{footer.cierre}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <Link href="/privacidad" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center underline decoration-white/20 underline-offset-4 transition-colors hover:text-white sm:min-h-0">
              Política de datos
            </Link>
            <AbrirPreferenciasCookies className="inline-flex min-h-10 items-center underline decoration-white/20 underline-offset-4 transition-colors hover:text-white sm:min-h-0">
              {cookies.footer}
            </AbrirPreferenciasCookies>
            <p>© 2026 Arata San</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
