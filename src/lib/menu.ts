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

// Repli header : reproduit le menu d'origine (ancres de sections) + le CTA.
export const headerFallback: MenuItem[] = [
  { label: "À propos", url: "#apropos" },
  { label: "La région", url: "#region" },
  { label: "Notre travail", url: "#travail" },
  { label: "Plateformes", url: "#plateformes" },
  { label: "Actualités", url: "#actualites" },
  {
    label: "Nous contacter",
    url: "mailto:contact@itpcmena.org",
    target: "_blank",
    cta: true,
  },
];

// Repli footer : colonne « Navigation ».
export const footerFallback: MenuItem[] = [
  { label: "À propos", url: "#apropos" },
  { label: "La région", url: "/la-region" },
  { label: "Notre travail", url: "#travail" },
  { label: "Plateformes", url: "#plateformes" },
];

interface RawMenuItem {
  label?: string;
  url?: string;
  target?: string;
  classes?: string[];
  children?: RawMenuItem[];
}

import { wpFetchInit } from "./wordpress";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL ?? "https://itpcmena.org";

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
    const res = await fetch(url, wpFetchInit);
    if (!res.ok) return fallback;
    const data = (await res.json()) as RawMenuItem[];
    if (!Array.isArray(data) || data.length === 0) return fallback;
    const items = normalize(data);
    return items.length ? items : fallback;
  } catch {
    return fallback;
  }
}
