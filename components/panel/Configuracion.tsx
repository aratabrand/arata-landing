import Link from "next/link";
import { ArrowUpRight, BellRing, Globe, UsersRound } from "lucide-react";
import { PanelHeader, PanelPage } from "./ui";

// Configuración (D-120): reúne en tarjetas lo que antes eran opciones sueltas del menú.
// Equipo y Notificaciones existen solo para la agencia (D-109, D-119).

export default function Configuracion({ agencia }: { agencia: boolean }) {
  const tarjetas = [
    { href: "/panel/sitio", icon: Globe, titulo: "Ajustes del sitio", texto: "Cómo sale tu página en Google, el título y el texto de la portada y los botones. Guardas y publicas.", ver: true },
    { href: "/panel/equipo", icon: UsersRound, titulo: "Equipo", texto: "Quién hace parte del equipo, si es socio y cuánto ha ganado cada uno por proyecto.", ver: agencia },
    { href: "/panel/notificaciones", icon: BellRing, titulo: "Notificaciones", texto: "Activa los avisos en este celular o computador y revisa el historial completo de cambios.", ver: agencia },
  ].filter((t) => t.ver);

  return (
    <PanelPage>
      <PanelHeader titulo="Configuración" bajada="Ajustes del panel y de tu página." />
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tarjetas.map(({ href, icon: Icon, titulo, texto }) => (
          <li key={href}>
            <Link
              href={href}
              className="group flex h-full flex-col rounded-card border border-white/[0.08] bg-white/[0.03] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl transition-colors hover:border-white/[0.16] hover:bg-white/[0.05] sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]">
                  <Icon aria-hidden className="h-5 w-5 text-lime" />
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-fog transition-colors group-hover:border-white/25 group-hover:text-white">
                  <ArrowUpRight aria-hidden className="h-4 w-4" />
                </span>
              </div>
              <h2 className="mt-6 font-display text-lg font-bold tracking-heading text-white">{titulo}</h2>
              <p className="mt-1.5 text-sm text-fog">{texto}</p>
            </Link>
          </li>
        ))}
      </ul>
    </PanelPage>
  );
}
