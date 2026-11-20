import type { IconProps } from "@phosphor-icons/react";
import {
  ArrowLeft as PArrowLeft,
  ArrowRight as PArrowRight,
  ArrowUpRight as PArrowUpRight,
  CaretDown,
  CaretRight,
  CaretUp,
  Check as PCheck,
  Pause as PPause,
  Play as PPlay,
  Plus as PPlus,
  SpeakerHigh,
  SpeakerSlash,
  WhatsappLogo,
  X as PX,
} from "@phosphor-icons/react/dist/ssr";

// Íconos del sitio (D-147): Phosphor en trazo "light" (más fino y editorial que Lucide, que
// Sergio veía "muy IA"). Solo íconos que cumplen una función (flechas, cerrar, abrir, check,
// video); los íconos decorativos de las tarjetas se quitaron. Los nombres se mantienen para no
// tocar cada componente. El panel sigue con lucide-react (no importa piezas del sitio, D-135).
// Versión SSR: sin contexto de React, sirve en componentes de servidor y de cliente.

type Icono = (props: IconProps) => React.ReactElement;
type Base = React.ComponentType<IconProps>;

function fino(Base: Base, peso: IconProps["weight"] = "light"): Icono {
  const Componente = (props: IconProps) => <Base weight={peso} aria-hidden {...props} />;
  return Componente;
}

export const ArrowLeft = fino(PArrowLeft);
export const ArrowRight = fino(PArrowRight);
export const ArrowUpRight = fino(PArrowUpRight);
export const ChevronDown = fino(CaretDown);
export const ChevronRight = fino(CaretRight);
export const ChevronUp = fino(CaretUp);
export const Check = fino(PCheck, "regular");
export const Plus = fino(PPlus);
export const X = fino(PX);
export const Play = fino(PPlay, "fill");
export const Pause = fino(PPause, "fill");
export const Volume2 = fino(SpeakerHigh);
export const VolumeX = fino(SpeakerSlash);
export const MessageCircle = fino(WhatsappLogo);
