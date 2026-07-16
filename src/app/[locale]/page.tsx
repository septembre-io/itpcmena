import Image from "next/image";
import { NavbarV3 } from "@/components/v3/layout/Navbar";
import { FooterV3 } from "@/components/v3/layout/Footer";
import { NewsV2 } from "@/components/v3/sections/News";
import { RadiantMesh, RevealWrapper } from "@/components/ui";
import { getTranslations } from "next-intl/server";
import { getHomeV3, type Accent, type PlatformStatus } from "@/lib/homeV3";
import { getMenu, getHeaderFallback, getFooterFallback } from "@/lib/menu";
import { OpEdChapter } from "@/components/v3/sections/OpEd";
import { NewsletterForm } from "@/components/v3/sections/NewsletterForm";
import type { Metadata } from "next";
import { pageMetadata, organizationSchema } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

const HOME_META = {
  fr: {
    title:
      "ITPC-MENA — Accès équitable aux traitements en Afrique du Nord et Moyen-Orient",
    description:
      "La Coalition internationale pour la préparation aux traitements (MENA) agit pour un accès équitable à la santé : plaidoyer, données, plateformes et appels dans 14 pays.",
  },
  en: {
    title:
      "ITPC-MENA — Equitable access to treatment in the Middle East & North Africa",
    description:
      "The International Treatment Preparedness Coalition (MENA) advocates for equitable access to health: advocacy, data, platforms and calls across 14 countries.",
  },
  ar: {
    title:
      "آي تي بي سي مينا — الوصول العادل إلى العلاج في الشرق الأوسط وشمال إفريقيا",
    description:
      "الائتلاف الدولي للاستعداد للعلاج (مينا) يعمل من أجل وصول عادل إلى الصحة: المناصرة والبيانات والمنصّات والدعوات في 14 بلدًا.",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l = (locale === "en" || locale === "ar" ? locale : "fr") as keyof typeof HOME_META;
  return pageMetadata({
    locale: l,
    path: "",
    title: HOME_META[l].title,
    description: HOME_META[l].description,
  });
}

// Tailwind ne peut pas générer des classes dynamiques : on mappe les accents.
const borderAccent: Record<Accent, string> = {
  red: "border-red",
  amber: "border-amber",
  teal: "border-teal",
  ink: "border-ink",
};
const textAccent: Record<Accent, string> = {
  red: "text-red",
  amber: "text-amber",
  teal: "text-teal",
  ink: "text-ink",
};

// Le statut plateforme vient d'un champ ACF texte/select : le webmaster peut y
// saisir la valeur canonique (online/construction/request/contact) OU un libellé
// humain (« Nous contacter », « Sur demande »…). On ramène ces saisies vers la
// clé canonique pour retrouver le bon badge traduit. Toute valeur non reconnue
// est gérée en repli plus bas (affichée brute, jamais de crash).
const statusAliases: Record<string, PlatformStatus> = {
  "en-ligne": "online",
  "en-construction": "construction",
  "sur-demande": "request",
  "nous-contacter": "contact",
  "contactez-nous": "contact",
};
function normalizeStatus(raw: string): string {
  const slug = raw.trim().toLowerCase().replace(/[\s_]+/g, "-");
  return statusAliases[slug] ?? slug;
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [content, headerMenu, footerMenu] = await Promise.all([
    getHomeV3(locale),
    getMenu("v3-header", locale, getHeaderFallback(locale)),
    getMenu("v3-footer", locale, getFooterFallback(locale)),
  ]);
  const { hero, stats, mission, vision, region, oneHealth, work, values, platforms, newsletter } =
    content;

  // Libellés + styles des statuts de plateforme (traduits, éditables via messages/*.json).
  // Clé = valeur ACF du champ statut. Un statut inconnu (ex. choix ajouté côté WP
  // sans mapping ici) retombe sur `fallbackBadge` : on affiche la valeur brute
  // avec un style neutre plutôt que de faire planter la page.
  const tPlatform = await getTranslations({ locale, namespace: "platforms" });
  const statusBadge: Record<string, { label: string; className: string }> = {
    online: { label: tPlatform("statusOnline"), className: "bg-teal/20 text-teal" },
    construction: { label: tPlatform("statusConstruction"), className: "bg-white/10 text-white/60" },
    request: { label: tPlatform("statusRequest"), className: "bg-amber/20 text-amber" },
    contact: { label: tPlatform("statusContact"), className: "bg-amber/20 text-amber" },
  };
  const badgeFor = (status: string) =>
    statusBadge[status] ?? { label: status, className: "bg-white/10 text-white/60" };

  return (
    <div className="bg-cream text-ink">
      <JsonLd data={organizationSchema()} />
      <NavbarV3 menu={headerMenu} />


      <main>
        {/* ── HERO — sombre militant (repris de la proposition Plaidoyer) ── */}
        <section id="v3-hero" className="relative overflow-hidden bg-ink text-white">
          <RadiantMesh className="absolute inset-0" opacity={0.7} />
          <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-20 text-center md:pt-28">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-wide text-white/80 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-amber" />
              {hero.badge}
            </span>
            <h1
              className="mx-auto mt-7 max-w-4xl text-5xl font-extrabold leading-[1.02] tracking-tight md:text-7xl"
              dangerouslySetInnerHTML={{ __html: hero.titleHtml }}
            />
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/65">
              {hero.subtitle}
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <a
                href={hero.ctaPrimary.href}
                className="rounded-full bg-red px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
              >
                {hero.ctaPrimary.label}
              </a>
              <a
                href={hero.ctaSecondary.href}
                className="rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
              >
                {hero.ctaSecondary.label}
              </a>
            </div>
          </div>
        </section>

        {/* ── STATS À FILET ── */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <RevealWrapper>
            <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-teal">
              {stats.label}
            </p>
            <div className="mt-10 grid gap-x-10 gap-y-12 md:grid-cols-3">
              {stats.items.map((s) => (
                <div key={s.value} className={`border-l-4 pl-5 ${borderAccent[s.accent]}`}>
                  <div className="text-5xl font-extrabold tracking-tight text-ink">
                    {s.value}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">{s.text}</p>
                </div>
              ))}
            </div>
          </RevealWrapper>
        </section>

        {/* ── MISSION / VISION ── */}
        <section id="apropos" className="mx-auto max-w-6xl px-6 py-16">
          <RevealWrapper className="grid gap-10 rounded-4xl bg-white p-9 shadow-sm ring-1 ring-black/5 md:grid-cols-2 md:gap-0 md:divide-x md:divide-ink/10 md:p-11">
            <div className="md:pr-12">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal">
                {mission.tag}
              </p>
              <p className="mt-3 text-xl font-bold leading-snug text-ink">
                {mission.title}
              </p>
              <p className="mt-3 text-base leading-relaxed text-ink/60">
                {mission.body}
              </p>
            </div>
            <div className="md:pl-12">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-red">
                {vision.tag}
              </p>
              <p className="mt-3 text-xl font-bold leading-snug text-ink">
                {vision.title}
              </p>
              <p className="mt-3 text-base leading-relaxed text-ink/60">
                {vision.body}
              </p>
            </div>
          </RevealWrapper>
        </section>

        {/* ── RÉGION ── */}
        <section id="region" className="mx-auto max-w-6xl px-6 py-16">
          <RevealWrapper className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal">
                {region.tag}
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
                {region.title}
              </h2>
              <p className="mt-5 text-base leading-relaxed text-ink/60">
                {region.body}
              </p>
              <p
                className="mt-6 max-w-md text-xl font-bold leading-snug text-ink"
                dangerouslySetInnerHTML={{ __html: region.quoteHtml }}
              />
            </div>
            <div className="relative overflow-hidden rounded-4xl border border-black/5 shadow-2xl">
              <div className="relative h-[380px] w-full">
                <Image
                  src={region.image}
                  alt="ITPC-MENA sur le terrain"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-[center_30%]"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
              <div className="absolute bottom-5 left-5 rounded-2xl bg-white/90 px-5 py-3 backdrop-blur">
                <div className="text-2xl font-extrabold text-red">
                  {region.badge.value}
                </div>
                <div className="text-xs font-medium text-ink/60">
                  {region.badge.label}
                </div>
              </div>
            </div>
          </RevealWrapper>
        </section>

        {/* ── ONE HEALTH ── */}
        <section id="onehealth" className="px-4 py-16">
          <RevealWrapper className="mx-auto grid max-w-6xl items-center gap-10 rounded-5xl bg-teal px-6 py-14 text-white md:grid-cols-2 md:px-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">
                {oneHealth.tag}
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
                {oneHealth.title}
              </h2>
            </div>
            <p className="text-base leading-relaxed text-white/85">
              {oneHealth.body}
            </p>
          </RevealWrapper>
        </section>

        {/* ── NOTRE TRAVAIL ── */}
        <section id="travail" className="mx-auto max-w-6xl px-6 py-16">
          <RevealWrapper className="mb-9">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal">
              {work.tag}
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">
              {work.title}
            </h2>
          </RevealWrapper>
          <RevealWrapper className="grid gap-4 md:grid-cols-4">
            {work.cards.map((c) => (
              <div
                key={c.title}
                className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5"
              >
                <h3 className="font-bold text-ink">{c.title}</h3>
                <p className="mt-2 text-sm text-ink/60">{c.body}</p>
              </div>
            ))}
          </RevealWrapper>
        </section>

        {/* ── VALEURS ── */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <RevealWrapper>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal">
              {values.tag}
            </p>
            <div className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
              {values.items.map((v) => (
                <div
                  key={v.title}
                  className="grid items-baseline gap-2 py-5 md:grid-cols-[220px_1fr]"
                >
                  <div className={`font-bold ${textAccent[v.accent]}`}>
                    {v.title}
                  </div>
                  <p className="text-ink/60">{v.body}</p>
                </div>
              ))}
            </div>
          </RevealWrapper>
        </section>

        {/* ── PLATEFORMES ── */}
        <section id="plateformes" className="px-4 py-16">
          <RevealWrapper className="mx-auto max-w-6xl rounded-5xl bg-ink px-6 py-16 text-white md:px-14">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/40">
              {platforms.tag}
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-tight md:text-4xl">
              {platforms.title}
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {platforms.items.map((p) => {
                const s = badgeFor(normalizeStatus(p.status));
                const badge = (
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold ${s.className}`}
                  >
                    {s.label}
                  </span>
                );
                const inner = (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold">{p.title}</h3>
                      {badge}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-white/55">
                      {p.body}
                    </p>
                  </>
                );
                return p.href ? (
                  <a
                    key={p.title}
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-3xl bg-white/5 p-7 ring-1 ring-white/10 transition hover:bg-white/10"
                  >
                    {inner}
                  </a>
                ) : (
                  <div
                    key={p.title}
                    className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10"
                  >
                    {inner}
                  </div>
                );
              })}
            </div>
          </RevealWrapper>
        </section>

        {/* ── ACTUALITÉS (grille) + OP-ED (chapitre sombre pleine largeur) ── */}
        <NewsV2
          locale={locale}
          section="actualites"
          id="actualites"
        />
        <OpEdChapter locale={locale} />

        {/* ── NEWSLETTER ── */}
        <section className="px-4 py-16">
          <RevealWrapper className="relative mx-auto max-w-6xl overflow-hidden rounded-5xl px-6 py-14 text-center md:px-14">
            <RadiantMesh className="absolute inset-0 -z-10" opacity={0.9} />
            <div className="absolute inset-0 -z-10 bg-cream/40" />
            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight md:text-4xl">
              {newsletter.title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-ink/60">
              {newsletter.body}
            </p>
            <NewsletterForm
              locale={locale}
              placeholder={newsletter.placeholder}
              cta={newsletter.cta}
            />
          </RevealWrapper>
        </section>
      </main>

      <FooterV3 menu={footerMenu} />
    </div>
  );
}
