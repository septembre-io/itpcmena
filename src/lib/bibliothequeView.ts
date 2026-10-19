// ---------------------------------------------------------------------------
// Bibliothèque — préparation de l'affichage (serveur) : libellés des pages,
// formats de date et de taille, éléments transmis à l'explorateur et
// données structurées schema.org. Partagé par la liste et les fiches.
// ---------------------------------------------------------------------------

import type { BiblioPublication } from "./bibliotheque";
import {
  COUNTRIES,
  LANG_NAMES,
  countryLabel,
  coverUrl,
  ficheHref,
  normKey,
  pdfUrl,
  themeLabel,
  typeLabel,
  type BiblioLocale,
} from "./bibliothequeLabels";
import { SITE_URL, LOGO_URL } from "./seo";

export type Loc = BiblioLocale;
export const asLoc = (l: string): Loc => (l === "en" || l === "ar" ? l : "fr");

export const BIBLIO_TEXT = {
  fr: {
    home: "Accueil",
    tag: "Ressources",
    title: "Bibliothèque",
    sub: "Rapports, études, guides et boîtes à outils produits par ITPC-MENA et ses partenaires sur le VIH, l'accès aux traitements et la santé dans la région. Chaque document est disponible dans les langues où il a été publié.",
    metaDescription:
      "Rapports, études et guides d'ITPC-MENA sur le VIH, l'accès aux traitements et la santé en Afrique du Nord et au Moyen-Orient.",
    searchPlaceholder: "Rechercher un titre, un pays, un thème…",
    allThemes: "Toutes les thématiques",
    type: "Type",
    lang: "Langue",
    country: "Pays",
    year: "Année",
    sort: "Trier",
    sortRecent: "Plus récents",
    sortOld: "Plus anciens",
    sortTitle: "Titre (A-Z)",
    all: "Tous",
    reset: "Réinitialiser",
    countNoun: { one: "publication", other: "publications" },
    empty: "Aucun document ne correspond à ces critères.",
    unavailable: "La bibliothèque est momentanément indisponible. Merci de réessayer un peu plus tard.",
    download: "Télécharger le PDF",
    pdf: "PDF",
    sizeUnit: "Mo",
    metaTitle: "Bibliothèque — ITPC MENA",
    back: "Toute la bibliothèque",
    published: "Publication",
    theme: "Thématique",
    countries: "Pays concernés",
    versions: "Versions disponibles",
    related: "Dans la même thématique",
    readMore: "Voir la fiche",
  },
  en: {
    home: "Home",
    tag: "Resources",
    title: "Library",
    sub: "Reports, studies, guides and toolkits produced by ITPC-MENA and its partners on HIV, access to treatment and health in the region. Each document is available in the languages in which it was published.",
    metaDescription:
      "ITPC-MENA reports, studies and guides on HIV, access to treatment and health in the Middle East and North Africa.",
    searchPlaceholder: "Search a title, a country, a topic…",
    allThemes: "All topics",
    type: "Type",
    lang: "Language",
    country: "Country",
    year: "Year",
    sort: "Sort",
    sortRecent: "Newest",
    sortOld: "Oldest",
    sortTitle: "Title (A-Z)",
    all: "All",
    reset: "Reset",
    countNoun: { one: "publication", other: "publications" },
    empty: "No document matches these filters.",
    unavailable: "The library is temporarily unavailable. Please try again later.",
    download: "Download the PDF",
    pdf: "PDF",
    sizeUnit: "MB",
    metaTitle: "Library — ITPC MENA",
    back: "Back to the library",
    published: "Published",
    theme: "Topic",
    countries: "Countries",
    versions: "Available versions",
    related: "On the same topic",
    readMore: "View details",
  },
  ar: {
    home: "الرئيسية",
    tag: "موارد",
    title: "المكتبة",
    sub: "تقارير ودراسات وأدلة وحقائب أدوات أعدّتها آي تي بي سي مينا وشركاؤها حول فيروس نقص المناعة البشرية والوصول إلى العلاج والصحة في المنطقة. كل وثيقة متاحة باللغات التي نُشرت بها.",
    metaDescription:
      "تقارير ودراسات وأدلة آي تي بي سي مينا حول فيروس نقص المناعة البشرية والوصول إلى العلاج والصحة في الشرق الأوسط وشمال أفريقيا.",
    searchPlaceholder: "ابحث عن عنوان أو بلد أو موضوع…",
    allThemes: "كل المواضيع",
    type: "النوع",
    lang: "اللغة",
    country: "البلد",
    year: "السنة",
    sort: "ترتيب",
    sortRecent: "الأحدث",
    sortOld: "الأقدم",
    sortTitle: "العنوان (أ-ي)",
    all: "الكل",
    reset: "إعادة تعيين",
    countNoun: { one: "منشور", other: "منشورات" },
    empty: "لا توجد وثيقة مطابقة لهذه المعايير.",
    unavailable: "المكتبة غير متاحة مؤقتًا. يرجى المحاولة لاحقًا.",
    download: "تحميل ملف PDF",
    pdf: "PDF",
    sizeUnit: "MB",
    metaTitle: "المكتبة — ITPC MENA",
    back: "العودة إلى المكتبة",
    published: "تاريخ النشر",
    theme: "الموضوع",
    countries: "البلدان المعنية",
    versions: "النسخ المتاحة",
    related: "في الموضوع نفسه",
    readMore: "عرض البطاقة",
  },
} as const;

const INTL: Record<Loc, string> = { fr: "fr-FR", en: "en-GB", ar: "ar-MA" };

export function dateLabel(p: BiblioPublication, loc: Loc): string {
  const { year, month, day } = p.date;
  if (!year) return "";
  const d = new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
  const opts: Intl.DateTimeFormatOptions = { timeZone: "UTC", year: "numeric" };
  if (month) opts.month = "long";
  if (month && day) opts.day = "numeric";
  return new Intl.DateTimeFormat(INTL[loc], opts).format(d);
}

/** Date ISO partielle (2025, 2025-03, 2025-03-07) pour schema.org. */
export function isoDate(p: BiblioPublication): string | undefined {
  const { year, month, day } = p.date;
  if (!year) return undefined;
  const pad = (n: number) => String(n).padStart(2, "0");
  return [String(year), month ? pad(month) : null, month && day ? pad(day) : null]
    .filter(Boolean)
    .join("-");
}

export function sizeLabel(bytes: number | null, loc: Loc): string | null {
  if (!bytes) return null;
  const mb = bytes / 1_000_000;
  const n = new Intl.NumberFormat(INTL[loc], {
    maximumFractionDigits: mb < 10 ? 1 : 0,
  }).format(Math.max(mb, 0.1));
  return `${n} ${BIBLIO_TEXT[loc].sizeUnit}`;
}

const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** Ordre de préférence des versions pour une page dans la langue `loc`. */
const langOrder = (loc: Loc): Loc[] => [loc, "fr", "en", "ar"];

/** Version mise en avant : langue de la page, sinon FR, EN, AR. */
export function primaryFile(p: BiblioPublication, loc: Loc) {
  return (
    langOrder(loc)
      .map((l) => p.files.find((f) => f.lang === l))
      .find(Boolean) ?? p.files[0]
  );
}

/** Titre et résumé dans la langue la plus proche de la page. */
export function localized(p: BiblioPublication, loc: Loc) {
  const primary = primaryFile(p, loc);
  const descLang =
    langOrder(loc).find((l) => p.descriptions[l]) ??
    (Object.keys(p.descriptions)[0] as Loc | undefined) ??
    loc;
  // Titre de la version dans la langue de la page, sinon titre traduit
  // (colonnes « Titre FR / EN / AR »), sinon titre de la version mise en avant.
  const own = p.titles[loc] ?? p.translatedTitles?.[loc];
  // Couverture de la version mise en avant (langue de la page), sinon la
  // plus proche : un document traduit montre la couverture de sa traduction.
  const coverId =
    (p.coverIds?.[primary.lang] ??
      langOrder(loc).map((x) => p.coverIds?.[x]).find(Boolean) ??
      p.coverId) ||
    null;
  return {
    coverId,
    title: own ?? primary.title,
    titleLang: (own ? loc : primary.lang) as Loc,
    description: p.descriptions[descLang] ?? "",
    descriptionLang: descLang,
  };
}

/** Résumé raccourci pour la balise meta description (~155 caractères). */
export function metaExcerpt(text: string, max = 155): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "")}…`;
}

/** Élément transmis à l'explorateur (liste filtrable). */
export function toItem(p: BiblioPublication, loc: Loc) {
  const primary = primaryFile(p, loc);
  const l = localized(p, loc);
  const haystack = fold(
    [
      ...p.files.map((f) => f.title),
      ...Object.values(p.translatedTitles ?? {}),
      ...Object.values(p.descriptions),
      ...(["fr", "en", "ar"] as Loc[]).flatMap((x) => [
        themeLabel(p.theme, x),
        typeLabel(p.type, x),
      ]),
      ...p.countries.flatMap((c) => [COUNTRIES[c]?.fr, COUNTRIES[c]?.en, COUNTRIES[c]?.ar]),
      p.date.year ? String(p.date.year) : "",
    ]
      .filter(Boolean)
      .join(" ")
  );
  return {
    key: p.key,
    slug: p.slug,
    theme: p.theme,
    themeSlug: themeSlug(p.theme),
    type: p.type,
    ...l,
    dateLabel: dateLabel(p, loc),
    year: p.date.year,
    sortKey: p.date.sortKey,
    countries: p.countries,
    files: p.files.map((f) => ({ id: f.id, lang: f.lang, size: sizeLabel(f.sizeBytes, loc) })),
    primaryId: primary.id,
    haystack,
  };
}

/** Valeur courte d'une thématique pour l'URL (?theme=…). */
export function themeSlug(theme: string): string {
  return normKey(theme)
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------- schema.org ----------

const abs = (path: string) => `${SITE_URL}${path}`;
export const ficheUrl = (p: BiblioPublication, loc: Loc) =>
  abs(`/${loc}${ficheHref(p.slug)}`);

const REPORT_TYPES = new Set([
  "rapport national",
  "rapport regional",
  "rapport de recherche",
  "rapport d'evaluation",
  "rapport annuel",
  "etude",
  "note de politique",
]);

const PUBLISHER = {
  "@type": "NGO",
  name: "ITPC-MENA",
  url: SITE_URL,
  logo: { "@type": "ImageObject", url: LOGO_URL },
};

/** Une publication (Report ou CreativeWork) avec ses fichiers par langue. */
export function publicationSchema(p: BiblioPublication, loc: Loc) {
  const l = localized(p, loc);
  return {
    "@context": "https://schema.org",
    "@type": REPORT_TYPES.has(normKey(p.type)) ? "Report" : "CreativeWork",
    "@id": `${ficheUrl(p, "fr")}#publication`,
    url: ficheUrl(p, loc),
    name: l.title,
    alternateName: Object.entries(p.titles)
      .filter(([lang]) => lang !== l.titleLang)
      .map(([, t]) => t),
    description: l.description || undefined,
    genre: typeLabel(p.type, loc),
    about: themeLabel(p.theme, loc),
    inLanguage: p.files.map((f) => f.lang),
    datePublished: isoDate(p),
    image: l.coverId ? abs(coverUrl(l.coverId)) : undefined,
    spatialCoverage: p.countries.map((c) => ({
      "@type": "Country",
      name: countryLabel(c, "en"),
    })),
    publisher: PUBLISHER,
    isAccessibleForFree: true,
    encoding: p.files.map((f) => ({
      "@type": "MediaObject",
      contentUrl: abs(pdfUrl(f.id)),
      encodingFormat: "application/pdf",
      inLanguage: f.lang,
      name: `${f.title} (${LANG_NAMES[f.lang]})`,
      contentSize: f.sizeBytes ? `${Math.round(f.sizeBytes / 1000)} KB` : undefined,
    })),
    isPartOf: { "@type": "CollectionPage", url: abs(`/${loc}/bibliotheque`) },
  };
}

/** Page liste : CollectionPage + ItemList des fiches. */
export function collectionSchema(pubs: BiblioPublication[], loc: Loc) {
  const t = BIBLIO_TEXT[loc];
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t.metaTitle,
    description: t.metaDescription,
    url: abs(`/${loc}/bibliotheque`),
    inLanguage: loc,
    publisher: PUBLISHER,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: pubs.length,
      itemListElement: pubs.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: ficheUrl(p, loc),
        name: localized(p, loc).title,
      })),
    },
  };
}

/**
 * Balises « citation_* » lues par Google Scholar pour les rapports de
 * recherche. L'auteur déclaré est l'organisation, faute de noms d'auteurs
 * dans le catalogue (colonne à ajouter si on veut mieux faire).
 */
export function citationMeta(p: BiblioPublication, loc: Loc): Record<string, string | string[]> {
  const primary = primaryFile(p, loc);
  const { year, month, day } = p.date;
  const date = year
    ? [year, month, month && day ? day : null].filter(Boolean).map(String).join("/")
    : undefined;
  const meta: Record<string, string | string[]> = {
    citation_title: localized(p, loc).title,
    citation_author: "ITPC-MENA",
    citation_publisher: "ITPC-MENA",
    citation_pdf_url: abs(pdfUrl(primary.id)),
    citation_language: primary.lang,
    citation_abstract_html_url: ficheUrl(p, loc),
  };
  if (date) meta.citation_publication_date = date;
  if (REPORT_TYPES.has(normKey(p.type))) meta.citation_technical_report_institution = "ITPC-MENA";
  return meta;
}
