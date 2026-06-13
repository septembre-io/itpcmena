import { Link } from "@/i18n/navigation";

export function HeroV1() {
  return (
    <section className="relative flex min-h-[540px] max-h-[780px] h-[88vh] items-end overflow-hidden">
      {/* Photo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://i0.wp.com/itpcmena.org/wp-content/uploads/2023/11/Galerie-Position-1-1-scaled.jpg?fit=2560%2C1707&ssl=1')",
          backgroundPosition: "center 30%",
        }}
      />
      {/* Gradient overlay — heavy at bottom */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(15,15,15,0.88) 0%, rgba(15,15,15,0.45) 45%, rgba(15,15,15,0.15) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-[760px] px-5 md:px-20 pb-[72px]">
        <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/65">
          Région MENA · 14 pays
        </p>
        <h1
          className="mb-5 text-[clamp(36px,4.5vw,58px)] font-bold leading-[1.12] tracking-[-0.02em] text-white"
        >
          L&rsquo;accès aux soins
          <br />
          est un{" "}
          <em className="not-italic" style={{ color: "#6DE0B8" }}>
            droit.
          </em>
          <br />
          Nous le défendons.
        </h1>
        <p className="mb-9 max-w-[560px] text-[17px] leading-[1.6] text-white/72">
          ITPC-MENA œuvre pour un accès équitable aux médicaments et aux soins
          de santé pour toutes et tous dans la région MENA.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="#programmes"
            className="inline-flex items-center gap-2 rounded-lg bg-[#1D9E75] px-7 py-[13px] text-[15px] font-semibold text-white transition hover:-translate-y-px hover:bg-[#168a64]"
          >
            Nos programmes →
          </a>
          <a
            href="#actualites"
            className="inline-flex items-center rounded-lg border border-white/35 bg-white/12 px-7 py-[13px] text-[15px] font-medium text-white backdrop-blur-sm transition hover:bg-white/22"
          >
            Dernières actualités
          </a>
        </div>
      </div>
    </section>
  );
}
