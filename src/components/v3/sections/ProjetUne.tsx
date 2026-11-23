import { Link } from "@/i18n/navigation";
import { RadiantMesh } from "@/components/ui";
import { asLocale, type ProjetContent } from "@/lib/projet";

// ───────────────────────────────────────────────────────────────────────────
// Projet à la une, en ouverture de l'accueil (version B retenue le 23/11/2026 :
// projet sombre en tête, hero habituel en clair, tribunes sombres inchangées).
// Reprend le bandeau de la page projet (contenu WordPress via getProjet, donc
// modifiable par ITPC) sans fil d'Ariane, avec un bouton vers la page.
// Porte id="v3-hero" : la navbar reste sombre tant qu'elle le survole.
// Remonte sous la navbar collante (-mt-24, compensé par pt-44 / md:pt-48) pour
// que le fond sombre aille jusqu'en haut de page, sans bande crème derrière le
// menu ; le texte reste à la même hauteur (pt-20 / md:pt-24 sous la navbar).
// Pas de RevealWrapper : c'est le premier bloc visible, il doit s'afficher tout
// de suite. Titre en h2 : le h1 de l'accueil reste la phrase de mission.
// ───────────────────────────────────────────────────────────────────────────

const DISCOVER = {
  fr: "Découvrir le projet",
  en: "Discover the project",
  ar: "اكتشفوا المشروع",
} as const;

export function ProjetUne({
  projet,
  slug,
  locale,
}: {
  projet: ProjetContent;
  slug: string;
  locale: string;
}) {
  const loc = asLocale(locale);
  const rtl = loc === "ar";
  const h = projet.hero;
  const facts = h.facts.slice(0, 4);

  return (
    <section
      id="v3-hero"
      className="relative -mt-24 w-full overflow-hidden bg-ink text-white"
      dir={rtl ? "rtl" : undefined}
    >
      <RadiantMesh className="absolute inset-0" opacity={0.55} />
      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-44 md:pt-48">
        {h.eyebrow && (
          <p
            className={`text-amber ${rtl ? "text-sm font-bold" : "text-xs font-bold uppercase tracking-[0.18em]"}`}
          >
            {h.eyebrow}
          </p>
        )}
        <h2
          className={`mt-4 max-w-4xl text-4xl font-extrabold leading-[1.08] md:text-6xl ${rtl ? "" : "tracking-tight"}`}
        >
          {h.title}
        </h2>
        {h.lede && (
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/65">{h.lede}</p>
        )}
        <Link
          href={`/programmes/${slug}`}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-red px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-95"
        >
          {DISCOVER[loc]} <span aria-hidden="true">{rtl ? "←" : "→"}</span>
        </Link>

        {facts.length > 0 && (
          <dl
            className={`mt-12 grid gap-x-8 gap-y-6 border-t border-white/10 pt-8 ${facts.length >= 4 ? "sm:grid-cols-2 lg:grid-cols-4" : facts.length === 3 ? "sm:grid-cols-3" : facts.length === 2 ? "sm:grid-cols-2" : ""}`}
          >
            {facts.map((f, i) => (
              <div key={i}>
                <dt
                  className={`text-white/40 ${rtl ? "text-sm" : "text-[11px] font-bold uppercase tracking-[0.14em]"}`}
                >
                  {f.label}
                </dt>
                <dd className="mt-2 text-base font-semibold leading-snug text-white">{f.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
