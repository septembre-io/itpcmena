import type { Metadata } from "next";
import localFont from "next/font/local";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { DirectionSync } from "@/components/DirectionSync";
import "../globals.css";

// Polices auto-hébergées (src/fonts, voir le README) : le build ne dépend plus
// de Google Fonts. Fichiers variables, sous-ensemble latin.
const plusJakartaSans = localFont({
  src: "../../fonts/plus-jakarta-sans-latin.woff2",
  weight: "400 800",
  style: "normal",
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

// Serif éditorial pour la zone op-ed (proposition P1).
const newsreader = localFont({
  src: [
    { path: "../../fonts/newsreader-latin.woff2", weight: "400 500", style: "normal" },
    { path: "../../fonts/newsreader-italic-latin.woff2", weight: "400 500", style: "italic" },
  ],
  variable: "--font-newsreader",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

export const metadata: Metadata = {
  title: "ITPC-MENA",
  description:
    "International Treatment Preparedness Coalition — Région Moyen-Orient et Afrique du Nord",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    // `locale` explicite : sans middleware next-intl actif, le provider ne peut
    // pas déduire la locale de l'URL — on la passe depuis le segment [locale]
    // pour que useLocale()/usePathname() (et donc le switch de langue) soient corrects.
    <NextIntlClientProvider locale={locale} messages={messages}>
      <DirectionSync />
      <div className={`${plusJakartaSans.variable} ${newsreader.variable} font-sans text-ink min-h-screen`}>
        {children}
      </div>
    </NextIntlClientProvider>
  );
}
