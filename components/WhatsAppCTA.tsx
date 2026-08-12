import { site } from "@/lib/site";
import { WhatsAppIcon } from "./icons";

type Variant = "lime" | "white" | "outline";

const styles: Record<Variant, string> = {
  // Primario: lima. En hover pasa a morado (los demás colores viven en los hover).
  lime: "bg-lime text-ink hover:bg-brand hover:text-white shadow-[0_10px_30px_-12px_rgba(182,255,0,0.55)] hover:shadow-[0_14px_34px_-12px_rgba(125,83,255,0.7)]",
  // Secundario sobre fondo oscuro: blanco. En hover pasa a lima.
  white: "bg-white text-ink hover:bg-lime",
  // Terciario sobre oscuro: contorno.
  outline: "bg-transparent text-paper border border-white/30 hover:border-lime hover:text-lime",
};

export default function WhatsAppCTA({
  variant = "lime",
  className = "",
  label = "Agenda tu diagnóstico",
  full = false,
}: {
  variant?: Variant;
  className?: string;
  label?: string;
  full?: boolean;
}) {
  return (
    <a
      href={site.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center justify-center gap-2.5 rounded-full px-6 py-3.5 text-[15px] font-bold font-body transition-all duration-300 hover:-translate-y-0.5 ${styles[variant]} ${full ? "w-full" : ""} ${className}`}
    >
      <WhatsAppIcon className="h-[18px] w-[18px]" />
      <span>{label}</span>
    </a>
  );
}
