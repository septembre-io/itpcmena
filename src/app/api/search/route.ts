// ---------------------------------------------------------------------------
// Recherche de contenus — proxy interne vers WordPress (REST).
//
// Appelée en client par la page 404 (NotFoundSearch). On passe par une route
// interne plutôt que d'attaquer wphead.itpcmena.org depuis le navigateur : même
// origine → aucun souci de CORS, et l'URL du CMS n'est pas exposée côté client.
//
// Cherche dans les ARTICLES (post) — ce qui couvre actualités, opinions et
// appels/opportunités (tous rangés comme `post`). Chaque résultat pointe vers
// la fiche front /actualites/{slug}.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import { wpFetch, decodeSlug, stripHtml } from "@/lib/wordpress";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL ?? "https://itpcmena.org";

/** Décode les entités HTML courantes des titres WP. */
function decodeEntities(s: string): string {
  return s
    .replace(/&rsquo;|&#8217;|&#039;|&apos;/g, "'")
    .replace(/&laquo;|&raquo;|&#8220;|&#8221;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;|&#8230;/g, "…")
    .replace(/&#8211;|&ndash;/g, "–");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const lang = searchParams.get("lang") ?? "fr";

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const url =
    `${WP_URL}/wp-json/wp/v2/posts?search=${encodeURIComponent(q)}` +
    `&lang=${encodeURIComponent(lang)}&per_page=6&orderby=relevance` +
    `&_fields=id,slug,title`;

  const res = await wpFetch(url);
  if (!res) {
    return NextResponse.json([]);
  }

  try {
    const raw = (await res.json()) as Array<{
      slug: string;
      title: { rendered: string };
    }>;
    const items = Array.isArray(raw)
      ? raw.map((p) => ({
          slug: decodeSlug(p.slug),
          title: decodeEntities(stripHtml(p.title?.rendered ?? "")),
        }))
      : [];
    return NextResponse.json(items);
  } catch {
    return NextResponse.json([]);
  }
}
