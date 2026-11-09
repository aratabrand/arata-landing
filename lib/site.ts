const phone = "573134011189";
const waMessage = "Hola Arata San, quiero agendar mi diagnóstico gratis.";

export const site = {
  name: "Arata San",
  city: "Bogotá, Colombia",
  phone,
  instagram: "https://instagram.com/arata.san.web",
  instagramHandle: "@arata.san.web",
  whatsapp: `https://wa.me/${phone}?text=${encodeURIComponent(waMessage)}`,
  url: "https://www.aratasan.com",
  // Contenedor de Google Tag Manager (público, no es un secreto). D-096: GTM-MVW5FKSQ
  // trae GA4 (G-PWBJXQML6S); reemplaza al contenedor vacío GTM-TL7RLDMS. Desde GTM se
  // pueden sumar el píxel de Meta, etc., sin tocar código. Se sobreescribe con NEXT_PUBLIC_GTM_ID.
  gtmId: process.env.NEXT_PUBLIC_GTM_ID ?? "GTM-MVW5FKSQ",
  // v1 (se conserva para el JSON-LD histórico de la v1; el sitio usa los textos de content/ y lib/schema.ts)
  description:
    "Le montamos a tu negocio la estructura digital para vender más por internet: páginas que convierten, chatbots con IA que contestan y agendan, y datos claros para decidir mejor.",
} as const;
