import { site } from "@/lib/site";
import { WhatsAppIcon } from "./icons";

// Barra fija solo en móvil: el CTA siempre al alcance del pulgar.
export default function StickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-ink/30 p-3 backdrop-blur-xl backdrop-saturate-150 md:hidden">
      <a
        href={site.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2.5 rounded-full bg-lime py-3.5 text-[15px] font-bold text-ink"
      >
        <WhatsAppIcon className="h-[18px] w-[18px]" />
        Agenda tu diagnóstico gratis
      </a>
    </div>
  );
}
