import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { NavbarV3 } from "@/components/v3/layout/Navbar";
import { FooterV3 } from "@/components/v3/layout/Footer";
import { JsonLd } from "@/components/JsonLd";
import { RadiantMesh, RevealWrapper } from "@/components/ui";
import { getMenu, getHeaderMenu, getFooterFallback } from "@/lib/menu";
import { pageMetadata, breadcrumbSchema, SITE_URL } from "@/lib/seo";
import {
  getProjet,
  asLocale,
  PROJET_UI,
  type Accent,
  type ProductionStatus,
} from "@/lib/projet";

// ───────────────────────────────────────────────────────────────────────────
// Page projet (/{locale}/programmes/{slug}), première : L.A.N.C.E.R. (maquette
// « Maquette_page_LANCER.html », adaptée au gabarit V3 : hero sombre #v3-hero,
// stats à filet, cartes blanches, bloc sombre arrondi, CTA sur RadiantMesh).
// Contenu : WordPress (mu-plugin scripts/itpc-projets.php) fusionné avec le
// repli du code (src/lib/projet.ts). Un bloc sans contenu n'est pas affiché.
// Typo : sans partout (le serif Newsreader reste aux tribunes) ; en arabe, ni
// capitales ni interlettrage (ils cassent la liaison des lettres).
// ───────────────────────────────────────────────────────────────────────────

const borderAccent: Record<Accent, string> = {
  red: "border-red",
  amber: "border-amber",
  teal: "border-teal",
};

const statusDot: Record<ProductionStatus, string> = {
  available: "bg-teal",
  finalising: "bg-amber",
  ongoing: "bg-amber",
  testing: "bg-amber",
  upcoming: "bg-ink/25",
};

// Grilles selon le nombre d'éléments saisis (classes écrites en entier pour Tailwind).
const factCols = ["", "", "sm:grid-cols-2", "sm:grid-cols-3", "sm:grid-cols-2 lg:grid-cols-4"];
const targetCols = ["", "", "md:grid-cols-2", "md:grid-cols-3"];
const stepCols = ["", "", "sm:grid-cols-2", "sm:grid-cols-3", "sm:grid-cols-2 lg:grid-cols-4", "sm:grid-cols-2 lg:grid-cols-5", "sm:grid-cols-3 lg:grid-cols-6"];
const pillarCols = ["", "", "md:grid-cols-2", "md:grid-cols-3", "md:grid-cols-2 lg:grid-cols-4"];
const cols = (map: string[], n: number) => map[Math.min(n, map.length - 1)] ?? "";

type Params = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = await getProjet(slug, locale);
  if (!p) return { title: "ITPC MENA" };
  return pageMetadata({
    locale: asLocale(locale),
    path: `programmes/${slug}`,
    title: p.meta.title || `${p.hero.title} — ITPC MENA`,
    description: (p.meta.description || p.hero.lede).slice(0, 160),
  });
}

export default async function ProjetPage({ params }: Params) {
  const { locale, slug } = await params;
  const loc = asLocale(locale);
  const [p, navMenu, footMenu] = await Promise.all([
    getProjet(slug, locale),
    getHeaderMenu(locale),
    getMenu("v3-footer", locale, getFooterFallback(locale)),
  ]);
  if (!p) notFound();

  const ui = PROJET_UI[loc];
  const rtl = loc === "ar";
  const eyebrow = rtl
    ? "text-sm font-bold"
    : "text-xs font-bold uppercase tracking-[0.14em]";
  const tight = rtl ? "" : "tracking-tight";
  const arrow = rtl ? "←" : "→";
  const name = p.shortName || p.hero.eyebrow || p.hero.title;
  const lastStep = p.approach.steps.length - 1;
  const { context, targets, approach, governance, milestones, productions, learnings, partners, contact } = p;

  return (
    <div className="bg-cream text-ink">
      <JsonLd
        data={breadcrumbSchema([
          { name: ui.home, url: `${SITE_URL}/${loc}` },
          { name: ui.work, url: `${SITE_URL}/${loc}#travail` },
          { name, url: `${SITE_URL}/${loc}/programmes/${slug}` },
        ])}
      />
      <NavbarV3 menu={navMenu} />

      <main dir={rtl ? "rtl" : undefined}>
        {/* ── HERO ── */}
        <section id="v3-hero" className="relative overflow-hidden bg-ink text-white">
          <RadiantMesh className="absolute inset-0" opacity={0.55} />
          <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-14 md:pb-20 md:pt-20">
            <nav aria-label={ui.breadcrumb} className="flex flex-wrap items-center gap-2 text-sm text-white/50">
              <Link href="/" className="transition hover:text-white">{ui.home}</Link>
              <span aria-hidden="true">›</span>
              <Link href="/#travail" className="transition hover:text-white">{ui.work}</Link>
              <span aria-hidden="true">›</span>
              <span aria-current="page" className="text-white/75">{name}</span>
            </nav>

            {p.hero.eyebrow && <p className={`mt-10 text-amber ${eyebrow}`}>{p.hero.eyebrow}</p>}
            <h1 className={`mt-4 max-w-4xl text-4xl font-extrabold leading-[1.08] md:text-6xl ${tight}`}>
              {p.hero.title}
            </h1>
            {p.hero.lede && (
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/65">{p.hero.lede}</p>
            )}

            {p.hero.facts.length > 0 && (
              <dl className={`mt-12 grid gap-x-8 gap-y-6 border-t border-white/10 pt-8 ${cols(factCols, p.hero.facts.length)}`}>
                {p.hero.facts.map((f, i) => (
                  <div key={i}>
                    <dt className={`text-white/40 ${rtl ? "text-sm" : "text-[11px] font-bold uppercase tracking-[0.14em]"}`}>
                      {f.label}
                    </dt>
                    <dd className="mt-2 text-base font-semibold leading-snug text-white">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </section>

        {/* ── CONTEXTE ── */}
        {context.paragraphs.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
            <RevealWrapper className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-14">
              <div>
                {context.tag && <p className={`text-teal ${eyebrow}`}>{context.tag}</p>}
                {context.title && (
                  <h2 className={`mt-3 text-3xl font-extrabold leading-tight md:text-4xl ${tight}`}>{context.title}</h2>
                )}
              </div>
              <div className="space-y-5 text-lg leading-relaxed text-ink/70">
                {context.paragraphs.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </RevealWrapper>
          </section>
        )}

        {/* ── OBJECTIFS (stats à filet) ── */}
        {targets.items.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 pb-16">
            <RevealWrapper>
              {targets.tag && <h2 className={`text-teal ${eyebrow}`}>{targets.tag}</h2>}
              <div className={`mt-8 grid gap-x-10 gap-y-10 ${cols(targetCols, targets.items.length)}`}>
                {targets.items.map((it, i) => (
                  <div key={i} className={`border-s-4 ps-5 ${borderAccent[it.accent] ?? "border-teal"}`}>
                    {it.year && <p className="text-sm font-bold text-ink/45">{it.year}</p>}
                    <p className="mt-1 text-5xl font-extrabold tracking-tight text-ink">{it.value}</p>
                    {it.text && <p className="mt-2 text-sm leading-relaxed text-ink/60">{it.text}</p>}
                  </div>
                ))}
              </div>
            </RevealWrapper>
          </section>
        )}

        {/* ── DÉMARCHE ── */}
        {(approach.steps.length > 0 || approach.pillars.length > 0) && (
          <section className="mx-auto max-w-6xl px-6 py-16">
            <RevealWrapper className="max-w-3xl">
              {approach.tag && <p className={`text-teal ${eyebrow}`}>{approach.tag}</p>}
              {approach.title && (
                <h2 className={`mt-3 text-3xl font-extrabold leading-tight md:text-4xl ${tight}`}>{approach.title}</h2>
              )}
              {approach.intro && <p className="mt-4 text-lg leading-relaxed text-ink/60">{approach.intro}</p>}
            </RevealWrapper>

            {approach.steps.length > 0 && (
              <RevealWrapper>
                <ol className={`mt-10 grid gap-x-6 gap-y-8 ${cols(stepCols, approach.steps.length)}`}>
                  {approach.steps.map((s, i) => (
                    <li key={i} className={`border-t-4 pt-5 ${i === lastStep ? "border-teal" : "border-ink"}`}>
                      <span className={`text-3xl font-extrabold ${i === lastStep ? "text-teal" : "text-red"}`}>{i + 1}</span>
                      <h3 className="mt-2 text-lg font-bold text-ink">{s.title}</h3>
                      {s.body && <p className="mt-2 text-sm leading-relaxed text-ink/60">{s.body}</p>}
                    </li>
                  ))}
                </ol>
              </RevealWrapper>
            )}

            {approach.pillars.length > 0 && (
              <RevealWrapper className={`mt-12 grid gap-4 ${cols(pillarCols, approach.pillars.length)}`}>
                {approach.pillars.map((b, i) => (
                  <div key={i} className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-black/5">
                    <h3 className="text-lg font-bold text-ink">{b.title}</h3>
                    {b.body && <p className="mt-2 text-sm leading-relaxed text-ink/60">{b.body}</p>}
                  </div>
                ))}
              </RevealWrapper>
            )}
          </section>
        )}

        {/* ── GOUVERNANCE (bloc sombre arrondi) ── */}
        {governance.paragraphs.length > 0 && (
          <section className="px-4 py-16">
            <RevealWrapper className="mx-auto grid max-w-6xl gap-8 rounded-5xl bg-ink px-6 py-14 text-white md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-14 md:px-14">
              <div>
                {governance.tag && <p className={`text-amber ${eyebrow}`}>{governance.tag}</p>}
                {governance.title && (
                  <h2 className={`mt-3 text-3xl font-extrabold leading-tight md:text-4xl ${tight}`}>{governance.title}</h2>
                )}
              </div>
              <div className="space-y-4 text-base leading-relaxed text-white/70">
                {governance.paragraphs.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </RevealWrapper>
          </section>
        )}

        {/* ── ÉTAPES CLÉS ── */}
        {milestones.items.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 py-16">
            <RevealWrapper>
              {milestones.tag && <p className={`text-teal ${eyebrow}`}>{milestones.tag}</p>}
              {milestones.title && (
                <h2 className={`mt-2 text-3xl font-extrabold md:text-4xl ${tight}`}>{milestones.title}</h2>
              )}
              <ol className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
                {milestones.items.map((m, i) => (
                  <li key={i} className="grid items-baseline gap-2 py-5 md:grid-cols-[230px_1fr]">
                    <p className={`flex items-center gap-2.5 font-bold ${m.done ? "text-teal" : "text-ink/45"}`}>
                      <span
                        aria-hidden="true"
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${m.done ? "bg-teal" : "border-2 border-ink/25"}`}
                      />
                      {m.date}
                      <span className="sr-only"> ({m.done ? ui.done : ui.upcoming})</span>
                    </p>
                    <p className={m.done ? "text-ink/80" : "text-ink/55"}>{m.text}</p>
                  </li>
                ))}
              </ol>
            </RevealWrapper>
          </section>
        )}

        {/* ── PRODUCTIONS ── */}
        {productions.items.length > 0 && (
          <section id="productions" className="mx-auto max-w-6xl px-6 py-16">
            <RevealWrapper className="max-w-3xl">
              {productions.tag && <p className={`text-teal ${eyebrow}`}>{productions.tag}</p>}
              {productions.title && (
                <h2 className={`mt-3 text-3xl font-extrabold leading-tight md:text-4xl ${tight}`}>{productions.title}</h2>
              )}
              {productions.intro && <p className="mt-4 text-lg leading-relaxed text-ink/60">{productions.intro}</p>}
            </RevealWrapper>

            <RevealWrapper className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {productions.items.map((it, i) => (
                <article key={i} className="flex flex-col rounded-3xl bg-white p-7 shadow-sm ring-1 ring-black/5">
                  <span className="inline-flex items-center gap-2 self-start rounded-full bg-ink/5 px-3 py-1 text-xs font-bold text-ink/75">
                    <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${statusDot[it.status] ?? "bg-ink/25"}`} />
                    {ui.status[it.status] ?? ui.status.upcoming}
                  </span>
                  <h3 className="mt-4 text-lg font-bold leading-snug text-ink">{it.title}</h3>
                  {it.body && <p className="mt-2 text-sm leading-relaxed text-ink/60">{it.body}</p>}
                  {it.href ? (
                    <a
                      href={it.href}
                      className="mt-auto inline-flex min-h-11 items-center gap-1.5 pt-5 text-sm font-semibold text-red transition hover:text-ink"
                    >
                      {it.cta || ui.open} <span aria-hidden="true">{arrow}</span>
                    </a>
                  ) : it.note ? (
                    <p className="mt-auto pt-5 text-sm text-ink/50">{it.note}</p>
                  ) : null}
                </article>
              ))}
            </RevealWrapper>
          </section>
        )}

        {/* ── PREMIERS ENSEIGNEMENTS ── */}
        {learnings.items.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 py-16">
            <RevealWrapper className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-14">
              <div>
                {learnings.tag && <p className={`text-teal ${eyebrow}`}>{learnings.tag}</p>}
                {learnings.title && (
                  <h2 className={`mt-3 text-3xl font-extrabold leading-tight md:text-4xl ${tight}`}>{learnings.title}</h2>
                )}
                {learnings.source && <p className="mt-3 text-sm text-ink/50">{learnings.source}</p>}
              </div>
              <div className="divide-y divide-ink/10 border-y border-ink/10">
                {learnings.items.map((b, i) => (
                  <div key={i} className="py-5">
                    <h3 className="text-lg font-bold text-ink">{b.title}</h3>
                    {b.body && <p className="mt-1.5 text-base leading-relaxed text-ink/65">{b.body}</p>}
                  </div>
                ))}
              </div>
            </RevealWrapper>
          </section>
        )}

        {/* ── PARTENAIRES (noms, pas de logos) ── */}
        {partners.items.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 py-12">
            <RevealWrapper>
              {partners.tag && <h2 className={`text-ink/45 ${eyebrow}`}>{partners.tag}</h2>}
              <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {partners.items.map((n, i) => (
                  <li
                    key={i}
                    className="flex min-h-20 items-center justify-center rounded-3xl bg-white px-5 py-4 text-center text-sm font-semibold text-ink/70 shadow-sm ring-1 ring-black/5"
                  >
                    {n}
                  </li>
                ))}
              </ul>
            </RevealWrapper>
          </section>
        )}

        {/* ── CONTACT ── */}
        {contact.title && (
          <section className="px-4 py-16">
            <RevealWrapper className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-5xl px-6 py-14 md:px-14">
              <RadiantMesh className="absolute inset-0 -z-10" opacity={0.9} />
              <div className="absolute inset-0 -z-10 bg-cream/40" />
              <div className="flex flex-wrap items-center justify-between gap-8">
                <div className="max-w-2xl">
                  <h2 className={`text-3xl font-extrabold md:text-4xl ${tight}`}>{contact.title}</h2>
                  {contact.body && <p className="mt-4 text-base leading-relaxed text-ink/65">{contact.body}</p>}
                </div>
                {contact.cta && contact.href && (
                  <a
                    href={contact.href}
                    className="rounded-full bg-red px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
                  >
                    {contact.cta}
                  </a>
                )}
              </div>
              {contact.injectionPrompt && contact.injectionLink && contact.injectionHref && (
                <p className="mt-10 border-t border-ink/10 pt-6 text-sm text-ink/70">
                  {contact.injectionPrompt}{" "}
                  <a
                    href={contact.injectionHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-red underline underline-offset-4 transition hover:text-ink"
                  >
                    {contact.injectionLink}
                  </a>
                </p>
              )}
            </RevealWrapper>
          </section>
        )}
      </main>

      <FooterV3 menu={footMenu} locale={loc} />
    </div>
  );
}
