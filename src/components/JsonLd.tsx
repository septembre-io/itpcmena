// Injecte des données structurées JSON-LD. `<` est échappé en < pour qu'une
// chaîne contenant « </script> » ne puisse pas fermer la balise prématurément.
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
