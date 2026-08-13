// Detecta cuándo un elemento entra en vista, confiable y sin costo de scroll.
// - IntersectionObserver: corre fuera del hilo principal (eficiente en móvil).
// - Chequeo inmediato al montar: cubre lo que ya está en/por encima de la vista
//   (ej. recargar a mitad de página), que el observer solo no revelaría.
export function onInView(el: Element, cb: () => void, threshold = 0.1): () => void {
  const rect = el.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom > 0) {
    cb();
    return () => {};
  }
  if (typeof IntersectionObserver === "undefined") {
    cb();
    return () => {};
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        cb();
        io.disconnect();
      }
    },
    { threshold, rootMargin: "0px 0px -8% 0px" }
  );
  io.observe(el);
  return () => io.disconnect();
}
