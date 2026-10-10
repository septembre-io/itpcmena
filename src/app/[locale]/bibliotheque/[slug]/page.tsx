import type { Metadata } from "next";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { NavbarV3 } from "@/components/v3/layout/Navbar";
import { FooterV3 } from "@/components/v3/layout/Footer";
import { JsonLd } from "@/components/JsonLd";
import {
  CoverFallback,
  DownloadButtons,
  PublicationCard,
} from "@/components/v3/bibliotheque/BibliothequeExplorer";
import { getMenu, getHeaderMenu, getFooterFallback } from "@/lib/menu";
import { pageMetadata, breadcrumbSchema, SITE_URL } from "@/lib/seo";
import { findPublication, getBibliotheque } from "@/lib/bibliotheque";
import {
  LANG_NAMES,
  countryLabel,
  coverUrl,
  ficheHref,
  pdfUrl,
  themeLabel,
  typeLabel,
} from "@/lib/bibliothequeLabels";
import {
  BIBLIO_TEXT,
  asLoc,
  citationMeta,
  ficheUrl,
  localized,
  metaExcerpt,
  primaryFile,
  publicationSchema,
  themeSlug,
  toItem,
} from "@/lib/bibliothequeView";

// Fiche d'une publication : /{locale}/bibliotheque/res-011-indice-de-stigmatisation…
// Même segment dans les trois langues (hreflang simple). Régénérée comme la liste.
export const revalidate = 600;

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const loc = asLoc(locale);
  const found = await findPublication(slug);
  if (!found) return {};
  const p = found.publication;
  const l = localized(p, loc);
  const base = pageMetadata({
    locale: loc,
    path: `bibliotheque/${p.slug}`,
    title: `${l.title} — ITPC MENA`,
    description: metaExcerpt(l.description || BIBLIO_TEXT[loc].metaDescription),
    images: p.coverId ? [`${SITE_URL}${coverUrl(p.coverId)}`] : undefined,
  });
  return { ...base, other: citationMeta(p, loc) };
}

export default async function FichePage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const loc = asLoc(locale);
  const t = BIBLIO_TEXT[loc];
  const rtl = loc === "ar";

  const found = await findPublication(slug);
  if (!found) notFound();
  const p = found.publication;
  // Titre modifié dans le catalogue : l'ancien segment redirige vers le nouveau.
  if (!found.canonical) permanentRedirect(`/${loc}${ficheHref(p.slug)}`);

  const [catalogue, navMenu, footMenu] = await Promise.all([
    getBibliotheque(),
    getHeaderMenu(locale),
    getMenu("v3-footer", locale, getFooterFallback(locale)),
  ]);

  const item = toItem(p, loc);
  const l = localized(p, loc);
  const primary = primaryFile(p, loc);
  const tLabel = typeLabel(p.type, loc);
  const related = (catalogue?.publications ?? [])
    .filter((x) => x.key !== p.key && x.theme === p.theme)
    .slice(0, 2)
    .map((x) => toItem(x, loc));
  const listHref = "/bibliotheque" as const;
  const themeHref = `/bibliotheque?theme=${themeSlug(p.theme)}` as Parameters<
    typeof Link
  >[0]["href"];

  const facts: Array<[string, string]> = [
    [t.type, tLabel],
    [t.published, item.dateLabel],
    [t.countries, p.countries.map((c) => countryLabel(c, loc)).join(", ")],
    [t.lang, p.files.map((f) => LANG_NAMES[f.lang]).join(" · ")],
  ].filter(([, v]) => v) as Array<[string, string]>;

  return (
    <div className="bg-cream text-ink">
      <JsonLd
        data={[
          publicationSchema(p, loc),
          breadcrumbSchema([
            { name: t.home, url: `${SITE_URL}/${loc}` },
            { name: t.title, url: `${SITE_URL}/${loc}/bibliotheque` },
            { name: l.title, url: ficheUrl(p, loc) },
          ]),
        ]}
      />
      <NavbarV3 menu={navMenu} />

      <main className="mx-auto max-w-6xl px-6 py-12" dir={rtl ? "rtl" : undefined}>
        <nav aria-label="breadcrumb" className="text-sm text-ink/50">
          <Link href={listHref} className="font-semibold transition hover:text-red">
            {rtl ? "→" : "←"} {t.back}
          </Link>
        </nav>

        <article className="mt-8 grid gap-10 md:grid-cols-[minmax(0,15rem)_1fr] lg:gap-14">
          {/* Couverture */}
          <div className="mx-auto w-48 md:sticky md:top-28 md:mx-0 md:w-full md:self-start">
            <a
              href={pdfUrl(primary.id)}
              target="_blank"
              rel="noopener"
              className="block"
            >
              <div className="relative aspect-[910/1287] overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/10 transition hover:-translate-y-1">
                {p.coverId ? (
                  <Image
                    src={coverUrl(p.coverId)}
                    alt={`${tLabel} : ${l.title}`}
                    fill
                    priority
                    sizes="(max-width: 768px) 192px, 240px"
                    className="object-cover"
                  />
                ) : (
                  <CoverFallback label={tLabel} />
                )}
              </div>
            </a>
          </div>

          {/* Contenu */}
          <div className="min-w-0">
            <Link
              href={themeHref}
              className="text-xs font-bold uppercase tracking-[0.14em] text-teal transition hover:text-red"
            >
              {themeLabel(p.theme, loc)}
            </Link>
            <h1
              lang={l.titleLang}
              dir={l.titleLang === "ar" ? "rtl" : "ltr"}
              className={`mt-3 text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl ${
                rtl ? "text-right" : "text-left"
              }`}
            >
              {l.title}
            </h1>

            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-ink/10 py-5 sm:grid-cols-4">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-ink/45">
                    {k}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-ink/80">{v}</dd>
                </div>
              ))}
            </dl>

            {l.description && (
              <p
                lang={l.descriptionLang}
                dir={l.descriptionLang === "ar" ? "rtl" : "ltr"}
                className="mt-6 max-w-2xl text-base leading-relaxed text-ink/70 sm:text-lg"
              >
                {l.description}
              </p>
            )}

            <section className="mt-10">
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink/60">
                {t.versions}
              </h2>
              <ul className="mt-4 space-y-3">
                {p.files.map((f) => (
                  <li
                    key={f.id}
                    className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span
                      lang={f.lang}
                      dir={f.lang === "ar" ? "rtl" : "ltr"}
                      className="text-sm font-semibold text-ink/80"
                    >
                      {f.title}
                    </span>
                    <span className="flex shrink-0">
                      <DownloadButtons
                        files={item.files.filter((x) => x.id === f.id)}
                        primaryId={f.id === primary.id ? f.id : ""}
                        labels={t}
                        size="lg"
                      />
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </article>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-extrabold tracking-tight text-ink">{t.related}</h2>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {related.map((r) => (
                <PublicationCard
                  key={r.key}
                  item={r}
                  locale={loc}
                  labels={t}
                />
              ))}
            </div>
          </section>
        )}
      </main>
      <FooterV3 menu={footMenu} locale={loc} />
    </div>
  );
}
