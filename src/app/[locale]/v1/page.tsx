import { Inter } from "next/font/google";
import { NavbarV1 } from "@/components/v1/layout/Navbar";
import { FooterV1 } from "@/components/v1/layout/Footer";
import { HeroV1 } from "@/components/v1/sections/Hero";
import { ImpactStripV1 } from "@/components/v1/sections/ImpactStrip";
import { AboutV1 } from "@/components/v1/sections/About";
import { ProgrammesV1 } from "@/components/v1/sections/Programmes";
import { ResourcesCTAV1 } from "@/components/v1/sections/ResourcesCTA";
import { NewsV1 } from "@/components/v1/sections/News";
import { PartnersV1 } from "@/components/v1/sections/Partners";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export default async function HomeV1Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className={`${inter.variable} font-[family-name:var(--font-inter)] text-[#1A1A1A] bg-white`}>
      {/* Demo version badge */}
      <div className="fixed right-5 top-[76px] z-[999] rounded-full bg-[#1D9E75] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-white opacity-90">
        V1 · Minimaliste
      </div>

      <NavbarV1 />
      <main>
        <HeroV1 />
        <ImpactStripV1 />
        <AboutV1 />
        <ProgrammesV1 />
        <ResourcesCTAV1 />
        <NewsV1 locale={locale} />
        <PartnersV1 />
      </main>
      <FooterV1 />
    </div>
  );
}
