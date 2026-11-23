import type { Metadata } from "next";
import Clientes from "@/components/panel/Clientes";
import ClientesAgencia from "@/components/panel/ClientesAgencia";
import { obtenerPanel } from "@/lib/panel/datos";
import { cargarClientesAgencia } from "@/lib/panel/clientes/datos";

export const metadata: Metadata = { title: "Clientes" };
// «Buscar más prospectos» (D-179): una página de Google Maps tarda hasta un minuto
export const maxDuration = 120;

// Arata San con sesión: clientes reales desde Neon (D-110). Si no, el ejemplo.
export default async function PanelClientesPage({ searchParams }: { searchParams: Promise<{ ver?: string }> }) {
  const real = await cargarClientesAgencia();
  // El aviso de "nuevo interesado" abre /panel/clientes?ver=interesados; los cambios de prospectos, ?ver=prospectos
  const ver = (await searchParams).ver;
  if (real) return <ClientesAgencia datos={real} vistaInicial={ver === "interesados" || ver === "prospectos" ? ver : "clientes"} />;
  const { clientes, hoy } = obtenerPanel();
  return <Clientes iniciales={clientes} hoy={hoy} />;
}
