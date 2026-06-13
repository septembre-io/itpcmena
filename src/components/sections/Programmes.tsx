import { RevealWrapper } from "@/components/ui";
import { programmes } from "@/data/programmes";

export function Programmes() {
  return (
    <section id="programmes" className="px-4 py-12">
      <RevealWrapper className="mx-auto max-w-6xl rounded-5xl bg-ink px-6 py-16 text-white md:px-14">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/40">
          Nos programmes
        </p>
        <h2 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-tight md:text-4xl">
          Des initiatives qui façonnent l&apos;avenir de la santé
        </h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-white/55">
          Trois programmes complémentaires, déployés dans 14 pays de la région MENA.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {programmes.map((prog) => (
            <a
              key={prog.id}
              href={prog.href}
              className="group flex flex-col rounded-3xl bg-white/5 p-7 ring-1 ring-white/10 transition hover:bg-white/10"
            >
              <div
                className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${prog.iconBg}`}
              >
                {prog.icon}
              </div>
              <h3 className="text-lg font-bold leading-snug">{prog.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-white/55">
                {prog.description}
              </p>
              <span
                className={`mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition group-hover:gap-2.5 ${prog.ctaColor}`}
              >
                Découvrir →
              </span>
            </a>
          ))}
        </div>
      </RevealWrapper>
    </section>
  );
}
