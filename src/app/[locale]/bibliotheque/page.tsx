import type { Metadata } from "next";
import { NavbarV3 } from "@/components/v3/layout/Navbar";
import { FooterV3 } from "@/components/v3/layout/Footer";
import { JsonLd } from "@/components/JsonLd";
import { BibliothequeExplorer } from "@/components/v3/bibliotheque/BibliothequeExplorer";
import { getMenu, getHeaderMenu, getFooterFallback } from "@/lib/menu";
import { pageMetadata, breadcrumbSchema, SITE_URL } from "@/lib/seo";
import { getBibliotheque } from "@/lib/bibliotheque";
import { coverUrl, EMPTY_FILTERS, type ExplorerFilters } from "@/lib/bibliothequeLabels";
import {
  BIBLIO_TEXT,
  asLoc,
  collectionSchema,
  toItem,
} from "@/lib/bibliothequeView";

// ISR : le catalogue vit dans Dropbox, la page est régénérée toutes les
// 10 minutes. Une correction dans le classeur ou un PDF remplacé apparaît
// donc en ligne sans redéploiement.
export const revalidate = 600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const loc = asLoc((await params).locale);
  const t = BIBLIO_TEXT[loc];
  // Image de partage : couverture de la publication la plus récente.
  const cover = (await getBibliotheque())?.publications.find((p) => p.coverId)?.coverId;
  return pageMetadata({
    locale: loc,
    path: "bibliotheque",
    title: t.metaTitle,
    description: t.metaDescription,
    images: cover ? [`${SITE_URL}${coverUrl(cover)}`] : undefined,
  });
}

/** Filtres initiaux lus dans l'URL (?theme=…), pour les liens partagés. */
function readFilters(sp: Record<string, string | string[] | undefined>): ExplorerFilters {
  const out = { ...EMPTY_FILTERS };
  for (const k of Object.keys(out) as (keyof ExplorerFilters)[]) {
    const v = sp[k];
    if (typeof v === "string") out[k] = v.slice(0, 100);
  }
  return out;
}

export default async function BibliothequePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const loc = asLoc(locale);
  const t = BIBLIO_TEXT[loc];

  const [catalogue, navMenu, footMenu, sp] = await Promise.all([
    getBibliotheque(),
    getHeaderMenu(locale),
    getMenu("v3-footer", locale, getFooterFallback(locale)),
    searchParams,
  ]);
  const pubs = catalogue?.publications ?? [];
  const items = pubs.map((p) => toItem(p, loc));

  return (
    <div className="bg-cream text-ink">
      {pubs.length > 0 && (
        <JsonLd
          data={[
            collectionSchema(pubs, loc),
            breadcrumbSchema([
              { name: t.home, url: `${SITE_URL}/${loc}` },
              { name: t.title, url: `${SITE_URL}/${loc}/bibliotheque` },
            ]),
          ]}
        />
      )}
      <NavbarV3 menu={navMenu} />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <header className="mb-10" dir={loc === "ar" ? "rtl" : undefined}>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal">{t.tag}</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-ink">{t.title}</h1>
          <p className="mt-3 max-w-2xl text-base text-ink/55">{t.sub}</p>
        </header>

        {items.length === 0 ? (
          <p
            className="rounded-3xl bg-white p-8 text-ink/60 shadow-sm ring-1 ring-black/5"
            dir={loc === "ar" ? "rtl" : undefined}
          >
            {catalogue ? t.empty : t.unavailable}
          </p>
        ) : (
          <BibliothequeExplorer
            items={items}
            locale={loc}
            initialFilters={readFilters(sp)}
            labels={{
              searchPlaceholder: t.searchPlaceholder,
              allThemes: t.allThemes,
              type: t.type,
              lang: t.lang,
              country: t.country,
              year: t.year,
              sort: t.sort,
              sortRecent: t.sortRecent,
              sortOld: t.sortOld,
              sortTitle: t.sortTitle,
              all: t.all,
              reset: t.reset,
              countNoun: t.countNoun,
              empty: t.empty,
              download: t.download,
              pdf: t.pdf,
            }}
          />
        )}
      </main>
      <FooterV3 menu={footMenu} locale={loc} />
    </div>
  );
}
