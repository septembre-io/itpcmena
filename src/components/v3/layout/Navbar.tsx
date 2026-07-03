"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { headerFallback, type MenuItem } from "@/lib/menu";

const locales = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "ar", label: "ع" },
];

export function NavbarV3({ menu = headerFallback }: { menu?: MenuItem[] }) {
  const [scrolled, setScrolled] = useState(false);
  // Dark navbar while it sits over the dark hero, light once we scroll past it.
  const [overHero, setOverHero] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Items de navigation vs bouton d'action (classe « cta » côté WordPress).
  const navItems = menu.filter((m) => !m.cta);
  const cta = menu.find((m) => m.cta);

  useEffect(() => {
    // Navbar pill bottom sits ~72px from the top (pt-4 + pill height).
    const NAV_LINE = 72;
    const handler = () => {
      setScrolled(window.scrollY > 10);
      const hero = document.getElementById("v3-hero");
      setOverHero(!!hero && hero.getBoundingClientRect().bottom > NAV_LINE);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const switchLocale = (next: string) => {
    router.replace(pathname, { locale: next as "fr" | "en" | "ar" });
    setMobileOpen(false);
  };

  // Dark styling over the hero — but revert to light when the white mobile
  // overlay is open so the pill stays readable.
  const dark = overHero && !mobileOpen;

  const navLinkClass = `text-sm font-medium transition ${
    dark ? "text-white/60 hover:text-white" : "text-ink/60 hover:text-ink"
  }`;

  return (
    <>
      <div className="sticky top-0 z-50 px-4 pt-4">
        <header
          className={`mx-auto flex max-w-6xl items-center justify-between rounded-full border px-4 py-2.5 backdrop-blur-md transition ${
            dark ? "border-white/10 bg-ink/90" : "border-black/5 bg-white/80"
          } ${scrolled ? "shadow-lg" : "shadow-sm"}`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 pl-2">
            <Image
              src="https://itpcmena.org/wp-content/uploads/2020/01/Logo_ITPC.png"
              alt="ITPC-MENA"
              width={120}
              height={32}
              className={`h-8 w-auto transition ${
                dark ? "brightness-0 invert" : ""
              }`}
              priority
            />
          </Link>

          {/* Nav — desktop */}
          <nav className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.url}
                target={item.target}
                rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                onClick={() => setMobileOpen(false)}
                className={navLinkClass}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Lang switcher + CTA + hamburger */}
          <div className="flex items-center gap-2">
            <div
              className={`hidden items-center overflow-hidden rounded-full border sm:flex ${
                dark ? "border-white/15" : "border-black/10"
              }`}
            >
              {locales.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => switchLocale(code)}
                  className={`px-3 py-1 text-xs font-semibold transition ${
                    locale === code
                      ? dark
                        ? "bg-white text-ink"
                        : "bg-ink text-white"
                      : dark
                        ? "text-white/50 hover:text-white"
                        : "text-ink/50 hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {cta && (
              <a
                href={cta.url}
                target={cta.target}
                rel={cta.target === "_blank" ? "noopener noreferrer" : undefined}
                className="hidden rounded-full bg-red px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 sm:inline-flex"
              >
                {cta.label}
              </a>
            )}
            {/* Hamburger — mobile */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Menu"
              className={`flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-full border md:hidden ${
                dark ? "border-white/15 bg-white/5" : "border-black/10 bg-white/80"
              }`}
            >
              <span
                className={`h-[1.5px] w-5 rounded transition-all ${dark ? "bg-white" : "bg-ink"} ${mobileOpen ? "translate-y-[6.5px] rotate-45" : ""}`}
              />
              <span
                className={`h-[1.5px] w-5 rounded transition-all ${dark ? "bg-white" : "bg-ink"} ${mobileOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`h-[1.5px] w-5 rounded transition-all ${dark ? "bg-white" : "bg-ink"} ${mobileOpen ? "-translate-y-[6.5px] -rotate-45" : ""}`}
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
          {navItems.map((item) => (
            <div key={item.label} className="border-b border-black/5">
              <a
                href={item.url}
                target={item.target}
                rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                onClick={() => setMobileOpen(false)}
                className="flex items-center py-4 text-[17px] font-medium text-ink"
              >
                {item.label}
              </a>
            </div>
          ))}
        </nav>
        <div className="px-6 pb-10 pt-6">
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
          {cta && (
            <a
              href={cta.url}
              target={cta.target}
              rel={cta.target === "_blank" ? "noopener noreferrer" : undefined}
              className="block w-full rounded-full bg-red py-3.5 text-center text-[15px] font-semibold text-white"
            >
              {cta.label}
            </a>
          )}
        </div>
      </div>
    </>
  );
}
