import { RadiantMesh, RevealWrapper } from "@/components/ui";

export function ResourcesCTA() {
  return (
    <section id="ressources" className="px-4 py-12">
      <RevealWrapper className="relative mx-auto max-w-6xl overflow-hidden rounded-5xl px-6 py-16 text-center md:px-14">
        <RadiantMesh className="absolute inset-0 -z-10 opacity-90" />
        <div className="absolute inset-0 -z-10 bg-cream/30" />

        <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink/60">
          Ressources clés
        </p>
        <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
          Publications, outils et guides pour agir
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-ink/60">
          Explorez nos publications pour une compréhension approfondie des enjeux
          liés à l&apos;accès aux soins et aux médicaments.
        </p>

        {/* Newsletter form — wired in Phase 3 */}
        <form
          className="mx-auto mt-8 flex max-w-md flex-wrap items-center justify-center gap-2"
          action="#"
        >
          <input
            type="email"
            placeholder="votre@email.com"
            className="min-w-0 flex-1 rounded-full border border-ink/15 bg-white/90 px-5 py-3 text-sm text-ink outline-none backdrop-blur placeholder:text-ink/40 focus:border-ink/40"
          />
          <button
            type="submit"
            className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
          >
            S&apos;inscrire
          </button>
        </form>

        <a href="#" className="mt-4 inline-block text-sm font-semibold text-red">
          Accéder à toutes les ressources →
        </a>
      </RevealWrapper>
    </section>
  );
}
