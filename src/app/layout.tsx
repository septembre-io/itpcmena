// Root layout — provides <html> and <body> as required by Next.js App Router.
// Uses next-intl's getLocale() to set lang and dir dynamically so the
// [locale]/layout.tsx doesn't need to repeat them.
import { getLocale } from "next-intl/server";
import Script from "next/script";

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
    <html lang={locale} dir={dir}>
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
