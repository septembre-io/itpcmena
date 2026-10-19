// ---------------------------------------------------------------------------
// Bibliothèque de ressources — couche de données (serveur uniquement).
//
// Principe : UN SEUL emplacement de référence, le dossier « Bibliothèque
// ITPC MENA » de la Dropbox d'équipe. Il contient :
//   - le catalogue : un classeur .xlsx à la racine du dossier (une ligne par
//     fichier : ID, Thématique, Type de support, Titre, Descriptif, Langue,
//     Date de publication, Nom du fichier, Ref. image…) ;
//   - les PDF et les images de couverture, dans des sous-dossiers libres
//     (ils sont retrouvés par leur nom de fichier, où qu'ils soient).
// Le site ne stocke rien : il lit le catalogue et relaie couvertures et PDF
// sous ses propres URL (/bibliotheque/pdf/RES-011.pdf), mis en cache par le
// CDN ; seuls les PDF très lourds passent par un lien Dropbox temporaire.
// Fiches indexables : /{locale}/bibliotheque/{slug}. Remplacer un PDF
// ou corriger une ligne du catalogue dans Dropbox met le site à jour à la
// prochaine régénération de la page (ISR) et du cache mémoire (CACHE_MS).
//
// Deux sources possibles, choisies par variables d'environnement :
//   - Dropbox (production) : DROPBOX_APP_KEY, DROPBOX_REFRESH_TOKEN,
//     DROPBOX_BIBLIO_PATH (+ DROPBOX_APP_SECRET si l'application en a un) ;
//   - dossier local (développement) : BIBLIO_LOCAL_DIR.
// Voir docs/bibliotheque/README.md.
// ---------------------------------------------------------------------------

import { promises as fs } from "node:fs";
import path from "node:path";
import readXlsxFile from "read-excel-file/node";
import { COUNTRIES, normKey, type BiblioLocale } from "./bibliothequeLabels";

// ---------- Types publics (sérialisables, transmis au client) ----------

export interface BiblioFile {
  /** Identifiant catalogue (RES-014), utilisé dans l'URL /api/bibliotheque/fichier/RES-014 */
  id: string;
  lang: BiblioLocale;
  title: string;
  sizeBytes: number | null;
}

export interface BiblioDate {
  year: number | null;
  month: number | null;
  day: number | null;
  /** AAAA-MM-JJ, 00 pour les parties inconnues : sert au tri. */
  sortKey: string;
}

export interface BiblioPublication {
  /** Clé stable : ID de la première version. */
  key: string;
  theme: string;
  type: string;
  /** Descriptifs par langue ; `fr` est la colonne « Descriptif ». */
  descriptions: Partial<Record<BiblioLocale, string>>;
  /** Titres par langue, issus des versions disponibles. */
  titles: Partial<Record<BiblioLocale, string>>;
  /**
   * Titres traduits (colonnes « Titre FR / EN / AR ») pour les langues dans
   * lesquelles le document n'existe pas. Un titre de version reste prioritaire.
   */
  translatedTitles: Partial<Record<BiblioLocale, string>>;
  date: BiblioDate;
  countries: string[];
  files: BiblioFile[];
  /** ID dont la couverture existe (null si aucune). */
  coverId: string | null;
  /** Couverture de chaque version linguistique qui en a une (ID par langue). */
  coverIds: Partial<Record<BiblioLocale, string>>;
  /** Segment d'URL de la fiche : « res-011-indice-de-stigmatisation… ». */
  slug: string;
}

export interface BiblioCatalogue {
  publications: BiblioPublication[];
  /** Lignes du catalogue écartées, pour le diagnostic (jamais affichées). */
  warnings: string[];
}

// ---------- Sources de fichiers ----------

interface Entry {
  name: string;
  /** Chemin local ou identifiant Dropbox (id:…). */
  ref: string;
  size: number;
  depth: number;
}

interface Source {
  kind: "dropbox" | "local";
  list(): Promise<Entry[]>;
  read(e: Entry): Promise<Buffer>;
  /** URL de téléchargement (Dropbox) ou null (local : servir le contenu). */
  link(e: Entry): Promise<string | null>;
}

const nfc = (s: string) => s.normalize("NFC");

function localSource(root: string): Source {
  async function walk(dir: string, depth: number, out: Entry[]) {
    for (const d of await fs.readdir(dir, { withFileTypes: true })) {
      if (d.name.startsWith(".")) continue;
      const p = path.join(dir, d.name);
      if (d.isDirectory()) await walk(p, depth + 1, out);
      else if (d.isFile()) {
        const st = await fs.stat(p);
        out.push({ name: nfc(d.name), ref: p, size: st.size, depth });
      }
    }
  }
  return {
    kind: "local",
    async list() {
      const out: Entry[] = [];
      await walk(root, 0, out);
      return out;
    },
    read: (e) => fs.readFile(e.ref),
    link: async () => null,
  };
}

// --- Dropbox : jeton d'accès renouvelé à partir du jeton de rafraîchissement.

let dbxToken: { value: string; exp: number } | null = null;
let dbxRoot: string | null = null;

async function dropboxToken(): Promise<string> {
  if (dbxToken && Date.now() < dbxToken.exp) return dbxToken.value;
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: process.env.DROPBOX_REFRESH_TOKEN ?? "",
    client_id: process.env.DROPBOX_APP_KEY ?? "",
  });
  if (process.env.DROPBOX_APP_SECRET)
    body.set("client_secret", process.env.DROPBOX_APP_SECRET);
  const res = await fetch("https://api.dropboxapi.com/oauth2/token", {
    method: "POST",
    body,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Dropbox token ${res.status}`);
  const j = (await res.json()) as { access_token: string; expires_in: number };
  dbxToken = {
    value: j.access_token,
    exp: Date.now() + (j.expires_in - 120) * 1000,
  };
  return dbxToken.value;
}

/** Les en-têtes JSON de Dropbox doivent être en ASCII : on échappe le reste. */
const asciiJson = (o: unknown) =>
  JSON.stringify(o).replace(
    /[\u007f-￿]/g,
    (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0")
  );

async function dbx(
  endpoint: string,
  arg: unknown,
  host: "api" | "content" = "api"
): Promise<Response> {
  const token = await dropboxToken();
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  // Espace d'équipe : on se place à la racine de l'équipe pour que
  // DROPBOX_BIBLIO_PATH désigne le dossier d'équipe, pas l'espace personnel.
  if (dbxRoot)
    headers["Dropbox-API-Path-Root"] = asciiJson({ ".tag": "root", root: dbxRoot });
  let body: string | undefined;
  if (host === "content") headers["Dropbox-API-Arg"] = asciiJson(arg);
  else if (arg !== null) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(arg);
  }
  const res = await fetch(`https://${host}.dropboxapi.com/2/${endpoint}`, {
    method: "POST",
    headers,
    body,
    cache: "no-store",
  });
  if (!res.ok)
    throw new Error(`Dropbox ${endpoint} ${res.status}: ${await res.text()}`);
  return res;
}

function dropboxSource(folder: string): Source {
  // Profondeur d'un fichier = nombre de « / » au-delà de ceux du dossier racine
  // (0 = à la racine), ce qui évite de comparer des chemins accentués.
  const baseDepth = folder.replace(/\/+$/, "").split("/").length;
  type Item = {
    ".tag": string;
    name: string;
    id: string;
    size?: number;
    path_lower?: string;
  };
  type Page = { entries: Item[]; cursor: string; has_more: boolean };
  return {
    kind: "dropbox",
    async list() {
      if (!dbxRoot) {
        const acc = (await (await dbx("users/get_current_account", null)).json()) as {
          root_info?: { root_namespace_id?: string };
        };
        dbxRoot = acc.root_info?.root_namespace_id ?? null;
      }
      const out: Entry[] = [];
      let page = (await (
        await dbx("files/list_folder", { path: folder, recursive: true, limit: 2000 })
      ).json()) as Page;
      for (;;) {
        for (const it of page.entries) {
          if (it[".tag"] !== "file" || it.name.startsWith(".")) continue;
          out.push({
            name: nfc(it.name),
            ref: it.id,
            size: it.size ?? 0,
            depth: (it.path_lower ?? "").split("/").length - baseDepth - 1,
          });
        }
        if (!page.has_more) break;
        page = (await (
          await dbx("files/list_folder/continue", { cursor: page.cursor })
        ).json()) as Page;
      }
      return out;
    },
    async read(e) {
      const res = await dbx("files/download", { path: e.ref }, "content");
      return Buffer.from(await res.arrayBuffer());
    },
    async link(e) {
      const j = (await (
        await dbx("files/get_temporary_link", { path: e.ref })
      ).json()) as { link: string };
      return j.link;
    },
  };
}

function getSource(): Source | null {
  const {
    DROPBOX_REFRESH_TOKEN,
    DROPBOX_APP_KEY,
    DROPBOX_BIBLIO_PATH,
    BIBLIO_LOCAL_DIR,
  } = process.env;
  if (DROPBOX_REFRESH_TOKEN && DROPBOX_APP_KEY && DROPBOX_BIBLIO_PATH)
    return dropboxSource(DROPBOX_BIBLIO_PATH);
  if (BIBLIO_LOCAL_DIR) return localSource(BIBLIO_LOCAL_DIR);
  return null;
}

// ---------- Lecture du catalogue ----------

type Cell = string | number | boolean | Date | null;

/** « Titre FR », « Titre (EN) »… : titres traduits, distincts de « Titre du document ». */
const TITLE_LANG = /^titre\s*\(?(fr|en|ar)\)?$/;

/** Colonnes reconnues par leur en-tête (casse et accents ignorés). */
const COLUMNS = {
  id: (h: string) => h === "id" || h.startsWith("id ") || h.startsWith("id("),
  theme: (h: string) => h.startsWith("thematique"),
  type: (h: string) => h.startsWith("type"),
  title: (h: string) => h.startsWith("titre") && !TITLE_LANG.test(h),
  titleFr: (h: string) => TITLE_LANG.test(h) && /fr/.test(h),
  titleEn: (h: string) => TITLE_LANG.test(h) && /en/.test(h),
  titleAr: (h: string) => TITLE_LANG.test(h) && /ar/.test(h),
  descFr: (h: string) =>
    h === "descriptif" || h === "descriptif fr" || h === "descriptif (fr)",
  descEn: (h: string) => /^descriptif\s*\(?(en|anglais)/.test(h),
  descAr: (h: string) => /^descriptif\s*\(?(ar|arabe)/.test(h),
  lang: (h: string) => h.startsWith("langue"),
  date: (h: string) => h.startsWith("date"),
  file: (h: string) => h.startsWith("nom du fichier") || h === "fichier",
  cover: (h: string) =>
    h.startsWith("ref. image") || h.startsWith("ref image") || h === "couverture",
  group: (h: string) => h === "publication" || h.startsWith("groupe"),
  countries: (h: string) => h === "pays",
  diffusion: (h: string) => h.startsWith("diffusion") || h.startsWith("niveau de diffusion"),
};
type Col = keyof typeof COLUMNS;

const LANGS: Record<string, BiblioLocale> = {
  francais: "fr",
  french: "fr",
  fr: "fr",
  anglais: "en",
  english: "en",
  en: "en",
  arabe: "ar",
  arabic: "ar",
  ar: "ar",
  "العربية": "ar",
};

const MONTHS: Record<string, number> = {
  janvier: 1, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6,
  juillet: 7, aout: 8, septembre: 9, octobre: 10, novembre: 11, decembre: 12,
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

function parseDate(v: Cell): BiblioDate {
  let y: number | null = null;
  let m: number | null = null;
  let d: number | null = null;
  if (v instanceof Date) {
    y = v.getUTCFullYear();
    m = v.getUTCMonth() + 1;
    d = v.getUTCDate();
  } else if (typeof v === "number" && v >= 1900 && v <= 2100) {
    y = v;
  } else if (v != null) {
    const s = normKey(String(v));
    const iso = s.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
    if (iso) {
      y = +iso[1];
      m = +iso[2];
      d = iso[3] ? +iso[3] : null;
    } else {
      const yy = s.match(/(19|20)\d{2}/);
      if (yy) y = +yy[0];
      for (const [name, num] of Object.entries(MONTHS))
        if (new RegExp(`(^|\\s)${name}(\\s|$)`).test(s)) m = num;
      const dd = s.match(/^(\d{1,2})(er)?\s/);
      if (dd && m) d = +dd[1];
    }
  }
  const p = (n: number | null, w: number) => String(n ?? 0).padStart(w, "0");
  return { year: y, month: m, day: d, sortKey: `${p(y, 4)}-${p(m, 2)}-${p(d, 2)}` };
}

const str = (v: Cell) => (v == null ? "" : String(v).replace(/\s+/g, " ").trim());
/** « Observatoire communautaire FORSS – » : tiret final orphelin retiré. */
const stripTrailingDash = (s: string) => s.replace(/\s*[–—-]\s*$/, "");

interface Row {
  id: string;
  theme: string;
  type: string;
  title: string;
  titleFr: string;
  titleEn: string;
  titleAr: string;
  descFr: string;
  descEn: string;
  descAr: string;
  lang: BiblioLocale;
  date: BiblioDate;
  file: string;
  cover: string;
  group: string;
  countries: string;
}

async function readCatalogue(
  src: Source,
  entries: Entry[]
): Promise<{ rows: Row[]; warnings: string[] }> {
  // Plusieurs classeurs possibles à la racine : on prend le premier qui a les
  // colonnes ID, Titre et Nom du fichier, en essayant d'abord ceux dont le nom
  // contient « catalogue ».
  const candidates = entries
    .filter((e) => e.depth === 0 && /\.xlsx$/i.test(e.name) && !e.name.startsWith("~$"))
    .sort(
      (a, b) => Number(/catalogue/i.test(b.name)) - Number(/catalogue/i.test(a.name))
    );
  let data: Cell[][] = [];
  let col: Partial<Record<Col, number>> = {};
  for (const c of candidates) {
    const sheets = (await readXlsxFile(await src.read(c))) as unknown as {
      sheet: string;
      data: Cell[][];
    }[];
    const rows = sheets[0]?.data ?? [];
    const header = (rows[0] ?? []).map((h) => normKey(str(h)));
    const found: Partial<Record<Col, number>> = {};
    for (const [k, test] of Object.entries(COLUMNS)) {
      const i = header.findIndex(test);
      if (i >= 0) found[k as Col] = i;
    }
    if (found.id !== undefined && found.title !== undefined && found.file !== undefined) {
      data = rows;
      col = found;
      break;
    }
  }
  if (!data.length) throw new Error("Aucun catalogue .xlsx valide à la racine du dossier");
  const get = (r: Cell[], k: Col): Cell =>
    col[k] === undefined ? null : r[col[k] as number] ?? null;

  const warnings: string[] = [];
  const rows: Row[] = [];
  for (const r of data.slice(1)) {
    const id = str(get(r, "id"));
    if (!id) continue;
    // Colonne « Diffusion » facultative : seules les lignes vides ou « public »
    // sont publiées sur le site (interne / partenaires restent hors ligne).
    const diffusion = normKey(str(get(r, "diffusion")));
    if (diffusion && diffusion !== "public") continue;
    const title = stripTrailingDash(str(get(r, "title")));
    if (!title) {
      warnings.push(`${id} : titre vide`);
      continue;
    }
    rows.push({
      id,
      theme: str(get(r, "theme")),
      type: str(get(r, "type")),
      title,
      titleFr: str(get(r, "titleFr")),
      titleEn: str(get(r, "titleEn")),
      titleAr: str(get(r, "titleAr")),
      descFr: str(get(r, "descFr")),
      descEn: str(get(r, "descEn")),
      descAr: str(get(r, "descAr")),
      lang: LANGS[normKey(str(get(r, "lang")))] ?? "fr",
      date: parseDate(get(r, "date")),
      file: nfc(str(get(r, "file"))),
      cover: nfc(str(get(r, "cover"))),
      group: str(get(r, "group")),
      countries: str(get(r, "countries")),
    });
  }
  return { rows, warnings };
}

// ---------- Assemblage ----------

interface Resolved {
  catalogue: BiblioCatalogue;
  files: Map<string, Entry>;
  covers: Map<string, Entry>;
  source: Source;
}

const LANG_ORDER: BiblioLocale[] = ["fr", "en", "ar"];
const IMG = /\.(jpe?g|png|webp)$/i;

function detectCountries(text: string, explicit: string): string[] {
  if (explicit) {
    const wanted = explicit
      .split(/[;,/]/)
      .map((s) => normKey(s))
      .filter(Boolean);
    return Object.entries(COUNTRIES)
      .filter(([code, c]) =>
        wanted.some(
          (w) => w === code.toLowerCase() || w === normKey(c.fr) || w === normKey(c.en)
        )
      )
      .map(([code]) => code);
  }
  return Object.entries(COUNTRIES)
    .filter(([, c]) => c.match.test(text))
    .map(([code]) => code);
}

/**
 * Segment d'URL d'une publication : l'ID (stable, fait foi) suivi du titre
 * français, ou à défaut anglais, translittéré. Le titre ne sert qu'au
 * référencement : une fiche est retrouvée par son ID même si le titre change
 * (redirection vers le segment à jour, voir findPublication).
 */
function slugFor(id: string, list: Row[]): string {
  const latin =
    list.find((r) => r.lang === "fr")?.title ?? list.find((r) => r.lang === "en")?.title ?? "";
  const words = normKey(latin)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .split("-")
    .filter(Boolean);
  let tail = "";
  for (const w of words) {
    if ((tail + "-" + w).length > 75) break;
    tail = tail ? `${tail}-${w}` : w;
  }
  return [id.toLowerCase(), tail].filter(Boolean).join("-");
}

async function build(): Promise<Resolved | null> {
  const src = getSource();
  if (!src) return null;
  const entries = await src.list();
  const { rows, warnings } = await readCatalogue(src, entries);

  const byName = new Map<string, Entry>();
  for (const e of entries) byName.set(e.name.toLowerCase(), e);
  const findById = (id: string, test: (n: string) => boolean) =>
    entries.find(
      (e) => test(e.name) && e.name.toLowerCase().startsWith(id.toLowerCase())
    );

  const files = new Map<string, Entry>();
  const covers = new Map<string, Entry>();
  const groups = new Map<string, Row[]>();

  for (const row of rows) {
    const pdf =
      (row.file && byName.get(row.file.toLowerCase())) ||
      findById(row.id, (n) => /\.pdf$/i.test(n));
    if (!pdf) {
      warnings.push(`${row.id} : fichier introuvable (${row.file || "nom absent"})`);
      continue;
    }
    files.set(row.id, pdf);
    const cover =
      (row.cover && IMG.test(row.cover) && byName.get(row.cover.toLowerCase())) ||
      findById(row.id, (n) => IMG.test(n));
    if (cover) covers.set(row.id, cover);

    // Versions linguistiques d'une même publication : colonne « Publication »
    // si elle existe, sinon même thématique + même type + même descriptif.
    const key = row.group
      ? `g:${normKey(row.group)}`
      : `d:${normKey(row.theme)}|${normKey(row.type)}|${normKey(row.descFr || row.id)}`;
    const list = groups.get(key) ?? [];
    list.push(row);
    groups.set(key, list);
  }

  const publications: BiblioPublication[] = [];
  for (const list of groups.values()) {
    list.sort((a, b) => LANG_ORDER.indexOf(a.lang) - LANG_ORDER.indexOf(b.lang));
    const first = list[0];
    const titles: BiblioPublication["titles"] = {};
    for (const r of list) titles[r.lang] ??= r.title;
    const translatedTitles: BiblioPublication["translatedTitles"] = {};
    const tFr = list.find((r) => r.titleFr)?.titleFr;
    const tEn = list.find((r) => r.titleEn)?.titleEn;
    const tAr = list.find((r) => r.titleAr)?.titleAr;
    if (tFr && !titles.fr) translatedTitles.fr = tFr;
    if (tEn && !titles.en) translatedTitles.en = tEn;
    if (tAr && !titles.ar) translatedTitles.ar = tAr;
    const descriptions: BiblioPublication["descriptions"] = {};
    const fr = list.find((r) => r.descFr)?.descFr;
    const en = list.find((r) => r.descEn)?.descEn;
    const ar = list.find((r) => r.descAr)?.descAr;
    if (fr) descriptions.fr = fr;
    if (en) descriptions.en = en;
    if (ar) descriptions.ar = ar;
    const latest = list.reduce((a, b) => (b.date.sortKey > a.date.sortKey ? b : a));
    publications.push({
      key: first.id,
      theme: first.theme,
      type: first.type,
      descriptions,
      titles,
      translatedTitles,
      date: latest.date,
      countries: detectCountries(
        `${list.map((r) => r.title).join(" ")} ${first.descFr}`,
        list.find((r) => r.countries)?.countries ?? ""
      ),
      files: list.map((r) => ({
        id: r.id,
        lang: r.lang,
        title: r.title,
        sizeBytes: files.get(r.id)?.size ?? null,
      })),
      coverId: list.find((r) => covers.has(r.id))?.id ?? null,
      coverIds: Object.fromEntries(
        list.filter((r) => covers.has(r.id)).map((r) => [r.lang, r.id])
      ),
      slug: slugFor(first.id, list),
    });
  }
  publications.sort((a, b) => b.date.sortKey.localeCompare(a.date.sortKey));
  if (warnings.length) console.warn("[bibliotheque]", warnings.join(" · "));
  return { catalogue: { publications, warnings }, files, covers, source: src };
}

// Cache mémoire par instance : évite de relire Dropbox à chaque requête de
// couverture ou de PDF. La page elle-même est régénérée par ISR.
const CACHE_MS = 5 * 60 * 1000;
let cached: { at: number; value: Promise<Resolved | null> } | null = null;

function resolved(): Promise<Resolved | null> {
  if (!cached || Date.now() - cached.at > CACHE_MS) {
    const value = build().catch((err) => {
      console.error("[bibliotheque]", err);
      cached = null; // une erreur n'est pas gardée en cache
      return null;
    });
    cached = { at: Date.now(), value };
  }
  return cached.value;
}

/** Catalogue public, ou null si la source est absente ou en erreur. */
export async function getBibliotheque(): Promise<BiblioCatalogue | null> {
  return (await resolved())?.catalogue ?? null;
}

const ID_RE = /^[A-Za-z0-9_-]{1,40}$/;

/**
 * Au-delà de cette taille, le PDF n'est pas relayé par le site mais servi par
 * un lien temporaire Dropbox (limite de taille des réponses des fonctions
 * serveur chez l'hébergeur). En dessous, il est servi depuis itpcmena.org,
 * ce qui permet son indexation sous le domaine du site.
 */
const PROXY_MAX_BYTES = Number(process.env.BIBLIO_PROXY_MAX_BYTES ?? 4_000_000);

/** PDF d'un ID : contenu (servi par le site) ou lien temporaire Dropbox. */
export async function getBiblioFile(
  id: string
): Promise<{ link: string } | { body: Buffer; name: string } | null> {
  if (!ID_RE.test(id)) return null;
  const r = await resolved();
  const e = r?.files.get(id);
  if (!r || !e) return null;
  if (r.source.kind === "dropbox" && e.size > PROXY_MAX_BYTES) {
    const link = await r.source.link(e);
    if (link) return { link };
  }
  return { body: await r.source.read(e), name: e.name };
}

/**
 * Fiche d'une publication par son segment d'URL. Seul l'ID en tête fait foi :
 * `canonical` est faux quand le segment n'est plus à jour (titre modifié).
 */
export async function findPublication(
  slug: string
): Promise<{ publication: BiblioPublication; canonical: boolean } | null> {
  const cat = await getBibliotheque();
  if (!cat) return null;
  const s = decodeURIComponent(slug).toLowerCase();
  const pub =
    cat.publications.find((p) => p.slug === s) ??
    cat.publications.find((p) =>
      p.files.some(
        (f) => s === f.id.toLowerCase() || s.startsWith(`${f.id.toLowerCase()}-`)
      )
    );
  return pub ? { publication: pub, canonical: pub.slug === s } : null;
}

/** Couverture d'un ID (contenu de l'image). */
export async function getBiblioCover(
  id: string
): Promise<{ body: Buffer; type: string } | null> {
  if (!ID_RE.test(id)) return null;
  const r = await resolved();
  const e = r?.covers.get(id);
  if (!r || !e) return null;
  const ext = e.name.split(".").pop()?.toLowerCase();
  const type =
    ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  return { body: await r.source.read(e), type };
}
