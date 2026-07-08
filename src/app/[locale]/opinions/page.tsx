import { NavbarV3 } from "@/components/v3/layout/Navbar";
import { FooterV3 } from "@/components/v3/layout/Footer";
import { PostCard } from "@/components/v3/PostCard";
import { getHeaderFallback, getFooterFallback } from "@/lib/menu";
import { getSectionPosts } from "@/lib/wordpress";

const S = {
  fr: { tag: "Opinion", title: "Toutes les opinions", sub: "Analyses, tribunes et points de vue sur l'accès aux traitements dans la région MENA.", empty: "Aucune opinion disponible." },
  en: { tag: "Op-ed", title: "All op-eds", sub: "Analyses, op-eds and perspectives on access to treatment in the MENA region.", empty: "No op-ed available." },
  ar: { tag: "رأي", title: "كل الآراء", sub: "تحليلات وآراء ووجهات نظر حول الوصول إلى العلاج في منطقة الشرق الأوسط وشمال إفريقيا.", empty: "لا يوجد رأي متاح." },
} as const;

export default async function OpinionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Page « Opinions » = section blog / op-ed (catégorie « Opinion » 974, liée EN
  // 978 ; AR pas encore de traduction → vide en arabe, fail-closed).
  const posts = await getSectionPosts(locale, "blog", 30);
  const l = S[(locale as keyof typeof S)] ?? S.fr;

  const navMenu = getHeaderFallback(locale);
  const footMenu = getFooterFallback(locale);

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
      <FooterV3 menu={footMenu} />
    </div>
  );
}
