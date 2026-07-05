import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { NavbarV3 } from "@/components/v3/layout/Navbar";
import { FooterV3 } from "@/components/v3/layout/Footer";
import { ShareButtons } from "@/components/v3/sections/ShareButtons";
import type { MenuItem } from "@/lib/menu";
import {
  getPostBySlug,
  getAllPostSlugs,
  getPosts,
  getPostLang,
  getTranslatedSlugs,
  decodeSlug,
  formatDate,
  stripHtml,
  type WPPost,
  type PostLang,
} from "@/lib/wordpress";

export const revalidate = 3600;

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
  const ogImg =
    post.jetpack_featured_media_url || post.yoast_head_json?.og_image?.[0]?.url;
  return {
    title: `${stripHtml(post.title.rendered)} — ITPC MENA`,
    description: stripHtml(post.excerpt.rendered).slice(0, 160),
    openGraph: ogImg ? { images: [{ url: ogImg }] } : undefined,
  };
}

// Libellés localisés
const S = {
  fr: {
    home: "Accueil",
    news: "Actualités",
    availIn: "Aussi disponible en",
    langName: { fr: "français", en: "anglais", ar: "arabe" },
    prev: "Précédent",
    next: "Suivant",
    related: "Sur le même thème",
    back: "Toutes les actualités",
    ctaTitle: "Poursuivre",
    plat: "Nos plateformes",
    platD: "Des outils utiles pour tout l’écosystème.",
    letter: "Newsletter",
    letterD: "Les mises à jour qui comptent, rien d’autre.",
    join: "Rejoindre le combat",
    joinD: "Il existe une place pour vous.",
  },
  en: {
    home: "Home",
    news: "News",
    availIn: "Also available in",
    langName: { fr: "French", en: "English", ar: "Arabic" },
    prev: "Previous",
    next: "Next",
    related: "Related reading",
    back: "All news",
    ctaTitle: "Keep going",
    plat: "Our platforms",
    platD: "Useful tools for the whole ecosystem.",
    letter: "Newsletter",
    letterD: "The updates that matter, nothing else.",
    join: "Join the fight",
    joinD: "There is a place for you.",
  },
  ar: {
    home: "الرئيسية",
    news: "الأخبار",
    availIn: "متوفر أيضاً بـ",
    langName: { fr: "الفرنسية", en: "الإنجليزية", ar: "العربية" },
    prev: "السابق",
    next: "التالي",
    related: "مواضيع ذات صلة",
    back: "كل الأخبار",
    ctaTitle: "تابع",
    plat: "منصّاتنا",
    platD: "أدوات مفيدة لكل المنظومة.",
    letter: "النشرة",
    letterD: "التحديثات التي تهمّ، لا غير.",
    join: "انضمّ إلى النضال",
    joinD: "هناك مكان لك.",
  },
} as const;

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
  const l = S[(locale as keyof typeof S)] ?? S.fr;

  const [translations, recent] = await Promise.all([
    getTranslatedSlugs(post),
    getPosts(locale, 12),
  ]);

  // Circulation : voisins (précédent/suivant) + articles liés
  const idx = recent.findIndex((p) => p.id === post.id);
  const prev = idx > 0 ? recent[idx - 1] : null;
  const next = idx >= 0 && idx < recent.length - 1 ? recent[idx + 1] : null;
  const related = recent.filter((p) => p.id !== post.id).slice(0, 3);

  const otherLocales = (Object.keys(translations) as PostLang[]).filter(
    (loc) => loc !== lang
  );

  // Menus V3 localisés (les ancres pointent vers la home de la langue)
  const anchor = (h: string) => `/${locale}#${h}`;
  const navMenu: MenuItem[] = [
    { label: "À propos", url: anchor("apropos") },
    { label: "La région", url: anchor("region") },
    { label: "Notre travail", url: anchor("travail") },
    { label: "Plateformes", url: anchor("plateformes") },
    { label: l.news, url: `/${locale}/actualites` },
    {
      label: "Nous contacter",
      url: "mailto:contact@itpcmena.org",
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

  const href = (p: WPPost) =>
    `/actualites/${decodeSlug(p.slug)}` as Parameters<typeof Link>[0]["href"];

  return (
    <div className="bg-cream text-ink">
      <NavbarV3 menu={navMenu} />

      <main className="mx-auto max-w-3xl px-6 pb-8 pt-10">
        {/* ① Fil d'Ariane */}
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-ink/45">
          <Link href="/" className="transition hover:text-ink">
            {l.home}
          </Link>
          <span>›</span>
          <Link href="/actualites" className="transition hover:text-ink">
            {l.news}
          </Link>
          <span>›</span>
          <span className="truncate text-ink/70">
            {stripHtml(post.title.rendered).slice(0, 42)}…
          </span>
        </nav>

        {img && (
          <div className="relative mb-8 h-72 overflow-hidden rounded-4xl md:h-80">
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

        <div className="mb-4 text-sm text-ink/50">
          <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
        </div>

        <h1
          className="text-3xl font-extrabold leading-tight tracking-tight text-ink md:text-[2.5rem]"
          dir={isRtl ? "rtl" : undefined}
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />

        {/* Traductions disponibles + partage */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-ink/10 py-4">
          {otherLocales.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-ink/45">
                {l.availIn}
              </span>
              {otherLocales.map((loc) => (
                <Link
                  key={loc}
                  href={`/actualites/${translations[loc]}` as Parameters<typeof Link>[0]["href"]}
                  locale={loc}
                  className="rounded-full border border-ink/15 px-3 py-1 text-xs font-semibold text-ink/70 transition hover:border-ink hover:bg-ink hover:text-white"
                >
                  {l.langName[loc]}
                </Link>
              ))}
            </div>
          ) : (
            <span />
          )}
          <ShareButtons locale={locale} title={stripHtml(post.title.rendered)} />
        </div>

        {/* Corps d'article — lisibilité renforcée */}
        <article
          className="article-body mt-10"
          dir={isRtl ? "rtl" : undefined}
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />

        {/* Partage bas de page */}
        <div className="mt-12 border-t border-ink/10 pt-6">
          <ShareButtons locale={locale} title={stripHtml(post.title.rendered)} />
        </div>

        {/* ① Navigation précédent / suivant */}
        {(prev || next) && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {prev ? (
              <Link
                href={href(prev)}
                className="group rounded-3xl border border-ink/10 bg-white p-5 transition hover:shadow-md"
              >
                <p className="text-xs font-semibold text-ink/45">← {l.prev}</p>
                <p
                  className="mt-1 font-bold leading-snug text-ink group-hover:text-red"
                  dangerouslySetInnerHTML={{ __html: prev.title.rendered }}
                />
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                href={href(next)}
                className="group rounded-3xl border border-ink/10 bg-white p-5 text-right transition hover:shadow-md"
              >
                <p className="text-xs font-semibold text-ink/45">{l.next} →</p>
                <p
                  className="mt-1 font-bold leading-snug text-ink group-hover:text-red"
                  dangerouslySetInnerHTML={{ __html: next.title.rendered }}
                />
              </Link>
            )}
          </div>
        )}
      </main>

      {/* ② Sur le même thème */}
      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="mb-8 text-2xl font-extrabold tracking-tight md:text-3xl">
            {l.related}
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {related.map((p) => {
              const pl = getPostLang(p);
              return (
                <Link
                  key={p.id}
                  href={href(p)}
                  className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-xl"
                >
                  {p.jetpack_featured_media_url && (
                    <div className="relative h-40 overflow-hidden">
                      <Image
                        src={p.jetpack_featured_media_url}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <p className="text-xs text-ink/45">
                      {formatDate(p.date, locale)}
                    </p>
                    <h3
                      className="mt-1 font-bold leading-snug text-ink transition group-hover:text-red"
                      dir={pl === "ar" ? "rtl" : undefined}
                      dangerouslySetInnerHTML={{ __html: p.title.rendered }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ③ Bandeau rebond — circulation vers les zones clés */}
      <section className="px-4 pb-20">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          <Link
            href="/#plateformes"
            className="group rounded-4xl bg-ink p-7 text-white transition hover:brightness-125"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-white/40">
              {l.plat}
            </p>
            <p className="mt-2 text-lg font-bold">{l.platD}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-amber">→</span>
          </Link>
          <Link
            href="/"
            className="group rounded-4xl bg-teal p-7 text-white transition hover:brightness-105"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-white/70">
              {l.letter}
            </p>
            <p className="mt-2 text-lg font-bold">{l.letterD}</p>
            <span className="mt-4 inline-block text-sm font-semibold">→</span>
          </Link>
          <a
            href="mailto:contact@itpcmena.org"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-4xl bg-red p-7 text-white transition hover:brightness-110"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-white/70">
              {l.join}
            </p>
            <p className="mt-2 text-lg font-bold">{l.joinD}</p>
            <span className="mt-4 inline-block text-sm font-semibold">→</span>
          </a>
        </div>
      </section>

      <FooterV3 menu={footMenu} />
    </div>
  );
}
