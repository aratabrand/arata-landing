import { catalogos } from "@/content/servicios";
import { precios } from "@/content/inicio";

/* ── Landing de campaña de Meta: Tienda por WhatsApp — /lp/catalogos (D-189) ──
   Arranca como copia de /catalogos-y-sistemas. Para cambiar un texto SOLO en la
   campaña, se pone la llave aquí y la página del sitio no se toca.
   Plan y copy aprobado (D-193): docs/campanas/meta-tienda-whatsapp.md §5 */

// D-191: precio normal en pesos. 800 USD con la TRM del 24 nov 2026 ($ 3.505,92) = $ 2.804.736 → redondeado.
// Espacio que no se parte (\u00A0): el «$» nunca queda solo al final de una línea.
export const PRECIO_COP = "$\u00A02.800.000";

// D-192: oferta de noviembre. Precio fijo (sin «desde»), con el precio normal tachado.
// Termina sola: la página se vuelve a armar cada hora (revalidate) y, pasada la fecha,
// sale sin cinta y con el precio normal. Para una oferta nueva se cambian estos datos.
export const OFERTA = {
  precio: "$\u00A02.200.000",
  antes: PRECIO_COP,
  /** Primer instante SIN oferta, hora de Bogotá: la oferta vale todo el 30 de noviembre. */
  vence: "2026-12-01T00:00:00-05:00",
  hastaTexto: "30 de noviembre",
  nombre: "Precio de noviembre",
  /** D-195: la condición. Vale para quien AGENDA la reunión hasta el 30 de noviembre (no hace falta pagar antes). */
  condicion: "para quien agende hasta el 30 de noviembre",
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

// D-193: copy aprobado por Sergio (24 nov 2026), docs/campanas/meta-tienda-whatsapp.md §5.
const SUBTITULO = "Todos tus productos con precio en un enlace. El cliente arma su pedido y te llega ordenado al WhatsApp.";

/** Textos de la landing. Con oferta vigente: precio fijo de noviembre; si no, el precio normal «desde». */
export function textosLanding(conOferta: boolean) {
  return {
    ...catalogos,
    meta: {
      title: "Tienda por WhatsApp en 5 días · Arata San",
      description: conOferta
        ? `${SUBTITULO} Tu tienda lista en 5 días, en noviembre a ${OFERTA.precio} (antes ${OFERTA.antes}).`
        : `${SUBTITULO} Tu tienda lista en 5 días, desde ${PRECIO_COP}.`,
    },
    // §5.1, versión A1
    hero: {
      ...catalogos.hero,
      titulo: "Deja de mandar foto por foto.",
      texto: conOferta
        ? `${SUBTITULO} Tu tienda lista en 5 días, en noviembre a ${OFERTA.precio} (antes ${OFERTA.antes}).`
        : `${SUBTITULO} Tu tienda lista en 5 días, desde ${PRECIO_COP}.`,
    },
    // §5.2
    problema: {
      titulo: "Vender por chat no debería quitarte todo el día",
      cierre:
        "Con tu tienda, el cliente ve todo con precio, arma su pedido a cualquier hora y te llega ordenado al WhatsApp. Tú solo lo despachas.",
      items: [
        { icono: "fotos", titulo: "Mandas foto por foto", texto: "Y respondes «¿precio?» todo el día. El cliente se cansa antes de comprar." },
        { icono: "pedidos", titulo: "Los pedidos se pierden en el chat", texto: "Entre audios, fotos y mensajes, alguno se te pasa o llega con la talla equivocada." },
        { icono: "ventas", titulo: "Si te demoras, compra en otro lado", texto: "Mientras le contestas a uno, otro se cansa de esperar. Y de noche nadie te compra." },
        { icono: "datos", titulo: "No sabes qué tienes ni qué se vende", texto: "Vendes lo que ya no hay y compras mercancía a ciegas." },
      ],
    },
    // §5.3. ◻ Con el testimonio del dueño de Caravana, el texto vuelve a «lo que dice su dueño».
    casosExito: {
      eyebrow: "Caso real",
      titulo: "Así le funciona a Caravana.",
      texto: "Pasaron de mandar fotos por WhatsApp a una tienda con inventario, pedidos y datos de venta en un panel.",
    },
    tienda: {
      ...catalogos.tienda,
      precio: conOferta ? OFERTA.precio : `Desde ${PRECIO_COP}`,
      precioAntes: conOferta ? OFERTA.antes : undefined,
      precioNota: conOferta
        ? `para quien agende hasta el ${OFERTA.hastaTexto}.`
        : "unos 800 USD. Depende del tamaño de tu tienda.",
    },
    // §5.5: garantía de la tienda (no de la página) y mantenimiento con su para qué
    aseguramientos: precios.aseguramientos.map((a) =>
      a.tipo === "velocidad"
        ? { ...a, texto: "Si tu tienda no saca 90 o más en velocidad móvil de Google, la seguimos ajustando gratis hasta lograrlo." }
        : a.tipo === "mantenimiento"
          ? { ...a, texto: "Opcional: 15 % al mes si quieres que nos encarguemos del soporte." }
          : a
    ),
    // D-191: sin «Tu Negocio en Orden»: el anuncio vende una sola oferta.
    proceso: {
      ...catalogos.proceso,
      items: catalogos.proceso.items.map((p) =>
        p.titulo === "Te entregamos" ? { ...p, texto: "Tu tienda en 5 días hábiles." } : p
      ),
    },
    // §5.4: 9 preguntas, en orden de objeción
    faq: {
      ...catalogos.faq,
      items: [
        { p: "¿Cómo me llegan los pedidos?", r: "El cliente arma su pedido en tu tienda y te llega ordenado a tu WhatsApp, con productos y cantidades." },
        { p: "¿Me cobran comisión por cada venta?", r: "No. El pedido te llega directo a tu WhatsApp y el pago lo recibes tú completo." },
        {
          p: "¿Por qué una tienda y no solo Instagram o el catálogo de WhatsApp?",
          r: "Porque es tuya: tu dominio, tus productos y tus pedidos. Si Instagram cambia o te cierran la cuenta, tu tienda sigue funcionando. Y se ve como un negocio serio, así tus clientes confían en comprarte.",
        },
        { p: "¿Necesito saber de tecnología?", r: "No. Te la entregamos funcionando y te enseñamos a subir productos y ver tus pedidos desde el celular." },
        {
          p: "¿Cuántos productos caben?",
          // D-192: con la oferta el precio es fijo, no depende del tamaño
          r: conOferta
            ? "Más de 100, organizados por categorías."
            : "Más de 100. El precio depende de cuántos productos y categorías tengas: en la reunión te damos el precio exacto.",
        },
        { p: "¿Quién sube los productos y maneja el inventario?", r: "Tú, desde tu panel, también en el celular. Te enseñamos en la capacitación." },
        { p: "¿Puedo pagar por partes?", r: "Sí: 50 % para arrancar y 50 % cuando te entregamos." },
        { p: "¿Mis clientes pueden pagar en línea?", r: "Por ahora no. El cliente arma su pedido, te llega por WhatsApp y cobras como siempre." },
        {
          p: "¿Hay que pagar algo cada mes?",
          r: "No es obligatorio. El primer año el dominio y el hosting van por nuestra cuenta; después se renueva el contrato y se paga el dominio. El mantenimiento (15 % del valor del proyecto al mes) es opcional, por si quieres que nos encarguemos del soporte.",
        },
      ],
    },
    // §5.5: llamado final
    cta: {
      ...catalogos.cta,
      texto: "Tomamos 4 proyectos nuevos al mes. Agenda y en 30 minutos te decimos cuánto cuesta tu tienda.",
    },
  };
}
