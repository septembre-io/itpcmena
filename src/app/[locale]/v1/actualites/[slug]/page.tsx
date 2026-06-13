import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { NavbarV1 } from "@/components/v1/layout/Navbar";
import { FooterV1 } from "@/components/v1/layout/Footer";
import {
  getPostBySlug,
  getAllPostSlugs,
  getPostLang,
  formatDate,
  stripHtml,
} from "@/lib/wordpress";

export const revalidate = 3600;

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateStaticParams() {
  const slugLocales = await getAllPostSlugs();
  return slugLocales.map(({ slug, locale }) => ({ slug, locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Article — ITPC MENA" };
  const ogImg = post.jetpack_featured_media_url || post.yoast_head_json?.og_image?.[0]?.url;
  return {
    title: `${stripHtml(post.title.rendered)} — ITPC MENA`,
    description: stripHtml(post.excerpt.rendered).slice(0, 160),
    openGraph: ogImg ? { images: [{ url: ogImg }] } : undefined,
  };
}

export default async function ArticleV1Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const lang = getPostLang(post);
  const isRtl = lang === "ar";
  const img = post.jetpack_featured_media_url;

  return (
    <div className={`${inter.variable} font-[family-name:var(--font-inter)] text-[#1A1A1A] bg-white`}>
      <div className="fixed right-5 top-[76px] z-[999] rounded-full bg-[#1D9E75] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-white opacity-90">
        V1 · Minimaliste
      </div>
      <NavbarV1 />
      <main className="mx-auto max-w-3xl px-6 py-16">
        {/* Back */}
        <Link
          href="/v1/actualites"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition hover:text-[#1A1A1A]"
        >
          ← {lang === "ar" ? "جميع المقالات" : lang === "en" ? "All articles" : "Toutes les actualités"}
        </Link>

        {/* Hero image */}
        {img && (
          <div className="relative mb-8 h-72 overflow-hidden rounded-2xl">
            <Image
              src={img}
              alt={stripHtml(post.title.rendered)}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        {/* Meta */}
        <div className="mb-4 flex items-center gap-3 text-sm text-[#6B7280]">
          <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
        </div>

        {/* Title */}
        <h1
          className="mb-8 text-3xl font-bold leading-tight tracking-[-0.02em] text-[#1A1A1A] md:text-4xl"
          dir={isRtl ? "rtl" : undefined}
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />

        {/* Body */}
        <article
          className="prose max-w-none text-[#1A1A1A]"
          dir={isRtl ? "rtl" : undefined}
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />

        {/* Footer CTA */}
        <div className="mt-12 border-t border-[#E5E7EB] pt-8">
          <Link
            href="/v1/actualites"
            className="inline-flex items-center gap-2 rounded-[7px] border border-[#1A1A1A] px-6 py-3 text-sm font-medium text-[#1A1A1A] transition hover:bg-[#1A1A1A] hover:text-white"
          >
            ←{" "}
            {lang === "ar"
              ? "العودة إلى الأخبار"
              : lang === "en"
              ? "Back to news"
              : "Retour aux actualités"}
          </Link>
        </div>
      </main>
      <FooterV1 />
    </div>
  );
}
