"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  LANG_NAMES,
  countryLabel,
  coverUrl,
  ficheHref,
  normKey,
  pdfUrl,
  themeLabel,
  typeLabel,
  EMPTY_FILTERS,
  type BiblioLocale,
  type ExplorerFilters,
} from "@/lib/bibliothequeLabels";
import type { toItem } from "@/lib/bibliothequeView";

type Sort = "recent" | "old" | "title";

/** Publication prête à afficher (préparée côté serveur, voir toItem). */
export type ExplorerItem = ReturnType<typeof toItem>;

export interface ExplorerLabels {
  searchPlaceholder: string;
  allThemes: string;
  type: string;
  lang: string;
  country: string;
  year: string;
  sort: string;
  sortRecent: string;
  sortOld: string;
  sortTitle: string;
  all: string;
  reset: string;
  countNoun: { one: string; other: string };
  empty: string;
  download: string;
  pdf: string;
}

const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

const typeKey = (t: string) => normKey(t).replace(/[^a-z0-9]+/g, "-");

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1 sm:min-w-[9rem]">
      <span className="text-[11px] font-bold uppercase tracking-wider text-ink/45">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm font-medium text-ink outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
      >
        {children}
      </select>
    </label>
  );
}

/** Couverture de repli : aplat aux couleurs de la charte avec le type de document. */
export function CoverFallback({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-between bg-ink p-3 text-white">
      <span className="h-1 w-8 rounded-full bg-amber" />
      <span className="text-[11px] font-bold uppercase leading-tight tracking-wider text-white/80">
        {label}
      </span>
    </div>
  );
}

/** Boutons de téléchargement, version mise en avant en premier. */
export function DownloadButtons({
  files,
  primaryId,
  labels,
  size = "sm",
}: {
  files: ExplorerItem["files"];
  primaryId: string;
  labels: Pick<ExplorerLabels, "download" | "pdf">;
  size?: "sm" | "lg";
}) {
  const sorted = [...files].sort(
    (a, b) => Number(b.id === primaryId) - Number(a.id === primaryId)
  );
  const pad = size === "lg" ? "px-5 py-2.5 text-sm" : "px-3.5 py-1.5 text-xs";
  return (
    <>
      {sorted.map((f) => {
        const primary = f.id === primaryId;
        return (
          <a
            key={f.id}
            href={pdfUrl(f.id)}
            target="_blank"
            rel="noopener"
            hrefLang={f.lang}
            type="application/pdf"
            aria-label={`${labels.download} : ${LANG_NAMES[f.lang]}`}
            className={`inline-flex items-center gap-1.5 rounded-full font-bold transition ${pad} ${
              primary
                ? "bg-ink text-white hover:bg-red"
                : "bg-white text-ink ring-1 ring-ink/15 hover:text-red hover:ring-red"
            }`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className={size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5"}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 2v8m0 0L5 7m3 3 3-3M3 13h10" />
            </svg>
            <span lang={f.lang}>{LANG_NAMES[f.lang]}</span>
            <span className={primary ? "text-white/55" : "text-ink/40"}>
              {labels.pdf}
              {f.size ? ` · ${f.size}` : ""}
            </span>
          </a>
        );
      })}
    </>
  );
}

export function PublicationCard({
  item,
  locale,
  labels,
}: {
  item: ExplorerItem;
  locale: BiblioLocale;
  labels: Pick<ExplorerLabels, "download" | "pdf">;
}) {
  const pageRtl = locale === "ar";
  const tLabel = typeLabel(item.type, locale);
  const href = ficheHref(item.slug) as Parameters<typeof Link>[0]["href"];

  return (
    <article className="group flex gap-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:shadow-xl sm:gap-6 sm:p-6">
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="block w-24 shrink-0 self-start sm:w-28"
      >
        <div className="relative aspect-[910/1287] overflow-hidden rounded-lg bg-cream shadow-md ring-1 ring-black/10 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
          {item.coverId ? (
            <Image
              src={coverUrl(item.coverId)}
              alt=""
              fill
              sizes="112px"
              className="object-cover"
            />
          ) : (
            <CoverFallback label={tLabel} />
          )}
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal">
          {themeLabel(item.theme, locale)}
        </p>
        <h2
          lang={item.titleLang}
          dir={item.titleLang === "ar" ? "rtl" : "ltr"}
          className={`mt-1.5 text-base font-bold leading-snug text-ink sm:text-[17px] ${
            pageRtl ? "text-right" : "text-left"
          }`}
        >
          <Link href={href} className="transition hover:text-red">
            {item.title}
          </Link>
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink/50">
          <span className="rounded-md bg-ink/[0.06] px-2 py-0.5 text-[11px] font-bold text-ink/70">
            {tLabel}
          </span>
          {item.dateLabel && <span>{item.dateLabel}</span>}
          {item.countries.length > 0 && (
            <span>
              · {item.countries.map((c) => countryLabel(c, locale)).join(", ")}
            </span>
          )}
        </div>
        {item.description && (
          <p
            lang={item.descriptionLang}
            dir={item.descriptionLang === "ar" ? "rtl" : "ltr"}
            className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink/60"
          >
            {item.description}
          </p>
        )}
        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          <DownloadButtons files={item.files} primaryId={item.primaryId} labels={labels} />
        </div>
      </div>
    </article>
  );
}

export function BibliothequeExplorer({
  items,
  locale,
  labels,
  initialFilters,
}: {
  items: ExplorerItem[];
  locale: BiblioLocale;
  labels: ExplorerLabels;
  initialFilters: ExplorerFilters;
}) {
  const [filters, setFilters] = useState<ExplorerFilters>(initialFilters);
  const [sort, setSort] = useState<Sort>("recent");
  const { q: query, theme, type, lang, country, year } = filters;

  // Les filtres sont reportés dans l'URL (partage d'une vue filtrée). La page
  // déclare toujours l'URL sans paramètres comme canonique.
  const update = (patch: Partial<ExplorerFilters>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(next)) if (v) params.set(k, v);
    const qs = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  };

  // Facettes : thématiques dans l'ordre du catalogue (plus petit ID de chaque
  // thème), types et pays par ordre alphabétique localisé.
  const facets = useMemo(() => {
    const themes = new Map<string, { label: string; n: number; first: string }>();
    const types = new Map<string, string>();
    const countries = new Set<string>();
    const langs = new Set<BiblioLocale>();
    const years = new Set<number>();
    for (const it of items) {
      const t = themes.get(it.themeSlug);
      themes.set(it.themeSlug, {
        label: it.theme,
        n: (t?.n ?? 0) + 1,
        first: t && t.first < it.key ? t.first : it.key,
      });
      if (it.type) types.set(typeKey(it.type), it.type);
      it.countries.forEach((c) => countries.add(c));
      it.files.forEach((f) => langs.add(f.lang));
      if (it.year) years.add(it.year);
    }
    const coll = new Intl.Collator(locale);
    return {
      themes: [...themes.entries()]
        .filter(([k]) => k)
        .sort((a, b) => a[1].first.localeCompare(b[1].first)),
      types: [...types.entries()].sort((a, b) =>
        coll.compare(typeLabel(a[1], locale), typeLabel(b[1], locale))
      ),
      countries: [...countries].sort((a, b) =>
        coll.compare(countryLabel(a, locale), countryLabel(b, locale))
      ),
      langs: (["fr", "en", "ar"] as BiblioLocale[]).filter((l) => langs.has(l)),
      years: [...years].sort((a, b) => b - a),
    };
  }, [items, locale]);

  const filtered = useMemo(() => {
    const q = fold(query.trim());
    const out = items.filter((it) => {
      if (theme && it.themeSlug !== theme) return false;
      if (type && typeKey(it.type) !== type) return false;
      if (lang && !it.files.some((f) => f.lang === lang)) return false;
      if (country && !it.countries.includes(country)) return false;
      if (year && String(it.year) !== year) return false;
      if (q && !q.split(/\s+/).every((w) => it.haystack.includes(w))) return false;
      return true;
    });
    const coll = new Intl.Collator(locale);
    out.sort((a, b) =>
      sort === "title"
        ? coll.compare(a.title, b.title)
        : sort === "recent"
          ? b.sortKey.localeCompare(a.sortKey)
          : a.sortKey.localeCompare(b.sortKey)
    );
    return out;
  }, [items, query, theme, type, lang, country, year, sort, locale]);

  const hasActiveFilter = Object.values(filters).some(Boolean);

  const chip = (active: boolean) =>
    `shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
      active
        ? "bg-ink text-white shadow-sm"
        : "bg-white text-ink/70 ring-1 ring-ink/10 hover:text-ink hover:ring-ink/30"
    }`;

  return (
    <div dir={locale === "ar" ? "rtl" : undefined}>
      {/* Thématiques. Mobile : rangée défilante ; à partir de sm : retour à la ligne. */}
      <div
        className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
        role="group"
        aria-label={labels.allThemes}
      >
        <button
          type="button"
          aria-pressed={!theme}
          onClick={() => update({ theme: "" })}
          className={chip(!theme)}
        >
          {labels.allThemes}
          <span className="ms-1.5 opacity-50">{items.length}</span>
        </button>
        {facets.themes.map(([slug, t]) => (
          <button
            key={slug}
            type="button"
            aria-pressed={theme === slug}
            onClick={() => update({ theme: theme === slug ? "" : slug })}
            className={chip(theme === slug)}
          >
            {themeLabel(t.label, locale)}
            <span className="ms-1.5 opacity-50">{t.n}</span>
          </button>
        ))}
      </div>

      {/* Recherche + filtres */}
      <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <input
          type="search"
          value={query}
          onChange={(e) => update({ q: e.target.value })}
          placeholder={labels.searchPlaceholder}
          className="w-full rounded-2xl border border-ink/15 bg-cream/60 px-4 py-3 text-base text-ink outline-none transition placeholder:text-ink/40 focus:border-teal focus:bg-white focus:ring-2 focus:ring-teal/20"
        />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-end">
          <Select label={labels.type} value={type} onChange={(v) => update({ type: v })}>
            <option value="">{labels.all}</option>
            {facets.types.map(([k, t]) => (
              <option key={k} value={k}>
                {typeLabel(t, locale)}
              </option>
            ))}
          </Select>
          <Select label={labels.lang} value={lang} onChange={(v) => update({ lang: v })}>
            <option value="">{labels.all}</option>
            {facets.langs.map((l) => (
              <option key={l} value={l}>
                {LANG_NAMES[l]}
              </option>
            ))}
          </Select>
          {facets.countries.length > 0 && (
            <Select
              label={labels.country}
              value={country}
              onChange={(v) => update({ country: v })}
            >
              <option value="">{labels.all}</option>
              {facets.countries.map((c) => (
                <option key={c} value={c}>
                  {countryLabel(c, locale)}
                </option>
              ))}
            </Select>
          )}
          {facets.years.length > 1 && (
            <Select label={labels.year} value={year} onChange={(v) => update({ year: v })}>
              <option value="">{labels.all}</option>
              {facets.years.map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </Select>
          )}
          <Select label={labels.sort} value={sort} onChange={(v) => setSort(v as Sort)}>
            <option value="recent">{labels.sortRecent}</option>
            <option value="old">{labels.sortOld}</option>
            <option value="title">{labels.sortTitle}</option>
          </Select>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={() => update(EMPTY_FILTERS)}
              className="col-span-2 rounded-xl px-3 py-2 text-start text-sm font-semibold text-ink/50 underline-offset-2 transition hover:text-red hover:underline sm:ms-auto"
            >
              {labels.reset}
            </button>
          )}
        </div>
      </div>

      <p className="mt-6 text-sm font-medium text-ink/50" aria-live="polite">
        {filtered.length}{" "}
        {filtered.length > 1 ? labels.countNoun.other : labels.countNoun.one}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-10 text-ink/50">{labels.empty}</p>
      ) : (
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          {filtered.map((it) => (
            <PublicationCard key={it.key} item={it} locale={locale} labels={labels} />
          ))}
        </div>
      )}
    </div>
  );
}
