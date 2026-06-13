"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";

const navLinks = [
  { label: "À propos", hash: "apropos" },
  { label: "Programmes", hash: "programmes" },
  { label: "Actualités", hash: "actualites" },
  { label: "Ressources", hash: "ressources" },
];

const locales = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "ar", label: "ع" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const switchLocale = (next: string) => {
    router.replace(pathname, { locale: next as "fr" | "en" | "ar" });
  };

  return (
    <div className="sticky top-0 z-50 px-4 pt-4">
      <header
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-full border border-black/5 bg-white/80 px-4 py-2.5 backdrop-blur-md transition-shadow ${
          scrolled ? "shadow-lg" : "shadow-sm"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 pl-2">
          <Image
            src="https://itpcmena.org/wp-content/uploads/2020/01/Logo_ITPC.png"
            alt="ITPC-MENA"
            width={120}
            height={32}
            className="h-8 w-auto"
            priority
          />
        </Link>

        {/* Nav links — desktop */}
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map(({ label, hash }) =>
            isHome ? (
              <a
                key={hash}
                href={`#${hash}`}
                className="text-sm font-medium text-ink/60 transition hover:text-ink"
              >
                {label}
              </a>
            ) : (
              <Link
                key={hash}
                href={`/#${hash}` as Parameters<typeof Link>[0]["href"]}
                className="text-sm font-medium text-ink/60 transition hover:text-ink"
              >
                {label}
              </Link>
            )
          )}
        </nav>

        {/* Lang switcher + CTA */}
        <div className="flex items-center gap-2">
          <div className="hidden items-center overflow-hidden rounded-full border border-black/10 sm:flex">
            {locales.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => switchLocale(code)}
                className={`px-3 py-1 text-xs font-semibold transition ${
                  locale === code
                    ? "bg-ink text-white"
                    : "text-ink/50 hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <a
            href="https://itpcmena.org/faire-un-don/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-red px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
          >
            Faire un don
          </a>
        </div>
      </header>
    </div>
  );
}
