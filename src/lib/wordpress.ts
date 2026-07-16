export type PostLang = "fr" | "en" | "ar";

/**
 * Champs ACF « appel / financement » exposés par le mu-plugin itpc-appels.php
 * sous la clé `itpc_appel`. `null` hors de la catégorie « Appel d'offres » (804),
 * et absent si le mu-plugin n'est pas déployé.
 */
export interface WPAppelFields {
  type?: string;
  dateLimite?: string; // 'YYYY-MM-DD' ou ''
  bailleur?: string;
  url?: string; // lien de candidature
  email?: string; // email de candidature
}

export interface WPPost {
  id: number;
  slug: string; // URL-encoded in API response (e.g. %d8%aa%d8%ad...)
  date: string; // ISO 8601
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  featured_media: number;
  jetpack_featured_media_url: string; // direct i0.wp.com URL from Jetpack
  class_list: string[]; // includes "category--fr" / "category--ar" / "category--en"
  link: string; // canonical WP URL
  // Exposed by the itpc-polylang-rest mu-plugin (Polylang free):
  lang?: PostLang | null; // native Polylang language code
  translations?: Record<string, number>; // { "fr": 30065, "en": 30062, "ar": 30071 }
  itpc_appel?: WPAppelFields | null;
}

const WP_URL =
  process.env.NEXT_PUBLIC_WP_URL ?? "https://itpcmena.org";

/**
 * Options de fetch des données WordPress.
 * En dev : `no-store` → refetch à CHAQUE requête, donc une modif dans WP est
 * visible dès le rafraîchissement du navigateur (aucun redémarrage de dev server).
 * En prod : cache ISR 5 min (fraîcheur raisonnable ; passer à une revalidation à
 * la demande via webhook WordPress si besoin d'instantané).
 */
export const wpFetchInit: RequestInit =
  process.env.NODE_ENV === "development"
    ? { cache: "no-store" }
    : { next: { revalidate: 300 } };

const WP_TIMEOUT_MS = 8000;

/**
 * Fetch WordPress résilient.
 *
 * 1re tentative : mise en cache (revalidate 300 en prod → faible charge sur WP).
 * En cas d'échec (réseau, timeout, ou statut non-2xx — ex. blocage passager d'une
 * IP Vercel par le WAF Plesk), 2e tentative en `no-store` : on contourne un
 * éventuel cache empoisonné par ce hoquet et on relit l'état RÉEL de WP.
 *
 * Résultat : un hoquet ponctuel n'affecte au pire qu'une requête (auto-guérison)
 * au lieu de figer le fallback 5 min. Renvoie la Response OK, ou null si tout échoue.
 */
export async function wpFetch(url: string): Promise<Response | null> {
  const attempts: RequestInit[] = [wpFetchInit, { cache: "no-store" }];
  for (const init of attempts) {
    try {
      const res = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(WP_TIMEOUT_MS),
      });
      if (res.ok) return res;
    } catch {
      // on passe à la tentative suivante
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Detect a post's language.
 *
 * Primary source: the native `lang` field now exposed by the
 * itpc-polylang-rest mu-plugin. Falls back to the legacy class_list /
 * Unicode heuristic for posts not yet assigned a language in Polylang.
 */
export function getPostLang(post: WPPost): PostLang {
  if (post.lang === "fr" || post.lang === "en" || post.lang === "ar") {
    return post.lang;
  }
  const classes = post.class_list ?? [];
  if (classes.includes("category--ar")) return "ar";
  if (classes.includes("category--en")) return "en";
  // Heuristic: Arabic Unicode block in title → treat as AR
  if (/[؀-ۿ]/.test(post.title.rendered)) return "ar";
  return "fr";
}

/** Strip HTML tags — used to clean excerpts */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/** Locale-aware date formatter */
export function formatDate(dateString: string, locale: string): string {
  const localeMap: Record<string, string> = {
    ar: "ar-MA",
    en: "en-US",
    fr: "fr-FR",
  };
  return new Intl.DateTimeFormat(localeMap[locale] ?? "fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

/**
 * Decode a WP slug for use in Next.js hrefs.
 * WP REST API returns URL-encoded slugs; Next.js params are decoded.
 */
export function decodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

// ---------------------------------------------------------------------------
// Fetch functions
// ---------------------------------------------------------------------------

/**
 * Fetch posts for a specific locale.
 *
 * `?lang=` is now honored server-side by the itpc-polylang-rest mu-plugin,
 * so we request exactly the posts of this locale instead of over-fetching a
 * mixed pool and filtering by class_list.
 */
export async function getPosts(
  locale: string,
  perPage = 6
): Promise<WPPost[]> {
  try {
    const url = `${WP_URL}/wp-json/wp/v2/posts?lang=${locale}&per_page=${perPage}&orderby=date&order=desc`;
    const res = await wpFetch(url);
    if (!res) return [];
    return (await res.json()) as WPPost[];
  } catch {
    return [];
  }
}

/** Sections éditoriales exposées par le mu-plugin itpc-sections. */
export type PostSection = "actualites" | "blog";

/**
 * Fetch posts of an editorial section (category) for a specific locale.
 *
 * Uses the `?itpc_section=` filter exposed by the itpc-sections mu-plugin, which
 * resolves the section's category for the requested language (Polylang) and is
 * fail-closed: if the category isn't configured yet, it returns no post rather
 * than the whole archive. Only published posts are returned (drafts / pending
 * stay invisible until an Editor publishes them).
 */
export async function getSectionPosts(
  locale: string,
  section: PostSection,
  perPage = 6
): Promise<WPPost[]> {
  try {
    const url = `${WP_URL}/wp-json/wp/v2/posts?lang=${locale}&itpc_section=${section}&per_page=${perPage}&orderby=date&order=desc`;
    const res = await wpFetch(url);
    if (!res) return [];
    return (await res.json()) as WPPost[];
  } catch {
    return [];
  }
}

/**
 * Fetch a single post by slug.
 * Next.js passes decoded params (Arabic text), WP REST API ?slug= accepts decoded text.
 */
export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  try {
    const url = `${WP_URL}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}`;
    const res = await fetch(url, wpFetchInit);
    if (!res.ok) return null;
    const data: WPPost[] = await res.json();
    if (data.length > 0) return data[0];
    // Fallback: slug might be URL-encoded in DB — try re-encoding
    const url2 = `${WP_URL}/wp-json/wp/v2/posts?slug=${encodeURIComponent(encodeURIComponent(slug))}`;
    const res2 = await fetch(url2, wpFetchInit);
    if (!res2.ok) return null;
    const data2: WPPost[] = await res2.json();
    return data2[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * Fetch a WordPress *page* (not post) by slug. Pages share the WPPost shape
 * (title/content/translations…). Used to render institutional pages (e.g. « La
 * région ») inside the Next front instead of linking to the raw WordPress page.
 */
export async function getPageBySlug(slug: string): Promise<WPPost | null> {
  try {
    const url = `${WP_URL}/wp-json/wp/v2/pages?slug=${encodeURIComponent(slug)}`;
    const res = await fetch(url, wpFetchInit);
    if (!res.ok) return null;
    const data: WPPost[] = await res.json();
    return data[0] ?? null;
  } catch {
    return null;
  }
}

/** Fetch a WordPress page by ID (used to resolve a Polylang translation). */
export async function getPageById(id: number): Promise<WPPost | null> {
  try {
    const res = await fetch(`${WP_URL}/wp-json/wp/v2/pages/${id}`, wpFetchInit);
    if (!res.ok) return null;
    return (await res.json()) as WPPost;
  } catch {
    return null;
  }
}

/**
 * Resolve a WordPress page (by its base/FR slug) to the right Polylang
 * translation for the requested locale. Falls back to the base page when no
 * translation exists (e.g. EN missing → serves FR content).
 */
export async function resolveTranslatedPage(
  baseSlug: string,
  locale: string
): Promise<WPPost | null> {
  const base = await getPageBySlug(baseSlug);
  if (!base) return null;
  const baseLang = base.lang ?? "fr";
  if (locale !== baseLang) {
    const tid = base.translations?.[locale as PostLang];
    if (tid && tid !== base.id) {
      const translated = await getPageById(tid);
      if (translated) return translated;
    }
  }
  return base;
}

/**
 * Resolve a post's `translations` map ({ locale: postId }) into a map of
 * { locale: decodedSlug }, so the language switcher can link to the same
 * article in another language.
 *
 * The current post's own entry is skipped. Locales without a linked
 * translation simply don't appear in the result — the caller decides the
 * fallback (e.g. send the user to the localized /actualites list).
 */
export async function getTranslatedSlugs(
  post: WPPost
): Promise<Partial<Record<PostLang, string>>> {
  const translations = post.translations ?? {};
  const otherIds = Object.values(translations).filter((id) => id !== post.id);
  if (otherIds.length === 0) return {};

  try {
    const url = `${WP_URL}/wp-json/wp/v2/posts?include=${otherIds.join(
      ","
    )}&per_page=${otherIds.length}&_fields=id,slug,lang`;
    const res = await fetch(url, wpFetchInit);
    if (!res.ok) return {};
    const linked: Array<Pick<WPPost, "id" | "slug" | "lang">> =
      await res.json();

    const slugById = new Map(linked.map((p) => [p.id, decodeSlug(p.slug)]));
    const result: Partial<Record<PostLang, string>> = {};
    for (const [loc, id] of Object.entries(translations)) {
      if (id === post.id) continue;
      const slug = slugById.get(id);
      if (slug && (loc === "fr" || loc === "en" || loc === "ar")) {
        result[loc] = slug;
      }
    }
    return result;
  } catch {
    return {};
  }
}

/**
 * Recent post slugs per locale for generateStaticParams.
 *
 * One ?lang= request per locale → each post is pre-built under its own locale
 * route only (a French post → /fr/actualites/[slug]). Remaining posts SSR on
 * demand via ISR.
 */
export async function getAllPostSlugs(
  perPage = 20
): Promise<Array<{ slug: string; locale: string }>> {
  const locales: PostLang[] = ["fr", "en", "ar"];
  const results: Array<{ slug: string; locale: string }> = [];
  try {
    await Promise.all(
      locales.map(async (locale) => {
        const url = `${WP_URL}/wp-json/wp/v2/posts?lang=${locale}&per_page=${perPage}&orderby=date&order=desc&_fields=id,slug`;
        const res = await fetch(url, wpFetchInit);
        if (!res.ok) return;
        const posts: Array<Pick<WPPost, "id" | "slug">> = await res.json();
        for (const post of posts) {
          results.push({ slug: decodeSlug(post.slug), locale });
        }
      })
    );
    return results;
  } catch {
    return results;
  }
}
