// Inserta datos estructurados. Los objetos salen de content/ (estáticos); se
// escapa "<" para que ningún texto pueda cerrar la etiqueta <script>.
export default function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
