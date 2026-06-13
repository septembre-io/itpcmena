export type PostLang = "fr" | "en" | "ar";

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
  yoast_head_json?: {
    og_image?: Array<{ url: string; width?: number; height?: number }>;
  };
}

const WP_URL =
  process.env.NEXT_PUBLIC_WP_URL ?? "https://itpcmena.org";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Detect post language from Polylang's class_list (e.g. "category--fr").
 * Falls back to Unicode range detection for Arabic titles.
 *
 * NOTE: Polylang's ?lang= REST param is unreliable on this site — both
 * ?lang=fr and ?lang=ar return the same mixed pool. class_list is the
 * authoritative source of truth.
 */
export function getPostLang(post: WPPost): PostLang {
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
 * Fetch posts filtered to a specific locale.
 *
 * Polylang's ?lang= param is unreliable on this site (returns the same mixed
 * pool regardless of locale). We fetch a larger pool and filter server-side
 * via getPostLang() which reads class_list + Unicode heuristic.
 */
const FETCH_POOL = 50;

export async function getPosts(
  locale: string,
  perPage = 6
): Promise<WPPost[]> {
  try {
    const url = `${WP_URL}/wp-json/wp/v2/posts?per_page=${FETCH_POOL}&orderby=date&order=desc`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data: WPPost[] = await res.json();
    return data
      .filter((post) => getPostLang(post) === (locale as PostLang))
      .slice(0, perPage);
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
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data: WPPost[] = await res.json();
    if (data.length > 0) return data[0];
    // Fallback: slug might be URL-encoded in DB — try re-encoding
    const url2 = `${WP_URL}/wp-json/wp/v2/posts?slug=${encodeURIComponent(encodeURIComponent(slug))}`;
    const res2 = await fetch(url2, { next: { revalidate: 3600 } });
    if (!res2.ok) return null;
    const data2: WPPost[] = await res2.json();
    return data2[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * Fetch recent post slugs for generateStaticParams.
 *
 * Each post is pre-built ONLY for its actual detected locale (class_list).
 * A French post → /fr/actualites/[slug] only. Other locales will SSR on demand.
 * This avoids generating /ar/actualites/french-article-slug etc.
 */
export async function getAllPostSlugs(): Promise<
  Array<{ slug: string; locale: string }>
> {
  try {
    // No ?lang= filter — Polylang param is unreliable; we detect lang ourselves
    const url = `${WP_URL}/wp-json/wp/v2/posts?per_page=30&orderby=date&order=desc`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const posts: WPPost[] = await res.json();

    const seen = new Set<string>();
    const results: Array<{ slug: string; locale: string }> = [];

    for (const post of posts) {
      const decoded = decodeSlug(post.slug);
      if (seen.has(decoded)) continue;
      seen.add(decoded);
      results.push({
        slug: decoded,
        locale: getPostLang(post), // only the real locale of this post
      });
    }

    return results;
  } catch {
    return [];
  }
}
