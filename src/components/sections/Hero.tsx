import Image from "next/image";
import { RadiantMesh } from "@/components/ui";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <RadiantMesh className="absolute inset-0 -z-10" />

      {/* Text + CTAs */}
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-20 text-center md:pt-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-4 py-1.5 text-xs font-semibold tracking-wide text-ink/70 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-teal" />
          Coalition régionale · 14 pays MENA
        </span>

        <h1 className="mx-auto mt-7 max-w-4xl text-5xl font-extrabold leading-[1.04] tracking-tight text-ink md:text-7xl">
          L&apos;accès aux soins
          <br />
          est un <span className="text-red">droit</span>.
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink/60">
          ITPC-MENA défend un accès équitable aux médicaments et aux soins de
          santé pour toutes et tous, dans les 14 pays du Moyen-Orient et de
          l&apos;Afrique du Nord.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#programmes"
            className="rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
          >
            Découvrir nos programmes
          </a>
          <a
            href="#actualites"
            className="rounded-full border border-ink/15 bg-white/70 px-7 py-3.5 text-sm font-semibold text-ink backdrop-blur transition hover:bg-white"
          >
            Nos actualités →
          </a>
        </div>
      </div>

      {/* Hero image */}
      <div className="mx-auto max-w-6xl px-6 pb-6">
        <div className="relative overflow-hidden rounded-4xl border border-black/5 shadow-2xl">
          <div className="relative h-[300px] md:h-[440px]">
            <Image
              src="https://i0.wp.com/itpcmena.org/wp-content/uploads/2023/11/Galerie-Position-1-1-scaled.jpg?fit=2560%2C1707&ssl=1"
              alt="ITPC-MENA en action"
              fill
              sizes="(max-width: 768px) 100vw, 1152px"
              className="object-cover object-[center_30%]"
              priority
            />
          </div>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
          {/* Founded badge */}
          <div className="absolute bottom-5 left-5 rounded-2xl bg-white/90 px-5 py-3 backdrop-blur">
            <div className="text-2xl font-extrabold text-red">2003</div>
            <div className="text-xs font-medium text-ink/60">Fondée à Marrakech</div>
          </div>
        </div>
      </div>
    </section>
  );
}
