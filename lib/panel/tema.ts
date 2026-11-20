// Tema del panel (D-149): oscuro por defecto; claro con el interruptor de la barra de arriba,
// al lado de la campana (components/panel/InterruptorTema.tsx, D-152).
// Se guarda en una cookie (no en localStorage) para que el servidor pinte el tema correcto desde
// el primer cuadro, sin destello. La cookie no es de seguimiento: es una preferencia necesaria.
export type Tema = "oscuro" | "claro";
export const COOKIE_TEMA = "pn-tema";
export const FONDO_TEMA: Record<Tema, string> = { oscuro: "#020104", claro: "#F2F2F5" };

export function temaDe(valor: string | undefined): Tema {
  return valor === "claro" ? "claro" : "oscuro";
}

/** Cambia el tema en el navegador y lo guarda un año. Solo en el cliente. */
export function aplicarTema(tema: Tema) {
  const raiz = document.querySelector<HTMLElement>(".pn-root");
  if (raiz) raiz.dataset.tema = tema;
  document.documentElement.style.background = FONDO_TEMA[tema];
  document.body.style.background = FONDO_TEMA[tema];
  const seguro = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_TEMA}=${tema}; Path=/; Max-Age=31536000; SameSite=Lax${seguro}`;
}
