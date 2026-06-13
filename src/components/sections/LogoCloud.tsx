const partners = [
  "FONDS MONDIAL",
  "ONUSIDA",
  "MSF",
  "ITPC GLOBAL",
  "OMS EMRO",
];

export function LogoCloud() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-14">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-ink/40">
        Partenariats &amp; collaboration
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
        {partners.map((p) => (
          <span
            key={p}
            className="text-sm font-bold tracking-wider text-ink/35 transition hover:text-ink/70"
          >
            {p}
          </span>
        ))}
      </div>
    </section>
  );
}
