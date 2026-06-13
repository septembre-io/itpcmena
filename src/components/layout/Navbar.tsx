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
  const [mobileOpen, setMobileOpen] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const switchLocale = (next: string) => {
    router.replace(pathname, { locale: next as "fr" | "en" | "ar" });
    setMobileOpen(false);
  };

  const NavLink = ({ label, hash }: { label: string; hash: string }) =>
    isHome ? (
      <a
        href={`#${hash}`}
        onClick={() => setMobileOpen(false)}
        className="text-sm font-medium text-ink/60 transition hover:text-ink"
      >
        {label}
      </a>
    ) : (
      <Link
        href={`/#${hash}` as Parameters<typeof Link>[0]["href"]}
        onClick={() => setMobileOpen(false)}
        className="text-sm font-medium text-ink/60 transition hover:text-ink"
      >
        {label}
      </Link>
    );

  return (
    <>
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
            {navLinks.map(({ label, hash }) => (
              <NavLink key={hash} label={label} hash={hash} />
            ))}
          </nav>

          {/* Lang switcher + CTA + hamburger */}
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
              className="hidden rounded-full bg-red px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 sm:inline-flex"
            >
              Faire un don
            </a>
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Menu"
              className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-full border border-black/10 bg-white/80 md:hidden"
            >
              <span
                className={`h-[1.5px] w-5 rounded bg-ink transition-all ${mobileOpen ? "translate-y-[6.5px] rotate-45" : ""}`}
              />
              <span
                className={`h-[1.5px] w-5 rounded bg-ink transition-all ${mobileOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`h-[1.5px] w-5 rounded bg-ink transition-all ${mobileOpen ? "-translate-y-[6.5px] -rotate-45" : ""}`}
              />
            </button>
          </div>
        </header>
      </div>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 flex flex-col bg-white transition-opacity duration-200 md:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ top: "72px" }}
      >
        <nav className="flex flex-1 flex-col gap-0 px-6 pt-4">
          {navLinks.map(({ label, hash }) => (
            <div key={hash} className="border-b border-black/5">
              {isHome ? (
                <a
                  href={`#${hash}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center py-4 text-[17px] font-medium text-ink"
                >
                  {label}
                </a>
              ) : (
                <Link
                  href={`/#${hash}` as Parameters<typeof Link>[0]["href"]}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center py-4 text-[17px] font-medium text-ink"
                >
                  {label}
                </Link>
              )}
            </div>
          ))}
        </nav>
        <div className="px-6 pb-10 pt-6">
          {/* Lang switcher */}
          <div className="mb-4 flex gap-2">
            {locales.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => switchLocale(code)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  locale === code
                    ? "border-ink bg-ink text-white"
                    : "border-black/10 text-ink/50 hover:text-ink"
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
            className="block w-full rounded-full bg-red py-3.5 text-center text-[15px] font-semibold text-white"
          >
            Faire un don
          </a>
        </div>
      </div>
    </>
  );
}
