import { NavbarV3 } from "@/components/v3/layout/Navbar";
import { FooterV3 } from "@/components/v3/layout/Footer";
import { PostCard } from "@/components/v3/PostCard";
import { getMenu, getHeaderFallback, getFooterFallback } from "@/lib/menu";
import { pageMetadata } from "@/lib/seo";
import { getSectionPosts, decodeSlug } from "@/lib/wordpress";
import type { Metadata } from "next";

const S = {
  fr: { tag: "Actualités", title: "Toutes les actualités", sub: "Suivez nos analyses, communiqués et actualités de la région MENA.", empty: "Aucun article disponible." },
  en: { tag: "News", title: "All news", sub: "Follow our analyses, statements and news from the MENA region.", empty: "No article available." },
  ar: { tag: "الأخبار", title: "كل الأخبار", sub: "تابعوا تحليلاتنا وبياناتنا وأخبار منطقة الشرق الأوسط وشمال إفريقيا.", empty: "لا يوجد مقال متاح." },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l = S[(locale as keyof typeof S)] ?? S.fr;
  const loc = locale === "en" || locale === "ar" ? locale : "fr";
  return pageMetadata({
    locale: loc,
    path: "actualites",
    title: `${l.title} — ITPC MENA`,
    description: l.sub,
  });
}

export default async function ActualitesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Page « Actualités » = uniquement la section Actualités (donc PAS les blogs /
  // op-ed, qui auront leur propre page) + on retire les appels d'offres, repérés
  // par leur slug « appel-… » (ils ont leur propre espace). On fetch large puis
  // on tronque à 12 après filtrage.
  const raw = await getSectionPosts(locale, "actualites", 24);
  const posts = raw
    .filter((p) => !decodeSlug(p.slug).startsWith("appel-"))
    .slice(0, 12);
  const l = S[(locale as keyof typeof S)] ?? S.fr;

  const navMenu = getHeaderFallback(locale);
  const footMenu = await getMenu("v3-footer", locale, getFooterFallback(locale));

  return (
    <div className="bg-cream text-ink">
      <NavbarV3 menu={navMenu} />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <header className="mb-10" dir={locale === "ar" ? "rtl" : undefined}>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal">
            {l.tag}
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-ink">
            {l.title}
          </h1>
          <p className="mt-3 text-base text-ink/55">{l.sub}</p>
        </header>

        {posts.length === 0 ? (
          <p className="text-ink/50">{l.empty}</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} locale={locale} />
            ))}
          </div>
        )}
      </main>
      <FooterV3 menu={footMenu} locale={locale} />
    </div>
  );
}
