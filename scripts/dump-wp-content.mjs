#!/usr/bin/env node
// Dump complet des contenus ITPC-MENA depuis l'API REST WordPress.
// Usage : node scripts/dump-wp-content.mjs
// Sortie : wp-articles.json (à la racine) — articles, catégories, tags, traductions.
// Node 18+ requis (fetch global).

const BASE = process.env.WP_URL || "https://itpcmena.org";
const API = `${BASE}/wp-json/wp/v2`;
const LANGS = ["fr", "en", "ar"];

const stripHtml = (s = "") =>
  s.replace(/<[^>]*>/g, "").replace(/&#8217;|&rsquo;/g, "’")
   .replace(/&amp;/g, "&").replace(/&nbsp;|&#160;/g, " ")
   .replace(/&laquo;|&raquo;/g, "«").replace(/&hellip;/g, "…")
   .replace(/\s+/g, " ").trim();

// Pagination via l'en-tête X-WP-TotalPages (dispo pour un vrai client HTTP).
async function getAll(path, params = {}) {
  const out = [];
  let page = 1, totalPages = 1;
  do {
    const qs = new URLSearchParams({ per_page: "100", page: String(page), ...params });
    const res = await fetch(`${API}/${path}?${qs}`);
    if (!res.ok) {
      if (res.status === 400) break; // page au-delà du total
      throw new Error(`${path} p${page} → HTTP ${res.status}`);
    }
    totalPages = Number(res.headers.get("x-wp-totalpages") || "1");
    out.push(...(await res.json()));
    page++;
  } while (page <= totalPages);
  return out;
}

async function main() {
  console.log("→ Catégories…");
  const cats = await getAll("categories");
  const catMap = Object.fromEntries(cats.map((c) => [c.id, c.name]));

  console.log("→ Tags…");
  const tags = await getAll("tags").catch(() => []);
  const tagMap = Object.fromEntries(tags.map((t) => [t.id, t.name]));

  console.log("→ Articles (par langue)…");
  const byId = new Map();
  for (const lang of LANGS) {
    const posts = await getAll("posts", { lang });
    for (const p of posts) {
      if (byId.has(p.id)) continue;
      byId.set(p.id, {
        id: p.id,
        lang: p.lang || lang,
        date: (p.date || "").slice(0, 10),
        title: stripHtml(p.title?.rendered),
        slug: p.slug,
        url: p.link,
        status: p.status,
        categories: (p.categories || []).map((id) => catMap[id] || `#${id}`),
        categoryIds: p.categories || [],
        tags: (p.tags || []).map((id) => tagMap[id] || `#${id}`),
        translations: p.translations || {},
      });
    }
    console.log(`   ${lang}: ${posts.length} articles`);
  }

  const articles = [...byId.values()].sort((a, b) => (a.date < b.date ? 1 : -1));

  // Matrice de traduction : pour chaque article, présence + liens FR/EN/AR.
  const urlOf = (id) => byId.get(id)?.url || null;
  for (const a of articles) {
    const tr = a.translations || {};
    a.has = { fr: !!tr.fr, en: !!tr.en, ar: !!tr.ar };
    a.translationLinks = {
      fr: tr.fr ? urlOf(tr.fr) : null,
      en: tr.en ? urlOf(tr.en) : null,
      ar: tr.ar ? urlOf(tr.ar) : null,
    };
    a.translationCount = Object.keys(tr).length;
    a.fullyTranslated = a.has.fr && a.has.en && a.has.ar;
    // Clé de groupe (mêmes ids de traduction) pour repérer les relations.
    a.groupKey = Object.values(tr).sort((x, y) => x - y).join("-");
  }

  const out = {
    generatedAt: new Date().toISOString(),
    base: BASE,
    counts: {
      articles: articles.length,
      categories: cats.length,
      tags: tags.length,
      fr: articles.filter((a) => a.lang === "fr").length,
      en: articles.filter((a) => a.lang === "en").length,
      ar: articles.filter((a) => a.lang === "ar").length,
      fullyTranslated: articles.filter((a) => a.fullyTranslated).length,
    },
    categories: cats.map((c) => ({ id: c.id, name: c.name, slug: c.slug, count: c.count, parent: c.parent })),
    articles,
  };

  const fs = await import("node:fs");
  fs.writeFileSync("wp-articles.json", JSON.stringify(out, null, 2), "utf8");
  console.log("\n✅ wp-articles.json écrit");
  console.table(out.counts);
}

main().catch((e) => { console.error("❌", e.message); process.exit(1); });
