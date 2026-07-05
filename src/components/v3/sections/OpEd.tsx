import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { RadiantMesh, RevealWrapper } from "@/components/ui";
import {
  getSectionPosts,
  getPosts,
  getPostLang,
  decodeSlug,
  formatDate,
  type WPPost,
} from "@/lib/wordpress";

// Repli démo : si la section « blog » (catégorie Opinion 974/978) ne renvoie rien,
// on remplissait avec les derniers articles publiés. Désormais la section est
// alimentée → désactivé. Le bloc op-ed est donc fail-closed (vide si section vide,
// ex. arabe tant que « Opinion » n'a pas de traduction AR liée).
const DEMO_FILL_FROM_ALL = false;

function href(post: WPPost) {
  return `/actualites/${decodeSlug(post.slug)}` as Parameters<
    typeof Link
  >[0]["href"];
}

// ───────────────────────────────────────────────────────────────────────────
// P5-B — Chapitre op-ed sombre, pleine largeur
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
            href="/actualites"
            className="hidden shrink-0 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 md:inline-flex"
          >
            {t("seeAll")}
          </Link>
        </RevealWrapper>

        {!featured ? (
          <p className="text-white/55">{t("empty")}</p>
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
