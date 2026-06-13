export function ResourcesCTAV1() {
  return (
    <div id="ressources" className="bg-[#1D9E75] px-20 py-16">
      <div className="flex flex-wrap items-center justify-between gap-10">
        <div className="max-w-[560px]">
          <p className="mb-3 text-[11.5px] font-bold uppercase tracking-[0.1em] text-white/65">
            Ressources clés
          </p>
          <h2 className="mb-3 text-[clamp(26px,3vw,36px)] font-bold leading-[1.2] tracking-[-0.02em] text-white">
            Publications, outils et guides
          </h2>
          <p className="text-[16px] text-white/75">
            Explorez nos publications pour une compréhension approfondie des
            enjeux liés à l&rsquo;accès aux soins, aux médicaments et aux produits de
            santé.
          </p>
        </div>
        <a
          href="https://itpcmena.org/ressources/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-white px-7 py-[13px] text-[15px] font-semibold text-[#1D9E75] transition hover:bg-[#E1F5EE]"
        >
          Accéder aux ressources →
        </a>
      </div>
    </div>
  );
}
