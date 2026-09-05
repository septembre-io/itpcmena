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
    const id = slugify(text);
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

// ---------------------------------------------------------------------------
// Fiches équipe : transformation du motif éditorial en cartes
// ---------------------------------------------------------------------------

/** Sépare « Hiba El Khamal — Directrice exécutive » en (nom, fonction). */
function splitNameRole(text: string): [string, string] {
  const t = text.replace(/\s+/g, " ").trim().replace(/[.,;]+$/, "");
  for (const sep of ["—", "–", "،", " - ", ","]) {
    const i = t.indexOf(sep);
    if (i > 0) {
      return [
        t.slice(0, i).trim().replace(/[,،]+$/, ""),
        t.slice(i + sep.length).trim().replace(/^[-–—,،\s]+/, ""),
      ];
    }
  }
  return [t, ""];
}

/** Nettoie le HTML inline hérité (spans de mise en forme, styles, ids). */
function cleanInline(html: string): string {
  return html
    .replace(/<\/?(?:span|font|div)\b[^>]*>/gi, "")
    .replace(/\s*(?:style|id|class|lang|title)="[^"]*"/gi, "")
    .replace(/<b\b[^>]*>/gi, "<strong>")
    .replace(/<\/b>/gi, "</strong>")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Aplatit le HTML en une suite de segments « en ligne ».
 *
 * Les collages WordPress (depuis Word, Google Docs, un autre CMS) imbriquent
 * les paragraphes dans des `<div>` sans profondeur fixe. Plutôt que d'analyser
 * un arbre, on remplace toute balise de bloc — ouvrante ou fermante — par un
 * séparateur : il ne reste que des segments de contenu, dans l'ordre, avec
 * leurs balises en ligne (strong, em, a, img…) intactes.
 */
const BLOCK_TAGS =
  /<\/?(?:div|section|article|p|h[1-6]|figure|figcaption|ul|ol|li|blockquote|table|tr|td)\b[^>]*>/gi;

function inlineSegments(html: string): string[] {
  return html
    .replace(BLOCK_TAGS, "\u0000")
    .split("\u0000")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Transforme le motif éditorial « photo → nom — fonction → bio » en cartes
 * `.equipe-membre` (grille photo / texte, stylée dans globals.css).
 *
 * C'est le motif que produit naturellement l'éditeur WordPress quand on colle
 * un texte : une image, un intitulé en gras, un ou plusieurs paragraphes. On
 * ne demande donc rien de particulier à la personne qui édite la page, et la
 * profondeur d'imbrication des conteneurs n'a aucune importance.
 *
 * Sécurités : la transformation est ignorée si le contenu utilise déjà des
 * blocs « Média et texte », et si elle ne détecte pas au moins deux membres
 * nommés, le HTML est renvoyé inchangé — jamais de page cassée par un contenu
 * inattendu.
 */
export function buildTeamCards(html: string): string {
  if (/wp-block-media-text|equipe-membre/.test(html)) return html;

  interface Member { img: string; name: string; role: string; bio: string[] }
  const members: Member[] = [];
  let cur: Member | null = null;

  for (const segment of inlineSegments(html)) {
    const img = segment.match(/<img[^>]*>/i);
    if (img) {
      cur = { img: img[0], name: "", role: "", bio: [] };
      members.push(cur);
      // un segment peut contenir l'image ET du texte : on poursuit dessus
    }
    const rest = segment.replace(/<img[^>]*>/gi, "");
    const text = rest
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!text || !cur) continue;
    if (!cur.name) {
      [cur.name, cur.role] = splitNameRole(text);
      continue;
    }
    cur.bio.push(`<p>${cleanInline(rest)}</p>`);
  }

  const named = members.filter((p) => p.name && p.img);
  if (named.length < 2) return html;

  return named
    .map(
      (p) =>
        `<div class="equipe-membre">` +
        `<figure class="equipe-photo">${p.img}</figure>` +
        `<div class="equipe-texte">` +
        // Nom et fonction sur une même ligne : la fonction est un span dans le
        // titre. Pas de `dir` ici — la ligne hérite du sens du parent (RTL en
        // arabe) et l'algorithme bidi place correctement un nom latin.
        `<h2 class="equipe-nom">${p.name}` +
        (p.role
          ? `<span class="equipe-fonction"> — ${p.role}</span>`
          : "") +
        `</h2>` +
        p.bio.join("") +
        `</div></div>`
    )
    .join("\n");
}
