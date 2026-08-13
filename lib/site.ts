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
  description:
    "Le montamos a tu negocio la estructura digital para vender más por internet: páginas que convierten, chatbots con IA que contestan y agendan, y datos claros para decidir mejor.",
} as const;
