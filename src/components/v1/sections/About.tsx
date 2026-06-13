import Image from "next/image";

export function AboutV1() {
  return (
    <section id="apropos" className="bg-[#F9F9F7] px-20 py-20">
      <div className="grid items-center gap-20 md:grid-cols-2">
        {/* Text */}
        <div>
          <p className="mb-3 text-[11.5px] font-bold uppercase tracking-[0.1em] text-[#1D9E75]">
            Qui sommes-nous
          </p>
          <h2 className="mb-4 text-[clamp(26px,3vw,36px)] font-bold leading-[1.2] tracking-[-0.02em] text-[#1A1A1A]">
            Une coalition régionale pour le droit à la santé
          </h2>
          <p className="mb-8 max-w-[600px] text-[16.5px] leading-[1.65] text-[#6B7280]">
            ITPC-MENA travaille pour un accès équitable aux soins, médicaments
            et autres produits de santé. Avec une perspective mondiale et une
            transparence totale, nous œuvrons pour des solutions globales aux
            défis locaux.
          </p>

          {/* Tabs — decorative for demo */}
          <div className="mb-6 flex flex-wrap gap-1">
            {["Mission", "Équipe", "Valeurs", "Notre région"].map((tab, i) => (
              <button
                key={tab}
                className={`rounded-full border px-4 py-[7px] text-[13px] font-medium transition ${
                  i === 0
                    ? "border-[#C1272D] bg-[#C1272D] text-white"
                    : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-gray-300 hover:text-[#1A1A1A]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <p className="mb-7 text-[15px] leading-[1.7] text-[#6B7280]">
            Notre engagement envers le droit à la santé guide notre quête d&rsquo;un
            bien-être pour tous, en encourageant la solidarité et l&rsquo;équité dans
            l&rsquo;ensemble de la région MENA.
          </p>

          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-[7px] border border-[#1A1A1A] px-[22px] py-[11px] text-[14px] font-medium text-[#1A1A1A] transition hover:bg-[#1A1A1A] hover:text-white"
          >
            En savoir plus <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </div>

        {/* Visual */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
          <Image
            src="https://i0.wp.com/itpcmena.org/wp-content/uploads/2023/11/Galerie-Position-3-scaled.jpg?fit=2560%2C1707&ssl=1"
            alt="ITPC-MENA en action"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {/* Badge */}
          <div className="absolute bottom-5 left-5 rounded-[10px] bg-white px-[18px] py-3 shadow-lg">
            <strong className="block text-[22px] font-bold text-[#C1272D]">2003</strong>
            <span className="text-[12px] text-[#6B7280]">Année de fondation</span>
          </div>
        </div>
      </div>
    </section>
  );
}
