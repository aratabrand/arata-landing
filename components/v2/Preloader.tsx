// Animación de entrada (D-092): capas ink → morado → lima que suben como cortinas,
// el símbolo de Arata San que cae pieza por pieza y una barra que llega a 100.
// - Solo CSS: corre desde el primer pintado, sin esperar a JavaScript, y se quita sola (~1,7 s).
// - Una vez por visita (sessionStorage); con movimiento reducido no aparece.
// - Decorativa: aria-hidden y sin capturar toques. Su contenido es pequeño para no ser el LCP.
// CSS en globals.css (.v2l-*).

const PIEZAS = [
  // arriba, X (lima), abajo: caen en ese orden
  { d: "M23.939 16.0972L51.8208 0L79.7024 16.0854L51.8265 32.182L23.939 16.0972Z", fill: "#FFFFFF" },
  { d: "M62.1786 93.2159L52.0035 87.333L41.81 93.2191L41.8161 77.1332L10.187 95.3861L0.0103615 89.5164L0.0309348 77.731L31.6286 59.4701L0 41.2345L0.00503938 29.4642L10.1806 23.5827L51.9942 47.722L93.7933 23.5823L103.987 29.4582L103.99 41.2301L72.3766 59.4792L103.995 77.7414L104 89.5066L93.8036 95.3882L62.1509 77.11L62.1786 93.2159Z", fill: "#B6FF00" },
  { d: "M38.1519 110.216L52.0885 102.17L66.0348 110.222L52.0885 118.263L38.1519 110.216Z", fill: "#FFFFFF" },
];

// Si ya se vio en esta visita, se marca <html> antes de pintar y el CSS lo oculta.
const yaVisto = `try{if(sessionStorage.getItem("as-cargado"))document.documentElement.classList.add("v2l-off");else sessionStorage.setItem("as-cargado","1")}catch(e){}`;

export default function Preloader() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: yaVisto }} />
      <div aria-hidden className="v2l">
        <div className="v2l-capa v2l-lima" />
        <div className="v2l-capa v2l-morado" />
        <div className="v2l-capa v2l-ink">
          <svg viewBox="0 0 104 119" className="h-14 w-auto overflow-visible">
            {PIEZAS.map((p, i) => (
              <path key={i} className="v2l-pieza" style={{ ["--i" as string]: i }} fillRule="evenodd" clipRule="evenodd" d={p.d} fill={p.fill} />
            ))}
          </svg>
          <div className="mt-8 w-48">
            <div className="h-[3px] overflow-hidden rounded-full bg-white/10">
              <div className="v2l-barra h-full rounded-full bg-lime" />
            </div>
            <p className="v2l-cuenta mt-3 text-center font-display text-sm font-bold tracking-heading text-fog" />
          </div>
        </div>
      </div>
    </>
  );
}
