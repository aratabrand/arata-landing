import { catalogos } from "@/content/servicios";

/* ── Landing de campaña de Meta: Tienda por WhatsApp — /lp/catalogos (D-188) ──
   Arranca como copia de /catalogos-y-sistemas. Para cambiar un texto SOLO en la
   campaña, se pone la llave aquí y la página del sitio no se toca.
   Plan y copy por aprobar: docs/campanas/meta-tienda-whatsapp.md */

// D-190: precio en pesos para el público de Colombia. 800 USD con la TRM del 24 nov 2026
// ($ 3.505,92) = $ 2.804.736 → se redondea. Si Sergio fija un precio de lista en pesos, va aquí.
export const PRECIO_COP = "$ 2.800.000";

export const lpCatalogos = {
  ...catalogos,
  meta: {
    title: "Tienda por WhatsApp en 5 días · Arata San",
    description: `Catálogo con carrito, inventario y un panel para manejar tu negocio desde el celular. Los pedidos te llegan al WhatsApp. Desde ${PRECIO_COP}, en 5 días hábiles.`,
  },
  hero: {
    ...catalogos.hero,
    texto: `Catálogo con carrito, inventario y un panel para manejar tu negocio desde el celular. Desde ${PRECIO_COP}.`,
  },
  tienda: {
    ...catalogos.tienda,
    precio: `Desde ${PRECIO_COP}`,
    precioNota: "unos 800 USD. Depende del tamaño de tu tienda.",
  },
  // D-190: sin «Tu Negocio en Orden»: el anuncio vende una sola oferta.
  proceso: {
    ...catalogos.proceso,
    items: catalogos.proceso.items.map((p) =>
      p.titulo === "Te entregamos" ? { ...p, texto: "Tu tienda en 5 días hábiles." } : p
    ),
  },
  faq: {
    ...catalogos.faq,
    items: [
      ...catalogos.faq.items.filter((f) => !f.p.includes("Tu Negocio en Orden")),
      // D-190: respuestas de Sergio (24 nov 2026)
      { p: "¿Cuántos productos caben?", r: "Más de 100. El precio depende de cuántos productos y categorías tengas: en la reunión te damos el precio exacto." },
      { p: "¿Qué pasa después del primer año?", r: "El primer año el dominio y el hosting van por nuestra cuenta. Después se renueva el contrato y se paga el dominio." },
    ],
  },
};
