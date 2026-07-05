import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  getPostLang,
  decodeSlug,
  formatDate,
  stripHtml,
  type WPPost,
  type PostLang,
} from "@/lib/wordpress";

const langBadgeClass: Record<PostLang, string> = {
  fr: "rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700",
  ar: "rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800",
  en: "rounded-md bg-green-50 px-2 py-0.5 text-[11px] font-bold text-green-700",
};
const langLabel: Record<PostLang, string> = { fr: "FR", ar: "ع", en: "EN" };

/** Carte article partagée par les pages de listing (Actualités, Opinions…). */
export function PostCard({ post, locale }: { post: WPPost; locale: string }) {
  const lang = getPostLang(post);
  const slug = decodeSlug(post.slug);
  const img = post.jetpack_featured_media_url;
  const excerpt = stripHtml(post.excerpt.rendered);

  return (
    <Link
      href={`/actualites/${slug}` as Parameters<typeof Link>[0]["href"]}
      className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-xl"
    >
      {img ? (
        <div className="relative h-44 overflow-hidden">
          <Image
            src={img}
            alt={post.title.rendered}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="h-44 bg-cream" />
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-3">
          <span className={langBadgeClass[lang]}>{langLabel[lang]}</span>
          <span className="text-xs text-ink/45">{formatDate(post.date, locale)}</span>
        </div>
        <h2
          className="flex-1 text-base font-bold leading-snug text-ink"
          dir={lang === "ar" ? "rtl" : undefined}
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />
        {excerpt && (
          <p
            className="mt-2 line-clamp-2 text-sm text-ink/55"
            dir={lang === "ar" ? "rtl" : undefined}
          >
            {excerpt}
          </p>
        )}
        <span className="mt-4 text-sm font-semibold text-red">
          {lang === "ar" ? "اقرأ المقال →" : lang === "en" ? "Read →" : "Lire →"}
        </span>
      </div>
    </Link>
  );
}
