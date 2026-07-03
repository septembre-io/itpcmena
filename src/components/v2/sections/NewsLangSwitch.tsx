"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

const locales = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "ar", label: "ع" },
] as const;

/**
 * Sélecteur de langue de la section actualités. Change la langue de la page
 * (comme la navbar) → l'espace actu affiche les articles de cette langue.
 */
export function NewsLangSwitch() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex gap-2">
      {locales.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => router.replace(pathname, { locale: code as "fr" | "en" | "ar" })}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
            locale === code
              ? "bg-ink text-white"
              : "border border-ink/15 text-ink/60 hover:text-ink"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
