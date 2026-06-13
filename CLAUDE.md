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

## Points d'attention

- Images WP : autoriser les domaines `itpcmena.org` et `i0.wp.com` dans `next.config.ts`
- CORS : vérifier les headers WP pour le domaine front
- Polylang : actif sur itpcmena.org — toujours passer `?lang={locale}` sur les endpoints REST `/wp/v2/posts`
- Programmes : données statiques dans `src/data/programmes.ts` — pas de CPT WP
