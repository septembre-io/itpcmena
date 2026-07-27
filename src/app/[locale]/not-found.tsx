import { getLocale } from "next-intl/server";
import { NavbarV3 } from "@/components/v3/layout/Navbar";
import { FooterV3 } from "@/components/v3/layout/Footer";
import { NotFoundSearch } from "@/components/v3/NotFoundSearch";
import { getHeaderFallback, getFooterFallback } from "@/lib/menu";
import { Link } from "@/i18n/navigation";

type Loc = "fr" | "en" | "ar";
type Href = Parameters<typeof Link>[0]["href"];

const S = {
  fr: {
    eyebrow: "Erreur 404",
    title: "Cette page est introuvable",
    sub: "Le site a été réorganisé récemment — la page a peut-être changé d'adresse. Cherchez votre contenu, ou repartez d'une rubrique.",
    linksTitle: "Rubriques principales",
    placeholder: "Rechercher un article, un appel…",
    searching: "Recherche…",
    noResults: "Aucun résultat pour « {q} ».",
    hint: "Tapez au moins deux lettres pour lancer la recherche.",
    links: [
      { href: "/", label: "Accueil" },
      { href: "/actualites", label: "Actualités" },
      { href: "/financements", label: "Opportunités" },
      { href: "/la-region", label: "La région" },
      { href: "/opinions", label: "Opinions" },
    ],
  },
  en: {
    eyebrow: "Error 404",
    title: "This page can't be found",
    sub: "The site was reorganized recently — the page may have moved. Search for your content, or start from a section.",
    linksTitle: "Main sections",
    placeholder: "Search an article, a call…",
    searching: "Searching…",
    noResults: "No result for “{q}”.",
    hint: "Type at least two letters to start searching.",
    links: [
      { href: "/", label: "Home" },
      { href: "/actualites", label: "News" },
      { href: "/financements", label: "Opportunities" },
      { href: "/la-region", label: "The region" },
      { href: "/opinions", label: "Op-eds" },
    ],
  },
  ar: {
    eyebrow: "خطأ 404",
    title: "تعذّر العثور على هذه الصفحة",
    sub: "أُعيد تنظيم الموقع مؤخرًا — ربما تغيّر عنوان الصفحة. ابحث عن المحتوى، أو انطلق من أحد الأقسام.",
    linksTitle: "الأقسام الرئيسية",
    placeholder: "ابحث عن مقال أو دعوة…",
    searching: "جارٍ البحث…",
    noResults: "لا نتائج لـ «{q}».",
    hint: "اكتب حرفين على الأقل لبدء البحث.",
    links: [
      { href: "/", label: "الرئيسية" },
      { href: "/actualites", label: "الأخبار" },
      { href: "/financements", label: "الفرص" },
      { href: "/la-region", label: "المنطقة" },
      { href: "/opinions", label: "الآراء" },
    ],
  },
} as const;

export default async function LocalizedNotFound() {
  const raw = await getLocale();
  const locale: Loc = raw === "en" || raw === "ar" ? raw : "fr";
  const l = S[locale];
  const isRtl = locale === "ar";

  const navMenu = getHeaderFallback(locale);
  const footMenu = getFooterFallback(locale);

  return (
    <div className="bg-cream text-ink">
      <NavbarV3 menu={navMenu} />
      <main
        className="mx-auto flex min-h-[62vh] max-w-3xl flex-col px-6 pb-24 pt-28"
        dir={isRtl ? "rtl" : undefined}
      >
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal">
          {l.eyebrow}
        </p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
          {l.title}
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-ink/55">
          {l.sub}
        </p>

        <div className="mt-8 max-w-xl">
          <NotFoundSearch
            locale={locale}
            labels={{
              placeholder: l.placeholder,
              searching: l.searching,
              noResults: l.noResults,
              hint: l.hint,
            }}
          />
        </div>

        <div className="mt-12">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink/40">
            {l.linksTitle}
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {l.links.map((link) => (
              <Link
                key={link.href}
                href={link.href as Href}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm ring-1 ring-black/5 transition hover:bg-ink hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <FooterV3 menu={footMenu} locale={locale} />
    </div>
  );
}
