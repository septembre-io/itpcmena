import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { NavbarV3 } from "@/components/v3/layout/Navbar";
import { FooterV3 } from "@/components/v3/layout/Footer";
import type { MenuItem } from "@/lib/menu";
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
  fr: "rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700",
  ar: "rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800",
  en: "rounded-md bg-green-50 px-2 py-0.5 text-[11px] font-bold text-green-700",
};
const langLabel: Record<PostLang, string> = { fr: "FR", ar: "ع", en: "EN" };

const S = {
  fr: { tag: "Actualités", title: "Toutes les actualités", sub: "Suivez nos analyses, communiqués et actualités de la région MENA.", empty: "Aucun article disponible." },
  en: { tag: "News", title: "All news", sub: "Follow our analyses, statements and news from the MENA region.", empty: "No article available." },
  ar: { tag: "الأخبار", title: "كل الأخبار", sub: "تابعوا تحليلاتنا وبياناتنا وأخبار منطقة الشرق الأوسط وشمال إفريقيا.", empty: "لا يوجد مقال متاح." },
} as const;

export default async function ActualitesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const posts = await getPosts(locale, 12);
  const l = S[(locale as keyof typeof S)] ?? S.fr;

  const anchor = (h: string) => `/${locale}#${h}`;
  const navMenu: MenuItem[] = [
    { label: "À propos", url: anchor("apropos") },
    { label: "La région", url: `/${locale}/la-region` },
    { label: "Notre travail", url: anchor("travail") },
    { label: "Plateformes", url: anchor("plateformes") },
    { label: l.tag, url: `/${locale}/actualites` },
    {
      label: "Nous contacter",
      url: "https://itpcmena.org/faire-un-don/",
      target: "_blank",
      cta: true,
    },
  ];
  const footMenu: MenuItem[] = [
    { label: "À propos", url: anchor("apropos") },
    { label: "La région", url: `/${locale}/la-region` },
    { label: "Notre travail", url: anchor("travail") },
    { label: "Plateformes", url: anchor("plateformes") },
  ];

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

function PostCard({ post, locale }: { post: WPPost; locale: string }) {
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
