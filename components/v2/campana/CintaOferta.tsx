import { ArrowRight } from "../iconos";
import { OFERTA, diasOferta, textoDias } from "@/content/campanas/catalogos";

// Cinta de la oferta (D-192): franja lima encima del menú que queda fija al bajar.
// Toda la cinta lleva a agendar. Sin JavaScript: los días que quedan se calculan
// al armar la página (se vuelve a armar cada hora). Alto fijo de 40 px: MarcoCampana baja el contenido lo mismo (pt-10).
export default function CintaOferta({ enlace }: { enlace: string }) {
  return (
    <a
      href={enlace}
      className="group block h-10 bg-lime text-ink transition-[filter] hover:brightness-95"
      aria-label={`${OFERTA.nombre}: tu tienda a ${OFERTA.precio}, antes ${OFERTA.antes}. Hasta el ${OFERTA.hastaTexto}. Agendar reunión`}
    >
      <span className="mx-auto flex h-full w-full max-w-v2 items-center justify-center gap-x-1.5 whitespace-nowrap px-3 text-xs leading-none min-[400px]:gap-x-2 min-[400px]:text-[13px] sm:gap-x-3 sm:px-6 sm:text-sm lg:px-8">
        <span className="font-semibold">
          <span className="sm:hidden">Noviembre:</span>
          <span className="hidden sm:inline">{OFERTA.nombre}: tu tienda a</span>
        </span>
        <span className="font-display text-sm font-extrabold min-[400px]:text-[15px] sm:text-base">{OFERTA.precio}</span>
        <s className="text-ink/60">{OFERTA.antes}</s>
        <span aria-hidden className="hidden text-ink/40 min-[400px]:inline">·</span>
        <span className="font-semibold">{textoDias(diasOferta())}</span>
        <span className="hidden items-center gap-1 font-semibold underline decoration-ink/30 underline-offset-4 md:inline-flex">
          Separa tu cupo
          <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </span>
    </a>
  );
}
