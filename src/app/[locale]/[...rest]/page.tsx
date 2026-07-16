import { notFound } from "next/navigation";

// Attrape toute URL sous une langue qui ne correspond à AUCUNE route connue
// (ex. un ancien lien après réorganisation du site) et déclenche la 404
// localisée (src/app/[locale]/not-found.tsx) avec le vrai statut HTTP 404.
// Priorité la plus basse : les routes spécifiques (actualites, financements…)
// continuent de l'emporter.
export default function CatchAllNotFound() {
  notFound();
}
