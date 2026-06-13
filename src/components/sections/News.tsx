import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { RevealWrapper } from "@/components/ui";
import {
  getPosts,
  getPostLang,
  decodeSlug,
  formatDate,
  stripHtml,
  type WPPost,
  type PostLang,
} from "@/lib/wordpress";

// ---------------------------------------------------------------------------
// Static fallback (shown if WP fetch fails)
// ---------------------------------------------------------------------------
const FALLBACK_POSTS: WPPost[] = [
  {
    id: 1,
    slug: "le-golfe-pilier-sante-vih",
    date: "2025-12-12T00:00:00",
    title: {
      rendered:
        "Le Golfe peut-il devenir le nouveau pilier de la santé régionale dans la lutte contre le VIH ?",
    },
    excerpt: { rendered: "" },
    content: { rendered: "" },
    featured_media: 0,
    jetpack_featured_media_url:
      "https://i0.wp.com/itpcmena.org/wp-content/uploads/2023/11/Galerie-Position-5-1-scaled.jpg?fit=2560%2C1707&ssl=1",
    class_list: ["category--fr"],
    link: "#",
  },
  {
    id: 2,
    slug: "tahliil-jadid",
    date: "2026-02-10T00:00:00",
    title: {
      rendered:
        "تحليل جديد يكشف المسار نحو إتاحة دواء لينكابافير بأسعار ميسورة",
    },
    excerpt: { rendered: "" },
    content: { rendered: "" },
    featured_media: 0,
    jetpack_featured_media_url: "",
    class_list: ["category--ar"],
    link: "#",
  },
  {
    id: 3,
    slug: "46-organisations-cgg",
    date: "2025-12-04T00:00:00",
    title: {
      rendered:
        "46 organisations appellent les pays du CCG à un engagement accru pour le Fonds Mondial",
    },
    excerpt: { rendered: "" },
    content: { rendered: "" },
    featured_media: 0,
    jetpack_featured_media_url: "",
    class_list: ["category--fr"],
    link: "#",
  },
];

// ---------------------------------------------------------------------------
// Badge helpers
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export async function News({ locale }: { locale: string }) {
  const wpPosts = await getPosts(locale, 3);
  const posts = wpPosts.length >= 3 ? wpPosts : FALLBACK_POSTS;

  const featured = posts[0];
  const secondary = posts.slice(1, 3);

  return (
    <section id="actualites" className="mx-auto max-w-6xl px-6 py-12">
      {/* Header */}
      <RevealWrapper className="mb-9 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal">
            Actualités
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            Restez informé
          </h2>
        </div>
        <div className="flex gap-2">
          <button className="rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-white">
            Tous
          </button>
          <button className="rounded-full border border-ink/15 px-4 py-1.5 text-sm font-semibold text-ink/60 transition hover:text-ink">
            FR
          </button>
          <button className="rounded-full border border-ink/15 px-4 py-1.5 text-sm font-semibold text-ink/60 transition hover:text-ink">
            ع
          </button>
        </div>
      </RevealWrapper>

      {/* Grid */}
      <RevealWrapper className="grid gap-5 md:grid-cols-3">
        {/* Featured — spans 2 cols */}
        <FeaturedCard post={featured} locale={locale} />

        {/* Secondary posts */}
        <div className="flex flex-col gap-5">
          {secondary.map((post) => (
            <SecondaryCard key={post.id} post={post} locale={locale} />
          ))}
        </div>
      </RevealWrapper>

      {/* See all link */}
      <div className="mt-8 text-center">
        <Link
          href="/actualites"
          className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white"
        >
          Toutes les actualités →
        </Link>
      </div>
    </section>
  );
}

function FeaturedCard({
  post,
  locale,
}: {
  post: WPPost;
  locale: string;
}) {
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
            alt={post.title.rendered}
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
        {post.excerpt.rendered && (
          <p
            className="mt-2 line-clamp-2 text-sm text-ink/55"
            dir={lang === "ar" ? "rtl" : undefined}
          >
            {stripHtml(post.excerpt.rendered)}
          </p>
        )}
        <span className="mt-4 inline-block text-sm font-semibold text-red">
          {readLabel[lang]}
        </span>
      </div>
    </Link>
  );
}

function SecondaryCard({
  post,
  locale,
}: {
  post: WPPost;
  locale: string;
}) {
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
