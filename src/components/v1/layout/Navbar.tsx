"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";

const navLinks = [
  { label: "À propos", hash: "apropos" },
  { label: "Notre travail", hash: "programmes" },
  { label: "Ressources", hash: "ressources" },
  { label: "Actualités", hash: "actualites" },
  { label: "Contact", href: "mailto:admin@itpcglobal.com" },
];

const locales = [
  { code: "fr", label: "FR" },
  { code: "ar", label: "ع" },
];

export function NavbarV1() {
  const [scrolled, setScrolled] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  // isHome = true when on /v1 page
  const isHome = pathname === "/v1";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const switchLocale = (next: string) => {
    router.replace(pathname, { locale: next as "fr" | "en" | "ar" });
  };

  return (
    <header
      className={`sticky top-0 z-50 flex h-[68px] items-center justify-between border-b bg-white/97 px-12 backdrop-blur-sm transition-shadow ${
        scrolled ? "shadow-sm border-gray-200" : "border-gray-200/80"
      }`}
    >
      {/* Logo */}
      <Link href="/v1" className="flex items-center gap-2.5">
        <Image
          src="https://itpcmena.org/wp-content/uploads/2020/01/Logo_ITPC.png"
          alt="ITPC-MENA"
          width={120}
          height={40}
          className="h-10 w-auto"
          priority
        />
      </Link>

      {/* Nav */}
      <nav className="hidden items-center gap-8 md:flex">
        {navLinks.map(({ label, hash, href }) => {
          if (href) {
            return (
              <a
                key={label}
                href={href}
                className="text-[13.5px] font-medium tracking-[0.01em] text-gray-500 transition hover:text-gray-900"
              >
                {label}
              </a>
            );
          }
          return isHome ? (
            <a
              key={label}
              href={`#${hash}`}
              className="text-[13.5px] font-medium tracking-[0.01em] text-gray-500 transition hover:text-gray-900"
            >
              {label}
            </a>
          ) : (
            <Link
              key={label}
              href={`/v1#${hash}` as Parameters<typeof Link>[0]["href"]}
              className="text-[13.5px] font-medium tracking-[0.01em] text-gray-500 transition hover:text-gray-900"
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Lang toggle */}
        <div className="hidden overflow-hidden rounded-md border border-gray-200 bg-gray-50 sm:flex">
          {locales.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => switchLocale(code)}
              className={`px-3 py-[5px] text-xs font-medium transition ${
                locale === code
                  ? "bg-[#C1272D] text-white"
                  : "text-gray-500 hover:text-gray-900"
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
          className="rounded-md bg-[#C1272D] px-[18px] py-2 text-[13px] font-medium text-white transition hover:bg-[#9B1D22]"
        >
          Faire un don
        </a>
      </div>
    </header>
  );
}
