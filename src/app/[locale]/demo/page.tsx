import { Link } from "@/i18n/navigation";

export default function DemoPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F6F2] px-6 py-16">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0E9F76]">
        ITPC-MENA · Démo client
      </p>
      <h1 className="mb-3 text-center text-4xl font-extrabold tracking-tight text-[#0B0F0E]">
        Choisissez un design
      </h1>
      <p className="mb-14 text-center text-base text-[#0B0F0E]/50">
        Deux directions créatives pour le même contenu. Cliquez pour explorer.
      </p>

      <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2">
        {/* V7 Radiant */}
        <Link
          href="/"
          className="group block overflow-hidden rounded-3xl border border-black/8 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
        >
          {/* Preview thumbnail */}
          <div className="relative flex h-48 items-end overflow-hidden bg-gradient-to-br from-[#0B0F0E] to-[#1a2420] p-6">
            {/* Simulated mesh */}
            <div
              className="pointer-events-none absolute inset-0 opacity-50"
              style={{
                background:
                  "radial-gradient(ellipse 70% 60% at 30% 50%, #0E9F7640 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 75% 35%, #C1272D30 0%, transparent 65%)",
              }}
            />
            {/* Simulated pill nav */}
            <div className="absolute left-4 right-4 top-4 flex items-center justify-between rounded-full bg-white/90 px-4 py-2 text-[9px] font-semibold text-[#0B0F0E]/60">
              <span className="font-bold text-[#0B0F0E]">ITPC</span>
              <span>À propos · Programmes · Actualités</span>
              <span className="rounded-full bg-[#C1272D] px-2 py-0.5 text-white">Don</span>
            </div>
            {/* Hero text sim */}
            <div className="relative z-10">
              <p className="mb-1 text-[8px] font-bold uppercase tracking-[0.12em] text-white/50">Région MENA · 14 pays</p>
              <p className="text-[15px] font-extrabold leading-tight text-white">
                Agir ensemble<br />
                <span className="text-[#0E9F76]">pour la santé</span>
              </p>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full bg-[#0E9F76]/10 px-2 py-0.5 text-[10px] font-bold text-[#0E9F76]">V7</span>
              <span className="text-sm font-bold text-[#0B0F0E]">Radiant</span>
            </div>
            <p className="text-sm text-[#0B0F0E]/50">
              Navbar pill flottante, mesh gradient animé, cartes arrondies. Ambiance premium et organique.
            </p>
            <p className="mt-3 text-sm font-semibold text-[#0B0F0E] transition group-hover:text-[#C1272D]">
              Explorer ce design →
            </p>
          </div>
        </Link>

        {/* V1 Minimaliste */}
        <Link
          href="/v1"
          className="group block overflow-hidden rounded-3xl border border-black/8 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
        >
          {/* Preview thumbnail */}
          <div className="relative flex h-48 items-end overflow-hidden bg-[#1A1A1A] p-6">
            {/* Simulated photo bg */}
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "url('https://i0.wp.com/itpcmena.org/wp-content/uploads/2023/11/Galerie-Position-1-1-scaled.jpg?fit=2560%2C1707&ssl=1')",
                backgroundSize: "cover",
                backgroundPosition: "center 30%",
              }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: "linear-gradient(to top, rgba(15,15,15,0.9) 0%, transparent 60%)",
              }}
            />
            {/* Simulated flat nav */}
            <div className="absolute left-0 right-0 top-0 flex items-center justify-between border-b border-white/10 bg-white/95 px-5 py-2 text-[9px] font-semibold text-[#6B7280]">
              <span className="font-bold text-[#1A1A1A]">ITPC</span>
              <span>À propos · Notre travail · Ressources · Actualités</span>
              <span className="rounded bg-[#C1272D] px-2 py-0.5 text-white">Don</span>
            </div>
            {/* Hero text sim */}
            <div className="relative z-10">
              <p className="mb-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-white/50">Région MENA · 14 pays</p>
              <p className="text-[15px] font-bold leading-tight text-white">
                L&rsquo;accès aux soins<br />
                est un <span style={{ color: "#6DE0B8" }}>droit.</span>
              </p>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full bg-[#1D9E75]/10 px-2 py-0.5 text-[10px] font-bold text-[#1D9E75]">V1</span>
              <span className="text-sm font-bold text-[#0B0F0E]">Minimaliste</span>
            </div>
            <p className="text-sm text-[#0B0F0E]/50">
              Header flat avec border, hero photo plein écran, cartes à bordure fine. Ambiance éditoriale et épurée.
            </p>
            <p className="mt-3 text-sm font-semibold text-[#0B0F0E] transition group-hover:text-[#1D9E75]">
              Explorer ce design →
            </p>
          </div>
        </Link>
      </div>

      <p className="mt-10 text-xs text-[#0B0F0E]/30">
        Données réelles · WordPress itpcmena.org · Next.js 16
      </p>
    </div>
  );
}
