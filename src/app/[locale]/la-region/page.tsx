import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WpPageView } from "@/components/v3/layout/WpPageView";
import { resolveTranslatedPage, stripHtml } from "@/lib/wordpress";
import { pageMetadata } from "@/lib/seo";

// Page WP de référence (FR). Les autres langues sont résolues via Polylang.
const SLUG = "la-region-afrique-du-nord-et-moyen-orient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const page = await resolveTranslatedPage(SLUG, locale);
  if (!page) return { title: "La région — ITPC MENA" };
  return pageMetadata({
    locale,
    path: "la-region",
    title: `${stripHtml(page.title.rendered)} — ITPC MENA`,
    description: stripHtml(page.excerpt?.rendered ?? "").slice(0, 160),
  });
}

export default async function RegionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = await resolveTranslatedPage(SLUG, locale);
  if (!page) notFound();
  return <WpPageView page={page} locale={locale} />;
}
