import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { RevealWrapper } from "@/components/ui";
import { NewsLangSwitch } from "./NewsLangSwitch";
import {
  getPosts,
  getSectionPosts,
  getPostLang,
  decodeSlug,
  formatDate,
  stripHtml,
  type WPPost,
  type PostLang,
  type PostSection,
} from "@/lib/wordpress";

const langBadgeClass: Record<PostLang, string> = {
  fr: "rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700",
  ar: "rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800",
  en: "rounded-md bg-green-50 px-2 py-0.5 text-[11px] font-bold text-green-700",
};
const langLabel: Record<PostLang, string> = { fr: "FR", ar: "ع", en: "EN" };
const readLabel: Record<PostLang, string> = {
  fr: "Lire l'article →",
  ar: "اقرأ المقال →",
  en: "Read article →",
};

export async function NewsV2({
  locale,
  section,
  id = "actualites",
  tag,
  title,
  showLangSwitch = true,
}: {
  locale: string;
  /** Section éditoriale (catégorie). Absent = toutes les actualités. */
  section?: PostSection;
  /** id de la <section> pour les ancres de menu. */
  id?: string;
  /** Surtitre (eyebrow). Override optionnel — sinon i18n `news.tag`. */
  tag?: string;
  /** Titre de la section. Override optionnel — sinon i18n `news.title`. */
  title?: string;
  /** Afficher le sélecteur de langue de la section. */
  showLangSwitch?: boolean;
}) {
  // Intitulés traduits (messages/*.json → namespace `news`), éditables sans toucher au code.
  const t = await getTranslations({ locale, namespace: "news" });
  const posts = section
    ? await getSectionPosts(locale, section, 3)
    : await getPosts(locale, 3);
  const featured = posts[0] ?? null;
  const secondary = posts.slice(1, 3);

  return (
    <section id={id} className="mx-auto max-w-6xl px-6 py-16">
      {/* Header */}
      <RevealWrapper className="mb-9 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal">
            {tag ?? t("tag")}
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            {title ?? t("title")}
          </h2>
        </div>
        {showLangSwitch && <NewsLangSwitch />}
      </RevealWrapper>

      {/* Grid */}
      {posts.length === 0 ? (
        <p className="text-ink/50">{t("empty")}</p>
      ) : (
        <RevealWrapper className="grid gap-5 md:grid-cols-3">
          {featured && <FeaturedCardV2 post={featured} locale={locale} />}
          <div className="flex flex-col gap-5">
            {secondary.map((post) => (
              <SecondaryCardV2 key={post.id} post={post} locale={locale} />
            ))}
          </div>
        </RevealWrapper>
      )}

      {/* See all */}
      <div className="mt-8 text-center">
        <Link
          href="/actualites"
          className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white"
        >
          {t("seeAll")}
        </Link>
      </div>
    </section>
  );
}

function FeaturedCardV2({ post, locale }: { post: WPPost; locale: string }) {
  const lang = getPostLang(post);
  const slug = decodeSlug(post.slug);
  const img = post.jetpack_featured_media_url;

  return (
    <Link
      href={`/actualites/${slug}` as Parameters<typeof Link>[0]["href"]}
      className="group col-span-1 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-xl md:col-span-2"
    >
      {img && (
        <div className="relative h-56 overflow-hidden">
          <Image
            src={img}
            alt={stripHtml(post.title.rendered)}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-6">
        <div className="mb-3 flex items-center gap-3">
          <span className={langBadgeClass[lang]}>{langLabel[lang]}</span>
          <span className="text-xs text-ink/45">
            {formatDate(post.date, locale)}
          </span>
        </div>
        <h3
          className="text-xl font-bold leading-snug text-ink"
          dir={lang === "ar" ? "rtl" : undefined}
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />
        <span className="mt-4 inline-block text-sm font-semibold text-red">
          {readLabel[lang]}
        </span>
      </div>
    </Link>
  );
}

function SecondaryCardV2({ post, locale }: { post: WPPost; locale: string }) {
  const lang = getPostLang(post);
  const slug = decodeSlug(post.slug);

  return (
    <Link
      href={`/actualites/${slug}` as Parameters<typeof Link>[0]["href"]}
      className="group flex-1 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition hover:shadow-xl"
    >
      <div className="mb-3 flex items-center gap-3">
        <span className={langBadgeClass[lang]}>{langLabel[lang]}</span>
        <span className="text-xs text-ink/45">
          {formatDate(post.date, locale)}
        </span>
      </div>
      <h3
        className="text-base font-bold leading-snug text-ink"
        dir={lang === "ar" ? "rtl" : undefined}
        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
      />
      <span
        className="mt-3 inline-block text-sm font-semibold text-red"
        dir={lang === "ar" ? "rtl" : undefined}
      >
        {readLabel[lang]}
      </span>
    </Link>
  );
}
