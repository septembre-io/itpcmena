import type { Metadata } from "next";
import { NavbarV3 } from "@/components/v3/layout/Navbar";
import { FooterV3 } from "@/components/v3/layout/Footer";
import { AppelsExplorer } from "@/components/v3/appels/AppelsExplorer";
import { getMenu, getHeaderMenu, getFooterFallback } from "@/lib/menu";
import { pageMetadata } from "@/lib/seo";
import { getAppels, getAppelFacets } from "@/lib/appels";

// ISR : la liste des appels évolue lentement (quelques posts/mois).
export const revalidate = 300;

type Loc = "fr" | "en" | "ar";

const S = {
  fr: {
    tag: "Appels, emplois & consultances",
    title: "Opportunités",
    sub: "Appels à consultant·e·s, offres d'emploi, appels à candidatures et appels d'offres publiés par ITPC-MENA. Filtrez par type, thématique et pays.",
    searchPlaceholder: "Rechercher un appel…",
    type: "Type",
    theme: "Thématique",
    geo: "Pays",
    sort: "Trier",
    sortRecent: "Plus récents",
    sortOld: "Plus anciens",
    sortDeadline: "Échéance proche",
    all: "Tous",
    reset: "Réinitialiser",
    openOnly: "Ouverts uniquement",
    statutOpen: "Ouvert",
    statutClosed: "Clos",
    deadline: "Date limite",
    apply: "Postuler",
    countNoun: { one: "appel", other: "appels" },
    empty: "Aucun appel ne correspond à ces critères.",
    read: "Voir l'appel",
    metaTitle: "Opportunités — ITPC MENA",
  },
  en: {
    tag: "Calls, jobs & consultancies",
    title: "Opportunities",
    sub: "Consultancy calls, job offers, calls for applications and tenders published by ITPC-MENA. Filter by type, topic and country.",
    searchPlaceholder: "Search a call…",
    type: "Type",
    theme: "Topic",
    geo: "Country",
    sort: "Sort",
    sortRecent: "Newest",
    sortOld: "Oldest",
    sortDeadline: "Deadline soon",
    all: "All",
    reset: "Reset",
    openOnly: "Open only",
    statutOpen: "Open",
    statutClosed: "Closed",
    deadline: "Deadline",
    apply: "Apply",
    countNoun: { one: "call", other: "calls" },
    empty: "No call matches these filters.",
    read: "View call",
    metaTitle: "Opportunities — ITPC MENA",
  },
  ar: {
    tag: "دعوات ووظائف واستشارات",
    title: "الفرص",
    sub: "دعوات للاستشاريين، عروض عمل، دعوات لتقديم الطلبات وطلبات العروض التي تنشرها آي تي بي سي مينا. صفّها حسب النوع والموضوع والبلد.",
    searchPlaceholder: "ابحث عن دعوة…",
    type: "النوع",
    theme: "الموضوع",
    geo: "البلد",
    sort: "ترتيب",
    sortRecent: "الأحدث",
    sortOld: "الأقدم",
    sortDeadline: "أقرب موعد",
    all: "الكل",
    reset: "إعادة تعيين",
    openOnly: "المفتوحة فقط",
    statutOpen: "مفتوح",
    statutClosed: "مغلق",
    deadline: "آخر أجل",
    apply: "قدّم الآن",
    countNoun: { one: "دعوة", other: "دعوة" },
    empty: "لا توجد دعوة مطابقة لهذه المعايير.",
    read: "عرض الدعوة",
    metaTitle: "الفرص — ITPC MENA",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const loc = (locale === "en" || locale === "ar" ? locale : "fr") as Loc;
  const l = S[loc];
  return pageMetadata({
    locale: loc,
    path: "financements",
    title: l.metaTitle,
    description: l.sub,
  });
}

export default async function FinancementsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = (locale === "en" || locale === "ar" ? locale : "fr") as Loc;
  const l = S[loc];

  const appels = await getAppels();
  const facets = getAppelFacets(appels);

  const navMenu = await getHeaderMenu(locale);
  const footMenu = await getMenu("v3-footer", locale, getFooterFallback(locale));

  return (
    <div className="bg-cream text-ink">
      <NavbarV3 menu={navMenu} />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <header className="mb-10" dir={loc === "ar" ? "rtl" : undefined}>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal">
            {l.tag}
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-ink">
            {l.title}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-ink/55">{l.sub}</p>
        </header>

        <AppelsExplorer
          appels={appels}
          facets={facets}
          locale={loc}
          labels={{
            searchPlaceholder: l.searchPlaceholder,
            type: l.type,
            theme: l.theme,
            geo: l.geo,
            sort: l.sort,
            sortRecent: l.sortRecent,
            sortOld: l.sortOld,
            sortDeadline: l.sortDeadline,
            all: l.all,
            reset: l.reset,
            openOnly: l.openOnly,
            statutOpen: l.statutOpen,
            statutClosed: l.statutClosed,
            deadline: l.deadline,
            apply: l.apply,
            countNoun: l.countNoun,
            empty: l.empty,
            read: l.read,
          }}
        />
      </main>
      <FooterV3 menu={footMenu} locale={loc} />
    </div>
  );
}
