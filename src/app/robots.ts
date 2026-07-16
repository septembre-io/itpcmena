import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// robots.txt du FRONT (www.itpcmena.org). Autorise l'exploration et pointe le
// sitemap. NB : le backend wphead.itpcmena.org doit, lui, être passé en noindex
// côté WordPress pour éviter le duplicate content (action serveur, hors front).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
