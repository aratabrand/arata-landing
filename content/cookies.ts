// Aviso y preferencias de cookies (D-130, D-132 suma Microsoft Clarity, D-203 suma el pixel de Meta). ◻ Copy nuevo por aprobar (03-copy.md, "Aviso de cookies").
// Ley 1581 de 2012 / Decreto 1377 de 2013: autorización previa, expresa e informada; revocable.

export const cookies = {
  titulo: "¿Nos dejas medir tu visita?",
  texto: "Usamos cookies de Google Analytics para saber cuántas personas visitan la página. Solo se activan si aceptas, y puedes cambiar de opinión cuando quieras.",
  // Con Clarity encendido (D-132): se menciona también y hay un segundo permiso.
  textoConClarity:
    "Usamos cookies de Google Analytics para contar las visitas y de Microsoft Clarity para ver por dónde se mueve la gente en la página. Solo se activan si aceptas, y puedes cambiar de opinión cuando quieras.",
  // Con el pixel de Meta encendido (D-203): el texto del aviso se arma con textoAviso() (abajo).
  enlace: "Política de datos",
  aceptar: "Aceptar",
  rechazar: "Rechazar",
  preferencias: "Elegir mis preferencias",
  prefTitulo: "Preferencias de cookies",
  prefIntro: "Elige qué cookies dejas activas en este navegador. Tu elección se guarda 12 meses y la puedes cambiar desde el final de cualquier página.",
  cerrar: "Cerrar",
  necesarias: {
    titulo: "Necesarias",
    estado: "Siempre activas",
    texto:
      "Hacen que la página funcione: guardan tu elección de cookies y si ya viste la animación de entrada. Si agendas, el calendario de Cal.com usa las que necesita para reservar tu cita. No se usan para publicidad.",
  },
  medicion: {
    titulo: "Medición (Google Analytics)",
    texto:
      "Nos dicen cuántas personas visitan la página, de dónde llegan y qué páginas ven, sin tu nombre ni tu correo. Los datos los guarda Google, en Estados Unidos.",
  },
  navegacion: {
    titulo: "Cómo navegas (Microsoft Clarity)",
    texto:
      "Nos muestra dónde hace clic y hasta dónde baja la gente, y guarda una grabación de la visita (se ve el mouse y el desplazamiento, sin sonido). Lo que escribes en los formularios se oculta y no se graba. Los datos los guarda Microsoft, en Estados Unidos.",
  },
  publicidad: {
    titulo: "Publicidad (Meta)",
    texto:
      "Nos dice si llegaste por un anuncio nuestro en Facebook o Instagram y si agendaste, para saber qué anuncios funcionan. Meta también puede usarlo para mostrarte anuncios de Arata San. No le enviamos tu nombre, tu correo ni tu WhatsApp. Los datos los guarda Meta, en Estados Unidos.",
  },
  guardar: "Guardar mis preferencias",
  aceptarTodas: "Aceptar todas",
  pie: "Si no aceptas la medición, la página funciona igual.",
  pieConClarity: "Si no aceptas, la página funciona igual.",
  footer: "Preferencias de cookies",
};

/** Texto del aviso según las herramientas encendidas (Google siempre; Clarity y Meta si tienen ID). */
export function textoAviso(clarity: boolean, pixel: boolean): string {
  if (!pixel) return clarity ? cookies.textoConClarity : cookies.texto;
  const partes = ["de Google Analytics para contar las visitas", ...(clarity ? ["de Microsoft Clarity para ver por dónde se mueve la gente en la página"] : []), "de Meta para saber si llegaste por nuestros anuncios de Facebook o Instagram"];
  const lista = `${partes.slice(0, -1).join(", ")} y ${partes[partes.length - 1]}`;
  return `Usamos cookies ${lista}. Solo se activan si aceptas, y puedes cambiar de opinión cuando quieras.`;
}
