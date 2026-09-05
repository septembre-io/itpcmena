import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WpPageView } from "@/components/v3/layout/WpPageView";
import { resolveTranslatedPage, stripHtml } from "@/lib/wordpress";
import { pageMetadata } from "@/lib/seo";
import { buildTeamCards } from "@/lib/content";

// Page WP « L'ÉQUIPE » (id 3662, slug FR). Traductions Polylang :
// EN 1314 (our-team), AR 1693 (our-team-ar) — résolues par slug de base.
const SLUG = "lequipe";

const TITLE: Record<string, string> = {
  fr: "L'équipe",
  en: "Our team",
  ar: "فريقنا",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const page = await resolveTranslatedPage(SLUG, locale);
  const fallback = TITLE[locale] ?? TITLE.fr;
  if (!page) return { title: `${fallback} — ITPC MENA` };
  return pageMetadata({
    locale,
    path: "equipe",
    title: `${stripHtml(page.title.rendered)} — ITPC MENA`,
    description: stripHtml(page.excerpt?.rendered ?? "").slice(0, 160),
  });
}

export default async function EquipePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = await resolveTranslatedPage(SLUG, locale);
  if (!page) notFound();
  // Le contenu WP est saisi en paragraphes (photo, nom — fonction, bio) :
  // on le reformate en cartes avant le rendu générique.
  const withCards = {
    ...page,
    content: { ...page.content, rendered: buildTeamCards(page.content.rendered) },
  };
  return <WpPageView page={withCards} locale={locale} />;
}
