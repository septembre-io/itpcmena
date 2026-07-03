#!/usr/bin/env node
// Dump des publications de la Page Facebook ITPC-MENA via la Graph API.
// Pré-requis : un Page Access Token avec la permission pages_read_engagement
//   (voir étapes dans le message / README).
// Usage :
//   FB_TOKEN="EAAB...le_token..." node scripts/dump-facebook.mjs
// Sortie : facebook-posts.json (à la racine)
// Node 18+ requis (fetch global).

const TOKEN = process.env.FB_TOKEN;
const VERSION = process.env.FB_VERSION || "v22.0";
const TARGET = process.env.FB_PAGE || "me"; // "me" = la Page si le token est un Page Token
const GRAPH = `https://graph.facebook.com/${VERSION}`;

if (!TOKEN) {
  console.error("❌ Manque FB_TOKEN. Lance :  FB_TOKEN=\"...\" node scripts/dump-facebook.mjs");
  process.exit(1);
}

// Champs allégés par défaut (fiabilité). Mets FB_ENGAGEMENT=1 pour ajouter
// les compteurs réactions/commentaires/partages (plus lourd, parfois instable).
const ENGAGEMENT = process.env.FB_ENGAGEMENT === "1";
const FIELDS = [
  "id",
  "created_time",
  "message",
  "permalink_url",
  "status_type",
  "attachments{media_type,title,unshimmed_url}",
  ...(ENGAGEMENT ? ["shares", "comments.summary(true).limit(0)", "reactions.summary(true).limit(0)"] : []),
].join(",");
const PAGE_SIZE = process.env.FB_LIMIT || "50";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const strip = (s = "") => s.replace(/\s+/g, " ").trim();

// Résout la Page + son token de Page à partir du token fourni (user OU page).
async function resolvePage() {
  try {
    const r = await fetch(`${GRAPH}/me/accounts?fields=name,id,access_token&limit=100&access_token=${TOKEN}`);
    const j = await r.json();
    if (Array.isArray(j.data) && j.data.length) {
      const q = String(TARGET).toLowerCase();
      let pg = j.data.find(p => String(p.id) === q || (p.name || "").toLowerCase().includes(q));
      pg = pg || j.data[0];
      if (j.data.length > 1) {
        console.log("ℹ️  Pages détectées :", j.data.map(p => `${p.name} (${p.id})`).join(" | "));
        console.log(`   → utilisée : ${pg.name} (${pg.id}). Pour en choisir une autre : FB_PAGE="<nom ou id>"`);
      } else {
        console.log(`ℹ️  Page : ${pg.name} (${pg.id})`);
      }
      return { id: pg.id, token: pg.access_token || TOKEN };
    }
  } catch (e) { /* token déjà de type Page → on continue */ }
  return { id: TARGET, token: TOKEN };
}

async function main() {
  const { id: PAGE_ID, token: PAGE_TOKEN } = await resolvePage();
  let url = `${GRAPH}/${PAGE_ID}/published_posts?fields=${encodeURIComponent(FIELDS)}&limit=${PAGE_SIZE}&access_token=${PAGE_TOKEN}`;
  const posts = [];
  let page = 0;

  const save = async () => {
    const fs = await import("node:fs");
    fs.writeFileSync("facebook-posts.json", JSON.stringify(
      { generatedAt: new Date().toISOString(), pageId: PAGE_ID, count: posts.length, posts }, null, 2), "utf8");
  };

  while (url) {
    let json, attempt = 0;
    // réessais sur erreurs transitoires (#1, #2, #4, #17, #32, #613)
    while (true) {
      const res = await fetch(url);
      json = await res.json();
      const code = json.error?.code;
      if (!json.error) break;
      const transient = [1, 2, 4, 17, 32, 613].includes(code);
      if (transient && attempt < 5) {
        attempt++;
        const wait = 1500 * attempt;
        process.stdout.write(`\n   ⚠️ erreur #${code} — réessai ${attempt}/5 dans ${wait/1000}s…`);
        await sleep(wait);
        continue;
      }
      // erreur définitive (permission, etc.) ou trop de réessais
      console.error(`\n❌ Graph API: ${json.error.message} (code ${code})`);
      if (code === 10 || /pages_read_user_content/.test(json.error.message))
        console.error("   → Ajoute la permission pages_read_user_content puis régénère le token.");
      await save();
      console.log(`💾 ${posts.length} publications déjà récupérées sauvegardées dans facebook-posts.json`);
      process.exit(posts.length ? 0 : 1);
    }
    for (const p of json.data || []) {
      const att = p.attachments?.data?.[0];
      posts.push({
        id: p.id,
        date: (p.created_time || "").slice(0, 10),
        message: strip(p.message || ""),
        permalink: p.permalink_url || "",
        type: att?.media_type || p.status_type || "",
        link: att?.unshimmed_url || "",
        title: strip(att?.title || ""),
        ...(ENGAGEMENT ? {
          reactions: p.reactions?.summary?.total_count ?? null,
          comments: p.comments?.summary?.total_count ?? null,
          shares: p.shares?.count ?? 0,
        } : {}),
      });
    }
    page++;
    process.stdout.write(`\r→ ${posts.length} publications (page ${page})…   `);
    url = json.paging?.next || null;
    await sleep(300); // throttle léger
  }

  await save();
  console.log(`\n✅ facebook-posts.json écrit — ${posts.length} publications`);
}

main().catch((e) => { console.error("❌", e.message); process.exit(1); });
