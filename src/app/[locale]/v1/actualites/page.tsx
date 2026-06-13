import { Inter } from "next/font/google";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { NavbarV1 } from "@/components/v1/layout/Navbar";
import { FooterV1 } from "@/components/v1/layout/Footer";
import {
  getPosts,
  getPostLang,
  decodeSlug,
  formatDate,
  stripHtml,
  type WPPost,
  type PostLang,
} from "@/lib/wordpress";

export const revalidate = 3600;

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const langBadgeClass: Record<PostLang, string> = {
  fr: "rounded bg-[#E6F1FB] px-2 py-0.5 text-[11px] font-bold tracking-[0.04em] text-[#185FA5]",
  ar: "rounded bg-[#FAEEDA] px-2 py-0.5 text-[11px] font-bold tracking-[0.04em] text-[#633806]",
  en: "rounded bg-[#E6F1FB] px-2 py-0.5 text-[11px] font-bold tracking-[0.04em] text-[#185FA5]",
};
const langLabel: Record<PostLang, string> = { fr: "FR", ar: "ع", en: "EN" };

export default async function ActualitesV1Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const posts = await getPosts(locale, 12);

  return (
    <div className={`${inter.variable} font-[family-name:var(--font-inter)] text-[#1A1A1A] bg-white`}>
      <div className="fixed right-5 top-[76px] z-[999] rounded-full bg-[#1D9E75] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-white opacity-90">
        V1 · Minimaliste
      </div>
      <NavbarV1 />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <header className="mb-10">
          <p className="mb-3 text-[11.5px] font-bold uppercase tracking-[0.1em] text-[#1D9E75]">
            Actualités
          </p>
          <h1 className="text-4xl font-bold tracking-[-0.02em] text-[#1A1A1A]">
            Toutes les actualités
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[#6B7280]">
            Suivez nos analyses, communiqués et actualités de la région MENA.
          </p>
        </header>

        {posts.length === 0 ? (
          <p className="text-[#6B7280]">Aucun article disponible.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCardV1 key={post.id} post={post} locale={locale} />
            ))}
          </div>
        )}
      </main>
      <FooterV1 />
    </div>
  );
}

function PostCardV1({ post, locale }: { post: WPPost; locale: string }) {
  const lang = getPostLang(post);
  const slug = decodeSlug(post.slug);
  const img = post.jetpack_featured_media_url;

  return (
    <Link
      href={`/v1/actualites/${slug}` as Parameters<typeof Link>[0]["href"]}
      className="group flex flex-col overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white text-inherit no-underline transition hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)]"
    >
      <div className="relative h-44 bg-[#E5E7EB]">
        {img && (
          <Image
            src={img}
            alt={stripHtml(post.title.rendered)}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-[10px] flex items-center gap-[10px]">
          <span className={langBadgeClass[lang]}>{langLabel[lang]}</span>
          <span className="text-[12px] text-[#6B7280]">{formatDate(post.date, locale)}</span>
        </div>
        <h2
          className="flex-1 text-[15px] font-semibold leading-[1.4] text-[#1A1A1A]"
          dir={lang === "ar" ? "rtl" : undefined}
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />
        <span className="mt-4 text-[13px] font-semibold text-[#C1272D]">
          {lang === "ar" ? "اقرأ المقال →" : lang === "en" ? "Read →" : "Lire →"}
        </span>
      </div>
    </Link>
  );
}
