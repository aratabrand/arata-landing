import type { IconProps } from "@phosphor-icons/react";
import {
  Alarm,
  ArrowCounterClockwise,
  ArrowLeft as PArrowLeft,
  ArrowRight as PArrowRight,
  ArrowSquareOut,
  ArrowUpRight as PArrowUpRight,
  Bank,
  Bell as PBell,
  BellRinging,
  BellSlash,
  Calendar as PCalendar,
  CalendarDots,
  Camera as PCamera,
  CaretLeft,
  CaretRight,
  CaretUpDown,
  ChatCircle,
  Check as PCheck,
  CheckCircle,
  Clock as PClock,
  ClockCounterClockwise,
  CursorClick,
  DeviceMobile,
  EnvelopeSimple,
  Eye as PEye,
  GearSix,
  Globe as PGlobe,
  HandCoins as PHandCoins,
  Info as PInfo,
  Kanban,
  SidebarSimple,
  ListChecks as PListChecks,
  Circle as PCircle,
  CircleHalf,
  DotsSixVertical,
  Table as PTable,
  CalendarBlank,
  CaretDown,
  Lock as PLock,
  MagnifyingGlass,
  MapPin as PMapPin,
  Megaphone as PMegaphone,
  Monitor as PMonitor,
  Moon as PMoon,
  NotePencil,
  PaperPlaneTilt,
  PencilSimple,
  Phone as PPhone,
  PiggyBank as PPiggyBank,
  Plus as PPlus,
  Receipt as PReceipt,
  Scales,
  ShoppingBag as PShoppingBag,
  SignOut,
  SquaresFour,
  Sun as PSun,
  Target as PTarget,
  Trash,
  TrendDown,
  TrendUp,
  Users as PUsers,
  UsersThree,
  VideoCamera,
  Wallet as PWallet,
  Warning,
  WarningCircle,
  WhatsappLogo,
  X as PX,
} from "@phosphor-icons/react/dist/ssr";

// Íconos del panel (D-149): Phosphor en trazo "light", igual que el sitio (D-147). Lucide se veía
// "de IA". Solo íconos que cumplen una función (menú, acciones, estados); sin íconos decorativos en
// tarjetas. Se exportan con los nombres que usaba Lucide para no tocar cada componente.
// Copia aparte de components/v2/iconos.tsx a propósito: el panel no importa piezas del sitio (D-135).

type Icono = (props: IconProps) => React.ReactElement;

function fino(Base: React.ComponentType<IconProps>, peso: IconProps["weight"] = "light"): Icono {
  const Componente = (props: IconProps) => <Base weight={peso} {...props} />;
  return Componente;
}

export const AlarmClock = fino(Alarm);
export const ArrowLeft = fino(PArrowLeft);
export const ArrowRight = fino(PArrowRight);
export const ArrowUpRight = fino(PArrowUpRight);
export const Bell = fino(PBell);
export const BellOff = fino(BellSlash);
export const BellRing = fino(BellRinging);
export const Calendar = fino(PCalendar);
export const CalendarClock = fino(CalendarDots);
export const CalendarDays = fino(CalendarDots);
export const Camera = fino(PCamera);
export const Check = fino(PCheck, "regular");
export const ChevronLeft = fino(CaretLeft);
export const ChevronRight = fino(CaretRight);
export const ChevronsUpDown = fino(CaretUpDown);
export const CircleAlert = fino(WarningCircle);
export const CircleCheck = fino(CheckCircle);
export const Clock = fino(PClock);
export const ExternalLink = fino(ArrowSquareOut);
export const Eye = fino(PEye);
export const Globe = fino(PGlobe);
export const HandCoins = fino(PHandCoins);
export const History = fino(ClockCounterClockwise);
export const Info = fino(PInfo);
export const Landmark = fino(Bank);
export const LayoutDashboard = fino(SquaresFour);
export const Lock = fino(PLock);
export const LogOut = fino(SignOut);
export const Mail = fino(EnvelopeSimple);
export const MapPin = fino(PMapPin);
export const Megaphone = fino(PMegaphone);
export const MessageCircle = fino(WhatsappLogo);
export const ChatBubble = fino(ChatCircle);
export const Monitor = fino(PMonitor);
export const Moon = fino(PMoon);
export const MousePointerClick = fino(CursorClick);
export const NotebookPen = fino(NotePencil);
export const Pencil = fino(PencilSimple);
export const Phone = fino(PPhone);
export const PiggyBank = fino(PPiggyBank);
export const Plus = fino(PPlus);
export const Receipt = fino(PReceipt);
export const RotateCcw = fino(ArrowCounterClockwise);
export const Scale = fino(Scales);
export const Search = fino(MagnifyingGlass);
export const Send = fino(PaperPlaneTilt);
export const Settings = fino(GearSix);
export const ShoppingBag = fino(PShoppingBag);
export const Smartphone = fino(DeviceMobile);
export const SquareKanban = fino(Kanban);
export const MenuRecoger = fino(SidebarSimple);
export const ListChecks = fino(PListChecks);
export const Circle = fino(PCircle);
export const CircleMedio = fino(CircleHalf);
export const Arrastrar = fino(DotsSixVertical);
export const Tabla = fino(PTable);
export const CalendarioSemana = fino(CalendarBlank);
export const ChevronDown = fino(CaretDown);
export const Sun = fino(PSun);
export const Target = fino(PTarget);
export const Trash2 = fino(Trash);
export const TrendingDown = fino(TrendDown);
export const TrendingUp = fino(TrendUp);
export const TriangleAlert = fino(Warning);
export const Users = fino(PUsers);
export const UsersRound = fino(UsersThree);
export const Video = fino(VideoCamera);
export const Wallet = fino(PWallet);
export const X = fino(PX);
