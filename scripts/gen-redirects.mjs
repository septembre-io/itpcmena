// Génère la table de redirections 301 depuis l'inventaire WordPress.
//
// Source de vérité : l'inventaire exporté du WP legacy, dans le projet d'analyse
// (`dev web/itpc/inventaire-wp/`). On lit les JSON d'analyse, on décide une cible
// par URL selon des règles simples, et on écrit src/redirects.data.json — consommé
// par next.config.ts (redirects()).
//
// Règles :
//   - Article (post)  -> /{locale}/actualites/{slug}   (le front résout par slug WP)
//   - Page            -> /{locale}                      (home du locale : filet anti-404)
//                        Les pages sont surtout des reliquats e-commerce (donation-*,
//                        donor-dashboard, causes, volunteers). Affiner à la main les
//                        quelques pages à vrai contenu (voir le champ `_titre`).
//
// Usage : node scripts/gen-redirects.mjs [chemin/vers/inventaire-wp]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INV =
  process.argv[2] ??
  "/Users/septembre/Documents/claude/Projects/dev web/itpc/inventaire-wp";
const OUT = path.join(__dirname, "..", "src", "redirects.data.json");

const LOCALES = new Set(["fr", "en", "ar"]);

/** Chemin propre : décodé, sans slash de tête/queue. */
function cleanPath(url) {
  let p;
  try {
    p = new URL(url).pathname;
  } catch {
    p = url;
  }
  try {
    p = decodeURIComponent(p);
  } catch {
    /* garde brut si décodage impossible */
  }
  return p.replace(/^\/+|\/+$/g, "");
}

/** Retire un préfixe Polylang `language/<lang>/` et renvoie [lang|null, reste]. */
function stripLangPrefix(p) {
  const m = p.match(/^language\/(fr|en|ar)\/(.*)$/);
  return m ? [m[1], m[2]] : [null, p];
}

function localeOf(item, prefixLang) {
  if (LOCALES.has(item.langue)) return item.langue;
  if (prefixLang) return prefixLang;
  return "fr"; // défaut Polylang
}

const seen = new Set();
const redirects = [];
let skipped = 0;

function add(source, destination, meta = {}) {
  // Next matche `source` sur le chemin entrant *percent-encodé* : on ré-encode
  // l'unicode (arabe) sinon la règle ne matche jamais. encodeURI préserve `/`
  // et l'ASCII (les slugs latins restent lisibles). La destination reste en
  // clair : Next l'encode pour l'en-tête Location.
  const src = encodeURI("/" + source.replace(/^\/+/, ""));
  if (src === destination || seen.has(src)) {
    skipped++;
    return;
  }
  seen.add(src);
  redirects.push({ source: src, destination, permanent: true, ...meta });
}

// --- Articles -------------------------------------------------------------
const posts = JSON.parse(
  fs.readFileSync(path.join(INV, "analysis_posts.json"), "utf8"),
);
for (const post of posts) {
  const raw = cleanPath(post.url);
  if (!raw) continue;
  const [prefixLang, rest] = stripLangPrefix(raw);
  const slug = rest.split("/").pop();
  if (!slug) continue;
  const locale = localeOf(post, prefixLang);
  add(raw, `/${locale}/actualites/${slug}`, { _type: "post" });
}

// --- Pages ----------------------------------------------------------------
const pages = JSON.parse(
  fs.readFileSync(path.join(INV, "analysis_pages.json"), "utf8"),
);
for (const page of pages) {
  const raw = cleanPath(page.url);
  if (!raw) continue; // homepage '/' -> apex, rien à faire
  const [prefixLang] = stripLangPrefix(raw);
  const locale = localeOf(page, prefixLang);
  add(raw, `/${locale}`, { _type: "page", _titre: page.titre ?? "" });
}

fs.writeFileSync(OUT, JSON.stringify(redirects, null, 2) + "\n");

const byType = redirects.reduce((a, r) => {
  a[r._type] = (a[r._type] ?? 0) + 1;
  return a;
}, {});
console.log(`Écrit ${redirects.length} redirections -> ${OUT}`);
console.log("  par type :", byType);
console.log("  ignorées (doublon/self) :", skipped);
