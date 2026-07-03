import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { RadiantMesh, RevealWrapper } from "@/components/ui";
import {
  getSectionPosts,
  getPosts,
  getPostLang,
  decodeSlug,
  formatDate,
  type WPPost,
  type PostLang,
} from "@/lib/wordpress";

// ⚠️ TEMPORAIRE — pour la démo client : tant que les catégories WordPress
// « Actualités » / « Blog » ne sont pas créées et que les articles ne sont pas
// tagués, on remplit les zones avec les derniers articles publiés. Passer à
// `false` (ou supprimer) une fois les sections alimentées dans WordPress.
const DEMO_FILL_FROM_ALL = true;

const langBadge: Record<PostLang, string> = {
  fr: "rounded bg-blue-50 px-1.5 py-0.5 text-[11px] font-bold text-blue-700",
  ar: "rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-bold text-amber-800",
  en: "rounded bg-green-50 px-1.5 py-0.5 text-[11px] font-bold text-green-700",
};
const langLabel: Record<PostLang, string> = { fr: "FR", ar: "ع", en: "EN" };

function href(post: WPPost) {
  return `/actualites/${decodeSlug(post.slug)}` as Parameters<
    typeof Link
  >[0]["href"];
}

// ───────────────────────────────────────────────────────────────────────────
// P1-C — Zone unifiée « Publications » (clair) : Actualités + Op-ed vedette
// ───────────────────────────────────────────────────────────────────────────
export async function PublicationsUnified({ locale }: { locale: string }) {
  let [actu, blog] = await Promise.all([
    getSectionPosts(locale, "actualites", 3),
    getSectionPosts(locale, "blog", 3),
  ]);
  if (DEMO_FILL_FROM_ALL && (actu.length === 0 || blog.length === 0)) {
    const pool = await getPosts(locale, 6);
    if (actu.length === 0) actu = pool.slice(0, 3);
    if (blog.length === 0) blog = pool.slice(3, 6);
  }
  const featured = blog[0] ?? null;
  const secondary = blog.slice(1, 3);

  return (
    <section id="actualites" className="mx-auto max-w-6xl px-6 py-20">
      <RevealWrapper className="mb-10 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-red">
          Publications
        </p>
        <h2 className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">
          Ce qu&rsquo;on documente, ce qu&rsquo;on défend
        </h2>
      </RevealWrapper>

      <RevealWrapper className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        {/* Actualités */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-teal" />
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal">
              Actualités
            </p>
          </div>
          {actu.length === 0 ? (
            <p className="text-sm text-ink/45">Aucune actualité pour le moment.</p>
          ) : (
            <div className="flex flex-col divide-y divide-ink/10 border-y border-ink/10">
              {actu.map((post) => {
                const lang = getPostLang(post);
                return (
                  <Link
                    key={post.id}
                    href={href(post)}
                    className="group py-4 first:pt-0"
                  >
                    <div className="mb-1 flex items-center gap-2 text-[11px]">
                      <span className={langBadge[lang]}>{langLabel[lang]}</span>
                      <span className="text-ink/45">
                        {formatDate(post.date, locale)}
                      </span>
                    </div>
                    <h3
                      className="font-bold leading-snug transition group-hover:text-teal"
                      dir={lang === "ar" ? "rtl" : undefined}
                      dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                    />
                  </Link>
                );
              })}
            </div>
          )}
          <Link
            href="/actualites"
            className="mt-4 inline-block text-sm font-semibold text-teal hover:underline"
          >
            Toutes les actualités →
          </Link>
        </div>

        {/* Op-ed vedette */}
        <div id="blog" className="lg:border-l lg:border-ink/12 lg:pl-10">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-red" />
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-red">
              Le blog · Tribunes
            </p>
          </div>

          {!featured ? (
            <p className="text-sm text-ink/45">Les premières tribunes arrivent.</p>
          ) : (
            <>
              <Link href={href(featured)} className="group block">
                {featured.jetpack_featured_media_url && (
                  <div className="relative h-[240px] w-full overflow-hidden rounded-4xl">
                    <Image
                      src={featured.jetpack_featured_media_url}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover transition duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                )}
                <div className="mt-4">
                  <span className="text-xs font-medium text-ink/50">
                    {formatDate(featured.date, locale)}
                  </span>
                  <h3
                    className="mt-2 font-serif text-3xl font-medium leading-[1.15]"
                    dir={getPostLang(featured) === "ar" ? "rtl" : undefined}
                    dangerouslySetInnerHTML={{
                      __html: featured.title.rendered,
                    }}
                  />
                </div>
              </Link>

              {secondary.length > 0 && (
                <div className="mt-6 grid gap-4 border-t border-ink/10 pt-5 sm:grid-cols-2">
                  {secondary.map((post) => {
                    const lang = getPostLang(post);
                    return (
                      <Link key={post.id} href={href(post)} className="group">
                        <p className="text-[11px] font-medium text-ink/45">
                          {formatDate(post.date, locale)}
                        </p>
                        <h4
                          className="mt-1 font-serif text-lg font-medium leading-snug transition group-hover:text-red"
                          dir={lang === "ar" ? "rtl" : undefined}
                          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                        />
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </RevealWrapper>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// P5-B — Chapitre op-ed sombre, pleine largeur
// ───────────────────────────────────────────────────────────────────────────
export async function OpEdChapter({ locale }: { locale: string }) {
  let blog = await getSectionPosts(locale, "blog", 4);
  if (DEMO_FILL_FROM_ALL && blog.length === 0) {
    blog = await getPosts(locale, 4);
  }
  const featured = blog[0] ?? null;
  const secondary = blog.slice(1, 4);

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
              Le blog · Tribunes &amp; analyses
            </p>
            <h2 className="mt-2 text-4xl font-extrabold tracking-tight md:text-6xl">
              Prises de position
            </h2>
          </div>
          <Link
            href="/actualites"
            className="hidden shrink-0 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 md:inline-flex"
          >
            Toutes →
          </Link>
        </RevealWrapper>

        {!featured ? (
          <p className="text-white/55">Les premières tribunes arrivent bientôt.</p>
        ) : (
          <RevealWrapper>
            <Link
              href={href(featured)}
              className="group block border-b border-white/12 pb-10"
            >
              <div className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-white/45">
                <span>{formatDate(featured.date, locale)}</span>
              </div>
              <h3
                className="max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl"
                dir={getPostLang(featured) === "ar" ? "rtl" : undefined}
                dangerouslySetInnerHTML={{ __html: featured.title.rendered }}
              />
            </Link>

            {secondary.length > 0 && (
              <div className="mt-10 grid gap-10 md:grid-cols-3">
                {secondary.map((post) => {
                  const lang = getPostLang(post);
                  return (
                    <Link key={post.id} href={href(post)} className="group">
                      <span className="text-xs font-medium text-white/45">
                        {formatDate(post.date, locale)}
                      </span>
                      <h4
                        className="mt-2 text-2xl font-bold leading-snug transition group-hover:text-amber"
                        dir={lang === "ar" ? "rtl" : undefined}
                        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                      />
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
