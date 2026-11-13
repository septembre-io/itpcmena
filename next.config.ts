import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const withNextIntl = createNextIntlPlugin();

// Redirections 301 des anciennes URLs WordPress vers les routes du front v3.
// Table générée par scripts/gen-redirects.mjs depuis l'inventaire WP.
// (Les sources unicode/arabe sont percent-encodées par le générateur.)
const redirectData: Array<{ source: string; destination: string }> = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("./src/redirects.data.json", import.meta.url)),
    "utf8",
  ),
);

// Anciennes adresses WordPress sans équivalent un pour un (rapport « Erreur
// serveur (5xx) » de la Search Console, 13/11/2026) : anciennes pages d'accueil
// par langue et archives (catégories, étiquettes, auteurs, dates, pagination).
// Les adresses portant le paramètre de spam `ertthndxbcvs`
// (/language/en/?ertthndxbcvs=yespage/3page/3…) sont exclues et restent en 404.
// Les anciens articles absents de redirects.data.json sont rattrapés par
// src/lib/legacyRedirect.ts (appelé depuis src/proxy.ts).
const SPAM_QUERY = [{ type: "query" as const, key: "ertthndxbcvs" }];

type Lang = "fr" | "en" | "ar";

// Familles de catégories de l'ancien WordPress qui ont une rubrique équivalente
// (slugs relevés dans itpcmena-categories-et-appels.xlsx et la Search Console).
// Toute autre catégorie va vers la liste des actualités de la langue.
const ARCHIVE_FAMILIES: Array<{ section: string; slugs: Record<Lang, string[]> }> = [
  {
    section: "la-region",
    slugs: {
      fr: ["notre-region", "algerie", "algerie-fr", "egypte", "liban-2", "maroc-fr", "morocco-2", "morocco-2-fr", "tunisia-2", "tunisia-2-fr", "tunisie-2"],
      en: ["algeria", "egypt-2", "egypt-en", "egypt-en-our-region", "egypte-en", "liban-en", "maroc-en", "maroc-fr-en", "morocco", "tunisia", "tunisie-en"],
      ar: ["شمال-إفريقيا", "algerie-ar", "maroc-ar", "morocco-2-ar"],
    },
  },
  {
    section: "financements",
    slugs: {
      fr: ["appels-doffres", "appel-doffres", "appel", "appel-fr", "offre"],
      en: ["appels-doffres-en", "calls-for-tenders"],
      ar: ["دعوات-لتقديم-العطاءات"],
    },
  },
  {
    section: "opinions",
    slugs: { fr: ["opinion"], en: ["op-ed"], ar: ["مقال-رأي"] },
  },
  {
    section: "bibliotheque",
    slugs: { fr: ["biblioheque"], en: ["library"], ar: ["المكتبة", "مكتبة"] },
  },
];

/** Préfixe Polylang des anciennes adresses : rien en français, /language/xx sinon. */
const langPrefix = (lang: Lang) => (lang === "fr" ? "" : `/language/${lang}`);

const legacyRedirects = [
  // Anciennes pages d'accueil par langue
  { source: "/language/:lang(fr|en|ar)", destination: "/:lang" },
  // Catégories ayant une rubrique équivalente (sources percent-encodées, comme
  // dans redirects.data.json, sinon les slugs arabes ne matchent jamais)
  ...ARCHIVE_FAMILIES.flatMap(({ section, slugs }) =>
    (Object.keys(slugs) as Lang[]).flatMap((lang) =>
      slugs[lang].map((slug) => ({
        source: encodeURI(`${langPrefix(lang)}/category/${slug}`) + "/:rest*",
        destination: `/${lang}/${section}`,
      })),
    ),
  ),
  // Autres archives : liste des actualités de la langue
  { source: "/category/:rest*", destination: "/fr/actualites" },
  { source: "/tag/:rest*", destination: "/fr/actualites" },
  { source: "/author/:rest*", destination: "/fr/actualites" },
  { source: "/page/:n(\\d+)", destination: "/fr/actualites" },
  { source: "/news/page/:n(\\d+)", destination: "/fr/actualites" },
  { source: "/:year(\\d{4})/:month(\\d{2})/:rest*", destination: "/fr/actualites" },
  { source: "/language/:lang(fr|en|ar)/:kind(category|tag|author)/:rest*", destination: "/:lang/actualites" },
  { source: "/language/:lang(fr|en|ar)/page/:n(\\d+)", destination: "/:lang/actualites" },
  { source: "/language/:lang(fr|en|ar)/:year(\\d{4})/:month(\\d{2})/:rest*", destination: "/:lang/actualites" },
].map((rule) => ({ ...rule, missing: SPAM_QUERY, permanent: true }));

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "itpcmena.org" },
      { protocol: "https", hostname: "wphead.itpcmena.org" },
      { protocol: "https", hostname: "i0.wp.com" },
      { protocol: "https", hostname: "secure.gravatar.com" },
    ],
  },
  // Anciennes adresses de documents (WordPress, SPIP, recette) : réécrites vers la
  // route src/app/wp-content/uploads/[...path], qui redirige vers le fichier réel
  // sur wphead (voir src/lib/anciensDocuments.ts).
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/:locale(fr|en|ar)/wp-content/uploads/:path*", destination: "/wp-content/uploads/:path*" },
        { source: "/dev/itpc-mena/wp-content/uploads/:path*", destination: "/wp-content/uploads/:path*" },
        { source: "/IMG/:path*", destination: "/wp-content/uploads/IMG/:path*" },
        { source: "/dev/itpc-mena/IMG/:path*", destination: "/wp-content/uploads/IMG/:path*" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async redirects() {
    return [
      // Domaine canonique : itpcmena.org (sans www) -> https://www.itpcmena.org, en 301.
      // Règle provisoire, en attendant la redirection par nginx (vps-deploy) : une fois
      // celle-ci en place, les requêtes sans www n'atteignent plus l'app et ce bloc
      // peut être retiré. Exclus : ressources Next (_next), API, et anciennes adresses
      // de documents (redirigées directement vers wphead, en un seul saut).
      {
        source:
          "/:path((?!_next/|api/|wp-content/|IMG/|dev/itpc-mena/|fr/wp-content/|en/wp-content/|ar/wp-content/).*)",
        has: [{ type: "host" as const, value: "itpcmena.org" }],
        destination: "https://www.itpcmena.org/:path",
        statusCode: 301 as const,
      },
      ...legacyRedirects,
      ...redirectData.map(({ source, destination }) => ({
        source,
        destination,
        permanent: true,
      })),
    ];
  },
};

export default withNextIntl(nextConfig);
