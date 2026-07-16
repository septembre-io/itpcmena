"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

type Result = { slug: string; title: string };

export interface NotFoundSearchLabels {
  placeholder: string;
  searching: string;
  noResults: string; // « {q} » remplacé par le terme
  hint: string;
}

/**
 * Champ de recherche de la page 404. Interroge /api/search (proxy WP) en
 * différé, et liste les articles correspondants vers /actualites/{slug}.
 */
export function NotFoundSearch({
  locale,
  labels,
}: {
  locale: string;
  labels: NotFoundSearchLabels;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      setTouched(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(term)}&lang=${encodeURIComponent(
            locale
          )}`,
          { signal: ctrl.signal }
        );
        const data = (await res.json()) as Result[];
        setResults(Array.isArray(data) ? data : []);
        setTouched(true);
      } catch {
        /* requête annulée ou réseau — on ignore */
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [q, locale]);

  return (
    <div>
      <div className="relative">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/35"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.2-3.2" />
        </svg>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={labels.placeholder}
          aria-label={labels.placeholder}
          autoComplete="off"
          className="w-full rounded-2xl border-0 bg-white py-4 pl-12 pr-4 text-base text-ink shadow-sm ring-1 ring-black/5 outline-none transition placeholder:text-ink/35 focus:ring-2 focus:ring-teal"
        />
      </div>

      {loading && (
        <p className="mt-3 text-sm text-ink/45">{labels.searching}</p>
      )}

      {!loading && results.length > 0 && (
        <ul className="mt-3 divide-y divide-black/5 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          {results.map((r) => (
            <li key={r.slug}>
              <Link
                href={
                  `/actualites/${r.slug}` as Parameters<
                    typeof Link
                  >[0]["href"]
                }
                className="block px-5 py-3.5 text-sm font-medium text-ink transition hover:bg-cream"
              >
                {r.title}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!loading && touched && q.trim().length >= 2 && results.length === 0 && (
        <p className="mt-3 text-sm text-ink/45">
          {labels.noResults.replace("{q}", q.trim())}
        </p>
      )}

      {!touched && !loading && (
        <p className="mt-3 text-sm text-ink/40">{labels.hint}</p>
      )}
    </div>
  );
}
