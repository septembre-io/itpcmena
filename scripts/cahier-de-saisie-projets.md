# Cahier de saisie : pages projet

Les pages projet du site (première : L.A.N.C.E.R., à l'adresse
`/fr/programmes/lancer`) se modifient dans WordPress, sous **Pages**. Chaque
langue a sa page : « L.A.N.C.E.R. » (FR), « L.A.N.C.E.R. (EN) » et
« L.A.N.C.E.R. (AR) », reliées par Polylang.

La page s'ouvre sur un formulaire **Page projet** organisé en onglets. La mise en
page, les couleurs et les libellés fixes (fil d'Ariane, statuts) sont gérés par le
site : on saisit seulement le texte.

## Principes

- **Un champ vide reprend le texte prévu par défaut** sur le site. Rien ne
  s'affiche jamais « à compléter » en public.
- **Délai :** une modification enregistrée apparaît en ligne en 5 minutes au plus.
- **Paragraphes :** dans les champs « Texte » (Contexte, Gouvernance), laisser une
  ligne vide entre deux paragraphes.
- **Listes :** étapes, objectifs, productions, partenaires… se remplissent dans
  l'ordre, à partir du n° 1. Une ligne dont le champ principal est vide est
  ignorée. Dès qu'une ligne est remplie, la liste du site est remplacée en entier
  par celle de WordPress.
- **Traductions :** la version anglaise et la version arabe se saisissent dans leur
  propre page. Une page traduite restée vide affiche le texte par défaut de sa
  langue.

## Onglets

| Onglet | Bloc de la page | Points d'attention |
|---|---|---|
| Bandeau | Haut de page sombre | « Nom court » = fil d'Ariane. Quatre repères au plus (libellé et valeur). Titre et description pour les moteurs de recherche : facultatifs |
| Contexte | Deux colonnes, titre à gauche, texte à droite | Paragraphes séparés par une ligne vide |
| Objectifs | Trois chiffres à filet de couleur | Année, chiffre, texte court, couleur (rouge, ambre, vert) |
| Démarche | Étapes numérotées, puis encadrés blancs | Six étapes au plus, numérotées automatiquement ; la dernière est en vert. Quatre encadrés au plus |
| Gouvernance | Bloc noir arrondi | Paragraphes séparés par une ligne vide |
| Étapes clés | Liste datée | Dix étapes au plus. Cocher « Réalisée » quand l'étape est faite : la date passe en vert |
| Productions | Cartes avec statut | Voir ci-dessous |
| Enseignements | Liste titrée, avec la source | Cinq au plus |
| Partenaires | Noms dans des cartouches | Huit au plus, sans logo. Ne citer une association qu'avec son accord |
| Contact | Encadré final | Le lien du bouton peut être une adresse web ou « mailto:contact@itpcmena.org ». La ligne d'orientation (ex. « Vous cherchez où recevoir l'injection ? Consultez l'ALCS ») s'affiche si ses trois champs sont remplis |

## Productions

Chaque production a un **statut** (Disponible, En finalisation, En cours, En
test, À venir) affiché en pastille.

| Situation | Que remplir | Ce qui s'affiche |
|---|---|---|
| Document prêt | Fichier (PDF) + texte du bouton, ex. « Télécharger (PDF) » | Un bouton vers le PDF |
| Questionnaire ou page en ligne | Lien + texte du bouton, ex. « Répondre à l'enquête » | Un bouton vers le lien |
| Pas encore disponible | Mention sans lien, ex. « Disponible en décembre 2026 » | La mention, en gris |

Si un fichier et un lien sont tous deux remplis, le fichier l'emporte. Sans fichier
ni lien, aucun bouton n'apparaît.

## Créer un autre projet

1. **Pages > Ajouter**, titre du projet.
2. Dans le panneau de droite, **Modèle : Page projet (site)**. Le formulaire
   apparaît après enregistrement.
3. Le **slug** de la page française donne l'adresse : un slug `forss` donne
   `/fr/programmes/forss`. Choisir un slug court, sans accent.
4. Remplir au moins le titre du bandeau, puis publier. Les blocs sans contenu ne
   s'affichent pas.
5. Créer les traductions avec le « + » de Polylang, choisir le même modèle et
   remplir les champs.
6. Nous prévenir pour ajouter un lien vers la page dans le menu ou sur l'accueil.
