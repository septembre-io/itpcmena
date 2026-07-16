"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/wordpress";
import {
  APPEL_TYPE_LABELS,
  appelApplyHref,
  type AppelOffre,
  type AppelType,
} from "@/lib/appels";

type Loc = "fr" | "en" | "ar";
type Sort = "recent" | "old" | "deadline";

interface Labels {
  searchPlaceholder: string;
  type: string;
  theme: string;
  geo: string;
  sort: string;
  sortRecent: string;
  sortOld: string;
  sortDeadline: string;
  all: string;
  reset: string;
  openOnly: string;
  statutOpen: string;
  statutClosed: string;
  deadline: string;
  apply: string;
  /** Nom « appel » au singulier / pluriel pour le compteur de résultats. */
  countNoun: { one: string; other: string };
  empty: string;
  read: string;
}

interface Facets {
  types: AppelType[];
  themes: string[];
  geo: string[];
}

/** Chip légère pour les tags d'une fiche. */
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-cream px-2.5 py-0.5 text-[11px] font-semibold text-ink/60">
      {children}
    </span>
  );
}

const TYPE_ACCENT: Record<AppelType, string> = {
  emploi: "bg-red/10 text-red",
  consultance: "bg-teal/10 text-teal",
  offre: "bg-ink/10 text-ink",
  candidature: "bg-amber-100 text-amber-800",
  manifestation: "bg-blue-50 text-blue-700",
  subvention: "bg-teal/10 text-teal",
  autre: "bg-ink/5 text-ink/60",
};

function AppelCard({
  appel,
  locale,
  typeLabel,
  labels,
}: {
  appel: AppelOffre;
  locale: Loc;
  typeLabel: string;
  labels: Labels;
}) {
  const applyHref = appelApplyHref(appel);
  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-xl">
      <Link
        href={`/actualites/${appel.slug}` as Parameters<typeof Link>[0]["href"]}
        className="flex flex-1 flex-col"
      >
        {appel.img ? (
          <div className="relative h-40 overflow-hidden">
            <Image
              src={appel.img}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="h-40 bg-gradient-to-br from-cream to-teal/10" />
        )}
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${TYPE_ACCENT[appel.type]}`}
            >
              {typeLabel}
            </span>
            {appel.open !== null && (
              <span
                className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                  appel.open
                    ? "bg-teal/15 text-teal"
                    : "bg-ink/10 text-ink/45"
                }`}
              >
                {appel.open ? labels.statutOpen : labels.statutClosed}
              </span>
            )}
            <span className="text-xs text-ink/45">
              {formatDate(appel.date, locale)}
            </span>
          </div>
          <h2
            className="text-base font-bold leading-snug text-ink transition group-hover:text-red"
            dangerouslySetInnerHTML={{ __html: appel.title }}
          />
          {appel.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm text-ink/55">
              {appel.excerpt}
            </p>
          )}
          {appel.dateLimite && (
            <p className="mt-3 text-xs font-semibold text-ink/60">
              {labels.deadline} : {formatDate(appel.dateLimite, locale)}
            </p>
          )}
          {(appel.geo.length > 0 ||
            appel.themes.length > 0 ||
            appel.bailleur) && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {appel.bailleur && <Chip>{appel.bailleur}</Chip>}
              {appel.geo.map((g) => (
                <Chip key={`g-${g}`}>{g}</Chip>
              ))}
              {appel.themes.slice(0, 2).map((t) => (
                <Chip key={`t-${t}`}>{t}</Chip>
              ))}
            </div>
          )}
          <span className="mt-4 text-sm font-semibold text-red">
            {labels.read} →
          </span>
        </div>
      </Link>
      {applyHref && (
        <a
          href={applyHref}
          target="_blank"
          rel="noopener noreferrer"
          className="border-t border-ink/10 px-5 py-3 text-center text-sm font-bold text-teal transition hover:bg-teal hover:text-white"
        >
          {labels.apply} →
        </a>
      )}
    </div>
  );
}

/** Select stylé partagé par les filtres + le tri. */
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
    <label className="flex flex-col gap-1">
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

export function AppelsExplorer({
  appels,
  facets,
  labels,
  locale,
}: {
  appels: AppelOffre[];
  facets: Facets;
  labels: Labels;
  locale: Loc;
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [theme, setTheme] = useState("");
  const [geo, setGeo] = useState("");
  const [openOnly, setOpenOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("recent");

  const hasDeadlines = useMemo(
    () => appels.some((a) => a.dateLimite),
    [appels]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = appels.filter((a) => {
      if (type && a.type !== type) return false;
      if (theme && !a.themes.includes(theme)) return false;
      if (geo && !a.geo.includes(geo)) return false;
      if (openOnly && a.open !== true) return false;
      if (q) {
        const hay =
          `${a.titlePlain} ${a.excerpt} ${a.bailleur ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    out.sort((a, b) => {
      if (sort === "deadline") {
        // Échéances à venir d'abord (plus proche en tête), sans date en dernier.
        const da = a.dateLimite ?? "";
        const db = b.dateLimite ?? "";
        if (da && db) return da.localeCompare(db);
        if (da) return -1;
        if (db) return 1;
        return b.date.localeCompare(a.date);
      }
      return sort === "recent"
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date);
    });
    return out;
  }, [appels, query, type, theme, geo, openOnly, sort]);

  const hasActiveFilter = query || type || theme || geo || openOnly;

  const reset = () => {
    setQuery("");
    setType("");
    setTheme("");
    setGeo("");
    setOpenOnly(false);
  };

  return (
    <div dir={locale === "ar" ? "rtl" : undefined}>
      {/* Barre de contrôle */}
      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.searchPlaceholder}
          className="w-full rounded-2xl border border-ink/15 bg-cream/60 px-4 py-3 text-base text-ink outline-none transition placeholder:text-ink/40 focus:border-teal focus:bg-white focus:ring-2 focus:ring-teal/20"
        />
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <Select label={labels.type} value={type} onChange={setType}>
            <option value="">{labels.all}</option>
            {facets.types.map((t) => (
              <option key={t} value={t}>
                {APPEL_TYPE_LABELS[t][locale]}
              </option>
            ))}
          </Select>
          {facets.themes.length > 0 && (
            <Select label={labels.theme} value={theme} onChange={setTheme}>
              <option value="">{labels.all}</option>
              {facets.themes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          )}
          {facets.geo.length > 0 && (
            <Select label={labels.geo} value={geo} onChange={setGeo}>
              <option value="">{labels.all}</option>
              {facets.geo.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
          )}
          <Select
            label={labels.sort}
            value={sort}
            onChange={(v) => setSort(v as Sort)}
          >
            <option value="recent">{labels.sortRecent}</option>
            <option value="old">{labels.sortOld}</option>
            {hasDeadlines && (
              <option value="deadline">{labels.sortDeadline}</option>
            )}
          </Select>
          <label className="flex cursor-pointer items-center gap-2 pb-2 text-sm font-medium text-ink/70">
            <input
              type="checkbox"
              checked={openOnly}
              onChange={(e) => setOpenOnly(e.target.checked)}
              className="h-4 w-4 rounded border-ink/30 text-teal accent-teal"
            />
            {labels.openOnly}
          </label>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={reset}
              className="ml-auto rounded-xl px-3 py-2 text-sm font-semibold text-ink/50 underline-offset-2 transition hover:text-red hover:underline"
            >
              {labels.reset}
            </button>
          )}
        </div>
      </div>

      {/* Compteur + résultats */}
      <p className="mt-6 text-sm font-medium text-ink/50">
        {filtered.length}{" "}
        {filtered.length > 1 ? labels.countNoun.other : labels.countNoun.one}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-10 text-ink/50">{labels.empty}</p>
      ) : (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <AppelCard
              key={a.id}
              appel={a}
              locale={locale}
              typeLabel={APPEL_TYPE_LABELS[a.type][locale]}
              labels={labels}
            />
          ))}
        </div>
      )}
    </div>
  );
}
