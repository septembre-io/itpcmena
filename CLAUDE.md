# ITPC-MENA — Next.js Front-End

Projet Next.js headless connecté au WordPress live sur https://itpcmena.org.  
Design de référence : `index-v7-radiant.html` dans le dossier `claude/Projects/dev web/itpc/`.

## Stack

- **Next.js 15** — App Router, TypeScript
- **Tailwind CSS v4**
- **next-intl** — i18n FR/EN/AR avec support RTL
- **WordPress REST API** — source de données (posts, médias)
- **next/font** — Plus Jakarta Sans self-hosted
- **next/image** — optimisation images depuis `itpcmena.org` et `i0.wp.com`

## Design system

```ts
colors: { ink: '#0B0F0E', red: '#C1272D', teal: '#0E9F76', cream: '#F7F6F2' }
fontFamily: { sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'] }
borderRadius: { '4xl': '2rem', '5xl': '2.75rem' }
```

## Locales

`['fr', 'en', 'ar']` — défaut `fr` — arabe en `dir="rtl"`

## Variables d'environnement

```
NEXT_PUBLIC_WP_URL=https://itpcmena.org
NEXT_PUBLIC_SITE_URL=https://[à-définir]
```

## Structure cible

```
src/
  app/[locale]/
    layout.tsx       # html dir, fonts, providers
    page.tsx         # Home (Server Component)
    actualites/
      page.tsx
      [slug]/page.tsx
    programmes/
      [slug]/page.tsx
  components/
    layout/   Navbar.tsx  Footer.tsx
    sections/ Hero.tsx  LogoCloud.tsx  About.tsx  Programmes.tsx  News.tsx  ResourcesCTA.tsx
    ui/       RadiantMesh.tsx  RevealWrapper.tsx  CountUp.tsx
  lib/
    wordpress.ts     # getPosts, getPost, getMedia + types WPPost
    utils.ts
  messages/  fr.json  en.json  ar.json
  middleware.ts
```

## Phases

Voir `claude/Projects/dev web/itpc/plan.md` pour le détail complet.

- **Phase 1** — Scaffold + design system + i18n skeleton
- **Phase 2** — Composants statiques pixel-perfect vs v7-Radiant
- **Phase 3** — Connexion WP REST (news, posts, médias)
- **Phase 4** — i18n complet + RTL arabe
- **Phase 5** — Polish, meta, déploiement

## Pour déclencher le scaffold

Depuis Cowork, avec ce repo ouvert dans le dossier connecté :

> "Scaffold la Phase 1 du projet itpcmena selon le CLAUDE.md"

Claude exécutera : `create-next-app`, config Tailwind, next-intl, composants UI de base.

## i18n des libellés UI (header / footer)

Deux sources distinctes, à ne pas confondre :

0. **Point d'entrée unique du header** : toutes les pages appellent
   `getHeaderMenu(locale)` (`src/lib/menu.ts`) = menu WP prioritaire + repli
   localisé. Ne pas recréer de liste de liens en dur dans une page.
   Aucun menu n'est assigné à l'emplacement `v3-header` côté WP à ce jour :
   c'est donc `getHeaderFallback` qui est servi, où « À propos » est un parent
   avec les entrées « Mission » (ancre `#apropos`) et « L'équipe » (`/equipe`).

1. **Menus de navigation** (colonne « Navigation » du footer, liens du header) →
   gérés dans **WordPress** (Apparence → Menus, un menu par langue via Polylang),
   servis par l'endpoint mu-plugin `GET /wp-json/itpc/v1/menu?location=v3-header|v3-footer&lang={locale}`.
   Repli localisé en cas d'échec : `getHeaderFallback` / `getFooterFallback` dans `src/lib/menu.ts`.
2. **Tous les autres libellés fixes** (description de marque, titres de colonnes,
   liens « Nous rejoindre », copyright…) → **next-intl**, fichiers `messages/{fr,en,ar}.json`.
   Le footer utilise le namespace `"footer"` via `getTranslations({ locale, namespace: "footer" })`
   dans `src/components/v3/layout/Footer.tsx` (composant serveur async, prop `locale` obligatoire
   à chaque point d'appel, `dir="rtl"` auto en arabe).

Pour modifier une traduction du footer : éditer la clé correspondante dans
`messages/en.json` / `messages/ar.json` (source FR : `messages/fr.json`).
Clés : `description`, `nav`, `join`, `joinPartners`, `joinInvolved`, `joinCalls`,
`contact`, `contactPrompt`, `rights` (l'année du © est calculée dans le code), `location`.

Les traductions du bloc marque + « Nous rejoindre » sont **validées par le client
(juillet 2026)** : description trilingue (« La Coalition Internationale pour la
Préparation au Traitement » / « The International Treatment Preparedness Coalition » /
« الائتلاف العالمي للاستعداد للعلاج »), EN « Calls for tenders », AR « انضموا إلينا ».
Les autres clés (`nav`, `contact`, `contactPrompt`, `rights`, `location`) restent
des propositions de Claude non soumises au client.
⚠️ Les liens « S'impliquer » et « Appels d'offres » du bloc « Nous rejoindre »
pointent encore vers `https://itpcmena.org/` (placeholders à remplacer).

## Blocs WordPress rendus côté front

Le front ne charge pas `wp-block-library.css` : **un bloc Gutenberg sort non
stylé** si sa mise en page n'est pas définie dans `src/app/globals.css`
(section « Blocs WordPress », portée `.article-body`). Sont couverts :
`wp-block-media-text` (grille responsive + RTL) et `wp-block-columns`.

Fiches équipe : `buildTeamCards()` (`src/lib/content.ts`) reconnaît le motif
éditorial « photo → nom — fonction → bio » et le reformate en cartes
`.equipe-membre`, appliqué uniquement sur la route `/equipe`. Un bloc « Média et
texte » portant la classe `equipe-membre` donne le même rendu. La transformation
se désactive d'elle-même si elle ne reconnaît pas le contenu.
Voir `docs/wp-equipe/README.md`.

Route `/equipe` → page WP « L'ÉQUIPE » (slug FR `lequipe`, traductions Polylang).
`WpPageView` applique `fixUploadHosts` au contenu : sans ça les images
pointant sur l'apex `itpcmena.org` renvoient un 308 vers le front (aout.app) et cassent.

## Points d'attention

- Images WP : autoriser les domaines `itpcmena.org` et `i0.wp.com` dans `next.config.ts`
- CORS : vérifier les headers WP pour le domaine front
- Polylang : actif sur itpcmena.org — toujours passer `?lang={locale}` sur les endpoints REST `/wp/v2/posts`
- Programmes : données statiques dans `src/data/programmes.ts` — pas de CPT WP

## Bloc op-ed « La tribune à la une »

⚠️ **Deux séries de maquettes op-ed coexistent, avec des numéros qui se recouvrent.**
Juillet 2026 : `itpc/propositions-oped/` — P1 « Éditorial en une » … P5 « Manifeste
sombre », plus les intégrations A/B/C. C'est l'intégration **P5-B « Chapitre sombre
pleine largeur »** qui a été en ligne jusqu'au 7 septembre 2026.
Septembre 2026 : `ITPC/Claude outputs/opeds-home/` — série renumérotée 01…05, dont la
**01 « La tribune à la une »**, retenue et intégrée ici. Toujours citer le nom, pas le
numéro seul.

`src/components/v3/sections/OpEd.tsx` (`OpEdChapter`), section `#blog`, **placée
juste après le hero** dans `src/app/[locale]/page.tsx` — avant les stats, et non
après les actualités : la prise de position du moment est la première chose lue
après le hero. Déplacer le bloc = déplacer l'appel `<OpEdChapter locale={locale} />`.

Données : `getSectionPosts(locale, "blog", 4)` → 1 tribune à la une + 3 dans le
rail « Également signé ». Fail-closed : section vide ⇒ message `oped.empty`.
En arabe la catégorie Opinion ne contient que 2 tribunes, le rail s'affiche donc
avec un seul rappel — le `grid` le gère sans trou.

Signature et chapô : mu-plugin **`scripts/itpc-tribunes.php`**
(dans ce repo, calqué sur `itpc/wp-mu-plugin/itpc-appels.php`) — enregistre le groupe ACF
« Tribune — signature » en code, cadré sur la catégorie « Opinion » (1179 + EN 1181 /
AR 976), et l'expose en REST sous la clé **`itpc_tribune`** (`null` hors Opinion).
Les mu-plugins **écrits à partir de septembre 2026 vivent dans `scripts/`** de ce repo,
pour être versionnés avec le front ; les précédents (appels, sections, polylang-rest,
opinions-lock…) sont restés dans `itpc/wp-mu-plugin/`, hors dépôt. Une copie de
`itpc-tribunes.php` y traîne aussi : **la version de référence est celle du repo**.
Cahier de saisie client : `scripts/cahier-de-saisie-tribunes.md`.

| Champ ACF | Clé REST | Repli si vide |
|---|---|---|
| `tribune_auteur` | `itpc_tribune.auteur` | signature masquée |
| `tribune_fonction` | `itpc_tribune.fonction` | ligne masquée |
| `tribune_chapo` | `itpc_tribune.chapo` | extrait WP nettoyé, coupé à 190 car. |
| `tribune_portrait` | `itpc_tribune.portrait` | initiales sur pastille (**le portrait n'est pas encore affiché** : vérifier `next.config.ts` avant de le brancher — les médias sont servis par `wphead.itpcmena.org`, pas par l'apex autorisé) |

`getByline()` / `getLede()` lisent `itpc_tribune` en priorité, puis retombent sur
les champs ACF bruts (`acf.tribune_auteur`, `auteur`, `signature`… — liste dans
`src/lib/wordpress.ts`) pour le cas où le mu-plugin ne serait pas déployé. Tant
qu'aucun champ n'est rempli, le bloc s'affiche sans signature : jamais de libellé
« à renseigner » en public.

`getReadingMinutes()` calcule le temps de lecture (200 mots/min) depuis
`content.rendered` — pas de champ WP à créer. Sous 60 mots : rien n'est affiché.

Typographie : les titres de tribune sont en `font-serif` (Newsreader, déjà chargé
dans `layout.tsx`) **sauf en arabe** — Newsreader n'a pas de jeu arabe, `titleClasses()`
bascule alors sur la sans en `font-extrabold`. Toute nouvelle zone serif doit faire
de même.

RTL : le rail utilise les utilitaires logiques (`md:border-s`, `md:ps-8`), rien à
surcharger en arabe. Les flèches des libellés `oped.seeAll` / `oped.read` sont
dans les messages : `→` en FR/EN, `←` en AR.

Libellés : namespace `oped` de `messages/{fr,en,ar}.json` —
`eyebrow`, `title`, `seeAll`, `tag`, `readingTime` (ICU `{minutes}`), `read`,
`alsoSigned`, `empty`.

## Bibliothèque de ressources (`/bibliotheque`)

Source unique : le dossier d'équipe « Bibliotheque_itpc_mena » de la Dropbox
(catalogue `.xlsx` + PDF + couvertures). Le site ne copie rien : `src/lib/bibliotheque.ts`
lit le dossier (Dropbox en prod, `BIBLIO_LOCAL_DIR` en dev). Fiches indexables
`/{locale}/bibliotheque/[slug]`, PDF servis par le site sous `/bibliotheque/pdf/RES-xxx.pdf`
(cache disque sur le serveur aout.app, `.cache/bibliotheque/`), couvertures sous `/bibliotheque/couverture/RES-xxx.jpg` ; JSON-LD et
balises citation_* dans `src/lib/bibliothequeView.ts`. Libellés EN/AR des thématiques, types et pays : `src/lib/bibliothequeLabels.ts`.
Mise en place Dropbox, format du catalogue et gestion courante : `docs/bibliotheque/README.md`.

Header : 8 entrées depuis l'ajout de « Bibliothèque », la navigation desktop ne
s'affiche qu'à partir de `xl` (1280 px) ; en dessous, menu burger. Avant, elle
démarrait à `md` et les libellés se chevauchaient entre 768 et ~1200 px.
