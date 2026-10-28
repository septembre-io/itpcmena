# Cahier de saisie — Tribunes (op-ed)

Quatre champs s'ajoutent au formulaire d'article, **uniquement** quand la catégorie
« Opinion » est cochée. Ils apparaissent dans la colonne de droite de l'éditeur,
sous « Publier », dans un encadré **Tribune — signature**.

Aucun n'est obligatoire. Un champ laissé vide n'affiche rien — jamais de mention
« à compléter » côté public.

> Rappel : la publication d'une opinion est réservée à **Hiba** et **Clément**
> (`itpc-opinions-lock.php`). N'importe quel rédacteur peut en revanche préparer
> l'article et remplir ces champs.

## Les champs

| Champ ACF | Libellé dans l'admin | À quoi ça sert | Si on le laisse vide |
|---|---|---|---|
| `tribune_auteur` | Auteur·ice | Le nom sous la tribune, sur la page d'accueil et dans le rail « Également signé » | Aucune signature n'est affichée |
| `tribune_fonction` | Fonction / organisation | La ligne grise sous le nom | La ligne disparaît, le nom reste |
| `tribune_chapo` | Chapô | Les deux lignes sous le titre, sur l'accueil | Le début de l'article est repris automatiquement, souvent coupé au mauvais endroit |
| `tribune_portrait` | Portrait | Prévu pour la suite — **pas encore affiché** sur le site | Les initiales sur pastille de couleur sont utilisées |

## Ce qu'on écrit dedans

**Auteur·ice** — le nom tel qu'il doit apparaître. Une organisation est une
signature parfaitement valable : une prise de position collective se signe
« ITPC-MENA » ou « Coalition MENA-H », pas au nom d'une personne.

| Cas | `tribune_auteur` | `tribune_fonction` |
|---|---|---|
| Tribune personnelle | `Othoman Mellouk` | `Co-fondateur d'ITPC-MENA` |
| Communiqué du secrétariat | `ITPC-MENA` | `Secrétariat régional · Rabat` |
| Texte inter-organisations | `Coalition MENA-H` | `Coalition régionale santé · 14 pays` |
| Voix d'un partenaire | `Prénom Nom` | `Fonction, organisation, pays` |

**Chapô** — 220 caractères maximum, deux phrases au plus. Ce n'est pas un résumé :
c'est ce qui donne envie de lire. Écrire au présent, éviter de recopier la
première phrase de l'article.

> Exemple (tribune du 12 décembre 2025) :
> « Alors que la 8ᵉ reconstitution du Fonds mondial approche, une opportunité
> historique se présente pour les pays du Golfe de transformer la réponse aux
> épidémies de VIH et de tuberculose dans la région. »

**Portrait** — carré, 400 × 400 px minimum, JPG/PNG/WebP. Facultatif, et **pas
encore utilisé par le site** : le champ existe pour que la photo soit collectée
dès maintenant, l'affichage viendra dans un second temps.

## Multilingue

Une tribune traduite est un **article distinct** dans Polylang : ses champs sont
donc à remplir dans chaque langue. Le nom ne change pas d'une langue à l'autre,
la fonction et le chapô si.

| Champ | FR | EN | AR |
|---|---|---|---|
| `tribune_auteur` | `Othoman Mellouk` | `Othoman Mellouk` | `عثمان ملوك` |
| `tribune_fonction` | Co-fondateur d'ITPC-MENA | Co-founder of ITPC-MENA | |
| `tribune_chapo` | (texte FR) | (texte EN) | (نص عربي) |

En arabe, saisir normalement : le site gère le sens de lecture tout seul.

## Où ça s'affiche

- **Accueil**, bloc sombre « Prises de position », juste sous le hero : la tribune
  la plus récente en grand — pastille « Tribune », date, temps de lecture, titre,
  chapô, signature, bouton « Lire la tribune ». Les trois suivantes dans la
  colonne « Également signé », avec leur nom d'auteur·ice.
- **Page /opinions** : la liste complète.

Le temps de lecture n'est pas un champ : il est calculé d'après la longueur de
l'article.
