import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WpPageView } from "@/components/v3/layout/WpPageView";
import { resolveTranslatedPage, stripHtml } from "@/lib/wordpress";

// Page WP « Partenaires » (id 30438, slug FR). Traductions résolues via Polylang.
const SLUG = "partenaires";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const page = await resolveTranslatedPage(SLUG, locale);
  if (!page) return { title: "Partenaires — ITPC MENA" };
  return {
    title: `${stripHtml(page.title.rendered)} — ITPC MENA`,
    description: stripHtml(page.excerpt?.rendered ?? "").slice(0, 160),
  };
}

export default async function PartenairesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = await resolveTranslatedPage(SLUG, locale);
  if (!page) notFound();
  return <WpPageView page={page} locale={locale} />;
}
