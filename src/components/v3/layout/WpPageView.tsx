import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { NavbarV3 } from "@/components/v3/layout/Navbar";
import { FooterV3 } from "@/components/v3/layout/Footer";
import type { MenuItem } from "@/lib/menu";
import { getPostLang, stripHtml, type WPPost } from "@/lib/wordpress";

const HOME = { fr: "Accueil", en: "Home", ar: "الرئيسية" } as const;
const NEWS = { fr: "Actualités", en: "News", ar: "الأخبار" } as const;

/**
 * Rend une page WordPress (récupérée en REST) dans le gabarit V3 :
 * NavbarV3 + fil d'Ariane + titre + contenu (.article-body) + FooterV3.
 * Réutilisé par les routes institutionnelles (/la-region, /partenaires…).
 */
export function WpPageView({
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
  const news = NEWS[(locale as keyof typeof NEWS)] ?? NEWS.fr;

  const anchor = (h: string) => `/${locale}#${h}`;
  const navMenu: MenuItem[] = [
    { label: "À propos", url: anchor("apropos") },
    { label: "La région", url: `/${locale}/la-region` },
    { label: "Notre travail", url: anchor("travail") },
    { label: "Plateformes", url: anchor("plateformes") },
    { label: news, url: `/${locale}/actualites` },
    {
      label: "Nous contacter",
      url: "https://itpcmena.org/faire-un-don/",
      target: "_blank",
      cta: true,
    },
  ];
  const footMenu: MenuItem[] = [
    { label: "À propos", url: anchor("apropos") },
    { label: "La région", url: `/${locale}/la-region` },
    { label: "Notre travail", url: anchor("travail") },
    { label: "Plateformes", url: anchor("plateformes") },
  ];

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
          dangerouslySetInnerHTML={{ __html: page.content.rendered }}
        />
      </main>

      <FooterV3 menu={footMenu} />
    </div>
  );
}
