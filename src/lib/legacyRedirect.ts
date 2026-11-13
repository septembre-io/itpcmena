import { rateLimit } from "./rateLimit";

// ---------------------------------------------------------------------------
// Filet de sécurité pour les anciennes adresses d'articles WordPress.
//
// src/redirects.data.json couvre les articles de l'inventaire WP (règles exactes
// dans next.config.ts). Une ancienne adresse qui n'y figure pas (article absent de
// l'inventaire, variante de slug, page de pièce jointe /article/piece-jointe…)
// finissait en 404. Ici, avant le routage i18n, on cherche le slug dans
// WordPress et on redirige en 301 vers /{langue}/actualites/{slug}.
//
// Ne traite que les chemins sans préfixe de langue (/slug, /article/piece-jointe)
// ou à l'ancien préfixe Polylang (/language/en/slug) ; les routes du site et les
// archives (traitées dans next.config.ts) ne sont jamais concernées.
// ---------------------------------------------------------------------------

const WP_URL = process.env.NEXT_PUBLIC_WP_URL ?? "https://wphead.itpcmena.org";

type Lang = "fr" | "en" | "ar";
const LANGS = new Set<string>(["fr", "en", "ar"]);

/** Premiers segments servis par le site : jamais traités comme d'anciens articles. */
const SITE_SECTIONS = new Set([
  "actualites",
  "bibliotheque",
  "equipe",
  "financements",
  "la-region",
  "opinions",
  "partenaires",
]);

const LOOKUP_TIMEOUT_MS = 3000;
const TTL_FOUND_MS = 24 * 60 * 60 * 1000;
const TTL_MISSING_MS = 60 * 60 * 1000;
const TTL_ERROR_MS = 60 * 1000;
const CACHE_MAX = 2000;
// Garde-fou pour WordPress (et son pare-feu) : au plus 60 recherches par minute,
// tous visiteurs confondus ; au-delà, l'adresse suit son cours normal (404).
const LOOKUPS_PER_MINUTE = 60;

const cache = new Map<string, { target: string | null; expires: number }>();

function remember(key: string, target: string | null, ttl: number) {
  if (cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, { target, expires: Date.now() + ttl });
}

/** Slug tel que WordPress le connaît : sans U+FFFC (objet collé depuis Word) ni tiret de bord. */
function cleanSlug(slug: string): string {
  return slug.replace(/￼/g, "").replace(/^-+|-+$/g, "");
}

function decodeSegment(segment: string): string | null {
  try {
    return decodeURIComponent(segment);
  } catch {
    return null;
  }
}

/** Article WordPress portant ce slug, ou null. `undefined` si WordPress n'a pas répondu. */
async function findPost(
  slug: string,
  langHint: Lang | null,
): Promise<{ slug: string; lang: Lang } | null | undefined> {
  try {
    const res = await fetch(
      `${WP_URL}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_fields=slug,lang`,
      { cache: "no-store", signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS) },
    );
    if (!res.ok) return undefined;
    const posts: Array<{ slug?: string; lang?: string }> = await res.json();
    if (!Array.isArray(posts) || posts.length === 0) return null;
    const post = posts.find((p) => p.lang === langHint) ?? posts[0];
    if (!post.slug) return null;
    const lang = (LANGS.has(post.lang ?? "") ? post.lang : (langHint ?? "fr")) as Lang;
    return { slug: decodeSegment(post.slug) ?? post.slug, lang };
  } catch {
    return undefined;
  }
}

/**
 * Chemin de l'article correspondant à une ancienne adresse WordPress
 * (ex. « /fr/actualites/mon-article »), ou null si l'adresse n'en est pas une.
 */
export async function resolveLegacyArticle(pathname: string): Promise<string | null> {
  const raw = pathname.split("/").filter(Boolean);
  if (raw.length === 0 || raw.length > 4) return null;

  const segments: string[] = [];
  for (const s of raw) {
    const decoded = decodeSegment(s);
    if (decoded === null || decoded.length > 250) return null;
    segments.push(decoded);
  }

  let langHint: Lang | null = null;
  if (segments[0] === "language" && LANGS.has(segments[1] ?? "")) {
    langHint = segments[1] as Lang;
    segments.splice(0, 2);
  } else if (LANGS.has(segments[0])) {
    return null; // route du site : laissée au routage i18n
  }

  // /slug, ou /article/piece-jointe (page de pièce jointe : on vise l'article parent)
  if (segments.length === 0 || segments.length > 2) return null;
  if (SITE_SECTIONS.has(segments[0])) return null;
  const slug = cleanSlug(segments[0]);
  if (!slug) return null;

  const key = `${langHint ?? ""}:${slug}`;
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) return cached.target;

  if (!rateLimit("legacy-article-lookup", LOOKUPS_PER_MINUTE, 60_000)) return null;

  const post = await findPost(slug, langHint);
  if (post === undefined) {
    remember(key, null, TTL_ERROR_MS);
    return null;
  }
  const target = post ? `/${post.lang}/actualites/${post.slug}` : null;
  remember(key, target, post ? TTL_FOUND_MS : TTL_MISSING_MS);
  return target;
}
