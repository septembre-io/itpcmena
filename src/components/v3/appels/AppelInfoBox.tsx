import {
  APPEL_TYPE_LABELS,
  toMailto,
  type AppelInfo,
} from "@/lib/appels";
import { formatDate } from "@/lib/wordpress";

type Loc = "fr" | "en" | "ar";

export interface AppelBoxLabels {
  heading: string;
  type: string;
  deadline: string;
  bailleur: string;
  statutOpen: string;
  statutClosed: string;
  apply: string;
  applyEmail: string;
}

/**
 * Encart récapitulatif d'un appel, affiché en tête de l'article de détail
 * (/actualites/[slug]) quand le post est un appel (catégorie 804). Reprend les
 * champs ACF : type, date limite (+ statut Ouvert/Clos), bailleur, lien.
 */
export function AppelInfoBox({
  appel,
  labels,
  locale,
}: {
  appel: AppelInfo;
  labels: AppelBoxLabels;
  locale: Loc;
}) {
  const isRtl = locale === "ar";
  return (
    <aside
      dir={isRtl ? "rtl" : undefined}
      className="mt-6 rounded-3xl border border-teal/20 bg-teal/5 p-6"
    >
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal">
        {labels.heading}
      </p>

      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-[11px] font-bold uppercase tracking-wider text-ink/45">
            {labels.type}
          </dt>
          <dd className="mt-1 flex items-center gap-2 text-sm font-semibold text-ink">
            {APPEL_TYPE_LABELS[appel.type][locale]}
            {appel.open !== null && (
              <span
                className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                  appel.open ? "bg-teal/15 text-teal" : "bg-ink/10 text-ink/45"
                }`}
              >
                {appel.open ? labels.statutOpen : labels.statutClosed}
              </span>
            )}
          </dd>
        </div>

        {appel.dateLimite && (
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wider text-ink/45">
              {labels.deadline}
            </dt>
            <dd className="mt-1 text-sm font-semibold text-ink">
              {formatDate(appel.dateLimite, locale)}
            </dd>
          </div>
        )}

        {appel.bailleur && (
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wider text-ink/45">
              {labels.bailleur}
            </dt>
            <dd className="mt-1 text-sm font-semibold text-ink">
              {appel.bailleur}
            </dd>
          </div>
        )}
      </dl>

      {(appel.url || appel.email) && (
        <div className="mt-5 flex flex-wrap gap-3">
          {appel.url && (
            <a
              href={appel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-xl bg-teal px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
            >
              {labels.apply} →
            </a>
          )}
          {appel.email && (
            <a
              href={toMailto(appel.email)}
              className="inline-flex rounded-xl border border-teal/40 px-5 py-2.5 text-sm font-bold text-teal transition hover:bg-teal hover:text-white"
            >
              {labels.applyEmail} →
            </a>
          )}
        </div>
      )}
    </aside>
  );
}
