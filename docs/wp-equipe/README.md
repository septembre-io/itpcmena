# Page « L'équipe » — comment ça marche

Route front : `/{locale}/equipe` → `src/app/[locale]/equipe/page.tsx`
Page WP source : **L'équipe** (FR id 3662, slug `lequipe`) — traductions Polylang
EN 1314, AR 1693. Le slug FR est la clé de résolution : **ne pas le renommer**
sans changer `SLUG` dans la route.

## Ce que l'éditeur doit faire : rien de spécial

Le front reconnaît le motif que produit naturellement l'éditeur WordPress
quand on colle un texte :

```
[image]
Prénom Nom — Fonction        (le séparateur peut être — – - ou une virgule)
Bio (un ou plusieurs paragraphes)
```

`buildTeamCards()` (`src/lib/content.ts`) le transforme en cartes
`.equipe-membre` : grille photo / texte, nom et fonction sur une même ligne,
photo recadrée en carré, empilement sous 768 px, RTL arabe automatique. Le CSS
est dans `src/app/globals.css`, section « Blocs WordPress ».

Le HTML est aplati avant analyse : toute balise de bloc (`div`, `p`, `h*`,
`figure`, `li`…) devient un séparateur. Les `<div>` imbriqués que produisent les
collages depuis Word ou Google Docs n'ont donc aucune importance — inutile de
nettoyer le HTML dans WordPress.

Sécurités de la transformation : elle ne s'applique que sur la route `/equipe`,
elle est ignorée si le contenu utilise déjà des blocs « Média et texte », et si
elle ne détecte pas au moins deux membres nommés, le HTML est rendu tel quel.
Une page mal formée s'affiche donc en texte simple, jamais cassée.

Variante acceptée aussi : un bloc core **Média et texte** portant la classe
additionnelle `equipe-membre` (onglet Avancé), avec `equipe-fonction` sur le
paragraphe de fonction. Même rendu.

## Traduire la page

Les images n'ont pas à être réversées : copier le contenu de la page FR
(éditeur → ⋮ → Éditeur de code), le coller dans la page EN ou AR, traduire le
texte. Les balises `<img>` pointent sur le même fichier de la médiathèque et
restent valides quelle que soit la langue.

Si la médiathèque apparaît filtrée par langue au moment d'insérer une image :
Réglages → Langues → onglet Réglages → module **Médias**. Désactivé, la
médiathèque est neutre (une image sert dans les 3 langues). Activé, ne jamais
réuploader : Médias → vue Liste → cliquer le « + » de la langue cible, ce qui
crée une traduction de la fiche média pointant sur le **même fichier**.

## Archive

`equipe-{fr,en,ar}.html` : markup de l'ancienne équipe (contenu 2019-2022),
conservé pour référence — la page FR a été remplacée le 4 septembre 2026.
