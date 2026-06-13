import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { LogoCloud } from "@/components/sections/LogoCloud";
import { About } from "@/components/sections/About";
import { Programmes } from "@/components/sections/Programmes";
import { News } from "@/components/sections/News";
import { ResourcesCTA } from "@/components/sections/ResourcesCTA";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <LogoCloud />
        <About />
        <Programmes />
        <News locale={locale} />
        <ResourcesCTA />
      </main>
      <Footer />
    </>
  );
}
