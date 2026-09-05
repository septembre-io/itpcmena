// Root layout — provides <html> and <body> as required by Next.js App Router.
// Uses next-intl's getLocale() to set lang and dir dynamically so the
// [locale]/layout.tsx doesn't need to repeat them.
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import Script from "next/script";
import { SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/seo";

// metadataBase : indispensable pour que les URLs OpenGraph/canonical relatives
// soient résolues en absolu. En prod, NEXT_PUBLIC_SITE_URL = https://www.itpcmena.org.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  openGraph: {
    siteName: "ITPC-MENA",
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: { card: "summary_large_image", images: [DEFAULT_OG_IMAGE] },
};

const umamiScriptSrc =
  process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL ?? "https://atom.septembre.io/script.js";
const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let locale = "fr";
  try {
    locale = await getLocale();
  } catch {
    // getLocale() may fail for root-level 404s outside the [locale] segment
  }
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} data-scroll-behavior="smooth">
      <body className="bg-cream antialiased">
        {umamiWebsiteId ? (
          <Script
            strategy="afterInteractive"
            src={umamiScriptSrc}
            data-website-id={umamiWebsiteId}
          />
        ) : null}
        {children}
      </body>
    </html>
  );
}
