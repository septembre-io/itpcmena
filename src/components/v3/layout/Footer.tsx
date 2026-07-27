import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { footerFallback, type MenuItem } from "@/lib/menu";

// Libellés traduits via next-intl (messages/{fr,en,ar}.json, namespace
// « footer ») ; la colonne « Navigation » vient du menu WP (prop `menu`).
// `href` interne (commence par « / ») → rendu via next-intl Link (localisé) ;
// sinon lien externe. « Partenaires » = page WP rendue dans Next (/partenaires).
const joinLinks = [
  { key: "joinPartners", href: "/partenaires" },
  { key: "joinInvolved", href: "https://itpcmena.org/" },
  { key: "joinCalls", href: "https://itpcmena.org/" },
] as const;

export async function FooterV3({
  menu = footerFallback,
  locale = "fr",
}: {
  menu?: MenuItem[];
  locale?: string;
}) {
  const t = await getTranslations({ locale, namespace: "footer" });
  return (
    <footer
      id="contact"
      dir={locale === "ar" ? "rtl" : undefined}
      className="bg-ink px-6 pb-10 pt-16 text-white"
    >
      <div className="mx-auto grid max-w-6xl gap-10 border-b border-white/10 pb-12 md:grid-cols-[2fr_1fr_1fr_1.5fr]">
        {/* Brand */}
        <div>
          <Image
            src="https://wphead.itpcmena.org/wp-content/uploads/2020/01/Logo_ITPC.png"
            alt="ITPC-MENA"
            width={140}
            height={40}
            className="h-10 w-auto brightness-0 invert"
          />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/45">
            {t("description")}
          </p>
          <div className="mt-5 flex gap-2.5">
            <a
              href="https://www.facebook.com/itpcmena"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ITPC-MENA sur Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-sm text-white/55 transition hover:bg-red hover:text-white"
            >
              f
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/35">
            {t("nav")}
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-white/55">
            {menu.map((l) => (
              <li key={l.label}>
                <a
                  href={l.url}
                  target={l.target}
                  rel={l.target === "_blank" ? "noopener noreferrer" : undefined}
                  className="transition hover:text-white"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Join */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/35">
            {t("join")}
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-white/55">
            {joinLinks.map((l) =>
              l.href.startsWith("/") ? (
                <li key={l.key}>
                  <Link
                    href={l.href as Parameters<typeof Link>[0]["href"]}
                    className="transition hover:text-white"
                  >
                    {t(l.key)}
                  </Link>
                </li>
              ) : (
                <li key={l.key}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-white"
                  >
                    {t(l.key)}
                  </a>
                </li>
              )
            )}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/35">
            {t("contact")}
          </h4>
          <p className="mt-4 text-sm leading-relaxed text-white/45">
            {t("contactPrompt")}
          </p>
          <p className="mt-2 text-sm">
            <a
              href="mailto:contact@itpcmena.org"
              className="font-semibold text-white transition hover:text-teal"
            >
              contact@itpcmena.org
            </a>
          </p>
        </div>
      </div>
      <div className="mx-auto mt-6 flex max-w-6xl flex-wrap items-center justify-between gap-2 text-xs text-white/30">
        <p>
          © {new Date().getFullYear()} ITPC-MENA. {t("rights")}
        </p>
        <p>{t("location")}</p>
      </div>
    </footer>
  );
}
