// ---------------------------------------------------------------------------
// Appels & opportunités (« Financements ONG »)
//
// Source : catégorie WordPress « Appel d'offres » (ID FR 804, slug appel-doffres),
// qui regroupe les appels à consultant·e, appels à candidatures, offres d'emploi,
// appels d'offres et manifestations d'intérêt publiés par ITPC-MENA.
//
// Constat de terrain (juillet 2026) : ces contenus n'existent qu'en FRANÇAIS
// (0 post EN/AR côté Polylang). On fetch donc la catégorie de base sans `lang` ;
// le chrome de la page est localisé, mais les fiches restent en FR.
//
// On enrichit chaque post avec ses tags résolus (l'API ne renvoie que des IDs),
// séparés en deux familles suivant le chantier taxonomie :
//   - géo    : pays / région MENA
//   - thème  : pathologie, financement, propriété intellectuelle…
// et un `type` dérivé du titre (offre d'emploi, consultance, candidature…), qui
// n'est pas une taxonomie WP mais un axe de filtre utile pour un « job board ».
// ---------------------------------------------------------------------------

import {
  wpFetch,
  decodeSlug,
  stripHtml,
  type WPPost,
  type WPAppelFields,
} from "./wordpress";
import { fixUploadHosts } from "./content";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL ?? "https://wphead.itpcmena.org";

/** Catégorie « Appel d'offres » — ID FR de base (source unique de vérité). */
const APPELS_CATEGORY_ID = 804;

/**
 * Slugs des tags GÉOGRAPHIQUES (pays / région, versions FR — seule langue
 * présente sur ces contenus). Tout tag hors de cet ensemble est traité comme un
 * THÈME. Câblé en dur : la frontière géo/thème n'est pas exposée par l'API.
 */
const GEO_TAG_SLUGS = new Set([
  "maroc",
  "tunisie",
  "egypte-fr",
  "algerie",
  "liban",
  "mauritanie",
  "lybie",
  "jordanie",
  "syrie",
  "notre-region",
]);

/**
 * Type d'appel. Source de vérité : le champ ACF `appel_type` (mu-plugin
 * itpc-appels.php). À défaut (post non encore renseigné), on retombe sur
 * `deriveType()` qui devine d'après le titre. Ordre = priorité de classement.
 */
export type AppelType =
  | "emploi"
  | "consultance"
  | "offre"
  | "candidature"
  | "manifestation"
  | "subvention"
  | "autre";

export const APPEL_TYPE_LABELS: Record<
  AppelType,
  { fr: string; en: string; ar: string }
> = {
  emploi: { fr: "Offre d'emploi", en: "Job offer", ar: "عرض عمل" },
  consultance: { fr: "Consultance", en: "Consultancy", ar: "استشارة" },
  offre: { fr: "Appel d'offres", en: "Call for tenders", ar: "طلب عروض" },
  candidature: {
    fr: "Appel à candidatures",
    en: "Call for applications",
    ar: "دعوة لتقديم الطلبات",
  },
  manifestation: {
    fr: "Manifestation d'intérêt",
    en: "Expression of interest",
    ar: "إبداء الاهتمام",
  },
  subvention: {
    fr: "Subvention / financement",
    en: "Grant / funding",
    ar: "منحة / تمويل",
  },
  autre: { fr: "Opportunité", en: "Opportunity", ar: "فرصة" },
};

const APPEL_TYPE_KEYS: readonly AppelType[] = [
  "emploi",
  "consultance",
  "offre",
  "candidature",
  "manifestation",
  "subvention",
  "autre",
];

function isAppelType(v: string): v is AppelType {
  return (APPEL_TYPE_KEYS as readonly string[]).includes(v);
}

/** Décode les entités HTML courantes des titres/résumés WP. */
function decodeEntities(html: string): string {
  return html
    .replace(/&rsquo;|&#8217;|&#039;|&apos;/g, "'")
    .replace(/&lsquo;|&#8216;/g, "'")
    .replace(/&laquo;|&raquo;|&#8220;|&#8221;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;/g, "…")
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&#8230;/g, "…");
}

/**
 * Classe un appel par type d'après son intitulé. Purement heuristique (le titre
 * porte l'info, pas de champ WP dédié). Ordre volontaire : on teste d'abord les
 * signaux les plus spécifiques.
 */
function deriveType(plainTitle: string): AppelType {
  const t = plainTitle.toLowerCase();
  if (/offre d'emploi|recrute un|direction délég|chargé\.?e? de/.test(t)) {
    return "emploi";
  }
  if (/appel d'offres?|agence web|création de site|société.? de production/.test(t)) {
    return "offre";
  }
  if (/manifestation d'intérêt/.test(t)) {
    return "manifestation";
  }
  if (/consultant|consultance|consultation|prestataire|expert|traduction/.test(t)) {
    return "consultance";
  }
  if (/candidatures?|talents|participation|formation/.test(t)) {
    return "candidature";
  }
  if (/subvention|bourse|appel à projets?|financement de projet|appels? (à|de|aux) propositions?/.test(t)) {
    return "subvention";
  }
  return "autre";
}

export interface AppelOffre {
  id: number;
  slug: string;
  title: string; // HTML (rendu tel quel avec dangerouslySetInnerHTML)
  titlePlain: string; // texte nu (recherche, tri, alt)
  excerpt: string; // texte nu, tronqué par le rendu
  date: string; // ISO 8601
  img: string | null;
  type: AppelType;
  geo: string[]; // noms de tags géo
  themes: string[]; // noms de tags thème
  // Champs ACF (mu-plugin itpc-appels.php) — vides tant que non saisis.
  dateLimite: string | null; // 'YYYY-MM-DD' ou null
  open: boolean | null; // dérivé de dateLimite : true=ouvert, false=clos, null=sans échéance
  bailleur: string | null;
  url: string | null; // lien de candidature
  email: string | null; // email de candidature
}

interface WPTag {
  id: number;
  name: string;
  slug: string;
}

/** Réponse partielle de /wp/v2/posts pour cette page (champs restreints). */
type AppelRaw = Pick<
  WPPost,
  "id" | "slug" | "title" | "excerpt" | "date" | "jetpack_featured_media_url"
> & { tags?: number[]; itpc_appel?: WPAppelFields | null };

/** Ouvert / clos d'après la date limite (comparée à aujourd'hui, minuit). */
function computeOpen(dateLimite: string | null): boolean | null {
  if (!dateLimite) return null;
  const d = new Date(dateLimite);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d.getTime() >= today.getTime();
}

/**
 * Récupère et enrichit tous les appels de la catégorie 804.
 * 2 requêtes : les posts (per_page large, tout tient), puis les tags référencés
 * (résolus en une passe via ?include=). Renvoie [] en cas d'échec réseau.
 */
export async function getAppels(): Promise<AppelOffre[]> {
  const fields =
    "id,slug,title,excerpt,date,jetpack_featured_media_url,tags,itpc_appel";
  const url = `${WP_URL}/wp-json/wp/v2/posts?categories=${APPELS_CATEGORY_ID}&per_page=100&orderby=date&order=desc&_fields=${fields}`;
  const res = await wpFetch(url);
  if (!res) return [];

  let raw: AppelRaw[];
  try {
    raw = (await res.json()) as AppelRaw[];
  } catch {
    return [];
  }
  if (!Array.isArray(raw) || raw.length === 0) return [];

  // Résolution des tags (IDs → {name, slug}) en une seule requête.
  const tagIds = [...new Set(raw.flatMap((p) => p.tags ?? []))];
  const tagById = new Map<number, WPTag>();
  if (tagIds.length) {
    const tagUrl = `${WP_URL}/wp-json/wp/v2/tags?include=${tagIds.join(
      ","
    )}&per_page=100&_fields=id,name,slug`;
    const tagRes = await wpFetch(tagUrl);
    if (tagRes) {
      try {
        const tags = (await tagRes.json()) as WPTag[];
        for (const tag of tags) tagById.set(tag.id, tag);
      } catch {
        // pas de tags résolus → fiches sans chips, on continue
      }
    }
  }

  return raw.map((p) => {
    const titlePlain = decodeEntities(stripHtml(p.title.rendered));
    const geo: string[] = [];
    const themes: string[] = [];
    for (const id of p.tags ?? []) {
      const tag = tagById.get(id);
      if (!tag) continue;
      (GEO_TAG_SLUGS.has(tag.slug) ? geo : themes).push(
        decodeEntities(tag.name)
      );
    }

    // Champs ACF prioritaires ; repli heuristique quand non renseignés.
    const acf = p.itpc_appel ?? undefined;
    const type =
      acf?.type && isAppelType(acf.type) ? acf.type : deriveType(titlePlain);
    const dateLimite = acf?.dateLimite ? acf.dateLimite : null;

    return {
      id: p.id,
      slug: decodeSlug(p.slug),
      title: p.title.rendered,
      titlePlain,
      excerpt: decodeEntities(stripHtml(p.excerpt.rendered)),
      date: p.date,
      img: p.jetpack_featured_media_url || null,
      type,
      geo,
      themes,
      dateLimite,
      open: computeOpen(dateLimite),
      bailleur: acf?.bailleur ? acf.bailleur : null,
      url: acf?.url ? acf.url : null,
      email: acf?.email ? acf.email : null,
    };
  });
}

/** Options de filtre uniques (triées) déduites d'une liste d'appels. */
export function getAppelFacets(appels: AppelOffre[]) {
  const geo = new Set<string>();
  const themes = new Set<string>();
  const types = new Set<AppelType>();
  for (const a of appels) {
    a.geo.forEach((g) => geo.add(g));
    a.themes.forEach((t) => themes.add(t));
    types.add(a.type);
  }
  const collator = new Intl.Collator("fr");
  return {
    geo: [...geo].sort(collator.compare),
    themes: [...themes].sort(collator.compare),
    // Types dans l'ordre logique du board, pas alphabétique.
    types: APPEL_TYPE_KEYS.filter((t) => types.has(t)),
  };
}

/** Email → href mailto: ; une URL est renvoyée telle quelle. */
export function toMailto(email: string): string {
  const v = email.trim();
  return /^mailto:/i.test(v) ? v : `mailto:${v}`;
}

/**
 * Action « Postuler » principale : l'URL si présente, sinon l'email en mailto:,
 * sinon null (aucun bouton). Partagé carte + fiche + encart détail.
 */
export function appelApplyHref(a: {
  url: string | null;
  email: string | null;
}): string | null {
  if (a.url) return a.url;
  if (a.email) return toMailto(a.email);
  return null;
}

/** Document joint détecté dans le corps de l'article (TDR, cahier des charges…). */
export interface AppelAttachment {
  href: string;
  name: string;
  ext: string; // 'pdf' | 'docx' | 'xlsx' …
}

const FILE_EXT_RE = /\.(pdf|docx?|xlsx?|pptx?|zip|odt|odp|ods)(?:$|\?)/i;

/**
 * Extrait les liens fichiers du corps HTML (dédupliqués, hôtes uploads réécrits
 * vers wphead pour être servis). Le nom lisible dérive du nom de fichier.
 *
 * On ne retient que les fichiers hébergés par ITPC (uploads WP) : eux sont
 * servis de façon fiable. Les PDF externes (ex. site d'un bailleur, parfois en
 * 403) restent en lien dans le corps mais ne sont pas mis en avant comme
 * « document officiel » de l'appel.
 */
function extractAttachments(html: string): AppelAttachment[] {
  const fixed = fixUploadHosts(html);
  const re = /href="([^"]+)"/gi;
  const seen = new Set<string>();
  const out: AppelAttachment[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(fixed)) && out.length < 12) {
    const href = m[1];
    const extMatch = href.match(FILE_EXT_RE);
    if (!extMatch || seen.has(href)) continue;
    if (!href.startsWith(`${WP_URL}/wp-content/`)) continue; // uploads ITPC only
    seen.add(href);
    let base = (href.split("/").pop() || "document").split("?")[0];
    try {
      base = decodeURIComponent(base);
    } catch {
      // garde le basename brut
    }
    const name =
      base.replace(FILE_EXT_RE, "").replace(/[-_]+/g, " ").trim() || "Document";
    out.push({ href, name, ext: extMatch[1].toLowerCase() });
  }
  return out;
}

/** Champs appel prêts à afficher, extraits d'un post complet (page détail). */
export interface AppelInfo {
  type: AppelType;
  dateLimite: string | null;
  open: boolean | null;
  bailleur: string | null;
  url: string | null;
  email: string | null;
  attachments: AppelAttachment[];
}

/**
 * Construit les infos « appel » d'un post pour la page détail. Renvoie `null`
 * si le post n'est pas un appel (le mu-plugin ne renvoie `itpc_appel` que pour
 * la catégorie 804 ; absent = mu-plugin non déployé) → aucun encart affiché.
 */
export function appelFromPost(post: WPPost): AppelInfo | null {
  const acf = post.itpc_appel;
  if (!acf) return null;
  const titlePlain = decodeEntities(stripHtml(post.title.rendered));
  const type =
    acf.type && isAppelType(acf.type) ? acf.type : deriveType(titlePlain);
  const dateLimite = acf.dateLimite ? acf.dateLimite : null;
  return {
    type,
    dateLimite,
    open: computeOpen(dateLimite),
    bailleur: acf.bailleur ? acf.bailleur : null,
    url: acf.url ? acf.url : null,
    email: acf.email ? acf.email : null,
    attachments: extractAttachments(post.content?.rendered ?? ""),
  };
}
