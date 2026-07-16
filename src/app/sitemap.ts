import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo";
import { getAllPostSlugs } from "@/lib/wordpress";

// Sitemap du front. Toutes les routes stables × 3 langues (avec alternates
// hreflang), plus les articles récents par langue. Rafraîchi via ISR.
export const revalidate = 3600;

// Routes partagées entre les 3 langues (préfixe de langue ajouté ci-dessous).
const STATIC_PATHS: Array<{ path: string; priority: number }> = [
  { path: "", priority: 1 }, // accueil
  { path: "actualites", priority: 0.8 },
  { path: "financements", priority: 0.8 },
  { path: "opinions", priority: 0.7 },
  { path: "la-region", priority: 0.6 },
  { path: "partenaires", priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // Routes stables, une entrée par (chemin × langue), avec hreflang.
  for (const { path, priority } of STATIC_PATHS) {
    const suffix = path ? `/${path}` : "";
    const languages: Record<string, string> = {};
    for (const l of routing.locales) {
      languages[l] = `${SITE_URL}/${l}${suffix}`;
    }
    languages["x-default"] = `${SITE_URL}/${routing.defaultLocale}${suffix}`;

    for (const locale of routing.locales) {
      entries.push({
        url: `${SITE_URL}/${locale}${suffix}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority,
        alternates: { languages },
      });
    }
  }

  // Articles (actualités, opinions, appels — tous des posts), par langue.
  try {
    const posts = await getAllPostSlugs(100);
    for (const { slug, locale } of posts) {
      entries.push({
        url: `${SITE_URL}/${locale}/actualites/${slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  } catch {
    // sitemap partiel (routes stables) plutôt qu'échec total
  }

  return entries;
}
