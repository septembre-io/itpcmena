import Image from "next/image";
import { Link } from "@/i18n/navigation";

const navLinks = [
  { label: "À propos", hash: "apropos" },
  { label: "Notre travail", hash: "programmes" },
  { label: "Ressources", hash: "ressources" },
  { label: "Actualités", hash: "actualites" },
  { label: "Contact", href: "mailto:admin@itpcglobal.com" },
];

const programmeLinks = [
  { label: "Plateforme MENA", href: "/v1/programmes/plateforme-mena" },
  { label: "Propriété Intellectuelle", href: "/v1/programmes/propriete-intellectuelle" },
  { label: "Éducation aux traitements", href: "/v1/programmes/education-traitements" },
];

const socials = [
  { label: "f", href: "https://www.facebook.com/itpcmena", title: "Facebook" },
  { label: "ig", href: "https://www.instagram.com/itpcmena", title: "Instagram" },
  { label: "𝕏", href: "https://twitter.com/itpcmena", title: "X / Twitter" },
];

export function FooterV1() {
  return (
    <footer className="bg-[#111] px-5 md:px-20 pb-8 pt-16 text-white">
      <div className="grid gap-12 border-b border-white/10 pb-12 md:grid-cols-[2fr_1fr_1fr_1.5fr]">
        {/* Brand */}
        <div>
          <Link href="/v1">
            <Image
              src="https://itpcmena.org/wp-content/uploads/2020/01/Logo_ITPC.png"
              alt="ITPC-MENA"
              width={120}
              height={40}
              className="h-10 w-auto brightness-0 invert"
            />
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-[1.7] text-white/50">
            International Treatment Preparedness Coalition — Région Moyen-Orient
            et Afrique du Nord. Pour un accès équitable aux soins et aux
            médicaments.
          </p>
          <div className="mt-5 flex gap-3">
            {socials.map(({ label, href, title }) => (
              <a
                key={title}
                href={href}
                title={title}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div>
          <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.08em] text-white/40">
            Navigation
          </p>
          <ul className="flex flex-col gap-[10px]">
            {navLinks.map(({ label, hash, href }) => (
              <li key={label}>
                {href ? (
                  <a
                    href={href}
                    className="text-sm text-white/60 transition hover:text-white"
                  >
                    {label}
                  </a>
                ) : (
                  <Link
                    href={`/v1#${hash}` as Parameters<typeof Link>[0]["href"]}
                    className="text-sm text-white/60 transition hover:text-white"
                  >
                    {label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Programmes */}
        <div>
          <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.08em] text-white/40">
            Programmes
          </p>
          <ul className="flex flex-col gap-[10px]">
            {programmeLinks.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href as Parameters<typeof Link>[0]["href"]}
                  className="text-sm text-white/60 transition hover:text-white"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.08em] text-white/40">
            Restez informé
          </p>
          <p className="mb-4 text-sm leading-[1.6] text-white/50">
            Recevez nos dernières publications et actualités directement dans
            votre boîte mail.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="votre@email.com"
              className="flex-1 rounded-lg border border-white/15 bg-white/8 px-[14px] py-[10px] text-[13.5px] text-white placeholder:text-white/35 outline-none transition focus:border-white/40"
            />
            <button className="whitespace-nowrap rounded-lg bg-[#1D9E75] px-[18px] py-[10px] text-[13.5px] font-semibold text-white transition hover:bg-[#168a64]">
              S&rsquo;inscrire
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-white/30">
          © 2025 ITPC-MENA. Tous droits réservés.
        </p>
        <p className="text-[13px] text-white/30">
          58 Bd Abdelkrim Al Khattabi, Marrakech · +212 5244-23355 ·{" "}
          <a
            href="mailto:admin@itpcglobal.com"
            className="transition hover:text-white/60"
          >
            admin@itpcglobal.com
          </a>
        </p>
      </div>
    </footer>
  );
}
