import { RevealWrapper, CountUp } from "@/components/ui";

export function About() {
  return (
    <section id="apropos" className="mx-auto max-w-6xl px-6 py-12">
      <RevealWrapper className="grid items-center gap-12 md:grid-cols-2">
        {/* Text */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal">
            Qui sommes-nous
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            Une coalition régionale pour le droit à la santé
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink/60">
            ITPC-MENA travaille pour un accès équitable aux soins, médicaments
            et autres produits de santé. Avec une perspective mondiale et une
            transparence totale, nous œuvrons pour des solutions globales aux
            défis locaux dans toute la région MENA.
          </p>
          <a
            href="#"
            className="mt-7 inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white"
          >
            En savoir plus →
          </a>
        </div>

        {/* Stats 2×2 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-black/5">
            <CountUp
              end={14}
              className="text-4xl font-extrabold tracking-tight text-ink"
            />
            <div className="mt-1 text-sm font-medium text-ink/50">
              Pays couverts
            </div>
          </div>

          <div className="rounded-3xl bg-ink p-7 text-white shadow-sm">
            <CountUp
              end={20}
              prefix="+"
              className="text-4xl font-extrabold tracking-tight text-teal"
            />
            <div className="mt-1 text-sm font-medium text-white/55">
              Ans d&apos;engagement
            </div>
          </div>

          <div className="rounded-3xl bg-red p-7 text-white shadow-sm">
            <CountUp
              end={3}
              className="text-4xl font-extrabold tracking-tight text-white"
            />
            <div className="mt-1 text-sm font-medium text-white/70">
              Programmes actifs
            </div>
          </div>

          <div className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-black/5">
            <div className="text-2xl font-extrabold leading-tight tracking-tight text-ink">
              VIH · TB
              <br />
              Paludisme
            </div>
            <div className="mt-1 text-sm font-medium text-ink/50">
              Domaines d&apos;action
            </div>
          </div>
        </div>
      </RevealWrapper>
    </section>
  );
}
