// ---------------------------------------------------------------------------
// Helpers SEO — URL canonique du site, hreflang et fabrique de metadata.
//
// Site trilingue (fr/en/ar) sous préfixe de langue. On génère pour chaque page
// une balise canonical + les alternates hreflang (dont x-default) pour que
// Google relie correctement les versions linguistiques.
//
// SITE_URL : origine PUBLIQUE du front. En prod, définir NEXT_PUBLIC_SITE_URL =
// https://www.itpcmena.org (l'apex redirige en 308 vers www → www est canonique).
// ---------------------------------------------------------------------------

import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.itpcmena.org"
).replace(/\/$/, "");

// Image sociale par défaut (carte de partage) pour toute page sans visuel propre.
// À déposer sur le front : public/og-default.jpg (recommandé 1200×630, brandé ITPC).
export const DEFAULT_OG_IMAGE =
  process.env.NEXT_PUBLIC_OG_IMAGE ?? `${SITE_URL}/og-default.jpg`;

/** hreflang → locale OpenGraph. */
const OG_LOCALE: Record<string, string> = {
  fr: "fr_FR",
  en: "en_US",
  ar: "ar_AR",
};

function ogLocale(locale: string): string {
  return OG_LOCALE[locale] ?? "fr_FR";
}

/** Normalise un chemin « partagé entre langues » (sans préfixe de langue). */
function suffixOf(path: string): string {
  const clean = path.replace(/^\/+|\/+$/g, "");
  return clean ? `/${clean}` : "";
}

/**
 * Canonical + hreflang pour une page dont le CHEMIN est identique dans les 3
 * langues (home = "", "actualites", "la-region"…).
 */
export function localizedAlternates(locale: string, path: string) {
  const suffix = suffixOf(path);
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = `${SITE_URL}/${l}${suffix}`;
  }
  languages["x-default"] = `${SITE_URL}/${routing.defaultLocale}${suffix}`;
  return { canonical: `${SITE_URL}/${locale}${suffix}`, languages };
}

/**
 * Canonical + hreflang pour un ARTICLE, dont le slug diffère par langue.
 * `slugsByLocale` : { fr?: slug, en?: slug, ar?: slug } (inclure la langue
 * courante). Les langues sans traduction sont simplement omises.
 */
export function articleAlternates(
  locale: string,
  slugsByLocale: Partial<Record<string, string>>
) {
  const languages: Record<string, string> = {};
  for (const [l, slug] of Object.entries(slugsByLocale)) {
    if (slug) languages[l] = `${SITE_URL}/${l}/actualites/${slug}`;
  }
  const def = slugsByLocale[routing.defaultLocale];
  if (def) {
    languages["x-default"] = `${SITE_URL}/${routing.defaultLocale}/actualites/${def}`;
  }
  const current = slugsByLocale[locale];
  return {
    canonical: current
      ? `${SITE_URL}/${locale}/actualites/${current}`
      : undefined,
    languages,
  };
}

// Logo de l'organisation pour les données structurées.
// ⚠️ Hébergé sur wphead : à déplacer sur le front (public/) quand wphead passera
// en « Disallow » (sinon Google ne pourra plus le récupérer pour le schéma).
export const LOGO_URL =
  "https://wphead.itpcmena.org/wp-content/uploads/2020/01/Logo_ITPC.png";

interface MetaInput {
  locale: string;
  title: string;
  description: string;
  images?: string[];
}

/** Metadata complète d'une page « standard » (chemin partagé entre langues). */
export function pageMetadata(input: MetaInput & { path: string }): Metadata {
  const { canonical, languages } = localizedAlternates(input.locale, input.path);
  return buildMetadata(input, canonical, languages, "website");
}

/** Metadata complète d'un article (slug variable par langue). */
export function articleMetadata(
  input: MetaInput & { slugsByLocale: Partial<Record<string, string>> }
): Metadata {
  const { canonical, languages } = articleAlternates(
    input.locale,
    input.slugsByLocale
  );
  return buildMetadata(input, canonical, languages, "article");
}

function buildMetadata(
  input: MetaInput,
  canonical: string | undefined,
  languages: Record<string, string>,
  ogType: "website" | "article"
): Metadata {
  const imgUrls = input.images?.length ? input.images : [DEFAULT_OG_IMAGE];
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical, languages },
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonical,
      siteName: "ITPC-MENA",
      locale: ogLocale(input.locale),
      type: ogType,
      images: imgUrls.map((url) => ({ url })),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: imgUrls,
    },
  };
}

// ---------------------------------------------------------------------------
// Données structurées (JSON-LD)
// ---------------------------------------------------------------------------

/** L'organisation ITPC-MENA (à poser une fois, sur l'accueil). */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: "ITPC-MENA",
    alternateName:
      "International Treatment Preparedness Coalition — Middle East and North Africa",
    url: SITE_URL,
    logo: LOGO_URL,
    sameAs: ["https://www.facebook.com/itpcmena"],
    description:
      "Coalition internationale pour la préparation aux traitements — région Moyen-Orient et Afrique du Nord. Pour un accès équitable à la santé.",
    areaServed: "Middle East and North Africa",
  };
}

/** Un article (actualité, tribune ou appel) — schéma NewsArticle. */
export function articleSchema(opts: {
  url: string;
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  locale: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: { "@type": "WebPage", "@id": opts.url },
    headline: opts.headline.slice(0, 110),
    description: opts.description,
    image: opts.image ? [opts.image] : undefined,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    inLanguage: opts.locale,
    author: { "@type": "Organization", name: "ITPC-MENA", url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "ITPC-MENA",
      logo: { "@type": "ImageObject", url: LOGO_URL },
    },
  };
}

/** Fil d'Ariane (accueil → rubrique → page). */
export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}
