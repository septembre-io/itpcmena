// ---------------------------------------------------------------------------
// Anciennes adresses de documents (site WordPress d'avant juillet 2026).
//
// Les PDF restent servis par wphead.itpcmena.org, mais des liens anciens
// (moteurs de recherche, sites partenaires, messageries) pointent encore vers
// itpcmena.org/wp-content/uploads/…, /IMG/… (SPIP) ou des variantes
// (/fr/wp-content/…, /dev/itpc-mena/…). Sans traitement, ces adresses
// aboutissent à une 404 du front.
//
// resolveAncienDocument() retrouve le fichier réel sur wphead, du plus strict au
// plus tolérant :
//   1. même chemin dans la médiathèque WordPress ;
//   2. fichier présent tel quel sur wphead (cas des documents SPIP hors médiathèque) ;
//   3. même dossier, nom à la casse et à la normalisation Unicode près
//      (fichiers déposés depuis un Mac : é = e + accent combinant) ;
//   4. même nom sans accents ;
//   5. même nom sans suffixe WordPress -1, -2… ;
//   6. nom sans extension : plus court fichier qui commence par ce nom (12 caractères min.).
// Les source_url de la médiathèque peuvent porter un ancien hôte (mnd.im/dev/…) :
// seul le chemin à partir de /wp-content/uploads/ est conservé.
// ---------------------------------------------------------------------------

const WP_URL = process.env.NEXT_PUBLIC_WP_URL ?? "https://wphead.itpcmena.org";
const UPLOADS = "/wp-content/uploads/";
const DAY = 86400;

type Media = { rel: string; encoded: string };

/** Chemins des fichiers « application » (PDF, DOCX…) de la médiathèque, relatifs à /wp-content/uploads/. */
async function getMediaFiles(): Promise<Media[]> {
  const out: Media[] = [];
  // Une page peut contenir moins de 100 éléments (pièces jointes non publiques) :
  // on suit le nombre de pages annoncé par WordPress plutôt que la taille des pages.
  let totalPages = 1;
  for (let page = 1; page <= Math.min(totalPages, 20); page++) {
    const res = await fetch(
      `${WP_URL}/wp-json/wp/v2/media?media_type=application&per_page=100&page=${page}&_fields=source_url`,
      { next: { revalidate: DAY } }
    );
    if (!res.ok) break;
    if (page === 1) totalPages = Number(res.headers.get("x-wp-totalpages")) || 1;
    const items: Array<{ source_url?: string }> = await res.json();
    for (const { source_url } of items) {
      if (!source_url) continue;
      const pathname = new URL(source_url).pathname;
      const i = pathname.indexOf(UPLOADS);
      if (i < 0) continue;
      const encoded = pathname.slice(i + UPLOADS.length);
      out.push({ rel: safeDecode(encoded), encoded });
    }
  }
  return out;
}

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

const nfc = (s: string) => s.normalize("NFC");
const lower = (s: string) => nfc(s).toLowerCase();
const ascii = (s: string) => s.normalize("NFD").replace(/\p{Mn}+/gu, "").toLowerCase();
const noSuffix = (s: string) => ascii(s).replace(/(?:-\d{1,2})+(\.[a-z0-9]{2,4})?$/i, "$1");
const dirOf = (p: string) => p.slice(0, p.lastIndexOf("/") + 1);
const baseOf = (p: string) => p.slice(p.lastIndexOf("/") + 1);
const encodePath = (rel: string) => rel.split("/").map(encodeURIComponent).join("/");
const toUrl = (encodedRel: string) => `${WP_URL}${UPLOADS}${encodedRel}`;

async function existsOnWp(rel: string): Promise<boolean> {
  try {
    const res = await fetch(toUrl(encodePath(rel)), { method: "HEAD", redirect: "manual", cache: "no-store" });
    const type = res.headers.get("content-type") ?? "";
    return res.status === 200 && !type.startsWith("text/html");
  } catch {
    return false;
  }
}

/**
 * Chemin relatif à /wp-content/uploads/ (décodé, sans slash de tête) -> URL exacte
 * du fichier sur wphead, ou null.
 */
export async function resolveAncienDocument(rel: string): Promise<string | null> {
  rel = nfc(rel.replace(/^\/+/, ""));
  if (!rel || rel.includes("\0") || /(^|\/)\.\.?(\/|$)/.test(rel)) return null;

  const media = await getMediaFiles().catch(() => [] as Media[]);

  // 1. Même chemin dans la médiathèque
  const same = media.find((m) => nfc(m.rel) === rel);
  if (same) return toUrl(same.encoded);

  // 2. Fichier présent tel quel sur wphead
  if (await existsOnWp(rel)) return toUrl(encodePath(rel));

  // 3 à 5. Même dossier, nom rapproché
  const wantedDir = ascii(dirOf(rel));
  const wanted = baseOf(rel);
  const candidates = media
    .filter((m) => ascii(dirOf(m.rel)) === wantedDir)
    .sort((a, b) => a.rel.length - b.rel.length || a.rel.localeCompare(b.rel));
  for (const key of [lower, ascii, noSuffix]) {
    const hit = candidates.find((m) => key(baseOf(m.rel)) === key(wanted));
    if (hit) return toUrl(hit.encoded);
  }

  // 6. Extension tronquée
  if (!/\.[a-z0-9]{2,4}$/i.test(wanted) && wanted.length >= 12) {
    const hit = candidates.find((m) => ascii(baseOf(m.rel)).startsWith(ascii(wanted)));
    if (hit) return toUrl(hit.encoded);
  }
  return null;
}
