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
  const [mobileOpen, setMobileOpen] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/v1";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const switchLocale = (next: string) => {
    router.replace(pathname, { locale: next as "fr" | "en" | "ar" });
    setMobileOpen(false);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 flex h-[68px] items-center justify-between border-b bg-white/97 px-5 backdrop-blur-sm transition-shadow md:px-12 ${
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
            className="h-9 w-auto md:h-10"
            priority
          />
        </Link>

        {/* Nav — desktop */}
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
        <div className="flex items-center gap-3">
          {/* Lang toggle — desktop */}
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
            className="hidden rounded-md bg-[#C1272D] px-[18px] py-2 text-[13px] font-medium text-white transition hover:bg-[#9B1D22] sm:inline-flex"
          >
            Faire un don
          </a>
          {/* Hamburger — mobile */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
            className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-md border border-gray-200 bg-gray-50 md:hidden"
          >
            <span
              className={`h-[1.5px] w-5 rounded bg-gray-700 transition-all ${mobileOpen ? "translate-y-[6.5px] rotate-45" : ""}`}
            />
            <span
              className={`h-[1.5px] w-5 rounded bg-gray-700 transition-all ${mobileOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`h-[1.5px] w-5 rounded bg-gray-700 transition-all ${mobileOpen ? "-translate-y-[6.5px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 flex flex-col bg-white transition-all duration-200 md:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ top: "68px" }}
      >
        <nav className="flex flex-1 flex-col px-5 pt-2">
          {navLinks.map(({ label, hash, href }) => {
            const cls =
              "flex items-center border-b border-gray-100 py-4 text-[17px] font-medium text-gray-800";
            if (href) {
              return (
                <a key={label} href={href} onClick={() => setMobileOpen(false)} className={cls}>
                  {label}
                </a>
              );
            }
            return isHome ? (
              <a key={label} href={`#${hash}`} onClick={() => setMobileOpen(false)} className={cls}>
                {label}
              </a>
            ) : (
              <Link
                key={label}
                href={`/v1#${hash}` as Parameters<typeof Link>[0]["href"]}
                onClick={() => setMobileOpen(false)}
                className={cls}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="px-5 pb-10 pt-5">
          <div className="mb-4 flex gap-2">
            {locales.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => switchLocale(code)}
                className={`rounded-md border px-5 py-2 text-sm font-medium transition ${
                  locale === code
                    ? "border-[#C1272D] bg-[#C1272D] text-white"
                    : "border-gray-200 text-gray-500 hover:text-gray-900"
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
            className="block w-full rounded-md bg-[#C1272D] py-3.5 text-center text-[15px] font-medium text-white transition hover:bg-[#9B1D22]"
          >
            Faire un don
          </a>
        </div>
      </div>
    </>
  );
}
