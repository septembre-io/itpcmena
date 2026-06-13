import Image from "next/image";
import { Link } from "@/i18n/navigation";

const navLinks = [
  { label: "À propos", hash: "apropos" },
  { label: "Programmes", hash: "programmes" },
  { label: "Actualités", hash: "actualites" },
  { label: "Ressources", hash: "ressources" },
];

const programmeLinks = [
  { label: "Plateforme MENA", href: "/programmes/plateforme-mena" },
  { label: "Propriété Intellectuelle", href: "/programmes/propriete-intellectuelle" },
  { label: "Éducation thérapeutique", href: "/programmes/education-traitements" },
];

const socials = [
  { label: "f", href: "https://www.facebook.com/itpcmena", title: "Facebook" },
  { label: "ig", href: "https://www.instagram.com/itpcmena", title: "Instagram" },
  { label: "𝕏", href: "https://twitter.com/itpcmena", title: "X / Twitter" },
];

export function Footer() {
  return (
    <footer className="bg-ink px-6 pb-10 pt-16 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 border-b border-white/10 pb-12 md:grid-cols-[2fr_1fr_1fr_1.5fr]">
        {/* Brand */}
        <div>
          <Link href="/">
            <Image
              src="https://itpcmena.org/wp-content/uploads/2020/01/Logo_ITPC.png"
              alt="ITPC-MENA"
              width={120}
              height={40}
              className="h-10 w-auto brightness-0 invert"
            />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/45">
            International Treatment Preparedness Coalition — Région Moyen-Orient
            et Afrique du Nord. Pour un accès équitable aux soins et aux
            médicaments.
          </p>
          <div className="mt-5 flex gap-2.5">
            {socials.map(({ label, href, title }) => (
              <a
                key={title}
                href={href}
                title={title}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-sm text-white/55 transition hover:bg-red hover:text-white"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/35">
            Navigation
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-white/55">
            {navLinks.map(({ label, hash }) => (
              <li key={label}>
                <Link
                  href={`/#${hash}` as Parameters<typeof Link>[0]["href"]}
                  className="transition hover:text-white"
                >
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/actualites" className="transition hover:text-white">
                Toutes les actualités
              </Link>
            </li>
          </ul>
        </div>

        {/* Programmes */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/35">
            Programmes
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-white/55">
            {programmeLinks.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href as Parameters<typeof Link>[0]["href"]}
                  className="transition hover:text-white"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/35">
            Contact
          </h4>
          <p className="mt-4 text-sm leading-relaxed text-white/45">
            58 Bd Abdelkrim Al Khattabi,
            <br />
            Marrakech, Maroc
          </p>
          <p className="mt-2 text-sm text-white/45">
            +212 5244-23355
            <br />
            <a
              href="mailto:admin@itpcglobal.com"
              className="transition hover:text-white"
            >
              admin@itpcglobal.com
            </a>
          </p>
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-6xl flex-wrap items-center justify-between gap-2 text-xs text-white/30">
        <p>© 2025 ITPC-MENA. Tous droits réservés.</p>
        <p>Marrakech · Région MENA</p>
      </div>
    </footer>
  );
}
