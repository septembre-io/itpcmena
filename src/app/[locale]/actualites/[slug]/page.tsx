import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  getPostBySlug,
  getAllPostSlugs,
  getPostLang,
  formatDate,
  stripHtml,
} from "@/lib/wordpress";

export const revalidate = 3600;

// ---------------------------------------------------------------------------
// Static params — pre-build known slugs across all locales
// ---------------------------------------------------------------------------
export async function generateStaticParams() {
  const slugLocales = await getAllPostSlugs();
  return slugLocales.map(({ slug, locale }) => ({ slug, locale }));
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Article — ITPC MENA" };

  const ogImg =
    post.jetpack_featured_media_url ||
    post.yoast_head_json?.og_image?.[0]?.url;

  return {
    title: `${stripHtml(post.title.rendered)} — ITPC MENA`,
    description: stripHtml(post.excerpt.rendered).slice(0, 160),
    openGraph: ogImg
      ? { images: [{ url: ogImg }] }
      : undefined,
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function ArticlePage({
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
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-16">
        {/* Back link */}
        <Link
          href="/actualites"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-ink/55 transition hover:text-ink"
        >
          ← {lang === "ar" ? "جميع المقالات" : lang === "en" ? "All articles" : "Toutes les actualités"}
        </Link>

        {/* Hero image */}
        {img && (
          <div className="relative mb-8 h-72 overflow-hidden rounded-3xl">
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
        <div className="mb-4 flex items-center gap-3 text-sm text-ink/50">
          <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
        </div>

        {/* Title */}
        <h1
          className="mb-8 text-3xl font-extrabold leading-tight tracking-tight text-ink md:text-4xl"
          dir={isRtl ? "rtl" : undefined}
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />

        {/* Body */}
        <article
          className="prose prose-ink max-w-none"
          dir={isRtl ? "rtl" : undefined}
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />

        {/* Footer CTA */}
        <div className="mt-12 border-t border-ink/10 pt-8">
          <Link
            href="/actualites"
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white"
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
      <Footer />
    </>
  );
}
