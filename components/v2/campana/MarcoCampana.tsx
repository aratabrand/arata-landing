import type { ReactNode } from "react";
import CampanaHeader from "./CampanaHeader";
import CampanaFooter from "./CampanaFooter";
import StickyBookBar from "../StickyBookBar";
import type { Boton } from "@/lib/sitio-textos";

// Marco de una landing de campaña (D-188): menú corto, contenido, footer corto y barra fija
// en celular. Cada landing lo usa con su botón y, si tiene oferta, con su cinta (D-191).
// Con cinta, el contenido baja 40 px (el alto de la cinta) para que nada quede debajo.
export default function MarcoCampana({ cta, cinta, children }: { cta: Boton; cinta?: ReactNode; children: ReactNode }) {
  return (
    <>
      <CampanaHeader cta={cta} cinta={cinta} />
      <main className={cinta ? "v2-main pt-10" : "v2-main"}>{children}</main>
      <CampanaFooter />
      <StickyBookBar cta={cta} />
    </>
  );
}
