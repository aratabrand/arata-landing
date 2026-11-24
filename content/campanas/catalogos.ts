import { catalogos } from "@/content/servicios";

/* ── Landing de campaña de Meta: Tienda por WhatsApp — /lp/catalogos (D-189) ──
   Arranca como copia de /catalogos-y-sistemas. Para cambiar un texto SOLO en la
   campaña, se pone la llave aquí y la página del sitio no se toca.
   Plan y copy por aprobar: docs/campanas/meta-tienda-whatsapp.md */

// D-191: precio normal en pesos. 800 USD con la TRM del 24 nov 2026 ($ 3.505,92) = $ 2.804.736 → redondeado.
export const PRECIO_COP = "$ 2.800.000";

// D-192: oferta de noviembre. Precio fijo (sin «desde»), con el precio normal tachado.
// Termina sola: la página se vuelve a armar cada hora (revalidate) y, pasada la fecha,
// sale sin cinta y con el precio normal. Para una oferta nueva se cambian estos datos.
export const OFERTA = {
  precio: "$ 2.200.000",
  antes: PRECIO_COP,
  /** Primer instante SIN oferta, hora de Bogotá: la oferta vale todo el 30 de noviembre. */
  vence: "2026-12-01T00:00:00-05:00",
  hastaTexto: "30 de noviembre",
  nombre: "Precio de noviembre",
};

export function ofertaVigente(ahora = new Date()): boolean {
  return ahora.getTime() < new Date(OFERTA.vence).getTime();
}

/** Días de oferta que quedan contando hoy (el 30 de noviembre = 1). */
export function diasOferta(ahora = new Date()): number {
  return Math.max(0, Math.ceil((new Date(OFERTA.vence).getTime() - ahora.getTime()) / 86_400_000));
}

export function textoDias(dias: number): string {
  return dias <= 1 ? "Último día" : `Quedan ${dias} días`;
}

/** Textos de la landing. Con oferta vigente: precio fijo de noviembre; si no, el precio normal «desde». */
export function textosLanding(conOferta: boolean) {
  const faqBase = catalogos.faq.items.filter((f) => !f.p.includes("Tu Negocio en Orden"));
  return {
    ...catalogos,
    meta: {
      title: "Tienda por WhatsApp en 5 días · Arata San",
      description: conOferta
        ? `Catálogo con carrito, inventario y un panel para manejar tu negocio desde el celular. Los pedidos te llegan al WhatsApp. En noviembre a ${OFERTA.precio} (antes ${OFERTA.antes}), en 5 días hábiles.`
        : `Catálogo con carrito, inventario y un panel para manejar tu negocio desde el celular. Los pedidos te llegan al WhatsApp. Desde ${PRECIO_COP}, en 5 días hábiles.`,
    },
    hero: {
      ...catalogos.hero,
      texto: conOferta
        ? `Catálogo con carrito, inventario y un panel para manejar tu negocio desde el celular. En noviembre a ${OFERTA.precio} (antes ${OFERTA.antes}).`
        : `Catálogo con carrito, inventario y un panel para manejar tu negocio desde el celular. Desde ${PRECIO_COP}.`,
    },
    tienda: {
      ...catalogos.tienda,
      precio: conOferta ? OFERTA.precio : `Desde ${PRECIO_COP}`,
      precioAntes: conOferta ? OFERTA.antes : undefined,
      precioNota: conOferta
        ? `precio especial hasta el ${OFERTA.hastaTexto}.`
        : "unos 800 USD. Depende del tamaño de tu tienda.",
    },
    // D-191: sin «Tu Negocio en Orden»: el anuncio vende una sola oferta.
    proceso: {
      ...catalogos.proceso,
      items: catalogos.proceso.items.map((p) =>
        p.titulo === "Te entregamos" ? { ...p, texto: "Tu tienda en 5 días hábiles." } : p
      ),
    },
    faq: {
      ...catalogos.faq,
      items: [
        // D-192: con la oferta el precio es fijo; la pregunta del «desde» no aplica
        ...(conOferta ? faqBase.filter((f) => !f.p.includes("desde")) : faqBase),
        // D-191: respuestas de Sergio (24 nov 2026)
        {
          p: "¿Cuántos productos caben?",
          r: conOferta
            ? "Más de 100, organizados por categorías."
            : "Más de 100. El precio depende de cuántos productos y categorías tengas: en la reunión te damos el precio exacto.",
        },
        { p: "¿Qué pasa después del primer año?", r: "El primer año el dominio y el hosting van por nuestra cuenta. Después se renueva el contrato y se paga el dominio." },
      ],
    },
  };
}
