// ---------------------------------------------------------------------------
// Menus de navigation v3, éditables dans WordPress (Apparence → Menus).
//
// Source cible : endpoint custom du mu-plugin
//   GET /wp-json/itpc/v1/menu?location=v3-header|v3-footer&lang=fr|en|ar
// qui renvoie les items du menu assigné à cet emplacement, pour la langue
// demandée (Polylang gère un menu par emplacement et par langue).
//
// Un item portant la classe CSS « cta » est rendu comme bouton d'action
// (le « Nous contacter » rouge). En cas d'absence/erreur → repli ci-dessous.
// ---------------------------------------------------------------------------

export interface MenuItem {
  label: string;
  url: string;
  target?: string;
  /** Item marqué comme bouton d'action (classe CSS « cta » côté WP). */
  cta?: boolean;
  children?: MenuItem[];
}

// ---------------------------------------------------------------------------
// Libellés de navigation localisés (FR / EN / AR) — source unique de vérité
// pour les replis. Le menu WordPress (Polylang) reste prioritaire quand il est
// disponible ; ces libellés ne servent que de repli, mais ils sont désormais
// traduits par langue au lieu de rester en français sur /en et /ar.
// ---------------------------------------------------------------------------
type Locale = "fr" | "en" | "ar";
const asLocale = (l: string): Locale => (l === "en" || l === "ar" ? l : "fr");

const NAV_LABELS: Record<string, Record<Locale, string>> = {
  about: { fr: "À propos", en: "About", ar: "من نحن" },
  region: { fr: "La région", en: "The region", ar: "المنطقة" },
  work: { fr: "Notre travail", en: "Our work", ar: "عملنا" },
  platforms: { fr: "Plateformes", en: "Platforms", ar: "منصّاتنا" },
  news: { fr: "Actualités", en: "News", ar: "الأخبار" },
  opinions: { fr: "Opinions", en: "Op-ed", ar: "رأي" },
  financements: { fr: "Opportunités", en: "Opportunities", ar: "الفرص" },
  contact: { fr: "Nous contacter", en: "Contact us", ar: "اتصل بنا" },
};

// Rétro-compat : certains composants importent encore ces maps.
export const newsLabel: Record<string, string> = { ...NAV_LABELS.news };
export const opinionsLabel: Record<string, string> = { ...NAV_LABELS.opinions };

/**
 * Repli header localisé : 5 entrées principales + sous-menu Actualités/Opinions
 * + le CTA « Nous contacter ». Les ancres pointent vers la home de la langue ;
 * « La région » / « Actualités » / « Opinions » sont de vraies routes localisées.
 */
export function getHeaderFallback(loc: string): MenuItem[] {
  const l = asLocale(loc);
  const t = (k: keyof typeof NAV_LABELS) => NAV_LABELS[k][l];
  return [
    { label: t("about"), url: `/${l}#apropos` },
    { label: t("region"), url: `/${l}/la-region` },
    { label: t("work"), url: `/${l}#travail` },
    { label: t("platforms"), url: `/${l}#plateformes` },
    {
      label: t("news"),
      url: `/${l}/actualites`,
      children: [
        { label: t("news"), url: `/${l}/actualites` },
        { label: t("opinions"), url: `/${l}/opinions` },
      ],
    },
    { label: t("financements"), url: `/${l}/financements` },
    {
      label: t("contact"),
      url: "mailto:contact@itpcmena.org",
      target: "_blank",
      cta: true,
    },
  ];
}

/** Repli footer localisé : colonne « Navigation ». */
export function getFooterFallback(loc: string): MenuItem[] {
  const l = asLocale(loc);
  const t = (k: keyof typeof NAV_LABELS) => NAV_LABELS[k][l];
  return [
    { label: t("about"), url: `/${l}#apropos` },
    { label: t("region"), url: `/${l}/la-region` },
    { label: t("work"), url: `/${l}#travail` },
    { label: t("platforms"), url: `/${l}#plateformes` },
    { label: t("news"), url: `/${l}/actualites` },
    { label: t("opinions"), url: `/${l}/opinions` },
    { label: t("financements"), url: `/${l}/financements` },
  ];
}

// Replis FR par défaut (valeur par défaut des props de composants ; les pages
// passent désormais la version localisée).
export const headerFallback: MenuItem[] = getHeaderFallback("fr");
export const footerFallback: MenuItem[] = getFooterFallback("fr");

interface RawMenuItem {
  label?: string;
  url?: string;
  target?: string;
  classes?: string[];
  children?: RawMenuItem[];
}

import { wpFetch } from "./wordpress";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL ?? "https://wphead.itpcmena.org";

function normalize(items: RawMenuItem[]): MenuItem[] {
  return items
    .filter((it) => it && it.label)
    .map((it) => ({
      label: it.label as string,
      url: it.url || "#",
      target: it.target || undefined,
      cta: Array.isArray(it.classes) && it.classes.includes("cta"),
      children:
        Array.isArray(it.children) && it.children.length
          ? normalize(it.children)
          : undefined,
    }));
}

/**
 * Récupère un menu WordPress par emplacement et langue.
 * Renvoie `fallback` si l'endpoint est absent, en erreur, ou renvoie une liste
 * vide (le menu reste toujours affiché).
 */
export async function getMenu(
  location: string,
  locale: string,
  fallback: MenuItem[]
): Promise<MenuItem[]> {
  try {
    const url = `${WP_URL}/wp-json/itpc/v1/menu?location=${encodeURIComponent(
      location
    )}&lang=${locale}`;
    const res = await wpFetch(url);
    if (!res) return fallback;
    const data = (await res.json()) as RawMenuItem[];
    if (!Array.isArray(data) || data.length === 0) return fallback;
    const items = normalize(data);
    return items.length ? items : fallback;
  } catch {
    return fallback;
  }
}
