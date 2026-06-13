const stats = [
  { number: "14", label: "Pays couverts" },
  { number: "3", label: "Programmes actifs" },
  { number: "+20", label: "Ans d'engagement" },
  { number: "VIH · TB", label: "Paludisme" },
];

export function ImpactStripV1() {
  return (
    <div className="bg-[#1A1A1A] px-20 py-10">
      <div className="grid grid-cols-2 md:grid-cols-4">
        {stats.map(({ number, label }, i) => (
          <div
            key={label}
            className={`relative px-5 py-2 text-center ${
              i < stats.length - 1
                ? "after:absolute after:right-0 after:top-[20%] after:h-[60%] after:w-px after:bg-white/12 after:content-['']"
                : ""
            }`}
          >
            <div
              className="mb-2 text-[38px] font-bold leading-none tracking-[-0.03em]"
              style={{ color: "#6DE0B8" }}
            >
              {number}
            </div>
            <div className="text-[12.5px] font-medium uppercase tracking-[0.04em] text-white/55">
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
