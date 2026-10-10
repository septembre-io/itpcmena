// ---------------------------------------------------------------------------
// Libellés de la bibliothèque, partagés serveur / client.
//
// Le catalogue (classeur Excel déposé dans le dossier Dropbox de la
// bibliothèque) est saisi en français. Ces tables traduisent les valeurs
// connues des colonnes « Thématique », « Type de support » et les pays.
// Une valeur absente de la table s'affiche telle quelle : ajouter une
// thématique dans le catalogue ne casse rien, elle reste simplement en
// français tant que sa traduction n'est pas ajoutée ici.
// ---------------------------------------------------------------------------

export type BiblioLocale = "fr" | "en" | "ar";

type Dict = Record<string, Record<BiblioLocale, string>>;

/** Clé de comparaison : minuscules, sans accents ni espaces superflus. */
export function normKey(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’']/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function lookup(dict: Dict, value: string, locale: BiblioLocale): string {
  const hit = dict[normKey(value)];
  return hit ? hit[locale] : value;
}

const THEMES: Dict = {
  "veille communautaire et observatoires (forss)": {
    fr: "Veille communautaire et observatoires (FORSS)",
    en: "Community monitoring and observatories (FORSS)",
    ar: "الرصد المجتمعي والمراصد (FORSS)",
  },
  "acces aux soins, stigmatisation et droits": {
    fr: "Accès aux soins, stigmatisation et droits",
    en: "Access to care, stigma and rights",
    ar: "الوصول إلى الرعاية والوصم والحقوق",
  },
  "impact de la covid-19 et systemes de sante": {
    fr: "Impact de la COVID-19 et systèmes de santé",
    en: "COVID-19 impact and health systems",
    ar: "أثر كوفيد-19 والأنظمة الصحية",
  },
  "gouvernance, plaidoyer et financement": {
    fr: "Gouvernance, plaidoyer et financement",
    en: "Governance, advocacy and financing",
    ar: "الحوكمة والمناصرة والتمويل",
  },
  "education au traitement et acces aux medicaments": {
    fr: "Éducation au traitement et accès aux médicaments",
    en: "Treatment education and access to medicines",
    ar: "التثقيف العلاجي والوصول إلى الأدوية",
  },
  "evaluation et rapports d'activite": {
    fr: "Évaluation et rapports d'activité",
    en: "Evaluation and activity reports",
    ar: "التقييم وتقارير الأنشطة",
  },
  "propriete intellectuelle et acces aux medicaments": {
    fr: "Propriété intellectuelle et accès aux médicaments",
    en: "Intellectual property and access to medicines",
    ar: "الملكية الفكرية والوصول إلى الأدوية",
  },
};
// Variante saisie dans une version antérieure du catalogue.
THEMES["propriete intellectuelle et acces medicaments"] =
  THEMES["propriete intellectuelle et acces aux medicaments"];

const TYPES: Dict = {
  "boite a outils": { fr: "Boîte à outils", en: "Toolkit", ar: "حقيبة أدوات" },
  "rapport national": { fr: "Rapport national", en: "National report", ar: "تقرير وطني" },
  "rapport regional": { fr: "Rapport régional", en: "Regional report", ar: "تقرير إقليمي" },
  etude: { fr: "Étude", en: "Study", ar: "دراسة" },
  "rapport de recherche": { fr: "Rapport de recherche", en: "Research report", ar: "تقرير بحثي" },
  "note de politique": { fr: "Note de politique", en: "Policy brief", ar: "موجز سياسات" },
  guide: { fr: "Guide", en: "Guide", ar: "دليل" },
  "rapport d'evaluation": { fr: "Rapport d'évaluation", en: "Evaluation report", ar: "تقرير تقييم" },
  "rapport annuel": { fr: "Rapport annuel", en: "Annual report", ar: "تقرير سنوي" },
};

/** Pays reconnus dans les titres et descriptifs (clé = code ISO). */
export const COUNTRIES: Record<string, Record<BiblioLocale, string> & { match: RegExp }> = {
  MA: { fr: "Maroc", en: "Morocco", ar: "المغرب", match: /(?<!\p{L})(maroc|morocco)(?!\p{L})|المغرب/iu },
  EG: { fr: "Égypte", en: "Egypt", ar: "مصر", match: /(?<!\p{L})([eé]gypte|egypt)(?!\p{L})|مصر/iu },
  TN: { fr: "Tunisie", en: "Tunisia", ar: "تونس", match: /(?<!\p{L})(tunisie|tunisia)(?!\p{L})|تونس/iu },
  MR: { fr: "Mauritanie", en: "Mauritania", ar: "موريتانيا", match: /(?<!\p{L})(mauritanie|mauritania)(?!\p{L})|موريتانيا/iu },
  LB: { fr: "Liban", en: "Lebanon", ar: "لبنان", match: /(?<!\p{L})(liban|lebanon)(?!\p{L})|لبنان/iu },
  DZ: { fr: "Algérie", en: "Algeria", ar: "الجزائر", match: /(?<!\p{L})(alg[eé]rie|algeria)(?!\p{L})|الجزائر/iu },
  JO: { fr: "Jordanie", en: "Jordan", ar: "الأردن", match: /(?<!\p{L})(jordanie|jordan)(?!\p{L})|الأردن/iu },
};

export const LANG_NAMES: Record<BiblioLocale, string> = {
  fr: "Français",
  en: "English",
  ar: "العربية",
};

export const themeLabel = (v: string, l: BiblioLocale) => lookup(THEMES, v, l);
export const typeLabel = (v: string, l: BiblioLocale) => lookup(TYPES, v, l);
export const countryLabel = (code: string, l: BiblioLocale) =>
  COUNTRIES[code]?.[l] ?? code;

// ---------- URL publiques (stables, sous le domaine du site) ----------

/** PDF d'une version : /bibliotheque/pdf/RES-011.pdf */
export const pdfUrl = (id: string) => `/bibliotheque/pdf/${encodeURIComponent(id)}.pdf`;
/** Couverture : /bibliotheque/couverture/RES-011.jpg */
export const coverUrl = (id: string) =>
  `/bibliotheque/couverture/${encodeURIComponent(id)}.jpg`;
/** Fiche d'une publication, sans préfixe de langue (le Link next-intl l'ajoute). */
export const ficheHref = (slug: string) => `/bibliotheque/${slug}`;

// ---------- Filtres de la liste (partagés page serveur / explorateur) ----------

/** Filtres de la liste, tels qu'ils apparaissent dans l'URL (?theme=…&lang=…). */
export interface ExplorerFilters {
  q: string;
  theme: string;
  type: string;
  lang: string;
  country: string;
  year: string;
}

export const EMPTY_FILTERS: ExplorerFilters = {
  q: "",
  theme: "",
  type: "",
  lang: "",
  country: "",
  year: "",
};
