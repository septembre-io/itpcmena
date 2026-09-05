"use client";

import { useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { SITE_URL } from "@/lib/seo";

const t = {
  fr: { share: "Partager", copy: "Copier le lien", copied: "Lien copié !" },
  en: { share: "Share", copy: "Copy link", copied: "Link copied!" },
  ar: { share: "مشاركة", copy: "نسخ الرابط", copied: "تم نسخ الرابط!" },
} as const;

export function ShareButtons({
  locale = "fr",
  title = "",
}: {
  locale?: string;
  title?: string;
}) {
  const l = t[(locale as keyof typeof t)] ?? t.fr;
  const [copied, setCopied] = useState(false);

  // URL canonique déduite de la route plutôt que lue dans window : les liens
  // de partage sont corrects dès le rendu serveur (avant, ils restaient vides
  // jusqu'à l'hydratation) et pointent sur le domaine public même en local.
  const pathname = usePathname();
  const url = `${SITE_URL}/${locale}${pathname === "/" ? "" : pathname}`;

  const u = encodeURIComponent(url);
  const tt = encodeURIComponent(title);

  const links = [
    {
      key: "x",
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${u}&text=${tt}`,
      icon: (
        <path d="M18.9 2H22l-7.5 8.6L23 22h-6.9l-5.4-7-6.2 7H1.4l8-9.2L1 2h7.1l4.9 6.5L18.9 2Zm-2.4 18h1.9L7.6 4H5.6l10.9 16Z" />
      ),
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
      icon: (
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.75V21h-4v-5.3c0-1.26-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.8V21H9V9Z" />
      ),
    },
    {
      key: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      icon: (
        <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.25-1.5 1.55-1.5H17V4.6c-.3-.04-1.3-.13-2.46-.13-2.43 0-4.09 1.48-4.09 4.2v2.34H7.7V14h2.75v8h3.05Z" />
      ),
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/?text=${tt}%20${u}`,
      icon: (
        <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2Zm5.3 14c-.22.62-1.3 1.2-1.8 1.24-.46.04-.9.2-3.04-.63-2.57-1-4.2-3.6-4.33-3.77-.13-.17-1.04-1.38-1.04-2.64s.66-1.87.9-2.13c.23-.26.5-.32.67-.32l.48.01c.16.01.37-.06.58.44.22.53.74 1.83.8 1.96.07.13.11.29.02.46-.09.17-.13.28-.26.43l-.4.46c-.13.13-.27.28-.12.54.15.26.67 1.1 1.44 1.78.99.88 1.82 1.15 2.08 1.28.26.13.41.11.56-.07.15-.17.65-.76.83-1.02.17-.26.35-.22.58-.13.24.09 1.52.72 1.78.85.26.13.43.19.5.3.06.11.06.64-.16 1.26Z" />
      ),
    },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard indisponible */
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs font-bold uppercase tracking-wider text-ink/45">
        {l.share}
      </span>
      {links.map((s) => (
        <a
          key={s.key}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.label}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/12 text-ink/70 transition hover:border-ink hover:bg-ink hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            {s.icon}
          </svg>
        </a>
      ))}
      <button
        onClick={copy}
        aria-label={l.copy}
        className="flex h-9 items-center gap-1.5 rounded-full border border-ink/12 px-3 text-xs font-semibold text-ink/70 transition hover:border-ink hover:bg-ink hover:text-white"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {copied ? l.copied : l.copy}
      </button>
    </div>
  );
}
