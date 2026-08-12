import Logo from "./Logo";
import { site } from "@/lib/site";
import { WhatsAppIcon } from "./icons";

export default function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto max-w-content px-5 pt-14 pb-28 sm:px-8 md:pb-14">
        <div className="flex flex-col gap-8 border-b border-white/10 pb-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <Logo surface="dark" className="h-7 w-auto" />
            <p className="mt-5 text-sm leading-relaxed text-white/60">
              Le montamos a los negocios de Colombia la estructura digital para vender
              más por internet. Con IA y marketing que sí funcionan.
            </p>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <a
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-semibold text-lime hover:brightness-110"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Escríbenos por WhatsApp
            </a>
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 transition hover:text-white"
            >
              {site.instagramHandle}
            </a>
            <span className="text-white/50">{site.city}</span>
          </div>
        </div>

        <p className="pt-6 text-xs text-white/40">
          © {new Date().getFullYear()} Arata San. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
