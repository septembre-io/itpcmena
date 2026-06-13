const partners = [
  "FONDS MONDIAL",
  "ONUSIDA",
  "MSF",
  "ITPC GLOBAL",
  "OMS EMRO",
];

export function PartnersV1() {
  return (
    <section className="bg-white px-5 md:px-20 py-[60px]">
      <p className="mb-9 text-center text-[13px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
        Partenariats &amp; Collaboration
      </p>
      <div className="flex flex-wrap items-center justify-center gap-12">
        {partners.map((name) => (
          <div
            key={name}
            className="text-[14px] font-bold tracking-[0.05em] text-[#6B7280] opacity-40 grayscale transition hover:opacity-80 hover:grayscale-0"
          >
            {name}
          </div>
        ))}
      </div>
    </section>
  );
}
