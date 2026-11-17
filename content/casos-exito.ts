// Casos de éxito del Inicio: video del proyecto dentro de un celular + descripción + testimonio.
// Pedido de Sergio (D-102). Copy de la sección ◻ por aprobar (03-copy.md, "Casos de éxito").
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
      slug: "caravana",
      muestra: true,
      video: { mp4: "/casos/caravana.mp4", poster: "/casos/caravana.webp", audio: true },
      titulo: "De la galería de fotos a una tienda con panel.",
      descripcion: "Un catálogo con los productos organizados y un panel para manejar la tienda desde el celular.",
      testimonio: {
        texto: "Texto de ejemplo: aquí va lo que dice el cliente sobre su catálogo, con sus palabras.",
        nombre: "Nombre del cliente",
        cargo: "Dueño de Caravana",
        estrellas: 5,
      },
      logo: "/logos/caravana.svg",
    },
    {
      slug: "arata-print",
      muestra: true,
      video: { mp4: "/casos/arata-print.mp4", poster: "/casos/arata-print.webp", audio: false },
      titulo: "Del chat de WhatsApp a un negocio con datos.",
      descripcion: "Un catálogo que el dueño maneja desde el celular, con los pedidos en orden y datos de lo que compran sus clientes.",
      logo: "/logos/arata-print.svg",
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
export function casosVisibles(): CasoExito[] {
  const produccion = process.env.VERCEL_ENV === "production";
  return casosExito.items.filter((c) => !(produccion && c.muestra));
}
