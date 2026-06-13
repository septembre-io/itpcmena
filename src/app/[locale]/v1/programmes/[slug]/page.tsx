import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { NavbarV1 } from "@/components/v1/layout/Navbar";
import { FooterV1 } from "@/components/v1/layout/Footer";
import { programmes } from "@/data/programmes";

export const revalidate = false; // static

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export function generateStaticParams() {
  const locales = ["fr", "en", "ar"];
  return locales.flatMap((locale) =>
    programmes.map((p) => ({ locale, slug: p.id }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const programme = programmes.find((p) => p.id === slug);
  if (!programme) return { title: "Programme — ITPC MENA" };
  return { title: `${programme.title} — ITPC MENA` };
}

const cardAccent = [
  { top: "bg-[#1D9E75]", iconBg: "bg-[#E1F5EE]" },
  { top: "bg-[#C1272D]", iconBg: "bg-[#FDECEA]" },
  { top: "bg-[#E07A2F]", iconBg: "bg-[#FEF3E7]" },
];

export default async function ProgrammeV1Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const idx = programmes.findIndex((p) => p.id === slug);
  const programme = programmes[idx];
  if (!programme) notFound();

  const accent = cardAccent[idx] ?? cardAccent[0];

  return (
    <div className={`${inter.variable} font-[family-name:var(--font-inter)] text-[#1A1A1A] bg-white`}>
      <div className="fixed right-5 top-[76px] z-[999] rounded-full bg-[#1D9E75] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-white opacity-90">
        V1 · Minimaliste
      </div>
      <NavbarV1 />
      <main className="mx-auto max-w-3xl px-6 py-16">
        {/* Back */}
        <Link
          href="/v1#programmes"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition hover:text-[#1A1A1A]"
        >
          ← Nos programmes
        </Link>

        {/* Color top accent */}
        <div className={`mb-6 h-1.5 w-16 rounded-full ${accent.top}`} />

        {/* Icon */}
        <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-[10px] text-3xl ${accent.iconBg}`}>
          {programme.icon}
        </div>

        {/* Title */}
        <h1 className="mb-4 text-3xl font-bold leading-tight tracking-[-0.02em] text-[#1A1A1A] md:text-4xl">
          {programme.title}
        </h1>

        <p className="mb-10 text-lg leading-relaxed text-[#6B7280]">
          {programme.description}
        </p>

        {/* Placeholder */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9F9F7] p-8">
          <p className="text-sm text-[#6B7280]">
            Contenu détaillé du programme à venir. Pour plus d&rsquo;informations,
            contactez-nous à{" "}
            <a
              href="mailto:admin@itpcglobal.com"
              className="font-semibold text-[#1D9E75] transition hover:underline"
            >
              admin@itpcglobal.com
            </a>
            .
          </p>
        </div>

        {/* Back CTA */}
        <div className="mt-12 border-t border-[#E5E7EB] pt-8">
          <Link
            href="/v1#programmes"
            className="inline-flex items-center gap-2 rounded-[7px] border border-[#1A1A1A] px-6 py-3 text-sm font-medium text-[#1A1A1A] transition hover:bg-[#1A1A1A] hover:text-white"
          >
            ← Retour aux programmes
          </Link>
        </div>
      </main>
      <FooterV1 />
    </div>
  );
}
