import type { AppelAttachment } from "@/lib/appels";

type Loc = "fr" | "en" | "ar";

/**
 * Carte « Documents à télécharger » en pied d'article. Liste les fichiers joints
 * hébergés par ITPC (TDR, cahier des charges…), extraits du corps de l'appel.
 */
export function AppelDocuments({
  attachments,
  label,
  locale,
}: {
  attachments: AppelAttachment[];
  label: string;
  locale: Loc;
}) {
  if (attachments.length === 0) return null;

  return (
    <section
      dir={locale === "ar" ? "rtl" : undefined}
      className="mt-12 rounded-3xl border border-teal/20 bg-teal/5 p-6"
    >
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal">
        {label}
      </p>
      <ul className="mt-4 flex flex-col gap-2.5">
        {attachments.map((doc) => (
          <li key={doc.href}>
            <a
              href={doc.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3 transition hover:border-teal hover:shadow-sm"
            >
              <span className="shrink-0 rounded-lg bg-ink/5 px-2 py-1 text-[11px] font-bold uppercase text-ink/60 group-hover:bg-teal/10 group-hover:text-teal">
                {doc.ext}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
                {doc.name}
              </span>
              <span
                className="shrink-0 text-ink/40 transition group-hover:text-teal"
                aria-hidden
              >
                ↓
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
