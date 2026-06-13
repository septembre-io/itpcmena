import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  getPosts,
  getPostLang,
  decodeSlug,
  formatDate,
  stripHtml,
  type WPPost,
  type PostLang,
} from "@/lib/wordpress";

const langBadgeClass: Record<PostLang, string> = {
  fr: "rounded bg-[#E6F1FB] px-2 py-0.5 text-[11px] font-bold tracking-[0.04em] text-[#185FA5]",
  ar: "rounded bg-[#FAEEDA] px-2 py-0.5 text-[11px] font-bold tracking-[0.04em] text-[#633806]",
  en: "rounded bg-[#E6F1FB] px-2 py-0.5 text-[11px] font-bold tracking-[0.04em] text-[#185FA5]",
};
const langLabel: Record<PostLang, string> = { fr: "FR", ar: "ع", en: "EN" };
const readLabel: Record<PostLang, string> = {
  fr: "Lire l'article →",
  ar: "اقرأ المقال →",
  en: "Read article →",
};

export async function NewsV1({ locale }: { locale: string }) {
  const posts = await getPosts(locale, 3);
  const featured = posts[0] ?? null;
  const secondary = posts.slice(1, 3);

  return (
    <section id="actualites" className="bg-[#F9F9F7] px-5 md:px-20 py-20">
      {/* Header */}
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-3 text-[11.5px] font-bold uppercase tracking-[0.1em] text-[#1D9E75]">
            Actualités
          </p>
          <h2 className="text-[clamp(26px,3vw,36px)] font-bold leading-[1.2] tracking-[-0.02em] text-[#1A1A1A]">
            Restez informé
          </h2>
        </div>
        <div className="flex gap-2">
          {["Tous", "🇫🇷 Français", "🇸🇦 عربي"].map((f, i) => (
            <button
              key={f}
              className={`rounded-full border px-[14px] py-[6px] text-[13px] font-medium transition ${
                i === 0
                  ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                  : "border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#1A1A1A]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {posts.length === 0 ? (
        <p className="text-[#6B7280]">Aucun article disponible.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-[2fr_1fr_1fr]">
          {/* Featured */}
          {featured && <FeaturedCardV1 post={featured} locale={locale} />}
          {/* Secondary */}
          <div className="flex flex-col gap-5 md:col-span-2 md:col-start-2">
            {secondary.map((post) => (
              <SecondaryCardV1 key={post.id} post={post} locale={locale} />
            ))}
          </div>
        </div>
      )}

      {/* See all */}
      <div className="mt-10 text-center">
        <Link
          href="/v1/actualites"
          className="inline-flex items-center gap-2 rounded-[7px] border border-[#1A1A1A] px-[22px] py-[11px] text-[14px] font-medium text-[#1A1A1A] transition hover:bg-[#1A1A1A] hover:text-white"
        >
          Toutes les actualités →
        </Link>
      </div>
    </section>
  );
}

function FeaturedCardV1({ post, locale }: { post: WPPost; locale: string }) {
  const lang = getPostLang(post);
  const slug = decodeSlug(post.slug);
  const img = post.jetpack_featured_media_url;

  return (
    <Link
      href={`/v1/actualites/${slug}` as Parameters<typeof Link>[0]["href"]}
      className="flex flex-col overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white text-inherit no-underline transition hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)]"
    >
      <div className="relative h-[220px] bg-[#E5E7EB]">
        {img && (
          <Image
            src={img}
            alt={stripHtml(post.title.rendered)}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-[10px] flex items-center gap-[10px]">
          <span className={langBadgeClass[lang]}>{langLabel[lang]}</span>
          <span className="text-[12px] text-[#6B7280]">{formatDate(post.date, locale)}</span>
        </div>
        <h3
          className="mb-3 flex-1 text-[18px] font-semibold leading-[1.4] text-[#1A1A1A]"
          dir={lang === "ar" ? "rtl" : undefined}
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />
        <span className="mt-auto text-[13px] font-semibold text-[#C1272D]">
          {readLabel[lang]}
        </span>
      </div>
    </Link>
  );
}

function SecondaryCardV1({ post, locale }: { post: WPPost; locale: string }) {
  const lang = getPostLang(post);
  const slug = decodeSlug(post.slug);
  const img = post.jetpack_featured_media_url;

  return (
    <Link
      href={`/v1/actualites/${slug}` as Parameters<typeof Link>[0]["href"]}
      className="flex flex-col overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white text-inherit no-underline transition hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)]"
    >
      <div className="relative h-[140px] bg-[#E5E7EB]">
        {img && (
          <Image
            src={img}
            alt={stripHtml(post.title.rendered)}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-[10px] flex items-center gap-[10px]">
          <span className={langBadgeClass[lang]}>{langLabel[lang]}</span>
          <span className="text-[12px] text-[#6B7280]">{formatDate(post.date, locale)}</span>
        </div>
        <h3
          className="flex-1 text-[15px] font-semibold leading-[1.4] text-[#1A1A1A]"
          dir={lang === "ar" ? "rtl" : undefined}
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />
        <span className="mt-3 text-[13px] font-semibold text-[#C1272D]">
          {readLabel[lang]}
        </span>
      </div>
    </Link>
  );
}
