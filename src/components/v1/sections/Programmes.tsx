import { Link } from "@/i18n/navigation";
import { programmes } from "@/data/programmes";

const cardAccent = [
  { top: "bg-[#1D9E75]", link: "text-[#1D9E75]", icon: "bg-[#E1F5EE]" },
  { top: "bg-[#C1272D]", link: "text-[#C1272D]", icon: "bg-[#FDECEA]" },
  { top: "bg-[#E07A2F]", link: "text-[#E07A2F]", icon: "bg-[#FEF3E7]" },
];

export function ProgrammesV1() {
  return (
    <section id="programmes" className="bg-white px-5 md:px-20 py-20">
      <p className="mb-3 text-[11.5px] font-bold uppercase tracking-[0.1em] text-[#1D9E75]">
        Nos programmes
      </p>
      <h2 className="mb-4 text-[clamp(26px,3vw,36px)] font-bold leading-[1.2] tracking-[-0.02em] text-[#1A1A1A]">
        Des initiatives qui façonnent l&rsquo;avenir de la santé
      </h2>
      <p className="mb-12 max-w-[600px] text-[16.5px] leading-[1.65] text-[#6B7280]">
        Découvrez nos programmes dans la région MENA, couvrant la lutte contre
        le VIH/SIDA, la tuberculose et le paludisme, l&rsquo;accès aux médicaments et
        l&rsquo;éducation thérapeutique.
      </p>

      <div className="grid gap-6 md:grid-cols-3">
        {programmes.map((p, i) => {
          const accent = cardAccent[i] ?? cardAccent[0];
          return (
            <Link
              key={p.id}
              href={`/v1${p.href}` as Parameters<typeof Link>[0]["href"]}
              className="group flex flex-col overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white text-inherit no-underline transition hover:-translate-y-[3px] hover:border-[#1D9E75] hover:shadow-[0_8px_32px_rgba(29,158,117,0.12)]"
            >
              {/* Color top bar */}
              <div className={`h-[6px] ${accent.top}`} />
              <div className="flex flex-1 flex-col p-7">
                {/* Icon */}
                <div
                  className={`mb-[18px] flex h-11 w-11 items-center justify-center rounded-[10px] text-[22px] ${accent.icon}`}
                >
                  {p.icon}
                </div>
                <h3 className="mb-[10px] text-[16.5px] font-bold leading-[1.35] text-[#1A1A1A]">
                  {p.title}
                </h3>
                <p className="mb-5 flex-1 text-[14px] leading-[1.6] text-[#6B7280]">
                  {p.description}
                </p>
                <span className={`flex items-center gap-1.5 text-[13.5px] font-semibold ${accent.link}`}>
                  En savoir plus →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
