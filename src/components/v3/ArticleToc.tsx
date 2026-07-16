"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/content";

/**
 * Sommaire d'un article long : ancres vers les titres (h2–h4). Le défilement
 * fluide est géré en CSS (html { scroll-behavior: smooth }) ; ce composant
 * surligne la section active au scroll (IntersectionObserver).
 *
 *  - variant "sidebar" : liste nue, destinée à un <aside> collant (desktop) —
 *    reste visible pendant qu'on navigue d'un paragraphe à l'autre.
 *  - variant "inline"  : carte repliable (mobile), placée dans le flux.
 */
export function ArticleToc({
  items,
  label,
  locale,
  variant = "sidebar",
}: {
  items: TocItem[];
  label: string;
  locale: "fr" | "en" | "ar";
  variant?: "sidebar" | "inline";
}) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");
  const isRtl = locale === "ar";

  useEffect(() => {
    const headings = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 }
    );
    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  const minLevel = Math.min(...items.map((i) => i.level));

  const list = (
    <ul className="mt-3 flex flex-col gap-1.5 text-sm">
      {items.map((it) => {
        const active = it.id === activeId;
        return (
          <li
            key={it.id}
            style={{
              [isRtl ? "paddingRight" : "paddingLeft"]: `${
                (it.level - minLevel) * 0.85
              }rem`,
            }}
          >
            <a
              href={`#${it.id}`}
              onClick={() => setActiveId(it.id)}
              className={`block border-s-2 ps-3 leading-snug transition ${
                active
                  ? "border-teal font-semibold text-ink"
                  : "border-transparent text-ink/55 hover:text-ink"
              }`}
            >
              {it.text}
            </a>
          </li>
        );
      })}
    </ul>
  );

  const title = (
    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal">
      {label}
    </p>
  );

  if (variant === "inline") {
    return (
      <details
        open
        dir={isRtl ? "rtl" : undefined}
        className="mt-8 rounded-3xl border border-ink/10 bg-white/70 p-5 [&_summary::-webkit-details-marker]:hidden"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between text-[11px] font-bold uppercase tracking-[0.14em] text-teal">
          {label}
          <span className="text-ink/40" aria-hidden>
            ▾
          </span>
        </summary>
        {list}
      </details>
    );
  }

  return (
    <nav aria-label={label} dir={isRtl ? "rtl" : undefined}>
      {title}
      {list}
    </nav>
  );
}
