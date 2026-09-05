import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { NavbarV3 } from "@/components/v3/layout/Navbar";
import { FooterV3 } from "@/components/v3/layout/Footer";
import { getMenu, getHeaderMenu, getFooterFallback } from "@/lib/menu";
import { getPostLang, stripHtml, type WPPost } from "@/lib/wordpress";
import { fixUploadHosts } from "@/lib/content";

const HOME = { fr: "Accueil", en: "Home", ar: "الرئيسية" } as const;

/**
 * Rend une page WordPress (récupérée en REST) dans le gabarit V3 :
 * NavbarV3 + fil d'Ariane + titre + contenu (.article-body) + FooterV3.
 * Réutilisé par les routes institutionnelles (/la-region, /partenaires…).
 */
export async function WpPageView({
  page,
  locale,
}: {
  page: WPPost;
  locale: string;
}) {
  const lang = getPostLang(page);
  const isRtl = lang === "ar";
  const img = page.jetpack_featured_media_url;
  const home = HOME[(locale as keyof typeof HOME)] ?? HOME.fr;

  // Les images/pièces jointes pointant sur l'apex itpcmena.org renvoient un
  // 308 vers le front (Vercel) et se cassent : on les réécrit sur l'hôte WP.
  const html = fixUploadHosts(page.content.rendered);

  const navMenu = await getHeaderMenu(locale);
  const footMenu = await getMenu(
    "v3-footer",
    locale,
    getFooterFallback(locale)
  );

  return (
    <div className="bg-cream text-ink">
      <NavbarV3 menu={navMenu} />

      <main className="mx-auto max-w-3xl px-6 pb-8 pt-10">
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-ink/45">
          <Link href="/" className="transition hover:text-ink">
            {home}
          </Link>
          <span>›</span>
          <span className="text-ink/70">{stripHtml(page.title.rendered)}</span>
        </nav>

        {img && (
          <div className="relative mb-8 h-72 overflow-hidden rounded-4xl md:h-80">
            <Image
              src={img}
              alt={stripHtml(page.title.rendered)}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        <h1
          className="text-3xl font-extrabold leading-tight tracking-tight text-ink md:text-[2.5rem]"
          dir={isRtl ? "rtl" : undefined}
          dangerouslySetInnerHTML={{ __html: page.title.rendered }}
        />

        <article
          className="article-body mt-8"
          dir={isRtl ? "rtl" : undefined}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>

      <FooterV3 menu={footMenu} locale={locale} />
    </div>
  );
}
