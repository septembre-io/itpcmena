import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { RadiantMesh, RevealWrapper } from "@/components/ui";
import {
  getSectionPosts,
  getPosts,
  getPostLang,
  getByline,
  getInitials,
  getLede,
  getReadingMinutes,
  decodeSlug,
  formatDate,
  type WPPost,
} from "@/lib/wordpress";

// Repli démo : si la section « blog » (catégorie Opinion 974/978) ne renvoie rien,
// on remplissait avec les derniers articles publiés. Désormais la section est
// alimentée → désactivé. Le bloc op-ed est donc fail-closed (vide si section vide).
const DEMO_FILL_FROM_ALL = false;

function href(post: WPPost) {
  return `/actualites/${decodeSlug(post.slug)}` as Parameters<
    typeof Link
  >[0]["href"];
}

/**
 * Newsreader n'embarque pas de jeu arabe : un titre en `ar` rendu en `font-serif`
 * retomberait sur une police système imprévisible. On garde donc la sans du site
 * pour l'arabe, en compensant par la graisse.
 */
function titleClasses(lang: string, size: string) {
  return lang === "ar"
    ? `${size} font-sans font-extrabold`
    : `${size} font-serif font-medium`;
}

// ───────────────────────────────────────────────────────────────────────────
// « La tribune à la une » (série de septembre 2026, maquette
// `index-1-tribune-a-la-une.html`) : une tribune en grand — signature, chapô,
// bouton de lecture — et les suivantes dans un rail. Section sombre pleine
// largeur, posée juste après le hero.
//
// ⚠️ Ne pas confondre avec la numérotation P1…P5 de la série de juillet 2026
// (`itpc/propositions-oped/`). Ce composant servait jusqu'ici l'intégration
// « P5-B · Chapitre sombre pleine largeur » de cette série-là ; la maquette
// reprise ici est une proposition distincte, plus tardive.
// ───────────────────────────────────────────────────────────────────────────
export async function OpEdChapter({ locale }: { locale: string }) {
  // Intitulés traduits (messages/*.json → namespace `oped`), éditables sans toucher au code.
  const t = await getTranslations({ locale, namespace: "oped" });
  let blog = await getSectionPosts(locale, "blog", 4);
  if (DEMO_FILL_FROM_ALL && blog.length === 0) {
    blog = await getPosts(locale, 4);
  }
  const featured = blog[0] ?? null;
  const secondary = blog.slice(1, 4);

  const featuredLang = featured ? getPostLang(featured) : locale;
  const featuredDir = featuredLang === "ar" ? "rtl" : undefined;
  const byline = featured ? getByline(featured) : null;
  const lede = featured ? getLede(featured) : "";
  const minutes = featured ? getReadingMinutes(featured) : null;

  return (
    <section
      id="blog"
      className="relative w-full overflow-hidden bg-ink py-24 text-white"
    >
      <RadiantMesh className="absolute inset-0" opacity={0.55} />
      <div className="relative mx-auto max-w-6xl px-6">
        <RevealWrapper className="mb-12 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber">
              {t("eyebrow")}
            </p>
            <h2 className="mt-2 text-4xl font-extrabold tracking-tight md:text-6xl">
              {t("title")}
            </h2>
          </div>
          <Link
            href="/opinions"
            className="hidden shrink-0 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 md:inline-flex"
          >
            {t("seeAll")}
          </Link>
        </RevealWrapper>

        {!featured ? (
          <p className="text-white/55">{t("empty")}</p>
        ) : (
          <RevealWrapper className="grid gap-12 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:gap-14">
            {/* ── La tribune à la une ── */}
            <article>
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.08em] text-white/45">
                <span className="rounded-full border border-amber/40 px-2.5 py-0.5 text-amber">
                  {t("tag")}
                </span>
                <span>{formatDate(featured.date, locale)}</span>
                {minutes !== null && <span>{t("readingTime", { minutes })}</span>}
              </div>

              <Link href={href(featured)} className="group block">
                <h3
                  className={`mt-4 max-w-[18ch] leading-[1.08] tracking-tight transition group-hover:text-amber ${titleClasses(
                    featuredLang,
                    "text-[clamp(2rem,4.4vw,3.4rem)]"
                  )}`}
                  dir={featuredDir}
                  dangerouslySetInnerHTML={{ __html: featured.title.rendered }}
                />
              </Link>

              {lede && (
                <p
                  className="mt-6 max-w-[52ch] text-lg leading-relaxed text-white/60"
                  dir={featuredDir}
                >
                  {lede}
                </p>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-6">
                {byline && (
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal to-teal/50 text-xs font-extrabold text-white"
                    >
                      {getInitials(byline.name)}
                    </span>
                    <span>
                      <span className="block text-sm font-bold leading-tight">
                        {byline.name}
                      </span>
                      {byline.role && (
                        <span className="block text-xs leading-snug text-white/55">
                          {byline.role}
                        </span>
                      )}
                    </span>
                  </div>
                )}
                <Link
                  href={href(featured)}
                  className="inline-flex items-center rounded-full bg-red px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-95"
                >
                  {t("read")}
                </Link>
              </div>
            </article>

            {/* ── Les tribunes suivantes ── */}
            {secondary.length > 0 && (
              <div className="grid content-start gap-6 border-t border-white/15 pt-8 md:border-t-0 md:border-s md:pt-0 md:ps-8">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/35">
                  {t("alsoSigned")}
                </h3>
                {secondary.map((post) => {
                  const lang = getPostLang(post);
                  const who = getByline(post);
                  return (
                    <Link
                      key={post.id}
                      href={href(post)}
                      className="group grid gap-1.5 border-b border-white/10 pb-5 last:border-b-0 last:pb-0"
                    >
                      <span className="text-xs text-white/40">
                        {formatDate(post.date, locale)}
                      </span>
                      <h4
                        className={`leading-snug transition group-hover:text-amber ${titleClasses(
                          lang,
                          "text-xl"
                        )}`}
                        dir={lang === "ar" ? "rtl" : undefined}
                        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                      />
                      {who && (
                        <span className="text-xs text-white/50">{who.name}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </RevealWrapper>
        )}
      </div>
    </section>
  );
}
