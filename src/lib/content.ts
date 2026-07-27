// ---------------------------------------------------------------------------
// Traitement du HTML d'article rendu par WordPress (content.rendered).
//
//  - fixUploadHosts : réécrit les liens fichiers de l'apex itpcmena.org (qui
//    redirige désormais vers Vercel → 308, fichiers cassés) vers l'hôte WP qui
//    sert réellement les uploads (NEXT_PUBLIC_WP_URL = wphead.itpcmena.org).
//  - buildToc : injecte un id sur chaque titre (h2–h4) et renvoie la table des
//    matières correspondante, pour une navigation par ancres dans la page.
// ---------------------------------------------------------------------------

const WP_URL = process.env.NEXT_PUBLIC_WP_URL ?? "https://wphead.itpcmena.org";

/**
 * Réécrit les URLs /wp-content/ pointant sur l'apex (itpcmena.org, avec ou sans
 * www, http ou https) vers l'hôte WordPress headless. Sans ça, PDF/DOCX joints
 * et images inline renvoient un 308 vers le front.
 */
export function fixUploadHosts(html: string): string {
  return html.replace(
    /https?:\/\/(?:www\.)?itpcmena\.org\/wp-content\//gi,
    `${WP_URL}/wp-content/`
  );
}

/** Décode les entités HTML courantes (pour le texte affiché de la ToC). */
function decodeEntities(html: string): string {
  return html
    .replace(/&rsquo;|&#8217;|&#039;|&apos;|&lsquo;|&#8216;/g, "'")
    .replace(/&laquo;|&raquo;|&#8220;|&#8221;|&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;|&#8230;/g, "…")
    .replace(/&#8211;|&ndash;|&#8212;|&mdash;/g, "–")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Slug d'ancre stable et sûr à partir d'un texte de titre. */
function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // diacritiques latins
    .replace(/[^a-z0-9؀-ۿ]+/g, "-") // garde l'arabe
    .replace(/^-+|-+$/g, "");
  return base || "section";
}

export interface TocItem {
  id: string;
  text: string;
  level: number; // 2, 3 ou 4
}

/**
 * Un paragraphe entièrement en gras et court est-il un titre de section ?
 * (pattern fréquent des appels WP : `<p><strong>Contexte :</strong></p>` au lieu
 * d'un vrai <h2>). Prudent pour éviter de prendre un gras d'emphase pour un titre.
 */
function looksLikeHeading(text: string): boolean {
  return (
    text.length >= 2 &&
    text.length <= 80 &&
    (text.endsWith(":") || text.split(/\s+/).length <= 7)
  );
}

/**
 * Ajoute un `id` à chaque titre du HTML et renvoie le HTML modifié + la liste
 * des titres (table des matières). Sont considérés comme titres : les <h2>–<h4>,
 * et les paragraphes entièrement en gras qui ressemblent à un intitulé de section
 * (traités comme niveau 2). Ids conservés s'ils existent, sinon dédupliqués.
 */
export function buildToc(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const used = new Set<string>();

  const uniqueId = (text: string): string => {
    let id = slugify(text);
    let unique = id;
    let n = 2;
    while (used.has(unique)) unique = `${id}-${n++}`;
    used.add(unique);
    return unique;
  };

  // Alternance : vrai titre h2–h4  |  paragraphe 100% gras (pseudo-titre).
  const RE =
    /<(h[2-4])\b([^>]*)>([\s\S]*?)<\/\1>|<p\b([^>]*)>\s*<(strong|b)>([\s\S]*?)<\/\5>\s*<\/p>/gi;

  const out = html.replace(
    RE,
    (
      match: string,
      hTag: string | undefined,
      hAttrs: string,
      hInner: string,
      pAttrs: string,
      boldTag: string,
      pInner: string
    ) => {
      const isHeading = Boolean(hTag);
      const inner = isHeading ? hInner : pInner;
      const text = decodeEntities(inner.replace(/<[^>]+>/g, ""));
      if (!text) return match;
      if (!isHeading && !looksLikeHeading(text)) return match;

      const level = isHeading ? Number(hTag!.slice(1)) : 2;
      let attrs = isHeading ? hAttrs : pAttrs || "";
      const existing = attrs.match(/\bid="([^"]+)"/i)?.[1];
      const id = existing || uniqueId(text);
      if (existing) used.add(existing);
      else attrs = `${attrs} id="${id}"`;

      toc.push({ id, text, level });
      return isHeading
        ? `<${hTag}${attrs}>${inner}</${hTag}>`
        : `<p${attrs}><${boldTag}>${pInner}</${boldTag}></p>`;
    }
  );

  return { html: out, toc };
}
