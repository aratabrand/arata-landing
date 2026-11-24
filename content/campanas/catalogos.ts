import { catalogos } from "@/content/servicios";

/* ── Landing de campaña de Meta: Tienda por WhatsApp — /lp/catalogos (D-188) ──
   Arranca como copia exacta de /catalogos-y-sistemas. Para cambiar un texto SOLO en
   la campaña, se pone la llave aquí y la página del sitio no se toca.
   Ej.: hero: { ...catalogos.hero, titulo: "Otro título" } */
export const lpCatalogos = {
  ...catalogos,
  meta: {
    title: "Tienda por WhatsApp en 5 días · Arata San",
    description: catalogos.meta.description,
  },
};
