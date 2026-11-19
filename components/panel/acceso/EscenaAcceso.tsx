// Escena del login (D-136): una esfera de luz con los colores de Arata, hecha solo con CSS.
// 0 KB de imagen, sin JavaScript. Decorativa: aria-hidden. Los estilos están en styles/panel.src.css (.pn-escena).
// Morado para el cuerpo y la luz; lima solo en un filo y un reflejo pequeños.
export default function EscenaAcceso() {
  return (
    <div aria-hidden="true" className="pn-escena">
      <div className="pn-malla" />
      <div className="pn-halo" />
      <div className="pn-orbita" />
      <div className="pn-orbe-caja">
        <div className="pn-orbe" />
        <div className="pn-reborde-luz" />
        <div className="pn-reborde" />
      </div>
      <div className="pn-suelo" />
      <div className="pn-polvo" />
    </div>
  );
}
