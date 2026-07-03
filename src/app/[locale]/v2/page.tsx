import Image from "next/image";
import { NavbarV2 } from "@/components/v2/layout/Navbar";
import { FooterV2 } from "@/components/v2/layout/Footer";
import { NewsV2 } from "@/components/v2/sections/News";
import { RadiantMesh, RevealWrapper, CountUp } from "@/components/ui";

export default async function HomeV2Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="bg-cream text-ink">
      {/* Version badge */}
      <div className="fixed right-4 top-4 z-[999] rounded-full bg-ink/90 px-3 py-1 text-[11px] font-bold tracking-wider text-white">
        V2 · INSTITUTIONNEL CHAUD
      </div>

      <NavbarV2 />

      <main>
        {/* ── HERO ── */}
        <section className="relative overflow-hidden">
          <RadiantMesh className="absolute inset-0 -z-10" />
          <div className="mx-auto max-w-5xl px-6 pb-12 pt-20 text-center md:pt-28">
            <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-4 py-1.5 text-xs font-semibold tracking-wide text-ink/70 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-teal" />
              Coalition régionale · 14 pays d&rsquo;Afrique du Nord et du
              Moyen-Orient
            </span>
            <h1 className="mx-auto mt-7 max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
              L&rsquo;accès à la santé
              <br />
              est un <span className="text-red">droit</span>.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink/60">
              ITPC-MENA œuvre pour lever les barrières d&rsquo;accès aux
              traitements contre le VIH, les IST, la tuberculose et les hépatites
              — et pour donner aux populations concernées les moyens de
              revendiquer leurs droits.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#travail"
                className="rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
              >
                Découvrir notre travail
              </a>
              <a
                href="#region"
                className="rounded-full border border-ink/15 bg-white/70 px-7 py-3.5 text-sm font-semibold text-ink backdrop-blur transition hover:bg-white"
              >
                Pourquoi la région MENA →
              </a>
            </div>
          </div>
        </section>

        {/* ── STATS À FILET ── */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <RevealWrapper>
            <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-teal">
              Une urgence ignorée, en chiffres
            </p>
            <div className="mt-10 grid gap-x-10 gap-y-12 md:grid-cols-3">
              <div className="border-l-4 border-red pl-5">
                <div className="text-5xl font-extrabold tracking-tight text-ink">
                  <CountUp end={29} />%
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">
                  des besoins de financement identifiés pour 2030 sont couverts.
                  Le reste manque.
                </p>
              </div>
              <div className="border-l-4 border-amber pl-5">
                <div className="text-5xl font-extrabold tracking-tight text-ink">
                  <CountUp end={94} prefix="+" />%
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">
                  de nouvelles infections VIH depuis 2010, à rebours du reste du
                  monde.
                </p>
              </div>
              <div className="border-l-4 border-teal pl-5">
                <div className="text-5xl font-extrabold tracking-tight text-ink">
                  &lt; 1/2
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">
                  des personnes concernées sous traitement, contre plus de 3 sur
                  4 ailleurs.
                </p>
              </div>
            </div>
          </RevealWrapper>
        </section>

        {/* ── MISSION / VISION ── */}
        <section id="apropos" className="mx-auto max-w-6xl px-6 py-16">
          <RevealWrapper className="grid gap-10 rounded-4xl bg-white p-9 shadow-sm ring-1 ring-black/5 md:grid-cols-2 md:gap-0 md:divide-x md:divide-ink/10 md:p-11">
            <div className="md:pr-12">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal">
                Notre mission
              </p>
              <p className="mt-3 text-xl font-bold leading-snug text-ink">
                Faire de l&rsquo;accès à la santé une réalité dans la région MENA
              </p>
              <p className="mt-3 text-base leading-relaxed text-ink/60">
                En levant les barrières d&rsquo;accès aux traitements et en
                donnant aux populations concernées les moyens de revendiquer
                leurs droits.
              </p>
            </div>
            <div className="md:pl-12">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-red">
                Notre vision
              </p>
              <p className="mt-3 text-xl font-bold leading-snug text-ink">
                Un monde où l&rsquo;accès à la santé est garanti pour toutes et
                tous
              </p>
              <p className="mt-3 text-base leading-relaxed text-ink/60">
                Indépendamment du pays où l&rsquo;on vit, de ses ressources, ou
                de qui l&rsquo;on est.
              </p>
            </div>
          </RevealWrapper>
        </section>

        {/* ── RÉGION ── */}
        <section id="region" className="mx-auto max-w-6xl px-6 py-16">
          <RevealWrapper className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal">
                Afrique du Nord & Moyen-Orient
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
                Une région absente des cartes prioritaires — et c&rsquo;est ce
                qui la rend dangereuse à ignorer
              </h2>
              <p className="mt-5 text-base leading-relaxed text-ink/60">
                La région affiche la prévalence du VIH la plus basse au monde,
                mais c&rsquo;est l&rsquo;une des seules où les nouvelles
                infections augmentent encore. Notre rôle : rendre visibles les
                données, connecter les acteurs locaux aux instances
                internationales, et porter la voix des plus exposés.
              </p>
              <p className="mt-6 max-w-md text-xl font-bold leading-snug text-ink">
                « Les personnes concernées ne sont pas les bénéficiaires de notre
                travail. <span className="text-red">Elles en sont les
                architectes.</span> »
              </p>
            </div>
            <div className="relative overflow-hidden rounded-4xl border border-black/5 shadow-2xl">
              <div className="relative h-[380px] w-full">
                <Image
                  src="https://i0.wp.com/itpcmena.org/wp-content/uploads/2023/11/Galerie-Position-1-1-scaled.jpg?fit=2560%2C1707&ssl=1"
                  alt="ITPC-MENA sur le terrain"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-[center_30%]"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
              <div className="absolute bottom-5 left-5 rounded-2xl bg-white/90 px-5 py-3 backdrop-blur">
                <div className="text-2xl font-extrabold text-red">14 pays</div>
                <div className="text-xs font-medium text-ink/60">
                  d&rsquo;intervention
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
                Notre approche
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
                One Health : relier santé humaine, animale et environnement
              </h2>
            </div>
            <p className="text-base leading-relaxed text-white/85">
              Particulièrement pertinente dans une région parmi les plus exposées
              au monde au stress hydrique et au changement climatique. Nous
              travaillons dans 14 pays avec cette approche intégrée, parce que les
              défis sanitaires de demain ne s&rsquo;arrêtent pas aux frontières
              des disciplines.
            </p>
          </RevealWrapper>
        </section>

        {/* ── NOTRE TRAVAIL ── */}
        <section id="travail" className="mx-auto max-w-6xl px-6 py-16">
          <RevealWrapper className="mb-9">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal">
              Notre travail
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">
              Un travail de terrain, traduit en données
            </h2>
          </RevealWrapper>
          <RevealWrapper className="grid gap-4 md:grid-cols-4">
            {[
              {
                t: "Veille stratégique",
                d: "Brevets, accords de libre-échange, réglementation → l'Observatoire.",
              },
              {
                t: "Veille communautaire",
                d: "Ruptures de stock, refus de soin → les rapports Missing the Target.",
              },
              {
                t: "Plaidoyer & formation",
                d: "Les connaissances pour comprendre et revendiquer ses droits.",
              },
              {
                t: "Mise en réseau",
                d: "Relier les acteurs → l'Annuaire des OSC.",
              },
            ].map((c) => (
              <div
                key={c.t}
                className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5"
              >
                <h3 className="font-bold text-ink">{c.t}</h3>
                <p className="mt-2 text-sm text-ink/60">{c.d}</p>
              </div>
            ))}
          </RevealWrapper>
        </section>

        {/* ── VALEURS ── */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <RevealWrapper>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal">
              Nos valeurs
            </p>
            <div className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
              {[
                {
                  t: "Approche communautaire",
                  c: "text-teal",
                  d: "Nos priorités se construisent avec les populations-clés, pas pour elles.",
                },
                {
                  t: "Équité",
                  c: "text-red",
                  d: "L'accès ne devrait dépendre ni de la richesse d'un pays ni de sa position géographique.",
                },
                {
                  t: "Solidarité",
                  c: "text-ink",
                  d: "Des ponts entre pays, entre réseaux internationaux et entre générations d'activistes.",
                },
                {
                  t: "Transparence",
                  c: "text-ink",
                  d: "La redevabilité n'est pas une option, c'est une condition de notre légitimité.",
                },
                {
                  t: "Impact",
                  c: "text-amber",
                  d: "Nous mesurons notre travail par son utilité réelle, pas par sa visibilité.",
                },
              ].map((v) => (
                <div
                  key={v.t}
                  className="grid items-baseline gap-2 py-5 md:grid-cols-[220px_1fr]"
                >
                  <div className={`font-bold ${v.c}`}>{v.t}</div>
                  <p className="text-ink/60">{v.d}</p>
                </div>
              ))}
            </div>
          </RevealWrapper>
        </section>

        {/* ── PLATEFORMES ── */}
        <section id="plateformes" className="px-4 py-16">
          <RevealWrapper className="mx-auto max-w-6xl rounded-5xl bg-ink px-6 py-16 text-white md:px-14">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/40">
              Nos plateformes
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-tight md:text-4xl">
              Des outils utiles pour tout l&rsquo;écosystème
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <a
                href="https://itpcmena.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-3xl bg-white/5 p-7 ring-1 ring-white/10 transition hover:bg-white/10"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">3ilaji</h3>
                  <span className="rounded-full bg-teal/20 px-3 py-1 text-[11px] font-bold text-teal">
                    En ligne
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/55">
                  Tout ce que vous devez savoir sur votre traitement.
                </p>
              </a>
              {[
                {
                  t: "Annuaire des OSC MENA",
                  d: "Identifier un partenaire local dans 14 pays — filtrable par pays, thématique et financement.",
                },
                {
                  t: "Observatoire d'accès aux médicaments",
                  d: "Brevets, génériques, prix — pays par pays. Le seul outil de ce type sur la région.",
                },
                {
                  t: "Bibliothèque Missing the Target",
                  d: "Vingt ans de données communautaires + guides de formation FR/AR/EN.",
                },
              ].map((p) => (
                <div
                  key={p.t}
                  className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">{p.t}</h3>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/60">
                      En construction
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">
                    {p.d}
                  </p>
                </div>
              ))}
            </div>
          </RevealWrapper>
        </section>

        {/* ── ACTUALITÉS (WordPress) ── */}
        <NewsV2 locale={locale} />

        {/* ── NEWSLETTER ── */}
        <section className="px-4 py-16">
          <RevealWrapper className="relative mx-auto max-w-6xl overflow-hidden rounded-5xl px-6 py-14 text-center md:px-14">
            <RadiantMesh className="absolute inset-0 -z-10" opacity={0.9} />
            <div className="absolute inset-0 -z-10 bg-cream/40" />
            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight md:text-4xl">
              Les mises à jour qui comptent, rien d&rsquo;autre.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-ink/60">
              On vous prévient quand une donnée change, quand un outil sort, ou
              quand un plaidoyer aboutit.
            </p>
            <form
              className="mx-auto mt-8 flex max-w-md flex-wrap items-center justify-center gap-2"
              action="https://itpcmena.org/"
              target="_blank"
            >
              <input
                type="email"
                placeholder="votre@email.com"
                className="min-w-0 flex-1 rounded-full border border-ink/15 bg-white/90 px-5 py-3 text-sm outline-none backdrop-blur placeholder:text-ink/40 focus:border-ink/40"
              />
              <button
                type="submit"
                className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
              >
                S&rsquo;inscrire
              </button>
            </form>
          </RevealWrapper>
        </section>
      </main>

      <FooterV2 />
    </div>
  );
}
