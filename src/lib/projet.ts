// ---------------------------------------------------------------------------
// Pages projet (/{locale}/programmes/{slug}) : contenu éditable dans WordPress.
//
// Source : endpoint du mu-plugin scripts/itpc-projets.php
//   GET /wp-json/itpc/v1/projet?slug=lancer&lang=fr|en|ar
// (une page WP par langue, modèle « Page projet (site) », champs ACF fixes).
//
// Repli : un contenu typé par projet connu (src/data/lancer.ts). La fusion se
// fait champ par champ : une chaîne vide côté WP garde le texte du repli, une
// liste non vide côté WP remplace celle du repli. La page ne casse donc jamais,
// même avant la saisie ou si WordPress ne répond pas.
// ---------------------------------------------------------------------------

import { wpFetch } from "./wordpress";
import { lancerContent } from "@/data/lancer";

export type Locale = "fr" | "en" | "ar";
export type Accent = "red" | "amber" | "teal";
export type ProductionStatus =
  | "available"
  | "finalising"
  | "ongoing"
  | "testing"
  | "upcoming";

export interface Block {
  title: string;
  body: string;
}

export interface ProjetContent {
  meta: { title: string; description: string };
  /** Nom court affiché dans le fil d'Ariane. */
  shortName: string;
  hero: {
    eyebrow: string;
    title: string;
    lede: string;
    facts: Array<{ label: string; value: string }>;
  };
  context: { tag: string; title: string; paragraphs: string[] };
  targets: {
    tag: string;
    items: Array<{ accent: Accent; year: string; value: string; text: string }>;
  };
  approach: {
    tag: string;
    title: string;
    intro: string;
    steps: Block[];
    pillars: Block[];
  };
  governance: { tag: string; title: string; paragraphs: string[] };
  milestones: {
    tag: string;
    title: string;
    items: Array<{ done: boolean; date: string; text: string }>;
  };
  productions: {
    tag: string;
    title: string;
    intro: string;
    items: Array<{
      status: ProductionStatus;
      title: string;
      body: string;
      /** null = pas de bouton (jamais de lien « # »). */
      href: string | null;
      cta: string;
      note: string;
    }>;
  };
  learnings: { tag: string; title: string; source: string; items: Block[] };
  partners: { tag: string; items: string[] };
  contact: {
    title: string;
    body: string;
    cta: string;
    href: string;
    injectionPrompt: string;
    injectionLink: string;
    injectionHref: string;
  };
}

export const asLocale = (l: string): Locale =>
  l === "en" || l === "ar" ? l : "fr";

/** Libellés d'interface communs à toutes les pages projet (non éditables). */
export const PROJET_UI: Record<
  Locale,
  {
    breadcrumb: string;
    home: string;
    work: string;
    done: string;
    upcoming: string;
    open: string;
    status: Record<ProductionStatus, string>;
  }
> = {
  fr: {
    breadcrumb: "Fil d'Ariane",
    home: "Accueil",
    work: "Notre travail",
    done: "réalisé",
    upcoming: "à venir",
    open: "Consulter",
    status: {
      available: "Disponible",
      finalising: "En finalisation",
      ongoing: "En cours",
      testing: "En test",
      upcoming: "À venir",
    },
  },
  en: {
    breadcrumb: "Breadcrumb",
    home: "Home",
    work: "Our work",
    done: "done",
    upcoming: "upcoming",
    open: "Open",
    status: {
      available: "Available",
      finalising: "Being finalised",
      ongoing: "Ongoing",
      testing: "In testing",
      upcoming: "Coming soon",
    },
  },
  ar: {
    breadcrumb: "مسار التصفح",
    home: "الرئيسية",
    work: "عملنا",
    done: "مُنجز",
    upcoming: "قادم",
    open: "عرض",
    status: {
      available: "متاح",
      finalising: "قيد الإنهاء",
      ongoing: "جارٍ",
      testing: "قيد الاختبار",
      upcoming: "قريبًا",
    },
  },
};

const EMPTY: ProjetContent = {
  meta: { title: "", description: "" },
  shortName: "",
  hero: { eyebrow: "", title: "", lede: "", facts: [] },
  context: { tag: "", title: "", paragraphs: [] },
  targets: { tag: "", items: [] },
  approach: { tag: "", title: "", intro: "", steps: [], pillars: [] },
  governance: { tag: "", title: "", paragraphs: [] },
  milestones: { tag: "", title: "", items: [] },
  productions: { tag: "", title: "", intro: "", items: [] },
  learnings: { tag: "", title: "", source: "", items: [] },
  partners: { tag: "", items: [] },
  contact: {
    title: "",
    body: "",
    cta: "",
    href: "mailto:contact@itpcmena.org",
    injectionPrompt: "",
    injectionLink: "",
    injectionHref: "",
  },
};

/** Projets dotés d'un contenu de repli dans le code. */
const FALLBACKS: Record<string, (loc: Locale) => ProjetContent> = {
  lancer: lancerContent,
};

export const isProjetSlug = (s: string) => /^[a-z0-9-]{1,80}$/.test(s);

const WP_URL = process.env.NEXT_PUBLIC_WP_URL ?? "https://wphead.itpcmena.org";

/**
 * Fusion champ par champ, guidée par la forme du repli : chaîne vide ou absente
 * côté WP → repli ; liste vide ou absente → repli ; liste non vide → celle de WP.
 */
function merge<T>(base: T, over: unknown): T {
  if (Array.isArray(base)) {
    return (Array.isArray(over) && over.length > 0 ? over : base) as T;
  }
  if (base !== null && typeof base === "object") {
    const o =
      over !== null && typeof over === "object" && !Array.isArray(over)
        ? (over as Record<string, unknown>)
        : {};
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(base as Record<string, unknown>)) {
      out[k] = merge(v, o[k]);
    }
    return out as T;
  }
  if (typeof base === "string") {
    return (typeof over === "string" && over.trim() !== "" ? over : base) as T;
  }
  return (over ?? base) as T;
}

/** Contenu d'une page projet, ou null si le projet n'existe ni dans WP ni dans le code. */
export async function getProjet(
  slug: string,
  locale: string
): Promise<ProjetContent | null> {
  if (!isProjetSlug(slug)) return null;
  const loc = asLocale(locale);
  const fallback = FALLBACKS[slug]?.(loc) ?? EMPTY;

  let wp: unknown = null;
  try {
    const res = await wpFetch(
      `${WP_URL}/wp-json/itpc/v1/projet?slug=${slug}&lang=${loc}`
    );
    if (res) wp = await res.json();
  } catch {
    // WordPress indisponible : repli seul
  }

  const content = merge(fallback, wp);
  return content.hero.title ? content : null;
}

/** Slugs des pages projet (projets du code + pages publiées dans WP), pour le sitemap. */
export async function getProjetSlugs(): Promise<string[]> {
  const slugs = new Set(Object.keys(FALLBACKS));
  try {
    const res = await wpFetch(`${WP_URL}/wp-json/itpc/v1/projets`);
    const data: unknown = res ? await res.json() : null;
    if (Array.isArray(data)) {
      for (const s of data) {
        if (typeof s === "string" && isProjetSlug(s)) slugs.add(s);
      }
    }
  } catch {
    // liste des projets du code seulement
  }
  return [...slugs];
}
