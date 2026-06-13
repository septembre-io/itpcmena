import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { programmes } from "@/data/programmes";

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

export default async function ProgrammePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const programme = programmes.find((p) => p.id === slug);
  if (!programme) notFound();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-16">
        {/* Back link */}
        <Link
          href="/#programmes"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-ink/55 transition hover:text-ink"
        >
          ← Nos programmes
        </Link>

        {/* Icon */}
        <div
          className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl ${programme.iconBg}`}
        >
          {programme.icon}
        </div>

        {/* Title */}
        <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight text-ink md:text-4xl">
          {programme.title}
        </h1>

        {/* Description */}
        <p className="mb-10 text-lg leading-relaxed text-ink/65">
          {programme.description}
        </p>

        {/* Placeholder content */}
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5">
          <p className="text-sm text-ink/45">
            Contenu détaillé du programme à venir. Pour plus d&rsquo;informations,
            contactez-nous à{" "}
            <a
              href="mailto:admin@itpcglobal.com"
              className="font-semibold text-teal transition hover:underline"
            >
              admin@itpcglobal.com
            </a>
            .
          </p>
        </div>

        {/* Back CTA */}
        <div className="mt-12 border-t border-ink/10 pt-8">
          <Link
            href="/#programmes"
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white"
          >
            ← Retour aux programmes
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
