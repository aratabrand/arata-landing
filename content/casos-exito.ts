// Casos de éxito del Inicio: video del proyecto dentro de un celular + descripción + testimonio.
// Pedido de Sergio (D-128). Copy de la sección ◻ por aprobar (03-copy.md, "Casos de éxito").
//
// Reglas:
// - Solo videos y testimonios reales. Si falta el testimonio, no se muestra ese bloque (no se inventa).
// - `muestra: true` = video grabado por Claude del catálogo en vivo, con texto de ejemplo, para probar
//   la sección en el preview. NUNCA sale en producción (se filtra en `casosVisibles`).
// - Con 2 o más casos aparecen las flechas (cambio vertical, tipo reel). Con 1, el video va en loop.

import { proyectos, type Proyecto } from "./proyectos";

export type Testimonio = {
  texto: string;
  nombre: string;
  cargo: string; // ej. "Dueño de Caravana"
  estrellas: 1 | 2 | 3 | 4 | 5;
};

export type CasoExito = {
  slug: Proyecto["slug"]; // enlaza con el caso de /portafolio/[slug]
  video: {
    mp4: string; // H.264, vertical 9:19.5, sin barras
    poster: string; // WebP, primer cuadro
    /** El video tiene voz o música: muestra el botón de sonido. */
    audio: boolean;
    /**
     * "contain" = el video se ve completo (sin recortar los lados) y lo que sobra arriba y abajo
     * se funde con el fondo #03010B. Úsalo cuando el video no es 9:19,5 y tiene textos cerca de los bordes.
     */
    ajuste?: "cover" | "contain";
  };
  titulo: string;
  descripcion: string;
  testimonio?: Testimonio;
  /** Logo del cliente para la cabecera del video (cuadrado o horizontal, se ajusta). */
  logo?: string;
  muestra?: boolean;
};

export const casosExito = {
  // ◻ por aprobar — versiones en 03-copy.md
  eyebrow: "Casos de éxito",
  titulo: "Mira cómo les funciona a nuestros clientes.",
  texto: "Videos reales de los catálogos y páginas que hicimos, y lo que dicen sus dueños.",
  sonidoActivar: "Toca para escucharlo",
  sonidoQuitar: "Toca para silenciar",
  pausar: "Pausar video",
  reproducir: "Reproducir video",
  anterior: "Caso anterior",
  siguiente: "Siguiente caso",
  verCaso: "Ver el caso completo",
  enVivo: "Desde la tienda",
  items: [
    {
      // Video real del cliente (Sergio, 17 nov 2026): explicación animada del catálogo, con voz.
      // 1080×1920 → 720×1280, 9,8 MB → 2,3 MB. ◻ Testimonio pendiente: sin él, no se muestra ese bloque.
      slug: "caravana",
      video: { mp4: "/casos/caravana.mp4", poster: "/casos/caravana.webp", audio: true, ajuste: "contain" },
      titulo: "De la galería de fotos a una tienda con panel.",
      descripcion: "Un catálogo con los productos organizados y un panel para manejar la tienda desde el celular.",
      logo: "/logos/caravana.svg",
    },
  ] as CasoExito[],
};

/** Datos reales del proyecto para las píldoras flotantes (sin inventar: solo lo que existe). */
export function datosDelCaso(slug: string): { valor: string; texto: string }[] {
  const p = proyectos.find((x) => x.slug === slug);
  if (!p) return [];
  const out: { valor: string; texto: string }[] = [];
  if (p.ficha.duracion) out.push({ valor: p.ficha.duracion, texto: "de principio a fin" });
  if (p.puntajes?.mostrar === "todo") out.push({ valor: String(p.puntajes.celular.rendimiento), texto: "en velocidad (celular)" });
  return out;
}

/**
 * Casos que se publican. En producción (Vercel production) se quitan los de muestra;
 * en el preview y en local se ven para revisar la sección.
 */
export function casosVisibles(servicio?: Proyecto["servicio"]): CasoExito[] {
  const produccion = process.env.VERCEL_ENV === "production";
  return casosExito.items.filter((c) => {
    if (produccion && c.muestra) return false;
    if (!servicio) return true;
    return proyectos.find((p) => p.slug === c.slug)?.servicio === servicio;
  });
}
